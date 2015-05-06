
var _ = require('lodash');
var util = require('util');

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
var costs = {
	d2x4: 2.7,
	d2x6: 4,
	d2x8: 6,
	d2x10: 8,
	d2x12: 12,
	cdx_5: 18,
	cdx_75: 26,
	osb_716: 13.5,
	foam: 1.5,
	roof_felt_30lb: 21 / 216, // $21 for 216 sqft 
	metalRoof_3x16: 46,
	metalRoof_gable: 15, // 12'
	metalRoof_screws: 22 / 250, // bag of 250
	hurricane_strap: .75,
	concrete: 100,
	drywall: 13,
	tyvek: 160 / 150, // 9x150
	siding: 7.35 / 8, // 12'x8" = 8 sq ft, fiber cement lap
	flooring: 2 + .50, // engineered hardwood and underlayment
};


var supply = {
	d2x4: [
		{dim: {l: 8}, cost: 2.7},
		{dim: {l: 10}, cost: 3.2},
		{dim: {l: 12}, cost: 4},
		{dim: {l: 16}, cost: 5.4},
	],
	d2x6: [
		{dim: {l: 8}, cost: 4},
	],
	d2x8: [
		{dim: {l: 8}, cost: 6},
	],
	d2x10: [
		{dim: {l: 8}, cost: 8},
	],
	d2x12: [
		{dim: {l: 8}, cost: 12},
	],
	foam: [ {dim: 1, cost: 1.5}],
	hurricane_strap: [ {dim: 1, cost: .75}],
	concrete: [ {dim: 1, cost: 100}],
	roof_felt_30lb: [ {dim: {w: 1, h: 1}, cost: 21 / 216}], // $21 for 216 sqft 
	tyvek: [ {dim: 1, cost: 21 / 216}], // $21 for 216 sqft 
	flooring: [ {dim: 1, cost: 2 + .50}], // engineered hardwood and underlayment
	siding: [ {dim: 1, cost: 7.35 / 8}], // 12'x8" = 8 sq ft, fiber cement lap
	osb_716: [{dim: {w: 4, h: 8}, cost: 13.5}],
	cdx_5: [{dim: {w: 4, h: 8}, cost: 18}],
	cdx_75: [{dim: {w: 4, h: 8}, cost: 26}],
	drywall: [{dim: {w: 4, h: 8}, cost: 13}],
	metalRoof_panel: [{dim: {w: 3, h: 16}, cost: 46}],
	metalRoof_gable: [{dim: {l: 12}, cost: 15}],
	metalRoof_screws: [{dim: 1, cost: 22 / 250}], // bag of 250
	
};




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


var mkSupplyID = (function() {
	var nextSupplyID = 1;
	return function (dim) {
		return "_" + nextSupplyID++;
	};
})();
function tempFn() {
	var nextSupplyID = 1;
	var innerFn = function (dim) {
		return "_" + nextSupplyID++;
	};
	
	return innerFn;
};

var mkSupplyID = tempFn();
supply = calcUnitCost(supply);

function calcUnitCost(supplies) {
	return supplies.map(function(options) {
		if(!(options instanceof Array)) options = [options];
		return options.map(function(x) {
			var s = dimScalar(x.dim);
			var uc = (x.cost || 0) / s;
			return _.extend({
				unitCost: uc,
				scalarDim: s,
				order: dimOrder(x.dim),
				id: mkSupplyID(x.dim),
			}, x);
		});
	});
}

