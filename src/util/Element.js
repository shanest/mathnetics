/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

//SHOULD I: make a field of Element objects be an actual DOM element which gets manipulated directly??

/**The Element class is a wrapper class for basic DOM element manipulations.
@class mathnetics.util.Element
*/
mathnetics.extend(mathnetics.util, {
	/**Makes a new Element, a wrapper for DOM element manipulations.
	@constructor Element
	@param {String} name - the name of the tag you want to create; "img" i.e.
	@param {Object} settings - an object literal of key-value pair settings for the element; {src: "hello.jpg"}, i.e.
	*/
	Element: function(name, settings) {
		this.name = name;
		this.attributes = {};
		mathnetics.extend(this.attributes, settings);
		return this;
	}
});

mathnetics.extend(mathnetics.util.Element.prototype, {
	/**Sets a single attribute to a value.
	@function {public mathnetics.util.Element} setAttr
	@param {String} attr - the name of the attribute to set
	@param {String} val - the value to give to attr
	@return the same object
	*/
	setAttr: function(attr, val) {
		this.attributes[ attr ] = val;
		return this;
	},
	/**Sets multiple attributes at the same time.
	@function {public mathnetics.util.Element} setAttrs
	@param {Object} settings - an object literal of key-value pairs representing settings for your element
	@return the same object
	*/
	setAttrs: function(settings) {
		for(var attr in settings) {
			this.attributes[ attr ] = settings[ attr ];
		}
		return this;
	},
	/**Returns an actual DOM Element as specified.
	@function {public DOMElement} toHTML
	@return an element with the proper tag name and all specified attributes */
	toHTML: function() {
		var tag = document.createElement(this.name.toLowerCase());
		for(var attr in this.attributes) {
			tag.setAttribute(attr, this.attributes[ attr ]);
		}
		return tag;
	},
	/**Returns a DOM Element as specified and inside a given namespace.
	@function {public DOMElement} toNS
	@param {String} ns - the namespace in which to create the element
	@param {optional DOMElement} context - the context in which to create the element; default is document
	@return the namespaced element as specified */
	toNS: function(ns, context) {
		if(!context) context = document;
		var tag = context.createElementNS(ns, this.name.toLowerCase());
		for(var attr in this.attributes) {
			tag.setAttribute(attr, this.attributes[ attr ]);
		}
		return tag;
	}
});

mathnetics.extend(mathnetics.util.Element, {

	/**Make a new line element. Used heavily internally by mathnetics.gfx.SVG
	@function {public static mathnetics.util.Element} mathnetics.util.Element.Line
	@param {int} x1
	@param {int} y1
	@param {int} x2
	@param {int} y2
	@param {Object} settings - an object literal of key-value pairs representing settings for your element
	@see mathnetics.gfx.SVG
	*/
	Line: function(x1, y1, x2, y2, settings) {
		var l = new mathnetics.util.Element("line", {"x1": x1, "y1": y1, "x2": x2, "y2": y2});
		if(settings) l.setAttrs(settings);
		return l;
	}

});
