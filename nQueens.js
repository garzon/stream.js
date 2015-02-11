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
		return Stream.reduce(
			function(init, flag) { return init && flag; },
			true,
			Stream.map(
				function(othersPos) {
					return isCheck(Stream.car(board), othersPos);
				},
				Stream.cdr(board)
			)
		);
	}

	function queenCol(x) {
		if(x<0) return new Stream([[]]);
		else return Stream.filter(isValid,
			Stream.flatmap(
				function(board) { 
					return Stream.map(
						function(row) {
							return Stream.cons(makePos(row, x), board);
						},
						Stream.range(0, n)
					);
				},
				queenCol(x-1)
			)
		);
	}

	return queenCol(n-1);
}

console.log(queens(6).toString());