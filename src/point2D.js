/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

dependencies = ['Vector', 'AffineTransform'];
mathnetics.require(dependencies);

/**The point2D class defines a point in 2-dimensional Euclidean space via homogeneous coordinates (i.e. as a 3-vector (x,y,1)).  This allows affine transformations to be applied to 2-D points via matrix multiplication.
@class mathnetics.point2D
@extends mathnetics.Vector
*/

mathnetics.point2D = function() {
	/**The x value of the 2D point.
	@variable {private Number} x */
	this.x = 0;
	/**The y value of the 2D point.
	@variable {private Number} y */
	this.y = 0;
	/**The "dimension" of the point; ALWAYS 2. Important that this.n != 3; gives "illusion" of 2-D vector while allowing multiplication by matrices with 3 columns for transformations
	@variable {private static int} n
	*/
	this.n = 2;
	/**The components of the 2D point.  This allows multiplication by affine transformation matrices and other useful Vector operations.
	@variable {Number[]} components */
	this.components = [this.x, this.y, 1];
};

mathnetics.extend(mathnetics.point2D.prototype, new mathnetics.Vector);

mathnetics.extend(mathnetics.point2D.prototype, {

/**Maps this point to a new 2D point according to a given function.  Overwrites the map function of the Vector class.
Used internally for things like addition, multiplication, dot products, etc.
@function {public mathnetics.point2D} map
@param {Function} func - the mapping function
@return the new, mapped point */
map: function(func) {
	var x = func(this.x, 0, 0);
	var y = func(this.y, 1, 0);
	return mathnetics.point2D.create(x, y);
},

/**Rotates a point through a degree theta and returns a new point.
@function {public mathnetics.point2D} rotate
@param {Number} theta - the degree (in radians) by which to rotate the point
@return a new point that is the old rotated through an angle theta */
rotate: function(theta) {
	var T = mathnetics.AffineTransform.create(2).rotate2D(theta);
	return T.applyTo(this);
},

/**Translates a point (x,y,1) to (x+dx, y+dy, 1).
@function {public mathnetics.point2D} translate
@param {Number} dx - the x translation
@param {Number} dy - the y translation
@return a new point that is the old one translated */
translate: function(dx, dy) {
	var T = mathnetics.AffineTransform.create(2).translate2D(dx, dy);
	return T.applyTo(this);
},

/**Converts a 2D point to a 3D point with a 0 z-component.
@function {public mathnetics.point3D} make3D
@returns the 3D point */
make3D: function() {
	return mathnetics.point3D.create(this.x,this.y,0);
},

/**Converts point2D object back to a Vector.  Will no longer be homogeneous coordinates.
@function {public Vector} toVector
@return the vector [x,y] */
toVector: function() {
	return mathnetics.Vector.create([this.x,this.y]);
},

/**Resets the x and y values of the point2D
@function {public mathnetics.point2D} setComponents
@paramset components
@param {Number} x - the x component; if x is a point2D object, will create a duplicate of the point
@param {Number} y - the y component
@paramset clone
@param {mathnetics.point2D} point - the point to clone
@return this point, updated
*/
setComponents: function(x, y) {
	if(x instanceof mathnetics.point2D) {
		return mathnetics.point2D.create(x.get(1), x.get(2));
	}

	this.x = x;
	this.y = y;
	this.components = [this.x, this.y, 1];

	return this;
},

/**Clones current point.
@function {public mathnetics.point2D} dup
@return a new point identical to this one */
dup: function() {
	return mathnetics.point2D.create(this.x, this.y);
},

/**Produces a string representation of the point.  Overwrites the toString function of the Vector class.
@function {public String} toString
@return the string (x,y) */
toString: function() {
	return "("+this.x+","+this.y+")";
}

});

/**Constructor function.  Makes a new 2D point (x,y,1).
@constructor mathnetics.point2D.create 
@see mathnetics.point2D.setComponents */
mathnetics.point2D.create = function(x, y) {
	var p = new mathnetics.point2D();
	return p.setComponents(x,y);
};

mathnetics.extend(mathnetics.point2D, {
	/**The 2-D "origin" (0,0)
	@variable {public static mathnetics.point2D} zero */
	zero: mathnetics.point2D.create(0,0)
});
