var minEdgeLength = 10;

function fr(kappa, x) {
	return kappa*kappa/x;
}

function fa(kappa, x) {
	return x*x/kappa;
}

function fruchtermanReingold(numVertices, adjacencyLists, positions, numIters) {
	var disp = [];
	var kappa = Math.sqrt(gridSizeX * gridSizeY / numVertices);
	var rval = [];
	for(var i = 0; i < numVertices; i++) {
		rval.push([positions[i][0], positions[i][1]]);
		disp.push([0, 0]);
	}

	var t = Math.sqrt(gridSizeX * gridSizeY) / 10;

	for(var i = 0; i < numIters; i++) {

		// repulsion forces
		for(var v = 0; v < numVertices; v++) {
			disp[v][0] = disp[v][1] = 0;
			for(var u = 0; u < numVertices; u++) {
				if(u != v) {
					var delta = [rval[v][0] - rval[u][0], rval[v][1] - rval[u][1]];
					var distance = Math.max(minEdgeLength, dist(delta, [0, 0]));
					var force = fr(kappa, distance);
					disp[v][0] += delta[0]/distance * force;
					disp[v][1] += delta[1]/distance * force;
				}
			}
		}

		// attraction forces
		for(var v = 0; v < numVertices; v++) {
			for(var e = 0; e < adjacencyLists[v].length; e++) {
				var u = adjacencyLists[v][e];
				var delta = [rval[v][0] - rval[u][0], rval[v][1] - rval[u][1]];
				var distance = Math.max(minEdgeLength, dist(delta, [0, 0]));
				var force = fa(kappa, distance);
				disp[v][0] -= delta[0]/distance * force;
				disp[v][1] -= delta[1]/distance * force;
				disp[u][0] += delta[0]/distance * force;
				disp[u][1] += delta[1]/distance * force;
			}
		}

		// limit max displacement to temperature t and keep inside canvas
		for(var v = 0; v < numVertices; v++) {
			var distance = Math.max(minEdgeLength, dist(disp[v], [0, 0]));
			rval[v][0] += disp[v][0]/distance * Math.min(distance, t);
			rval[v][1] += disp[v][1]/distance * Math.min(distance, t);
			var rand = Math.random() * 2 * minEdgeLength;
			if(rval[v][0] < 10) rval[v][0] = minEdgeLength + rand;
			else if (rval[v][0] > gridSizeX - minEdgeLength - rand)
				rval[v][0] = gridSizeX - minEdgeLength - rand;
			rand = Math.random() * 2 * minEdgeLength;
			if(rval[v][1] < 10) rval[v][1] = minEdgeLength + rand;
			else if (rval[v][1] > gridSizeY - minEdgeLength - rand)
				rval[v][1] = gridSizeY - minEdgeLength - rand;

			rval[v][0] = Math.round(rval[v][0]);
			rval[v][1] = Math.round(rval[v][1]);
		}
		t *= 0.9;
	}
	return rval;
}