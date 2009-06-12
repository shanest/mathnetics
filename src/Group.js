/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

/**Defines a mathematical group, which is a Set, coupled with an operation.
@class mathnetics.Group */

dependencies = ['Set'];
mathnetics.require(dependencies);

mathnetics.Group = function() {
	/**The set representing the group.
	@variable {mathnetics.Set} set */
	this.set = mathnetics.Set.empty();
	/**Either a function, or a string 'addition' or 'multiplication'
	@variable {Function} operation */
	this.operation = null;
	//booleans for each of the 4 axioms of a well-formed group
	/**Whether or not the group has closure 
	@variable {private boolean} hasClosure */
	this.hasClosure = false;
	/**Whether or not the group is associative
	@variable {private boolean} hasAssociativity */
	this.hasAssociativity = false;
	/**Whether or not the group has an identity element
	@variable {private boolean} hasIdentity */
	this.hasIdentity = false;
	/**Whether or not the group satisfies the inverse axiom 
	@variable {private boolean} hasInverse */
	this.hasInverse = false;
	/**the identity element, if it exists 
	@variable {private Number} identity */
	this.identity;
};

/**Generator function for a new group (mathematical).
@param {Function} operator - if a function, must take two parameters (elements of the set); if a string: 'addition' or 'multiplication'
@constructor Group
*/
function Group(elements, operator) {

}

