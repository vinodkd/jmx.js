Outline
-------

- Why this project
- Dev Setup
- How to read the code
	- Code organization
	- Nested function style
- How it works
	- parsing in the browser
	- the mapping
	- eventing
	- save
	- Rules for the templates
	- Generic & Default templates
	- hashTree craziness
- Extension points
	- Overall Look and Feel
	- View Data
	- View functions
	- View templates
	- Editors/Pickers
	- Templating Engine
- End Goal
	- API exposed
	- Feature set
- How to contribute

Why this project
----------------

I have been a long-time user of JMeter and have always thought about a Web-based UI for JMeter. The original reasons were the sluggishness of the Swing Client in the early days - which were fixed later on - but recently I started thinking in terms of a use case in the clustered preformance test scenario: where you might need to edit a JMX file before firing it off on a cluster of machines in JMeter Master-slave mode.

I've explicitly stopped short of making this a full-fledged client like the Swing one because that is a larger enterprise and might not make complete sense for a Web-based use. I do, however, think it might be useful to merge such an editor with visualizations of the test results using the current js visualization engines like d3.

Dev Setup
---------

Like most JS projects, jmx.js is pretty minimal in resource requirements: you need a browser with an attached debugger, an editor, git and a shell of some kind. My setup is a Windows laptop with Chrome and Firefox, Sublime Text and MsysGit. As far as I know a linux- or Mac-based bash environment should work just fine. 

Node is used for the development webserver, but that could be replaced with any standard web server.

### Getting the code

Just clone the repo.

### Building and running the code

As mentioned in the README, you should fire the browser and point to index.html. If, however, you have changed `src/jsonelements.json`, you'll have to run `tools/stipcomments.sh` before the changes take effect. `tools/webserver.sh` typically handles this for you if you're using the demo server.

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
	* `webserver.sh` / `webserver.js`: a simple nodejs based web server that can do basic get,put and post required to test jmx.js. Can be replaced with a standard web server; PUT and POST support is expected, however.
	* `stripcomments.sh`: strips comments from `lib/jmxelements.json` and copies it to `lib/`
	* `pushtoghpages.sh`: copies changes to the `gh-pages` branch.
`index.html` : Demo app that embeds jmx.js.

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

`init()` loads up the element config and the view templates. Pretty straightforward XHR file loads. `loadTemplates()` has some defaulting logic, however, which is explained below in the section that explains `jmxelements.json`.

### Loading a JMX File

This is the meat of the code starting at `loadAndEdit()`. To display an editable version of a JMX file, we need to:

- Get the file contents using XHR - `loadFile()`.
- Parse the xml to create an xml DOM - `xmlhttp.responseXML`.
- Traverse the DOM and create views. This requires us to:
	- **Map the JMX file to a memory object, ie an xml dom called the Model**. `displayNode()` and `processChildren()` do this by recursively descending down the jmx file _in document order_. The `<hashTree>` jmx element throws a sufficiently large wrench in the works that it has to be handled specially. Details are below in a separate section.
	- **Map an HTML dom that represents the view of the data in the xml dom - the View**. This requires extracting out data from the xml dom and then displaying it appropriately. `getAttrValues()` does the first step with help from a per-element configuration stored in `jmxelements.json`. The display is handled by templates stored in `tmpl`. Both the json file and the templates have some rules which are expanded in their own section below.
	- **Map appropriate parts of the HTML dom as editable controls (pre-filled with values from the jmx file)**. `generateView()` calls the templating engine to achieve this and positions it within the larger view.
	- **Add event handlers to save modified controls' values**. `addInteractions()` does this work and depends on the editing code presented below to actually save values.
	- **Store a reference to the node on view tree so that edit controls can report back changes to the model**. the aptly-named `addRefToModel()` does this. Special handling is required because JMX files do not have unique ids for their element instances. The `testclass` attribute tells us the "class" of the element (in OO terms), but all elements of the same class (the "instances" in OO terms) can be differentiated from each other only by their contents. I therefore create an artificial "view id" that starts at 0 on the top and increments in document order. It is made available in the HTML DOM for use, but currently is not actively used after the render is done.

#### Configuring jmxelements

`jmxelements.json` contains all the configuration needed to view, edit and (in future) create jmx elements. Here's an overview to how the file is organized:

* The file is a map of jmx element names as keys and configurations to extract view data, map view templates and (in future) child elements that can be created under this element. 
* The key is the value that of the `testClass` attribute in the source jmx file.
* The value is an object that has the following children:
	* edit: which holds configurations to enable editing the element
	* view: which refers to the template used to display it
	* create: which holds configurations to enable creating a new element of this class.

#### Template Design

##### Template naming and representation in config
##### Rules for templates
##### Changing the templating engine

#### The trouble with hashTree and processing in document order

The JMeter website states that [there will not be an XSD for the forceeable future](http://wiki.apache.org/jmeter/JMeterFAQ#Is_there_a_JMX_Schema.2FDTD_available.3F) and I think `<hashTree>` is the reason. It seems that the JMX file format is a serialization of an object hierarchy where `hashTree` is a HashMap. The serialization, however, dumps names and values as siblings under a single parent instead of having proper `<key>` and `<value>` elements, for example. I had to enhance the logic and config (`viewfunctions.js:getPCPairs()`) to handle this special case of traversal NOT in document order. It turned out to be a good thing, however, because we now have the ability to do arbitrary view data functions.

### Editing a JMX File

The second half of the jmx.js is logic to handle editing of the loaded JMX file. Event handlers are added while the view dom is created; and this section of code handles those events. There are 3 pieces to this part of the solution:

* Type-specific event handlers - the `xxxChanged()` functions. These are pretty straightforward: they convert the control's value into something that can be used to update the model with.
* Generic Model update function: this is the `updateModel()` function.
* The editor framework: Represented by the `EDITORS` global array, this allows for a flexible addition of types. The framework allows for a context-sensitive editor to be loaded when the user chooses a particular control, although no such handler is currently implemented. Date pickers and File Choosers are the typical use case for this capability.

### Saving a JMX File

Save is represented by a single `saveFile()` function and is a standard xhr put call. As mentioned in the readme, this could do with improvement in terms of an autosave capability.

