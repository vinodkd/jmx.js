//jmx.js
// // from http://stackoverflow.com/a/8412989

// var parseXml;

// if (typeof window.DOMParser != "undefined") {
//     parseXml = function(xmlStr) {
//         return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
//     };
// } else if (typeof window.ActiveXObject != "undefined" &&
//        new window.ActiveXObject("Microsoft.XMLDOM")) {
//     parseXml = function(xmlStr) {
//         var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
//         xmlDoc.async = "false";
//         xmlDoc.loadXML(xmlStr);
//         return xmlDoc;
//     };
// } else {
//     throw new Error("No XML parser found");
// }

// from w3schools
// http://www.w3schools.com/xml/xml_dom.asp

function parseXml(fileName){
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
	xmlDoc=xmlhttp.responseXML;
	return xmlDoc;
}

var aggregateHandler = function (node, displayLoc, config) {
		var cfg = config || {
			showName 		: true,
			showAttrs		: true,
			showChildren 	: true
		};

		var dispNode = document.createElement("div");
		displayLoc.appendChild(dispNode);

		if(cfg.showName) dispNode.appendChild(document.createTextNode(node.nodeName));
		if(cfg.showAttrs) {
			// handle display of attrs here
		}
		
		if(cfg.showChildren){
			var dispChildren = document.createElement("div");
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
		var view = '<span class="label">'+ nName +'</span><input type="radio" name="'+nName+'" value="'+nVal+'" checked>'+nVal+'</input>';
		var oppVal = ( nVal == "true" )? "false" : "true";
		view = view + '<input type="radio" name="'+nName+'" value="'+oppVal+'">'+oppVal+'</input>';
		displayLoc.innerHTML = view;
}

function getNodeValue(node){
	return (node.childNodes && node.childNodes[0]) ? node.childNodes[0].nodeValue : "";
}

var stringHandler = function (node, displayLoc) {
		var nName = node.getAttribute("name");
		var nVal = getNodeValue(node);
		var view = '<span class="label">'+ nName +'</span><input type="textbox" name="'+nName+'" value="'+nVal+'"></input>';
		displayLoc.innerHTML = view;
}

var nullHandler = function (node, displayLoc) {
		// dont handle it
};

var errorHandler = function(node, displayLoc){
		displayLoc.innerHTML= "no handler for the node named \"" + node.nodeName + "\", type: " + node.nodeType;
};

var EDITORS = {
	"jmeterTestPlan" 	: { handler: aggregateHandler, showName: true , showAttrs: true, showChildren: true },
	"hashTree"			: { handler: aggregateHandler, showName: false, showAttrs: true, showChildren: true },
	"TestPlan"			: { handler: aggregateHandler, showName: true , showAttrs: true, showChildren: true },
	"ThreadGroup"		: { handler: aggregateHandler, showName: true , showAttrs: true, showChildren: true },
	"ConfigTestElement"	: { handler: aggregateHandler, showName: true , showAttrs: true, showChildren: true },
	"GenericController"	: { handler: aggregateHandler, showName: true , showAttrs: true, showChildren: true },
	"HTTPSampler"		: { handler: aggregateHandler, showName: true , showAttrs: true, showChildren: true },
	"GenericController"	: { handler: aggregateHandler, showName: true , showAttrs: true, showChildren: true },
	"ResultCollector"	: { handler: aggregateHandler, showName: true , showAttrs: true, showChildren: true },

	"boolProp"			: { handler: boolHandler, showName: true },
	"stringProp"		: { handler: stringHandler, showName: true },
	"longProp"		: { handler: stringHandler, showName: true },		// long is a string for display purposes and to save to file. validation tbd

	"#text"				: { handler: nullHandler},
	"DEFAULT"			: { handler: errorHandler}
};

function displayNode(node, displayLoc){
	var config = EDITORS[node.nodeName] || EDITORS["DEFAULT"];
	var handler = config.handler;
	handler(node, displayLoc, config);
}
