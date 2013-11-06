//jmx.js

var ELEMENTS = {
	"jmeterTestPlan" 	: { view: false, processChildren: true },

	"hashTree"			: { view: false, processChildren: true },
	"TestPlan"			: {
							attrs: {
								'name' 					: { 'path' : '@testname'},
								'elementType' 			: { 'path' : 'name()' },
								'functionalMode'		: { 'path' : 'boolProp[@name="TestPlan.functional_mode"]',			'type' : 'boolean'},
								// TODO: FILL IN THESE VALUES WHEN THE HANDLERS FOR THEM ARE WRITTEN
								// IDEA: use procesChildren attr as an array of child names to be processed in this case instead of a bool to process all children.
								// 'threadGroups'		: {},
								// 'userDefinedVars'	: {},
								'serializeThreadGroups'	: { 'path' : 'boolProp[@name="TestPlan.serialize_threadgroups"]',	'type' : 'boolean'},
								'comments'				: { 'path' : 'stringProp[@name="TestPlan.comments"]'},
								'userDefinedClassPath'	: { 'path' : 'stringProp[@name="TestPlan.user_define_classpath"]'}
							}
	 },
	"ThreadGroup" : {
		childElements	: {},
		attrs 			: {
			'elementName'			: { 'path' : '@testname' },		// 'type' : 'string' is optional.
			'elementType' 			: { 'path' : 'name()' },
			'onSampleError'			: { 'path' : 'stringProp[@name="ThreadGroup.on_sample_error"]'},
			'numThreads'			: { 'path' : 'stringProp[@name="ThreadGroup.num_threads"]', 					'type' : 'number'},
			'rampTime'				: { 'path' : 'stringProp[@name="ThreadGroup.ramp_time"]', 						'type' : 'time'},
			'contForever' 			: { 'path' : 'elementProp/boolProp[@name="LoopController.continue_forever"]', 	'type' : 'boolean'},
			'loops' 				: { 'path' : 'elementProp/stringProp[@name="LoopController.loops"]', 			'type' : 'number' },
			'delayThreadCreation'	: { 'path' : '',																'type' : 'boolean'},
			'scheduler'				: { 'path' : 'boolProp[@name="ThreadGroup.scheduler"]', 						'type' : 'boolean'}

		}
	},
	"HttpDefaultsGui"	: {
							attrs : {
								'name' 					: { 'path' : '@testname'},
								'elementType' 			: { 'path' : '@testclass' },
								'domain'				: { 'path' : 'stringProp[@name="HTTPSampler.domain"]'},
								'port'					: { 'path' : 'stringProp[@name="HTTPSampler.port"]'},
								'protocol'				: { 'path' : 'stringProp[@name="HTTPSampler.protocol"]'},
								'contentEncoding'		: { 'path' : 'stringProp[@name="HTTPSampler.contentEncoding"]'},
								'path'					: { 'path' : 'stringProp[@name="HTTPSampler.path"]'}
							}
	},
	"GenericController"	: {
							attrs: {
								'name' 					: { 'path' : '@testname'},
								'elementType' 			: { 'path' : 'name()' },
							},
							view: "GENERIC" 
						},
	"HTTPSampler"		: {
							attrs : {
								'name' 					: { 'path' : '@testname'},
								'elementType' 			: { 'path' : 'name()' },
								'domain'				: { 'path' : 'stringProp[@name="HTTPSampler.domain"]'},
								'port'					: { 'path' : 'stringProp[@name="HTTPSampler.port"]'},
								'protocol'				: { 'path' : 'stringProp[@name="HTTPSampler.protocol"]'},
								'contentEncoding'		: { 'path' : 'stringProp[@name="HTTPSampler.contentEncoding"]'},
								'path'					: { 'path' : 'stringProp[@name="HTTPSampler.path"]'},

								'followRedirects'		: { 'path' : 'boolProp[@name="HTTPSampler.follow_redirects"]', 	'type' : 'boolean'},
								'autoRedirects'			: { 'path' : 'boolProp[@name="HTTPSampler.auto_redirects"]', 	'type' : 'boolean'},
								'useKeepalive'			: { 'path' : 'boolProp[@name="HTTPSampler.use_keepalive"]', 	'type' : 'boolean'},
								'doMultipartPost'		: { 'path' : 'boolProp[@name="HTTPSampler.DO_MULTIPART_POST"]',	'type' : 'boolean'},

								'fileName'				: { 'path' : 'stringProp[@name="HTTPSampler.FILE_NAME"]'},
								'fileField'				: { 'path' : 'stringProp[@name="HTTPSampler.FILE_FIELD"]'},
								'mimetype'				: { 'path' : 'stringProp[@name="HTTPSampler.mimetype"]'},

								'monitor'				: { 'path' : 'stringProp[@name="HTTPSampler.monitor"]',			'type' : 'boolean'},

								'embedded_url_re'		: { 'path' : 'stringProp[@name="HTTPSampler.embedded_url_re"]'}
							}
	},
	"ResultCollector"	: { 
							processChildren: true,
							attrs: {
								'name' 					: { 'path' : '@testname'},
								'elementType' 			: { 'path' : 'name()' },
							},
							view: "GENERIC"
						},
	"elementProp"		: { view: false, processChildren: true },
	"objectProp"		: { view: false, processChildren: true },
	"collectionProp"	: { view: false, processChildren: true },
	"boolProp"			: {
							attrs: {
								name 	: { path : "@name" },
								value 	: { path : "." }
							},
							view: '<div> <form> <span class="label"><%=name%></span><input type="checkbox" name="<%=name%>" value="<%=value%>" <%=(value=="true" ? "checked" : "")%> ></input> </form> </div>',
							'type' : 'boolean'
						  },
	"stringProp"		: {
							attrs: {
								name 	: { path : "@name" },
								value 	: { path : "." }
							},
							view: '<div> <form> <span class="label"> <%=name%> </span><input type="textbox" name="<%=name%>" value="<%=value%>"></input> <form> </div>' 
						  },
	"longProp"			: // long is a string for display purposes and to save to file. validation tbd
						  {
							attrs: {
								name 	: { path : "@name" },
								value 	: { path : "." }
						    },
						    view: '<div> <form> <span class="label"> <%=name%> </span><input type="textbox" name="<%=name%>" value="<%=value%>" bleh></input> </form> </div>',
						    'type' : 'number'
						  },
	"DEFAULT"			: {
							attrs: {
								name 	: { path : "name()" }
							},
							view: '<div class="jmxElement"> No handler for the node named <span class="jmxType"> <%=name%> </span>. </div>' 
						  }
};

