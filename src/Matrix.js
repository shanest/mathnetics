/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

/**Note that a Matrix object is an Array, where each component is a Vector, representing a row of the matrix.
@class Matrix */

dependencies = ['Vector'];
mathnetics.require(dependencies);

/**Constructor function.
@paramset fromArray
@param {Number[]} arr - an array representation of the matrix; can be a 1D, 2D, or array of Vectors
@paramset fromVector
@param {Vector} vec - the vector which will become the single row of this matrix
@paramset clone
@param {Matrix} m - the matrix of which to create a clone
@constructor Matrix
*/
function Matrix(elements) {
	/**an Array whose elements are Vectors, the vectors being rows of the matrix 
	@variable {Vector[]} components */
	this.components = new Array();
	if(elements instanceof Vector) {
		this.components[0] = new Vector(elements);
	}
	if(elements instanceof Array) {
		if(typeof elements[0][0] != 'undefined') {
			for(i = 0; i < elements.length; i++) {
				this.components[i] = new Vector(elements[i]);
			}
		} else {
			this.components[0] = new Vector(elements);
		}
	}
	if(elements instanceof Matrix) {
		for(i = 0; i < elements.numRows(); i++) {
			this.components[i] = new Vector(elements.components[i]);
		}
	}
}

Matrix.prototype = {

	/**Returns the i,j'th element of the matrix. Because (i,j) element is this.components[i-1].components[j-1], this method is especially uesful as shorthand.
	@function {public Number} get
	@param {int} i - the row number of the element
	@param {int} j - the column number of the element
	@return the element at i,j */
	get: function(i,j) {
		return (i < 1 || i > this.components.length || j < 1 || j > this.components[0].dimension()) ? null : this.components[i-1].components[j-1];
	},

	/**Checks two matrices for equality.
	@function {public boolean} equalTo
	@param {Matrix} matrix - the matrix (or Vector) to compare to the original
	@return true iff both are equal, false otherwise */
	equalTo: function(matrix) {
		var M = matrix;
		if(matrix instanceof Vector) {
			M = new Matrix(matrix);
		}
		if(!this.sameSizeAs(M)) {
			return false;
		}
		for(i = 1; i <= this.numRows(); i++) {
			if(!this.row(i).equalTo(M.row(i))) {
				return false;
			}
		}
		return true;
	},

	/**Maps a matrix onto a new one according to a supplied function.
	@function {public Matrix} map
	@param {Function} func - the mapping function
	@return the new, mapped matrix */
	map: function(func) {
		var rows = new Array();
		for(k = 0; k < this.numRows(); k++) {
			//this calls the Vector map function for each row
			rows[k] = this.components[k].map(func);
			rows[k] = rows[k].components;
		}
		return new Matrix(rows);
	},

	/**Returns a specific row of the matrix as a Vector (which it is already)
	@function {public Vector} row
	@param {int} i - the row you want
	@return a new copy of the i'th row of the matrix; */
	row: function(i) {
		return new Vector(this.components[i-1]);
	},

	/**Returns the j'th column as a vector.
	@function {public Vector} col
	@param {int} j - the number of the column you want
	@return the j'th column as a vector */
	col: function(j) {
		var column = new Array();
		for(i = 1; i <= this.components.length; i++) {
			column[i-1] = this.get(i,j);
		}
		return new Vector(column);
	},

	/**Get the number of rows in the matrix.
	@function {public int} numRows
	@return the number of rows */
	numRows: function() {
		return this.components.length;
	},

	/**Get the number of columns in the matrix.
	@function {public int} numCols
	@return the number of columns */
	numCols: function() {
		return this.components[0].dimension();
	},

	/**Adds a matrix to another one of the same size.
	@function {public Matrix} add
	@param {Matrix} matrix - the matrix to be added to the original one
	@return a new matrix that is the sum of the two or null if they aren't same size */
	add: function(matrix) {
		if(!this.sameSizeAs(matrix)) {
			return null;
		}
		return this.map(function(x,i,k) { return x + matrix.get(k+1,i+1); });
	},

	/**Subtracts another matrix of the same size from this one.
	@function {public Matrix} subtract
	@param {Matrix} matrix - the matrix to be subtracted the original one
	@return a new matrix that is the difference of the two or null if not same size*/
	subtract: function(matrix) {
		if(!this.sameSizeAs(matrix)) {
			return null;
		}
		return this.map(function(x,i,k) { return x - matrix.get(k+1,i+1); });
	},

	/**Multiplies a matrix by a scalar value.
	@function {public Matrix} multiplyBy
	@param {Number} k - the scalar by which to multiply the matrix
	@return a new matrix that is the scalar multiple of the original */
	multiplyBy: function(k) {
		return this.map(function(x) { return x*k; });
	},

	/**Tests to see whether the supplied matrix can be multiplied by this matrix in form: this times matrix.
	This is called as a test from multiply.
	@function {public boolean} canMultiplyFromLeft
	@param {Object} matrix - Matrix, Vector, or scalar to be tested
	@return true if matrix/vector can be multiplied from left or if matrix is a number; false otherwise 
	@see multiply */
	canMultiplyFromLeft: function(matrix) {
		if(matrix instanceof Matrix) {
			return (this.numCols() == matrix.numRows());
		}
		if(matrix instanceof Vector) {
			return (this.numCols() == matrix.dimension());
		}
		if(typeof matrix == 'number') {
			return true;
		}
		if(matrix instanceof mathnetics.point2D || matrix instanceof mathnetics.point3D) {
			return (this.numCols() == matrix.components.length);
		}
	},

	/**If possible (i.e. canMultiplyFromLeft(matrix) == true), multiplies the supplied matrix by this matrix.
	@function {public Object} multiply
	@param {Object} matrix the matrix, vector, or number (will do scalar multiplication) to be multiplied
	@return new matrix that is the matrix product if matrix is Matrix or Number; new Vector if parameter is a vector 
	@see canMultiplyFromLeft */
	multiply: function(matrix) {
		if(!this.canMultiplyFromLeft(matrix)) {
			return null;
		}
		if(typeof matrix == 'number') {
			return this.multiplyBy(matrix);
		}
		var elements = new Array(this.numRows());
		var M = matrix;
		if(M.n) {
			for(i = 1; i <= this.numRows(); i++) {
				elements[i-1] = this.row(i).dot(M);
			}
			return new Vector(elements);
		}
		var i = 1;
		while(i <= this.numRows()) { 
			elements[i-1] = new Array();
			for(j = 1; j <= matrix.numCols(); j++) {
				elements[i-1][j-1] = this.row(i).dot(M.col(j));
			}
			i++;
		}
		return new Matrix(elements);
	},

	/**Creates a new matrix that is the transpose of the original matrix.
	@function {public Matrix} transpose
	@return the transpose of the original matrix, as a new matrix */
	transpose: function() {
		var elements = new Array(this.numCols());
		for(i = 0; i < this.numCols(); i++) {
			elements[i] = new Array();
			for(j = 0; j < this.numRows(); j++) {
				elements[i][j] = this.components[j].components[i];
			}
		}
		return new Matrix(elements);
	},

	/**Tests to see if a matrix is square or not.
	@function {public boolean} isSquare
	@return true if matrix is a square, false otherwise */
	isSquare: function() {
		var dims = this.dimensions();
		return (dims.rows == dims.columns);
	},

	/**Computes the trace of a square matrix (returns null if matrix is not a square).
	@function {public Number} trace
	@return the trace (sum of diagonal elements) of the matrix */
	trace: function() {
		if(!this.isSquare()) {
			return null;
		}
		var tr = 0;
		for(i = 1; i <= this.numRows(); i++) {
			tr += this.get(i,i);
		}
		return tr;
	},

	/**Shorthand for trace() function.
	@function {public Number} tr
	@see trace */
	tr: function() {
		return this.trace();
	},

	/**Uses a modified version of Gaussian elimination to create and return a new, upper triangular version of the original matrix while preserving determinant and rank.
	@function {public Matrix} toUpperTriangular
	@return the upper triangular version of the matrix as a new matrix object */
	toUpperTriangular: function() {
		var M = new Matrix(this);
		var i = 1, j = 1;
		var rows = this.numRows(), cols = this.numCols();
		while (i <= rows && j <= cols) {
			if(M.get(i,i) == 0) {
				for(k = i+1; k <= rows; k++) {
					if(M.get(k,i) != 0) {
						M.components[i-1] = M.row(1).add(M.row(k));
						break;
					}
				}
			}
			if(M.get(i,i) != 0) {
				for(k = i+1; k<=rows; k++) {
					var multiplier = M.get(k,i) / M.get(i,i);
					M.components[k-1] = M.row(k).subtract(M.row(i).multiplyBy(multiplier));
				}
			}
			i++;
			j++;
		}
		return M;
	},

	/**Calculates the determinant of a square matrix (returns null if matrix not a square).
	@function {public Number} determinant
	@return the determinant */
	determinant: function() {
		if(!this.isSquare()) {
			return null;
		}
		var M = this.toUpperTriangular();
		var det = M.get(1,1);
		for(i = 1; i <= M.numRows(); i++) {
			det = det*M.get(i,i);
		}
		return det;
	},

	/**Shorthand for determinant() 
	@function {public Number} det
	@see determinant */
	det: function() {
		return this.determinant();
	},

	/**Tests a matrix for singularity.
	@function {public boolean} isSingular
	@return true iff matrix is singular (square and 0 determinant), false otherwise */
	isSingular: function() {
		return (this.isSquare() && this.determinant() == 0);
	},

	/**Tests to see if a matrix is or is not invertible.
	@function {public boolean} invertible
	@return true iff matrix is invertible, false if not */
	invertible: function() {
		return (this.isSingular() ? false : true);
	},

	/**Inverts an invertible matrix and returns the inverse.
	@function {public Matrix} invert
	@return a new matrix that is the inverse of the original (null if original not invertible) */
	invert: function() {
		if(!this.invertible()) {
			return null;
		}
		var M = this.augment(Matrix.I(this.numRows())).toUpperTriangular();
		var thisRow = M.numRows();
		while(thisRow > 0) {
			M.components[thisRow-1] = M.row(thisRow).multiplyBy(1/M.get(thisRow,thisRow));
			for(j = thisRow - 1; j > 0; j--) {
				var multBy = M.get(j,thisRow);
				var temp = M.row(thisRow).multiplyBy(multBy);
				M.components[j-1] = M.row(j).subtract(temp);
			}
			thisRow--;
		}
		var rows = M.numRows();
		return M.minor(1,rows+1,rows,rows);
	},

	/**Creates a sub-matrix from the original matrix.  Element selection wraps, so this method can be used to do row or column cycling and copy augmenting
	@function {public Matrix} minor
	@param {int} row - the row to start at
	@param {int} col - the column to start at
	@param {int} numrows - the number of rows for the submatrix
	@param {int} numcols - the number of columns
	@return a new matrix that is the minor matrix from rows row to row+numrows and col to col+numcols */
	minor: function(row, col, numrows, numcols) {
		var row1 = row, col1 = col, nrows = numrows, ncols = numcols;
		var elements = new Array();
		var i = 0, rows = this.numRows(), cols=this.numCols();
		while(i < nrows) {
			elements[i] = new Array();
			var j = 0;
			while(j < ncols) {
				//use this instead of this.get() in order to allow element selection wrapping
				elements[i][j] = this.components[(row1+i-1)%rows].components[(col1+j-1)%cols];
				j++;
			}
			i++;
		}
		return new Matrix(elements);
	},

	/**Augments a matrix to the right of a matrix.
	@function {public Matrix} augment
	@param {Matrix} matrix - the matrix to augment
	@return a new matrix that is the augmentation of the two (or the original matrix if the supplied matrix has a different number of rows) */
	augment: function(matrix) {
		var thisMatrix = new Matrix(this);
		var M = matrix;
		if(!(M instanceof Matrix)) {
			if(M instanceof Vector || M instanceof Array) {
				M = new Matrix(matrix);
			}
		}
		if(thisMatrix.numRows() == M.numRows()) {
			var i = 1, cols = thisMatrix.numCols();
			while(i <= thisMatrix.numRows()) {
				var j = 1;
				while(j <= M.numCols()) {
					thisMatrix.components[i-1].components[(cols + j) - 1] = M.get(i,j);
					j++;
				}
				i++;
			}
		}
		return new Matrix(thisMatrix);
	},

	/**Calculates the rank of a matrix.
	@function {public Number} rank
	@return the rank (calculated without complete row reduction) */
	rank: function() {
		var M = this.toUpperTriangular();
		rank = 0;
		for(i = 1; i <= this.numRows(); i++) {
			for(j = 1; j <= this.numCols(); j++) {
				if(Math.abs(M.get(i,j)) > mathnetics.zero) {
					rank++;
					break;
				}
			}
		}
		return rank;
	},

	/**Returns the dimensions of the matrix as an Object.  Called as thisMatrix.dimensions().rows or .columns (see sameSize method).
	@function {public Object} dimensions
	@return a new object with the two values rows = numRows, columns =  numCols */
	dimensions: function() {
		return {rows: this.numRows(), columns: this.numCols()};
	},

	/**Rounds all the elements of a matrix into a new one.
	@function {public Matrix} round
	@return the new matrix that is the rounded version of the original */
	round: function() {
		return this.map(function(x) { Math.round(x); });
	},

	/**Returns the absolute maximum component of the matrix.
	@function {public Number} max
	@return the value of the component with the largest absolute value */
	max: function() {
		var max = 0, i = 1;
		while(i <= this.numRows()) {
			var temp = this.row(i).max();
			if(Math.abs(temp) > Math.abs(max)) {
				max = temp;
			}
			i++;
		}
		return max;
	},

	/**Sets all values within range of zero (set in mathnetics.js) to val.
	@function {public Matrix} snapTo
	@param {Number} val - the number to snap the matrix to 
	@return a new matrix that is this one snapped to val */
	snapTo: function(val) {
		return this.map(function(x) {
			return (Math.abs(x - val) <= mathnetics.zero) ? val : x;
		});
	},

	/**Gets and returns the diagonal entries of a square matrix.
	@function {public Vector} getDiagonal
	@return a new vector that is the diagonal elements of the matrix */
	getDiagonal: function() {
		if(!this.isSquare()) {
			return null;
		}
		var elements = new Array(), i = 1;
		while(i <= this.numRows()) {
			elements[i-1] = this.get(i,i);
			i++;
		}
		return new Vector(elements);
	},

	/**Returns the negative version of the current matrix.
	@function {public Matrix} negative
	@return a new, negative copy of the original matrix. */
	negative: function() {
		return this.map(function(x) { return -x; });
	},

	/**Makes a Vector out of a 1-D (row or column) Matrix.
	@function {public Vector} toVector
	@return the new Vector, or null if Matrix cannot become a Vector. */
	toVector: function() {
		if(this.numCols() == 1) {
			var els = new Array();
			for(i = 1; i <= this.numRows(); i++) {
				els[i-1] = this.get(i,1);
			}
			return new Vector(els);
		}
		if(this.numRows() == 1) {
			return new Vector(this.components[0]);
		}
		return null;
	},

	/**Returns the indices of the FIRST occurence of a given value.
	@function {public Object} indexOf
	@param {Number} val - the component for which to find the indices
	@return an object with properties i = row, j = column; if you want the row of the first occurence of val, matrix.indexOf(val).i */
	indexOf: function(val) {
		var i = 1;
		while(i <= this.numRows()) {
			var temp = this.row(i).indexOf(val);
			if(temp) {
				return {i: i, j: temp};
			}
			i++;
		}
		return null;
	},

	/**Tests to see if two matrices are the same size.
	@function {public boolean} sameSizeAs
	@param {Matrix} matrix - the matrix with which size is to be compared
	@return true iff same size, false otherwise */
	sameSizeAs: function(matrix) {
		var thisDim = this.dimensions();
		var mDim = matrix.dimensions();
		return (thisDim.rows == mDim.rows && thisDim.columns == mDim.columns);
	},

	/**Sets the i,j'th element to val.  Note: this modifies current matrix, does not return a new one.
	@function {public Matrix} setElement
	@param {int} i - the row of the element to set
	@param {int} j - the column of the element to set
	@param {Number} val - the value to set element (i,j) to 
	@return this matrix, updated */
	setElement: function(i, j, val) {
		this.components[i-1].components[j-1] = val;
		return this;
	},

	/**Creates and returns a string representation of the matrix.
	@function {public String} toString
	@return the string representation of the matrix */
	toString: function() {
		return this.components.join("\n");
	}

} //end Matrix prototype

