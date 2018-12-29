var n = 100;

var B = {
	numVertices: 1130,
	adjacencyLists: [],
	vertexPositions: []
};

// first 10 people are administrative people
// next 20 people are professors
// this forms a subgraph K_{30}
for(var i = 0; i < 30; i++) {
	var adjList = [];
	for(var j = 0; j < 30; j++) {
		if(j != i) {
			adjList.push(j);
		}
	}
	B.adjacencyLists.push(adjList);
}

// next 100 people are grad students
for(var i = 30; i < 130; i++) {
	var adjList = [];
	for(var j = 0; j < 10; j++) { // they know all the admin folks
		adjList.push(j);
		B.adjacencyLists[j].push(i);
	}
	var rand;
	if(i < 50) {
		adjList.push(i - 20);
		B.adjacencyLists[i-20].push(i);
	} else {
		rand = Math.floor(Math.random() * 20) + 10; // they know 10 different professors
		adjList.push(rand);
		B.adjacencyLists[rand].push(i);
	}
	for(var j = 0; j < 9; j++) {
		rand = Math.floor(Math.random() * 20) + 10;
		while(adjList.indexOf(rand) != -1) {
			rand = Math.floor(Math.random() * 20) + 10;
		}
		adjList.push(rand);
		B.adjacencyLists[rand].push(i);
	}
	B.adjacencyLists.push(adjList);
}

// next 1000 are undergrads
for(var r = 0; r < 20; r++) { // first 20 grad students are TAs
	for(var i = 0; i < 50; i++) {
		var adjList = [];
		adjList.push(30 + r);
		B.adjacencyLists[30+r].push(130 + 50*r + i);
		B.adjacencyLists.push(adjList);
	}
}

for(var i = 130; i < 1130; i += 5) { // each 5 consecutive students forms K_5
	for(var j = i; j < i + 5; j++) {
		for(var k = i; k < i + 5; k++) {
			if(k != j) {
				B.adjacencyLists[j].push(k);
			}
		}
	}
	var idx = B.adjacencyLists[i][0] - 20; // every 5th student knows the professor
	B.adjacencyLists[i].push(idx);
	B.adjacencyLists[idx].push(i);
}

for(var i = 0; i < B.numVertices; i++) { // initial positions
	B.adjacencyLists[i].sort(function(a, b) { return a-b; });
	B.vertexPositions.push([gridSizeX*Math.random(), gridSizeY*Math.random()]);
}