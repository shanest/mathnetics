/**MathWorx Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

/**mathnetics.Object3D is a class that defines 3D objects that can both be manipulated in their own right and displayed in {@link mathnetics.gfx.Scene3D} objects.
A 3D object as defined is a face-vertex mesh.  A face is an ordered list of 
vertex indices in the vertex array which are to be connected by lines.  This model allows lines
as well as surfaces and solids to all be Object3D objects.  Note that the vertex list is not circular, so a square will have five indices: [0,1,2,3,0].  
This model, while slightly less intuitive, allows Lines and other 3-D objects to be defined in the same way.
@class mathnetics.Object3D
*/

dependencies = ['point3D', 'Plane'];
mathnetics.require(dependencies);

mathnetics.Object3D = function() {
	/**The list of vertices of the 3D object. An array of mathnetics.point3D's.  Order is EXTREMELY important.
	@variable {private mathnetics.point3D[]} vertices */
	this.vertices = new Array();
	/**The list of vertices after being projected onto a plane.  Might still be mathnetics.point3D objects, simply on a Plane now.
	@variable {private mathnetics.point3D[]} vertices2D */
	this.vertices2D = new Array();
	/**The array of faces.  A face is an ordered list of vertices to connect with line segments.  [0, 4, 2, 3] for example, connects vertices 0, 4, 2, 3 and 0.  This will be a 2-D array.
	@variable {private int[][]} faces */
	this.faces = new Array();
};

mathnetics.Object3D.prototype = {

	/**Adds a face to the 3D Object.
	@function {public mathnetics.Object3D} addFace
	@param {int[]} vertices - the orderered list of vertex indices that should be connected to form a face
	@return this object, with updated faces array */
	addFace: function(vertices) {
		if(vertices instanceof Array) {
			this.faces[this.faces.length] = vertices;
		}
		return this;
	},

	/**Perform a function on each vertex of an object.  Does not change faces.
	@function {public mathnetics.Object3D} toEach
	@param {Function} func - the function to perform on each vertex 
	@return this Object3D, with the specified function performed on each vertex */
	toEach: function(func) {
		var i = 0; 
		while(i < this.vertices.length) {
			this.vertices[i] = func(this.vertices[i]);
			i++;
		}
		return this;
	},

	/**Moves 3D object into new coordinates defined by theta and phi; used often by Scene3D's camera.  Updates this.vertices2D with coordinates in new system.
	@function {public mathnetics.Object3D} viewIn
	@param {Number} theta - the degree in the XY-plane defining the location from which to view
	@param {Number} phi - the degree form positive Z-axis from which to view the Object
	@return this object, with updated vertices2D array 
	@see AffineTransform.newCoordinates */
	viewIn: function(theta, phi) {
		var i = 0;
		var T = mathnetics.AffineTransform.create(3).newCoordinates(theta, phi);
		while(i < this.vertices.length) {
			this.vertices2D[i] = T.applyTo(this.vertices[i]);
			i++;
		}
		return this;
	},

	/**After object has been moved to Scene coordinates (via viewIn method), this performs a perspective transformation to put the object in the XY plane.
	@function {public mathnetics.Object3D} to2D
	@param {Number} focus - the focal distance (between camera and origin)
	@return this object, with vertices2D now being an array of mathnetics.point2D's */
	to2D: function(focus) {
		var focus = focus;
		var i = 0;
		while(i < this.vertices2D.length) {
			var point = this.vertices2D[i];
			var mult = focus / (focus - point.x);
			this.vertices2D[i] = mathnetics.point2D.create(mult*point.y, mult*point.z);
	 		i++;
		}
		return this;
	},

	/**Draws the given object in a mathnetics.gfx.SVGDoc.  This function automatically "flips" the object because SVG's canvas goes from the bottom down.  Make sure to adjust viewBox appropriately.
	@function {public void} draw
	@param {mathnetics.gfx.SVGWrapper} svg - the mathnetics.gfx.SVGWrapper (via SVGDoc) object
	@param {Object} settings - the settings to apply to each line of the wireframe; settings.transform = 'scale(1,-1)' automatically applied */
	draw: function(svg, settings) {
		settings.transform = 'scale(1,-1)';
		for(i = 0; i < this.faces.length; i++) {
			for(j = 0; j < this.faces[i].length - 1; j++) {
				var p1 = this.vertices2D[this.faces[i][j]];
				var p2 = this.vertices2D[this.faces[i][j+1]];
				svg.line(null, p1.x, p1.y, p2.x, p2.y, settings);
			}
/*
			var p1 = this.vertices2D[this.faces[i][j]];
			var p2 = this.vertices2D[this.faces[i][0]];
			svg.line(null, p1.x, p1.y, p2.x, p2.y, settings);
*/
		}
	},

	/**Translate an object by tx, ty, and tz.  Performs the translation on every vertex.
	@function {public mathnetics.Object3D} translate
	@param {Number} tx - the x translation
	@param {Number} ty - the y translation
	@param {Number} tz - the z translation
	@return this Object3D, translated (NOT a new copy of the object) */
	translate: function(tx, ty, tz) {
		return this.toEach(function(x) { return x.translate(tx, ty, tz); });
	},

	/**Resets vertices array.  Used by constructor.
	@function {public mathnetics.Object3D} setVertices
	@param {mathnetics.point3D[]} vertices - an array of mathnetics.point3D objects that are the vertices of the object
	@return this Object3D updated */
	setVertices: function(vertices) {
		if(vertices instanceof Array) {
			this.vertices = vertices;
		}
		return this;
	},

	/**Resets faces array. Used by constructor.
	@function {public mathnetics.Object3D} setFaces
	@param {int[][]} faces - the array (2-dimensional!) of faces (i.e. [[0,1,2,0],[2,3,4,2]] defines two faces connecting 
	vertices[0],vertices[1] and vertices[2], etc.)
	@return this Object3D updated */
	setFaces: function(faces) {
		if(faces instanceof Array) {
			this.faces = faces;
		}
		return this;
	},

	/**Clones current object3D.
	@function {public mathnetics.Object3D} dup
	@return new, identical Object3D */
	dup: function() {
		return mathnetics.Object3D.create(this.vertices, this.faces);
	},

	/**Generates a string representation of the Object (a face-vertex mesh).
	@function {public String} toString
	@return a list of all the vertices and faces */
	toString: function() {
		return "vertices: \n" + this.vertices.join("\n") + "\n\nfaces: \n" + this.faces.join("\n");
	}

}; //end Object3D prototype

