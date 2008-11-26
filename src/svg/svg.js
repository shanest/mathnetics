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

/**
@class mathnetics.svg.SVGWrapper
*/

	/**
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

	line: function(parent, x1, y1, x2, y2, settings) {
		return this._makeNode(parent, "line", mathnetics.extend({'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2}, settings || {}));
	},

	path: function(parent, p, settings) {
		return this._makeNode(parent, "path", mathnetics.extend({d: p}, settings || {}));
	},

	group: function(parent, settings) {
		return this._makeNode(parent, 'g', settings || {});
	},

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

	clear: function(attrsToo) {
		if(attrsToo) {
			this.configure({}, true);
		}
		while(this._svg.firstChild) {
			this._svg.removeChild(this._svg.firstChild);
		}
		return this;
	},

	_makeNode: function(parent, tag, settings) {
		parent = parent || this._svg;
		var node = (new mathnetics.util.Element(tag, settings)).toNS(mathnetics.svg.svgNS, this._svg.ownerDocument);
		parent.appendChild(node);
		return node;
	}

});
