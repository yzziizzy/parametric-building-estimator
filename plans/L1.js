
var bareStudWall = require('./parts/walls').bareStudWall;
var prismRoof = require('./parts/roofs').prismRoof;
var prismCorner = require('./parts/roofs').prismCorner;
var platformFdn = require('./parts/foundations').platform;

/*

L-shaped house

ignore: http://www.idabo.org/design-load-guidelines

         

              A
      +----------------+
      |                | B
      |          C     |
    F |       +--------+
      |       |    
      |       | D
      +-------+
          E


Length = A ~= E + C          
Width = F ~= D + B
EndLength = E
EndWidth = B
C = Length - EndLength
D = Width - EndWidth

*/










module.exports = function(options) { return {
	
	// TODO calculate roof pitch
	
	components: function() {
		var A = options.length,
			F = options.width,
			E = options.endLength,
			B = options.endWidth,
			C = A - E, 
			D = F - B,
			wallH = options.wallHeight;
			
		var fdnThickness = 1;
		var sheathingThickness = (1 / 24); // half inch
		var insulationThickness = (4 / 12); // 4 inch foam
			
		return [
			bareStudWall(A, wallH),
			bareStudWall(B, wallH),
			bareStudWall(C, wallH),
			bareStudWall(D, wallH),
			bareStudWall(E, wallH),
			bareStudWall(F, wallH),
			
			
			Component({
				sheathing: [ // we can cut one long length into pieces
					CompMember(d(A+B+C+D+E+F + (sheathingThickness * 6), wallH + fdnThickness)),
				],
				insulation: [ // we can cut one long length into pieces
					CompMember(d(A+B+C+D+E+F + (sheathingThickness * 12) + (insulationThickness * 6), wallH)),
				],
				// siding
				// furring
				// foam tape
			}),
			
			prismRoof(C, B, options.roofHeight),
			prismRoof(D, E, options.roofHeight),
			prismCorner(B, E, options.roofHeight),
			//TODO: need the corner part
			
			platformFdn(A, B),
			platformFdn(D, E),
		];
	},
	
	options: [ 
		{ name: 'length', unit: 'feet', def: 15, range: [10, Infinity], major: true, desc: 'House length' },
		{ name: 'endLength', unit: 'feet', def: 15, range: [10, Infinity], major: true, desc: 'House length' },
		{ name: 'width', unit: 'feet', def: 20, range: [10, Infinity], major: true, desc: 'House width' },
		{ name: 'endWidth', unit: 'feet', def: 20, range: [10, Infinity], major: true, desc: 'House width' },
		{ name: 'wallHeight', unit: 'feet', def: 5, range: [1, 8], desc: 'Roof height from top of walls' },
		{ name: 'roofHeight', unit: 'feet', def: 5, range: [1, 8], desc: 'Roof height from top of walls' },
	],
	
	
	// all this shit is just wrong
	area: function area() {
		return (options.length * options.width) - (options.endLength * options.endWidth);
	},
	volume: function volume() {
		return area() * 8; 
	},
// 	livableVolume: volume,
}};
	



 
