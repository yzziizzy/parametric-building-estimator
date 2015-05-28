

module.exports = {
	d2x4: [
		Stock(d(8), 2.7),
		Stock(d(10), 3.57),
		Stock(d(12), 4),
		Stock(d(14), 5.12),
		Stock(d(16), 6.96),
	],
	d2x6: [
		Stock(d(8), 4.17),
		Stock(d(10), 5.17),
		Stock(d(12), 6.22),
		Stock(d(14), 7.47),
		Stock(d(16), 8.35),
	],
	d2x8: [
		Stock(d(8), 5.56),
		Stock(d(10), 6.96),
	],
	d2x10: [
		Stock(d(8), 8),
		Stock(d(12), 10.98),
		Stock(d(16), 14.63),
	],
	d2x12: [
		Stock(d(8), 8.90),
		Stock(d(10), 11.32),
	],
	d4x4: [
		Stock(d(8), 9.05),
		Stock(d(10), 11.49),
		Stock(d(12), 13.80),
	],
	d4x6: [
		Stock(d(8), 12.94),
		Stock(d(10), 16.18),
		Stock(d(12), 19.42),
	],
	
	joist_hanger_2x4: Stock(1, .76),
	joist_hanger_2x6: Stock(1, .96),
	joist_hanger_2x8: Stock(1, 1.11),
	joist_hanger_2x10: Stock(1, 1.52),
	
	gang_nail_3x6: Stock(1, 1.10),
	gang_nail_2x3: Stock(1, .76),
	gang_nail_1x4: Stock(1, .61),
	
	plywood_clips_716: Stock(1, 18.98 / 250),
	plywood_clips_1532: Stock(1, 5.56 / 50),
	plywood_clips_5: Stock(1, 6.13 / 50),
	plywood_clips_58: Stock(1, 7.81 / 50),
	plywood_clips_75: Stock(1, 21/82 / 250),
	
	connector_nail_15in: Stock(1, 4.74 / 147),
	framing_nail_3in: Stock(1, 38.98 / 4000),
	framing_nail_3in_galv: Stock(1, 47.50 / 2000),
	
	roofing_nail_galv: Stock(1, 10.47 / 930),
	
	framing_screw_3in: Stock(1, 6.47 / 415),
	
	drywall_screw: Stock(1, 21.97 / 1290), // 5 lb pack; 25lb packs are cheaper but have 5000 screws in them
	
	
	foam: Stock(1, 1.5),
	hurricane_strap: Stock(1, .75),
	concrete: Stock(1, 100),
	roof_felt_30lb: Stock(d(1, 1), 21 / 216), // $21 for 216 sqft 
	tyvek: Stock(1, 21 / 216), // $21 for 216 sqft 
	flooring: Stock(1, 2 + .50), // engineered hardwood and underlayment
	siding: Stock(1, 7.35 / 8), // 12'x8" = 8 sq ft, fiber cement lap
	osb_716: Stock(d(4, 8), 13.5),
	cdx_5: Stock(d(4, 8), 18),
	cdx_75: Stock(d(4, 8), 26),
	
	drywall_25: Stock(d(4, 8), 11.76),
	drywall_58: Stock(d(4, 8), 12.48),
	greenboard_58: Stock(d(4, 8), 15.98),
	fancy_drywall_58: Stock(d(4, 8), 21.00),
	cement_board_25: Stock(d(3, 5), 9.97),
	cement_board_5: Stock(d(4, 8), 22.47),
	
	ugly_wood_paneling: Stock(d(4, 8), 13.97), 
	western_cedar_tng_planks: Stock(d(21/12, 8), 19.97), 
	aromatic_cedar_tng_planks: Stock(d(45/12, 4), 24.97), 
	
	metalRoof_panel: Stock(d(3, 16), 46),
	metalRoof_gable: Stock(d(12), 15),
	metalRoof_screws: Stock(1, 22 / 250), // bag of 250
	rigid_foam_2in_r13: [
		Stock(d(4, 8), 32.25),
	],
	rigid_foam_2in_r10: [
		Stock(d(2, 8), 21),
		Stock(d(4, 8), 31.22),
	],
	rigid_foam_2in_r7_7: [
		Stock(d(2, 8), 6.58),
		Stock(d(4, 8), 21.65),
	],
	
// 	fiberglass_batt_r21: Stock(1, ),
	
	blown_cellulose: Stock(20, 11.73), // 20 cu ft per bag
};












