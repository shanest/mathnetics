/**MathWorx Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

(function() { //used for scoping

/**This class defines various buttons (images with javascript actions) to change/rotate the Scene3D and re-draw it.<br />
The icons used are Sanscons from Some Random Dude.  See: http://somerandomdude.net/srd-projects/sanscons<br />
You must have a CSS file (our default is SceneButton.css) and include it in your HTML document with a &lt;link rel='stylesheet' type='text/css' href='SceneButton.css' /&gt; tag.  
The default class used for buttons is "button", but you may define your own as you see fit and specify them as a parameter in your function calls.<br />
For more info, see the static method documentation below.  An example call of a specific button:
<blockquote><code>
SceneButton.rotateZp(document.getElementById("button"), svg, scene, Math.PI/8, [{stroke: 'black', 'stroke-width': .25}, {stroke: 'red', 'stroke-width': .125}, {stroke: 'green', 'stroke-width': .125}, {stroke: 'blue', 'stroke-width': .125}], true);
</code></blockquote>
To change the images displayed for each button, edit SceneButton.js with the according images (mathnetics.pathToButtons variable is set in mathnetics.js).  The "button" class is defined in SceneButton.css, bt you can define your own classes however you desire; for usage of the default button set here, see <a href="http://somerandomdude.net/srd-projects/sanscons">Sancsons</a>
@class mathnetics.svg.SceneButton
*/

var interval;
var active = true;
var defaultClass = "button";
var img_zoomIn = mathnetics.pathToButtons + 'zoomin.gif';
var img_zoomOut = mathnetics.pathToButtons + 'zoomout.gif';
var img_rotateZp = mathnetics.pathToButtons + 'arrow1_e.gif';
var img_rotateZn = mathnetics.pathToButtons + 'arrow1_w.gif';
var img_rotateXYp = mathnetics.pathToButtons + 'arrow1_n.gif';
var img_rotateXYn = mathnetics.pathToButtons + 'arrow1_s.gif';
var img_rotateNW = mathnetics.pathToButtons + 'arrow1_nw.gif';
var img_rotateNE = mathnetics.pathToButtons + 'arrow1_ne.gif';
var img_rotateSW = mathnetics.pathToButtons + 'arrow1_sw.gif';
var img_rotateSE = mathnetics.pathToButtons + 'arrow1_se.gif';

mathnetics.extend(mathnetics.svg, {

/**The constructor function for a new SceneButton.  Should never be used, but is called by static SceneButton methods.
@constructor SceneButton */
SceneButton: function(parent, scene, continuous, img, func, cl) {

	var node = document.createElement("img");
	node.setAttribute("src",img);
	if(cl) {
		node.setAttribute("class",cl);
	} else {
		node.setAttribute("class","button");
	}
	if(continuous == true) {
		node.setAttribute("onclick","mathnetics.svg.SceneButton.toggle(\""+func+"\")");
	} else {
		node.setAttribute("onclick",func);
	}
	parent.appendChild(node);

}

});

