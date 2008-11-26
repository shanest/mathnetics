/**MathWorx Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

//Things to think about: depth sorting, sprite buttons to rotate camera, change focus, etc.

/**Scene3D defines a new 3D scene (shocking, I know).  A 3D Scene has two main components:
objects (to be displayed), and a camera (from which to view the objects).  In this model of a 3D
scene, the camera is the main mover, not the objects (though they can be moved).  A view plane is
defined through the origin with a normal in the direction from the origin to the camera; the 
objects are projected onto this view plane, which is then matched up with the 2D plane of the 
screen.<br />
Most methods return this, so calls can be made sequentially.
@class mathnetics.svg.Scene3D
*/

dependencies = ['point3D', 'Plane'];
mathnetics.require(dependencies);

mathnetics.extend(mathnetics.svg, {

/**The constructor function for a new Scene3D object.
@param {Array} objs an Array of Object3D objects to be displayed
@param {optional mathnetics.point3D} camera the position of the camera (as a point3D object); used to generate initial focus and view plane; also used to define this.camera = {loc: point3D, theta: angle, phi: angle}; default is (0,0,100)
@constructor Scene3D */
Scene3D: function(objs, svg, camera) {

	/**SVG canvas for Scene
	@variable {private mathnetics.gfx.SVGWrapper} svg */
	this.svg = svg;
	/**The "camera" is the point from which the objects are being viewed.  It is a dynamically defined Object with three properties: loc (mathnetics.point3D), theta (Number), and phi (Number).
	Theta is the angle between the positive x axis and the orthogonal projection of the camera onto the XY-plane.
	Phi is the angle between the camera and the positive z-axis.
	@variable {private Object} camera */
	this.camera = {loc: mathnetics.point3D.zero, theta: 0, phi: 0};
	/**The focus is the distance between the camera and the origin (in world coordinates)
	@variable {private Number} focus */
	this.focus = 0;
	/**The objects to be viewed/displayed. An array of Object3D objects.
	@variable {private mathnetics.Object3D[]} objects */
	this.objects = new Array();
	/**The view plane, onto which the objects are projected.
	@variable {private Plane} plane */
	this.plane = Plane.XY;

	if(camera) {
		if(camera instanceof mathnetics.point3D) {
			var iphi = Math.atan2(Math.sqrt(camera.x*camera.x + camera.y*camera.y), camera.z);
			var itheta = Math.atan2(camera.y, camera.x);
			this.camera = {loc: camera, theta: itheta, phi: iphi};
		}
	} else {
		this.camera = {loc: new mathnetics.point3D(0, 0, 100), theta: 0, phi: 0};
	}

	this.objects = objs;

	this.focus = this.camera.loc.getLength();
	//NOTE: this.camera.loc will be normalized by Plane constructor function
	this.plane = new Plane(mathnetics.point3D.zero, this.camera.loc); 

}

});

mathnetics.extend(mathnetics.svg.Scene3D.prototype, {

	/**Draws the 3D scene, with the specified objects. REQUIRES jQuery SVG.
	@param {Array} objs an array of object indices to be displayed. 
	@param {Object} svg the jQuery SVG object in which to draw the scene 
	@param {Object} settings the settings to give to each line of the objects; can be an Array of settings, where each index of the array corresponds to the index of the objects passed to this function */
	draw: function(objs, settings) {
		//this.depthSort();
		var objects = objs;
		var set;
		if(!(settings instanceof Array)) {
			set = settings;
		}
		for(var i = 0; i < objects.length; i++) {
			//after this, each object3D also has vertices2D array
			objects[i].viewIn(this.camera.theta, this.camera.phi).to2D(this.focus).draw(this.svg, (set ? set : settings[i]));
		}
	},

	/**Empties the SVG canvas supplied.
	@param {Object} svg the jQuery SVG root canvas 
	@return {Scene3D} this Scene3D object, so calls can be stringed together */
	emptySVG: function() {
		this.svg.clear();
		return this;
	},

	/**Sets the focus (distance between Origin and camera).
	@param {Number} dist the new focal distance
	@return {Scene3D} this Scene3D object, with updated focus distance and matching camera position */
	setFocus: function(dist) {
		this.focus = dist;
		this.camera.loc = this.camera.loc.multiplyBy(this.focus/this.camera.loc.getLength());
		return this;
	},

	/**Moves the camera to a new position.  Parameters are two angles, one in the XY-plane
	from the positive x-axis and the other from the positive z-axis.
	@param {Number} theta the degree (in radians) to rotate the camera from the positive x-axis
	@param {Number} phi the degree (in radians) to rotate the camera from the positive z-axis
	@return {Scene3D} this Scene3D object, with updated camera and view plane */
	rotateCamera: function(theta, phi) {
		var itheta = theta;
		var iphi = phi;
		var x = Math.sin(iphi)*Math.cos(itheta);
		var y = Math.sin(iphi)*Math.sin(itheta);
		var z = Math.cos(iphi);
		var norm = new mathnetics.point3D(x, y, z);
		this.plane = new Plane(mathnetics.point3D.zero, norm);
		this.camera = {loc: norm.multiplyBy(this.focus), theta: itheta, phi: iphi}; //creates a new mathnetics.point3D
		return this;
	},

/** FINISH THIS METHOD ONCE ALL THE REQUIRED METHODS / OBJECT3D ARE DEFINED
	depthSort: function() {
		var dist, mids;
		var faceDists = new Array();
		for(i = 0; i < this.objects.length; i++) {
			mids = this.objects[i].getMidpoints();
			for(j = 0; j < mids.length; j++) {
				dist = (this.camera.subtract(mids[i])).getLength();
				
			}
		}
	},
*/

	/**Add an object to the 3D Scene.
	@param {Object3D} obj the object to be added to the 3D Scene
	@return {Scene3D} this Scene3D, with the object added (returns null if obj is not an Object3D) */
	addObject: function(obj) {
		if(!(obj instanceof mathnetics.Object3D)) {
			return null;
		}
		this.objects.push(obj);
		return this;
	},

	/**Returns a string representation of the Scene (camera and objects).
	@return {String} the location of the camera plus a list of all the objects
	@see mathnetics.Object3D.toString */
	toString: function() {
		return "camera: " + this.camera.loc + "\n----------\nobjects:\n-----\n" +this.objects.join("\n----------\n");
	}

}); //end Scene3D prototype
