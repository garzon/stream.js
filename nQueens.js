function queens(n) {
	function makePos(x, y) { return Stream.list(x, y); };
	function posX(pos) { return Stream.car(pos); };
	function posY(pos) { return Stream.cadr(pos); };

	function isValid(board) {
		function isCheck(pos1, pos2) {
			if(posX(pos1) == posX(pos2)) return false;
			if(posY(pos1) == posY(pos2)) return false;
			if(Math.abs(posX(pos1) - posX(pos2)) == Math.abs(posY(pos1) - posY(pos2)))
				return false;
			return true;
		}
		return Stream.map(Stream.cdr(board), function(othersPos) {
			return isCheck(Stream.car(board), othersPos);
		}).reduce(true, function(init, flag) { 
			return init && flag; 
		});
	}

	function queenCol(x) {
		if(x<0) return new Stream([[]]);
		else 
			return queenCol(x-1).flatmap(function(board) { 
				return Stream.range(0, n).map(function(row) {
					return Stream.cons(makePos(row, x), board);
				});
			}).filter(isValid);
	}

	return queenCol(n-1);
}

console.log(queens(6).toString());