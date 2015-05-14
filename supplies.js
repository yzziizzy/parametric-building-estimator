

module.exports = {
	d2x4: [
		Stock(d(8), 2.7),
		Stock(d(10), 3.2),
		Stock(d(12), 4),
		Stock(d(16), 5.4),
	],
	d2x6: [
		Stock(d(8), 4),
	],
	d2x8: [
		Stock(d(8), 6),
	],
	d2x10: [
		Stock(d(8), 8),
	],
	d2x12: [
		Stock(d(8), 12),
	],
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
	drywall: Stock(d(4, 8), 13),
	metalRoof_panel: Stock(d(3, 16), 46),
	metalRoof_gable: Stock(d(12), 15),
	metalRoof_screws: Stock(1, 22 / 250), // bag of 250
	
};












