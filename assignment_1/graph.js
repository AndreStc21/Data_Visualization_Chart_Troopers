const margin = {top: 30, right: 30, bottom: 100, left: 60},
width = 500 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

const svg_plot1 = d3.select("#plot1")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot2 = d3.select("#plot2")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);


function bar_plot(data, svg_plot, id_div){
	var max_value = 0;
	data.forEach(d => {
		if(d.emissions>max_value){
			max_value = d.emissions;
		}
	});
	const x = d3.scaleBand()
	.range([ 0, width ])
	.domain(data.map(d => d.entity))
	.padding(0.2);

	svg_plot.append("g")
	.attr("transform", `translate(0, ${height})`)
	.call(d3.axisBottom(x))
	.selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");

	const y = d3.scaleLinear()
	.domain([0, max_value+(0.1*max_value)])
	.range([ height, 0]);

	svg_plot.append("g")
	.call(d3.axisLeft(y));

	var tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
	.style("position", "absolute")
	.style("left", "0px")
	.style("top", "0px");

	var mouseover = function(event, d) {
		d3.selectAll(id_div+"  rect").style("opacity", 0.2);
		d3.select(this).style("opacity", 1);
		info = d3.select(this).datum()
		tooltip.html("Country: " + info.entity + "<br>" + "CO2 emissions: " + info.emissions).style("opacity", 1);
	}

	var mousemove = function(event, d) {
		tooltip.style('left', (event.pageX+20) + 'px').style('top', (event.pageY) + 'px');
	}

	var mouseleave = function(event, d) {
		d3.selectAll(id_div+" rect").style("opacity",0.8);
		tooltip.style("opacity", 0);
	}

	svg_plot.selectAll()
	.data(data)
	.join("rect")
	.attr("x", d => x(d.entity))
	.attr("y", d => y(d.emissions))
	.attr("width", x.bandwidth())
	.attr("height", d => height - y(d.emissions))
	.attr("fill", "#69b3a2")
	.on("mouseover", mouseover)
	.on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}


d3.csv("co-emissions-per-capita-last-year.csv", function(d) {
	return {
		entity: d.Entity,
		code: d.Code,
		emissions: +d['Annual CO2 emissions (per capita)'],
	  };
})
.then(function (data) {
	bar_plot(data, svg_plot1, "#plot1");
});

d3.csv("co-emissions-per-capita-last-decade.csv", function(d) {
	return {
		entity: d.Entity,
		code: d.Code,
		emissions: +d['Annual CO2 emissions (per capita)'],
	  };
})
.then(function (data) {
	bar_plot(data, svg_plot2, "#plot2");
});