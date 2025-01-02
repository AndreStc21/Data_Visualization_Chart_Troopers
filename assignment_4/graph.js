var clicked_years_line_scatter = new Array();
var clicked_years_radar = new Array();

const current_year = new Date().getFullYear();
const min_year = current_year - 10;

// This is what I need to compute kernel density estimation
  function kernelDensityEstimator(kernel, X) {
    return function(V) {
      return X.map(function(x) {
        return [x, d3.mean(V, function(v) { return kernel(x - v); })];
      });
    };
  }
  function kernelEpanechnikov(k) {
    return function(v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
  }

function checkbox(data_min, data_max, data_avg, checkbox_list_id, svg_id, svg_plot, id_div) {
	const checkbox_list = document.getElementById(checkbox_list_id);

	// Iterate through the data array to create and append checkbox elements
	// Use a Set to track unique years
    let uniqueYears = new Set();

    data_min.forEach(item => {
        const year = item.year;
	
        // Only add the year if it's not already in the Set
        if (year >= min_year && !uniqueYears.has(year)) {
            uniqueYears.add(year);

            // Create a new list item (li)
            const li = document.createElement("li");

            // Create a new checkbox input
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = year;

            // Optionally set the checkbox as checked
			if (year === '2024') {
                checkbox.checked = true;
            }

            // Create a text node for the label
            const label = document.createTextNode(year);

            // Append the checkbox and label to the list item
            li.appendChild(checkbox);
            li.appendChild(label);

            // Append the list item to the checkbox list
            checkbox_list.appendChild(li);
        }
    });

	const checkbox = document.querySelectorAll("#"+checkbox_list_id+" input[type='checkbox']");

	if (svg_id == "svg1")
	{
		for (check of checkbox) {
			check.addEventListener('change', (event) => {
				if (event.currentTarget.checked) {
					clicked_years_line_scatter.push(event.currentTarget.value);
					let plot = document.getElementById(svg_id);
					while (plot.firstChild) {
						plot.removeChild(plot.lastChild);
					}
					line_scatter_plot(data_min, data_max, data_avg, svg_plot, id_div, clicked_years_line_scatter);
				} else {
					var index = clicked_years_line_scatter.indexOf(event.currentTarget.value);
					if (index > -1) {
						clicked_years_line_scatter.splice(index, 1);
					}
					let plot = document.getElementById(svg_id);
					while (plot.firstChild) {
						plot.removeChild(plot.lastChild);
					}
					line_scatter_plot(data_min, data_max, data_avg, svg_plot, id_div, clicked_years_line_scatter);
				}
			})
		}
		
		clicked_years_line_scatter.push('2024')
	}
	else
	{
		for (check of checkbox) {
			check.addEventListener('change', (event) => {
				if (event.currentTarget.checked) {
					clicked_years_radar.push(event.currentTarget.value);
					let plot = document.getElementById(svg_id);
					while (plot.firstChild) {
						plot.removeChild(plot.lastChild);
					}
					radar_chart(data_avg, svg_plot, id_div, clicked_years_radar);
				} else {
					var index = clicked_years_radar.indexOf(event.currentTarget.value);
					if (index > -1) {
						clicked_years_radar.splice(index, 1);
					}
					let plot = document.getElementById(svg_id);
					while (plot.firstChild) {
						plot.removeChild(plot.lastChild);
					}
					radar_chart(data_avg, svg_plot, id_div, clicked_years_radar);
				}
			})
		}
		
		clicked_years_radar.push('2024')
	}
}

const margin = { top: 30, right: 30, bottom: 100, left: 100 },
	width = 550 - margin.left - margin.right,
	height = 550 - margin.top - margin.bottom;

var tooltip = d3
    .select("#content-wrap")
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

const svg_plot1 = d3
	.select("#plot1")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`)
	.attr("id", "svg1");

const svg_plot2 = d3
	.select("#plot2")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`)
	.attr("id", "svg2");

