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

### Why this project

I have been a long-time user of JMeter and have always thought about a Web-based UI for JMeter. The original reasons were the sluggishness of the Swing Client in the early days - which were fixed later on - but recently I started thinking in terms of a use case in the clustered preformance test scenario: where you might need to edit a JMX file before firing it off on a cluster of machines in JMeter Master-slave mode.

I've explicitly stopped short of making this a full-fledged client like the Swing one because that is a larger enterprise and might not make complete sense for a Web-based use. I do, however, think it might be useful to merge such an editor with visualizations of the test results using the current js visualization engines like d3.

### Dev Setup

Like most JS projects, jmx.js is pretty minimal in resource requirements: you need a browser with an attached debugger, an editor, git and a shell of some kind. My setup is a Windows laptop with Chrome and Firefox, Sublime Text and MsysGit. As far as I know a linux- or Mac-based bash environment should work just fine. 

Node is used for the development webserver, but that could be replaced with any standard web server.

#### Getting the code

Just clone the repo.

#### Building and running the code

As mentioned in the README, you should fire the browser and point to index.html. If, however, you have changed `src/jsonelements.json`, you'll have to run `tools/stipcomments.sh` before the changes take effect. `tools/webserver.sh` typically handles this for you if you're using the demo server.

### Code Overview

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

#### A note on the style of JS Code organization

The code in `lib/jms.js` is written using a lot of nested functions. I spent some time wavering between this style and the flatter "all functions at the top" style before settling on this because I felt this was much more readable. 

I tried writing it such that all top level functions come first, then their callees, followed by the 3rd level; but this seemed very navigation-heavy - displayNode()'s grandchildren, for example were a good 3 screenfuls away. Also: using nested functions meant that functions could be somewhat self-descriptive in that the steps in the function are functions themselves and since they're inner functions, they're nicely contained without "splitting their beans" so to speak. Most of the functions that are created to explain the steps, `createView()` and its siblings, for example, are not called anywhere else - so they need not be public. If you have a editor that supports folding, you could also get a nice overview of the code by folding away all inner functions, then progressively expand them out to understand more.

As I started writing this dev guide, however, I checked to see if there are any drawbacks to the nested function approach and [apparently](http://net.tutsplus.com/tutorials/javascript-ajax/stop-nesting-functions-but-not-all-of-them/) [there](http://programmers.stackexchange.com/questions/137495/should-i-nest-functions-in-languages-that-allow-me-to-do-that-or-should-i-rather) [are](http://arguments.callee.info/2011/05/05/javascript-optimization-eliminate-nested-functions/). So if the cost of creating inner functions every time they're invoked becomes prohibitive, I've added an issue to move it to the flat version. Since I'd moved to that style in between, most functions are stateless and should translate easily over.

* TBD: API exposed by jmx.js:
	* `jmx.createOrEdit(fileURL, displayNode)` : The main api to create a jmx.js view.
	* `jmx.show(nodeId)` : this will be used to sync views.
	* `jmx.save()`: save the file back to the url. This requires write permissions on the server.
