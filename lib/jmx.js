//jmx.js

function loadTemplates () {
	//var head = document.getElementsByTagName("head")[0];
	var tmplNode = document.getElementById("templates");

	loadTemplate(tmplNode,"tgTemplate","res/jmx.tmpl");
}

var TEMPLATES = {};

function loadTemplate (head,tid, tfn) {
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
	var config = EDITORS[node.nodeName] || EDITORS["DEFAULT"];
	var handler = config.handler;

	displayLoc.id="jmx_" + (VID++);	
	displayLoc.model = node;
	handler(node, displayLoc, config);
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

function threadGroupHandler (node, displayLoc) {

	function createView (node, displayLoc) {

		var viewData = {
			"vid"		: displayLoc.id,
			"tgclass" 	: node.nodeName,
			"tgname"	: node.getAttribute("testname"),
			"comments"	: node.getAttribute("comments") || "",
			"continue_forever" : getNodeValue(node.getElementsByTagName("elementProp")[0].getElementsByTagName("boolProp")[0]),
			"loops" : getNodeValue(node.getElementsByTagName("elementProp")[0].getElementsByTagName("stringProp")[0])
		};
		
		var strProps = node.getElementsByTagName("stringProp");

		for(var i=0; i< strProps.length; i++){
			var name = strProps[i].getAttribute("name").replace("\.","_");
			var val = getNodeValue(strProps[i]);
			viewData[name] = val;
		}

		var boolProps = node.getElementsByTagName("boolProp");

		for(var i=0; i< boolProps.length; i++){
			var name = boolProps[i].getAttribute("name").replace("\.","_");
			var val = getNodeValue(boolProps[i]);
			viewData[name] = val;
		}

		displayLoc.innerHTML = tmpl(TEMPLATES["tgTemplate"], viewData);			
	}

	function addEditControls () {
		
	}

	createView(node, displayLoc);
	addEditControls();
	
}

var EDITORS = {
	"jmeterTestPlan" 	: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"hashTree"			: { handler: genericHandler, showName: false, showAttrs: true, showChildren: true },
	"TestPlan"			: { handler: genericHandler, showName: true , showAttrs: true, showChildren: true },
	"ThreadGroup"		: { handler: threadGroupHandler, showName: true , showAttrs: true, showChildren: true },
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