function loadTemplates () {
	for (var el in ELEMENTS) {
		var element = ELEMENTS[el];
		loadTemplate(el,element);
	}
}

var TEMPLATES = {};

function loadTemplate (tref, e) {
	var template, tname;

	if(e.view != undefined){
		if(e.view == false)
			return;
		if(e.view != "GENERIC"){
			template = e.view;
		}else{
			tname = e.view;
		}
	}
	else{
		tname = tref;
	}

	if(!template){
		var asynchttp = loadFile("res/"+tname+".tmpl");
		template = asynchttp.responseText;
	}
	TEMPLATES[tref] = template;
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

// commenting out VID cos its no longer used, but keeping it around cos there might be future need to id the view nodes.
// var VID=0;

function displayNode(node, displayLoc){
	// DONE: Take out code to add id because i'm no longer using the id to get to the model from the event handlers. this was the reason for adding it in the first place
	// displayLoc.id="jmx_" + (VID++);	
	displayLoc.model = node;

	var elementKey = getElementKey(node);

	var config = ELEMENTS[elementKey];
	if(config) {
		createView();
		addEditors();
		if(config.processChildren){
			processChildren();
		}
		return;
	}

	function createView () {
		var viewData = getAttrValues(node, config.attrs);
		var template = TEMPLATES[elementKey];
		viewData["vid"] = displayLoc.id;
		// This creates a structure like <div id="jmx.."><div>contents of tmpl</div></div>. 
		// The two enclosed divs are Ok because we're attaching model to the div created here, while the template could create its own div structure

		displayLoc.innerHTML = template ? tmpl(template, viewData) : "";
	}

	function addEditors () {
		var inputElements = displayLoc.getElementsByTagName("input");
		for (var i = 0; i < inputElements.length; i++) {
			var inp = inputElements[i];
			var type = getType();
			setEditor(inp,type);
		};

		function getType () {
			// look in the element's name for type. This is useful for elements than manage their children's view
			var typeSrc = config.attrs[inp.name], type;

			// if not found, look in the element's parent for type. 
			// This is useful for generic handlers where type info doesnt match the input element's name, but the containing element
			if(!typeSrc){ typeSrc = config; }

			type = typeSrc.type;
			// if nothing found, default to string
			if(!type) type = "string";
			return type;
		}
	}

	function processChildren () {
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
		var n = node.children.length;
		for (var i =  0; i < n; i++) {
			var child = node.children[i];
			var dispCNode = document.createElement("div");
			dispChildren.appendChild(dispCNode);
			displayNode(child,dispCNode);
		};
	
	}
}


function getElementKey (node) {
	return (ELEMENTS[node.nodeName]) ? node.nodeName : (node.attributes.guiclass && ELEMENTS[node.attributes.guiclass.value] ? node.attributes.guiclass.value : "DEFAULT");
}

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
	// alert("control:" + ctrl.name +" old val:" + ctrl.defaultValue + " new value:" + ctrl.value);
	updateModel(ctrl,ctrl.value);
}

function booleanChanged (event) {
	var ctrl = event.srcElement;
	// alert("control:" + ctrl.name +" old val:" + ctrl.defaultValue + " new value:" + ctrl.value);
	updateModel(ctrl,ctrl.checked ? "true" : "false");
}

function updateModel (ctrl,newValue) {
	var model = ctrl.form.parentElement.parentElement.model;

	var elementKey = getElementKey(model);
	var element = ELEMENTS[elementKey];
	var attrKey = element.attrs[ctrl.name] ? ctrl.name : "value";
	var attr = element.attrs[attrKey];
	var results = document.evaluate(attr.path, model, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);
	var nodeToupdate = results.iterateNext();
	if(nodeToupdate) {
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
