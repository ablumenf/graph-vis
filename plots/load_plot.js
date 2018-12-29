var graphList = [];
var labelsList = [];
var numGraphs = 0;
var graphIndex = -1;
var s = 500;
var r = 4;
var G = petersen; // graph
var labels = [];
var roundedCorners = 8;

var blue = "#1266de";

d3.select("#fr").append("svg")
		.attr("width", s)
		.attr("height", s)
		.append("g")
		.attr("id", "fr_g");


function graphTitle() {
	d3.select("#graphHeader").text("Graph " + (graphIndex+1) + "/" + numGraphs);
}

function drawGraphAndUpdate() {
	var graphTextArea = document.getElementById("graphInput");
	var labelTextArea = document.getElementById("labelsInput");
	var adjLists = graphTextArea.value;
	var labelsString = labelTextArea.value;
	if(adjLists.length > 0) {
		try {
			G = buildNewGraph(JSON.parse(adjLists));
		} catch(e) {
			showAlert("Invalid adjacency list input");
			return;
		}
	} else {
		G = {
			numVertices: petersen.numVertices,
			adjacencyLists: petersen.adjacencyLists,
			vertexPositions: petersen.vertexPositions
		};
		initVertexPositions(G);
	}
	if(labelsString.length > 0) {
		try {
			labels = JSON.parse(labelsString);
			var numLabels = labels.length;
			for(var i = numLabels; i < G.numVertices; i++) {
				labels.push("" + i);
			}
		} catch(e) {
			showAlert("Invalid label input");
			return;
		}
	} else {
		labels = [];
		for(var i = 0; i < G.numVertices; i++) {
			labels.push("" + i);
		}
	}
	numGraphs++;
	graphIndex = numGraphs - 1;
	drawGraph(G);
	graphList.push(G);
	labelsList.push(labels);
}

function showAlert(s) {
	document.querySelector("#graphAlert").innerHTML = "<div class='alert alert-danger alert-dismissible fade show' role='alert'>"
	+ "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"
	  + s + "</div>";
	d3.select("#graphAlert")
		.selectAll("div")
		.transition()
		.delay(5000)
		.remove();
}

function prevGraph() {
	if(graphIndex <= 0) {
		if(numGraphs > 0) {
			showAlert("Current graph is first graph");
		} else {
			showAlert("No graph to display");
		}
	}
	if(graphIndex > 0) {
		graphIndex--;
	}
	if(graphIndex >= 0) { // was > 0 before decrement
		G = graphList[graphIndex];
		labels = labelsList[graphIndex];
		loadGraph(graphList[graphIndex]);
	}
}

function nextGraph() {
	if(graphIndex < 0 && numGraphs === 0) {
		showAlert("No graph to display");
	}
	else if(graphIndex === numGraphs - 1) {
		showAlert("Current graph is latest graph");
	}
	else {
		graphIndex++;
		G = graphList[graphIndex];
		labels = labelsList[graphIndex];
		loadGraph(graphList[graphIndex]);
	}
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

function initVertexPositions(graph) {
	graph.vertexPositions = [];
	var n = 0;
	while(n < graph.adjacencyLists.length) {
		graph.vertexPositions.push([gridSizeX*Math.random(), gridSizeY*Math.random()]);
		n++;
	}
}

function loadGraph(graph) {
	d3.select("#fr").selectAll("svg").remove();

		d3.select("#fr")
			.append("svg")
			.attr("width", s)
			.attr("height", s)
			.append("g")
		.attr("id", "fr_g");

	var geometry = graph.vertexPositions;
	var lines = [];
	for(var i = 0; i < graph.numVertices; i++) {
		for(var j = i+1; j < graph.numVertices; j++) {
			if(graph.adjacencyLists[i].indexOf(j) >= 0) {
				lines.push([geometry[i][0], geometry[i][1], geometry[j][0], geometry[j][1]]);
			}
		}
	}

	d3.select("#fr_g").selectAll("line")
		.data(lines)
		.enter()
		.append("line")
		.attr("x1", d => d[0])
		.attr("y1", d => d[1])
		.attr("x2", d => d[2])
		.attr("y2", d => d[3])
		.attr("stroke-width", "1px")
		.attr("stroke", "#000");

	d3.select("#fr_g").selectAll("circle")
		.data(geometry)
		.enter()
		.append("circle")
		.attr("cx", d => d[0])
		.attr("cy", d => d[1])
		.attr("r", r)
		.attr("fill", blue)
		.attr("text", (d, i) => i);

	d3.select("#fr_g").selectAll("text")
		.data(geometry)
		.enter()
		.append("text")
		.attr("x", d => d[0] - 15)
		.attr("y", d => d[1] + 15)
		.style("font-size", "16px")
		.style("font-family", "Arial, Helvetica, sans-serif")
		.style("font-weight", "bold")
		.attr("fill", "#910b28")
		.text((d, i) => labels[i]);

	graphTitle();

	d3.select("#positions").selectAll("*").remove(); // clear table

	let scaledVertexPositions = [];
	let scale = d3.scaleLinear().domain([0, s]);
	for(let i = 0; i < graph.vertexPositions.length; i++) {
		scaledVertexPositions.push([
			labels[i],
			scale(graph.vertexPositions[i][0]).toFixed(3),
			scale(graph.vertexPositions[i][1]).toFixed(3)
		]);
	}

	d3.select("#tableheader")
		.selectAll("th")
		.data(["Vertex", "x", "y"])
		.enter()
		.append("th")
		.attr("scope", "col")
		.text(d => d);

	let rows = d3.select("#positions")
		.selectAll("tr")
		.data(scaledVertexPositions)
		.enter()
		.append("tr");

	rows.selectAll("td")
		.data(d => d)
		.enter()
		.append("td")
		.attr("style", "font-weight: bold;")
		.text(d => d);

	cells = d3.selectAll("td")._groups[0];
	for(let i = 0; i < cells.length; i++) {
		if(i % 3 !== 0) { // remove bold from x/y-coordinates
			cells[i].style = {};
		}
	}
}

function drawGraph(graph) {
	var geometry = fruchtermanReingold(G.numVertices, G.adjacencyLists, G.vertexPositions, numIters);
	graph.vertexPositions = geometry;
	loadGraph(graph);
}