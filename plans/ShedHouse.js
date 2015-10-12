

var bareStudWall = require('./parts/walls').bareStudWall;
var gableRoof = require('./parts/roofs').gableRoof;
var platform = require('./parts/foundations').platform;





module.exports = function(options) { return {
	components: function() {
		var length = options.length,
			width = options.width;
		
		var sheathingThickness = (1 / 24); // half inch
		var insulationThickness = (4 / 12); // 4 inch foam
		
		return [
			bareStudWall(length),
			bareStudWall(length),
			bareStudWall(width),
			bareStudWall(width),
			gableRoof(length, width, options.roofHeight),
			
			platform(length, width, 8),
			
			Component({
				sheathing: [ // we can cut one long length into pieces
					CompMember(d(((length + width)*2) + (sheathingThickness * 6), wallH + fdnThickness)),
				],
				insulation: [ // we can cut one long length into pieces
					CompMember(d(((length + width)*2) + (sheathingThickness * 12) + (insulationThickness * 6), wallH)),
				],
				// siding
				// furring
				// foam tape
			}),
			// cinder blocks
			//flooring
			//skids
			
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
	



 
