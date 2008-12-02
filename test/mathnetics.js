module("mathnetics object");
test("Basic constants", function() {
	ok(0 < mathnetics.zero, "mathnetics.zero > 0");
	ok(mathnetics.zero < .1, "mathnetics.zero < .1");
	equals(mathnetics.phi, (1+Math.sqrt(5))/2, "mathnetics.phi = (1+sqrt(5))/2");
});