mathnetics.extend(mathnetics.svg.SceneButton, {
/**Toggles animation of the scene.  Called if continuous parameter is set to true.
There is only one animation variable, so each animation happens on its own.
Makes it so that when animation button is clicked, it will start/stop animation.
@function {public static void} toggle
@param {String} func - the string representation of the function to be executed when animated. */
toggle: function(func) {
	if(active == true) {
		interval = setInterval(func,'50');
		active = false;
	} else {
		clearInterval(interval);
		active = true;
	}
},

/**Makes all the buttons and appends them to the parent DOM node. For most parameters, see any of the individual button methods.
@function {public static void} makeAll
@param {Number} zStep - the increment to zoom by for the zoomIn/zoomOut buttons
@param {Number} rStep - the increment (radians) to use for the rotation methods 
@see zoomIn 
@see zoomOut
@see rotateZp
@see rotateZn
@see rotateXYp
@see rotateXYn
@see rotateNE
@see rotateNW
@see rotateSE
@see rotateSW */
makeAll: function(parent, svg, scene, zStep, rStep, settings, continuous, cl) {
	mathnetics.svg.SceneButton.zoomIn(parent, svg, scene, zStep, settings, continuous, cl);
	mathnetics.svg.SceneButton.zoomOut(parent, svg, scene, zStep, settings, continuous, cl);
	mathnetics.svg.SceneButton.rotateZp(parent, svg, scene, rStep, settings, continuous, cl);
	mathnetics.svg.SceneButton.rotateZn(parent, svg, scene, rStep, settings, continuous, cl);
	mathnetics.svg.SceneButton.rotateXYp(parent, svg, scene, rStep, settings, continuous, cl);
	mathnetics.svg.SceneButton.rotateXYn(parent, svg, scene, rStep, settings, continuous, cl);
	mathnetics.svg.SceneButton.rotateNE(parent, svg, scene, rStep, settings, continuous, cl);
	mathnetics.svg.SceneButton.rotateNW(parent, svg, scene, rStep, settings, continuous, cl);
	mathnetics.svg.SceneButton.rotateSE(parent, svg, scene, rStep, settings, continuous, cl);
	mathnetics.svg.SceneButton.rotateSW(parent, svg, scene, rStep, settings, continuous, cl);
},

/**Zooms in on the objects in the Scene3D. 
@function {public static mathnetics.svg.SceneButton} zoomIn
@param {DOMElement} parent - the DOM node that will be the parent of the button image
@param {mathnetics.svg.SVGWrapper} svg - your SVG wrapper variable
@param {mathnetics.svg.Scene3D} scene - your Scene3D object variable
@param {Number} step - the increment to zoom in by each time
@param {Object} settings - object literal of settings
@param {optional boolean} continuous - true if want animation; false by default
@param {optional String} cl - the class name to give your image tags; defaults to "button" as defined in SceneButton.css.  Must specify a boolean for continuous if want to use this parameter
@return a new SceneButton (an image tag with proper attributes and onclick), by calling SceneButton.zoom
@see zoom */
zoomIn: function(parent, svg, scene, step, settings, continuous, cl) {
	return mathnetics.svg.SceneButton.zoom(parent, svg, scene, step, '-', settings, continuous, cl);
},


/**Zooms out on the objects in the Scene3D. 
@function {public static mathnetics.svg.SceneButton} zoomOut
@param {DOMElement} parent - the DOM node that will be the parent of the button image
@param {mathnetics.svg.SVGWrapper} svg - your SVG wrapper variable
@param {mathnetics.svg.Scene3D} scene - your Scene3D object variable
@param {Number} step - the increment to zoom out by each time
@param {Object} settings - object literal of settings
@param {optional boolean} continuous - true if want animation; false by default
@param {optional String} cl - the class name to give your image tags; defaults to "button" as defined in SceneButton.css.  Must specify a boolean for continuous if want to use this parameter
@return a new SceneButton (an image tag with proper attributes and onclick), by calling SceneButton.zoom
@see zoom */
zoomOut: function(parent, svg, scene, step, settings, continuous, cl) {
	return mathnetics.svg.SceneButton.zoom(parent, svg, scene, step, '+', settings, continuous, cl);
},

/**For specification of most parameters, see {@link #zoomIn} or {@link #zoomOut}.  
@function {public static mathnetics.svg.Scene3D} zoom
@param {DOMElement} parent
@param {mathnetics.svg.SVGWrapper} svg
@param {mathnetics.svg.Scene3D} scene
@param {Number} step
@param {String} sign - '+' for zooming out, '-' for zooming in
@param {Object} settings
@param {optional boolean} continuous
@param {optional String} cl
@return the specified button */
zoom:  function(parent, svg, scene, step, sign, settings, continuous, cl) {
	var img;
	if(sign == '-') {
		img = img_zoomIn;
	} else if(sign == '+') {
		img = img_zoomOut;
	}
	var funcString = ''+scene+'.emptySVG().setFocus('+scene+'.focus '+sign+' '+step+').draw('+scene+'.objects, '+settings+')';
	var cont = false;
	if(continuous)  {
		cont = continuous;
	}
	var cla = defaultClass;
	if(cl) {
		cla = cl;
	}
	return new mathnetics.svg.SceneButton(parent, scene, cont, img, funcString, cla);
},

/**Creates a button responsible for positive rotation about the Z-axis.
@function {public static mathnetics.svg.SceneButton} rotateZp 
@param {DOMElement} parent - the DOM node that will be the parent of the button image
@param {mathnetics.svg.SVGWrapper} svg - your SVG wrapper variable
@param {mathnetics.svg.Scene3D} scene - your Scene3D object variable
@param {Number} step - the increment to rotate by each time
@param {Object} settings - object literal of settings
@param {optional boolean} continuous - true if want animation; false by default
@param {optional String} cl - the class name to give your image tags; defaults to "button" as defined in SceneButton.css.  Must specify a boolean for continuous if want to use this parameter
@return a new SceneButton (an image tag with proper attributes and onclick), by calling SceneButton.rotateZ
@see rotateZ */
rotateZp: function(parent, svg, scene, step, settings, continuous, cl) {
	return mathnetics.svg.SceneButton.rotateZ(parent, svg, scene, step, '-', settings, continuous, cl);
},

/**Creates a button responsible for negative rotation about the Z-axis.
@function {public static mathnetics.svg.SceneButton} rotateZn
@param {DOMElement} parent - the DOM node that will be the parent of the button image
@param {mathnetics.svg.SVGWrapper} svg - your SVG wrapper variable
@param {mathnetics.svg.Scene3D} scene - your Scene3D object variable
@param {Number} step - the increment to rotate by each time
@param {Object} settings - object literal of settings
@param {optional boolean} continuous - true if want animation; false by default
@param {optional String} cl - the class name to give your image tags; defaults to "button" as defined in SceneButton.css.  Must specify a boolean for continuous if want to use this parameter
@return a new SceneButton (an image tag with proper attributes and onclick), by calling SceneButton.rotateZ
@see rotateZ */
rotateZn: function(parent, svg, scene, step, settings, continuous, cl) {
	return mathnetics.svg.SceneButton.rotateZ(parent, svg, scene, step, '+', settings, continuous, cl);
},

/**For specification of most parameters, see {@link rotateZp} or {@link rotateZn}.  
@function {public static SceneButton} rotateZ
@param {DOMElement} parent
@param {mathnetics.svg.SVGWrapper} svg
@param {mathnetics.svg.Scene3D} scene
@param {Number} step
@param {String} sign - '+' for negative rotation, '-' for positive rotation
@param {Object} settings
@param {optional boolean} continuous
@param {optional String} cl
@return the specified button */
rotateZ: function(parent, svg, scene, step, sign, settings, continuous, cl) {
	var img;
	if(sign == '-') {
		img = img_rotateZp;
	} else if(sign == '+') {
		img = img_rotateZn;
	}
	var funcString = ''+scene+'.emptySVG('+svg+').rotateCamera('+scene+'.camera.theta '+sign+' ' +step+ ', '+scene+'.camera.phi).draw('+scene+'.objects, '+settings+')';
	var cont = false;
	if(continuous)  {
		cont = continuous;
	}
	var cla = defaultClass;
	if(cl) {
		cla = cl;
	}
	return new mathnetics.svg.SceneButton(parent, scene, cont, img, funcString, cla);
},

/**Creates a button responsible for positive rotation about the XY-plane.
@function {public static mathnetics.svg.SceneButton} rotateXYp
@param {DOMElement} parent - the DOM node that will be the parent of the button image
@param {mathnetics.svg.SVGWrapper} svg - your SVG wrapper variable
@param {mathnetics.svg.Scene3D} scene - your Scene3D object variable
@param {Number} step - the increment to rotate by each time
@param {Object} settings - object literal of settings
@param {optional boolean} continuous - true if want animation; false by default
@param {optional String} cl - the class name to give your image tags; defaults to "button" as defined in SceneButton.css.  Must specify a boolean for continuous if want to use this parameter
@return a new SceneButton (an image tag with proper attributes and onclick), by calling SceneButton.rotateZ
@see rotateXY */
rotateXYp: function(parent, svg, scene, step, settings, continuous, cl) {
	return mathnetics.svg.SceneButton.rotateXY(parent, svg, scene, step, '+', settings, continuous, cl);
},

/**Creates a button responsible for negative rotation about the XY-plane.
@function {public static mathnetics.svg.SceneButton} rotateXYn
@param {DOMElement} parent - the DOM node that will be the parent of the button image
@param {mathnetics.svg.SVGWrapper} svg - your SVG wrapper variable
@param {mathnetics.svg.Scene3D} scene - your Scene3D object variable
@param {Number} step - the increment to rotate by each time
@param {Object} settings - object literal of settings
@param {optional boolean} continuous - true if want animation; false by default
@param {optional String} cl - the class name to give your image tags; defaults to "button" as defined in SceneButton.css.  Must specify a boolean for continuous if want to use this parameter
@return a new SceneButton (an image tag with proper attributes and onclick), by calling SceneButton.rotateZ
@see rotateXY */
rotateXYn: function(parent, svg, scene, step, settings, continuous, cl) {
	return mathnetics.svg.SceneButton.rotateXY(parent, svg, scene, step, '-', settings, continuous, cl);
},

/**For specification of most parameters, see {@link rotateXYp} or {@link rotateXYn}.  
@function {public static mathnetics.svg.SceneButton} rotateXY
@param {DOMElement} parent
@param {mathnetics.svg.SVGWrapper} svg
@param {mathnetics.svg.Scene3D} scene
@param {Number} step
@param {String} sign - '-' for negative rotation, '+' for positive rotation
@param {Object} settings
@param {optional boolean} continuous
@param {optional String} cl
@return {SceneButton} the specified button */
rotateXY: function(parent, svg, scene, step, sign, settings, continuous, cl) {
	var img;
	if(sign == '+') {
		img = img_rotateXYp;
	} else if(sign == '-') {
		img = img_rotateXYn;
	}
	var funcString = ''+scene+'.emptySVG('+svg+').rotateCamera('+scene+'.camera.theta, '+scene+'.camera.phi ' +sign+ ' ' +step+ ').draw('+scene+'.objects, '+settings+')';
	var cont = false;
	if(continuous)  {
		cont = continuous;
	}
	var cla = defaultClass;
	if(cl) {
		cla = cl;
	}
	return new mathnetics.svg.SceneButton(parent, scene, cont, img, funcString, cla);
},

/**Creates a button responsible for "North-east" (positive around Z and XY) rotation. 
@function {public static mathnetics.svg.SceneButton} rotateNE
@param {DOMElement} parent - the DOM node that will be the parent of the button image
@param {mathnetics.svg.SVGWrapper} svg - your SVG wrapper variable
@param {mathnetics.svg.Scene3D} scene - your Scene3D object variable
@param {Number} step - the increment to rotate by each time
@param {Object} settings - object literal of settings
@param {optional boolean} continuous - true if want animation; false by default
@param {optional String} cl - the class name to give your image tags; defaults to "button" as defined in SceneButton.css.  Must specify a boolean for continuous if want to use this parameter
@return a new SceneButton (an image tag with proper attributes and onclick), by calling SceneButton.rotateZ
@see rotate */
rotateNE: function(parent, svg, scene, step, settings, continuous, cl) {
	return mathnetics.svg.SceneButton.rotate(parent, svg, scene, step, '+', '-', settings, continuous, cl);
},

/**Creates a button responsible for "North-west" (positive around Z, negative around XY) rotation. 
@function {public static mathnetics.svg.SceneButton} rotateNW
@param {DOMElement} parent - the DOM node that will be the parent of the button image
@param {mathnetics.svg.SVGWrapper} svg - your SVG wrapper variable
@param {mathnetics.svg.Scene3D} scene - your Scene3D object variable
@param {Number} step - the increment to rotate by each time
@param {Object} settings - object literal of settings
@param {optional boolean} continuous - true if want animation; false by default
@param {optional String} cl - the class name to give your image tags; defaults to "button" as defined in SceneButton.css.  Must specify a boolean for continuous if want to use this parameter
@return a new SceneButton (an image tag with proper attributes and onclick), by calling SceneButton.rotateZ
@see rotate */
rotateNW: function(parent, svg, scene, step, settings, continuous, cl) {
	return mathnetics.svg.SceneButton.rotate(parent, svg, scene, step, '-', '-', settings, continuous, cl);
},

/**Creates a button responsible for "South-east" (negative around Z, positive around XY) rotation. 
@function {public static mathnetics.svg.SceneButton} rotateSE
@param {DOMElement} parent - the DOM node that will be the parent of the button image
@param {mathnetics.svg.SVGWrapper} svg - your SVG wrapper variable
@param {mathnetics.svg.Scene3D} scene - your Scene3D object variable
@param {Number} step - the increment to rotate by each time
@param {Object} settings - object literal of settings
@param {optional boolean} continuous - true if want animation; false by default
@param {optional String} cl - the class name to give your image tags; defaults to "button" as defined in SceneButton.css.  Must specify a boolean for continuous if want to use this parameter
@return a new SceneButton (an image tag with proper attributes and onclick), by calling SceneButton.rotateZ
@see rotate */
rotateSE: function(parent, svg, scene, step, settings, continuous, cl) {
	return mathnetics.svg.SceneButton.rotate(parent, svg, scene, step, '+', '+', settings, continuous, cl);
},

/**Creates a button responsible for "South-west" (negative around Z and XY) rotation. 
@function {public static mathnetics.svg.SceneButton} rotateSW
@param {DOMElement} parent - the DOM node that will be the parent of the button image
@param {mathnetics.svg.SVGWrapper} svg - your SVG wrapper variable
@param {mathnetics.svg.Scene3D} scene - your Scene3D object variable
@param {Number} step - the increment to rotate by each time
@param {Object} settings - object literal of settings
@param {optional boolean} continuous - true if want animation; false by default
@param {optional String} cl - the class name to give your image tags; defaults to "button" as defined in SceneButton.css.  Must specify a boolean for continuous if want to use this parameter
@return a new SceneButton (an image tag with proper attributes and onclick), by calling SceneButton.rotateZ
@see rotate */
rotateSW: function(parent, svg, scene, step, settings, continuous, cl) {
	return mathnetics.svg.SceneButton.rotate(parent, svg, scene, step, '-', '+', settings, continuous, cl);
},

/**For specification of most parameters, see {@link rotateNW}, {@link rotateNE}, {@link rotateSW} or {@link rotateSE}.  
@function {public static mathnetics.svg.SceneButton} rotate
@param {DOMElement} parent
@param {mathnetics.svg.SVGWrapper} svg
@param {mathnetics.svg.Scene3D} scene
@param {Number} step
@param {String} xySign '+' or '-' for the direction of the rotation about XY plane ({@link #rotateXY})
@param {String} zSign '+' or '-' for the direction of the rotation about Z axis ({@link #rotateZ})
@param {Object} settings
@param {optional boolean} continuous
@param {optional String} cl
@return the specified button */
rotate: function(parent, svg, scene, step, xySign, zSign, settings, continuous, cl) {
	var img;
	switch(xySign) {
		case "+":
			switch(zSign) {
				case "-":
					img = img_rotateNE;
					break;
				case "+":
					img = img_rotateSE;
					break;
			}
			break;
		case "-":
			switch(zSign) {
				case "-":
					img = img_rotateNW;
					break;
				case "+":
					img = img_rotateSW;
					break;
			}
			break;
	}
	var funcString = ''+scene+'.emptySVG('+svg+').rotateCamera('+scene+'.camera.theta ' +xySign+ ' ' +step+ ', '+scene+'.camera.phi ' +zSign+ ' ' +step+ ').draw('+scene+'.objects, '+settings+')';
	var cont = false;
	if(continuous)  {
		cont = continuous;
	}
	var cla = defaultClass;
	if(cl) {
		cla = cl;
	}
	return new mathnetics.svg.SceneButton(parent, scene, cont, img, funcString, cla);
}

});

})()
