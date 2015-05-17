


global.ceil = Math.ceil;
global.floor = Math.floor;
global.max = Math.max;
global.min = Math.min;



function omap(obj, fn, out) {
	out = out || {};
	for(var k in obj) {
		if(!obj.hasOwnProperty(k)) continue;
		out[k] = fn(obj[k], k);
	}
	return out;
}


Object.defineProperty(Object.prototype, 'map', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(fn, out) {
		return omap(this, fn, out);
	}
});

function oreduce(obj, fn, acc) {
	for(var k in obj) {
		if(!obj.hasOwnProperty(k)) continue;
		acc = fn(acc, obj[k], k);
	}
	return acc;
}


Object.defineProperty(Object.prototype, 'reduce', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(fn, acc) {
		return oreduce(this, fn, acc);
	}
});

// makes sure every property is an array
Object.defineProperty(Object.prototype, 'forceArray', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function() {
		for(var p in this) {
			if(!this.hasOwnProperty(p)) continue;
			if(!(this[p] instanceof Array))
				this[p] = [this[p]];
		}
		return this;
	}
});

// swap out keys for other keys
Object.defineProperty(Object.prototype, 'remapKeys', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(table) {
		var out = {};
		for(var p in this) {
			if(!this.hasOwnProperty(p)) continue;
			
			var nk = table[p]
			out[nk || p] = this[p];
		}
		return out;
	}
});


// bad name. need new one. converts an object of arrays into a list of objects with 
//   their original key as the given property name.
Object.defineProperty(Object.prototype, 'unGroup', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(keyName) {
		var out = [];
		for(var p in this) {
			if(!this.hasOwnProperty(p)) continue;
					  
			var arr = this[p];
			if(!(arr instanceof Array)) arr = [arr];
			
			out = out.concat(arr.map(function(x) {
				x[keyName] = p;
				return x;
			}));
		}
		return out;
	}
});





Object.defineProperty(Array.prototype, 'objectMerge', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(prop) {
		return this.reduce(function(acc, x) {
			for(var k in x) {
				if(!acc[k]) acc[k] = x[k];
				else acc[k] = acc[k].concat(x[k]);
			}
			return acc;
		}, {});
	}
});




Object.defineProperty(Array.prototype, 'pluck', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(prop) {
		return this.map(function(x) { return x[prop]; });
	}
});


// flatten one level. i hate having to remember the args for _.flatten for one level 
Object.defineProperty(Array.prototype, 'squash', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(prop) {
		var o = [];
		for(var i = 0, len = this.length; i < len; i++) {
			o.concat(this[i]);
		}
		return o;
	}
});

Object.defineProperty(Array.prototype, 'indexBy', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(prop) {
		var o = {};
		for(var i = 0, len = this.length; i < len; i++) {
			o[this[i][prop]] = this[i];
		}
		return o;
	}
});

Object.defineProperty(Array.prototype, 'pairsToObj', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function() {
		var o = {};
		for(var i = 0, len = this.length; i < len; i++) {
			o[this[i][0]] = this[i][1];
		}
		return o;
	}
});



	// opposite of pluck
Object.defineProperty(Array.prototype, 'sow', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(prop, val) {
		for(var i = 0, len = this.length; i < len; i++) {
			this[i][prop] = val;
		}
		return this;
	}
});

