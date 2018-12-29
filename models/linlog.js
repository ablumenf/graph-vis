function f_r(numVertices, positions, v, adjacencyLists, edgeRepulsion) {
	var rval = 0;
	for(var i = 0; i < numVertices; i++) {
		if(i != v) {
			var distance = dist(positions[i], positions[v]);
			var weight = 1;
			if(edgeRepulsion) weight = adjacencyLists[i].length * adjacencyLists[v].length;
			rval += weight * Math.log(distance);
		}
	}
	return rval;
}

function f_a(numVertices, positions, v, adjacencyLists) {
	var rval = 0;
	for(var i = 0; i < adjacencyLists[v].length; i++) {
		var distance = dist(positions[adjacencyLists[v][i]], positions[v]);
		rval += distance;
	}
	return rval;
}

function energy(numVertices, positions, v, adjacencyLists, edgeRepulsion) {
	return f_a(numVertices, positions, v, adjacencyLists) - f_r(numVertices, positions, v, adjacencyLists, edgeRepulsion);
}

function getDirection(numVertices, positions, v, vec, adjacencyLists, edgeRepulsion) {
	vec[0] = vec[1] = 0;
	var adjList = adjacencyLists[v];

	for(var i = 0; i < adjList.length; i++) {
		var delta = [positions[v][0] - positions[adjList[i]][0], positions[v][1] - positions[adjList[i]][1]];
		var distance = dist(delta, vec);
		if(distance > 0) {
			var distInverse = 1/distance;
			vec[0] -= delta[0] * distInverse;
			vec[1] -= delta[1] * distInverse;
		} // sqrt(x^2+y^2) -> <x/sqrt(x^2+y^2), y/sqrt(x^2+y^2)>
	}

	for(var i = 0; i < numVertices; i++) {
		if(i != v) {
			var delta = [positions[v][0] - positions[i][0], positions[v][1] - positions[i][1]];
			var distance = dist(delta, [0, 0]);
			if(distance > 0) {
				var weight = 1;
				if(edgeRepulsion) weight = adjacencyLists[i].length * adjacencyLists[v].length;
				var distSquared = weight/(distance * distance);
				vec[0] += delta[0] * distSquared;
				vec[1] += delta[1] * distSquared;
			}
		} // ln(sqrt(x^2+y^2) -> <x/(x^2+y^2), y/(x^2+y^2)>
	}
	var norm = dist(vec, [0, 0]);
	vec[0] /= norm; vec[1] /= norm;
}

/*
define the attraction energy of a node as the sum of distances of the node from all of its neighbors
the repulsion energy of a node as the sum of ln(distances) from the node to all other nodes in G
the energy of a node = attraction energy - repulsion energy
the energy of a layout is the sum of the energy of all nodes.

For edge linlog (instead of node linlog), we weight the repulsion energy of a node by the degree of said node.
*/

function linlog(numVertices, adjacencyLists, positions, numIters, edgeRepulsion) {
	var rval = [];
	for(var i = 0; i < numVertices; i++) {
		rval.push([positions[i][0], positions[i][1]]);
	}

	var oldPos = [0, 0];
	var direction = [0, 0];
	var optPos = [0, 0];
	let stepSizes = [1/2048, 1/1024, 1/512, 1/256, 1/128, 1/64, 1/32, 1/16, 1/8, 1/4, 1/2, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
	//let stepSizes = edgeRepulsion ?
		//[1/2048, 1/16, 1/8, 2, 4, 8, 16, 32, 64, 128, 256, 1024, 2048] :
		//[1/2048, 1/64, 1/128, 1/64, 1/32, 1/16, 1/8, 1/4, 1/2, 1, 2, 4, 8, 16, 32, 64, 128, 256];
	for(var i = 0; i < numIters; i++) {
		console.log("Iteration " + (i+1));

		for(var v = 0; v < numVertices; v++) {
			var oldEnergy = energy(numVertices, rval, v, adjacencyLists, edgeRepulsion);
			getDirection(numVertices, rval, v, direction, adjacencyLists, edgeRepulsion);

			oldPos = [rval[v][0], rval[v][1]];
			var optEnergy = oldEnergy;
			var opt_k = 0;
			for(var k = 0; k <= stepSizes.length; k++) {
				rval[v][0] = oldPos[0] + direction[0] * stepSizes[k];
				rval[v][1] = oldPos[1] + direction[1] * stepSizes[k];
				var newEnergy = energy(numVertices, rval, v, adjacencyLists, edgeRepulsion);
				if(newEnergy < optEnergy) {
					optEnergy = newEnergy;
					optPos = [rval[v][0], rval[v][1]];
				}
			}
			rval[v][0] = optPos[0];
			rval[v][1] = optPos[1];
		}
	}
	/*var totalEnergy = 0;
	for(var v = 0; v < numVertices; v++) {
		var temp = energy(numVertices, rval, v, adjacencyLists, edgeRepulsion);
		if(temp != Infinity) totalEnergy += temp;
	}
	console.log("final energy: " + totalEnergy);*/
	return rval;
}