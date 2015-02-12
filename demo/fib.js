function fib() {
	function make_fib() {
		function add(x, y) { return x+y; };
		return Stream.cons(1, // fib[0] = 1
				Stream.cons(1, // fib[1] = 1
					new Stream(function() {  // lazy evaluation using "new Stream(function)"
						return Stream.merge(fib(), fib().cdr(), add);  // fib[n+2] = fib[n] + fib[n+1]
					})
				)
		);
	}
	var res = make_fib(); // save the result in res
	fib = function() { return res; };
	return res;
}

console.log(fib().cut(100).toString());