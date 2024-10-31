const margin = {top: 30, right: 30, bottom: 70, left: 60},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

const svg = d3.select("#plot1")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("co-emissions-per-capita-last-year.csv", function(d) { // non funziona
	return {
		entity: d.Entity,
		code: d.Code,
		emissions: +d['Annual CO2 emissions (per capita)'],
	  };
})
.then(function (data) {
	console.log(data);
	var max_value = 0;
	data.forEach(d => {
		if(d.emissions>max_value){
			max_value = d.emissions;
		}
	});
	const x = d3.scaleBand()
	.range([ 0, width ])
	.domain(data.map(d => d.code))
	.padding(0.2);
	svg.append("g")
	.attr("transform", `translate(0, ${height})`)
	.call(d3.axisBottom(x))
	.selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");

	// Add Y axis
	const y = d3.scaleLinear()
	.domain([0, max_value])
	.range([ height, 0]);
	svg.append("g")
	.call(d3.axisLeft(y));
  
	// Bars
	svg.selectAll("mybar")
	.data(data)
	.join("rect")
	.attr("x", d => x(d.code))
	.attr("y", d => y(d.emissions))
	.attr("width", x.bandwidth())
	.attr("height", d => height - y(d.emissions))
	.attr("fill", "#69b3a2");
  
});