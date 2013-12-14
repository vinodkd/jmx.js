journal.md
==========

**Oct-24-2013 08:23 :** Would like to replace all the display logic in aggregateHandler with a template call something like:

	applyTemplate(displayLoc, "aggregate_template", values);

where the template would have the following code:

	text(node.nodeName);
	list(node.attrs, "template");
	list(node.childNodes, "template");

obviously, this would be a very simple stringtemplate-like templating engine so that it can be replaced by other more robust engines, but it would provide the necessary framework for replacement. This one would work on `eval()` and `replace()`

**Oct-24-2013 14:15 :** replaced the whole thing above with jon resig's simple template. done.

**Oct-24-2013 14:16 :** next thing: creating the editor view. things needed are:

* create the view
* add controls to add more controllers, elements etc
* make each step collapsible so the collapsed view IS the left nav of the jmeter swing ui

before that i have to short up aggregateHandler so that its a good standby for unrecognized elements - DONE

**Oct-25-2013 11:37 :**  issues with using resig's templating engine:

* wanted the templates to be in the source, but not in the html sources, so tried many ways to get it included post load. none worked. finally settled to loading it into a js array called `TEMPLATES` via xhr.
* cannot use reserved words as variables in the templates
* cannot use single quotes

now trying to see if all templates can be loaded from one file

**Oct-25-2013 16:06 :** view has link to model, but children of view node need link to parent so they can then send updates to model.

**Oct-25-2013 17:34 :** xml file -> parsed xml dom -> dom view -> dom view + evt handler -> updated xml dom -> output xml file
dom view had js refs to source xml element. when child view element changes, it notifies its parent with (ref to self, changed value)
now parent can map view child to model child and change the value.

**Oct-25-2013 18:05 :**  changes required to make edit work:

* make a clean id for the view and add it in displayNode, pass it down to the handler so that each onChange() can have a ref to it.
* use the ref to get to the model ref stored in the parent
* change the model itself.

**Oct-26-2013 07:41 :** got the basic load-edit-save working for a single attribute: loop count forever. if this value is changed, and the save button on top clicked, the new file will be saved to the server to test.jmx. one issue still: the save always stores an undefined before the content which i think is a nodejs problem. once that's fixed, i need to:

* create a framework to attach the changed() event handler to all editable nodes
* do an autosave web worker
* move code from index.html to jmx.js
* make the connection between loaded file name and saved file name correct. right now it reads from a known name and writes to another known name that is not the same.

**Oct-27-2013 08:03 :** reorged the codebase with dirs.

**Oct-28-2013 07:59 :** Now that the prototype is working, this is the worklist:

* DONE fix basic issues with working prototype, ie, fix the undefined problem
	* it was my mistake; i didnt initialize dataToSave, so when the actual data was appended an undefind was obviously at the front of the result string.
* DONE make a clear map from jmx field -> xml dom -> view control -> xml dom -> saved jmx file.
* DONE put in an unobtrusive event handler framework and attach it to all controls in Threadgroup
	* NOT REQUIRED implement xpath-ish.js for this.
* implement the views for all elements in jmx and add event handlers for them all
* make the editor for each type of value a plugin, ie, dates should have a date picker, longs should have validation, etc.
* put in controls for adding new child elements. thankfully this is only at the top level, so it should be easy enough.
* change the test app and jmx.js such that any file can be picked and displayed, ie remove hard-coded simpleplan.jmx.
* add ability to start a new jmx file.
* move all code into self executing anonymous function so it can be modularized and the api given in readme can be realized.
* Make `save` automatic with asnychrony - web worker maybe?
* Update readme with instructions on how to setup and embed into app
* Add design doc explaining the solution - use notes from journl for it.
* Setup a demo on gh-pages


**Oct-28-2013 17:26 :** mapping jmx field -> xml dom -> view control -> xml dom -> saved jmx file: There are a couple of design decisions:

1. How to identify jmx elements and not their attributes which also are xml nodes? Ans: jmx doesnt have unique ids for each node. there could be two threadgroups with the same name, so i have to store the ref to the dom node in the view and use that for update. DONE
2. How to reach individual attributes within the jmx elements? Ans: create an xpath syntax to locate the attributes and map them to unique names. This is the xpath-ish idea (see below). Once implemented, this can be used to get and set values. DONE
3. How to detect changes in the view? Ans: in the template, add unique ids to each control `= data field's unique name + seq number` - DONE FOR THREADGROUP. Also add a class denoting the type of attribute (`boolProp`, `stringProp` etc). After the view is built, collect all elements with each known data type and add an appropriate listener to it. In the listener, use data type to attach an appropriate editor if required and the xpath-ish to get/set the value of the data field.
4. How to map allowed children for the top level elements, specifically `TestPlan` and `ThreadGroup`? Ans: create a config for each element; use the config to created an "add child here..." control, which will upon being activated create a new child node and call displayNode on it. So we might need a blank xml template for each element.

