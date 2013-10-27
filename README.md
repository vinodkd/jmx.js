jmx.js - a Web-based editor for JMeter JMX Files
================================================

This project aims to build a web-based UI for JMeter, or more specifically: a web-based editor for JMeter Test Plans. The idea is to enable editing of JMeter test plans without having a local JMeter install. This works out best in CI environments which are already setup for remote testing via JMeter's command line execution. It will also hopefully make JMeter more accessible to testers who might not want to have a local Java install and yet do performance testing.

Building a JMeter web UI essentially boils down to building an editor for the JMX file format. This project therefore aims to create such an editor that will work on any browser. It will allow creating, updating and saving JMX files.

Requirements/Goals
------------------

* Web based
* JS-only, so no server dependencies except for the source JMX files being stored on one.
* As little dependencies as possible
* Extensible so that:
** adding new views of jmx content is easy
** adding new jmx elements (as JMeter changes) is easy
* Easily embedded into existing apps, especially JMeter runners such as CI tools.
* Nice to have: allow two views: a tree view and an editor pane similar to the JMeter Swing UI, but couple them loosely so either one could be displayed or both.
* Future: Fire off execution from within jmx.js. Not too keen to make this a full-fledged JMeter IDE, however. There are other tools that do this.

Design/Curent Implementation
----------------------------

* index.html : Test app that embeds jmx.js
* jmx.js : core code.
* jmx.tmpl: templates for the views
* jmx.js.css: css for the views
* TBD: API exposed by jmx.js:
** `jmx.createOrEdit(fileURL, displayNode)` : The main api to create a jmx.js view.
** `jmx.show(nodeId)` : this will be used to sync views.
** `jmx.save()`: save the file back to the url. This requires write permissions on the server.
* dependencies
** Jon Resig's simple template engine. Included in source as template.js. This can be changed to any other templating engine quite easily.
*** template-debug.js is a debug version with slight modifications that makes it easy to debug errant templates
* Supporting component
** webserver.js: a simple nodejs based web server that can do basic get,put and post required to test jmx.js. Can be replaced with a standard web server; PUT and POST support is expected, however.

Status
------

** Oct-26-2013 14:53 : **  Basic load-edit-save cycle working for one sample jmx file.