const svg_plot3 = d3
	.select("#plot3")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`)
	.attr("id", "svg3");	



function add_axis_label(svg_plot, x, y, transform, text_anchor, label) {
	svg_plot
		.append("text")
		.attr("text-anchor", text_anchor)
		.attr("x", x)
		.attr("y", y)
		.attr("transform", transform)
		.text(label);
}

function line_scatter_plot(data_min, data_max, data_avg, svg_plot, id_div, years) {
    data_min = data_min.filter(d => years.includes(d.year));
    data_max = data_max.filter(d => years.includes(d.year));
    data_avg = data_avg.filter(d => years.includes(d.year));

    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

    var x = d3.scaleLinear()
        .domain([1, 12])
        .range([0, width]);

    svg_plot.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickFormat((d, i) => months[d - 1])
            .ticks(12));

    var y = d3.scaleLinear()
        .domain([0, d3.max([...data_min, ...data_max, ...data_avg], function(d) { return +d.temperature; })])
        .range([height, 0]);

    svg_plot.append("g")
        .call(d3.axisLeft(y));

	const colorScale = d3.scaleOrdinal()
		.domain(years)
		.range(["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0", "#000000"]);
	
    const datasets = [
        { data: data_min, label: "Min" },
        { data: data_max, label: "Max" }
    ];

    var mouseover = function (event, d) {
        d3.selectAll(id_div + "  path").style("opacity", 0.2);
        d3.selectAll(id_div + "  circle").style("opacity", 0.2);
        d3.select(this).style("opacity", 1);
        info = d3.select(this).datum();
        tooltip
            .html("Year-Month: " + info.year + "-" + info.month + "<br>Average temperature: " + info.temperature + " Fahrenheit")
            .style("opacity", 1);
    };

    var mousemove = function (event, d) {
        tooltip
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 100 + "px");
    };

    var mouseleave = function (event, d) {
        d3.selectAll(id_div + "  path").style("opacity", 1);
        d3.selectAll(id_div + "  circle").style("opacity", 1);
        tooltip.style("opacity", 0);
    };
    
    years.forEach((year) => {
        const baseColor = colorScale(year); // Get the base color for the year

        // Generate shades for the year
        const shades = [
            d3.color(baseColor).darker(1), // Darker shade
            baseColor,                    // Base color
            d3.color(baseColor).brighter(1) // Brighter shade
        ];

        datasets.forEach(({ data, label }) => {
            // Add line for the dataset with the current year
            svg_plot.append("path")
                .datum(data.filter(d => d.year == year))
                .attr("fill", "none")
                .attr("stroke", shades[label === "Min" ? 2 : 0]) // Use shade based on label
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(d => x(d.month))
                    .y(d => y(d.temperature))
                )
            
            //add invisible circle for mouseover
            svg_plot.selectAll()
                .data(data.filter(d => d.year == year))
                .enter()
                .append("circle")
                .attr("cx", d => x(d.month))
                .attr("cy", d => y(d.temperature))
                .attr("r", 3)
                .attr("fill", baseColor)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);
            });

        // Add scatter plot for the current year
        svg_plot.selectAll()
            .data(data_avg.filter(d => d.year == year))
            .enter()
            .append("circle")
            .attr("cx", d => x(d.month))
            .attr("cy", d => y(d.temperature))
            .attr("r", 3)
            .attr("fill", baseColor) // shades[1]); // Use brighter shade for scatter points
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);
    });
}

function radar_chart(data_avg, svg_plot, id_div, years) {
    // Preprocess data to aggregate by month and year
    const aggregatedData = years.map(year => {
        const filteredData = data_avg.filter(d => d.year === year);

        const months = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]

        return {
            year,
            values: months.map(month => {
                const avgTemp = filteredData.find(d => +d.month === month)?.temperature || 0;
                return {
                    month,
                    avg: +avgTemp
                };
            })
        };
    });

    // Dimensions and scales
    const radius = Math.min(width, height) / 2;
    const angleSlice = (2 * Math.PI) / 12;

    const rScale = d3.scaleLinear()
        .domain([0, d3.max(data_avg, d => +d.temperature)])
        .range([0, radius]);

    // Create a group for the radar chart
    const radarGroup = svg_plot.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Draw circular gridlines
    radarGroup.selectAll(".grid-circle")
        .data(rScale.ticks(5))
        .enter()
        .append("circle")
        .attr("class", "grid-circle")
        .attr("r", d => rScale(d))
        .style("fill", "#CDCDCD")
        .style("stroke", "#CDCDCD")
        .style("fill-opacity", 0.1);

    // Add labels for gridlines
    radarGroup.selectAll(".grid-label")
        .data(rScale.ticks(5))
        .enter()
        .append("text")
        .attr("class", "grid-label")
        .attr("x", 0)
        .attr("y", d => -rScale(d))
        .attr("dy", "-0.3em")
        .style("font-size", "10px")
        .attr("fill", "#737373")
        .text(d => d);

    // Draw axes
    const axes = radarGroup.selectAll(".axis")
        .data(d3.range(12))
        .enter()
        .append("g")
        .attr("class", "axis");

    axes.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => rScale(d3.max(data_avg, d => +d.temperature)) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => rScale(d3.max(data_avg, d => +d.temperature)) * Math.sin(angleSlice * i - Math.PI / 2))
        .style("stroke", "#CDCDCD")
        .style("stroke-width", "1px");

    axes.append("text")
        .attr("x", (d, i) => (rScale(d3.max(data_avg, d => +d.temperature)) + 20) * Math.cos(angleSlice * i - Math.PI / 2))  // Increased distance
        .attr("y", (d, i) => (rScale(d3.max(data_avg, d => +d.temperature)) + 20) * Math.sin(angleSlice * i - Math.PI / 2))  // Increased distance
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text((d, i) => ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]);

    const colorScale = d3.scaleOrdinal()
        .domain(years)
        .range(["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0", "#000000"]);
    
    // Draw data
    aggregatedData.forEach(({ year, values }) => {
        const line = d3.lineRadial()
            .radius(d => rScale(d.avg))
            .angle((d, i) => i * angleSlice);

        radarGroup.append("path")
            .datum(values)
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", colorScale(year))
            .style("stroke-width", 2);
    });
}

function ridge_line(data_min, data_max, svg_plot, id_div){
    all_years = new Array()
    data_min.forEach(data => {if(data.year>=min_year && !all_years.includes(data.year)){all_years.push(data.year)}})
    var x = d3.scaleLinear()
    .domain([10, 110])
    .range([ 0, width ]);
    svg_plot.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    
    var y = d3.scaleLinear()
    .domain([0, 1])
    .range([ height, 0]);

    var yName = d3.scaleBand()
    .domain(all_years)
    .range([0, height])
    .paddingInner(1)

    svg_plot.append("g")
    .call(d3.axisLeft(yName));

    var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(30)) // increase this 40 for more accurate density.
    var allDensity = []
    for (i = 0; i < all_years.length; i++) {
        key = all_years[i]
        density_min = kde(data_min.filter(d => d.year==key).map(function(d){return d.temperature;}))
        density_max = kde(data_max.filter(d => d.year==key).map(function(d){return d.temperature;}))
        allDensity.push({key: key, density_min: density_min, density_max: density_max})
    }

    svg_plot.selectAll()
    .data(allDensity)
    .enter()
    .append("path")
      .attr("transform", function(d){return("translate(0," + (yName(d.key)-height) +")" )})
      .datum(function(d){return(d.density_min)})
      .attr("fill", "blue")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("d",  d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { return x(d[0]); })
          .y(function(d) { return y(d[1]); })
      )
    
    svg_plot.selectAll()
      .data(allDensity)
      .enter()
      .append("path")
        .attr("transform", function(d){return("translate(0," + (yName(d.key)-height) +")" )})
        .datum(function(d){return(d.density_max)})
        .attr("fill", "red")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("d",  d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
        )
}

Promise.all([
    d3.csv("monthly_min_per_year.csv", d => ({ temperature: d.Value, year: d.year, month: d.month })),
    d3.csv("monthly_max_per_year.csv", d => ({ temperature: d.Value, year: d.year, month: d.month })),
    d3.csv("monthly_avg_per_year.csv", d => ({ temperature: d.Value, year: d.year, month: d.month }))
]).then(([minData, maxData, avgData]) => {
    checkbox(minData, maxData, avgData, "checkbox1_list", "svg1", svg_plot1, '#plot1');
    line_scatter_plot(minData, maxData, avgData, svg_plot1, '#plot1', clicked_years_line_scatter);
    checkbox(minData, maxData, avgData, "checkbox2_list", "svg2", svg_plot2, '#plot2');
	radar_chart(avgData, svg_plot2, '#plot2', clicked_years_radar);
    ridge_line(minData, maxData, svg_plot3, '#plot3');
});