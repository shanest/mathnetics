/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

/**The Line class defines a new object type for a line.  It is in a sense a "point-slope" definition of a line.
A Line has a base point and a direction, the direction being a unit vector.
This is an effective way of defining a line in a way that does not limit it to any specific segment and allows for Affine Transformations to be applied.
@class Line
*/

dependencies = ['point2D','point3D'];
mathnetics.require(dependencies);

/**The constructor function for a new Line.  If only a Line object is supplied as a parameter, a duplicate of that Line will be created.
@paramset standard
@param {Vector} base - the base point of the Line; can be a mathnetics.point2D, mathnetics.point3D or Vector (of dimension 2 or 3) object.  The actual base point of the Line will be a point3D object.
@param {Vector} direction the direction of the Line; can be a mathnetics.point2D, mathnetics.point3D or Vector.  Actual direction will be a normalized point3D object.
@paramset clone
@param {Line} line - the line to clone as a new one
@constructor Line */
function Line(base, direction) {

	if(base instanceof Line) {
		return new Line(base.base, base.direction);
	}

	/**The "anchor" point.
	@variable {mathnetics.point3D} base */
	this.base = new mathnetics.point3D(0,0,0);
	/**The direction of the line; will be a unit vector. Use mathnetics.point3D object for this to allow Affine Transformations.
	@variable {mathnetics.point3D} direction */
	this.direction = new mathnetics.point3D(0,0,0);

	if(!(base.dimension() && direction.dimension())) {
		return null;
	}
	if(base.n > 3 || direction.n > 3) {
		return null;
	}

	if(base.n == 2) {
		//handles mathnetics.point2D or Vector object
		this.base = new mathnetics.point3D(base.get(1), base.get(2), 0);
	} else {
		if(base instanceof mathnetics.point3D) {
			this.base = new mathnetics.point3D(base);
		} else if(base instanceof Vector) {
			this.base = new mathnetics.point3D(base.get(1), base.get(2), base.get(3));
		}
	}

	if(direction.n == 2) {
		this.direction = (new mathnetics.point3D(base.get(1), base.get(2), 0)).normalize();
	} else {
		if(direction instanceof mathnetics.point3D) {
			this.direction = (new mathnetics.point3D(direction)).normalize();
		} else if(direction instanceof Vector) {
			this.direction = (new mathnetics.point3D(direction.get(1), direction.get(2), direction.get(3))).normalize();
		}
	}

}

