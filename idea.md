jmx.js - the idea
=================

The idea of this project is a JMeter web UI. That is, a web-based editor for JMeter Test Plans. This essentially boils down to an editor for the JMX file format. This project aims to create such an editor that will work on any browser. It will allow creating, updating and saving JMX files.


Requirements/Goals
------------------

* Web based
* JS-mostly, so no server dependencies except for the source JMX files being stored on one.
* As little dependencies as possible
* Extensible
* Easily embedded into existing apps, especially JMeter runners such as CI tools.
* nice to have: allow two views: a tree view and an editor pane similar to the JMeter Swing UI, but couple them loosely so either one could be displayed or both.
* Future: Fire off execution from within JMOW. Not too keen to make this a full-fledged JMeter IDE, however. There are other tools that do this.

Design
------

* index.html : Test app that embeds jmx.js
* jmx.js : core code.
* TBD: API exposed by jmow.js:
** `jmx.create(fileURL, displayNode)` : The main api to create a jmx.js view.
** `jmx.show(nodeId)` : this will be used to sync views.
** `jmx.save()`: save the file back to the url. This requires write permissions on the server.

