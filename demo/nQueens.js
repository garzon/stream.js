function queens(n) {
	function makePos(x, y) { return Stream.list(x, y); };
	function posX(pos) { return pos.car(); };
	function posY(pos) { return pos.cadr(); };

	function isValid(board) {
		function check(pos1, pos2) {
			if(posX(pos1) == posX(pos2)) return false;
			if(posY(pos1) == posY(pos2)) return false;
			if(Math.abs(posX(pos1) - posX(pos2)) == Math.abs(posY(pos1) - posY(pos2)))
				return false;
			return true;
		}
		return board.cdr().map(function(othersPos) {
			return check(board.car(), othersPos);
		}).reduce(true, function(init, flag) { 
			return init && flag; 
		});
	}

	function queenCol(x) {
		if(x<0) return new Stream([[]]);
		else 
			return queenCol(x-1).flatmap(function(board) { 
				return Stream.range(0, n).map(function(row) {
					return board.cons(makePos(row, x));
				});
			}).filter(isValid);
	}

	return queenCol(n-1);
}

console.log(queens(6).toString());