Line.prototype = {

	/**Tests two lines for equality.  Will return true if line is parallel or antiparallel.
	@function {public boolean} equalTo
	@param {Line} line - the line to compare
	@return true if line has same base point and is parallel or antiparallel */
	equalTo: function(line) {
		return (this.isParallel(line) && this.contains(line.base));
	},

	/**Tests to see if a point lies on the line.
	@function {public boolean} contains
	@param {mathnetics.point3D} point - the point to test
	@return true iff point is on line, false otherwise */
	contains: function(point) {
		var d = this.distanceFrom(point);
		return (d != null && d < mathnetics.zero);
	},

	/**Tests to see if a line is parallel to another line or plane.
	@function {public boolean} isParallel
	@paramset Line
	@param {Line} line - Line with which to test parallelity
	@paramset Plane
	@param {Plane} plane - a Plane, with which to test parallelity
	@return true if parallel or anti-parallel, false otherwise */
	isParallel: function(obj) {
		//if(obj instanceof Plane)
		var theta = this.direction.angleBetween(obj.direction);
		return (Math.abs(theta) < mathnetics.zero || Math.abs(theta - Math.PI) < mathnetics.zero);
	},

	//For distanceFrom and pointClosestTo, thanks goes out to: http://web.uct.ac.za/courses/end107w/notes/closestpoint.pdf

	/**Gets the distance between a line and another line, plane, or a point.
	@function {public Number} distanceFrom
	@paramset Line
	@param {Line} line
	@paramset Plane
	@param {Plane} plane - not implemented yet!
	@paramset Point
	@param {mathnetics.point3D} point - can also be a mathnetics.point2D
	@return the distance between object and the line; 0 if two lines have same base or one contains the base of the other */
	distanceFrom: function(obj) {
		/*if(obj instanceof Plane) {

		}*/
		if(obj instanceof Line) {
			if(this.isParallel(obj)) {
				return this.distanceFrom(obj.base);
			}
			var norm = this.direction.cross(obj.direction).normalize();
			var d = this.base.subtract(obj.base);
			return Math.abs(d.dot(norm));
		} else { //obj is a point
			var point = obj;
			if(obj instanceof mathnetics.point2D) {
				point = point.make3D();
			}
			var pointDist = point.subtract(this.base);
			var pointLength = pointDist.getLength();
			if(pointLength == 0) { 
				return 0;
			}
			var cosT = pointDist.dot(this.direction) / pointLength;
			var sin2 = 1 - cosT * cosT;
			return Math.abs(pointLength * Math.sqrt(sin2 < 0 ? 0 : sin2));
		}
	},

	/**Returns the point on the line at a given value of t.
	@function {public mathnetics.point3D} pointAt
	@param {Number} t - the time value at which to find the point on the line 
	@return this.base + t*this.direction */
	pointAt: function(t) {
		return this.base.add(this.direction.multiplyBy(t));
	},

	/**Finds the point on this line closest to a given line or point.
	@function {public mathnetics.point3D} pointClosestTo
	@paramset Line
	@param {Line} line - the line from which to find the closest point on this line
	@paramset Point
	@param {Vector} point - a mathnetics.point2D/3D (or Vector)
	@return the point on the original line closes to obj */
	pointClosestTo: function(obj) {
		if(obj instanceof Line) {
			if(this.intersects(obj)) {
				return this.intersection(obj);
			}
			if(this.isParallel(obj)) {
				return null;
			}
			var norm = this.direction.cross(obj.direction);
			var p = new Plane(obj.base, norm);
			return p.intersection(this);
		} else if(obj.dimension()) {
			var p = obj;
			if(obj instanceof mathnetics.point2D) {
				p = obj.make3D();
			}
			if(p instanceof Vector && p.n == 2) {
				p = p.make3D().toPoint();
			}
			if(this.contains(p)) {
				return p;
			}
			var plane = new Plane(p, this.direction);
			return plane.intersection(this);
		} else {
			return null;
		}		
	},

	/**Rotates a line through an angle about an arbitrary line.  Be careful, rotation axis' direction affects the outcome!
	@function {public Line} rotate
	@param {Number} deg - the degrees, in radians, to rotate the line
	@param {Line} line - the line about which to rotate this line
	@return a new line that is the old one rotated */
	rotate: function(deg, line) {
		var C = line.pointClosestTo(this.base);
		var base = C.add(this.base.subtract(C).rotate(deg,line.direction));
		var direction = this.direction.rotate(deg,line.direction);
		return new Line(base, direction);
	},

	/**Returns the line's reflection in the given point, line, or plane.
	@function {public Line} reflectionIn
	@paramset Plane
	@param {Plane} plane - the plane in which to reflect
	@paramset Line
	@param {Line} line
	@paramset point
	@param {mathnetics.point3D} point - can also be a point2D or Vector
	@return a new line, the old one reflected in obj */
	reflectionIn: function(obj) {
		if(obj instanceof Plane) {
			var B = this.base, D = this.direction;
			var newB = this.base.reflectionIn(obj);
			var BD = B.add(D);
			var Q = obj.pointClosestTo(BD);
			var newD = Q.multiplyBy(2).subtract(BD).subtract(newB);
			return new Line(newB, newD);
		}
		if(obj instanceof Line) {
			return this.rotate(Math.PI, obj);
		}
		if(obj.dimension()) {
			return new Line(this.base.reflectionIn(obj), this.direction);
		}
	},

	/**Tests if a Line lies in a given Plane.
	@function {public boolean} liesIn
	@param {Plane} plane - the plane which may or may not contain this Line
	@return true iff Line lies in plane, false otherwise */
	liesIn: function(plane) {
		return plane.contains(this);
	},

	/**Tests if this line intersects with a given line or plane.
	@function {public boolean} intersects
	@paramset Plane
	@param {Plane} plane
	@paramset Line
	@param {Line} line - to test for intersection with the line
	@return true if there is a unique intersection point between the line and the given line or plane, false otherwise */
	intersects: function(obj) {
		if(obj instanceof Plane) {
			return obj.intersects(this);
		}
		if(!(obj instanceof Line)) {
			return null;
		}
		return (!this.isParallel(obj) && this.distanceFrom(obj) < mathnetics.zero);
	},

	/**Finds the UNIQUE intersection of a line and another Line or Plane.
	@function {public mathnetics.point3D} intersection
	@paramset Plane
	@param {Plane} plane - not implemented yet!
	@paramset Line
	@param {Line} line 
	@return the intersection point (null if obj does not intersect with line) */
	intersection: function(obj) {
		//if(obj instanceof Plane)
		if(!this.intersects(obj)) {
			return null;
		}
		var p = this.base, x = this.direction, q = obj.base, y = obj.direction;
		var psubq = p.subtract(q);
		var xdotqsubp = -x.dot(psubq);
		var ydotpsubq = y.dot(psubq);
		var xdotx = x.dot(x), ydoty = y.dot(y), xdoty = x.dot(y);
		var k = (xdotqsubp * ydoty / xdotx + xdoty * ydotpsubq) / (ydoty - xdoty * xdoty);
		return p.add(x.multiplyBy(k));
	},

	/**Returns a new Line that is the old one translated by dx, dy, and dz.  Note that direction does not change in a translation, only the base point.
	@function {public Line} translate
	@param {Number} dx - the x translation
	@param {Number} dy - the y translation
	@param {Number} dz - the z translation
	@return a new Line, the old one translated */
	translate: function(dx, dy, dz) {
		var base = this.base.translate(dx, dy, dz);
		return new Line(base, this.direction);
	},

	/**Returns a string representation of the Line.
	@function {public String} toString
	@return the string representation of the line, containing all relevant info */
	toString: function() {
		return "base: " +this.base+ ", direction: " + this.direction;
	}

} //end Line prototype

/**The x-axis.  Base: (0,0,0), Direction: Vector.i
@variable {public static Line} x */
Line.x = new Line(mathnetics.point3D.zero, Vector.i);
/**The y-axis.  Base: (0,0,0), Direction: Vector.j
@variable {public static Line} y */
Line.y = new Line(mathnetics.point3D.zero, Vector.j);
/**The z-axis.  Base: (0,0,0), Direction: Vector.k
@variable {public static Line} z */
Line.z = new Line(mathnetics.point3D.zero, Vector.k);
