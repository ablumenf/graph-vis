var n = 250;

var K = {
	numVertices: n,
	adjacencyLists: [],
	vertexPositions: []
};

for(var i = 0; i < n; i++) {
	var adjList = [];
	for(var j = 0; j < n; j++) {
		if(i != j) adjList.push(j);
	}
	K.adjacencyLists.push(adjList);
}

for(var i = 0; i < K.numVertices; i++) { // initial positions
	K.vertexPositions.push([gridSizeX*Math.random(), gridSizeY*Math.random()]);
}