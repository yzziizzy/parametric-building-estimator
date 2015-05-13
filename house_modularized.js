/*

This is the first numerical problem I ever did.  It demonstrates the
power of computers:

Enter lots of data on calorie & nutritive content of foods.  Instruct
the thing to maximize a function describing nutritive content, with a
minimum level of each component, for fixed caloric content.  The
results are that one should eat each day:

        1/2 chicken
        1 egg
        1 glass of skim milk
        27 heads of lettuce.
                -- Rev. Adrian Melott

*/



var _ = require('lodash');
var util = require('util');
var colors = require('colors');

var QList = require('./qlist');

var ceil = Math.ceil;
var floor = Math.floor;
var max = Math.max;
var min = Math.min;


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



Object.defineProperty(Array.prototype, 'pluck', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(prop) {
		return this.map(function(x) { return x[prop]; });
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



/*
questions:

stud/rafter centers
nails/screws per sheathing
thickness of wall and ceiling sheathing


TODO:
windows and doors
screws and nails
caulking
soffets
flashing
(finish off metal roof stuff)
roof vents
paint
trim and baseboards
ringers
mud

FUTURE:
electrical
plumbing
interior walls

*/
// var costs = {
// 	d2x4: 2.7,
// 	d2x6: 4,
// 	d2x8: 6,
// 	d2x10: 8,
// 	d2x12: 12,
// 	cdx_5: 18,
// 	cdx_75: 26,
// 	osb_716: 13.5,
// 	foam: 1.5,
// 	roof_felt_30lb: 21 / 216, // $21 for 216 sqft 
// 	metalRoof_3x16: 46,
// 	metalRoof_gable: 15, // 12'
// 	metalRoof_screws: 22 / 250, // bag of 250
// 	hurricane_strap: .75,
// 	concrete: 100,
// 	drywall: 13,
// 	tyvek: 160 / 150, // 9x150
// 	siding: 7.35 / 8, // 12'x8" = 8 sq ft, fiber cement lap
// 	flooring: 2 + .50, // engineered hardwood and underlayment
// };



function dimScalar(dim) {
	if(typeof dim == 'number') return dim;
	if(typeof dim == 'undefined') return 1;
	
	var s = 1;
	if(dim.w) s *= dim.w;
	if(dim.h) s *= dim.h;
	if(dim.l) s *= dim.l;
	
	return s;
}

function dimOrder(dim) {
	if(typeof dim == 'number') return 0;
	if(typeof dim == 'undefined') return 0;
	
	var s = 0;
	if(dim.w) s++;
	if(dim.h) s++;
	if(dim.l) s++;
	
	return s;
}



var nextStockId = 1;
function Stock(dim, cost) {
	
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



var supply = {
	d2x4: [
		Stock(d(8), 2.7),
		Stock(d(10), 3.2),
		Stock(d(12), 4),
		Stock(d(16), 5.4),
	],
	d2x6: [
		Stock(d(8), 4),
	],
	d2x8: [
		Stock(d(8), 6),
	],
	d2x10: [
		Stock(d(8), 8),
	],
	d2x12: [
		Stock(d(8), 12),
	],
	foam: Stock(1, 1.5),
	hurricane_strap: Stock(1, .75),
	concrete: Stock(1, 100),
	roof_felt_30lb: Stock(d(1, 1), 21 / 216), // $21 for 216 sqft 
	tyvek: Stock(1, 21 / 216), // $21 for 216 sqft 
	flooring: Stock(1, 2 + .50), // engineered hardwood and underlayment
	siding: Stock(1, 7.35 / 8), // 12'x8" = 8 sq ft, fiber cement lap
	osb_716: Stock(d(4, 8), 13.5),
	cdx_5: Stock(d(4, 8), 18),
	cdx_75: Stock(d(4, 8), 26),
	drywall: Stock(d(4, 8), 13),
	metalRoof_panel: Stock(d(3, 16), 46),
	metalRoof_gable: Stock(d(12), 15),
	metalRoof_screws: Stock(1, 22 / 250), // bag of 250
	
}.forceArray();








function linearAllCuts(minLen, lengths, lenFn, acc) {
	var cuts = [];
	acc = acc || [];
	if(minLen <= 0) return [acc];
	if(isNaN(minLen)) {
		console.log('minlen = Nan'.red);
		console.log(util.inspect(arguments, true, null).red);
		throw new Error('minlen is nan');
		process.exit(1);
	}
	
// 	console.log((''+minLen).yellow);
	
	for(var i = 0; i < lengths.length; i++) {
// 		console.log(i, minLen, lengths[i]);
		var d = lenFn(lengths[i]);
		if(isNaN(d)) {
			console.log('d is nan'.red);
			console.log((util.inspect(lengths[i])).yellow);
			throw new Error('d is nan');
			process.exit(1);
		}
		cuts = cuts.concat(
			linearAllCuts(
				minLen - d,
				lengths,
				lenFn,
				acc.concat([lengths[i]])
			)
		);
	};
	
	return cuts;
}

function calcCutCost(cutPlans, targetLen) {
	return cutPlans.map(function(cuts) {
		var total = cuts.reduce(function(acc, item) { return acc + item.scalarDim }, 0);
		return {
			cuts: cuts,
			cost: cuts.reduce(function(acc, item) { return acc + item.cost }, 0),
			totalLen: total,
			waste: total - targetLen,
		};
	});
}


function cheapestCut(cutPlans) {
	var cost = 14000000000000; // no house should cost more than the US national debt...
	var obj = null;
	for(var i = 0; i < cutPlans.length; i++) {
		var p = cutPlans[i];
		if(p.cost < cost) {
			cost = p.cost;
			obj = p;
		}
	}
	
	return obj;
}

// currently assumes only one type of supply and square dimensions
function sheetCut(cut, supplies) {
// 	console.log('----------sheet cut--------'.magenta);
// 	console.log(cut);
// 	console.log(supplies);
	
	function trySupplyDirection(w, l, supply) {
		
		var qty = ceil(cut.dim.l / l) * ceil(cut.dim.w / w);
		
		return {
			cuts: [ supply ],
			unitCost: supply.cost,
			totalArea: qty * l * w,
			waste: (qty * l * w) - (cut.dim.l * cut.dim.w),
			qty: qty,
			cost: supply.cost * qty,
		};
	}
	
	function bestSupplyDirection(supply) {
		var horz = trySupplyDirection(supply.dim.l, supply.dim.w, supply);
		var vert = trySupplyDirection(supply.dim.w, supply.dim.l, supply);
		
		return horz.cost < vert.cost ? horz : vert;
	}
	
	var bestCut = bestSupplyDirection(supplies[0]);
	
	var cnt = cut.cnt || 1;
	bestCut.qty *= cnt;
	bestCut.waste *= cnt;
	bestCut.totalArea *= cnt;
	bestCut.cost *= cnt;
	
// 	console.log('^^^^^^^^^^^^^^^^^^^^^^^^^'.magenta);
	
	return bestCut;
}

// currently assumes only one type of supply and cubic dimensions
function volumeCut(cut, supplies) {
	
	return [];
}



// returns a segment cut list
                   /* cut  */  
function cutSegment(segment) {
	
	
	
	var cutPlanOrders = {
		'0': function() { // units
			var cutplans = linearAllCuts(segment.dim, stocks, function(x) { 
				
				return typeof x.dim == 'number' ? x.dim : x.dim.l; 
				
			});
			var bestCut = cheapestCut(calcCutCost(cutplans, segment.dim));
			
			bestCut.unitCost = bestCut.cost;
			bestCut.cost *= segment.cnt || 1;
			bestCut.qty = segment.cnt || 1;
			return bestCut;
		},
		'1': function() { // linear
			var cutplans = linearAllCuts(dimScalar(segment.dim), stocks, function(x) { return x.dim.l; });
			var bestCut = cheapestCut(calcCutCost(cutplans, segment.dim));
			
			bestCut.unitCost = bestCut.cost;
			bestCut.cost *= segment.cnt || 1;
			bestCut.qty = segment.cnt || 1;
			return bestCut;
		},
		'2': function() { // sheets
			return sheetCut(segment, stocks);
		},
		'3': function() { // volume
			return volumeCut(segment, stocks);
		}
	};
	
	var stocks = supply[segment.material];
	
	var order = dimOrder(segment.dim);
	
	if(false) {
		console.log('\n-------- segment -------------\n'.magenta);
		console.log('  order:   ' + order);
		console.log('  segment:   ' + util.inspect(segment).green);
		console.log('  cut qty: ' + (segment.cnt || 1)); 
		console.log('  cut dim: ' + (typeof segment.dim == 'object' ? util.inspect(segment.dim) : segment.dim)); 
		console.log('\n^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n'.magenta);
	}
	// 	console.log(order);
//  	console.log(segment);
	
	
	var cp = cutPlanOrders[order]();
	
	cp.material = segment.material;
	
	return cp;
	// ,multiply in the quantity later
}



function combineCutPlans(plans) {
	
	
	
	
	
}



// for(var i = 0; i < 50; i++) {
// 	var plan = findCheapestCutPlan(i, tbf.d2x4);
// 	
// 	console.log(i, plan.cost.toFixed(2,2) , plan.waste);
// }




function getCost(materialPlans) {
	
	return materialPlans.reduce(function(acc, plans, type) {
		acc[type] = plans.reduce(function(acc, plan) {
			return (plan.cost ? acc + plan.cost : acc);
		}, 0);
		
		acc.total += acc[type]; 
		return acc;
		
	}, {total: 0});
	
};



function getQty(bom) {
	
	return bom.reduce(function(acc, plans, type) {
		acc[type] = plans.reduce(function(acc, plan) {
			return (plan.cost ? acc + plan.cost : acc);
		}, 0);
		
		acc.total += acc[type]; 
		return acc;
		
	}, {total: 0});
	
};



function crunch() {
	var shellRaw = shell(40,20);
	/*	d2x4: [ { dim: 20, cnt: 3 } ],
		osb_716: [{dim: {w: 30, h: 20} }] 
	} ;*/
	console.log('---- Raw Shell ----'.cyan);
	console.log(shellRaw);
	console.log('^^^^^^^^^^^^^^^^^^^'.cyan);
	
	plans = shellRaw.map(function(needs, type) {
		return needs.map(function(cut) {
			//console.log(cut);
			// hacks for incomplete data
			//if(typeof cut.dim != 'number') return 0;
			if(!supply[type]) {
				console.log(('!! Error: no supply for type "' + type + '"').red);
				return 0;
			}
			
			console.log('\n** Finding cut plan for "' + type + '"');
			
			return findCheapestCutPlan(cut, supply[type]);
		});
	});
	
	
	//console.log('\n\n---- Plans ----');
	
	//console.log(plans);
	
	console.log(getCost(plans));
// 	console.log(getBOM(plans));
	
	//var shellCuts = calcCuts(raw, calcUnitCost(supply));
};

//crunch();

function Component(members) {
	return members.forceArray();
};

function CompMember(dim, cnt, orient) {
	return {
		dim: dim,
		cnt: cnt || 1,
		orient: orient,
	}
};
	
function d(l, w, h) {
	var o = {};
	
	if(l) o.l = l;
	if(w) o.w = w;
	if(h) o.h = h;
	
	return o;
}


// returns a component
function studWall(length, height) {
	// height assumed at 8'
	
	var studCenter = 16 / 12;
	
	var numStuds = ceil(length / studCenter) + 2; // 2 extra for end caps
	var plates = 3 * ceil(length / 8); // top plate is doubled up
	
	var sheathing = ceil(length / 4);
	
	return Component({
		stud: [
			CompMember(length, 3), // plates
			CompMember(8, numStuds)], // plates
		sheathing: CompMember(d(length, 8), sheathing),
		insulation: CompMember(1, length * 8),
		drywall: CompMember(d(length, 8), sheathing),
		tyvek: CompMember(1, length * 8),
		siding: CompMember(1, length * 8),
	});
}

// function add(arr) {
// 	
// 	return arr.reduce(function(acc, x) {
// 		for(var k in x) {
// 			if(!acc[k]) acc[k] = x[k];
// 			else acc[k] = acc[k].concat(x[k]);
// 		}
// 		return acc;
// 	}, {});
// }

/*
function shell(length, width) {
	return add([
		wall(length),
		wall(length),
		wall(width),
		wall(width),
		prismRoof(length, width, 8),
		foundation(length, width, 8),
	]);
};*/

function prismRoof(length, width, height) {
	
	var hyp = Math.sqrt((height * height) + ((width/2) * (width/2)));
	
	// roof sheathing must be horizontal
	var sheathing = ceil(length / 8) * ceil(hyp / 4);
	
	var rafterCenter = 16 / 12;
	
	var rafters = ceil(length / rafterCenter);
	
	var rafterType;
	if(hyp > 24) rafterType = 'd2x12';
	if(hyp > 20) rafterType = 'd2x10';
	else if(hyp > 16) rafterType = 'd2x8';
	else if(hyp > 12) rafterType = 'd2x6';
	else rafterType = 'd2x4';
	
	var ceilingRafters = ceil(width / 8) * rafters;
	var vertSupport = ceil(height / 8) * rafters;
	
	// metal roofing: $46 for 3x16'
	
	var mLen = ceil(length / 3) * 2;
	var metalPanels = ceil((mLen * hyp) / 16);
	var metalScrews = metalPanels * 3 * 16;
	var metalGable = ceil(length / 12);
	
	// TODO 1or2x2's to lift the roofing
	// TODO: felt
	
	// TODO: roof nails, every rafter, 12"oc
	
	//ceiling drywall
	var drywall = min(ceil(length / 4) * ceil(width / 8), 
					  ceil(length / 8) * ceil(width / 4)); 
	// TODO: screws every stud, 16"oc 
	
	return Component({
		sheathing: CompMember(d(length, hyp), 2, 'h'),
		roof_felt_30lb: CompMember(d(length, hyp), 2, 'h'),
		metalRoof_panel: CompMember(d(length, hyp), 2, 'v'),
		metalRoof_gable: CompMember(length, 1),
		metalRoof_screws: CompMember(1, metalScrews),
		insulation: CompMember(1, length * hyp * 2),
		hurricane_strap: CompMember(1, rafters * 2),
		drywall: CompMember(d(length, width), drywall),
		rafter: [
			CompMember(d(hyp), rafters * 2), // risers
			CompMember(d(width), rafters), // hip rafters
			CompMember(d(height), rafters), // jack studs
		],
	});
}


function foundation(length, width, thickness) {
	return Component({
		concrete: CompMember(1, (length * width * (thickness / 12)) / 27),
// 		flooring: [{dim: {w: length, h: width}}],
		flooring: CompMember(1, length * width),
// 		rebar_5: [5], 
	});
};





// returns a list of components
function TraditionalWoodFramed(length, width, roofHeight) {
	return [
		studWall(length),
		studWall(length),
		studWall(width),
		studWall(width),
		prismRoof(length, width, roofHeight),
		foundation(length, width, 8),
	];
	
	
}


function processComponents(segments) {
// 	console.log(segments);
	
	// calculate cuts
	return segments.map(function(segment) {
		
		var cutList = cutSegment(segment);
// 		console.log(cutList);
		return cutList;
		
	});
	
}


// flatten one level. i hate having to remember the args for _.flatten for one level 
function squash(arr) {
	var o = [];
	for(var i = 0, len = arr.length; i < len; i++) {
		o.concat(arr[i]);
	}
	return o;
}

meh();

// returns list of Component Members
function meh() { 
	var comps =  TraditionalWoodFramed(40, 20, 5).objectMerge();
	
	
	var cl = processComponents(compToSegments(comps));// need to make this a map 
	
	//console.log(squash(cl.pluck('cuts')));
	//console.log(cl[0]);
	
	var cost = cl.reduce(function(acc, x) {
		return acc + (isNaN(x.cost) ? 0 : x.cost); 
	}, 0);
	
	
	console.log('Bill Of Materials:'.bold.red);
	
	var cost_breakdown = cl.reduce(function(acc, x) {
		acc[x.material] = (acc[x.material] || 0) + (isNaN(x.cost) ? 0 : x.cost); 
		return acc;
	}, {});
	console.log(cost_breakdown);
	console.log(('total cost: '.bold.red) + cost.toFixed(2));
	
	// split out waste
	
	// return component cut list here
}






function compToSegments(members) {

	var segments = members.remapKeys({
		sheathing: 'cdx_5',
		stud: 'd2x4',
		insulation: 'foam',
		rafter: 'd2x6', // TODO: needs to be extensible
	});
	
	return segments.unGroup('material');

}



function rConcat(acc, arr) {
	if(arr instanceof Array) return acc.concat(arr);
	acc.push(arr);
	return acc;
}



// console.log('BOM:');
// console.log(shell(20,40));
// console.log('Cost:');
// console.log(getCost(shell(20,40)));
// 
// 


/*

order: 
	build wall frames and nail together first
	roof trusses
	sheathing
	wrap
	facia and soffets
	roofing
	--windows and doors--
	siding
	// interior now
	spray foam
	electrical & plumbing
	drywall
	non-flooring-related trim
	-- light fixtures --
	painting
	flooring
	baseboards
	final plumbing and electrical fixtures, switch plates, etc.
	
	

wall framing:
	ends have double studs with nailer for perpendicular nailing  ~12-16", one flush to top and bottom, 2 or 3 in the middle.
	some people just triple up the studs.
	--->
		wall B butts against wall A at 90degrees.
		wall A has triple studs for nailing B into
		wall B has double stud with nailers to fasten drywall into
	
	studs are 16"oc
	
	vertical studs are cut 3" to accomodate plates (2 stud widths)
	
	walls are nailed together every 12", strength areas are nailed double density
	
	walls are framed initially with only one top plate. the second top plate is lapped over the first after the walls are assembed to help lock the walls together
	
	
roof:
	8" min overhang with soffets
	
	ends have doubled rafters
	at least 2 doubled rafters in the middle
	rafters 16"oc or tighter
	
	StrongTie makes gang plates and rafter plates
	rafter-holding hangers (diamond shaped) for every rafter, on the inside
	hurricane straps for every rafter, on the outside
	
	use 3",6p galv nails for rafter plates. they are installed diagonally so as to not blow out the other side.
	
	if cathedral, rafters must be notched to fit on sill plate
	hip rafters are where the cailing joists sit on the walls and overhang the house
	hip rafters are cut on angle to meet riser, butt against them, and ganged onto the riser
	
	ridge beam:
		usually the same width as the risers
		special plates join onto the ridge beam
		also 3" 6pg
		usually 2 boards sistered
		no need to notch the risers to fit the ridge beam
		
	jack studs attach to ridge beam with special plates
	jack stud is vertical center board
	generally the same width as the risers
	angled jack studs meet the risers in the middle, often the same widths
	jack studs are gang nailed to hip rafters
	
	hip rafters are usually the same width as the risers
	
	check local for hurricane strap nailing guidelines. it may be 20+ nails/staples per strap
	
	some people do straps over the ridge beam from rafter to rafter

wall& roof sheathing:
	7/16th osb
	2" 8 penny galvanized nails, or 2" wide crown staples
	6" oc, every stud
	walls always installed vertical
	roof is always horizontal and staggered
	roof starts at the bottom and works up
	roof needs plywood clips
	
	

wrap:
	tyvek wrap, overlapped at least 6 inches. use "poster" hand nailer
	fold into windows
	there's special window tape of some kind

facia and soffets:
	facia, 1x6's all the way around
	they need to hang down an inch to recess the soffets
	regular vinyl soffets

roofing:
	30# felt, overlapped 6" or so
	use special nails for felt paper
	-- flashing --
	add drip edge to roof on edges
	check on details of metal roof manufacturer for details on installation
	
siding:
	trim around windows first
	next corner posts
	next metal starter strip on the bottom of the wall
	siding has plastic backing; research
	siding should not be nailed tightly
	sidind should be able to move with thermal/humidity expansion
	nail should be waterproof (aluminum or roofing), 1.5" 
	nail should go in the slot to give room

	
drywall:
	vapor barrier
	1.25" drywall screws
	ceiling first, staggered
	stand the walls vertical
	mud seams:
		tape seams, fiber tape
		corner bead, inside and outside
	5-gallon buckets of mud have coverage estimates
	for texture, use 10-min powder mixed like pancake batter (a little wet)
	for 12x12 room, usage will be one bag (probably 10 lbs)
	

trim:
	1.5-2" trim nail 18ga
	quality way, only way really, is with a nail gun
	caulking bead on corners and joints and top and all gaps
	~50' linear per tube
	spackle the holes
	white acrylic calking, Apex from Lowes white tube light blue words
	

painting:
	good primer first, 1 coat, it may be a bit cheaper than the paint 
	then quality paint, 1 coat, at least $30-50/gal (Valspar, Sherwin Williams Superpaint, Benjamin Moore)
	1/2" roller napp, not 3/8"
	never let the roller go dry
	spraying and backrolling is the best
	same for exterior, only with exterior paint
	white caulking bead in corners between colors after paint
	white acrylic calking, Apex from Lowes white tube light blue words

	
	
	
sistering: 
	use construction adhesive, does not have to be liquid nail
	lapp them by a foot at least
	nail together profusely, at least every 4 inches, from alternating sides
	
	


nails per joint in framing: 3, 2 if wood is weak and blows out
3", 6 penny galvanized nails for joining all studs
2.5" 6p for sistering beams
better to have gang nails too large than too small



vapor barrier



*/