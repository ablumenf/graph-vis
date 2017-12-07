var n = 100;
var B = 100;

var A = {
	numVertices: 500,
	adjacencyLists: [],
	vertexPositions: []
};

for(var r = 0; r < 5; r++) {
	for(var i = 0; i < n; i++) {
		var adjList = [];
		for(var j = 0; j < n; j++) {
			if(i != j) adjList.push(n*r + j);
		}
		A.adjacencyLists.push(adjList);
	}
}

var l = [];
for(var r = 0; r < 4; r++) {
	l.push(1 + Math.floor(Math.random() * (B-1)));
	for(var j = 0; j < l[r]; j++) {
		var start = r * n + Math.floor(Math.random() * n);
		var end = (r+1) * n + Math.floor(Math.random() * n);
		if(A.adjacencyLists[start].indexOf(end) == -1) {
			A.adjacencyLists[start].push(end);
			A.adjacencyLists[start].sort(function(a, b) { return a-b; });
		}
	}
}

for(var i = 0; i < A.numVertices; i++) { // initial positions
	A.vertexPositions.push([gridSizeX*Math.random(), gridSizeY*Math.random()]);
}