function makeFib() {
	function add(x, y) { return x+y; };
	return Stream.cons(1, new Stream(function() {
		return Stream.cons(1, new Stream(function() {
			return Stream.merge(
					new Stream(makeFib), 
					Stream.cdr(new Stream(function() { return new Stream(makeFib); })),
					add);
		}));
	}));
}