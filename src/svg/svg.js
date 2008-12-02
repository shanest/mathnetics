/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

/**Most of this SVG implementation from Keith Wood jQuery SVG: http://keith-wood.name/svg.html
but re-structured and other changes made to fit in mathnetics package
The mathnetics implementation frees the SVG manipulation from jQuery by recreating the core
functionality (DOM node selection, onDOMReady, etc.) required of jQuery. 
@namespace mathnetics.svg */

dependencies = ['util/util','util/Element']; //for browser sniffing and DOM select
mathnetics.require(dependencies);

mathnetics.extend(mathnetics.svg, {

	/**The class name to give to SVG-containing elements; defaults to "SVGDoc"
	@variable {public String} markerClass */
	markerClass: 'SVGDoc',
	/**The SVG namespace you wish to use; defaults to standard "http://www.w3.org/2000/svg"
	@variable {public static String} svgNS */
	svgNS: 'http://www.w3.org/2000/svg',
	/**The class name to give to elements when SVG not supported; defaults to "svg_error"
	@variable {public static String} errorClass */
	errorClass: 'svg_error',
	/**The text to display when a browser does not support SVG; defaults to "Sorry, your browser does not support SVG."
	@variable {public static String} notSupportedText */
	notSupportedText: 'Sorry, your browser does not support SVG.',

	_extensions: [],
	_settings: {},
	_cache: {},

	_registerSVG: function() {
		//called by blank.svg onload; i.e. only by IE
		for(var i = 0; i < document.embeds.length; i++) {
			var container = document.embeds[i].parentNode;
			if(!mathnetics.util.hasClass(container, mathnetics.svg.markerClass)) //not SVG
				continue;
			var svg = null;
			try {
				svg = document.embeds[i].getSVGDocument();
			} catch(e) {
				setTimeout('mathnetics.svg._registerSVG()', 250); //Renesis takes longer
				return;
			}
			svg = (svg ? svg.documentElement : null);
			if(svg) mathnetics.svg._afterLoad(container, svg);
		}
	},

	_afterLoad: function(container, svg, settings) {
		var settings = settings || mathnetics.svg._settings[container.id];
		if(svg instanceof mathnetics.util.Element) {
			var svg;
			if(settings.settings) {
				svg = svg.setAttrs(settings.settings);
			}
			svg = svg.toNS(mathnetics.svg.svgNS);
			container.appendChild(svg); 
		} else {
			if(settings.settings) {
				//IE set attributes
			}
		}
		mathnetics.svg._cache[ container.id ] = new mathnetics.svg.SVGWrapper(svg, container);
		if(settings.onLoad) {
			settings.onLoad.apply(container);
		}
	},

	/**Attaches an SVG canvas to a given DIV element.  Access the attached canvas with {@link mathnetics.svg.get}.
	@function {public static void} attach
	@param {DOMElement} container - the element in which to place the SVG canvas
	@param {optional Object} settings - object literal; onLoad provides a function to perform once canvas loaded, initPath for IE to blank.svg
	*/ 
	attach: function(container, settings) { 
		if(!container.nodeType) return null;
		if(mathnetics.util.hasClass(container, mathnetics.svg.markerClass)) return container; 
		container.className += (container.className ? " " : "") + mathnetics.svg.markerClass;
		if(mathnetics.util.browser.msie) {
			if(!container.id)
				container.id = 'svg' + new Date().getTime();

			mathnetics.svg._settings[container.id] = settings;
			//can specify path to blank.svg by initPath in settings object
			container.innerHTML = '<embed type="image/svg+xml" width="' +
						container.clientWidth + '" height="' + 
						container.clientHeight + '" src="' +
							(settings.initPath || '') + 'blank.svg"/>';

		} else if(document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#SVG','1.1') ||
				(mathnetics.util.browser.mozilla && parseInt(mathnetics.util.browser.version.substring(2)) >= 8) || //FF
				(mathnetics.util.browser.safari && parseInt(mathnetics.util.browser.version) >= 525)) { //Safari and Chrome
			var svg = new mathnetics.util.Element("svg");
			svg.setAttrs({"version": 1.1, "width": container.clientWidth, "height": container.clientHeight});
			mathnetics.svg._afterLoad(container, svg, settings);
		} else {
			container.innerHTML = '<p class="'+ mathnetics.svg.errorClass +'">' + mathnetics.svg.notSupportedText + '</p>';
		}
	},

	/**Returns the {@link mathnetics.svg.SVGWrapper} attached to a given element.
	@function {public static mathnetics.svg.SVGWrapper} mathnetics.svg.get
	@param {String} id - the "id" attribute of the element to which the canvas is attached
	@return the associated SVGWrapper; null if none exists */
	get: function(id) {
		return mathnetics.svg._cache[id] ? mathnetics.svg._cache[id] : null;
	},

	/**Adds an extension to all Mathnetics SVG canvases; see Plot.js for usage example.
	@function {public static void} mathnetics.svg.addExtension
	@param {String} name
	@param {Function} extClass
	*/
	addExtension: function(name, extClass) {
		this._extensions[this._extensions.length] = [name, extClass];
	},

/**This class provides a point-of-access for manipulating an SVG canvas as created by {@link mathnetics.svg.attach}.
There are helper functions (with more to be added) to carry out the basic duties needed in mathnetics.<br />
This class is instantiated by {@link mathnetics.svg.attach} and should not be instantiated otherwise.
@class mathnetics.svg.SVGWrapper
*/

	/**Constructor function. Should not be used on its own, but is called by {@link mathnetics.svg.attach}.
	@param {SVGDocumentElement} svg - the root svg element of the document/canvas
	@param {DOMElement} container - the containing div element 
	@constructor SVGWrapper
	*/
	SVGWrapper: function(svg, container) {
		this._svg = svg;
		this._container = container;
		for(var i = 0; i < mathnetics.svg._extensions.length; i++) {
			var ext = mathnetics.svg._extensions[i];
			this[ext[0]] = new ext[1](this);
		}
	}

});

