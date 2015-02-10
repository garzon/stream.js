Stream = function(list) {
	if(typeof list == "undefined") list = [];
	if(list instanceof Array) {
		if(list.length == 0) {
			this.car = null;
			this.cdr = null;
			return;
		}
		if(list[0] instanceof Array) this.car = new Stream(list[0]);
		else this.car = list[0];
		this.cdr = new Stream(list.length < 2 ? [] : list.slice(1));
		return;
	}
	if(list instanceof Function) {
		this.delay = list;
		return;
	}
	if(list instanceof Stream) {
		this.car = list.car;
		this.cdr = list.cdr;
		return;
	}
	console.error("Stream() - invalid parameter");
};

Stream.prototype.eval = function() {
	while(typeof this.delay != "undefined") {
		var res = this.delay();
		if(typeof res.delay == "undefined") {
			this.car = res.car;
			this.cdr = res.cdr;
			this.delay = undefined;
		} else {
			this.delay = res.delay;
		}
	}
};

Stream.prototype.toString = function() {
	var stream = this;
	var printString = "(";
	if(Stream.car(stream) instanceof Stream) {
		var subString = Stream.car(stream).toString();
		printString += "\n  " + subString.substr(0, subString.length-1).replace(/\n/g, "\n  ");
	} else {
		printString += Stream.car(stream);
	}
	if(!Stream.isEmpty(Stream.cdr(stream))) {
		var subString = Stream.cdr(stream).toString();
		printString += " " + subString.substr(1, subString.length-3);
	}
	printString += ")\n";
	return printString;
};

Stream.emptyStream = new Stream();

Stream.list = function() { return new Stream(arguments); };
Stream.car = function(stream) { stream.eval(); return stream.car; };
Stream.cdr = function(stream) { stream.eval(); if(stream.cdr != null) stream.cdr.eval(); return (stream.cdr == null) ? Stream.emptyStream : stream.cdr; };

Stream.cadr = function(stream) { return Stream.car(Stream.cdr(stream)); };
Stream.isEmpty = function(stream) { return Stream.car(stream) == null; };

Stream.cons = function(element, stream) {
	var ret = new Stream();
	ret.car = element;
	ret.cdr = stream;
	return ret;
};

// TODO
Stream.append = function(stream1, stream2) {
	while(!Stream.isEmpty(Stream.cdr(stream1))) stream1 = Stream.cdr(stream1);
	stream1.cdr = stream2;
	return stream1;
};

Stream.map = function(f, stream) {
	if(Stream.isEmpty(stream)) return Stream.emptyStream;
	return new Stream(function() {
		return Stream.cons(
			f(Stream.car(stream)),
			new Stream(function() {
				return Stream.map(f, Stream.cdr(stream));
			}) 
		);
	});
};

Stream.foreach = function(f, stream) {
	f(Stream.car(stream));
	Stream.foreach(f, Stream.cdr(stream));
};

Stream.filter = function(f, stream) {
	if(Stream.isEmpty(stream)) return Stream.emptyStream;
	var tmp = new Stream(function() {
		return Stream.filter(f, Stream.cdr(stream));
	});
	if(f(Stream.car(stream))) return Stream.cons(Stream.car(stream), tmp);
	else return tmp;
};

Stream.reduce = function(f, init, stream) {
	if(Stream.isEmpty(stream)) return init;
	return Stream.reduce(f, f(init, Stream.car(stream)), Stream.cdr(stream));
};

Stream.flatmap = function(f, stream) {
	return Stream.reduce(Stream.append, new Stream(), Stream.map(f, stream));
};

Stream.range = function(a, b) {
	if(a == b) return Stream.emptyStream;
	return Stream.cons(a, new Stream(function() {
		return Stream.range(a+1, b);
	}));
};
