






function slab(length, width, thickness) {
	return Component({
		concrete: CompMember(1, (length * width * (thickness / 12)) / 27),
// 		flooring: [{dim: {w: length, h: width}}],
		flooring: CompMember(1, length * width),
// 		rebar_5: [5], 
	});
};




function platform(length, width, thickness) {
	
	var jspacing = 8 / 12;
	
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
		joist_hangars: CompMember(1, 2 * ceil(l / jspacing) * floor(w / max_span)) // two for every joist, per span
// 		concrete: // under pads
		// supports of whatever kind
	});
};












module.exports = {
	slab: slab,
	
};




