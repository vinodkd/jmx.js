jmx.js - a Web-based editor for JMeter JMX Files
================================================

**JMX.js** a web-based UI for JMeter, or more specifically, a web-based editor for JMeter Test Plan files. The idea is to enable editing of JMeter test plans without having a local JMeter install. 

Since building a JMeter web UI essentially boils down to building an editor for the JMX file format, the goal of this project is to create such an editor that will work on any browser. It will allow creating, updating and saving JMX files.

It started as a curiosity project from my interest in Structured Editors and long familiarity with JMeter. A Web-based UI for JMeter, however, has applications in CI environments which are already setup for remote testing via JMeter's command line execution. It will also hopefully make JMeter more accessible to testers who might not want to have a local Java install and yet do performance testing.

Requirements/Goals
------------------

* Web based
* JS-only, so no server dependencies except for the source JMX files being stored on one.
* As little dependencies as possible
* Extensible so that:
	* adding new views of jmx content is easy
	* adding new jmx elements (as JMeter changes) is easy
* Easily embedded into existing apps, especially JMeter runners such as CI tools.
* Nice to have: allow two views: a tree view and an editor pane similar to the JMeter Swing UI, but couple them loosely so either one could be displayed or both.
* Future: Fire off execution from within jmx.js. Not too keen to make this a full-fledged JMeter IDE, however. There are other tools that do this.

Status
------

See the [Development Journal](docs/journal.md) for the latest development status. Below is a list of high level milestones reached.

* **Dec-13-2013 : v1.0** "All basic features available" Release: Relatively stable editor for JMX files with ability to edit elements that are not yet mapped in their raw form.
* **Oct-26-2013 :** Basic load-edit-save cycle working for one sample jmx file.

Demo
----

A running demo of jmx.js is at [the project's Github website](http://vinodkd.github.io/jmx.js/).

How to Setup
------------

1. Clone this repo or download a snapshot of it.
2. Setup a web server or create a folder in an existing web server. Note that:
	a. The web server should handles `PUT`s if you'd like to save updated files.
	a. This repo contains `webserver.sh` - a simple web server using node that I created for ease of development. It is not required for jmx.js's execution and can be safely deleted (along with `webserver.js`). If you want to use it, however, install node and run

		./webserver.sh

	from the repo's directory. This will start a web server at `localhost:8888/` and serve up files from the current directory.
2. Use `index.html` as an example of how to integrate it into your environment. `jmx.js` needs the following code in an html file:
	
	a. The jmx.js library files:

		<script type="text/javascript" src="lib/template.js"></script>
		<script type="text/javascript" src="lib/viewfunctions.js"></script>
		<script type="text/javascript" src="lib/jmx.js"></script>

	b. The CSS file:

		<link rel="stylesheet" type="text/css" href="res/jmx.js.css"></link>

	c. A div to hold the editor. In the demo, this is the div with the id "editor".
	Now call `jmx.loadAndEdit()` and/or `jmx.save()` to load up a JMX file and save it respectively.
3. Change your web server's configuration to pass appropriate MIME types for `*.jmx` and `res/*.tmpl`. These should be xml and text respectively. For the demo code, I've changed the jmx files to end in .xml s Github's web server serves them up correctly. you could leave your extensions as they were if you can coax your webserver to recognize them as xml and send the appropriate MIME type in its response.
3. The jmx files can reside anywhere accessible via a URL. Saving updated files requires the web server to be able to handle `PUT`s, however.

Using jmx.js to edit and save JMX files
---------------------------------------

1. Setup jmx.js as above.
2. Point your browser to the url of the html page that has the code in step 2 above. Depending on how its setup, one or more JMX files should now be editable. If you're using the demo, for example, point it to `http://localhost:8888/index.html`. You should now be able to see a dropdown of jmx files, with simpleplan.jmx loaded.
3. With the JMX editor that is displayed you can:
	* Use the `>` and `^` controls to expand or collapse the content.
	* Use the `...` control to expand attributes of a node
	* Use the `Edit Raw...` control to edit the contents of a JMX Element in its raw xml form. This usually is the UI for JMX elements that have not yet been mapped to a UI view.
	* Use the regular HTML controls - texboxes, checkboxes etc to edit the values of JMX fields. Tab out to save your change.
4. Use the `save()` functionality to save your edits. On the demo, click the Save button. This most probably will not work on the Github-hosted demo for obvious reasons.

JMX Element Coverage
--------------------

`jmx.js` is still a work in progress when it comes to mapping JMX Elements to UI Views. Here's the status by JMX Element:

| Element | Status |
|---------|--------|
| TestPlan | Done |
| Hashtree | Done |
| Thread Group | Done |
| HTTPDefaultsGui | Most important fields Done | 
| HTTP Sampler | Most important fields Done |

Note: The simplest indicator that an element is not yet mapped is that its view has an Apache feather as its icon. However, this also means that a "Generic" view has been applied to that element, which allows basic editing of its attributes and children.

`jmx.js` is also still a work in progress in terms of the fields and attributes types that it supports. Here's the status by type of field/attribute:

| Type | Status |
|------|--------|
| String | Supported |
| True/False | Supported |
| xml | Supported for the "raw" mode |
| Number | Minimally supported; there is no validation that the input is a number |
| Time | Minimally supported; there is no validation that the input is a time value, nor is there an appropriate time picker |
| Lists/Tables | Not started |
| File URLs | Not started |
| Any other type | Minimally supported with the "raw" mode |

Contributing
------------

As might be obvious, jmx.js could do with some more work before it's truly finished. Detailed information on how the code is setup is available in the [Developer's Guide](docs/devguide.md), but to summarize: I've tried to seperate out the customization points such that:

* If you're a **Designer**, you could help make jmx.js look better by changing the CSS alone. I've created the basic CSS and div structure framework but have not yet got it to look as pretty as I want it to in my head. The current look is very similar to how it it is in the Swing client and I think we can do way better than that.
* If you're a **UI/UX Developer**, you could help change not just the CSS, but also some of the interaction controls and how they work. Most of this is isolated to a few functions (if not actually modular), so help tweaking that would be great. For example, Autosave (which the Swing UI has already) would be a nice feature to add; and should be easy considering save is already implemented.
* If you are a **user of JMeter and and UI/UX Developer**, you could contribute templates for JMX elements that are not yet mapped. This is very similar to writing a JSP, erb or similar template file. It uses a syntax that's similar to JSP, however, because I chose to use Jon Resig's simple templating library.
* If you are a **Developer**, the [Developer's Guide](docs/devguide.md) should help you change `jmx.js` however you want. I've tried to separate out the core logic from the obvious points of customization to some extent to enable easy embedding into your tool of choice. Specific issues that need addressing as well as a wish list of features are in my [primitive issue tracker](docs/issues.md).