/** Creates the Identity matrix of dimension N.
@function {public static Matrix} I
@param {int} n - the size of the identity matrix to be created
@return an identity matrix of size n x n */
Matrix.I = function(n) {
	var matrix = new Array(n);
	for(i = 0; i < n; i++) {
		var row = new Array(n);
		row[i] = 1;
		for(j = 0; j < n; j++) {
			if(j != i) {
				row[j] = 0;
			}
		}
		matrix[i] = row;
	}
	return new Matrix(matrix);
}

/** Creates a rows x cols matrix with all 0 elements.
@function {public static Matrix} zero
@param {int} rows - the number of rows for the 0 matrix
@param {int} cols - the number of columns
@return a rows x cols 0 matrix */
Matrix.zero = function(rows, cols) {
	var elements = new Array();
	for(i = 0; i < rows; i++) {
		elements[i] = new Array();
		for(j = 0; j < cols; j++) {
			elements[i][j] = 0;
		}
	}
	return new Matrix(elements);
}

/** Creates a rows x cols matrix with random elements between 0 and max or [0,1) if max not supplied
@function {public static Matrix} random
@param {int} rows - the number of rows
@param {int} cols - the number of columns
@param {optional int} max - the maximum value (included) that any element can have; if supplied, all elements will be integers */
Matrix.random = function(rows, cols, max) {
	return Matrix.zero(rows, cols).map(function() {
		if(max) {
			return Math.floor(Math.random()*(max+1));
		}
		return Math.random();
		});
}

/** Creates a diagonal matrix (off-diagonal elements are 0) from a given array of elements
@function {public static Matrix} diagonal
@param {Object} elements - either a Vector or 1-D array that will become the diagonal elements of a matrix that has elements.length rows and columns
@return a matrix with diagonal elements as specified */
Matrix.diagonal = function(elements) {
	var els;
	if(elements instanceof Vector) {
		els = elements.components;
	} else if(elements instanceof Array) {
		els = elements;
	} else {
		return null;
	}
	var M = Matrix.I(els.length);
	for(i = 0; i < els.length; i++) {
		M.setElement(i+1,i+1,els[i]);
	}
	return M;
}
