

var studWall = require('./parts/walls').studWall;
var prismRoof = require('./parts/roofs').prismRoof;
var slabFoundation = require('./parts/foundations').slab;





module.exports = function(options) { return {
	components: function() {
		var length = options.length,
			width = options.width;
			
		return [
			studWall(length),
			studWall(length),
			studWall(width),
			studWall(width),
			prismRoof(length, width, options.roofHeight),
			slabFoundation(length, width, options.foundationDepth || 8),
		];
	},
	
	options: [ 
		{ name: 'length', unit: 'feet', desc: 'House length' },
		{ name: 'width', unit: 'feet', desc: 'House width' },
		{ name: 'roofHeight', unit: 'feet', desc: 'Roof height from top of walls' },
		{ name: 'foundationDepth', unit: 'inches', def: 8, desc: 'Thickness of foundation slab' },
	],
	
	area: function() {
		return options.length * options.width;
	},
	
}};
	



 
