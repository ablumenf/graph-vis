var s = 500;
var r = 2;
var G = smiley; // default graph
var labels = [];

var blue = "#1266de";
var orange = "#ff7b00";

var xScales = [d3.scaleLinear(), d3.scaleLinear(), d3.scaleLinear()];
var yScales = [d3.scaleLinear(), d3.scaleLinear(), d3.scaleLinear()];

var panOnClick = false;
var edgesShown = false;
var labelsShown = false;
var errorThrown = false;

var geometry = [[], [], []];
var edges = [[], [], []];

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

document.addEventListener("keypress", e => {
	if(e.key === "e") toggleEdges();
	if(e.key === "l") toggleLabels();
});

function toggleEdges() {
	edgesShown = !edgesShown;
	drawGraphs();
}

function toggleLabels() {
	labelsShown = !labelsShown;
	drawGraphs();
}

function drawGraphs() {
	clearCanvases();
	if(edgesShown) {
		for(let i = 0; i < canvases.length; i++) {
			canvases[i].selectAll("line")
				.data(edges[i])
				.enter()
				.append("line")
				.attr("x1", d => d[0])
				.attr("y1", d => d[1])
				.attr("x2", d => d[2])
				.attr("y2", d => d[3])
				.attr("stroke-width", "1px")
				.attr("stroke", "#000")
				.style("opacity", 0.4)
				.style("z-index", 10);
		}
	}

	for(let i = 0; i < canvases.length; i++) {
		canvases[i].selectAll("circle")
			.data(geometry[i])
			.enter()
			.append("circle")
			.attr("cx", d => xScales[i](d[0]))
			.attr("cy", d => yScales[i](d[1]))
			.attr("r", r)
			.attr("fill", blue)
			.attr("text", (d, i) => i);

		canvases[i].call(d3.brush()
			.extent([[0, 0], [s, s]])
			.on("brush", () => brushed(i)));
	}

	if(labelsShown) {
		for(let i = 0; i < canvases.length; i++) {
			canvases[i].selectAll("text")
				.data(geometry[i])
				.enter()
				.append("text")
				.attr("x", d => xScales[i](d[0] - 15))
				.attr("y", d => yScales[i](d[1] + 15))
				.style("font-size", "16px")
				.style("font-family", "Arial, Helvetica, sans-serif")
				.style("font-weight", "bold")
				.attr("fill", "#910b28")
				.text((d, i) => labels[i]);
		}
	}
}

function setSelectedCircleColor(color, i, j) { // 0 <= j <= 2
	canvases[j].selectAll("circle")._groups[0][i].style.fill = color; // this is really terrible
	canvases[j].selectAll("circle")._groups[0][i].style["z-index"] = 100;
}

function resetCircleColors() {
	for(var j = 0; j < canvases.length; j++) {
		canvases[j].selectAll("circle").style("fill", blue).style("z-index", 50);
	}
}

function filterNodes(d, selection, i, indices, j) {
	var rval = xScales[j](d[0]) >= selection[0][0] + r/2 && xScales[j](d[0]) <= selection[1][0] - r/2
	&& yScales[j](d[1]) >= selection[0][1] + r/2 && yScales[j](d[1]) <= selection[1][1] - r/2;
	if(rval) indices.push(i);
	return rval;
}

function vertices(n) {
	if(n === 1) return n + " vertex selected.";
	return n + " vertices selected.";
}

function brushed(k) {
	if(panOnClick) return;
	resetCircleColors();
	var indices = [];
	var selection = d3.event.selection;
	var sublist = canvases[k].selectAll("circle")
	.filter((d, i) => filterNodes(d, selection, i, indices, k));
	for(var i = 0; i < indices.length; i++) {
		for(var j = 0; j < canvases.length; j++) {
			setSelectedCircleColor(orange, indices[i], j);
		}
	}
	document.querySelector("#count").innerHTML = vertices(indices.length);
}

function clearCanvases() {
	for(var i = 0; i < canvases.length; i++) {
		canvases[i].selectAll("*").remove();
	}
}

