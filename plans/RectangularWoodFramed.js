

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
		{ name: 'length', unit: 'feet', def: 15, range: [10, Infinity], major: true, desc: 'House length' },
		{ name: 'width', unit: 'feet', def: 20, range: [10, Infinity], major: true, desc: 'House width' },
		{ name: 'roofHeight', unit: 'feet', def: 5, range: [1, 8], desc: 'Roof height from top of walls' },
		{ name: 'foundationDepth', unit: 'inches', def: 8, range: [6, 18], desc: 'Thickness of foundation slab' },
	],
	
	area: function area() {
		return options.length * options.width;
	},
	volume: function volume() {
		return area() * 8; 
	},
	//livableVolume: volume,
}};
	



 
