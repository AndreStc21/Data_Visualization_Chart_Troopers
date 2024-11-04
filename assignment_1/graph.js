const margin = {top: 30, right: 30, bottom: 100, left: 100},
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

const svg_plot3 = d3.select("#plot3")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot5 = d3.select("#plot5")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot6 = d3.select("#plot6")
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
		info = d3.select(this).datum();
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

function stacked_bar_plot(data, svg_plot, id_div, normalized){
	const nestedData = Array.from(
		d3.group(data, d => d.region),
		([region, values]) => {
		  const regionData = { region: region};
		  values.forEach(v => regionData[v.rank] = v.emissions);
		  return regionData;
		}
	);

	var mapping_entity = {};
	data.forEach(d => mapping_entity[d.region+d.rank] = d.entity);
	  

	const subgroups = Array.from(new Set(data.map(d => d.rank)));
	const groups = Array.from(new Set(data.map(d => d.region)));

	if(normalized){
		for(let i=0; i<6; i++){
			let value_region = 0;
			subgroups.forEach(j => value_region += nestedData[i][j])
			subgroups.forEach(j => nestedData[i][j] = nestedData[i][j]/value_region*100)
		}
	}

	// Get the max value for the Y axis
	var max_value = 0;
	for(let i=0; i<6; i++){
		let value_region = 0;
		subgroups.forEach(j => value_region += nestedData[i][j])
		if(value_region>max_value){
			max_value = value_region;
		}
	}

	// Add X axis
	var x;
	if(normalized){
		x = d3.scaleLinear()
		.domain([0, max_value])
		.range([0, height]);
	}
	else{
		x = d3.scaleLinear()
		.domain([0, max_value+(0.1*max_value)])
		.range([0, height]);
	}
	
	svg_plot.append("g")
	.attr("transform", `translate(0, ${height})`)
	.call(d3.axisBottom(x))
	.selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");

	// Add Y axis
	const y = d3.scaleBand()
	.range([ 0, width ])
	.domain(groups)
	.padding(0.2);

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
		info = d3.select(this).datum();
		info_parent = d3.select(this.parentNode).datum();
		tooltip.html("Country: " + mapping_entity[info.data.region+info_parent.key] + "<br>" + "Value: " + info.data[info_parent.key]).style("opacity", 1);
	}

	var mousemove = function(event, d) {
		tooltip.style('left', (event.pageX+20) + 'px').style('top', (event.pageY) + 'px');
	}

	var mouseleave = function(event, d) {
		d3.selectAll(id_div+" rect").style("opacity",0.8);
		tooltip.style("opacity", 0);
	}

	const color = d3.scaleOrdinal()
	.domain(subgroups)
	.range(['#5778a4', '#e49444', '#d1615d','#85b6b2','#6a9f58', '#e7ca60']);

	const stackedData = d3.stack()
    .keys(subgroups)
    (nestedData);

	svg_plot.append("g")
	.selectAll("g")
	// Enter in the stack data = loop key per key = group per group
	.data(stackedData)
	.join("g")
	.attr("fill", d => color(d.key))
	.selectAll("rect")
	// enter a second time = loop subgroup per subgroup to add all rectangles
	.data(d => d)
	.join("rect")
	.attr("y", d =>  y(d.data.region))
	.attr("x", d => x(d[0]))
	.attr("width", d => x(d[1]) - x(d[0]))
	.attr("height", y.bandwidth())
	.attr("stroke", "grey")
	.on("mouseover", mouseover)
	.on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}

function heatmap_plot(data, svg_plot, id_div){
	var max_value = 0;
	var min_value = Infinity;
	data.forEach(d => {
		if(d.value>max_value){
			max_value = d.value;
		}
		if(d.value<min_value){
			min_value = d.value;
		}
	});

	const myColor = d3.scaleLinear()
  	.range(["white", "#69b3a2"])
  	.domain([min_value, max_value])

	const x = d3.scaleBand()
	.range([ 0, width ])
	.domain(data.map(d => d.group))
	.padding(0.2);

	svg_plot.append("g")
	.attr("transform", `translate(0, ${height})`)
	.call(d3.axisBottom(x))
	.selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");

	const y = d3.scaleBand()
	.domain(data.map(d => d.entity))
	.range([ height, 0])
	.padding(0.1);

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
		info = d3.select(this).datum();
		tooltip.html("Country: " + info.entity + "<br>" + "Value: " + info.value).style("opacity", 1);
	}

	var mousemove = function(event, d) {
		tooltip.style('left', (event.pageX+20) + 'px').style('top', (event.pageY) + 'px');
	}

	var mouseleave = function(event, d) {
		d3.selectAll(id_div+" rect").style("opacity",0.8);
		tooltip.style("opacity", 0);
	}

	svg_plot.selectAll()
	.data(data, function(d) {return d.group+':'+d.entity;})
    .enter()
    .append("rect")
	.attr("x", function(d) { return x(d.group) })
	.attr("y", function(d) { return y(d.entity) })
	.attr("width", x.bandwidth() )
	.attr("height", y.bandwidth() )
	.style("fill", function(d) { return myColor(d.value)} )
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

d3.csv("co-emissions-per-capita-last-year-region-comparison.csv", function(d) {
	return {
		region: d.Region,
		entity: d.Entity,
		emissions: +d['Annual CO2 emissions (per capita)'],
		rank: d.Rank
	  };
})
.then(function (data) {
	stacked_bar_plot(data, svg_plot3, "#plot3", false);
	stacked_bar_plot(data, svg_plot5, "#plot5", true);
});


d3.csv("co2-emission-type-last-year.csv", function(d) {
	return {
		entity: d.Entity,
		code: d.Code,
		group: d.Group,
		value: +d['Value']
	  };
})
.then(function (data) {
	heatmap_plot(data, svg_plot6, "#plot6");
});