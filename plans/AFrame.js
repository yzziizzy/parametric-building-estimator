

var studWall = require('./parts/walls').studWall;
var prismRoof = require('./parts/roofs').prismRoof;
var slabFoundation = require('./parts/foundations').slab;






function aframe(length, width, height) {
	
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
	
	//var ceilingRafters = ceil(width / 8) * rafters;
	//var vertSupport = ceil(height / 8) * rafters;
	
	// need collar rafters
	
	// metal roofing: $46 for 3x16'
	
	var mLen = ceil(length / 3) * 2;
	var metalPanels = ceil((mLen * hyp) / 16);
	var metalScrews = metalPanels * 3 * 16;
	var metalGable = ceil(length / 12);
	
	// TODO 1or2x2's to lift the roofing

	
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
		//hurricane_strap: CompMember(1, rafters * 2), //?
		drywall: CompMember(d(length, width), drywall),
		rafter: [
			CompMember(d(hyp), rafters * 2), // risers
			//CompMember(d(width), rafters), // hip rafters
			//CompMember(d(height), rafters), // jack studs
		],
	});

}






module.exports = function(options) { return {
	components: function() {
		var length = options.length,
			width = options.width;
			height = options.height;
		
		
		
		
		return [
			// TODO: fix
			aframe(length, width, options.height),
			slabFoundation(length, width, options.foundationDepth || 8),
		];
	},
	
	options: [ 
		{ name: 'length', unit: 'feet', def: 20, range: [10, Infinity], major: true, desc: 'House length, parallel to the roof line' },
		{ name: 'width', unit: 'feet', def: 15, range: [10, Infinity], major: true, desc: 'House width at the ground' },
		{ name: 'height', unit: 'feet', def: 20, range: [15, 40], major: true, desc: 'Height at the roof peak' },
		{ name: 'foundationDepth', unit: 'inches', def: 8, range: [6, 18], desc: 'Thickness of foundation slab' },
	],
	
	area: function() {
		return options.length * options.width;
	},
	livableArea: function() {
		
		
	},

	volume: function() {
		return options.length * options.width * options.height * .5;
	},
	livableVolume: function() {
		var minHeadroom = 6;
		
		// trig goes here
		
		
		return (options.length * options.width * options.height * .5) - sides;
	},
	
}};
	



 
