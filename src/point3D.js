/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

dependencies = ['Vector', 'AffineTransform'];
mathnetics.require(dependencies);

/** The point3D class defines a point in 3-dimensional Euclidean space via homogeneous coordinates (i.e. as a 4-vector (x,y,z,1)).  This allows affine transformations to be applied to 3-D points via matrix multiplication.
@class mathnetics.point3D
@extends Vector
*/

mathnetics.point3D = function() {
	/**The x-value of the 3D point.
	@variable {private Number} x */
	this.x = 0;
	/**The y-value of the 3D point.
	@variable {private Number} y */
	this.y = 0;
	/**The z-value of the 3D point.
	@variable {private Number} z */
	this.z = 0;
	/**The "dimension" of the point; ALWAYS 3. Important that this.n == 3; gives "illusion" of 3-D vector while allowing multiplication by matrices with 4 columns for transformations
	@variable {private static int} n
	*/
	this.n = 3;
	/**The components of the 3D point [x,y,z,1].  This allows multiplication by affine transformation matrices and other useful Vector operations.
	@variable {Number[]} components */
	this.components = [this.x, this.y, this.z, 1];
};

mathnetics.extend(mathnetics.point3D.prototype, new Vector);

mathnetics.extend(mathnetics.point3D.prototype, {

/**Maps this point to a new 3D point according to a given function.  Overwrites the map function of the Vector class.
Used internally for things like addition, multiplication, dot products, etc.
@function {public mathnetics.point3D} map
@param {Function} func - the mapping function
@return the new, mapped point */
map: function(func) {
	var x = func(this.x, 0, 0);
	var y = func(this.y, 1, 0);
	var z = func(this.z, 2, 0);
	return mathnetics.point3D.create(x, y, z);
},

/**Rotates a 3D point through an angle phi about the x axis and returns a new 3D point.
@function {public mathnetics.point3D} rotateX
@param {Number} phi - the angle in radians to rotate the point
@return a new point3D object that has been rotated an angle phi around the x axis */
rotateX: function(phi) {
	var T = mathnetics.AffineTransform.create(3).rotationX(phi);
	return T.applyTo(this);
},

/**Rotates a 3D point through an angle theta about the y axis and returns a new 3D point.
@function {public mathnetics.point3D} rotateY
@param {Number} theta - the angle in radians to rotate the point
@return a new point3D object that has been rotated an angle theta around the y axis */
rotateY: function(theta) {
	var vec = mathnetics.AffineTransform.create(3).rotationY(theta);
	return T.applyTo(this);
},

/**Rotates a 3D point through an angle psi about the z axis and returns a new 3D point.
@function {public mathnetics.point3D} rotateZ
@param {Number} psi - the angle in radians to rotate the point
@return a new point3D object that has been rotated an angle psi around the z axis */
rotateZ: function(psi) {
	var T = mathnetics.AffineTransform.create(3).rotationZ(psi);
	return T.applyTo(this);
},

/**Rotates a point3D object through an angle theta about an arbitrary axis.
@function {public mathnetics.point3D} rotate
@param {Number} theta the degree (in radians) to rotate the point
@param {Object} axis the axis about which to rotate; either a point3D, 3-D Vector or 3D Array 
@return this point rotated theta degrees about axis */
rotate: function(theta, axis) {
	var T = mathnetics.AffineTransform.create(3).rotation(theta, axis);
	return T.applyTo(this);
},

/**Returns a new 3D point (x',y',z',1) = (x+dx,y+dy,z+dz,1).
@function {public mathnetics.point3D} translate
@param {Number} dx - the x translation
@param {Number} dy - the y translation
@param {Number} dz - the z translation
@return a new point3D object that is the original point translated */
translate: function(dx,dy,dz) {
	var T = mathnetics.AffineTransform.create(3).translate3D(dx,dy,dz);
	return T.applyTo(this);
},

/**Converts a point in Cartesian coordinates to spherical coordinates (r, psi, theta).
@function {public mathnetics.point3D} toSpherical
@return a new point3D (x,y,z,1) = (r (length), arctan(sqrt(x^2+y^2)/z), arctan(y/x)) */
toSpherical: function() {
	var r = this.getLength();
	var phi = Math.atan2(Math.sqrt(this.x*this.x + this.y*this.y),this.z);
	var theta = Math.atan2(this.y, this.x);
	return mathnetics.point3D.create(r, phi, theta);
},

/**Converts point3D object back to a Vector. Will no longer be homogeneous coordinates.
@function {public Vector} toVector
@return the vector [x,y,z] */
toVector: function() {
	return mathnetics.Vector([this.x,this.y,this.z]);
},

/**Resets x, y, z values of this point and updates components vector. Used by constructor.
@function {public mathnetics.point3D} setComponents
@paramset components
@param {Number} x - the x component
@param {Number} y - the y component
@param {Number} z - the z component
@paramset clone
@param {mathnetics.point3D} point - the point to clone
@return this point, updated */
setComponents: function(x, y, z) {
	if(x instanceof mathnetics.point3D) {
		return mathnetics.point3D.create(x.x, x.y, x.z);
	}

	this.x = x;
	this.y = y;
	this.z = z;
	this.components = [this.x, this.y, this.z, 1];

	return this;
},

/**Creates clone of current point.
@function {public mathnetics.point3D} dup
@return new point3D identical to this one */
dup: function() {
	return mathnetics.point3D.create(this.x, this.y, this.z);
},

/**Produces a string representation of the point.  Overwrites the toString function of the Vector class.
@function {public String} toString
@return the string (x,y,z) */
toString: function() {
	return "("+this.x+","+this.y+","+this.z+")";
}

});

/**Constructor function.  Makes a new 3D point (x,y,z,1).
@constructor mathnetics.point3D.create
@see mathnetics.point3D.setComponents */
mathnetics.point3D.create = function(x, y, z) {
	var p = new mathnetics.point3D();
	return p.setComponents(x, y, z);
};

mathnetics.extend(mathnetics.point3D, {
	/**A 3D point with coordinates (0,0,0).  A.k.a. "the origin"
	@variable {public static mathnetics.point3D} zero
	*/
	zero: mathnetics.point3D.create(0,0,0)
});
