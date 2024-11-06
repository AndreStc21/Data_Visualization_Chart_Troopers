const margin = {top: 30, right: 30, bottom: 100, left: 100},
width = 550 - margin.left - margin.right,
height = 550 - margin.top - margin.bottom;

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

const svg_plot4 = d3.select("#plot4");

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
		.range([0, width]);
	}
	else{
		x = d3.scaleLinear()
		.domain([0, max_value+(0.1*max_value)])
		.range([0, width]);
	}
	
	svg_plot.append("g")
	.attr("transform", `translate(0, ${height})`)
	.call(d3.axisBottom(x))
	.selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");

	// Add Y axis
	const y = d3.scaleBand()
	.range([0, height])
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
		tooltip.html("Rank: " + info_parent.key + "<br>" + "Location: " + mapping_entity[info.data.region+info_parent.key] + "<br>" + "Value: " + info.data[info_parent.key]).style("opacity", 1);
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

// function small_multiples_bar_plot(data, svg_plot, id_div){
// 	const sumstat = d3.group(data, d => d.rank);
// 	const allKeys = new Set(data.map(d=>d.rank));
// 	const groups = Array.from(new Set(data.map(d => d.region)));
// 	const subgroups = Array.from(new Set(data.map(d => d.region)));
// 	const n_plots = allKeys.size;

// 	var max_value = 0;
// 	data.forEach(d => function(d){
// 		if(d.emissions>max_value){
// 			max_value = d.emissions;
// 		}
// 	})

// 	const x = d3.scaleLinear()
// 		.domain([0, max_value+(0.1*max_value)])
// 		.range([0, width/n_plots]);
	
// 	svg
//     .append("g")
//     .attr("transform", `translate(0, ${height})`)
//     .call(d3.axisBottom(x));

// 	const y = d3.scaleLinear()
//     .domain([groups])
//     .range([0, height]);

//   	svg.append("g")
//     .call(d3.axisLeft(y));

// 	const color = d3.scaleOrdinal()
// 	.domain(subgroups)
// 	.range(['#5778a4', '#e49444', '#d1615d','#85b6b2','#6a9f58', '#e7ca60']);

// 	svg
// 	.append("rect")
// 	.attr("y", d => function(d) {return y(d.region)})
// 	.attr("x", d => 0)
// 	.attr("width", d => function(d) {return x(d.emissions)})
// 	.attr("height", y.bandwidth());

function small_multiples_bar_plot(data, svg_container, id_div) {
    // Group data by rank
    const sumstat = d3.group(data, d => d.rank);
    const max_value = d3.max(data, d => d.emissions);

    const n_plots = 6;
    const multiples_width = width/n_plots; // Adjust width based on the total row width you desire
    const multiples_height = height;

    const color = d3.scaleOrdinal()
        .domain(Array.from(new Set(data.map(d => d.rank))))
        .range(['#5778a4', '#e49444', '#d1615d','#85b6b2','#6a9f58', '#e7ca60']);

    // Prepare SVG container as a flex or grid container
    d3.select(id_div)
        .style("display", "flex")
        .style("flex-wrap", "wrap")
        .style("justify-content", "space-evenly");
	
    // Loop over each rank to create a plot for each
    sumstat.forEach((rankData, rank) => {
		console.log(rank);
        const svg = d3.select(id_div)
            .append("svg")
            .attr("width", multiples_width + margin.left + margin.right)
            .attr("height", multiples_height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scaleLinear()
            .domain([0, max_value * 1.1])
            .range([0, multiples_width]);
        
        const y = d3.scaleBand()
            .domain(rankData.map(d => d.region))
            .range([0, multiples_height])
            .padding(0.2);

		// Tooltip
		const tooltip = d3.select("body")
			.append("div")
			.style("opacity", 0)
			.attr("class", "tooltip")
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "1px")
			.style("border-radius", "5px")
			.style("padding", "10px")
			.style("position", "absolute");

		const mouseover = function(event, d) {
			tooltip.style("opacity", 1);
			d3.select(this).style("opacity", 1);
		};

		const mousemove = function(event, d) {
			tooltip.html("<br>Rank: " + rank + "<br>Location: " + d.entity + "<br>CO2 emissions: " + d.emissions)
				.style("left", (event.pageX + 20) + "px")
				.style("top", (event.pageY) + "px");
		};

		const mouseleave = function(event, d) {
			tooltip.style("opacity", 0);
			d3.select(this).style("opacity", 0.8);
		};

        // X and Y axes
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(1));

        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(6));

        // Bars
        svg.selectAll("rect")
            .data(rankData)
            .join("rect")
            .attr("x", 0)
            .attr("y", d => y(d.region))
            .attr("width", d => x(d.emissions))
            .attr("height", y.bandwidth())
            .attr("fill", color(rank))
            .style("opacity", 0.8)
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseleave", mouseleave);
    });
}

