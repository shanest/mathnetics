/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

/**
Defines some utility methods, such as DOM Node selector, browser sniffing, and DOM ready testing.
@namespace mathnetics.util
*/
mathnetics.extend(mathnetics.util, {

/**
@function {public static DOMElement} mathnetics.util.select
Select a DOM Element.  This is largely adapted from jQuery's $ function.
Main differences: no select(html) handling and select(".class") adapted from Dustin Diaz
@param {String} selector - the selection criterion; either a DOM node, or a string of form: "#id" or ".class"
@param {optional DOMELement} context - for ".class" searches, the parent node below which to look 
@return a DOM Node: either the one with the ID specified, or an array of elements with the same class name; null if none */
select: function(selector, context) {
	// Make sure that a selection was provided
	selector = selector || document;

	// Handle $(DOMElement)
	if ( selector.nodeType ) 
		return selector;

	// Handle HTML strings
	if ( typeof selector == "string" ) {

		var quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/;
		// Are we dealing with HTML string or an ID?
		var match = quickExpr.exec( selector );

		// We do not deal with HTML strings, only #ID or .class
		// Verify a match, and that no context was specified for #id
		if ( match && !context ) {

			var elem = document.getElementById( match[3] );
			// Make sure an element was located
			if ( elem ){

				if(elem.id == match[3]) 
					return elem;
				else {
					// Handle the case where IE and Opera return items
					// by name instead of ID
					var byName = document.getElementsByName(match[3]);
					for(i = 0; i < byName.length; i++) {
						if(byName[i].id == match[3])
							return byName[i];
					}
				}

			}
			selector = [];

		}

		/**Return by class name 
		Adapted from Dustin Diaz http://dustindiaz.com/getelementsbyclass/
		Note this implementation does not allow for a tag name as well
		This was done in the interest of making one unifying select function */
		if(selector.charAt(0) == ".") {
			var theClass = selector.substring(1);
			var classEls =[];
			if(context == null)
				context = document;
			var els = context.getElementsByTagName("*");
			var elsLen = els.length;
			for(i = 0, j = 0; i < elsLen; i++) {
				if(mathnetics.util.hasClass(els[i],theClass)) {
					classEls[j] = els[i];
					j++;
				}
			}
			return classEls;
		}

	}
	
	return null;

},

/**Tests to see whether a dOM element has a given class name. Used internally by select, but also useful on its own.
@function {public static boolean} hasClass
@param {DOMElement} node - the DOM node to check whether or not has class
@param {String} cl - the class name for which to test
@return true iff node has class cl, false otherwise (null if node not an element)
*/
hasClass: function(node, cl) {
	if(!node.nodeType) return null;
	var pattern = new RegExp("(^|\\s)"+cl+"(\\s|$)");
	return pattern.test(node.className); 
}

});

var userAgent = navigator.userAgent.toLowerCase();

mathnetics.extend(mathnetics.util, {

	/** Browser sniffing as implemented in jQuery.	Primarily used in mathnetics.gfx for knowing how to handle SVG <br />
	NOTE: Google Chrome detected as mathnetics.util.browser.safari 
	@object mathnetics.util.browser */
	browser: {
		/**The version number of the browser. EXPLAIN HOW DETERMINED!
		@variable {public int} mathnetics.util.browser.version */
		version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
		/**Safari (or Chrome) or not?
		@variable {public boolean} mathnetics.util.browser.safari */
		safari: /webkit/.test(userAgent),
		/**Opera or not?
		@variable {public boolean} mathnetics.util.browser.opera */
		opera: /opera/.test(userAgent),
		/**Internet Explorer or not?
		@variable {public boolean} mathnetics.util.browser.msie */
		msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
		/**Mozilla or not?
		@variable {public boolean} mathnetics.util.browser.mozilla */
		mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)
	}

});

