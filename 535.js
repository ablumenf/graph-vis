var s = 500;
var r = 4;
var G = petersen; // graph
var G1 = G; // user-input graph
var labels = [];
var labels1 = [];

var blue = "#1266de";

var scale = d3.scaleLinear().domain([0, s]);

d3.select("#fr").append("svg")
	.attr("width", s)
	.attr("height", s)
	.append("g")
	.attr("id", "fr_g");

function loadCanvases() {
	d3.select("#fr_g")
		.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("height", s)
		.attr("width", s)
		.style("stroke", "#000")
		.style("fill", "none")
		.style("stroke-width", 2);
}

function loadGraphs() {
	var frGeometry = fruchtermanReingold(G.numVertices, G.adjacencyLists, G.vertexPositions, numIters);

	d3.select("#fr_g").selectAll("circle")
		.data(frGeometry)
		.enter()
		.append("circle")
		.attr("cx", d => d[0])
		.attr("cy", d => d[1])
		.attr("r", r)
		.attr("fill", blue)
		.attr("text", (d, i) => i);

	d3.select("#fr_g").selectAll("text")
		.data(frGeometry)
		.enter()
		.append("text")
		.attr("x", d => d[0] - 15)
		.attr("y", d => d[1] + 15)
		.style("font-size", "16px")
		.style("font-family", "Arial, Helvetica, sans-serif")
		.style("font-weight", "bold")
		.attr("fill", "#910b28")
		.text((d, i) => labels[i]);

	G.vertexPositions = frGeometry;

	var lines = [];
	for(var i = 0; i < G.numVertices; i++) {
		for(var j = i+1; j < G.numVertices; j++) {
			if(G.adjacencyLists[i].indexOf(j) >= 0) {
				lines.push([frGeometry[i][0], frGeometry[i][1], frGeometry[j][0], frGeometry[j][1]]);
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

	d3.select("#fr_g")
		.append("text")
		.attr("x", .39*s)
		.attr("y", 20)
		.style("font-size", "16px")
		.style("font-family", "Arial, Helvetica, sans-serif")
		.style("font-weight", "bold")
		.attr("fill", "#525252")
		.text("Graph Display");
}

function drawGraph() {
	d3.select("#fr_g").selectAll("*").remove();
	loadCanvases();
	G = G1;
	labels = labels1;
	if(labels.length === 0) {
		for(var i = 0; i < G.numVertices; i++) {
			labels.push("" + i);
		}
	}
	G.vertexPositions = [];
	for(var i = 0; i < G.numVertices; i++) {
		G.vertexPositions.push([gridSizeX*Math.random(), gridSizeY*Math.random()]);
	}
	loadGraphs();

	var s = "Vertex positions (scaled to [0, 1] x [0, 1]): <br><br>";
	for(var i = 0; i < G.numVertices; i++) {
		s += "Vertex " + labels[i] + ": (" + scale(G.vertexPositions[i][0]).toFixed(3) + ", " + (1 - scale(G.vertexPositions[i][1])).toFixed(3) + ") <br>";
	}
	document.getElementById("positions").innerHTML = s;
}

loadCanvases();