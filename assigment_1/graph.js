d3.csv("co-emissions-per-capita-last-decade.csv", function(d) { // non funziona
	return {
		entity: d.Entity,
		code: d.Code,
		emissions: +d['Annual CO₂ emissions (per capita)'],
	  };
})
.then(function (data) {
    console.log(data);
})