mathnetics.extend(mathnetics.Group.prototype, {


	/**Determines if the group does or does not have closure and sets the boolean hasClosure.
	@function {public boolean} testClosure
	@return true if group has closure, false otherwise */
	testClosure: function() {
		for(i = 0; i < this.set.cardinality; i++) {
			for(j = 0; j < this.set.cardinality;) {
				if(!(this.set.inSet(this.operand(this.set.elements[i],this.set.elements[j])))) {
					this.hasClosure = false;
					return this.hasClosure;
				}
			}
		}
		this.hasClosure = true;
		return this.hasClosure;
	},

	/**Sets the identity element if it exists and hasIdentity to true.
	@function {public Set} setIdentity 
	@return this set */
	setIdentity: function() {
		for(i = 0; i < this.set.cardinality; i++) {
			if(this.operand(this.set.elements[i],this.set.elements[i])==this.set.elements[i]) {
				this.hasIdentity = true;
				this.identity = this.set.elements[i]
			}
		}
		return this;
	},

	/**Gets the identity element if it exists.  Should be called after setIdentity() already has been.
	@function {public Number} getIdentity
	@return the identity element if it exists, false otherwise*/
	getIdentity: function() {
		if(this.hasIdentity) {
			return this.identity;
		} else {
			return false;
		}
	},

	/**Tells whether or not group has identity element.  Should be called after setIdentity() already has been.
	@function {public boolean} testIdentity
	@return true if has identity element, false otherwise */
	testIdentity: function() {
		return this.hasIdentity;
	},

	/**Tests whether or not group is associative.
	@function {public boolean} testAssociativity
	@return true if group is associative, false otherwise */
	testAssociativity: function() {
		for(i = 0; i < this.set.cardinality; i++) {
			for(j = 0; j < this.set.cardinality; j++) {
				for(k = 0; k < this.set.cardinality; k++) {
					if(this.operand(this.operand(this.set.elements[i],this.set.elements[j]),this.set.elements[k]) != this.operand(this.set.elements[i],this.operand(this.set.elements[j],this.set.elements[k]))) {
						this.hasAssociativity = false;
						return this.hasAssociativity;
					}
				}
			}
		}
		this.hasAssociativity = true;
		return this.hasAssociativity;
	},

	/**Tests for the existence of an inverse element for every element.  Should be called after setIdentity().
	@function {public boolean} testInverse
	@return true if every element has an inverse, false otherwise */
	testInverse: function() {
		//number of elements that have inverses
		var numInverses = 0;
		var temp;
		if(this.hasIdentity) {
			for(i = 0; i < this.set.cardinality; i++) {
				temp = false;
				for(j = 0; j < this.set.cardinality; j++) {
					if(this.operand(this.set.elements[i],this.set.elements[j]) == this.identity && this.operand(this.set.elements[j],this.set.elements[i]) == this.identity) {
						temp = true;
					}
				}
				if(temp) {
					numInverses++;
				}
			}
			if(numInverses >= this.set.cardinality) {
				this.hasInverse = true;
			}
			return this.hasInverse;
		} else {
			return this.hasInverse;
		}
	},

	/**Tests to see whether the group satisfies all four axioms in the definition of a formal group.
	Call after testInverse, testIdentity, testAssociativity and testClosure.
	@function {public boolean} isGroup
	@return true if the group does, false otherwise */
	isGroup: function() {
		if(this.hasClosure && this.hasAssociativity && this.hasIdentity && this.hasInverse) {
			return true;
		} else {
			return false;
		}
	},

	/**Tests if a given array (in this case, a permutation) is a cycle of the set.
	@function {public boolean} testCycle
	@param {int[]} array - the array to test
	@return true if array is a cycle, false otherwise */
	testCycle: function(array) {
		var tempvec = new Array();
		var cycle2 = new Array();
		var userCycle = new Array();
		userCycle = array;

		//handle single-element cycles
		if(userCycle.length == 1) {
			if(this.set.elements[userCycle[0]] == userCycle[0]) {
				return true;
			} else {
				return false;
			}
		}
		
		for(i = 0; i < userCycle.length; i++) {
			cycle2[i] = this.set.elements[userCycle[i]];
		}
		var temp = cycle2[userCycle.length - 1];
		for(i = 0; i < cycle2.length; i++) {
			tempvec[i] = cycle2[i];
		}
		cycle2[0] = temp;
		for(i = 1; i < userCycle.length; i++) {
			cycle2[i] = tempvec[i-1];
		}

		if(cycle2.compareArray(userCycle)) {
			return true;
		} else {
			return false;
		}
	},

	/**Returns the set of this group, on which set operations can be done.
	@function {public Set} getSet
	@return the set of this group
	@see Set */
	getSet: function() {
		return this.set;
	},

	/**The actual binary operation that is carried out for the group.
	@function {public Number} operand
	@param {Number} el1 - the first element
	@param {Number} el2 - the second element
	@return (el1 operation el2)**/
	operand: function(el1, el2) {
		if(typeof this.operation == 'function') {
			return this.operation(el1, el2);
		} else {
			if(this.operation == 'multiplication') {
				return el1 * el2;
			}
			if(this.operation == 'addition') {
				return el1 + el2;
			}
		}
	},

	/**Resets the group's current set. Used by constructor.
	@function {public mathnetics.Group} setSet
	@paramset fromArray
	@param {Array} elements - the set of elements that defines the set in the group
	@paramset fromSet
	@param {Set} set - the set to use in the Group
	@return this Group, updated with new set */
	setSet: function(elements) {
		if(elements instanceof Array) {
			this.set = mathnetics.Set.create(elements);
		}
		if(elements instanceof mathnetics.Set) {
			this.set = elements;
		}
		return this;
	},

	/**Sets the operator of the group.
	@function {public mathnetics.Group} setOperation
	@param {Function} operator - if a function, must take two parameters (elements of the set); if a string: 'addition' or 'multiplication'
	@return this Group with updated operation */
	setOperation: function(operator) {
		//add error checking for function
		this.operation = operator;
		return this;
	},

	/**Duplicates the current group.
	@function {public mathnetics.Group} dup
	@return a clone of current group */
	dup: function() {
		return mathnetics.Group.create(this.set, this.operation);
	}

}); //end Group prototype

mathnetics.Group.create = function(elements, operator) {
	var G = new mathnetics.Group();
	return G.setSet(elements).setOperation(operator);
};
