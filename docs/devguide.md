Why this project
----------------

I have been a long-time user of JMeter and have always thought about a Web-based UI for JMeter. The original reason was the slowness of the Swing Client in the early days - which were fixed later on - but recently I started thinking in terms of the clustered preformance test scenario: where you might need to edit a JMX file before firing it off on a cluster of machines in JMeter Master-slave mode.

I've explicitly stopped short of making this a full-fledged client like the Swing one because that IMO is a larger enterprise. Instead, this project aims to build a JMX Editor that can be easily embeddded into another product - like a JMeter IDE. I do, however, think it might be useful to merge such an editor with visualizations of the test results using the current js visualization engines like d3.

Dev Setup
---------

Like most JS projects, jmx.js is pretty minimal in resource requirements: you need a browser with an attached debugger, an editor, git and a shell of some kind. My setup is a Windows laptop with Chrome and Firefox, Sublime Text and MsysGit. As far as I know a linux- or Mac-based bash environment should work just fine. 

Node is used for the development webserver, but that could be replaced with any standard web server.

### Getting the code

Just clone the repo.

### Building and running the code

As mentioned in the README, you should fire the browser and point to the html file housing `jmx.js` - which is index.html on the demo. If, however, you have changed `src/jsonelements.json`, you'll have to run `tools/stripcomments.sh` before the changes take effect. `tools/webserver.sh` typically handles this for you if you're using the demo.

Code Overview
-------------

The codebase is arranged thus:

* `docs/`: Contains all the documents, including this Developer's Guide.
* `lib/`: Contains the core js files
	* `lib/jmx.js` : **The** core code.
	* `lib/template.js`: Jon Resig's simple template engine. Included in source as template.js. This can be changed to any other templating engine, but templates will have to be modified accordingly.
		* `lib/template-debug.js` is a debug version with slight modifications that makes it easy to debug errant templates.
* `src`: Contains files that have to be transformed before being copied to `lib`. Currently the lone file there is `jmxelements.json`.
* `tmpl/`: Contains templates for the views.
* `res`: Contains resources/assets used in the display
	* `res/jmx.js.css`: css for the views
	* `res/*.png,*.gif`: images used as icons for the JMX elements.
* `sample/`: Contains sample jmx files
* `tools`: Contains simple bash tools used for ease of devlopment. All of these tools must be run from within `tools/`
	* `webserver.sh` + `webserver.js`: a simple nodejs based web server that can do basic get,put and post required to test jmx.js. Can be replaced with a standard web server; PUT and POST support is expected, however.
	* `stripcomments.sh`: strips comments from `lib/jmxelements.json` and copies it to `lib/`
	* `pushtoghpages.sh`: copies changes to the `gh-pages` branch.
* `index.html` : Demo app that embeds jmx.js.

### A note on the style of JS Code organization

The code in `lib/jms.js` is written using a lot of nested functions. I spent some time wavering between this style and the flatter "all functions at the top" style before settling on this because I felt this was much more readable. 

I tried writing it such that all top level functions come first, then their callees, followed by the 3rd level; but this seemed very navigation-heavy - displayNode()'s grandchildren, for example were a good 3 screenfuls away. Also: using nested functions meant that functions could be somewhat self-descriptive in that the steps in the function are functions themselves and since they're inner functions, they're nicely contained without "splitting their beans" so to speak. Most of the functions that are created to explain the steps, `createView()` and its siblings, for example, are not called anywhere else - so they need not be public. If you have a editor that supports folding, you could also get a nice overview of the code by folding away all inner functions, then progressively expand them out to understand more.

