/**Mathnetics Copyright (c) 2008 Shane Steinert-Threlkeld
Dual-licensed under the MIT and GNU GPL Licenses.
For more information, see LICENSE file */

/**A mathematical set, essentially nothing but a collection of objects.  The class is essentially a wrapper for an array which defines
some traditional operations done on sets, such as cartesianProduct.
@class Set */

/**Constructor function for a new set. If no parameters supplied, constructs an empty (null) set
@paramset fromArray
@param {optional Array} elements - the elements of your set
@paramset clone
@param {optional Set} set - the set to clone
@constructor Set */
function Set(elements) {
	/**the elements of the set 
	@variable {Array} elements */
	this.elements = new Array();
	/**the cardinality ("dimension") of the set 
	@variable {int} cardinality */
	this.cardinality = 0;
	if(elements) {
		if(elements instanceof Array) {
			this.elements = elements;
		}
		if(elements instanceof Set) {
			this.elements = elements.elements.slice();
		}
		this.cardinality = this.elements.length;
	} else {
		this.elements = new Array();
		this.cardinality = 0;
	}
}

Set.prototype = {


	/**Determines if a specified element is in the set of this group.
	@function {public boolean} inSet
	@return true if element is in set, false otherwise */
	inSet: function(el) {
	       for(i = 0; i < this.cardinality; i++) {
		       if(el == this.elements[i]) {
			       return true;
		       }
	       }
	       return false;
       },

	/**Tests whether or not two sets (including subsets, which must be defined as sets and not simply arrays) are equal.
	@function {public boolean} equalTo
	@param {Set} set - the set to compare to
	@return true if the two sets are equal, false otherwise */
	equalTo: function(set) {
		if(this.cardinality != set.cardinality) {
			return false;
		}
		for(var i = 0; i < this.cardinality; i++) {
			if(this.elements[i] instanceof Set) {
				if(!this.elements[i].equalTo(set.elements[i])) {
					return false;
				} else {
					continue;
				}
			}
			//NOTE: only change to !== if you are very sure about enforcing data types
			if(this.elements[i] != set.elements[i]) {
				return false;
			}
		}
		return true;	
	},

	/**Tests to see if a set is a subset (not necessarily a proper subset; i.e. by this method, a set is a subset of itself) of a given set.
	@function {public boolean} subsetOf
	@param {Set} set - the set that may or may not be a superset of the original
	@return true if this is a subset of set, false otherwise */
	subsetOf: function(set) {
		for(i = 0; i < this.cardinality; i++) {
			if(!set.inSet(this.elements[i])) {
				return false;
			}
		}
		return true;
	},

	/**Tests if this set is a proper subset of a given set (i.e. there is at least one element in the superset not in the subset).
	@function {public boolean} properSubsetOf
	@param {Set} set - the set which may or may not be a strict superset
	@return true if this is a proper subset of set, false otherwise */
	properSubsetOf: function(set) {
		if(this.subsetOf(set)) {
			for(i = 0; i < set.cardinality; i++) {
				if(!this.inSet(set.elements[i])) {
					return true;
				}
			}
			return false;
		} else {
			return false;
		}
	},

	/**Tests if the set is a superset of a given set.  Note: not strict definition of superset; any set is also a superset of itself by this definition.
	@function {public boolean} supersetOf
	@param {Set} set - the set which may or may not be a subset of the original
	@return true if this is a superset of set, false otherwise */
	supersetOf: function(set) {
		if(set.subsetOf(this)) {
			return true;
		} else {
			return false;
		}
	},

	/**Tests whether or not this set is a proper superset of a given set.
	@function {public boolean} properSupersetOf
	@param {Set} set - the set which may or may not be a proper subset
	@return true if this is proper superset of set, false if not */
	properSupersetOf: function(set) {
		if(set.properSubsetOf(this)) {
			return true;
		} else {
			return false;
		}
	},

	/**Creates a new set that is the union of two sets.
	@function {public Set} union
	@param {Set} set - the set to join with the current set
	@return a new set that is the union of the calling and given sets */
	union: function(set) {
		var newSet = new Set(this);
		var testElement;
		for(i = 0; i < set.cardinality; i++) {
			testElement = set.elements[i];
			if(!newSet.inSet(testElement)) {
				newSet.addElement(testElement);
			}
		}
		return newSet;
	},

	/**Creates a new set out of the intersection (shared elements) of two sets.
	@function {public Set} intersection
	@param {Set} set - the set with which to find the intersection
	@return the intersection of the two sets as a new set */
	intersection: function(set) {
		var newSet = new Set();
		var testElement;
		var i = 0;
		while(i < set.cardinality) {		
			testElement = set.elements[i];
			if(this.inSet(testElement)) {
				newSet.addElement(testElement);
			}
			i++;
		}
		return newSet;
	},

	/**Creates a new set that is the relative complement of two sets. This operation is analogous to subtracting the specified set from the original set.
	@function {public Set} complement
	@param {Set} set - the set to which to find the complement
	@return a new set that is the specified complement */
	complement: function(set) {
		var newSet = new Set(this);
		var testElement;
		var i = 0;
		while(i < set.cardinality) {
			testElement = set.elements[i];
			if(newSet.inSet(testElement)) {
				newSet.removeElement(testElement);
			}
			i++;
		}
		return newSet;
	},

	/**Calculates the Cartesian product of two sets (the set of all ordered pairs, which are here treated as subsets).
	@function {public Set} cartesianProduct
	@param {Set} set - the set with which to compute the product
	@return a new set that is the Cartesian product of the other two */
	cartesianProduct: function(set) {
		var newSet = new Set();
		var el1, el2;
		var i = 0, j= 0;
		while(i < this.cardinality) {
			j = 0;
			el1 = this.elements[i];
			while(j < set.cardinality) {
				el2 = set.elements[j];
				newSet.addElement(new Set([el1,el2]));
				j++;
			}
			i++;
		}
		return newSet;
	},

	/**Adds a new element to the set and updates the cardinality.
	@function {public Set} addElement
	@param {Object} el - the element to be added 
	@return this set, updated */
	addElement: function(el) {
		this.elements[this.cardinality] = el;
		this.cardinality++;
		return this;
	},

	/**Removes ALL OCCURENCES of an element from the set and updates the cardinality.
	@function {public Set} removeElement
	@param {Object} el - the element to be removed 
	@return this set, updated */
	removeElement: function(el) {
		while(this.inSet(el)) {
			var index = this.indexOf(el) - 1;
			this.elements.splice(index, 1);
			this.cardinality--;
		}
		return this;
	},

	/**Finds the index of the first occurence of the specified element. Should suffice since most sets should be in order and have no recurring elements.
	@function {public int} indexOf
	@param {Object} el - the element for which to find the index
	@return the index of the element in the set (NOT in the array of the set object) */
	indexOf: function(el) {
		for(i = 0; i < this.cardinality; i++) {
			if(this.elements[i] == el) {
				return i + 1;
			}
		}
	},

	/**Returns a string representation of the set (and subsets).
	@function {public String} toString
	@return the string representatoin of the set.*/
	toString: function() {
		return "{" + this.elements.join(" ") + "}";
	}

} //end Set prototype

/**the empty set {}
@variable {public static Set} empty */
Set.empty = new Set();

/**Creates a set with n zero elements
@function {public static Set} zero
@param {int} n - the number of elements in the zero set 
@return a set of n elements all equal to 0 */
Set.zero = function(n) {
	var elements = new Array();
	for(i = 0; i < n; i++) {
		elements[i] = 0;
	}
	return new Set(elements);
}
