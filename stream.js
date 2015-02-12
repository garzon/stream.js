// ============= basic definitions start ===============

Stream = function(list) {
	if(typeof list == "undefined") list = [];
	if(list instanceof Array) {
		if(list.length == 0) {
			Stream.prototype.clean.call(this);
			return;
		}
		if(list[0] instanceof Array) this._car = new Stream(list[0]);
		else this._car = list[0];
		this._cdr = new Stream(list.length < 2 ? [] : list.slice(1));
		return;
	}
	if(list instanceof Function) {
		this._delay = list;
		return;
	}
	if(list instanceof Stream) {
		Stream.prototype.cloneFrom.call(this, list);
		return;
	}
	throw "Stream() - invalid parameter";
};

Stream.prototype.clean = function() {
	this._car = null;
	this._cdr = null;
};

Stream.clone = function(stream) { return new Stream(stream); };
Stream.prototype.clone = function() { return Stream.clone(this); };
Stream.prototype.cloneFrom = function(stream) { 
	if(typeof stream._delay == "undefined") {
		if(stream._car == null) {
			Stream.prototype.clean.call(this);
		} else {
			this._car = stream._car;
			this._cdr = stream._cdr;
		}
	} else {
		this._delay = stream._delay;
	}
	return this;
};

Stream.prototype.eval = function() {
	if(typeof this._delay == "undefined") return this; 
	while(typeof this._delay != "undefined") {
		var res = this._delay();
		if(typeof res._delay == "undefined") {
			this._car = res._car;
			this._cdr = res._cdr;
			this._delay = undefined;
		} else {
			this._delay = res._delay;
		}
	}
	return this;
};

Stream.list = function() { return new Stream([].slice.call(arguments)); };

Stream.car = function(stream) { stream.eval(); return stream._car; };
Stream.prototype.car = function() { return Stream.car(this); };

Stream.cdr = function(stream) { 
	stream.eval(); 
	if(stream._cdr instanceof Stream) 
		stream._cdr.eval();
	if(stream._cdr == null) stream._cdr = new Stream();
	if(!(stream._cdr instanceof Stream)) throw "Stream.cdr() - the parameter is not a stream.";
	return stream._cdr; 
};
Stream.prototype.cdr = function() { return Stream.cdr(this); };

Stream.cons = function(element, stream) {
	var ret = new Stream();
	ret._car = element;
	ret._cdr = stream;
	return ret;
};
Stream.prototype.cons = function(element) { return Stream.cons(element, this); };

// ================ common algorithms start ====================

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

Stream.cadr = function(stream) { return Stream.car(Stream.cdr(stream)); };
Stream.prototype.cadr = function() { return Stream.cadr(this); };

Stream.isEmpty = function(stream) { return Stream.car(stream) == null; };
Stream.prototype.isEmpty = function() { return Stream.isEmpty(this); };

Stream.append = function(stream1, stream2) {
	if(Stream.isEmpty(stream1)) return stream2;
	return Stream.cons(Stream.car(stream1), new Stream(function() { 
		return Stream.append(Stream.cdr(stream1), stream2);
	}));
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
	return Stream.cons(f(Stream.car(stream1), Stream.car(stream2)), new Stream(function() {
		return Stream.merge(Stream.cdr(stream1), Stream.cdr(stream2), f);
	}));
};

Stream.naturalNumbers = function() {
	return Stream.range(0, -1);
};