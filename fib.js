function fib() {
	function make_fib() {
		function add(x, y) { return x+y; };
		return Stream.cons(1, new Stream(function() {
			return Stream.cons(1, new Stream(function() {
				return Stream.merge(
						new Stream(fib), 
						Stream.cdr(new Stream(fib)),
						add);
			}));
		}));
	}
	var res = make_fib();
	fib = function() { return new Stream(res); };
	return new Stream(res);
}