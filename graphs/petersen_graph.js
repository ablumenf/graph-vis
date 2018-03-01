var petersen = {
	numVertices: 10,
	adjacencyLists: [
		[1, 4, 5],
		[0, 2, 6],
		[1, 3, 7],
		[2, 4, 8],
		[0, 3, 9],
		[0, 7, 8],
		[1, 8, 9],
		[2, 5, 9],
		[3, 5, 6],
		[4, 6, 7]
	],
	vertexPositions: []
};

for(var i = 0; i < petersen.numVertices; i++) { // initial positions
	petersen.vertexPositions.push([gridSizeX*Math.random(), gridSizeY*Math.random()]);
}