function loadGraphs() {
	var start = new Date().getTime();
	geometry[0] = fruchtermanReingold(G.numVertices, G.adjacencyLists, G.vertexPositions, numIters);
	console.log(new Date().getTime() - start);
	var start = new Date().getTime();
	geometry[1] = linlog(G.numVertices, G.adjacencyLists, bias ? geometry[0] : G.vertexPositions, numIters, false);
	console.log(new Date().getTime() - start);
	var start = new Date().getTime();
	geometry[2] = linlog(G.numVertices, G.adjacencyLists, bias ? geometry[1] : G.vertexPositions, numIters, true);
	console.log(new Date().getTime() - start);

	for(let k = 0; k < canvases.length; k++) {
		let xmin = d3.min(geometry[k], d => d[0]);
		let xmax = d3.max(geometry[k], d => d[0]);
		let ymin = d3.min(geometry[k], d => d[1]);
		let ymax = d3.max(geometry[k], d => d[1]);
		if(xmin < 0 || xmax > s) {
			xScales[k] = d3.scaleLinear().domain([xmin, xmax]).range([10, s-10]);
		}
		if(ymin < 0 || ymax > s) {
			yScales[k] = d3.scaleLinear().domain([ymin, ymax]).range([10, s-10]);
		}

		edges[k] = [];
		for(let i = 0; i < G.numVertices; i++) {
			for(let j = i+1; j < G.numVertices; j++) {
				if(G.adjacencyLists[i].indexOf(j) >= 0) {
					const line = [xScales[k](geometry[k][i][0]), yScales[k](geometry[k][i][1]), xScales[k](geometry[k][j][0]), yScales[k](geometry[k][j][1])];
					if(edges[k].findIndex(d => d[0] === line[0] && d[1] === line[1] && d[2] === line[2] && d[3] === line[3]) === -1) {
						edges[k].push(line);
					}
				}
			}
		}
	}
}

function load(H, buttonSelector) {
	unselectButtons();
	$(buttonSelector).addClass("active");
	clearCanvases();
	G = H;
	labels = [];
	for(var i = 0; i < G.numVertices; i++) {
		labels.push("" + i);
	}
	loadGraphs();
	drawGraphs();
}

function buildNewGraph(adjLists) {
	rval = {
		numVertices: adjLists.length,
		adjacencyLists: adjLists,
		vertexPositions: []
	};
	initVertexPositions(rval);
	return rval;
}

function loadCustomAdjList() {
	var graphTextArea = document.getElementById("graphInput");
	var adjLists = graphTextArea.value;
	if(adjLists.length > 0) {
			try {
				G = buildNewGraph(JSON.parse(adjLists));
				errorThrown = false;
			} catch(e) {
				showAlert("Invalid adjacency list input", "#adjListAlert");
				errorThrown = true;
				return;
			}
		} else {
			G = {
				numVertices: smiley.numVertices,
				adjacencyLists: smiley.adjacencyLists,
				vertexPositions: smiley.vertexPositions
			};
			initVertexPositions(G);
			errorThrown = false;
	}
}

function loadCustomLabelList() {
	var labelTextArea = document.getElementById("labelsInput");
	var labelsString = labelTextArea.value;

	if(labelsString.length > 0) {
		try {
			labels = JSON.parse(labelsString);
			var numLabels = labels.length;
			for(var i = numLabels; i < G.numVertices; i++) {
				labels.push("" + i);
			}
			errorThrown = false;
		} catch(e) {
			showAlert("Invalid label input", "#labelListAlert");
			errorThrown = true;
			return;
		}
	} else {
		labels = [];
		for(var i = 0; i < G.numVertices; i++) {
			labels.push("" + i);
		}
		errorThrown = false;
	}
}

function loadCustom() {
	loadCustomAdjList();
	loadCustomLabelList();

	if(!errorThrown) {
		loadGraphs();
		drawGraphs();
	}
}

function initVertexPositions(graph) {
	graph.vertexPositions = [];
	var n = 0;
	while(n < graph.adjacencyLists.length) {
		graph.vertexPositions.push([gridSizeX*Math.random(), gridSizeY*Math.random()]);
		n++;
	}
}

function showAlert(s, selector) {
	document.querySelector(selector).innerHTML = "<div class='alert alert-danger alert-dismissible fade show' role='alert'>"
	+ "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"
	  + s + "</div>";
	d3.select(selector)
		.selectAll("div")
		.transition()
		.delay(5000)
		.remove();
}

var buttonSelectors = ["#buttonA", "#buttonB", "#buttonK", "#buttonFB", "#buttonCustom"];

function unselectButtons() {
	for(let i = 0; i < buttonSelectors.length; i++) {
		$(buttonSelectors[i]).removeClass("active");
	}
}