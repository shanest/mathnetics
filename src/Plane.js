/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

/**The Plane class provides a very useful definition of a plane.  A Plane object consists solely of a base point and a normal vector, thus implicitly representing the infinitude of a plane.
@class mathnetics.Plane
*/

dependencies = ['Line'];
mathnetics.require(dependencies);

mathnetics.Plane = function() {
	/**The "base" point of the plane. 
	@variable {private mathnetics.point3D} base */
	this.base = new mathnetics.point3D(0,0,0);
	/**The normal vector of the plane, which wholly defines the Plane along with the base point.
	@variable {private mathnetics.point3D} norm */
	this.norm = new mathnetics.point3D(0,0,0);
};

mathnetics.extend(mathnetics.Plane.prototype, {

	/**Tests whether two planes are equal.
	@function {public boolean} equalTo
	@param {Plane} plane - the plane to test for equality
	@return true if planes are equal, false otherwise */
	equalTo: function(plane) {
		return (this.contains(plane.base) && this.isParallel(plane));
	},

	/**Translates a plane by dx, dy and dz (normal does not change, only the base)
	@function {public Plane} translate
	@param {Number} dx - the x translation
	@param {Number} dy - the y translation
	@param {Number} dz - the z translation
	@return the translated plane as a new Plane object */
	translate: function(dx, dy, dz) {
		var base = mathnetics.point3D.create(this.base.x + dx, this.base.y + dy, this.base.z + dz);
		return mathnetics.Plane.create(base, this.norm);
	},

	/**Tests to see if the plane is parallel to a given Plane or Line.
	@function {public boolean} isParallel
	@paramset toPlane
	@param {Plane} plane - the plane to check to see if parallel
	@paramset toLine
	@param {Line} line - the line to check to see if parallel
	@return true if parallel, false otherwise */
	isParallel: function(obj) {
		if(obj instanceof mathnetics.Plane) {
			var theta = this.norm.angleBetween(obj.norm);
			return (Math.abs(theta) < mathnetics.zero || Math.abs(theta - Math.PI) < mathnetics.zero);
		} else if(obj instanceof mathnetics.Line) {
			return this.norm.isPerpendicular(obj.direction);
		} else {
			return null;
		}
	},

	/**Tests to see if two planes are perpendicular to each other.
	@function {public boolean} isPerpendicular
	@return true iff planes are perpendicular, false otherwise */
	isPerpendicular: function(plane) {
		return (Math.abs(this.norm.dot(plane.norm)) < mathnetics.zero);
	},

	/**Gets the distance of a plane, line or point from the plane.
	@function {public Number} distanceFrom
	@paramset fromPoint
	@param {mathnetics.point3D} point - the point to find the distance from this plane
	@paramset fromLine
	@param {Line} line - the line to find the distance from this plane
	@paramset fromPlane
	@param {Plane} plane - the plane to find the distance from this plane
	@return the distance between the plane and obj */
	distanceFrom: function(obj) {
		if(this.intersects(obj) || this.contains(obj)) {
			return 0;
		}
		if(obj.base) {
			return Math.abs(this.norm.dot(this.base.subtract(obj.base)));
		} else {
			return Math.abs(this.norm.dot(this.base.subtract(obj)));
		}
	},

	/**Tests if a line or point lies in the plane.
	@paramset Line
	@param {Line} line - the line to test
	@paramset Point
	@param {mathnetics.point3D} point - the point to test
	@paramset Plane
	@param {Plane} plane - the plane to test (only true if this.equalTo(plane)
	@return true if plane contains line or point (also true if obj is an equivalent plane) */
	contains: function(obj) {
		if(obj.norm) {
			return this.equalTo(obj);
		}
		if(obj.direction) {
			return (this.contains(obj.base) && this.contains(obj.base.add(obj.direction)));
		} else { //obj is a point
			return (this.distanceFrom(obj) < mathnetics.zero);
		}
	},

	/**Tests to see if a line or plane intersects with this plane.
	@function {public boolean} intersects
	@paramset Line
	@param {Line} line - the line to test
	@paramset Plane
	@param {Plane} plane - the plane to test
	@return true iff an intersection exists, false otherwise */
	intersects: function(obj) {
		if(typeof(obj.direction) == 'undefined' && typeof(obj.base) == 'undefined') {
			return null;
		}
		return (!this.isParallel(obj));
	},

	/**Gets the intersection of a plane with a given Line or Plane.
	@function {public Object} intersection
	@paramset Line
	@param {Line} line - the line with which to find the intersection 
	@paramset Plane
	@param {Plane} plane - the plane with which to find the intersection
	@return the intersection of this and obj: mathnetics.point3D (aka Vector) if obj is a Line, a Line if obj is a Plane */
	intersection: function(obj) {
		if(!this.intersects(obj)) {
			return null;
		}
		if(obj instanceof mathnetics.Line) { //obj is a line
			var mult = this.norm.dot(this.base.subtract(obj.base)) / this.norm.dot(obj.direction);
			var vec = obj.base.add(obj.direction.multiplyBy(mult));
			return mathnetics.point3D.create(vec.get(1),vec.get(2),vec.get(3));
		}
		if(obj instanceof mathnetics.Plane) {
			var direction = this.norm.cross(obj.norm).normalize();
			var B = this.base, N = this.norm, O = obj.norm, C = obj.base;
			//To find a base point, find one coordinate that has a value of 0
			//somewhere on the intersection, and remember which one we picked
			var solver = Matrix.zero(2,2), i = 0;
			while(solver.isSingular()) {
				i++;
				solver = new Matrix([
					[ N.get((i%3)+1), N.get((i+1)%3 +1) ],
					[ O.get((i%3)+1), O.get((i+1)%3 +1) ]
				]);
			}
			//Then we solve the simultaneous equations in the remaining dimensions
			var inverse = solver.invert();
			var x = N.dot(B), y = O.dot(C);
			var intersection = [
				inverse.get(1,1)*x + inverse.get(1,2)*y,
				inverse.get(2,1)*x + inverse.get(2,2)*y
			];
			var base = new Array();
			for(var j = 1; j <=3; j++) {
				//This formula picks the right element from intersection by
				//cycling depending on which element we set to 0 above
				base.push((i == j) ? 0 : intersection[(j + (5-i)%3)%3]);
			}
			return mathnetics.Line.create(mathnetics.Vector.create(base), direction);
		}
	},

	/**Finds the point in the plane closest to the given point.
	@function {public mathnetics.point3D} pointClosestTo
	@param {mathnetics.point3D} point - (can also be a 3D Vector) the point to which to find the closest point in the plane
	@return mathnetics.point3D or Vector (depending on type of point above) that is the closest point on the plane to point */
	pointClosestTo: function(point) {
		if(!(point instanceof mathnetics.point3D || point instanceof mathnetics.Vector)) {
			return null;
		}
		var P = point, B = this.base, N = this.norm;
		var dot = B.subtract(P).dot(N);
		var vec = P.add(N.multiplyBy(dot));
		if(point instanceof mathnetics.point3D) {
			return mathnetics.point3D.create(vec.get(1), vec.get(2), vec.get(3));
		} else if(point instanceof mathnetics.Vector) {
			return mathnetics.Vector.create(vec);
		}
	},

	/**Rotates a plane through deg degrees about an arbitrary line.
	@function {public Plane} rotate
	@param {Number} deg - the number of degrees (in radians) to rotate the plane
	@param {Line} line - the Line about which to rotate the plane
	@return a new Plane that is the old rotated deg about line */
	rotate: function(deg, line) {
		var C = line.pointClosestTo(this.base), B = this.base, N = this.norm;
		var P = B.subtract(C);
		var newB = C.add(P.rotate(deg, line));
		var newN = N.rotate(deg, line);
		return mathnetics.Plane.create(newB, newN);
	},

	/**Resets the base and normal vectors of the Plane. Called by constructor.
	@function {public mathnetics.Plane} setVectors
	@paramset Clone
	@param {Plane} plane - the Plane object to duplicate
	@paramset Normal
	@param {mathnetics.point3D} base - the base point of the plane; if a Plane object, will create a duplicate of the plane
	@param {mathnetics.point3D} norm - (can also be a 3D Vector) the normal vector if only one vector is supplied
	@paramset Two Vectors
	@param {mathnetics.point3D} base - the base point of the plane; if a Plane object, will create a duplicate of the plane
	@param {mathnetics.point3D} v1 - (can also be a 3D Vector) one of two vectors that determines the normal
	@param {mathnetics.point3D} v2 - (can also be a 3D Vector) from two vectors, the normal becomes (v1 cross v2)
	@return this Plane, updated */
	setVectors: function(base, v1, v2) {

		if(base instanceof mathnetics.Plane) {
			return mathnetics.Plane.create(base.base, base.norm);
		}

		if(!(base.dimension() && v1.dimension())) {
			return null;
		}
		if(base.n > 3 || v1.n > 3) {
			return null;
		}
	
		if(base.n == 2) {
			//handles mathnetics.point2D or Vector object
			this.base = mathnetics.point3D.create(base.get(1), base.get(2), 0);
		} else {
			if(base instanceof mathnetics.point3D) {
				this.base = mathnetics.point3D.create(base);
			} else if(base instanceof mathnetics.Vector) {
				this.base = mathnetics.point3D.create(base.get(1), base.get(2), base.get(3));
			}
		}

		if(v2) {
			this.norm = v1.cross(v2).normalize().toPoint();
		} else {
			this.norm = v1.normalize().toPoint();
		}

		return this;

	},

	/**Returns a string representation of the Plane.
	@function {public String} toString
	@return the string version of the plane */
	toString: function() {
		return "base: " + this.base + ", normal: " + this.norm;
	}

}); //end Plane prototype

