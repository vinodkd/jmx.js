//jmx.js

(function(){

var ELEMENTS;
function init () {
	loadConfigs();
	loadTemplates();
}

function loadConfigs () {
	var elementConfigText = loadFile("lib/jmxelements.json", true);
	try{
		ELEMENTS = JSON.parse(elementConfigText.responseText);	
	}catch(e){
		throw e;
	}
	

	// todo: add editors here if required
}

function loadTemplates () {
	for (var el in ELEMENTS) {
		var element = ELEMENTS[el];
		loadTemplate(el,element);
	}
}

var TEMPLATES = {};

function loadTemplate (tref, e) {
	var template, tname;

	if(e.edit.view != undefined){
		if(e.edit.view == false)
			return;
		if(e.edit.view != "GENERIC"){
			template = e.edit.view;
		}else{
			tname = e.edit.view;
		}
	}
	else{
		tname = tref;
	}

	if(!template){
		var asynchttp = loadFile("res/"+tname+".tmpl", true);
		template = asynchttp.responseText;
	}
	TEMPLATES[tref] = template;
}

function loadJMXFile(node, fileName){
	var xmlhttp = loadFile(fileName);
	var jmxDoc=xmlhttp.responseXML;
	var target = document.getElementById(node);
	var jmxRoot = setupJMXRoot(target);
	displayNode(jmxDoc.documentElement, jmxRoot, jmxDoc);
	return jmxDoc;
}

// adapted from http://www.w3schools.com/xml/xml_dom.asp
function loadFile(fileName,isText) {
	if (window.XMLHttpRequest)
	  {// code for IE7+, Firefox, Chrome, Opera, Safari
	  	xmlhttp=new XMLHttpRequest();
	  }
	else
	  {// code for IE6, IE5
	  	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	xmlhttp.open("GET",fileName,false);
	if(isText){
		xmlhttp.overrideMimeType("text/plain; charset=x-user-defined");
	}
	xmlhttp.send();
	return xmlhttp;
}

function saveFile (url,doc) {
	if (window.XMLHttpRequest)
	  {// code for IE7+, Firefox, Chrome, Opera, Safari
	  	xmlhttp=new XMLHttpRequest();
	  }
	else
	  {// code for IE6, IE5
	  	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	xmlhttp.open("PUT",url,false);
	xmlhttp.send(doc);
	return xmlhttp;
}

function setupJMXRoot (target) {
	// clear the display node of any children
	// this clears out any previous jmx documents' displays
	while(target.firstChild){
		target.removeChild(target.firstChild);
	}
	// then append a new jmx root
	var jmxRoot = document.createElement("div");
	target.appendChild(jmxRoot);
	return jmxRoot;
}

// Adding vid back cos its required to refer to unique hashTree children.
var VID=0;

function displayNode(node, displayLoc, doc){

	// Added back to support hashtree's children
	displayLoc.id="jmx_" + (VID++);
	// displayLoc.model = node;

	var elementKey = getElementKey(node);

	var config = ELEMENTS[elementKey];
	if(config) {
		createView();
		addInteractions();
		if(config.edit.processChildren || shouldProcessChildren()){
			processChildren();
		}
	}

	function createView () {
		var view = generateView();
		positionViewInDiv(view);
		addRefToModel();
		// addCreateAffordances();
	}

	function addInteractions () {
		addEditors();
		addFolding();
	}

	function shouldProcessChildren () {
		return displayLoc.getElementsByClassName(node.nodeName + "_children").length != 0;
	}

	function processChildren () {
		var dispChildren = setupDispNodeForChildren();
		displayChildren(dispChildren);
	}

	function generateView() {
		var viewData = getAttrValues(node, config.edit.attrs, doc);
		var template = TEMPLATES[elementKey];
		viewData["vid"] = displayLoc.id;
		// This creates a structure like <div id="jmx.."><div>contents of tmpl</div></div>. 
		// The two enclosed divs are Ok because we're attaching model to the div created here, while the template could create its own div structure

		var view = template ? tmpl(template, viewData) : "";
		return view;
	}

	function positionViewInDiv(view){
		if(displayLoc.innerHTML == ""){
			displayLoc.innerHTML = view;
		}
		else{
			// find where to put it by looking for a div with class nodecontents
			var placeHolderDivs = displayLoc.getElementsByClassName("nodecontents");

			if(placeHolderDivs && placeHolderDivs[0]){ // if such a node is found, replace only that node with the new contents
				var phDiv;
				phDiv = placeHolderDivs[0];

				// create a node with new contents
				var contentDiv = document.createElement("div");
				contentDiv.innerHTML = view;

				// replace that location alone with new contents
				displayLoc.replaceChild(contentDiv,phDiv);
			}
			else{	// if not found, still replace the whole displayLoc with the new contents
				displayLoc.innerHTML = view;
			}
		}		
	}

	function addRefToModel () {
		var ctrlParent = displayLoc.getElementsByTagName("form");
		if(ctrlParent && ctrlParent[0]){
			ctrlParent[0].model = node;
		}	
	}

	function addCreateAffordances(){
		if(config.create && config.create.children){
			if(config.create.length){
				for (var i = 0; i < config.create.children.length; i++) {
					addCtrlToAddChild(node, config.create.children[i]);
				};
			}
			else{
				addCtrlToAddChild(node, config.create.children);
			}
		}
	}

	function addEditors () {
		var inputElements = displayLoc.getElementsByTagName("input");
		for (var i = 0; i < inputElements.length; i++) {
			var inp = inputElements[i];
			var type = getType(inp);
			setEditor(inp,type);
		};

		var textareaElements = displayLoc.getElementsByTagName("textarea");
		for (var i = 0; i < textareaElements.length; i++) {
			var ta = textareaElements[i];
			var type = getType(ta);
			setEditor(ta,type);
		};

		function getType (inp) {
			// look in the element's name for type. This is useful for elements than manage their children's view
			var typeSrc, type;

			typeSrc = (config.edit && config.edit.attrs) ? config.edit.attrs[inp.name] : undefined;

			// if not found, look in the element's parent for type. 
			// This is useful for generic handlers where type info doesnt match the input element's name, but the containing element
			if(!typeSrc){ typeSrc = config.edit; }

			type = typeSrc.type;
			// if nothing found, default to string
			if(!type) type = "string";
			return type;
		}

	}

	function addFolding () {
		var toggles1 = displayLoc.getElementsByClassName("toggleAttrs");
		for (var i = 0; i < toggles1.length; i++) {
			var toggle = toggles1[i];
			toggle.onclick = toggleAttrs;
		};

		var toggles2 = displayLoc.getElementsByClassName("toggleChildren");
		for (var i = 0; i < toggles2.length; i++) {
			var toggle = toggles2[i];
			toggle.onclick = toggleChildren;
		};
	}

	function setupDispNodeForChildren(){
		var dispChildren;
		var childView = displayLoc.getElementsByClassName(node.nodeName + "_children");
		if(childView && childView[0]){
			dispChildren = childView[0];
		}
		else{
			dispChildren = document.createElement("div");
			dispChildren.id = node.nodeName + "_children";
			dispChildren.setAttribute("class", node.nodeName + "_children");
			displayLoc.appendChild(dispChildren);
		}
		return dispChildren;
	}

	function displayChildren(dispChildren){
		var n = node.children.length;
		for (var i =  0; i < n; i++) {
			var child = node.children[i];
			var dispCNode = document.getElementById(displayLoc.id + "_child_" + i);
			if(!dispCNode){
				dispCNode = document.createElement("div");	//NOTE: this creates an additional level of indent in the div structure
				dispChildren.appendChild(dispCNode);
			}
			displayNode(child,dispCNode,doc);
		};
	}

	// THIS MIGHT HAVE TO BE MOVED OUTSIDE DISPLAYNODE FOR USE IN LIVE EDITING
	// This logic is wierd because jmetertestPlan's TestPlan child is not its direct xml child, but the child of an embedded hashtree.
	// even worse, ThreadGroup's children are not in its xml node tree at all, but in its sibling node. hashtree sucks.
	// need to make the addCtrltoAddChild logic separate from the logic to determine based on jmx structure.

	function addCtrlToAddChild (node, childcfg) {
		// assume that all parent-child combos are siblings in a hashtree
		if(node.parentElement.nodeName == "hashTree"){
			// find out of required number of children are already in the document being edited
			var existingChildren = node.parentElement.getElementsByTagName(childcfg.name);
			var addAffordance = typeof(childcfg.allowed)=="string" 
								|| (    typeof(childcfg.allowed)=="number" 
									 && existingChildren.length > 0
									 && existingChildren.length <= childcfg.allowed
								   );
			if(addAffordance){
						var ctrl = document.createElement("input");
						ctrl.setAttribute("type","button");
						ctrl.setAttribute("value", childcfg.name);
						displayLoc.appendChild(ctrl);
			}
		}
	}
}


function getElementKey (node) {
	return (ELEMENTS[node.nodeName]) ? node.nodeName : (node.attributes.guiclass && ELEMENTS[node.attributes.guiclass.value] ? node.attributes.guiclass.value : "DEFAULT");
}

function getAttrValues (node, attrs, doc) {
	var ret={};
	for(var a in attrs){
		var attr = attrs[a];
		if(attr.get){
			if(isFunctionName(attr.get)){
				ret[a] = runFunction(attr.get, node);
			}
		}
		else if (attr.path){
			ret[a] = getAttrValue(node, attr,doc);
		}
	}
	return ret;
}

function getAttrValue (node, attr, doc) {
	var xpathApi = getXPathApis(attr.type || "string");
	if(attr.path=="") { return ""; }
	else{
		return xpathApi.getValue(doc.evaluate(attr.path, node, null, xpathApi.type, null));
	}
}

function isFunctionName (fnName) {
	return typeof(this[fnName]) == 'function';
}

function runFunction (fnName, node) {
	return this[fnName](node);
}

function getXPathApis (type) {
	switch(type){
		case "string" : return {"getValue" 	: function(xpr) {
												return xpr.stringValue;
											  } ,
								 "type" 	: XPathResult.STRING_TYPE
						}; break;
		case "boolean" : return {"getValue" 	: function(xpr) {
												return xpr.stringValue == "true" ? true : false;
											  } ,
								 "type" 	: XPathResult.STRING_TYPE
						}; break;
		case "number" :
		case "time"	  : 
						 return {"getValue" 	: function(xpr) {
												return xpr.numberValue;
											  } ,
								 "type" 	: XPathResult.NUMBER_TYPE
						}; break;
	}
}

function stringChanged (event) {
	var ctrl = event.srcElement;
	if(!ctrl) ctrl = event.target;

	// alert("control:" + ctrl.name +" old val:" + ctrl.defaultValue + " new value:" + ctrl.value);
	updateModel(ctrl,ctrl.value);
}

function booleanChanged (event) {
	var ctrl = event.srcElement;
	if(!ctrl) ctrl = event.target;

	// alert("control:" + ctrl.name +" old val:" + ctrl.defaultValue + " new value:" + ctrl.value);
	updateModel(ctrl,ctrl.checked ? "true" : "false");
}

function xmlChanged (event) {
	var ctrl = event.srcElement;
	if(!ctrl)	ctrl = event.target;

	updateModel(ctrl,ctrl);	//passing the ctrl itself so updateModel will treat it as an obj. kludge.
}

function updateModel (ctrl,newValue) {
	var model = ctrl.form.model;

	var elementKey = getElementKey(model);
	var element = ELEMENTS[elementKey];
	var attrKey = element.edit.attrs[ctrl.name] ? ctrl.name : "value";
	var attr = element.edit.attrs[attrKey];
	var results = document.evaluate(attr.path, model, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);
	var nodeToupdate = results.iterateNext();
	if(nodeToupdate) {
		if(typeof(newValue)=='object'){	// replace the contents of the node if so.
			replaceContents(nodeToupdate, newValue);
			return;
		}
		// if a value exists, update it
		if(nodeToupdate.childNodes.length > 0){
			nodeToupdate.childNodes[0].nodeValue = newValue;
		}
		// else create a new text node and add it.
		else{
			// dont know why innerHTML doesnt work here. createNode and appending it only seems to work.
			nodeToupdate.appendChild(document.createTextNode(newValue));
		}
	}

	function replaceContents(node, ctrl){
		var doc = parseFromString("<root>"+ctrl.value + "</root>"); 	// expected to error out if not valid xml. 
																		// chrome returns no error, but returns an error msg as valid xml
		// am doing the remove+add new instead of replace because I dont want to do node.parent.replacechild.
		// that might erase references to node held in the view.
		removeContents(node);
		addNewContents(node,doc);

		function parseFromString (str) {
			var parser, doc;
			if(window.DOMParser){
				parser = new DOMParser();
				doc = parser.parseFromString(str,"text/xml");
			}
			else{
				doc = new ActiveXObject("Microsoft.XMLDOM");
				doc.async = false;
				doc.loadXML(str);
			}
			return doc;
		}
	
		function removeContents(node) {
			while(node.firstChild){
				node.removeChild(node.firstChild);
			}
		}

		function addNewContents (node, doc) {
			var root = doc.firstChild;
			while(root.firstChild){
				node.appendChild(root.firstChild);
			}
		}
	}
}

/*
The EDITORS global var holds all the editors by type of element to be edited. Supported types are string, boolean and number; although more can be added.
There are two attributes in each entry:
  onfocus (OPTIONAL): this is intended to be used when you want to present a custom editor for the element, eg, a date/time picker
  onchange (REQUIRED): this is intended to be used to notify the framework of the new value. It is based on type to trigger the correct DOM event handler 
  and to get at the value correctly. Then handler function set here is expected to call updateModel() at some point.
*/
var EDITORS = {
	"string"	: { onchange: stringChanged },
	"boolean"	: { onchange: booleanChanged },
	"number"	: { onchange: stringChanged },
	"time"		: { onchange: stringChanged },
	"xml"		: { onchange: xmlChanged }
};

function setEditor (inp,type) {
	// find an editor (action handler + editor view) by type
	// set it up for the inp node.
	var editor = EDITORS[type];
	if(editor){
		inp.onfocus = editor.onfocus;
		inp.onchange = editor.onchange;
	}
	// TODO: decide if exception should be thrown if no type is found. Defaulting to any particular type's editor doesnt seem to make sense.
	
}

function toggleAttrs (e) {
	var ctrl = e.srcElement;
	if(!ctrl) ctrl = e.target;

	// changed this only to test save of xml. needs to be reverted/changed to logic mentioned in journal.
	expandOrCollapse(ctrl.parentElement.parentElement.parentElement.getElementsByClassName("body")[0]);
}

function toggleChildren (e) {
	var ctrl = e.srcElement;
	if(!ctrl) ctrl = e.target;

	expandOrCollapse(ctrl.nextElementSibling.nextElementSibling);
	ctrl.innerHTML = (ctrl.innerHTML.trim() == "^" ? " > " : " ^ ");
}

// from http://stackoverflow.com/questions/4261363/javascript-html-toggle-visibility-automatically-causing-one-div-element-to-h
// modified with answer from http://stackoverflow.com/questions/195951/change-an-elements-css-class-with-javascript
function expandOrCollapse (e) {
	if(e.classList.contains('expanded')){
	      e.classList.remove('expanded');
	      e.classList.add('collapsed');
	}else{
	      e.classList.remove('collapsed');
	      e.classList.add('expanded');
	}
}

this.JMX = {
	"init"			: init,
	"loadJMXFile"	: loadJMXFile,
	"saveFile"		: saveFile
};

})();