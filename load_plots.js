var s = 500;
var r = 2;
var G = {}; // graph

var blue = "#1266de";
var orange = "#ff7b00";

var nodeLinlog_xScale = d3.scaleLinear();
var nodeLinlog_yScale = d3.scaleLinear();
var edgeLinlog_xScale = d3.scaleLinear();
var edgeLinlog_yScale = d3.scaleLinear();

function setSelectedCircleColor(color, i, j) { // 0 <= j <= 2
	canvases[j].selectAll("circle")._groups[0][i].style.fill = color; // this is really terrible
	canvases[j].selectAll("circle")._groups[0][i].style["z-index"] = 100;
}

function resetCircleColors() {
	for(var j = 0; j < canvases.length; j++) {
		canvases[j].selectAll("circle").style("fill", blue).style("z-index", 0);
	}
}

function filterFR(d, selection, i, indices) {
	var rval = d[0] >= selection[0][0] + r/2 && d[0] <= selection[1][0] - r/2
	&& d[1] >= selection[0][1] + r/2 && d[1] <= selection[1][1] - r/2;
	if(rval) indices.push(i);
	return rval;
}

function filterNodeLL(d, selection, i, indices) {
	var rval = nodeLinlog_xScale(d[0]) >= selection[0][0] + r/2 && nodeLinlog_xScale(d[0]) <= selection[1][0] - r/2
	&& nodeLinlog_yScale(d[1]) >= selection[0][1] + r/2 && nodeLinlog_yScale(d[1]) <= selection[1][1] - r/2;
	if(rval) indices.push(i);
	return rval;
}

function filterEdgeLL(d, selection, i, indices) {
	var rval = edgeLinlog_xScale(d[0]) >= selection[0][0] + r/2 && edgeLinlog_xScale(d[0]) <= selection[1][0] - r/2
	&& edgeLinlog_yScale(d[1]) >= selection[0][1] + r/2 && edgeLinlog_yScale(d[1]) <= selection[1][1] - r/2;
	if(rval) indices.push(i);
	return rval;
}

function vertices(n) {
	if(n == 1) return n + " vertex selected.";
	return n + " vertices selected.";
}

function brushed1() {
	resetCircleColors();
	var indices = [];
	var selection = d3.event.selection;
	var sublist = canvases[0].selectAll("circle")
	.filter((d, i) => filterFR(d, selection, i, indices));
	for(var i = 0; i < indices.length; i++) {
		for(var j = 0; j < canvases.length; j++) {
			setSelectedCircleColor(orange, indices[i], j);
		}
	}
	document.querySelector("#count").innerHTML = vertices(indices.length);
}

function brushed2() {
	resetCircleColors();
	var indices = [];
	var selection = d3.event.selection;
	var sublist = canvases[1].selectAll("circle")
	.filter((d, i) => filterNodeLL(d, selection, i, indices));
	for(var i = 0; i < indices.length; i++) {
		for(var j = 0; j < canvases.length; j++) {
			setSelectedCircleColor(orange, indices[i], j);
		}
	}
	document.querySelector("#count").innerHTML = vertices(indices.length);
}

function brushed3() {
	resetCircleColors();
	var indices = [];
	var selection = d3.event.selection;
	var sublist = canvases[2].selectAll("circle")
	.filter((d, i) => filterEdgeLL(d, selection, i, indices));
	for(var i = 0; i < indices.length; i++) {
		for(var j = 0; j < canvases.length; j++) {
			setSelectedCircleColor(orange, indices[i], j);
		}
	}
	document.querySelector("#count").innerHTML = vertices(indices.length);
}

d3.select("#fr").append("svg")
	.attr("width", s)
	.attr("height", s)
	.append("g")
	.attr("id", "fr_g");

d3.select("#linlog_node").append("svg")
	.attr("width", s)
	.attr("height", s)
	.append("g")
	.attr("id", "linlog_node_g");

d3.select("#linlog_edge").append("svg")
	.attr("width", s)
	.attr("height", s)
	.append("g")
	.attr("id", "linlog_edge_g");

var canvases = [d3.select("#fr_g"), d3.select("#linlog_node_g"), d3.select("#linlog_edge_g")];
var titles = ["Fruchterman-Reingold", "Node-Repulsion Linlog", "Edge-Repulsion Linlog"];
var textOffsets = [.32*s, .32*s, .33*s];

function clearCanvases() {
	for(var i = 0; i < canvases.length; i++) {
		canvases[i].selectAll("*").remove();
	}
}

function loadCanvases() {
	for(var i = 0; i < canvases.length; i++) {
		canvases[i].append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", s)
			.attr("width", s)
			.style("stroke", "#000")
			.style("fill", "none")
			.style("stroke-width", 2);

		canvases[i].append("text")
			.attr("x", textOffsets[i])
			.attr("y", 20)
			.style("font-size", "16px")
			.style("font-family", "Arial, Helvetica, sans-serif")
			.style("font-weight", "bold")
			.attr("fill", "#525252")
			.text(titles[i]);
	}
}

