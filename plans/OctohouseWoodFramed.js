


var studWall = require('./parts/walls').studWall;
var prismRoof = require('./parts/roofs').prismRoof;
var slabFoundation = require('./parts/foundations').slab;




module.exports = function(options) { return {
	components: function() {
		var sidelen = options.sideLength;
		var len = sidelen + (sidelen * 2 / Math.sqrt(2));
		console.log(len);
		return [
			studWall(sidelen),
			studWall(sidelen),
			studWall(sidelen),
			studWall(sidelen),
			studWall(sidelen),
			studWall(sidelen),
			studWall(sidelen),
			studWall(sidelen),
			prismRoof(len, len, options.roofHeight),
			slabFoundation(len, len, options.foundationDepth || 8),
		];
	},
	
	options: [ 
		{ name: 'sideLength', unit: 'feet', desc: 'Length of one of the 8 sides' },
		{ name: 'roofHeight', unit: 'feet', desc: 'Roof height from top of walls' },
		{ name: 'foundationDepth', unit: 'inches', def: 8, desc: 'Thickness of foundation slab' },
	],
	
}};