// tried to make it prettier
/* 	function small_multiples_bar_plot(data, svg_container, id_div) {
		// Group data by rank
		const sumstat = d3.group(data, d => d.rank);
		const max_value = d3.max(data, d => d.emissions);
	
		const n_plots = 6;
		const multiples_width = width / n_plots;
		const multiples_height = height;
	
		const color = d3.scaleOrdinal()
			.domain(Array.from(new Set(data.map(d => d.rank))))
			.range(['#5778a4', '#e49444', '#d1615d', '#85b6b2', '#6a9f58', '#e7ca60']);
	
		// Shared Y-axis scale for regions
		const y = d3.scaleBand()
			.domain(Array.from(new Set(data.map(d => d.region))))
			.range([0, multiples_height])
			.padding(0.2);
	
		// Create shared y-axis in the main SVG container
		const svg = d3.select(id_div)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);
	
		svg.append("g")
			.call(d3.axisLeft(y).tickSize(0).tickPadding(6));
	
		// Create a container for each small multiple
		sumstat.forEach((rankData, rank) => {
			const multiple = svg.append("g")
				.attr("transform", `translate(${rank * multiples_width + margin.left},0)`);
	
			// X-scale for each small multiple
			const x = d3.scaleLinear()
				.domain([0, max_value * 1.1])
				.range([0, multiples_width]);
	
			// Tooltip
			const tooltip = d3.select("body")
				.append("div")
				.style("opacity", 0)
				.attr("class", "tooltip")
				.style("background-color", "white")
				.style("border", "solid")
				.style("border-width", "1px")
				.style("border-radius", "5px")
				.style("padding", "10px")
				.style("position", "absolute");
	
			const mouseover = function(event, d) {
				tooltip.style("opacity", 1);
				d3.select(this).style("opacity", 1);
			};
	
			const mousemove = function(event, d) {
				tooltip.html("Country: " + d.entity + "<br>Rank: " + rank + "<br>CO2 emissions: " + d.emissions)
					.style("left", (event.pageX + 20) + "px")
					.style("top", (event.pageY) + "px");
			};
	
			const mouseleave = function(event, d) {
				tooltip.style("opacity", 0);
				d3.select(this).style("opacity", 0.8);
			};
	
			// X-axis for each small multiple
			multiple.append("g")
				.attr("transform", `translate(0, ${multiples_height})`)
				.call(d3.axisBottom(x).ticks(3));
	
			// Bars for each rank
			multiple.selectAll("rect")
				.data(rankData)
				.join("rect")
				.attr("x", 0)
				.attr("y", d => y(d.region))
				.attr("width", d => x(d.emissions))
				.attr("height", y.bandwidth())
				.attr("fill", color(rank))
				.style("opacity", 0.8)
				.on("mouseover", mouseover)
				.on("mousemove", mousemove)
				.on("mouseleave", mouseleave);
		});
	} */
	

function heatmap_plot(data, svg_plot, id_div){
	var max_value_fossil = 0;
	var min_value_fossil = Infinity;
	var max_value_land = 0;
	var min_value_land = Infinity;
	data.forEach(d => {
		if(d.group=="fossil"){
			if(d.value>max_value_fossil){
				max_value_fossil = d.value;
			}
			if(d.value<min_value_fossil){
				min_value_fossil = d.value;
			}
		}
		else{
			if(d.value>max_value_land){
				max_value_land = d.value;
			}
			if(d.value<min_value_land){
				min_value_land = d.value;
			}
		}
	});

	const myColor_fossil = d3.scaleLinear()
  	.range(["green", "red"])
  	.domain([min_value_fossil, max_value_fossil])

	  const myColor_land = d3.scaleLinear()
  	.range(["green", "red"])
  	.domain([min_value_land, max_value_land])

	const y = d3.scaleBand()
	.range([ 0, width ])
	.domain(data.map(d => d.group))

	const x = d3.scaleBand()
	.domain(data.map(d => d.entity))
	.range([ height, 0])

	svg_plot.append("g")
	.attr("transform", `translate(0, ${height})`)
	.call(d3.axisBottom(x))
	.selectAll("text")
	.attr("transform", "translate(-10,0)rotate(-45)")
	.style("text-anchor", "end");

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
	.attr("y", function(d) { return y(d.group) })
	.attr("x", function(d) { return x(d.entity) })
	.attr("width", x.bandwidth() )
	.attr("height", y.bandwidth() )
	.style("fill", function(d) { if(d.group=="fossil") {return myColor_fossil(d.value)} else {return myColor_land(d.value)}} )
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

d3.csv("co-emissions-last-year-region-comparison.csv", function(d) {
	return {
		region: d.Region,
		entity: d.Entity,
		emissions: +d['Annual CO2 emissions'],
		rank: d.Rank
	  };
})
.then(function (data) {
	stacked_bar_plot(data, svg_plot3, "#plot3", false);
	small_multiples_bar_plot(data, svg_plot4, "#plot4");
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