function loadGraphs() {
	var start1 = new Date().getTime();
	var frGeometry = fruchtermanReingold(G.numVertices, G.adjacencyLists, G.vertexPositions, numIters);
	var end1 = new Date().getTime();
	console.log(end1-start1);

	d3.select("#fr_g").selectAll("circle")
		.data(frGeometry)
		.enter()
		.append("circle")
		.attr("cx", d => d[0])
		.attr("cy", d => d[1])
		.attr("r", r)
		.attr("fill", blue)
		.attr("text", (d, i) => i);

	canvases[0].call(d3.brush()
		.extent([[0, 0], [s, s]])
		.on("brush", brushed1));

	var start2 = new Date().getTime();
	var nodeLinlogGeometry = linlog(G.numVertices, G.adjacencyLists, bias ? frGeometry : G.vertexPositions, numIters, false);
	var end2 = new Date().getTime();
	console.log(end2-start2);
	var nodeLinlog_xmin = d3.min(nodeLinlogGeometry, d => d[0]);
	var nodeLinlog_xmax = d3.max(nodeLinlogGeometry, d => d[0]);
	var nodeLinlog_ymin = d3.min(nodeLinlogGeometry, d => d[1]);
	var nodeLinlog_ymax = d3.max(nodeLinlogGeometry, d => d[1]);
	if(nodeLinlog_xmin < 0 || nodeLinlog_xmax > s) {
		nodeLinlog_xScale = d3.scaleLinear().domain([nodeLinlog_xmin, nodeLinlog_xmax]).range([10, s-10]);
	}
	if(nodeLinlog_ymin < 0 || nodeLinlog_ymax > s) {
		nodeLinlog_yScale = d3.scaleLinear().domain([nodeLinlog_ymin, nodeLinlog_ymax]).range([10, s-10]);
	}

	d3.select("#linlog_node_g").selectAll("circle")
		.data(nodeLinlogGeometry)
		.enter()
		.append("circle")
		.attr("cx", d => nodeLinlog_xScale(d[0]))
		.attr("cy", d => nodeLinlog_yScale(d[1]))
		.attr("r", r)
		.attr("fill", blue)
		.attr("text", (d, i) => i);

	canvases[1].call(d3.brush()
		.extent([[0, 0], [s, s]])
		.on("brush", brushed2));

	var start3 = new Date().getTime();
	var edgeLinlogGeometry = linlog(G.numVertices, G.adjacencyLists, bias ? nodeLinlogGeometry : G.vertexPositions, numIters, true);
	var end3 = new Date().getTime();
	console.log(end3-start3);
	var edgeLinlog_xmin = d3.min(edgeLinlogGeometry, d => d[0]);
	var edgeLinlog_xmax = d3.max(edgeLinlogGeometry, d => d[0]);
	var edgeLinlog_ymin = d3.min(edgeLinlogGeometry, d => d[1]);
	var edgeLinlog_ymax = d3.max(edgeLinlogGeometry, d => d[1]);
	if(edgeLinlog_xmin < 0 || edgeLinlog_xmax > s) {
		edgeLinlog_xScale = d3.scaleLinear().domain([edgeLinlog_xmin, edgeLinlog_xmax]).range([10, s-10]); // 10 + 0.15*s, 0.85*s-10
	}
	if(edgeLinlog_ymin < 0 || edgeLinlog_ymax > s) {
		edgeLinlog_yScale = d3.scaleLinear().domain([edgeLinlog_ymin, edgeLinlog_ymax]).range([10, s-10]); // 10 + 0.15*s, 0.85*s-10
	}

	d3.select("#linlog_edge_g").selectAll("circle")
		.data(edgeLinlogGeometry)
		.enter()
		.append("circle")
		.attr("cx", d => edgeLinlog_xScale(d[0]))
		.attr("cy", d => edgeLinlog_yScale(d[1]))
		.attr("r", r)
		.attr("fill", blue)
		.attr("text", (d, i) => i);

	canvases[2].call(d3.brush()
		.extent([[0, 0], [s, s]])
		.on("brush", brushed3));
}

function loadSmiley() {
	clearCanvases();
	loadCanvases();
	G = smiley;
	loadGraphs();
}

function loadA() {
	clearCanvases();
	loadCanvases();
	G = A;
	loadGraphs();
}

function loadB() {
	clearCanvases();
	loadCanvases();
	G = B;
	loadGraphs();
}

function loadK() {
	clearCanvases();
	loadCanvases();
	G = K;
	loadGraphs();
}

function loadFB() {
	clearCanvases();
	loadCanvases();
	G = FB;
	loadGraphs();
}

function loadTWTR() {
	clearCanvases();
	loadCanvases();
	//G = TWTR;
	//loadGraphs();
	alert("You don't want to do this.");
}

loadCanvases();