All of the above can be consolidated into one structure per element that has:
	* `childElements`: a list of names of allowed child elements which will have their own configs.
	* `attributes`: a map with logical attribute names as keys and a tuple of their xpath-ish expressions and data type as values.
	* `view` : name of a view template that displays this element
	* `show`: name of the function that shows the view
	* `model`: xml that reprsents a new element of this type
All of this could be a json file that is loaded, or a separate js file that assigns to a global variable called `ELEMENTS`. 
Editors for each datatype could be put into the current `EDITORS` global variable.

xpath-ish idea
--------------
node
node.attrs() - proper array to index into if known
node.attrs("name").get/set - find and get/set
node.attr("name").get()
node.attr("name").set(value)

node.children() - proper array
node.children("name") - proper array
node.child("name").get()
node.child.("name").set(value)

partial list of child elements
------------------------------
logic controller
	for each
	if
	include
	interleave
	loop
	module
	only once
	random
	random order
	recording
	runtime
	simple
	skip errors
	switch
	throughput
	transaction
	while
config element
	counter
	csv data set config
	ftp request defaults
	http authorization manager
	http cache manager
	http cookie manager
	http header manager
	http request defaults
	java request defaults
	jdbc connection configurations
timer
pre processor
sampler
post processor
assertions
listeners

**Oct-28-2013 23:03 :** update: dont need to implement xpath-ish; `document.evaluate()` is the answer.

**Nov-01-2013 01:00 :** Learnt something about xpath today: you cannot convert a string like `false` into a boolean value easily. http://stackoverflow.com/questions/346226/how-to-create-a-boolean-value-in-xslt. So i took the shortcut of reading a string value and converting it to boolean in js.

OTHERWISE mapped the element `ThreadGroup` to its view and controls. Now need to set unique names for the controls and add listeners to them.

**Nov-01-2013 08:32 :**  Learnt some more about document.evaluate: by default the xxxValue properties are read-only. So this makes the xpaths useless for writing. The trick is to use `XPathResult..ORDERED_NODE_ITERATOR_TYPE` and `iterateNext()` to get the actual node, and then use `nodeValue` to set it. This is what I'll use to set the value when its changed. Some sample scripts from dev tools:

		var r= document.evaluate(attr.path, node, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE,null)
		var v = r.iterateNext()
		v.childNodes[0]="blah"	// doesnt work cos childnodes[0] is an object
		v.childNodes[0].nodeValue	// prints the value out.
		v.childNodes[0].nodeValue="blah" 	// finally sets it

**Nov-02-2013 06:14 :** Current state: jmx has been mapped to dom correctly. dom is mapped to a view correctly for threadgroups. each attribute under threadgroup is mapped via an xpath to its model value and displayed. each displayed value is editable in an appropriate html control (except date/time which is still editable as text). each editable STRING value can be saved back to the model. the model itself can be saved to a fixed file name on the server.
There are still a lot of todos but this commit represents a good chunk of progress on the worklist from Oct-28-2013 17:26

**Nov-02-2013 06:36 :** All types of Thread group attrs are now minimally editable. numbers dont yet have validations and time is not a custom editor, but each value is individually editable.

**Nov-03-2013 06:41 :** Done with the mapping work. Remaining work is:

* 5d - put in controls for adding new child elements. thankfully this is only at the top level, so it should be easy enough.
* 5d - implement the views for all elements in jmx and add event handlers for them all
* 1d - change the test app and jmx.js such that any file can be picked and displayed, ie remove hard-coded simpleplan.jmx.
* 3d - add ability to start a new jmx file.
* 2d - move all code into self executing anonymous function so it can be modularized and the api given in readme can be realized.
* 5d - update css and make it look pretty
* 1d - Update readme with instructions on how to setup and embed into app
* 2d - Add design doc explaining the solution - use notes from journl for it.
* 2d - Setup a demo on gh-pages

Total ask for v1.0 of jmx.js: 25d = 1+ months.