/**Creates a new 3D Object.
@param {mathnetics.point3D[]} vertices
@param {int[][]} faces
@constructor mathnetics.Object3D.create */
mathnetics.Object3D.create = function(vertices, faces) {
	var O = new mathnetics.Object3D();
	return O.setVertices(vertices).setFaces(faces);
};

mathnetics.extend(mathnetics.Object3D, {

/**Creates a new Cube as a mathnetics.Object3D object.
@function {public static mathnetics.Object3D} Cube
@param {Number} side - the length of each side of the cube.
@param {optional mathnetics.point3D} center - the center point of the cube, default is (0,0,0)
@return a new Object3D representing the specified cube */
Cube: function(side, center) {
	if(!center) {
		var center = mathnetics.point3D.zero;
	}
	var cx = center.x, cy = center.y, cz = center.z;
	var length = side/2;
	var verts = new Array(), faces = new Array();
	verts[0] = mathnetics.point3D.create(length, -length, length);
	verts[1] = mathnetics.point3D.create(length, length, length);
	verts[2] = mathnetics.point3D.create(-length, length, length);
	verts[3] = mathnetics.point3D.create(-length, -length, length);
	verts[4] = mathnetics.point3D.create(+length, -length, -length);
	verts[5] = mathnetics.point3D.create(+length, length, -length);
	verts[6] = mathnetics.point3D.create(-length, length, -length);
	verts[7] = mathnetics.point3D.create(-length, -length, -length);
	faces[0] = [0, 4, 5, 1, 0];
	faces[1] = [1, 5, 6, 2, 1];
	faces[2] = [2, 6, 7, 3, 2];
	faces[3] = [3, 7, 4, 0, 3];
	faces[4] = [4, 5, 6, 7, 4];
	faces[5] = [0, 1, 2, 3, 0];
	return (mathnetics.Object3D.create(verts, faces)).translate(cx, cy, cz);
},

/**Creates a new Sphere as an Object3D object.
@function {public static mathnetics.Object3D} Sphere
@param {Number} rad - the radius of the sphere
@param {optional mathnetics.point3D} cent - the center of the sphere; defaults to (0,0,0)
@param {optional Number} segments - the number of segments to divide the sphere into; directly relates to the number of vertices/faces; default is 5 
@return a new Object3D that defines a sphere as outlined above */
Sphere: function(rad, cent, segments) {

	var o = mathnetics.Object3D.create([], []);
	var segs = 5;
	if(segments) {
		segs = segments / 2;
	}
	var radius = rad;
	var center = mathnetics.point3D.zero;
	if(cent instanceof mathnetics.point3D) {
		center = cent;
	}
	var segmentRad = Math.PI / 2 / (segs + 1);
	var numSeparators = 4*segs + 4;

	for(i = -segs; i <= segs; i++) {
		var r = radius * Math.cos(segmentRad*i);
		var y = radius * Math.sin(segmentRad*i);
		for(j = 0; j < numSeparators; j++) {
			var z = -1*r*Math.sin(segmentRad*j);
			var x = r * Math.cos(segmentRad*j);
			o.vertices.push(mathnetics.point3D.create(x, y, z));
		}
	}

	//2*segs diff y values, numSeparators points of each y value
	for(i = 0; i < 2*segs; i++) {
		var face = new Array();
		for(j = 0; j < numSeparators; j++) {
			var i1 = j + i*numSeparators;
			var i2 = (j+1) + i*numSeparators;
			var i3 = (j+1) + (i+1)*numSeparators;
			var i4 = j + (i+1)*numSeparators;
			if(j == numSeparators-1) {
				i2 = i*numSeparators;
				i3 = (i+1)*numSeparators;
			}
			//only need 4 vertices for a square because of hypersymmetry of sphere
			face = [i1, i2, i3, i4];
			o.faces.push(face);
		}
	}

	//add the two "endpoints" and triangles to them
	o.vertices.push(mathnetics.point3D.create(0, -radius, 0));
	o.vertices.push(mathnetics.point3D.create(0, radius, 0));
	for(i = 0; i < numSeparators - 1; i++) {
		var i1 = i, i2 = i+1;
		var i3 = o.vertices.length - 2;
		o.faces.push([i1, i2, i3, i1]);
		var i1 = i+(2*segs*numSeparators), i2 = (i+1)+(2*segs*numSeparators);
		var i3 = o.vertices.length - 1;
		o.faces.push([i1, i2, i3, i1]);
	}

	if(!(cent.equalTo(mathnetics.point3D.zero))) {
		o.translate(cent.x, cent.y, cent.z);
	}

	return o;

},

/**Creates a new line as an Object3D
@function {public static mathnetics.Object3D} Line
@param {Array} points - an Array of mathnetics.point2D or mathnetics.point3D objects that define the line <strong>sequentially</strong>
@return a line through each of the points in the points array as an Object3D */
Line: function(points) {
	if(points instanceof Array) {
		var pts = new Array();
		var segments = new Array();
		for(var i = 0; i < points.length; i++) {
			if(points[i] instanceof mathnetics.point2D) {
				points[i] = points[i].make3D();
			}
			if(!(points[i] instanceof mathnetics.point3D)) {
				return false;
			}
			pts[i] = points[i];
			if(i != points.length - 1) {
				segments[i] = [i, i+1];
			}
		}
		return mathnetics.Object3D.create(pts, segments);
	}
	return null;
},

/**Creates a new 3D Object that is a segment of the x-axis.
@function {public static mathnetics.Object3D} Xaxis
@param {Number} min - the minimum x value
@param {Number} max - the maximum x value
@return the x-axis between min and max */
Xaxis: function(min, max) {
	return mathnetics.Object3D.Line([Line.x.pointAt(min), Line.x.pointAt(max)]);
},

/**Creates a new 3D Object that is the y-axis.
@function {public static mathnetics.Object3D} Yaxis
@param {Number} min - the minimum y value
@param {Number} max - the maximum y value
@return the y-axis between min and max */
Yaxis: function(min, max) {
	return mathnetics.Object3D.Line([Line.y.pointAt(min), Line.y.pointAt(max)]);
},

/**Creates a new 3D Object that is the z-axis.
@function {public static mathnetics.Object3D} Zaxis
@param {Number} min - the minimum z value
@param {Number} max - the maximum z value
@return the z-axis between min and max */
Zaxis: function(min, max) {
	return mathnetics.Object3D.Line([Line.z.pointAt(min), Line.z.pointAt(max)]);
}

});
