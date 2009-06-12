/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

/**
This is a class that specifies special matrices that are affine transformations of homogeneous coordinates and allows them to be applied to point2D and point3D objectss.
This class is primarily used internally by the point2D and point3D classes, but can also be called as such, for example:<br />
<code>
var T = new AffineTransform(3).rotationX(Math.PI);<br />
var p3D = T.applyTo(new mathnetics.point3D(1,1,1));<br />
</code>
The transformation methods return the current AffineTransform object, allowing compound transformation.  Compound transformations are handled in reverse order.  For example: <br />
<code>
var T = new AffineTransform(3).rotationX(Math.PI).translate3D(1,1,1);<br />
var p3D = T.applyTo(new mathnetics.point3D(1,1,1));
</code><br />
represents the following operation:<br />
<code>
p3D = (translate3D(1,1,1) x rotationX(Math.PI)) x (1,1,1,1);<br />
p3D =<br />
 	([1 0 0 1] [1 0 0 0] ) [1]<br />
	([0 1 0 1] [0 -1 0 0]) [1]<br />
	([0 0 1 1] [0 0 -1 0]) [1]<br />
	([0 0 0 1] [0 0 0 1] ) [1]<br />
(NOTE: [1 1 1 1] is the column matrix representation of the new point3D(1,1,1) object)
</code><br />
Note that the transformation methods update the current AffineTransform object (allowing compound transformations) while the invert() method creates a new AffineTransform object with the opposite transformation as its matrix.
@class AffineTransform
*/

dependencies = ['Matrix'];
mathnetics.require(dependencies);

mathnetics.AffineTransform = function() {

	/**The dimension of the transformation (1 less than dimension of matrix).
	@variable {private int} dim */
	this.dim = 0;
	/**The transformation matrix that will be created when specific methods are called.
	@variable {private Matrix} matrix */
	this.matrix = mathnetics.Matrix.create();

}