Next version:
* 5d - make the editor for each type of value a plugin, ie, dates should have a date picker, longs should have validation, etc.
* 5d - Make `save` automatic with asnychrony - web worker maybe?

**Nov-03-2013 07:08 :** Also need to do special handling for specific node types: Arguments (tables of NV pairs)

**Nov-04-2013 05:13 :** Added the ability to expand/collapse each element on a whim. Isnt that what personal projects are for :)? I did mean to do it anyway, except it wasnt on the list above.

**Nov-04-2013 10:03 :** i need to support 3 different ideas with the view attribute:

* refer to an inline template
* refer to an external template by name, where name = element name, in which case I dont want to give the name.
* refer to an external template by name, where name != element name, in which case I DO want to give the name.

currently `view` handles the inline template, presence of `attrs` plus lack of any `template` handles the second case and presence of `template` handles the third case.

But now i want to support elements that dont have attrs and still have a view template. This is the problem. fixed it using this logic:
there's only one attr: `view`. 
if its false, the element doesnt have a view
if its undefined, the element has a view that's external and named after the element
if its "GENERIC", the element has a generic external view named GENERIC.tmpl
if its some other string, the element has an inline view template.

**Nov-04-2013 16:48 :** New problem: Just realized that hashtree is actually a set of parent, children pairs. So, for example, in simpleplan.jmx:

	jmeterTestPlan: Hashtree of:
		parent: TestPlan
		child: Hashtree of:
			parent: ThreadGroup
			child: Hashtree of:
				ConfigTestElement
				Generic Controller ..Ant pages...
				Generic Controller .. log4j pages...
				ResultCollector

So handling hashtrees has to be a either a modification to processChildren() or writing an actual template for hashtree. However it looks pretty ok even now becuase the current logic adds a div for hashtree anyway and that indents its children. However the children do not fold away when the parent is collapsed.

After thinking about it a bit more, I think this is the best approach:

* make the `processChildren` attr calculated, ie, if there's an element called nodename_children in the view, children have to be processed.
* remove the attr therefore. this simplifies the config as well

**Nov-06-2013 08:36 :** Made changes to have templates for hashtree and jmtertestplan now there's a lot of noise. need to make a headless template for both those nodes.

**Nov-06-2013 18:35 :**  Fixed the noise but there's still an issue: Hashtrees are weird. Within a hashtree element, every set of two elements are parent+child. So the tree above really is:

	jmeterTestPlan: Hashtree of:
		parent: TestPlan
		child: Hashtree of:
			parent: ThreadGroup
			child: Hashtree of:
				ConfigTestElement
				hashtree/
				Generic Controller ..Ant pages...
				hashtree/
				Generic Controller .. log4j pages...
				hashtree/
				ResultCollector
				hashtree/

So it seems like the right way to process a hashtree's children is to deal with each of them in pairs. I'm planning to change the config to accept a function instead of a xpath so that getAttrValue() can run it to get the result.

**Nov-06-2013 18:48 :**  Trying the above idea now. Stuck on how to convert a function name into a function ref. Need internet access for this, so stopping now. TO BE PICKED UP NEXT TIME.

**Nov-07-2013 03:18 :** Got that working. Also changed a lot of code in createView() and processChildren() to accomodate hashTree. Better be worth it. The code now can handle templates that have placeholders for content instead of just replacing what was there before in the target dom node.

**Nov-07-2013 04:06 :** To handle hashtree here're the changes made:
* first thought to move away from processChildren: true, but now still retaining it.
* also added: the ability to decide whether to processchildren based on whether a elementtype_children node is present in view
* added vid back to be able to differentiate each of hashtrees children uniquely
* added the ability to replace not the whole displayloc node, but a part of its innerhtml, identified by the nodecontents class. this is used now in hashtree, but should be available to any template
* added ability to declare a function that returns the data values for the view instead of just an xpath and type. this is also used only for hashtree right now.
* added hashtree.tmpl that uses all these features

**Nov-07-2013 04:13 :**  Changing the expand/collapse logic to work with the tree view correctly. Might need to split up the expansion of the node's attrs from the expansion of its children. Tried an implementation with both conflated, didnt like it.

**Nov-09-2013 07:01 :**  Fixed issues with display of hashtree:

* corrected logic that set ids for chilcren to use 2n+1 numbering when looping through pairs
* changed the location of the expander toggle so that its next to the parent, but refers to the child
* added logic to not show the + when there is no content in the child, ie its a <hashTree/>
* changed the + to a ">" and "^" combo with the view changing depending on whether the node is expanded or collapsed