mathnetics.extend(mathnetics.util, {

/** Universal DOM Ready implementation adapted from Tanny O'Haley: http://tanny.ica.com/ICA/TKO/tkoblog.nsf/dx/domcontentloaded-for-browsers-part-v
NOTE: this object is largely undocumented in the API.  We recommend using {@link mathnetics.util.onDOMReady}.
If for some reason you need more direct control of the domReadyEvent object, the source code shows its internal workings
@object mathnetics.util.domReadyEvent 
@see mathnetics.util.onDOMReady */

domReadyEvent: {
	name: "mathnetics.util.domReadyEvent",
	// Array of DOMContentLoaded event handlers.
	events: {},
	domReadyID: 1,
	bDone: false,
	DOMContentLoadedCustom: null,

	// Function that adds DOMContentLoaded listeners to the array.
	add: function(handler) {
		// Assign each event handler a unique ID. If the handler has an ID, it
		// has already been added to the events object or been run.
		if (!handler.$$domReadyID) {
			handler.$$domReadyID = this.domReadyID++;

			// If the DOMContentLoaded event has happened, run the function.
			if(this.bDone){
				handler();
			}

			// store the event handler in the hash table
			this.events[handler.$$domReadyID] = handler;
		}
	},

	remove: function(handler) {
		// Delete the event handler from the hash table
		if (handler.$$domReadyID) {
			delete this.events[handler.$$domReadyID];
		}
	},

	// Function to process the DOMContentLoaded events array.
	run: function() {
		// quit if this function has already been called
		if (this.bDone) {
			return;
		}

		// Flag this function so we dont do the same thing twice
		this.bDone = true;

		// iterates through array of registered functions 
		for (var i in this.events) {
			this.events[i]();
		}
	},

	schedule: function() {
		// Quit if the init function has already been called
		if (this.bDone) {
			return;
		}
	
		// First, check for Safari or KHTML.
		if(/KHTML|WebKit/i.test(navigator.userAgent)) {
			if(/loaded|complete/.test(document.readyState)) {
				this.run();
			} else {
				// Not ready yet, wait a little more.
				setTimeout(this.name + ".schedule()", 100);
			}
		} else if(document.getElementById("__ie_onload")) {
			// Second, check for IE.
			return true;
		}

		// Check for custom developer provided function.
		if(typeof this.DOMContentLoadedCustom === "function") {
			//if DOM methods are supported, and the body element exists
			//(using a double-check including document.body, for the benefit of older moz builds [eg ns7.1] 
			//in which getElementsByTagName('body')[0] is undefined, unless this script is in the body section)
			if(typeof document.getElementsByTagName !== 'undefined' && (document.getElementsByTagName('body')[0] !== null || document.body !== null)) {
				// Call custom function.
				if(this.DOMContentLoadedCustom()) {
					this.run();
				} else {
					// Not ready yet, wait a little more.
					setTimeout(this.name + ".schedule()", 250);
				}
			}
		}

		return true;
	},

	init: function() {
		// If addEventListener supports the DOMContentLoaded event.
		if(document.addEventListener) {
			document.addEventListener("DOMContentLoaded", function() { mathnetics.util.domReadyEvent.run(); }, false);
		}

		// Schedule to run the init function.
		setTimeout("mathnetics.util.domReadyEvent.schedule()", 100);

		function run() {
			mathnetics.util.domReadyEvent.run();
		}
		
		// Just in case window.onload happens first, add it to onload using an available method.
		if(typeof addEvent !== "undefined") {
			addEvent(window, "load", run);
		} else if(document.addEventListener) {
			document.addEventListener("load", run, false);
		} else if(typeof window.onload === "function") {
			var oldonload = window.onload;
			window.onload = function() {
				mathnetics.util.domReadyEvent.run();
				oldonload();
			};
		} else {
			window.onload = run;
		}


		/** for Internet Explorer */
		/*@cc_on
			@if (@_win32 || @_win64)
			document.write("<script id=__ie_onload defer src=\"//:\"><\/script>");
			var script = document.getElementById("__ie_onload");
			script.onreadystatechange = function() {
				if (this.readyState == "complete") {
					mathnetics.util.domReadyEvent.run(); // call the onload handler
				}
			};
			@end
		@*/
	}
},

/**Executes a function (which itself could call many functions, i.e.) once the DOM is ready to be manipulated.
Very useful to wrap around functions that will manipulate the DOM
@function {public static void} mathnetics.util.onDOMReady
@param {Function} fn - the function to be executed when the DOM is ready
*/
onDOMReady: function(fn) {

	return mathnetics.util.domReadyEvent.add(fn);

}

});

mathnetics.util.domReadyEvent.init();