mathnetics.extend(mathnetics.AffineTransform.prototype, {

	/**Applies the transformation to a {@link mathnetics.point2D} or {@link mathnetics.point3D} object.
	@function {public Object} applyTo
	@paramset 2D
	@param {mathnetics.point2D} point
	@paramset 3D
	@param {mathnetics.point3D} point
	@return a point2D or point3D object, depending on the dimension called */
	applyTo: function(point) {
		var vec = mathnetics.Vector.create(point.components); //includes the extra "1" component in vector, which toVector does not
		return this.matrix.multiply(vec).toPoint();
	},

	/**Tests to see if an Affine Transformation is invertible.
	@function {public boolean} invertible
	@return true iff invertible, false otherwise */
	invertible: function() {
		var M = this.matrix.minor(1,1,this.dim,this.dim);
		return M.invertible();
	},

	/**Inverts an Affine Transformation.  This function IS different from inverting a Matrix.
	See: http://en.wikipedia.org/wiki/Affine_transformation#properties_of_affine_transformations
	@function {public AffineTransform} invert
	@return a <strong>new</strong> AffineTransform object that does the inverse transformation of the original */
	invert: function() {
		if(!this.invertible()) {
			return null;
		}
		var T = mathnetics.AffineTransform.create(this.dim);
		T.matrix = this.matrix;
		var M = T.matrix.minor(1,1,this.dim,this.dim);
		var V = T.matrix.minor(1,this.dim+1,this.dim,1).toVector();
		M = M.invert();
		V = M.multiply(V).negative();
		T.matrix = M.augment(V.toColumnMatrix());
		//Add the bottom row to the matrix
		T.matrix.components[this.dim] = Vector.zero(this.dim);
		T.matrix.setElement(this.dim+1,this.dim+1,1);
		return T;
	},
	
	/** Creates a 3D translation matrix (4x4).  To be applied to a 3D point (x,y,z,1) as such: (x',y',z',1) = translate3D*(x,y,z,1)
	@function {public AffineTransform} translate3D
	@param {Number} tx - the x-coordinate translation
	@param {Number} ty - the y-coordinate translation
	@param {Number} tz - the z-coordinate translation
	@return this AffineTransform object, with the matrix updated to the translate3D matrix */
	translate3D: function(tx, ty, tz) {
		if(typeof this.matrix.components[0] == 'undefined' || this.matrix.numCols() != 4 ) {
			this.matrix = mathnetics.Matrix.I(4);
		}
		for(i = 1; i <= arguments.length; i++) {
			this.matrix.setElement(i,4,this.matrix.get(i,4)+arguments[i-1]);
		}
		return this;
	},

	/** Creates a 2D translation matrix (3x3).  To be applied to a 2D point (x,y,1) as such: (x',y',1) = translate2D*(x,y,1)
	@function {public AffineTransform} translate2D
	@param {Number} tx - the x-coordinate translation
	@param {Number} ty - the y-coordinate translation
	@param {Number} tz - the z-coordinate translation
	@return this AffineTransform object, with updated matrix */
	translate2D: function(tx, ty) {
		if(typeof this.matrix.components[0] == 'undefined' || this.matrix.numCols() != 3 ) {
			this.matrix = mathnetics.Matrix.I(3);
		}
		for(i = 1; i <= arguments.length; i++) {
			this.matrix.setElement(i,3,this.matrix.get(i,3)+arguments[i-1]);
		}
		return this;
	},

	//Rotation matrices largely taken from the derivations at: http://www.fastgraph.com/makegames/3drotaion/

	/**Creates a rotation matrix about an arbitrary axis. If no axis supplied, assume 2D rotation of theta in XY-plane
	@function {public AffineTransform} rotation
	@paramset Point
	@param {Number} theta - the number of degrees (in <strong>radians</strong>) to rotate
	@param {optional mathnetics.point3D} axis - the axis (point3D) about which to rotate
	@paramset Vector
	@param {Number} theta - the number of degrees (in <strong>radians</strong>) to rotate
	@param {optional Vector} axis - the axis (3-D Vector) about which to rotate
	@paramset Line
	@param {Number} theta - the number of degrees (in <strong>radians</strong>) to rotate
	@param {optional Line} axis - the axis (Line) about which to rotate
	@paramset Array
	@param {Number} theta - the number of degrees (in <strong>radians</strong>) to rotate
	@param {optional Number[]} axis - the axis (length 3 Array) about which to rotate
	@return {AffineTransform} this AffineTransform object */
	rotation: function(theta, axis) {
		var c = Math.cos(theta), s = Math.sin(theta), t = 1 - c;
		var axis;
		if(!axis) {
			return this.rotate2D(theta);
		}
		if(axis instanceof Line) {
			axis = mathnetics.point3D.create(axis.direction.subtract(axis.base));
		}
		if(axis instanceof Array) {
			axis = mathnetics.Vector.create(axis);
		}
		if(axis.n != 3) {
			return null;
		}
		axis = axis.normalize();
		var x = axis.components[0], y = axis.components[1], z = axis.components[2];
		var M = new Matrix([
			[t*x*x + c, t*x*y + s*z, t*x*z - s*y, 0],
			[t*x*y - s*z, t*y*y + c, t*y*z + s*x, 0],
			[t*x*z + s*y, t*y*z - s*x, t*z*z + c, 0],
			[0, 0, 0, 1]
		]).snapTo(0);
		if(typeof this.matrix.components[0] == 'undefined' || this.matrix.numCols() != 4 ) {
			this.matrix = mathnetics.Matrix.I(4);
		}
		this.matrix = M.multiply(this.matrix);
		return this;
	},

	/**Rotates a point (x,y,1) about the angle theta in the xy-plane.  Note that this is the same as Math.rotationZ in one less dimension.
	@function {public AffineTransform} rotate2D
	@param {Number} theta - the degrees (in radians) to rotate the point by
	@return this AffineTransform object, with updated matrix
	@see rotationZ */
	rotate2D: function(theta) {
		var c = Math.cos(theta), s = Math.sin(theta);
		var M = mathnetics.Matrix.I(3);
		M.setElement(1,1,c);
		M.setElement(1,2,-s);
		M.setElement(2,1,s);
		M.setElement(2,2,c);
		if(typeof this.matrix.components[0] == 'undefined' || this.matrix.numCols() != 3 ) {
			this.matrix = mathnetics.Matrix.I(3);
		}
		this.matrix =  M.snapTo(0).multiply(this.matrix);
		return this;
	},

	//Special case rotations around each of the three standard axes.  Applied to a point (x,y,z,1).

	/**Rotates a point (x,y,z,1) through an angle phi about the x-axis.
	@function {public AffineTransform} rotationX
	@param {Number} phi - the degrees (in radians) to rotate the point by
	@return this AffineTransform object, with updated matrix */
	rotationX: function(phi) {
		var c = Math.cos(phi), s = Math.sin(phi);
		var M = mathnetics.Matrix.I(4);
		M.setElement(2,2,c);
		M.setElement(3,3,c);
		M.setElement(2,3,s);
		M.setElement(3,2,-s);
		if(typeof this.matrix.components[0] == 'undefined' || this.matrix.numCols() != 4 ) {
			this.matrix = mathnetics.Matrix.I(4);
		}
		this.matrix = M.snapTo(0).multiply(this.matrix);
		return this;
	},

	/**Rotates a point (x,y,z,1) through an angle theta about the y-axis.
	@function {public AffineTransform} rotationY
	@param {Number} phi - the degrees (in radians) to rotate the point by
	@return this AffineTransform object, with updated matrix */
	rotationY: function(theta) {
		var c = Math.cos(theta), s = Math.sin(theta);
		var M = mathnetics.Matrix.I(4);
		M.setElement(1,1,c);
		M.setElement(1,3,-s);
		M.setElement(3,1,s);
		M.setElement(3,3,c);
		if(typeof this.matrix.components[0] == 'undefined' || this.matrix.numCols() != 4 ) {
			this.matrix = mathnetics.Matrix.I(4);
		}
		this.matrix = M.snapTo(0).multiply(this.matrix);
		return this;
	},

	/**Rotates a point (x,y,z,1) through an angle psi about the z-axis.
	@function {public AffineTransform} rotationZ
	@param {Number} phi - the degrees (in radians) to rotate the point by
	@return this AffineTransform object, with updated matrix */
	rotationZ: function(psi) {
		var c = Math.cos(psi), s = Math.sin(psi);
		var M = mathnetics.Matrix.I(4);
		M.setElement(1,1,c);
		M.setElement(1,2,-s);
		M.setElement(2,1,s);
		M.setElement(2,2,c);
		if(typeof this.matrix.components[0] == 'undefined' || this.matrix.numCols() != 4 ) {
			this.matrix = mathnetics.Matrix.I(4);
		}
		this.matrix = M.snapTo(0).multiply(this.matrix);
		return this;
	},

	/**Transforms a point in Euler coordinates to a new coordinate system, defined by a normal vector from the origin.
	The new coordinate system is defined by two angles: theta (from positive x-axis in XY-plane) and phi (from positive z-axis).
	These angles define the direction from the origin of the new x-axis.
	The y and z axes are defined by the plane formed with this point as a normal that goes through the origin.
	This model is used because it <strong>does not rotate the object</strong>.
	The matrix constructed is:<br/>
	[cos(theta)*sin(phi), sin(theta)*sin(phi), cos(phi), 0]<br/>
	[-sin(theta), cos(theta), 0, 0]<br/>
	[-cos(theta)*cos(phi), -sin(theta)*cos(phi), sin(phi), 0]<br/>
	[0, 0, 0, 1]
	@function {public AffineTransform} newCoordinates
	@param {Number} theta - the degree (in radians) on the XY-plane to the normal vector
	@param {Number} phi - the degree in radians from the positive z axis to the normal vector 
	@return this AffineTransform object, with updated matrix */
	newCoordinates: function(theta, phi) {
		var cphi = Math.cos(phi), ctheta = Math.cos(theta);
		var sphi = Math.sin(phi), stheta = Math.sin(theta);
		var M = mathnetics.Matrix.I(4);
		M.setElement(1,1, ctheta*sphi);
		M.setElement(1,2,stheta*sphi);
		M.setElement(1,3,cphi);
		M.setElement(2,1,-stheta);
		M.setElement(2,2, ctheta);
		M.setElement(3,1,-ctheta*cphi);
		M.setElement(3,2,-stheta*cphi);
		M.setElement(3,3,sphi);
		if(typeof this.matrix.components[0] == 'undefined' || this.matrix.numCols() != 4 ) {
			this.matrix = mathnetics.Matrix.I(4);
		}
		this.matrix = M.snapTo(0).multiply(this.matrix);
		return this;
	},

	/**Clones the current AffineTransformation, including matrix. Useful for saving intermediate levels of transformation sequences.
	@function {public mathnetics.AffineTransform} dup
	@return the cloned AffineTransform */
	dup: function() {
		var AT = mathnetics.AffineTransform.create(this.dim);
		AT.matrix = this.matrix.dup();
		return AT;
	}

	/**Returns a string representation of the Affine Transformation matrix.
	@function {public String} toString
	@return the string representation of this transformation's matrix 
	@see Matrix.toString */
	toString: function() {
		return this.matrix.toString();
	}

}); //end AffineTransform prototype

/**Construct a new AffineTransform object, which contains a dimension, a transformation matrix (set by instance methods), and the applyTo method. Note, calling new mathnetics.AffineTransform() and then setting dim works.
@param {int} dim - the dimension (2 or 3) of the Affine Transformation.
@constructor mathnetics.AffineTransform.create */
mathnetics.AffineTransform.create = function(dim) {
	var AT = new mathnetics.AffineTransform();
	AT.dim = dim;
	return AT;
};