Because of all this, the rules for templates are becoming longer:

* They must have a div and a form.
* to have a parent element's template allocate a specific location for a child's contents, use a `<div class="nodecontents"></div>`
* If they're using expanders for children, the order must be `<div class="toggle"> <div class="nodecontents"></div><div> .. child .. </div>` where the nodecontents div stands for the parent element.

**Nov-11-2013 16:33 :**  Got things to work in ff with some minor fixes.

**Nov-11-2013 16:34 :**  IE is a whole nother ball game. xml.documentElement doesnt work unless the server returns the content type. I fixed this with help from https://groups.google.com/forum/#!topic/google-ajax-discuss/VzJPHnMfX3U, and changing webserver.js

getElementByClassName doesnt work now.

**Nov-12-2013 08:27 :** On a wild goose chase to reimplement everything without getlementbyclassname now. this is irritating. almost everything is ok except leaving a placeholder div in the parent elements view for the child to find and plop itself into. with classes, it was easy because the scope is the node itself and there's only one element with the class `nodecontents`. with ids, the scope is the document, so i have to create a unique id for the placeholder div and later find it from within createview. the unique id can be created as parent_child_index, but for createview to find it later is not possible. need to think of something else or stop pursuing this approach and go back to an ie shim.

**Nov-12-2013 17:02 :**  Tried a lot to get IE working; giving up. Last problem encountered: XPathResult is not supported, so I have to use selectSingleNode. But there seems to be no way to easily check if that exists either, so giving up.

**Nov-13-2013 08:08 :** Idea: change GENERIC.tmpl such that it allows the node to be edited raw as xml. This will allow release of the editor without support for all nodes.

**Nov-13-2013 19:13 :**  Added basic support for child elements , ie, added a config.create.children element that lists the children allowed and used that to put buttons on the element's view. Now need to figure out the right way to proceed. In general, an element's children might have different cardinality:

* 0 : which makes no sense
* 1 : only one of this is allowed, eg, jmetertestplan/TestPlan
* n : where only n are allowed
* * : where 0 or more are allowed
* + : where 1 or more are allowed

So i should have an attr for cardinality where either a number or '+' and '*' are allowed, and interpret need to add the control based on existing count.

**Nov-15-2013 08:20 :**  working out logic to support cardinality:

if the limit is 	x 	nodes, and there are 	y nodes already, i should check for less'n 	z
					0 							0 											1
					1 							0 											2
					1 							1 											2
					2 							0 											3
					2 							1 											3
					2 							2 											3
					+ 							0 						 allow it, but ensure that the parents model has this child built in to it??
					+ 							1 						 allow it
					* 							0 						 allow it
					* 							1+ 						 allow it.
so in general, if the limit is a number, i should check for less than the number+1.

**Nov-15-2013 17:37 :**  Also figured out that teh check for child should be via hashtree, not the node's child elements. hashTree sucks.

**Nov-18-2013 16:38 :** Change in plans: I'm thinking its better to bring v1.0 out with just the ability to read and edit existing jmx files and add on the ability to create new files from scratch later. This will allow the primary use case of this editor to be delivered faster. I considered moving the code related to the create functionality to another branch, but to date this has been two things:

* move all the configs into a `edit` subtree to make way for the `create` configs.
* write `addCreateAffordances()`  and its subsequent functions.

I want to keep the first change regardless of change in focus because the create code is coming later and it makes sense to add that structure now. So all I'm going to do now is to comment out calling `addCreateAffordances()`

**Nov-18-2013 16:45 :** New plan:
* DONE make a clear map from jmx field -> xml dom -> view control -> xml dom -> saved jmx file.
* DONE put in an unobtrusive event handler framework and attach it to all controls in Threadgroup
	* NOT REQUIRED implement xpath-ish.js for this.
* implement the "edit raw" view for all elements that use the GENERIC template
* change the test app and jmx.js such that any file can be picked and displayed, ie remove hard-coded simpleplan.jmx.
* move all code into self executing anonymous function so it can be modularized and the api given in readme can be realized.
* Update readme with instructions on how to setup and embed into app
* Add design doc explaining the solution - use notes from journl for it.
* Setup a demo on gh-pages

