Stream = function(list) {
	if(typeof list == "undefined") list = [];
	if(list instanceof Array) {
		if(list.length == 0) {
			Stream.prototype.clean.call(this);
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
		Stream.prototype.cloneFrom.call(this, list);
		return;
	}
	throw "Stream() - invalid parameter";
};

Stream.prototype.clean = function() {
	this.car = null;
	this.cdr = null;
};

Stream.clone = function(stream) { return new Stream(stream); };
Stream.prototype.clone = function() { return Stream.clone(this); };
Stream.prototype.cloneFrom = function(stream) { 
	if(typeof stream.delay == "undefined") {
		if(stream.car == null) {
			Stream.prototype.clean.call(this);
		} else {
			this.car = Stream.newCar(stream);
			this.cdr = new Stream(stream.cdr);
		}
	} else {
		this.delay = stream.delay;
	}
	return this;
};

Stream.eval = function(inputStream, outputStream) {
	if(typeof inputStream.delay == "undefined") {
		if(!(inputStream instanceof Stream)) {
			throw "eval() - inputStream is not a Stream";
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
	return this;
};

Stream.toString = function(stream) {
	var printString = "(";
	while(!Stream.isEmpty(stream)) {
		if(Stream.car(stream) instanceof Stream) {
			var subString = Stream.car(stream).toString();
			printString += "\n  " + subString.substr(0, subString.length-1).replace(/\n/g, "\n  ");
		} else {
			printString += Stream.car(stream);
		}
		stream = Stream.cdr(stream);
		if(!Stream.isEmpty(stream)) {
			printString += " ";
		}
	}
	printString += ")\n";
	return printString;
};
Stream.prototype.toString = function() {
	return Stream.toString(this);
};

Stream.list = function() { return new Stream([].slice.call(arguments)); };

Stream.car = function(stream) { stream.eval(); return stream.car; };

Stream.newCar = function(stream) {
	var car = Stream.car(stream);
	if(car instanceof Stream)
		return new Stream(car);
	else
		return car;
};
Stream.prototype.newCar = function() { return Stream.newCar(this); };

Stream.cdr = function(stream) { 
	stream.eval(); 
	if(stream.cdr instanceof Stream) 
		stream.cdr.eval();
	if(stream.cdr == null) stream.cdr = new Stream();
	if(!(stream.cdr instanceof Stream)) throw "Stream.cdr() - the parameter is not a stream.";
	return stream.cdr; 
};

Stream.cadr = function(stream) { return Stream.car(Stream.cdr(stream)); };
Stream.prototype.cadr = function() { return Stream.cadr(this); };

Stream.isEmpty = function(stream) { return Stream.car(stream) == null; };
Stream.prototype.isEmpty = function() { return Stream.isEmpty(this); };

Stream.cons = function(element, stream) {
	var ret = new Stream();
	ret.car = element;
	ret.cdr = new Stream(stream);
	return ret;
};
Stream.prototype.cons = function(element) { return Stream.cons(element, this); };

Stream.append = function(stream1, stream2) {
	if(Stream.isEmpty(stream1)) return new Stream(stream2);
	var ret = new Stream();
	ret.car = Stream.newCar(stream1);
	ret.cdr = new Stream(function() { 
		return Stream.append(Stream.cdr(stream1), stream2);
	});
	return ret;
};
Stream.prototype.append = function(stream) { return Stream.append(this, stream); };

Stream.map = function(stream, f) {
	if(Stream.isEmpty(stream)) return new Stream();
	return Stream.cons(
		f(Stream.car(stream)),
		new Stream(function() {
			return Stream.map(Stream.cdr(stream), f);
		}) 
	);
};
Stream.prototype.map = function(f) { return Stream.map(this, f); };

Stream.foreach = function(stream, f) {
	if(Stream.isEmpty(stream)) return this;
	f(Stream.car(stream));
	Stream.foreach(Stream.cdr(stream), f);
	return this;
};
Stream.prototype.foreach = function(f) { return Stream.foreach(this, f); };

Stream.filter = function(stream, f) {
	if(Stream.isEmpty(stream)) return new Stream();
	var tmp = new Stream(function() {
		return Stream.filter(Stream.cdr(stream), f);
	});
	if(f(Stream.car(stream))) return Stream.cons(Stream.car(stream), tmp);
	else return tmp;
};
Stream.prototype.filter = function(f) { return Stream.filter(this, f); };

Stream.flatmap = function(stream, f) {
	return Stream.reduce(new Stream(), Stream.map(stream, f), Stream.append);
};
Stream.prototype.flatmap = function(f) { return Stream.flatmap(this, f); };

Stream.reduce = function(init, stream, f) {
	if(Stream.isEmpty(stream)) return init;
	return Stream.reduce(f(init, Stream.car(stream)), Stream.cdr(stream), f);
};
Stream.prototype.reduce = function(init, f) {
	return Stream.reduce(init, this, f);
};

Stream.range = function(a, b) {
	if(a == b) return new Stream();
	return Stream.cons(a, new Stream(function() {
		return Stream.range(a+1, b);
	}));
};

Stream.cut = function(n, stream) {
	if(n == 0 || Stream.isEmpty(stream)) return new Stream();
	return Stream.cons(Stream.car(stream), new Stream(function() {
		return Stream.cut(n-1, Stream.cdr(stream));
	}));
}
Stream.prototype.cut = function(n) { return Stream.cut(n, this); };

Stream.merge = function(stream1, stream2, f) {
	if(Stream.isEmpty(stream1)) return new Stream();
	if(Stream.isEmpty(stream2)) return new Stream();
	var ret = new Stream();
	ret.car = f(Stream.car(stream1), Stream.car(stream2));
	var a = stream1.cdr, b = stream2.cdr;
	ret.cdr = new Stream(function() {
		return Stream.merge(a, b, f);
	});
	return ret;
};