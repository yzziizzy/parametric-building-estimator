


var studWall = require('./parts/walls').studWall;
var prismRoof = require('./parts/roofs').prismRoof;
var slabFoundation = require('./parts/foundations').slab;




module.exports = function(options) { return {
	components: function() {
		var sidelen = options.sideLength;
		var len = sidelen + (sidelen * 2 / Math.sqrt(2));
// 		console.log(len);
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
		{ name: 'sideLength', unit: 'feet', def: 10, range: [5, Infinity], major: true, desc: 'Length of one of the 8 sides' },
		{ name: 'roofHeight', unit: 'feet', def: 5, range: [1, 10], desc: 'Roof height from top of walls' },
		{ name: 'foundationDepth', unit: 'inches', def: 8, range: [6, 18], desc: 'Thickness of foundation slab' },
	],
	
	
	area: function area() {
		var sidelen = options.sideLength;
		
		var alen = sidelen / Math.sqrt(2);
		var len = sidelen + (2 * alen);
		
		return (len * len) - (alen * alen * 2);
	},
	livableArea: area,
	
	volume: function volume() {
		return area() * 8; 
	},
	livableVolume: volume,
	
}};