Removed:
* implement the views for all elements in jmx and add event handlers for them all
* make the editor for each type of value a plugin, ie, dates should have a date picker, longs should have validation, etc.
* put in controls for adding new child elements. thankfully this is only at the top level, so it should be easy enough.
* add ability to start a new jmx file.
* Make `save` automatic with asnychrony - web worker maybe?

**Nov-21-2013 08:23 :** Trying to implement the "edit raw" feature. This has led to some refactoring of the GENERIC template. The new meaning is:

	GENERIC = DEFAULT_ELEMENT
	DEFAULT = DEFAULT_NODE

I had the names in the right for a brief time, but felt it bled the implementation detail into the config. Since the plan is for the config to be its own file at some point in the future, it makes sense to keep it in the language of describing the jmx elements and their views. From that sense, `GENERIC` is a generic, catch-all template for all elements that the configurer doesnt care yet to prescribe a template, while default is the "system-default" template for any child node that the configurer doesnt care yet.

**Nov-21-2013 08:31 :**  implemented view for edit raw. need to add save capability next.

**Nov-25-2013 09:32 :**  Working on the save piece, implemented xmlChanged(), but updateModel thinks the template is GENERIC instead of DEFAULT. Need to figure that out.
Ans: the problem was me nesting a form element inside another form element. GENERIC already had an enclosing form on top of which DEFAULT was trying to create an inner form for objProp. This would result in the inner form getting eaten up. So now I've moved GENERIC's children div out of the form. This causes the problem of eventhandlers not working right.

**Nov-26-2013 08:20 :** Need to generalize the way the eventhandlers reach the view node to expand or collapse. Right now its all relative pathing, which will easily break if someone creates a template that doesnt obey the implicit rules in the code. new logic should be:

	- look in ancestor path for a div with jmxElement in its classes
	- from that node, look for a child that has body in its classes.

tbd after i figure out if the saving xml works.

**Nov-26-2013 08:29 :**  Also need to change toggleAttrs to toggleBody

**Nov-26-2013 18:24 :**  WAS WORKING ON TRYING TO DELETE XML FROM THE NODE AND ADDING NEW. NOT WORKING YET.

**Nov-27-2013 08:09 :**  Delete works now, but writing new value still needs work. use the xml parsing in the browser, luke.

**Dec-03-2013 08:16 :** Got xml update to work as well. I'd changed the node  used in expandorcollapse to get the editraw link to work and that had caused the ... link to break, but now it seems to magically work. this might come back to bite later.
The logic in comment from nov 26 above needs to be implemented, but will check-in edit raw code for now.

**Dec-03-2013 08:20 :** Some major changes were made with this feature:

* the model ref is now not directly tied to the path from the ctrl, but easily accessible from the form's parent
* a template's children can be outside the form. specifically, if you expect your children to have forms of their own, do not include them in your form.

**Dec-03-2013 08:22 :** Pending todos:
* DONE make a clear map from jmx field -> xml dom -> view control -> xml dom -> saved jmx file.
* DONE put in an unobtrusive event handler framework and attach it to all controls in Threadgroup
	* NOT REQUIRED implement xpath-ish.js for this.
* DONE implement the "edit raw" view for all elements that use the GENERIC template
* DONE change the test app and jmx.js such that any file can be picked and displayed, ie remove hard-coded simpleplan.jmx.
* move all code into self executing anonymous function so it can be modularized and the api given in readme can be realized.
* Update readme with instructions on how to setup and embed into app
* Add design doc explaining the solution - use notes from journal for it.
* Setup a demo on gh-pages

Removed:
* implement the views for all elements in jmx and add event handlers for them all
* make the editor for each type of value a plugin, ie, dates should have a date picker, longs should have validation, etc.
* put in controls for adding new child elements. thankfully this is only at the top level, so it should be easy enough.
* add ability to start a new jmx file.
* Make `save` automatic with asnychrony - web worker maybe?

**Dec-05-2013 08:31 :**  Almost got the abstraction of file names done. jmxwithargs is not working.

**Dec-05-2013 09:06 :**  Figure out that jmxwithargs was not working bcos of a syntax error.

**Dec-06-2013 08:06 :** Pending todos:
* DONE make a clear map from jmx field -> xml dom -> view control -> xml dom -> saved jmx file.
* DONE put in an unobtrusive event handler framework and attach it to all controls in Threadgroup
	* NOT REQUIRED implement xpath-ish.js for this.
