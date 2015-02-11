function makeFib() {
	function add(x, y) { return x+y; };
	return Stream.cons(1, new Stream(function() {
		return Stream.cons(1, new Stream(function() {
			return Stream.merge(
					Stream.cdr(new Stream(makeFib)), 
					Stream.cdr(new Stream(function() { return Stream.cdr(new Stream(makeFib)); })),
					add);
		}));
	}));
}