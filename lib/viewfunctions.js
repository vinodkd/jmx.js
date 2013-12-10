// viewfunctions.js
// contains functions used to extract view data from the model.

function getPCPairs (node) {
	var ret = [];
	var children = node.children;
	for (var i = 0; i < node.children.length-1; i+=2) {
			var pair = [];
			pair[0] = node.children[i];
			pair[1] = node.children[i+1];
			ret.push(pair);
	}
	return ret;
}

function nodeAsXML (node) {
	var d = document.createElement("div");
	for (var i = 0; i < node.childNodes.length; i++) {
		var child = node.childNodes[i];
		var cClone = child.cloneNode();
		d.appendChild(cClone);
	};
	return d.innerHTML;
}

