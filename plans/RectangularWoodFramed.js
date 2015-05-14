

var studWall = require('./parts/walls').studWall;
var prismRoof = require('./parts/roofs').prismRoof;
var slabFoundation = require('./parts/foundations').slab;





module.exports = {
	
	components: function(length, width, roofHeight) {
		return [
			studWall(length),
			studWall(length),
			studWall(width),
			studWall(width),
			prismRoof(length, width, roofHeight),
			slabFoundation(length, width, 8),
		];
	},
	
	
}


 
