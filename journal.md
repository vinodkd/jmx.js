journal.md
==========

** Oct-24-2013 08:23 : ** Would like to replace all the display logic in aggregateHandler with a template call something like:

	applyTemplate(displayLoc, "aggregate_template", values);

where the template would have the following code:

	text(node.nodeName);
	list(node.attrs, "template");
	list(node.childNodes, "template");

obviously, this would be a very simple stringtemplate-like templating engine so that it can be replaced by other more robust engines, but it would provide the necessary framework for replacement. This one would work on `eval()` and `replace()`

** Oct-24-2013 14:15 : ** replaced the whole thing above with jon resig's simple template. done.

** Oct-24-2013 14:16 : ** next thing: creating the editor view. things needed are:

* create the view
* add controls to add more controllers, elements etc
* make each step collapsible so the collapsed view IS the left nav of the jmeter swing ui

before that i have to short up aggregateHandler so that its a good standby for unrecognized elements - DONE

** Oct-25-2013 11:37 : **  issues with using resig's templating engine:

* wanted the templates to be in the source, but not in the html sources, so tried many ways to get it included post load. none worked. finally settled to loading it into a js array called `TEMPLATES` via xhr.
* cannot use reserved words as variables in the templates
* cannot use single quotes

now trying to see if all templates can be loaded from one file

** Oct-25-2013 16:06 : ** view has link to model, but children of view node need link to parent so they can then send updates to model.

** Oct-25-2013 17:34 : ** xml file -> parsed xml dom -> dom view -> dom view + evt handler -> updated xml dom -> output xml file
dom view had js refs to source xml element. when child view element changes, it notifies its parent with (ref to self, changed value)
now parent can map view child to model child and change the value.

** Oct-25-2013 18:05 : **  changes required to make edit work:

* make a clean id for the view and add it in displayNode, pass it down to the handler so that each onChange() can have a ref to it.
* use the ref to get to the model ref stored in the parent
* change the model itself.

** Oct-26-2013 07:41 : ** got the basic load-edit-save working for a single attribute: loop count forever. if this value is changed, and the save button on top clicked, the new file will be saved to the server to test.jmx. one issue still: the save always stores an undefined before the content which i think is a nodejs problem. once that's fixed, i need to:

* create a framework to attach the changed() event handler to all editable nodes
* do an autosave web worker
* move code from index.html to jmx.js
* make the connection between loaded file name and saved file name correct. right now it reads from a known name and writes to another known name that is not the same.


