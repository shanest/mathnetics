(function() {
function getHi() { 
	alert(mathnetics.util.select("#1234"));
	alert(mathnetics.util.select(".5678"));
	alert(mathnetics.util.hasClass(mathnetics.util.select(".5678")[0],"5678"));
}
mathnetics.util.onDOMReady(getHi);
alert(mathnetics.util.Element.Line(1,1,1,1).toHTML().getAttribute("x1"));
})();
