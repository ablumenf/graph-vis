var smiley = {
	numVertices: 8,
	adjacencyLists: [
		[1, 2, 3],
		[0, 2, 3],
		[0, 1, 3],
		[0, 1, 2, 4],
		[3, 5, 6, 7],
		[4, 6, 7],
		[4, 5, 7],
		[4, 5, 6]
	],
	vertexPositions: []
};

for(var i = 0; i < smiley.numVertices; i++) { // initial positions
	smiley.vertexPositions.push([gridSizeX*Math.random(), gridSizeY*Math.random()]);
}