function linearAllCuts(minLen, lengths, lenFn, acc) {
	var cuts = [];
	acc = acc || [];
	if(minLen <= 0) return [acc];
	
	for(var i = 0; i < lengths.length; i++) {
// 		console.log(i, minLen, lengths[i]);
		var d = lenFn(lengths[i]);
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
	console.log(cut);
	console.log(supplies);
	
	function trySupplyDirection(w, h, supply) {
		
		var qty = ceil(cut.dim.h / h) * ceil(cut.dim.w / w);
		console.log(qty);
		return {
			cuts: [ supply ],
			unitCost: supply.cost,
			totalArea: qty * h * w,
			waste: (qty * h * w) - (cut.dim.h * cut.dim.w),
			qty: qty,
			cost: supply.cost * qty,
		};
	}
	
	function bestSupplyDirection(supply) {
		var horz = trySupplyDirection(supply.dim.h, supply.dim.w, supply);
		var vert = trySupplyDirection(supply.dim.w, supply.dim.h, supply);
		
		return horz.cost < vert.cost ? horz : vert;
	}
	
	var bestCut = bestSupplyDirection(supplies[0]);
	
	var cnt = cut.cnt || 1;
	bestCut.qty *= cnt;
	bestCut.waste *= cnt;
	bestCut.totalArea *= cnt;
	bestCut.cost *= cnt;
	
	return bestCut;
}

// currently assumes only one type of supply and cubic dimensions
function volumeCut(cut, supplies) {
	
	return [];
}


function findCheapestCutPlan(cut, supplies) {
	
	cutPlanOrders = {
		'0': function() { // units
			var cutplans = linearAllCuts(cut.dim, supplies, function(x) { return x.dim; });
			var bestCut = cheapestCut(calcCutCost(cutplans, cut.dim));
			
			bestCut.unitCost = bestCut.cost;
			bestCut.cost *= cut.cnt || 1;
			bestCut.qty = cut.cnt || 1;
			return bestCut;
		},
		'1': function() { // linear
			var cutplans = linearAllCuts(cut.dim, supplies, function(x) { return x.dim.l; });
			var bestCut = cheapestCut(calcCutCost(cutplans, cut.dim));
			
			bestCut.unitCost = bestCut.cost;
			bestCut.cost *= cut.cnt || 1;
			bestCut.qty = cut.cnt || 1;
			return bestCut;
		},
		'2': function() { // sheets
			return sheetCut(cut, supplies);
		},
		'3': function() { // volume
			return volumeCut(cut, supplies);
		}
	};
	
	var order = dimOrder(supplies[0].dim);
	console.log('  order:   ' + order);
	console.log('  cut qty: ' + (cut.cnt || 1)); 
	console.log('  cut dim: ' + (typeof cut.dim == 'object' ? util.inspect(cut.dim) : cut.dim)); 
// 	console.log(order);
//  	console.log(cut);
	return cutPlanOrders[order]();
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
	console.log('---- Raw Shell ----');
	console.log(shellRaw);
	console.log('^^^^^^^^^^^^^^^^^^^');
	
	plans = shellRaw.map(function(needs, type) {
		return needs.map(function(cut) {
			//console.log(cut);
			// hacks for incomplete data
			//if(typeof cut.dim != 'number') return 0;
			if(!supply[type]) {
				console.log('!! Error: no supply for type "' + type + '"');
				return 0;
			}
			
			console.log('\n** Finding cut plan for "' + type + '"');
			
			return findCheapestCutPlan(cut, supply[type]);
		});
	});
	
	
	console.log('\n\n---- Plans ----');
	
	console.log(plans);
	
	console.log(getCost(plans));
// 	console.log(getBOM(plans));
	
	//var shellCuts = calcCuts(raw, calcUnitCost(supply));
};

crunch();

function wall(length, height) {
	// height assumed at 8'
	
	var studCenter = 16 / 12;
	
	var numStuds = ceil(length / studCenter) + 2; // 2 extra for end caps
	var plates = 3 * ceil(length / 8); // top plate is doubled up
	
	var sheathing = ceil(length / 4);
	
	return {
		d2x4: [
			{dim: length, cnt: 3}, // plates
			{dim: 8, cnt: numStuds}], // plates
		cdx_5: [{dim: {w: length, h: 8}}],
		foam: [{dim: 1, cnt: length * 8}],
		drywall: [{dim: {w: length, h: 8}}],
// 		tyvek: [{dim: {w: length, h: 8}}],
		tyvek: [{dim: 1, cnt: length * 8}],
// 		siding: [{dim: {w: length, h: 8}}],
		siding: [{dim: 1, cnt: length * 8}],
	};
}

function add(arr) {
	
	return arr.reduce(function(acc, x) {
		for(var k in x) {
			if(!acc[k]) acc[k] = x[k];
			else acc[k] = acc[k].concat(x[k]);
		}
		return acc;
	}, {});
}


function shell(length, width) {
	return add([
		wall(length),
		wall(length),
		wall(width),
		wall(width),
		prismRoof(length, width, 8),
		foundation(length, width, 8),
	]);
};

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
	
	var out = {
		cdx_5: [{dim: {w: length, h: hyp}, cnt: 2, orient: 'h' }],
		roof_felt_30lb: [{dim: {w: length, h: hyp}, cnt: 2, orient: 'h' }],
		metalRoof_panel: [{dim: {w: length, h: hyp}, cnt: 2, orient: 'v' }],
		metalRoof_gable: [{dim: length, cnt: 1}],
		metalRoof_screws: [{dim: 1, cnt: metalScrews}],
		foam: [{dim: 1, cnt: length * hyp * 2 }],
		hurricane_strap: [{dim: 1, cnt: rafters * 2}],
		drywall: [{dim: {w: length, h: width}}],
	};
	
	out[rafterType] = [
		{dim: hyp, cnt: rafters * 2}, // risers
		{dim: width, cnt: rafters}, // hip rafters
		{dim: height, cnt: rafters}, // jack studs
	];
	
	return out;
}


function foundation(length, width, thickness) {
	return {
		concrete: [{dim: 1, cnt: (length * width * (thickness / 12)) / 27}],
// 		flooring: [{dim: {w: length, h: width}}],
		flooring: [{dim: 1, cnt: length * width}],
// 		rebar_5: [5], 
	};
};





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