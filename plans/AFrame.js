

var studWall = require('./parts/walls').studWall;
var prismRoof = require('./parts/roofs').prismRoof;
var slabFoundation = require('./parts/foundations').slab;





module.exports = function(options) { return {
	components: function() {
		var length = options.length,
			width = options.width;
			height = options.height;
			
		return [
			// TODO: fix
			prismRoof(length, width, options.roofHeight),
			slabFoundation(length, width, options.foundationDepth || 8),
		];
	},
	
	options: [ 
		{ name: 'length', unit: 'feet', desc: 'House length, parallel to the roof line' },
		{ name: 'width', unit: 'feet', desc: 'House width at the ground' },
		{ name: 'height', unit: 'feet', desc: 'Height at the roof peak' },
		{ name: 'foundationDepth', unit: 'inches', def: 8, desc: 'Thickness of foundation slab' },
	],
	
	area: function() {
		return options.length * options.width;
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
	



 
