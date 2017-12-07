var numIters = 100;
var gridSizeX = 500;
var gridSizeY = 500;

function dist(u, v) { // 2d distance
	var xDiff = v[0] - u[0];
	var yDiff = v[1] - u[1];
	return Math.sqrt(xDiff*xDiff + yDiff*yDiff);
}