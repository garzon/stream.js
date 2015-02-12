stream.js
============
This is a simple framework which helps you to write a program in stream-style javascript.

# Demo
Calculate `0*0 + 1*1 + 2*2 + 3*3 .. 10*10` :
``` 
Stream.naturalNumbers()
	.map(function(x){ return x*x; })
	.cut(11)
	.reduce(0, function(init, car){ return init+car; }) 
```
------
Fibonacci Sequence: 
See `/demo/fib.js`

------
N-queens Problem:
See `/demo/nQueens.js`