* DONE implement the "edit raw" view for all elements that use the GENERIC template
* DONE change the test app and jmx.js such that any file can be picked and displayed, ie remove hard-coded simpleplan.jmx.
* WIP move all code into self executing anonymous function so it can be modularized and the api given in readme can be realized.
* Update readme with instructions on how to setup and embed into app
* Add design doc explaining the solution - use notes from journal for it.
* remove hardcoding of save to test.jmx and make it optional for demo purposes (maybe add a demo config)
* Setup a demo on gh-pages

**Dec-06-2013 17:02 :**  internal todos for moving code to SEAF:

* DONE move all code into SEAF
* DONE move the element config to its on json file that is loaded in run time. That way it can have its own life
* DONE move user defined functions to their own file - same reason as above.
* DONE refactor again to move sub functions into their parents' scope. this seems much more readable than the "all level1 first, followed by all level 2" strategy that's currently in place
* DONE prettify the SEAF code - make it readable.

**Dec-06-2013 17:43 :**  Started moving element config out. 404 now.

**Dec-09-2013 17:51 :**  WAS STILL JSON-IZING JMXELEMENTS.JSON.

**Dec-10-2013 16:58 :** Finished json-izing jmxelements.json. Needed to make more changes than expected:

* changed jmx.js to now use loadfile to read the config as a json file
* changed the whole file to use quoted keys instead of unquoted ones when it was inside jmx.js
* realized that json spec doesnt allow comments, so created a simple shell script to strip them off
* moved jmxelements.json to a newly created src dir and generate the version in lib using stripcomments.sh
* changed webserver.sh to run stripcomments.sh every time its started. this is my simple "build script"

**Dec-10-2013 17:11 :**  Next up: moving user functions into their own file. DONE: created viewfunctions.js and moved them there.
Had to change index.html to use include this new js file.

**Dec-11-2013 08:58 :** still in process of refactoring jmx.js to make it "flow" readability-wise.

**Dec-12-2013 08:31 :** Still refactoring. Moved upto setEditor(). Deciding whether toggleAttrs/children needs to be moved in or not.

**Dec-12-2013 17:24 :**  Refactoring to move sub fns to parents done. Need to check if jmx.js:313 needs to be fixed. seems to be working even with xml and other elements now, so not sure. Either way that's another task. Checking in SEAF code now as done, therefore.

**Dec-12-2013 17:26 :**  New task list:
* DONE make a clear map from jmx field -> xml dom -> view control -> xml dom -> saved jmx file.
* DONE put in an unobtrusive event handler framework and attach it to all controls in Threadgroup
	* NOT REQUIRED implement xpath-ish.js for this.
* DONE implement the "edit raw" view for all elements that use the GENERIC template
* DONE change the test app and jmx.js such that any file can be picked and displayed, ie remove hard-coded simpleplan.jmx.
* DONE move all code into self executing anonymous function so it can be modularized and the api given in readme can be realized.
* WONTFIX Check if jmx.js:313 needs to be fixed.
* DONE Update readme with instructions on how to setup and embed into app
* Add design doc explaining the solution - use notes from journal for it.
	* Add note that controls must be 3 levels down from jmxelement.
* remove hardcoding of save to test.jmx and make it optional for demo purposes (maybe add a demo config)
* WIP Setup a demo on gh-pages

**Dec-13-2013 17:19 :**  Decided that I wont fix the issue with relative pathing until after v1.0 so that I can actually release this thing. Will add verbiage in the documentation that the controls must be 3 levels down.

**Dec-13-2013 17:53 :**  Was filling out the User guide on coverage of JMX Elements.

**Dec-14-2013 06:20 :** Update of readme done. I also created devguide.md to hold design and dev-related topics, as well as an issues.md to track issues. There might be more tweaks required to the readme for gh markup as well as content, but this is in good shape to commit.

**Dec-14-2013 06:52 :** Just realized that unless people ran stripcomments.sh, the latest version of lib/jmxelements.json would not be picked up. I'd stopped committing jmxelements.json a few iterations ago because the source - src/jmxelements.json - was being checked in. Now I realize that for people who take a snapshot of the codebase, this might be an issue. Checking in the lib version, therefore.

**Dec-14-2013 07:07 :**  Started working on the gh-pages task - out of turn. Going to create the branch and push one version to it before I stop and go back to the dev guide. Had to add a shell script to automate it tho :)

**Dec-14-2013 07:25 :** For some wierd reason everything other than HttpSampler.tmpl made it over to gh-pages fine. Trying out a trivial change so it might get pushed.

