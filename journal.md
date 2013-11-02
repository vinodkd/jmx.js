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
* make a clear map from jmx field -> xml dom -> view control -> xml dom -> saved jmx file.
* put in an unobtrusive event handler framework and attach it to all controls in Threadgroup
	* implement xpath-ish.js for this.
* implement the views for all elements in jmx and add event handlers for them all
* make the editor for each type of value a plugin, ie, dates should have a date picker, longs should have validation, etc.
* put in controls for adding new child elements. thankfully this is only at the top level, so it should be easy enough.
* change the test app and jmx.js such that any file can be picked and displayed, ie remove hard-coded simpleplan.jmx.
* add ability to start a new jmx file.
* move all code into self executing anonymous function so it can be modularized and the api given in readme can be realized.
* Make `save` automatic with asnychrony - web worker maybe?

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