As I started writing this dev guide, however, I checked to see if there are any drawbacks to the nested function approach and [apparently](http://net.tutsplus.com/tutorials/javascript-ajax/stop-nesting-functions-but-not-all-of-them/) [there](http://programmers.stackexchange.com/questions/137495/should-i-nest-functions-in-languages-that-allow-me-to-do-that-or-should-i-rather) [are](http://arguments.callee.info/2011/05/05/javascript-optimization-eliminate-nested-functions/). So if the cost of creating inner functions every time they're invoked becomes prohibitive, I've added an issue to move it to the flat version. Since I'd moved to that style in between, most functions are stateless and should translate easily over. I'd still leave immediate child functions next their parents for readability, probably even leave them indented as they are (but outside the parent) so the connection is visible.

Design
------

`jmx.js`'s stated goal is to load, edit and save jmx files. The design, therefore follows the same flow. When it's done, `jmx.js` should expose an API like so:

* `jmx.init()`: one-time initialization
* `jmx.createOrEdit(fileURL, displayNode)` : The main api to create a jmx.js view.
* `jmx.save()`: save the file back to the url. This requires write permissions on the server.

...with a potential nice-to-have additional API to snyc views:

* `jmx.show(nodeId)` : this will be used to sync views assuming jmx.js can create two different views and the overall "environment" needs them to be in sync.

The currently supported API is:

* `jmx.init()`: this is done, but could add a config object for flexiblity.
* `jmx.loadAndEdit(fileURL, displayNode)` : create is not supported yet
* `jmx.save()`: this works.

With that overview, let's see how each step works.

### Initialization

`init()` loads up a global config file, the element config and the view templates; all of which are pretty straightforward XHR file loads. 

* `config.json` is the global config file and it currently holds just one setting: whether the installation is in demo mode or not. If so, save is not allowed. This is to enable running the demo on Github pages. 
* `loadTemplates()` has some defaulting logic which is explained below in the section that explains `jmxelements.json`.

### Loading a JMX File

This is the meat of the code starting at `loadAndEdit()`. To display an editable version of a JMX file, we need to:

- Get the file contents using XHR - `loadFile()`.
- Parse the xml to create an xml DOM aka **the Model** - `xmlhttp.responseXML`.
- Create the editable view of the file. This requires us to:
	- **Traverse the DOM and map it to an HTML DOM - the View**. `displayNode()` and `processChildren()` do this by recursively descending down the jmx file _in document order_. The `<hashTree>` jmx element throws a sufficiently large wrench in the works that it has to be handled specially. Details are below in a separate section.
	- **Map specific bits of data to the HTML dom**. This requires extracting out data from the xml dom and displaying it appropriately. `getAttrValues()` does the first step with help from a per-element configuration stored in `jmxelements.json`. The display is handled by templates stored in `/tmpl`. Both the json file and the templates have some rules which are expanded in their own section below.
	- **Map appropriate parts of the HTML dom as editable controls (pre-filled with values from the jmx file)**. `generateView()` calls the templating engine to achieve this and positions it within the larger view.
	- **Add event handlers to save modified controls' values**. `addInteractions()` does this work and depends on the editing code presented below to actually save values.
	- **Store a reference to the node on view tree so that edit controls can report back changes to the model**. the aptly-named `addRefToModel()` does this. Special handling is required because JMX files do not have unique ids for their element instances. The `testclass` attribute tells us the "class" of the element (in OO terms), but all elements of the same class (the "instances" in OO terms) can be differentiated from each other only by their contents. I therefore create an artificial "view id" that starts at 0 on the top and increments in document order. It is made available in the HTML DOM for use, but currently is not actively used after the render is done. It **is**, however, reset everytime `loadAndEdit()` is called to allow for multiple files to be loaded without the count of jmx elements overflowing the int limit. This does mean that you cannot have two jmx editors on the same page.

#### Configuring jmxelements

`jmxelements.json` contains all the configuration needed to view, edit and (in future) create jmx elements. Here's an overview to how the file is organized:

* The file is a map of jmx element names to their configurations. 
* The key is name of the element (= `testClass` attribute from the source jmx file).
* The value is an object that has the following children:
	* **edit**: which holds configurations to enable editing the element ie, to display from the source jmx file as well as to write to it.It has the following children:
		* **attrs**: A map of the element's "attributes". These attributes could be true xml attributes or even values from child nodes in the jmx source; the key point is that they are treated as attributes of the jmx element for editing purposes and therefore are view data. 3 pieces of information are required about them:
			* **path**: an xpath into the xml dom for where to get the value from and/or is written to.
				* by convention, `elementType` holds the name of the jmx element and `name` holds the xsl `name()` value. hashTree is the only element currently that doesnt supply name.
			* **type**: an optional datatype to map the value into. This is used to determine the editor to use for the display and the update handler to use for saving. "string" is the default.
			* **get**: an alternative to "path", this is used to provide a view function - a function that returns the value that a particular named attribute must be displayed as having. This is used currently to return parent-child pairs in the hashTree template. However, it can also be used with the path value. When both 'get' and 'path' are present - the former maps source-to-display, while the latter maps display-to-updated-source. An example is the GENERIC template.
	* **view**: Refers to the template used to display it a JMX Element. Allowed values are:
		* not present at all: The code will look for a template file with the same name as the node in the `tmpl` dir
		* "GENERIC" or "DEFAULT": The code will load template files that match those names.
		* string: The code will treat it as an inline template and apply the values got from attrs into the template
		* false: This denotes that a particular element does not have a display at all. We do this currently for JMeterTestPlan.
	* **processChildren**: This setting controls whether child elements should be used at all. if `true`, children are processed recursively. This value is overridden, however, if the template has a div for children - see `shouldProcessChildren()`. The two-stage process allows optimizing the recursive descent if required but overriding it declaratively from the template.
	* **create**: This setting holds configurations to enable creating a new element of this class. It is not currently used, but will be in future.

#### Template Design

##### Template naming and representation in config

As mentioned above, templates are named according to the `testClass` attribute of elements. However, there are 2 special cases:

* "Default" templates: To avoid specifying _every single element_ before an editor can be stood up, jmx.js supplies two default templates: one is used to display a JMX Element (called `GENERIC`) and the other is used to display child xml elements of such elements (called `DEFAULT`). "DEFAULT_ELEMENT" and "DEFAULT_NODE" might have been appropriate names, but it bled the implementation detail into the config; while it seemed better to keep the config file in the language of describing the jmx elements and their views. From that sense, `GENERIC` is a generic, catch-all template for all elements that the configurer doesnt care yet to prescribe a template, while default is the "system-default" template for any child node that the configurer doesnt care yet.
* "Inline" Templates: It seemed too much to have a separate file if the template fit into one line, so the config allows for inline templates. Note, however, that inline templates MUST have all embedded quotes be escaped double quotes.

##### How to write templates

`jmx.js` templates must be written along some guidlines for two reasons:

1. Consistent overall look of rendered UI with standard controls for expanding and collapsing elements; and editing and saving values.
2. The CSS and JS code makes some (not complete) assumptions about the DOM structure in the templates. Deviations may lead to messed up layouts and/or errors.

Point #2 is not as onerous as it sounds. I'll point out the few code dependencies as we go along.

* The code supplies one data value by default - `vid` - that gives the view a unique id.
* Each template must be contained in a div with a jmxelement class, like so:
		
		<div class="jmxElement <%=elementType%>" >
			...
		</div>

 Note that the elementType attr is used to plug in the testClass's value as a CSS class. This is not explicitly used in the CSS currently, but might have applications in changing the view later based on this value.
*  The next level must be a `<form>` with two children - divs with classes 'headline' and 'body' respectively. The form represents the ability to edit values and the headline and body represent the "summary" and "detailed" views of the element. Note that the body is NOT element's children, but the remainder of its "attributes".
* The headline usually represents one "line" of display and holds enough information to identify the element in a folded view; which typically are:
	* An icon for the element type (which has to be got from [the apache site](http://svn.apache.org/repos/asf/jmeter/trunk/src/core/org/apache/jmeter/images/)). This must be stored in `/res` and referenced relative to that directory.
	* The type of the element
	* An editor for its name
	* An Ellipses control to expand its body. The div holding the ellipses must have the `toggle toggleAttrs` set of classes.
* The body is where majority of the element's editable values should reside, and can be layout quite freely. Use general HTML layouting practices - divs for block elements, spans for flow ones and so forth. Caveats, however:
	* The body  should have the `body` class to identify it as such. It may have an additional `expanded` or `collapsed` class added, which sets its state of being expanded or collapsed _at load time_.
	* The existing templates use css classes like `strProp` and `label`. These are anticipatory and don't yet have a special visual treatment.
	* With the default templating engine, view data can be referenced using `<%=var%>` syntax and full javascript can be written using `<% ... js code here... %>` styles.
	* If the config has `processChildren = true`, the code will append a div to the body to hold the child elements. however, you can also control where the children should appear relative to the element's view by adding a `<div class="<%=elementType%>_children"></div>`.
	* Similarly, if a template adds a `<div class="nodecontents"></div>` before calling `displayNode()` on a child, the generated view will replace only that div, allowing finer control of positioning the child's view within the parent. This was built to support `hashTree`, but is available for use by other elements as well.
	* The body can also have a `<div class="toggle toggleChildren"> ^ </div>` which will be used to hide or show the body itself. This is also expected to be used only from `hashTree`, but there might be future use elsewhere - especially if you want another form for the children. The current style is to have this div be the first element so that it shows up leftmost.
	* Typically one form is sufficient per element, but when children are embedded within the element's view, any inner forms are removed by the browser. So it might be useful to place children outside the form. You can see this in the `GENERIC` template, which by definition cannot assume that its children will not have forms of their own.
* As mentioned above, inline templates must be written with all embedded quotes being escapted double quotes (no single quotes allowed).
* Note also that the distance from any control to thd div with jmxelement must be 3 levels, ie `div/form/div/input` is the hierarchy the code expects. If your template doesnt need this level, create a dummy div.
* The toggles are the single UI element that I'd like to refactor out of the templates so they're handled "in the framework".

##### Changing the templating engine

I used Jon Resig's simple templating engine for convenience - it was the smallest, no dependency engine I could find given my "no external deps" goal. The code is relatively insulated from the templating engine in that it calls a global `tmpl()` function. So in theory you could replace it with your templating engine of choice. All templates (including the inline ones in `jmxlement.json`) will have to be moved over to the new format, however. Also, you will have to keep the DOM and CSS norms detailed above for the code to work.

#### The trouble with hashTree and processing in document order

The JMeter website states that [there will not be an XSD for the forceeable future](http://wiki.apache.org/jmeter/JMeterFAQ#Is_there_a_JMX_Schema.2FDTD_available.3F) and I think `<hashTree>` is the reason. It seems that the JMX file format is a serialization of an object hierarchy where `hashTree` is a HashMap with the parents as keys and children as values. The serialization, however, dumps keys (ie, parents) and values (ie children) as siblings under a single parent instead of having proper `<key>` and `<value>` elements, for example. I had to enhance the logic and config (`viewfunctions.js:getPCPairs()`) to handle this special case of traversal NOT in document order. It turned out to be a good thing, however, because we now have the ability to do arbitrary view data functions.

### Editing a JMX File

The second half of the jmx.js is logic to handle editing of the loaded JMX file. Event handlers are added while the view dom is created; and this section of code handles those events. There are 3 pieces to this part of the solution:

* Type-specific event handlers - the `xxxChanged()` functions. These are pretty straightforward: they convert the control's value into something that can be used to update the model with.
* Generic Model update function: this is the `updateModel()` function.
* The editor framework: Represented by the `EDITORS` global array, this allows for a flexible addition of types. The currently supported types are "string", "boolean", "number", "time" and "xml"; and takes two event handlers for each type: `onfocus` and `onchange`. The former allows for a context-sensitive editor to be loaded when the user chooses a particular control, although no such handler is currently implemented. Date pickers and File Choosers are the typical use case for this capability. The latter is implemented and calls the generic updater.

### Saving a JMX File

Save is represented by a single `saveFile()` function and is a standard xhr put call. As mentioned in the readme, this could do with improvement in terms of an autosave capability. Wrapping this is the `save()` function that checks if we're in demo mode and allows saves only if we're not.
