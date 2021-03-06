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


require('./monkeys');
require('./dsl');

var _ = require('lodash');


var util = require('util');
var colors = require('colors');
var fs = require('fs');
// var Promise = require('bluebird'); // bluebird doesn't like "map" being a property of objects

// var QList = require('./qlist');



var argv = require('minimist')(process.argv.slice(2));


// listing of available materials and their data
var supply = require('./supplies').forceArray();
var supply_byID = supply.unGroup('material').indexBy('id');



var plans = _.indexBy(fs.readdirSync('./plans')
	.filter(function(x) { return x[0] != '.'; })
	.filter(function(x) { return !!x.match(/\.js$/); })
	.map(function(file) {
		return {name: file.replace(/\..*$/, ''), fn: require('./plans/' + file)};
	}), 'name')
	.map(function(o) { return o.fn });




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
	if(!stocks) {
		console.log('no such material: ' + segment.material);
		process.exit(2);
	}
	
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




var defaultMaterials = {
	sheathing: 'cdx_5',
	stud: 'd2x4',
	insulation: 'foam',
	drywall: 'drywall_58',
	rafter: 'd2x6', // TODO: needs to be extensible
	siding: 'fiber_cement_siding',
	floor_joist: 'd2x10',
	floor_decking: 'cdx_75',
	joist_hanger: 'joist_hanger_2x10',
};


function compToSegments(members, materials) {
	return members.remapKeys(materials).unGroup('material');
}





function calcPlanCuts(plan, materials) {
	
	var comps = plan.objectMerge();
	
	return compToSegments(comps, materials).map(cutSegment);
}





// this is the interactive readline version
function meh4() {
	
	var readline = require('readline');
	
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		completer: function(line) {
			return [Object.keys(plans).filter(function(c) { return c.indexOf(line) == 0 }) , line]
		}
	});
	
	
	rl.write('Choose Plan:\n');
	plans.map(function(p, name) {
		rl.write(' ' + name + '\n');
	});
	
	rl.setPrompt('> ');
	
	rl.on('line', function(line) {
		if(plans.hasOwnProperty(line)) {
			rl.write('using ' + line + '\n');
		}
	});
	
	
	rl.prompt();
	
/*	
	rl.question('enter min val ', function(v) {
		rl.write('you entered ' + v);
	})*/
	
	
}

//meh4();



//meh3();
function meh3() {
	
	if(argv.L || argv['list-plans']) {
		Object.keys(plans).sort().map(function(pn) { console.log(pn) });
		return;
	}
	
	var plan = plans[argv._[0]];
	
	if(!plan) {
		console.log('no such plan: ' + argv._[0]);
		process.exit(1);
	}
	
	var min_price = parseFloat(argv.minp);
	var max_price = parseFloat(argv.maxp);
	
	
	var major_dims = argv.dims;
	
	
	// construct starting parameters
	var opts = plan.options.map(function(x) {
		return [x.name, x.range[0]];  
	}).pairsToObj();
	
	
	
	
	
	
	// only take into account 'major' options for now
	// pick an epsilon
	var ep_m = 2;
	
	// calc delta
	
	// guess a new epsilon to find min and max price points, plus some wiggle room
	
	// calc value for everything in between and report results
	
	
}




 meh2();