mathnetics.extend(mathnetics.svg.SVGWrapper.prototype, {

	/**Makes a new line and attaches it to a parent node.
	@function {public SVGElement} line
	@param {SVGElement} parent - the SVG element to which to attach the line; pass <code>null</code> to attach to root document element
	@param {Number} x1 - start x value
	@param {Number} y1 - start y value
	@param {Number} x2 - end x value
	@param {Number} y2 - end y value
	@param {optional Object} settings - an object literal of attribute-value pairs to be settings for the line
	@return the created line element */
	line: function(parent, x1, y1, x2, y2, settings) {
		return this._makeNode(parent, "line", mathnetics.extend({'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2}, settings || {}));
	},

	/**Makes a new path and attaches it to a parent node.
	@function {public SVGElement} path
	@param {SVGElement} parent - the SVG element to which to attach the line; pass <code>null</code> to attach to root document element
	@param {String} p - the path string; see <a href="http://www.w3.org/TR/SVG/paths.html" target="blank">http://www.w3.org/TR/SVG/paths.html</a> for more info
	@param {optional Object} settings - an object literal of attribute-value pairs to be settings for the path
	@return the created path element */
	path: function(parent, p, settings) {
		return this._makeNode(parent, "path", mathnetics.extend({d: p}, settings || {}));
	},

	/**Makes a new group ("g" in SVG) and attaches it to a parent node. Normally used as a parent node to transform all children.
	@function {public SVGElement} group
	@param {SVGElement} parent - the SVG element to which to attach the group; pass <code>null</code> to attach to root document element
	@param {optional Object} settings - an object literal of attribute-value pairs to be settings for the group
	@return the created group element */
	group: function(parent, settings) {
		return this._makeNode(parent, 'g', settings || {});
	},

	/**Configures the settings for the root SVG element.
	@function {public mathnetics.svg.SVGWrapper} configure
	@param {Object} settings - an object literal of attribute-value pairs to be settings for the group
	@param {optional boolean} clear - if true, delete all current attributes values; defaults to false
	@return the same SVGWrapper object */
	configure: function(settings, clear) {
		if(clear) {
			var attrs = this._svg.attributes;
			for(var i = attrs.length - 1; i >= 0; i--) {
				var name = attrs[i].nodeName;
				if(!(name == 'onload' || name == 'version' || name.substring(0,5) == 'xmlns')) {
					attrs.removeNamedItem(attrs[i].nodeName);
				}
			}
		}
		for(var attr in settings) {
			this._svg.setAttribute(attr, settings[attr]);
		}
		return this;
	},

	/**Empties the SVG canvas, but does not remove canvas from container div.
	@function {public mathnetics.svg.SVGWrapper} clear
	@param {optional boolean} attrsToo - if true, removes attributes from root SVG element
	@return the same SVGWrapper object
	@see configure */
	clear: function(attrsToo) {
		if(attrsToo) {
			this.configure({}, true);
		}
		while(this._svg.firstChild) {
			this._svg.removeChild(this._svg.firstChild);
		}
		return this;
	},

	/**Makes and returns a new SVG element as specified. Used internally by most element creation methods.<br />
	Can be used to make SVG elements for which this class does not provide helper constructors as well.
	@function {private SVGElement} _makeNode
	@param {SVGElement} parent - the SVG element to which to attach the line; pass <code>null</code> to attach to root document element
	@param {String} tag - the name of the tag to create
	@param {optional Object} settings - an object literal of attribute-value pairs to be settings for the element 
	@return the created SVG element */
	_makeNode: function(parent, tag, settings) {
		parent = parent || this._svg;
		var node = (new mathnetics.util.Element(tag, settings)).toNS(mathnetics.svg.svgNS, this._svg.ownerDocument);
		parent.appendChild(node);
		return node;
	}

});
