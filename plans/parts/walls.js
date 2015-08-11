 
// returns a component
function studWall(length, height) {
	// height assumed at 8'
	
	var studCenter = 16 / 12;
	
	var numStuds = ceil(length / studCenter) + 2; // 2 extra for end caps
	var plates = 3 * ceil(length / 8); // top plate is doubled up
	
	var sheathing = ceil(length / 4);
	
	return Component({
		stud: [
			CompMember(length, 3), // plates
			CompMember(8, numStuds)], // plates
		sheathing: CompMember(d(length, 8), sheathing),
		insulation: CompMember(1, length * 8),
		drywall: CompMember(d(length, 8), sheathing),
		tyvek: CompMember(1, length * 8),
		siding: CompMember(1, length * 8),
	});
}








 
// returns a component
function bareStudWall(length, height) {
	// height assumed at 8'
	
	var studCenter = 16 / 12;
	
	var numStuds = ceil(length / studCenter) + 2; // 2 extra for end caps
	
	return Component({
		stud: [
			CompMember(length, 3), // plates
			CompMember(height, numStuds)],
		]
	});
}















module.exports = {
	studWall: studWall,
	bareStudWall: bareStudWall,
};
