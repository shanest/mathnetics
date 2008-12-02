/*Mathnetics
Shane Steinert-Threlkeld
Copyright (c) 2008
*/

(function() { //for scope

mathnetics.svg.addExtension('plot',SVGPlot);

/**This object adds function plotting functionality to {@link mathnetics.svg.SVGWrapper}. Its methods are accessed as follows:
<pre>
var svg = mathnetics.svg.get("SVGContainer");
svg.plot.plot2D(parameters)
</pre>
If svg/Plot.js is included in an HTML file, every instance of {@link mathnetics.svg.SVGWrapper} has this extension. 
@object mathnetics.svg.SVGWrapper.plot
*/

function SVGPlot(svg) {
	/**The root SVG element.
	@variable {private static SVGDocumentElement} svg */
	this.svg = svg;
	/**The number of points to use in the plot. Defaults to 600.
	@variable {private int} numpoints
	@see numPoints */
	this.numpoints = '600';

	/**Minimum y value of the viewing window.
	@variable {private Number} ymin */
	this.ymin = 0;
	/**Maximum y value of the viewing window.
	@variable {private Number} ymax */
	this.ymax = 0;
	/**Minimum x value of the viewing window.
	@variable {private Number} xmin */
	this.xmin = 0;
	/**Maximum x value of the viewing window.
	@variable {private Number} xmax */
	this.xmax = 0;
	/**Width of the viewing window; computed for convenience.
	@variable {private Number} width */
	this.width;
	/**Height of the viewing window; computed for convenience.
	@variable {private Number} height */
	this.height;
	/**Middle x value; used for viewport adjustments.
	@variable {private Number} midx */
	this.midx;
	/**Middle y value; used for viewport adjustments.
	@variable {private Number} midy */
	this.midy;
	/**Y axis has been drawn? set by {@link drawAxes}
	@variable {private boolean} yaxis */
	this.yaxis = false;
	/**X axis has been drawn? set by {@link drawAxes}
	@variable {private boolean} xaxis */
	this.xaxis = false;
}

mathnetics.extend(SVGPlot.prototype, {

	/**Makes a 2D plot of a user-provided function.
	@function {public mathnetics.svg.SVGWrapper} plot2D
	@param {Number} xmin - min x value
	@param {Number} xmax - max x value
	@param {Number} ymin - min y value
	@param {Number} ymax - max y value
	@param {Function} func - the function to plot; must take <strong>one parameter</strong> as a number and output another number; Math.sin, i.e.
	@param {optional Object} settings - the object-literal settings to apply to path of function; default: {stroke: 'black', 'stroke-width': .05, fill: 'none'}
	@return this SVGWrapper object, so can string together function calls
	*/
	plot2D: function(xmin, xmax, ymin, ymax, func, settings) {

		this.xmin = xmin;
		this.xmax = xmax;
		this.ymin = ymin;
		this.ymax = ymax;

		this.width = xmax - xmin;
		this.midx = this.xmin + this.width / 2;

		var x = this.xmin;
		var dx = this.width/this.numpoints;
		var y = func(x);
		//pstring will be passed to path() function
		var pstring = "M"+x+","+y+" ";
		for(var i = 0; i < this.numpoints; i++) {
			//increment the x
			x += dx;
			y = func(x);
		/*	if(eval(y) < this.ymin) {
				this.ymin = eval(y);
			}
			if(eval(y) > this.ymax) {
				this.ymax = eval(y);
			}	*/
			//draw line to new point if inside viewBox
			if(x >= this.xmin && x <= this.xmax && y <= this.ymax && y >= this.ymin) {
				pstring += "L"+x+","+y+" ";	
			}
		}

		this.height = this.ymax - this.ymin;
		this.midy = this.ymin + this.height / 2;

	//potential fix for IE, does not work for dynamic in FF
	//	this.svg = this.svg.svg(null,0,0,this._root._width(),this._root._height(),this.xmin,this.ymin,this.width,this.height);
	

	//scales SVG canvas/units into (xmin,ymin) to (xmax, ymax)
		this.svg.configure({viewBox: ''+this.xmin+' '+this.ymin+' '+this.width+' '+this.height+''});

		//makes bottom left coordinates xmin,ymin, increasing up/right
		if(this.ymin >= 0) {		
			this.g = this.svg.group(null, {transform: "matrix(1,0,0,-1,0,"+this.height+")", id: "group"});
		} else {
			this.g = this.svg.group(null, {transform: "matrix(1,0,0,-1,0,0)", id: "group"});
		}
		
		//debugging, to see where origin is
		//this.svg.circle(this.g,0,0,.1,{fill: 'red'});

		//generate actual path
		if(!settings) {
			settings = {stroke: 'black', 'stroke-width': .05, fill: 'none'};
		}
		this.svg.path(this.g,pstring,settings);

		return this;
	},

	/**Makes a 2-D plot based on two functions x(t) and y(t).
	@function {public mathnetics.svg.SVGWrapper} plot2Dparam
	@param {Number} tmin - the minimum t value
	@param {Number} txmax - the maximum t value
	@param {Function} xfunc - user-defined x(t); takes one number as parameter, outputs one number
	@param {Function} yfunc - user-defined y(t); takes one number as parameter, outputs one number
	@param {optional Object} settings - the object-literal settings to apply to path of function; default: {stroke: 'black', 'stroke-width': .05, fill: 'none'}
	@return this SVGWrapper object */
	plot2Dparam: function(tmin, tmax, xfunc, yfunc, settings) {
		var x = xfunc(tmin);
		var y = yfunc(tmin);
		var dt = (tmax - tmin) / this.numpoints;

		var pstring = "M"+x+","+y+"";
		var t = tmin;

		for(i = 0; i < this.numpoints; i++) {
			t += dt;
			x = xfunc(t);
			y = yfunc(t);
			pstring += "L"+x+","+y+" ";

			//sets ymin, ymax, xmin, xmax; used for other functions
			if(y > this.ymax) { this.ymax = y; }
			if(y < this.ymin) { this.ymin = y; }
			if(x > this.xmax) { this.xmax = x; }
			if(x < this.xmin) { this.xmin = x; }
		}

		this.height = this.ymax - this.ymin;
		this.width = this.xmax - this.xmin;

		//scales SVG canvas/units into (xmin,ymin) to (xmax, ymax)
		this.svg.configure({viewBox: ''+this.xmin+' '+this.ymin+' '+this.width+' '+this.height+''});

		//makes bottom left coordinates xmin,ymin, increasing up/right
		if(this.ymin >= 0) {		
			this.g = this.svg.group(null, {transform: "matrix(1,0,0,-1,0,"+this.height+")", id: "group"});
		} else {
			this.g = this.svg.group(null, {transform: "matrix(1,0,0,-1,0,0)", id: "group"});
		}
		
		//debugging, to see where origin is
		//this.svg.circle(this.g,0,0,.1,{fill: 'red'});

		//generate actual path
		if(!settings) {
			settings = {stroke: 'black', 'stroke-width': .05, fill: 'none'};
		}
		this.svg.path(this.g,pstring,settings);

		return this;
	},

	/**Sets the minimum and maximum y values and changes the height. Alters viewbox as well. Use after plot2D or else ymin and ymax will be overwritten.
	@function {public mathnetics.svg.SVGWrapper} setY
	@param {Number} min - minimum y value
	@param {Number} max - maximum y value
	@return same SVGWrapper object */
	setY: function(min, max) {
		this.ymin = min;
		this.ymax = max;
		this.height = this.ymax - this.ymin;
		this.svg.configure({viewBox: ''+this.xmin+' '+this.ymin+' '+this.width+' '+this.height+''});
		return this;
	},

	/**Sets the minimum and maximum x values and changes the height. Alters viewbox as well. Use after plot2D or else xmin and xmax will be overwritten.
	@function {public mathnetics.svg.SVGWrapper} setX
	@param {Number} min - minimum x value
	@param {Number} max - maximum x value
	@return same SVGWrapper object */
	setX: function(min, max) {
		this.xmin = min;
		this.xmax = max;
		this.width = this.xmax - this.xmin;
		this.svg.configure({viewBox: ''+this.xmin+' '+this.ymin+' '+this.width+' '+this.height+''});
		return this;
	},

	/**Returns or sets the value for numpoints (number of points drawn) depending on whether or not parameter is provided.
	@function {public mathnetics.svg.SVGWrapper} numPoints
	@param {optional int} num - the number of points the user wants to set to be plotted.  Default: 600.
	@return {@link numpoints} if num not provided; this SVGWrapper otherwise */
	numPoints: function(num) {
		//no arguments: return numpoints
		if(arguments.length == 0) {
			return this.numpoints;
		}
		//value provided: set numpoints
		else {
			if(!isNaN(num)) {
				this.numpoints = num;
			}
		}
		return this;
	},

	/*Draws x and y axes (tick marks are a separate function) on plot.
	@function {public mathnetics.svg.SVGWrapper} drawAxes
	@param {optional Object} settings - Settings for the axes.  Default: {stroke: 'red', 'stroke-width': .05}
	@return this SVGWrapper object
	*/
	drawAxes: function(settings) {
		if(arguments.length == 0) {
			settings = {stroke: 'red','stroke-width': .05};
		}
		//x-axis
		if(this.ymin <= mathnetics.zero) {
			this.svg.line(this.g,this.xmin,0,this.xmax,0,settings);
			this.xaxis = true;
		}
		//y-axis
		if(this.xmin <= mathnetics.zero) {
			this.svg.line(this.g,0,this.ymin,0,this.ymax,settings);
			this.yaxis = true;
		}
		return this;		
	},

	/*Draws tick marks on graph.  Will only function if {@link drawAxes} has been called already.
	@function {public mathnetics.svg.SVGWrapper} drawTicks
	@param {Number} size - The total length of each tick mark.
	@param {Number} spacing - How far apart you want each tick mark to be.
	@param {optional Object} settings - Settings for the tick lines. Default: {stroke: 'black', 'stroke-width':.005}
	@return this SVGWrapper object
	*/
	drawTicks: function(size, spacing, settings) {
		if(!settings) {
			settings = {stroke: 'black', 'stroke-width':.005};
		}
		//distance from 0 in either direction
		distFrom = size / 2;
		if(this.xaxis) {
			//positive x-axis
			var x = 0;
			while(x <= this.xmax) {
				this.svg.line(this.g,x,-distFrom,x,distFrom,settings);
				x += spacing;
			}
			//negative x-axis
			var x = 0;
			while(x >= this.xmin) {
				this.svg.line(this.g,x,-distFrom,x,distFrom,settings);
				x -= spacing;
			}
		}
		if(this.yaxis) {
			//positive y-axis
			var y = 0;
			while(y <= this.ymax) {
				this.svg.line(this.g,-distFrom,y,distFrom,y,settings);
				y += spacing;
			}
			//negative y-axis
			var y = 0;
			while(y >= this.ymin) {
				this.svg.line(this.g,-distFrom,y,distFrom,y,settings);
				y -= spacing;
			}
		}
		return this;
	},

	/**Returns the main group element which all plot elements belong to. Call after {@link plot2D} or {@link plot2Dparam} have been.
	@function {public SVGGroupElement} mainGroup
	@return the main "g" element of the plot */
	mainGroup: function() {
		return this.g;
	},

	drawLabel: function(which, offset, settings) {
		var label;
		switch(which) {
			case "ymax":
				if(this.xmin <= 0) {
					label = this.svg.text(this.g,offset,offset-this.ymax,this.ymax.toString(),settings);
				} else {
					label = this.svg.text(this.g,this.midx,offset-this.ymax,this.ymax.toString(),settings);
				}
				break;
			case "ymin":
				if(this.xmin <= 0) {
					label = this.svg.text(this.g,offset,offset-this.ymin,this.ymin.toString(),settings);
				} else {
					label = this.svg.text(this.g,this.midx,offset-this.ymin,this.ymin.toString(),settings);
				}
				break;
			case "xmax":
				if(this.ymin <= 0) {
					label = this.svg.text(this.g,this.xmax-offset,0,this.xmax.toString(),settings);
				} else {
					label = this.svg.text(this.g,this.xmax-offset,offset-this.ymin,this.xmax.toString(),settings);
				}
				break;
			case "xmin":
				if(this.ymin <= 0) {
					label = this.svg.text(this.g,this.xmin + offset,-offset,this.xmin.toString(),settings);
				} else {
					label = this.svg.text(this.g,this.xmin + offset,offset-this.ymin,this.xmin.toString(),settings);
				}
				break;
		}
		label.setAttribute('transform', 'scale(1,-1)');
		return this;
	} 

});

})();
