
var bareStudWall = require('./parts/walls').bareStudWall;
var prismRoof = require('./parts/roofs').prismRoof;
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
			
		return [
			bareStudWall(A),
			bareStudWall(B),
			bareStudWall(C),
			bareStudWall(D),
			bareStudWall(E),
			bareStudWall(F),
			
			prismRoof(C, B, options.roofHeight),
			prismRoof(D, E, options.roofHeight),
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
		{ name: 'roofHeight', unit: 'feet', def: 5, range: [1, 8], desc: 'Roof height from top of walls' },
	],
	
	
	// all this shit is just wrong
	area: function area() {
		return options.length * options.width;
	},
	volume: function volume() {
		return area() * 8; 
	},
	livableVolume: volume,
}};
	



 
