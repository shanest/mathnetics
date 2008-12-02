/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

/** @project Mathnetics
@author Shane Steinert-Threlkeld
@version 0.1.0
@description Mathnetics API is a JavaScript library of mathematical objects that can be used for quite advanced applications.
It includes 3D rendering onto an SVG canvas that works cross-browser on and off-line; see the documentation for mathnetics.svg.
Mathnetics will also be a full-fledge GUI editor for interactive math pages, based on the libraries seen here.
Dual licensed under GPL and MIT licenses (see included text files)
*/

/**
@namespace mathnetics
The root namespace in which all Mathnetics-specific objects fall.  Note that universal mathematical objects, such as 
Vector, Plane, Matrix, Line, etc. are global objects.
The mathnetics namespace also defines a few constants, such as {@link mathnetics.zero zero} (used for roundoff error) and {@link mathnetics.phi phi}.
*/
var mathnetics = (function() {

	/**The path to the directory containing all the JS files; can be a URL or a relative path 
	@variable {private String} pathToHere
	*/
	var pathToHere = "http://cis.jhu.edu/~shanest/js/mathnetics/src/";
	/**The names of the files to automatically load whenever mathnetics.js is loaded (['Matrix','svg/svg'], i.e.) 
	@variable {private Array} autoLoad
	*/
	var autoLoad = [];
	/**The path to image icons.  See SceneButton.js to see and/or change specific file names.
	@variable {private String} toButtons
	*/
	var toButtons = "http://cis.jhu.edu/~shanest/js/mathnetics/src/svg/buttons/";

	/** List of already included files */
	var includes = [];

	/** Includes a file in an HTML document.  There MUST be a <head> tag in the HTML document as that is where the <script> tag will be added.
	Will only include a file once so that it does not get loaded multiple times.
	This function is called by mathnetics.require.
	*/
	function include(file) {
		for(var i = 0; i < includes.length; i++) {
			if(includes[i] == file) {
				return;
			}
		}
		var script = document.createElement("script");
		script.setAttribute("type","text/javascript");
		script.setAttribute("src",file);
		var head = document.getElementsByTagName("head")[0];
		head.insertBefore(script, head.firstChild);
		includes.push(file);
	}

	return {
		/**The value of zero to use in cases of roundoff error, etc. Defaults to 10^-6
		@variable {float} zero
		*/
		zero: 1e-6,
		/**The so-called "Golden Ratio" that occurs frequently in nature.
		Also the limit of the ratio between two successive Fibonacci numbers.
		Equals (1 + sqrt(5)) / 2 
		@variable {float} phi
		*/
		phi: (1 + Math.sqrt(5)) / 2,

		/**The version number of mathnetics.
		@variable {String} version
		*/
		version: "0.1.0",
		/**Public reference to toButtons
		@variable {String} pathToButtons 
		*/
		pathToButtons: toButtons,

		/**General object extension function.  Will extend the target object with all of the
		attributes of an object as passed to the function. See files in util and gfx for example usage.
		@function {public Object} extend
		@param {optional Object} target - the object to extend; if none specified, extends mathnetics
		@param {Object} options - the properties, as an object literal, to add to the target object
		@return the target object, extended/updated with options
		*/
		extend: function() {
			var len = arguments.length, target = arguments[0], options;
			if(len == 1) {
				target = this;
				options = arguments[0];
			} else {
				options = arguments[1];
			}
			for(var name in options) {
				target[ name ] = options[ name ];
			}
			return target;			
		},
	
		/** Includes all of the files in a supplied array (autoLoad for example). Used frequently internally
		to require all dependent files when one is loaded by user.
		@function {public void} require
		@param {Array} dependsOn - the array of filenames to be included; ['Matrix','gfx/SVG.js'], i.e.*/
		require: function(dependsOn) {
			for(i = 0, len = dependsOn.length; i < len; i++) {
				include(pathToHere + '' + dependsOn[i] + '.js');
			}
		},

		/**Requires all the files specified in autoLoad. Called automatically by mathnetics.js.
		@function {public void} load
		*/
		load: function() {
			this.require(autoLoad);
		}
		
	};
})();

mathnetics.extend({
	util: { },
	svg: { }
});

mathnetics.load();
