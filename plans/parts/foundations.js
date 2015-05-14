






function slab(length, width, thickness) {
	return Component({
		concrete: CompMember(1, (length * width * (thickness / 12)) / 27),
// 		flooring: [{dim: {w: length, h: width}}],
		flooring: CompMember(1, length * width),
// 		rebar_5: [5], 
	});
};













module.exports = {
	slab: slab,
	
};




