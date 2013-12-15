Outline
-------

- Why this project
- How it works
	- parsing in the browser
	- the mapping
	- eventing
	- save
	- Rules for the templates
	- Generic & Default templates
	- hashTree craziness
- Dev Setup
- Extension points
	- Overall Look and Feel
	- View Data
	- View functions
	- View templates
	- Editors/Pickers
	- Templating Engine
- How to read the code
	- Code organization
	- Nested function style
- End Goal
	- API exposed
	- Feature set
- How to contribute

Design/Curent Implementation
----------------------------

* `index.html` : Test app that embeds jmx.js
* `test/*.jmx`: sample jmx files
* `lib/jmx.js` : core code.
* `res/jmx.tmpl`: templates for the views
* `res/jmx.js.css`: css for the views
* TBD: API exposed by jmx.js:
	* `jmx.createOrEdit(fileURL, displayNode)` : The main api to create a jmx.js view.
	* `jmx.show(nodeId)` : this will be used to sync views.
	* `jmx.save()`: save the file back to the url. This requires write permissions on the server.
* dependencies
	* `lib/template.js`: Jon Resig's simple template engine. Included in source as template.js. This can be changed to any other templating engine quite easily.
		* `lib/template-debug.js` is a debug version with slight modifications that makes it easy to debug errant templates
* Supporting component
	* `webserver.sh` / `webserver.js`: a simple nodejs based web server that can do basic get,put and post required to test jmx.js. Can be replaced with a standard web server; PUT and POST support is expected, however.
