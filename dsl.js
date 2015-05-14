


// general functions

global.d = function(l, w, h) {
	var o = {};
	
	if(l) o.l = l;
	if(w) o.w = w;
	if(h) o.h = h;
	
	return o;
}


global.dimScalar = function(dim) {
	if(typeof dim == 'number') return dim;
	if(typeof dim == 'undefined') return 1;
	
	var s = 1;
	if(dim.w) s *= dim.w;
	if(dim.h) s *= dim.h;
	if(dim.l) s *= dim.l;
	
	return s;
}

global.dimOrder = function(dim) {
	if(typeof dim == 'number') return 0;
	if(typeof dim == 'undefined') return 0;
	
	var s = 0;
	if(dim.w) s++;
	if(dim.h) s++;
	if(dim.l) s++;
	
	return s;
}



var nextStockId = 1;
global.Stock = function(dim, cost) {
	
	var s = dimScalar(dim);
	var uc = (cost || 0) / s;
	
	return {
		dim: dim,
		cost: cost,
		unitCost: uc,
		scalarDim: s,
		order: dimOrder(dim),
		id: '' + nextStockId++,
	};
}



// functions for defining plans

global.Component = function(members) {
	return members.forceArray();
};

global.CompMember = function(dim, cnt, orient) {
	return {
		dim: dim,
		cnt: cnt || 1,
		orient: orient,
	}
};





