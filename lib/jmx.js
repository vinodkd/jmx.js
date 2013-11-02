//jmx.js

function loadTemplates () {
	loadTemplate("ThreadGroup","res/ThreadGroup.tmpl");
}

var TEMPLATES = {};

function loadTemplate (tid, tfn) {
	var asynchttp = loadFile(tfn);
	template = asynchttp.responseText;

	TEMPLATES[tid] = template;
}

function loadJMXFile(node, fileName){
	var xmlhttp = loadFile(fileName);
	var jmxDoc=xmlhttp.responseXML;
	var target = document.getElementById(node);
	displayNode(jmxDoc.documentElement, target);
	return jmxDoc;
}

// adapted from http://www.w3schools.com/xml/xml_dom.asp
function loadFile(fileName) {
	if (window.XMLHttpRequest)
	  {// code for IE7+, Firefox, Chrome, Opera, Safari
	  	xmlhttp=new XMLHttpRequest();
	  }
	else
	  {// code for IE6, IE5
	  	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	xmlhttp.open("GET",fileName,false);
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

var VID=0;

function displayNode(node, displayLoc){
	// TODO: Take out code to add id because i'm no longer using the id to get to the model from the event handlers. this was the reason for adding it in the first place
	displayLoc.id="jmx_" + (VID++);	
	displayLoc.model = node;

	var config = ELEMENTS[node.nodeName];
	if(config) {
		// create the view
		var viewData = getAttrValues(node, config.attrs);
		var template = TEMPLATES[node.nodeName];
		viewData["vid"] = displayLoc.id;
		// This creates a structure like <div id="jmx.."><div>contents of tmpl</div></div>. 
		// The two enclosed divs are Ok because we're attaching model to the div created here, while the template could create its own div structure

		displayLoc.innerHTML = tmpl(template, viewData);		

		// wire up the event handlers
		var inputElements = displayLoc.getElementsByTagName("input");
		for (var i = 0; i < inputElements.length; i++) {
			var inp = inputElements[i];
			var type = config.attrs[inp.getAttribute("name")].type || "string";
			setEditor(inp,type);
		};
		return;
	}
	// once migrated to ELEMENTS, these lines will be deleted
	config= OLDEDITORS[node.nodeName] || OLDEDITORS["DEFAULT"];	
	handler = config.handler;
	handler(node, displayLoc, config);
}

var ELEMENTS = {
	"ThreadGroup" : {
		childElements	: {},
		attrs 			: {
			'elementName'			: { 'path' : '@testname' },		// 'type' : 'string' is optional.
			'elementType' 			: { 'path' : 'name()' }, 	
			'comments'				: { 'path' : '@comments' },
			'onSampleError'			: { 'path' : 'stringProp[@name="ThreadGroup.on_sample_error"]'},
			'numThreads'			: { 'path' : 'stringProp[@name="ThreadGroup.num_threads"]', 					'type' : 'number'},
			'rampTime'				: { 'path' : 'stringProp[@name="ThreadGroup.ramp_time"]', 						'type' : 'time'},
			'contForever' 			: { 'path' : 'elementProp/boolProp[@name="LoopController.continue_forever"]', 	'type' : 'boolean'},
			'loops' 				: { 'path' : 'elementProp/stringProp[@name="LoopController.loops"]', 			'type' : 'number' },
			'delayThreadCreation'	: { 'path' : '',																'type' : 'boolean'},
			'scheduler'				: { 'path' : 'boolProp[@name="ThreadGroup.scheduler"]', 						'type' : 'boolean'}

		}, 
		// TODO: remove this attr, not required actually; can be inferred from the model's node name
		view 			: "ThreadGroup",
	}
};


function getAttrValues (node, attrs) {
	var ret={};
	for(var a in attrs){
		var attr = attrs[a];
		ret[a] = getAttrValue(node, attr);
	}
	return ret;
}

function getAttrValue (node, attr) {
	var xpathApi = getXPathApis(attr.type || "string");
	if(attr.path=="") { return ""; }
	else{
		return xpathApi.getValue(document.evaluate(attr.path, node, null, xpathApi.type, null));
	}
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
	var model = ctrl.form.parentElement.parentElement.model;
	// alert("control:" + ctrl.name +" old val:" + ctrl.defaultValue + " new value:" + ctrl.value);
	updateModel(model,ctrl.name,ctrl.value);
}

function booleanChanged (event) {
	var ctrl = event.srcElement;
	var model = ctrl.form.parentElement.parentElement.model;
	// alert("control:" + ctrl.name +" old val:" + ctrl.defaultValue + " new value:" + ctrl.value);
	updateModel(model,ctrl.name,ctrl.checked ? "true" : "false");
}

function updateModel (model,attrName, newValue) {
	var attr = ELEMENTS[model.nodeName].attrs[attrName];
	var results = document.evaluate(attr.path, model, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);
	var nodeToupdate = results.iterateNext();
	if(nodeToupdate) {
		nodeToupdate.childNodes[0].nodeValue = newValue;
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
	"time"		: { onchange: stringChanged }
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

var genericHandler = function (node, displayLoc, config) {
		var cfg = config || {
			showName 		: true,
			showAttrs		: true,
			showChildren 	: true
		};

		var dispNode = document.createElement("div");
		dispNode.setAttribute("class", "aggregate");
		displayLoc.appendChild(dispNode);

		if(cfg.showName) dispNode.appendChild(document.createTextNode(node.nodeName));
		if(cfg.showAttrs) {
			var dispAttrs = document.createElement("div");
			dispAttrs.setAttribute("class", "aggregate_attrs");
			dispNode.appendChild(dispAttrs);

			var attrs = node.attributes;

			for(var a = 0; a < attrs.length; a++){
				var attr = attrs[a];
				var dispANode = document.createElement("span");
				dispANode.innerHTML = "<span>"+attr.nodeName+":"+attr.nodeValue+"</span>";
				dispAttrs.appendChild(dispANode);
			}
		}
		
		if(cfg.showChildren){
			var dispChildren = document.createElement("div");
			dispChildren.setAttribute("class", "aggregate_children");
			dispNode.appendChild(dispChildren);

			var n = node.childNodes.length;
			for (var i =  0; i < n; i++) {
				var child = node.childNodes[i];
				var dispCNode = document.createElement("div");
				dispChildren.appendChild(dispCNode);
				displayNode(child,dispCNode);
			};
		}
};

var boolHandler = function  (node, displayLoc) {
		var nName = node.getAttribute("name");
		var nVal = node.childNodes[0].nodeValue;
		var checked = ( nVal == "true" )? "checked" : ""; 
		var view = tmpl('<div> <span class="label"><%=nName%></span><input type="checkbox" name="<%=nName%>" value="<%=nVal%>" <%=checked%> ></input> </div>', {"nName": nName, "nVal": nVal, "checked": checked});
		displayLoc.innerHTML = view;
}

function getNodeValue(node){
	return (node.childNodes && node.childNodes[0]) ? node.childNodes[0].nodeValue : "";
}

var stringHandler = function (node, displayLoc) {
		var nName = node.getAttribute("name");
		var nVal = getNodeValue(node);
		var view = tmpl('<div> <span class="label"> <%=nName%> </span><input type="textbox" name="<%=nName%>" value="<%=nVal%>"></input> </div>', {"nName": nName, "nVal": nVal});
		displayLoc.innerHTML = view;
}

var nullHandler = function (node, displayLoc) {
		// dont handle it
};

var errorHandler = function(node, displayLoc){
		displayLoc.innerHTML= "no handler for the node named \"" + node.nodeName + "\", type: " + node.nodeType;
};

var OLDEDITORS = {
	"jmeterTestPlan" 	: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"hashTree"			: { handler: genericHandler, showName: false, showAttrs: true, showChildren: true },
	"TestPlan"			: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"ConfigTestElement"	: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"GenericController"	: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"HTTPSampler"		: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"GenericController"	: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"ResultCollector"	: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },

	"elementProp"		: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"objectProp"		: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"collectionProp"	: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"boolProp"			: { handler: boolHandler },
	"stringProp"		: { handler: stringHandler },
	"longProp"			: { handler: stringHandler },		// long is a string for display purposes and to save to file. validation tbd

	"#text"				: { handler: nullHandler},
	"DEFAULT"			: { handler: errorHandler}
};

function changed (vid,ctrlName,value) {
	var view = document.getElementById(vid);
	var model = view.model;
	alert("control:" + ctrlName +" changed, new value:" + value);
	model.getElementsByTagName("elementProp")[0].getElementsByTagName("boolProp")[0].childNodes[0].nodeValue = value;
}