function meh2() {
	
// 	console.log(argv);
// 	var plan = argv.
	
	if(argv.L || argv['list-plans']) {
		Object.keys(plans).sort().map(function(pn) { console.log(pn) });
		return;
	}
	
	
	if(argv.file) {
		var fo = require('./' + argv.file);
		
		
		var plan = plans[fo.plan];
		if(!plan) {
			console.log('no such plan: ' + argv._[0]);
			process.exit(1);
		}
		
		var opts = fo.opts;
		var from_opts = fo.from;
		var to_opts = fo.to;
		var step_opts = fo.step;
		
	}
	else {
	
		var plan = plans[argv._[0]];
		
		if(!plan) {
			console.log('no such plan: ' + argv._[0]);
			process.exit(1);
		}
	
	
		function parseOpts(s) {
			return s.split(',')
				.map(function(x) { return x.split(':')})
				.pairsToObj()
				.map(parseFloat);
		}
		
		
		if(argv.o) {
			var opts = parseOpts(argv.o.replace(/\s+/, ''));
		}
		if(argv.from) {
			var from_opts = parseOpts(argv.from.replace(/\s+/, ''));
		}
		if(argv.to) {
			var to_opts = parseOpts(argv.to.replace(/\s+/, ''));
		}
		if(argv.step) {
			var step_opts = parseOpts(argv.step.replace(/\s+/, ''));
		}
		
		
	}
	// console.log(step_opts);
	
	// actual work
	function calcCost(opts) {

	}
	
	function printArea(opts) {
		//shit
		console.log(opts, opts.area);
	}
	function printStep(opts) {

		// shit
		console.log(opts.opts, opts.cost);
	}
	
	function printDollarsPerArea(opts) {

		// shit
		console.log(opts.opts, opts.dpa);
	}
	
	function calcAll(opts) {
		var area = plan(opts).area();
		
		var comps = plan(opts).components();
		
		var cl = calcPlanCuts(comps, defaultMaterials);
	
		var cost = parseFloat(cl.reduce(function(acc, x) {
			return acc + (isNaN(x.cost) ? 0 : x.cost); 
		}, 0).toFixed(2));
		
		return {
			opts: opts,
			comps: comps,
			cl: cl,
			cost: cost,
			dpa: (cost / area).toFixed(2),
			area: area,
		};
	}
	
	function printCut(cutPlan) {
		console.log(cutPlan);
		
	}
	
	
	var steps = allSteps(from_opts, to_opts, step_opts, Object.keys(step_opts)).map(calcAll);
	if(argv.a && argv.c) {
		_.sortBy(steps, 'dpa').reverse().map(printDollarsPerArea);
	}
	else if(argv.cost || argv.c) {
		_.sortBy(steps, 'cost').reverse().map(printStep);
	}
	else if(argv.sqft || argv.a) {
		_.sortBy(steps, 'area').map(printArea);
	}
	else if(argv.details || argv.d) {
		var p = _.last(_.sortBy(steps, 'dpa'));
		
// 		console.log(p.cl);
		//p.cl.map(printCut);
		var bom = p.cl.reduce(function(acc, cp) {
			cp.cuts.map(function(c) {
				acc[c.id] = acc[c.id] || 0;
				acc[c.id] += cp.qty;
			});
			
			return acc;
		}, {}).map(function(v, k) {
			var s = supply_byID[k]
			
			console.log(s.material + '-' + s.scalarDim, '\tx' + ceil(v), '\t$' + (v * s.cost).toFixed(2));
			
		});
		
	}
	
	
}



function calcPlan(plan, opts, materials) {
	
	var o = {
		opts: _.extend({}, opts),
		plan: plan,
		materials: materials,
	};
	
	o.comps = plan(opts).components().objectMerge();
	
	o.cuts = compToSegments(o.comps, materials).map(cutSegment);
	
	return o;
}


function aggCosts() {
	
	return cl.reduce(function(acc, x) {
		return acc + (isNaN(x.cost) ? 0 : x.cost); 
	}, 0).toFixed(2);
	
}


function calcTable(from, to, step, plan, materials) {
	
	var steps = allSteps(from, to, step, Object.keys(step));
	

	

	
	return  steps.map()
}



function allSteps(from, to, step, free) {
	if(!free.length) return [{}];
	
	free = free.slice();
	
	var v = free.shift();
	var o = [];
	
	
	// broken condition
	for(var i = from[v]; i <= to[v]; i += step[v]) {
		var x = allSteps(from, to, step, free);
		o = o.concat(x.sow(v, i));
	}

	return o;
}


// meh();

// returns list of Component Members
function meh() { 
//	var comps =  TraditionalWoodFramed(28, 28, 5).objectMerge();
 	//var comps =  Octohouse(12, 5).objectMerge();
	
// 	var comps = plans.OctohouseWoodFramed.components(12, 5).objectMerge()
	
// 	var cl = processComponents(compToSegments(comps));// need to make this a map 
	var opts = {
		sideLength: 12,
		roofHeight: 5,
	};
	var cl = calcPlanCuts(plans.OctohouseWoodFramed(opts).components());
	
	//console.log(cl.pluck('cuts').squash()));
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








function rConcat(acc, arr) {
	if(arr instanceof Array) return acc.concat(arr);
	acc.push(arr);
	return acc;
}




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