/**The constructor function for a new Plane.
@constructor mathnetics.Plane 
@see mathnetics.Plane.create */
mathnetics.Plane.create = function(base, v1, v2) {
	var P = new mathnetics.Plane();
	return P.setVectors(base, v1, v2);
};

mathnetics.extend(mathnetics.Plane, {
	/**The XY-plane.  Base = (0,0,0), Direction = Vector.k
	@variable {public static Plane} XY */
	XY: mathnetics.Plane.create(mathnetics.point3D.zero, Vector.k),
	/**Same as Plane.XY
	@variable {public static Plane} YX 
	@see Plane.XY */
	YX: mathnetics.Plane.XY,
	/**The YZ-plane.  Base = (0,0,0), Direction = Vector.i
	@variable {public static Plane} YZ */
	YZ: mathnetics.Plane.create(mathnetics.point3D.zero, Vector.i),
	/**Same as Plane.YZ
	@variable {public static Plane} ZY
	@see Plane.YZ */
	ZY: mathnetics.Plane.YZ,
	/**The ZX-plane.  Base = (0,0,0), Direction = Vector.j
	@variable {public static Plane} ZX */
	ZX: mathnetics.Plane.create(mathnetics.point3D.zero, Vector.j),
	/**Same as Plane.ZX
	@variable {public static Plane} XZ
	@see Plane.ZX */
	XZ: mathnetics.Plane.ZX
});
