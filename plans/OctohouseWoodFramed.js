


var studWall = require('./parts/walls').studWall;
var prismRoof = require('./parts/roofs').prismRoof;
var slabFoundation = require('./parts/foundations').slab;




module.exports = {
	components: function(sidelen, roofHeight) {
		
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
			prismRoof(len, len, roofHeight),
			slabFoundation(len, len, 8),
		];
	},
	
	
}











