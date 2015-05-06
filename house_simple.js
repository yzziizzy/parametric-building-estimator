
var ceil = Math.ceil;
var floor = Math.floor;
var max = Math.max;
var min = Math.min;


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
	rebar_5: 0,
}


function wall(length, height) {
	// height assumed at 8'
	
	var studCenter = 16 / 12;
	
	var numStuds = ceil(length / studCenter) + 2; // 2 extra for end caps
	var plates = 3 * ceil(length / 8); // top plate is doubled up
	
	var sheathing = ceil(length / 4);
	
	return {
		d2x4: plates + numStuds,
		osb_716: sheathing,
		foam: length * 8,
		drywall: sheathing,
		tyvek: length,
		siding: length * 8,
	};
}

function add(arr) {
	
	return arr.reduce(function(acc, x) {
		for(var k in x) {
			if(!acc[k]) acc[k] = x[k];
			else acc[k] += x[k];
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
		osb_716: sheathing * 2,
		d2x4: ceilingRafters + vertSupport, 
		metalRoof_3x16: metalPanels,
		metalRoof_gable: metalGable,
		metalRoof_screws: metalScrews,
		hurricane_strap: rafters * 2,
		roof_felt_30lb: length * hyp * 2,
		foam: length * hyp * 2,
		drywall: drywall,
	};
	
	out[rafterType] = rafters * 2;
	
	return out;
}


function foundation(length, width, thickness) {
	return {
		concrete: (length * width * (thickness / 12)) / 27,
		flooring: length * width,
		rebar_5: 5, 
	};
};


function getCost(bom) {
	var out = {total: 0};
	for(k in bom) {
		out[k] = bom[k] * costs[k];
		out.total += out[k];
	}
	return out;
};

console.log('BOM:');
console.log(prismRoof(40, 20, 8));
console.log('Cost:');
console.log(getCost(prismRoof(40, 20, 8)));




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