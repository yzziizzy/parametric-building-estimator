






function slab(length, width, thickness) {
	return Component({
		concrete: CompMember(1, (length * width * (thickness / 12)) / 27),
// 		flooring: [{dim: {w: length, h: width}}],
		flooring: CompMember(1, length * width),
// 		rebar_5: [5], 
	});
};




/*
 * 50 live + 20 dead
max spans, L/360, 12"oc, 1.6m Em (#1 select northern douglas fir)

6: 10
8: 13
10: 16.75
12: 20.25

16"oc:
2x6: 9
2x8: 12
2x10: 15
2x12: 18.5

24"oc:
6: 8
8: 10.5
10: 13.25
12: 16


*/


function platform(length, width) {
	
	var jspacing = 16 / 12;
	
	var max_span = 12;
	
	var  l = max(length, width);
	var  w = min(length, width);
	
	var across = ceil(l / jspacing);
	
	return Component({
		floor_joist: [
		
			// TODO: need a way to specify only continuous boards. 
			CompMember(w, ceil(l / jspacing)), // joists across the width
			CompMember(l, 2), // sides
			CompMember(l, floor(w / max_span)), // beams
		],
		floor_decking: CompMember(d(w, l), 1),
		flooring: CompMember(1, length * width),
		joist_hanger: CompMember(1, 2 * ceil(l / jspacing) * floor(w / max_span)) // two for every joist, per span
// 		concrete: // under pads
		// supports of whatever kind
	});
};












module.exports = {
	slab: slab,
	platform: platform,
};




