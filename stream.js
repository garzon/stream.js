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
		if(Stream.isEmpty(list)) return new Stream();
		if(typeof list.delay == "undefined") {
			this.car = Stream.newCar(list);
			this.cdr = new Stream(list.cdr);
		} else {
			this.delay = list.delay;
		}
		return;
	}
	console.error("Stream() - invalid parameter");
};

Stream.eval = function(inputStream, outputStream) {
	if(typeof inputStream.delay == "undefined") {
		if(!(inputStream instanceof Stream)) {
			console.error("eval() - inputStream is not a Stream");
			return;
		}
		outputStream.car = inputStream.car;
		outputStream.cdr = inputStream.cdr;
		return; 
	}
	outputStream.delay = inputStream.delay;
	while(typeof outputStream.delay != "undefined") {
		var res = outputStream.delay();
		if(typeof res.delay == "undefined") {
			outputStream.car = res.car;
			outputStream.cdr = res.cdr;
			outputStream.delay = undefined;
		} else {
			outputStream.delay = res.delay;
		}
	}
}

Stream.prototype.eval = function() {
	Stream.eval(this, this);
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

Stream.list = function() { return new Stream([].slice.call(arguments)); };
Stream.car = function(stream) { stream.eval(); return stream.car; };
Stream.newCar = function(stream) {
	var car = Stream.car(stream);
	if(car instanceof Stream)
		return new Stream(car);
	else
		return car;
};
Stream.cdr = function(stream) { stream.eval(); if(stream.cdr != null) stream.cdr.eval(); return (stream.cdr == null) ? Stream.emptyStream : stream.cdr; };

Stream.cadr = function(stream) { return Stream.car(Stream.cdr(stream)); };
Stream.isEmpty = function(stream) { return Stream.car(stream) == null; };

Stream.cons = function(element, stream) {
	var ret = new Stream();
	ret.car = element;
	ret.cdr = stream;
	return ret;
};

Stream.append = function(stream1, stream2) {
	if(typeof stream1.delay != "undefined") {
		stream1.eval();
	}
	if(Stream.isEmpty(stream1)) return new Stream(stream2);
	var ret = new Stream();
	ret.car = Stream.newCar(stream1);
	ret.cdr = new Stream(function() { 
		return Stream.append(Stream.cdr(stream1), stream2);
	});
	return ret;
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
