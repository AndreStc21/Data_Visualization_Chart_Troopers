const margin = { top: 30, right: 30, bottom: 100, left: 100 },
	width = 550 - margin.left - margin.right,
	height = 550 - margin.top - margin.bottom;

const colours = [
	"#4C6A92",
	"#F28C3B",
	"#D35C63",
	"#67A9A5",
	"#7C9F5D",
	"#F1C04A",
];

const svg_plot1 = d3
	.select("#plot1")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot2 = d3
	.select("#plot2")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot3 = d3
	.select("#plot3")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot4 = d3.select("#plot4");

const svg_plot5 = d3
	.select("#plot5")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

const svg_plot6 = d3
	.select("#plot6")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom + 170)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

function add_axis_label(svg_plot, x, y, transform, text_anchor, label) {
	svg_plot
		.append("text")
		.attr("text-anchor", text_anchor)
		.attr("x", x)
		.attr("y", y)
		.attr("transform", transform)
		.text(label);
}

function bar_plot(data, svg_plot, id_div) {
	var max_value = 0;
	data.forEach((d) => {
		if (d.emissions > max_value) {
			max_value = d.emissions;
		}
	});

	const x = d3
		.scaleBand()
		.range([0, width])
		.domain(data.map((d) => d.entity))
		.padding(0.2);

	svg_plot
		.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x).tickSizeOuter([0]))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	add_axis_label(
		svg_plot,
		width / 2,
		height + margin.bottom - 5,
		"",
		"middle",
		"Country"
	);

	const y = d3
		.scaleLinear()
		.domain([0, max_value + 0.1 * max_value])
		.range([height, 0]);

	svg_plot.append("g").call(d3.axisLeft(y).tickSizeOuter([0]));

	add_axis_label(
		svg_plot,
		-height / 2,
		-margin.left + 15,
		"rotate(-90)",
		"middle",
		"CO2 emissions per capita (tonnes)"
	);

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

	var mouseover = function (event, d) {
		d3.selectAll(id_div + "  rect").style("opacity", 0.2);
		d3.select(this).style("opacity", 1);
		info = d3.select(this).datum();
		tooltip
			.html("CO2 emissions: " + info.emissions + " tonnes")
			.style("opacity", 1);
	};

	var mousemove = function (event, d) {
		tooltip
			.style("left", event.pageX + 20 + "px")
			.style("top", event.pageY - 100 + "px");
	};

	var mouseleave = function (event, d) {
		d3.selectAll(id_div + " rect").style("opacity", 1);
		tooltip.style("opacity", 0);
	};

	svg_plot
		.selectAll()
		.data(data)
		.join("rect")
		.attr("x", (d) => x(d.entity))
		.attr("y", (d) => y(d.emissions))
		.attr("width", x.bandwidth())
		.attr("height", (d) => height - y(d.emissions))
		.attr("fill", "#69b3a2")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);
}

function stacked_bar_plot(data, svg_plot, id_div, normalized) {
	const nestedData = Array.from(
		d3.group(data, (d) => d.region),
		([region, values]) => {
			const regionData = { region: region };
			values.forEach((v) => (regionData[v.rank] = v.emissions));
			return regionData;
		}
	);

	var mapping_entity = {};
	data.forEach((d) => (mapping_entity[d.region + d.rank] = d.entity));

	const subgroups = Array.from(new Set(data.map((d) => d.rank)));
	const groups = Array.from(new Set(data.map((d) => d.region)));

	if (normalized) {
		for (let i = 0; i < 6; i++) {
			let value_region = 0;
			subgroups.forEach((j) => (value_region += nestedData[i][j]));
			subgroups.forEach(
				(j) =>
					(nestedData[i][j] = parseFloat(
						((nestedData[i][j] / value_region) * 100).toFixed(1)
					))
			);
		}
	}

	// Get the max value for the Y axis
	var max_value = 0;
	for (let i = 0; i < 6; i++) {
		let value_region = 0;
		subgroups.forEach((j) => (value_region += nestedData[i][j]));
		if (value_region > max_value) {
			max_value = value_region;
		}
	}

	// Add X axis
	/* legend_width = 50; */
	var x;
	if (normalized) {
		x = d3
			.scaleLinear()
			.domain([0, max_value])
			.range([0, width]); /* width-legend_width-10]); */
	} else {
		x = d3
			.scaleLinear()
			.domain([0, max_value + 0.1 * max_value])
			.range([0, width]); /* width-legend_width-10]); */
	}

	svg_plot
		.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x).tickSizeOuter([0]))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	label_x = normalized
		? "CO2 emissions (%)"
		: "CO2 emissions (millions tonnes)";
	add_axis_label(
		svg_plot,
		width / 2,
		height + margin.bottom - 5,
		"",
		"middle",
		label_x
	);

	// Add Y axis
	const y = d3.scaleBand().range([0, height]).domain(groups).padding(0.2);

	svg_plot.append("g").call(d3.axisLeft(y).tickSizeOuter([0]));

	add_axis_label(
		svg_plot,
		-height / 2,
		-margin.left + 15,
		"rotate(-90)",
		"middle",
		"Region"
	);

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

	var mouseover = function (event, d) {
		d3.selectAll(id_div + "  rect").style("opacity", 0.2);
		d3.select(this).style("opacity", 1);
		info = d3.select(this).datum();
		info_parent = d3.select(this.parentNode).datum();
		if (normalized) {
			tooltip
				.html(
					"Location: " +
						mapping_entity[info.data.region + info_parent.key] +
						"<br>" +
						"Value: " +
						info.data[info_parent.key] +
						"%"
				)
				.style("opacity", 1);
		} else {
			tooltip
				.html(
					"Location: " +
						mapping_entity[info.data.region + info_parent.key] +
						"<br>" +
						"Value: " +
						info.data[info_parent.key] +
						" millions tonnes"
				)
				.style("opacity", 1);
		}
	};

	var mousemove = function (event, d) {
		tooltip
			.style("left", event.pageX + 20 + "px")
			.style("top", event.pageY - 100 + "px");
	};

	var mouseleave = function (event, d) {
		d3.selectAll(id_div + " rect").style("opacity", 1);
		tooltip.style("opacity", 0);
	};

	const color = d3.scaleOrdinal().domain(subgroups).range(colours);

	const stackedData = d3.stack().keys(subgroups)(nestedData);

	svg_plot
		.append("g")
		.selectAll("g")
		// Enter in the stack data = loop key per key = group per group
		.data(stackedData)
		.join("g")
		.attr("fill", (d) => color(d.key))
		.selectAll("rect")
		// enter a second time = loop subgroup per subgroup to add all rectangles
		.data((d) => d)
		.join("rect")
		.attr("y", (d) => y(d.data.region))
		.attr("x", (d) => x(d[0]))
		.attr("width", (d) => x(d[1]) - x(d[0]))
		.attr("height", y.bandwidth())
		.attr("stroke", "grey")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);

	// Add legend in the top-right corner of the chart
	/* const legendOffsetX = width - legend_width; // Adjust for legend's width
	const legendOffsetY = 10;  // Small offset from the top

	const svgLegend = svg_plot.append("g")
		.attr("transform", `translate(${legendOffsetX}, ${legendOffsetY})`);

	// Add one dot in the legend for each name
	svgLegend.selectAll("mydots")
		.data(subgroups)
		.enter()
		.append("circle")
			.attr("cx", 10)  // Position circle inside legend group
			.attr("cy", (d, i) => 10 + i * 25)  // 10 is where the first dot appears, 25 is spacing
			.attr("r", 7)
			.style("fill", d => color(d));

	// Add text labels for each dot in the legend
	svgLegend.selectAll("mylabels")
		.data(subgroups)
		.enter()
		.append("text")
			.attr("x", 30)  // Position text to the right of the dots
			.attr("y", (d, i) => 10 + i * 25)
			.style("fill", d => color(d))
			.text(d => "Rank " + d)
			.attr("text-anchor", "left")
			.style("alignment-baseline", "middle"); */
}

function small_multiples_bar_plot(data, id_div) {
	// Group data by rank
	const sumstat = d3.group(data, (d) => d.rank);
	const max_value = d3.max(data, (d) => d.emissions);

	const n_plots = 6;
	const multiples_width = width / n_plots; // Adjust width based on the total row width you desire
	const multiples_height = height;

	const color = d3
		.scaleOrdinal()
		.domain(Array.from(new Set(data.map((d) => d.rank))))
		.range(colours);

	// Prepare SVG container as a flex or grid container
	d3.select(id_div)
		.style("display", "flex")
		.style("flex-wrap", "wrap")
		.style("justify-content", "space-evenly");

	// Loop over each rank to create a plot for each
	sumstat.forEach((rankData, rank) => {
		// console.log(rank);
		const svg = d3
			.select(id_div)
			.append("svg")
			.attr("width", multiples_width + margin.left + margin.right)
			.attr("height", multiples_height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		// Scales
		const x = d3
			.scaleLinear()
			.domain([0, max_value])
			.range([0, multiples_width]);

		const y = d3
			.scaleBand()
			.domain(rankData.map((d) => d.region))
			.range([0, multiples_height])
			.padding(0.2);

		// Tooltip
		const tooltip = d3
			.select("#content-wrap")
			.append("div")
			.style("opacity", 0)
			.attr("class", "tooltip")
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "1px")
			.style("border-radius", "5px")
			.style("padding", "10px")
			.style("position", "absolute");

		const mouseover = function (event, d) {
			tooltip.style("opacity", 1);
			d3.selectAll(id_div + "  rect").style("opacity", 0.2);
			d3.select(this).style("opacity", 1);
		};

		const mousemove = function (event, d) {
			tooltip
				.html(
					"Location: " +
						d.entity +
						"<br>CO2 emissions: " +
						d.emissions +
						" millions tonnes"
				)
				.style("left", event.pageX + 20 + "px")
				.style("top", event.pageY - 100 + "px");
		};

		const mouseleave = function (event, d) {
			tooltip.style("opacity", 0);
			d3.selectAll(id_div + " rect").style("opacity", 1);
		};

		// X and Y axes
		svg.append("g")
			.attr("transform", `translate(0, ${height})`)
			.call(d3.axisBottom(x).ticks(1).tickSizeOuter([0]));

		svg.append("g")
			.call(d3.axisLeft(y).tickSize(0).tickPadding(6))
			.selectAll(".tick text")
			.style("opacity", rank == 1.0 ? 1 : 0);

		if (rank == 1.0) {
			add_axis_label(
				svg,
				-height / 2,
				-margin.left + 15,
				"rotate(-90)",
				"middle",
				"Region"
			);
			add_axis_label(
				svg,
				45,
				height + margin.bottom - 40,
				"",
				"middle",
				"CO2 emissions"
			);
		}

		// Bars
		svg.selectAll("rect")
			.data(rankData)
			.join("rect")
			.attr("x", 0)
			.attr("y", (d) => y(d.region))
			.attr("width", (d) => x(d.emissions))
			.attr("height", y.bandwidth())
			.attr("fill", color(rank))
			.style("opacity", 1)
			.on("mouseover", mouseover)
			.on("mousemove", mousemove)
			.on("mouseleave", mouseleave);
	});
}

function heatmap_plot(data, svg_plot, id_div) {
	/*
	var max_value_fossil = 0;
	var second_max_value_fossil = 0;
	var min_value_fossil = Infinity;

	var max_value_land = 0;
	var second_max_value_land = 0;
	var min_value_land = Infinity;

	data.forEach((d) => {
		if (d.group == "fossil") {
			if (d.value > max_value_fossil) {
				second_max_value_fossil = max_value_fossil;
				max_value_fossil = d.value;
			} else if (
				d.value > second_max_value_fossil &&
				d.value != max_value_fossil
			) {
				second_max_value_fossil = d.value;
			}
			if (d.value < min_value_fossil) {
				min_value_fossil = d.value;
			}
		} else {
			if (d.value > max_value_land) {
				second_max_value_land = max_value_land;
				max_value_land = d.value;
			} else if (
				d.value > second_max_value_land &&
				d.value != max_value_land
			) {
				second_max_value_land = d.value;
			}
			if (d.value < min_value_land) {
				min_value_land = d.value;
			}
		}
	});
	*/
	var max_value_fossil = -Infinity;
	var min_value_fossil = Infinity;

	var max_value_land = -Infinity;
	var min_value_land = Infinity;

	data.forEach((d) => {
		if (d.group == "fossil") {
			if (d.value > max_value_fossil) {
				max_value_fossil = d.value;
			}
			if (d.value < min_value_fossil) {
				min_value_fossil = d.value;
			}
		} else {
			if (d.value > max_value_land) {
				max_value_land = d.value;
			}
			if (d.value < min_value_land) {
				min_value_land = d.value;
			}
		}
	});

	const myColor_fossil = d3
		.scaleLinear()
		.range(["white", "red"])
		.domain([0, max_value_fossil]);

	const myColor_land = d3
		.scaleLinear()
		.range(["green", "white", "red"])
		.domain([min_value_land, 0, max_value_land]);

	const y = d3
		.scaleBand()
		.range([0, width])
		.domain(data.map((d) => d.group));

	const x = d3
		.scaleBand()
		.domain(data.map((d) => d.entity))
		.range([height, 0]);

	svg_plot
		.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(d3.axisBottom(x).tickSizeOuter([0]))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	add_axis_label(
		svg_plot,
		width / 2,
		height + margin.bottom - 5,
		"",
		"middle",
		"Country"
	);

	svg_plot.append("g").call(d3.axisLeft(y).tickSizeOuter([0]));

	add_axis_label(
		svg_plot,
		-height / 2,
		-margin.left + 15,
		"rotate(-90)",
		"middle",
		"Emission Type"
	);

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

	const legendHeight = 20;
	const legendWidth = width * 0.8;
	const legendX = (width - legendWidth) / 2;
	const legendY = height + 150;

	svg_plot
		.append("g")
		.attr("class", "legend")
		.attr("transform", `translate(${legendX}, ${legendY})`)
		.append("rect")
		.attr("width", legendWidth)
		.attr("height", legendHeight)
		.style("fill", "url(#linear-gradient-fossil)");

	const defs = svg_plot.append("defs");
	const linearGradientFossil = defs
		.append("linearGradient")
		.attr("id", "linear-gradient-fossil");

	linearGradientFossil
		.selectAll("stop")
		.data([
			{ offset: "0%", color: "green" },
			{ offset: "1%", color: "white" },
			{ offset: "100%", color: "red" },
		])
		.enter()
		.append("stop")
		.attr("offset", (d) => d.offset)
		.attr("stop-color", (d) => d.color);

	var min_value = Math.min(min_value_fossil, min_value_land);
	var max_value = Math.max(max_value_fossil, max_value_land);

	const legendScale = d3
		.scaleLinear()
		.domain([min_value, max_value])
		.range([0, legendWidth]);

	const legendAxis = d3
		.axisBottom(legendScale)
		.tickValues([
			min_value,
			(min_value + max_value) / 4,
			(min_value + max_value) / 2,
			((min_value + max_value) * 3) / 4,
			max_value,
		]);

	svg_plot
		.append("g")
		.attr("class", "legend-axis")
		.attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
		.call(legendAxis);

	svg_plot
		.append("text")
		.attr("x", legendX + legendWidth / 2)
		.attr("y", legendY - 10)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.text("Emission Values (millions of tonnes)");
	/*
	// Legend 4 fossil
	const legendHeight = 20;
	const legendWidth = width * 0.8;
	const legendX = (width - legendWidth) / 2;
	const legendY = height + 150;

	svg_plot
		.append("g")
		.attr("class", "legend")
		.attr("transform", `translate(${legendX}, ${legendY})`)
		.append("rect")
		.attr("width", legendWidth)
		.attr("height", legendHeight)
		.style("fill", "url(#linear-gradient-fossil)");

	const defs = svg_plot.append("defs");
	const linearGradientFossil = defs
		.append("linearGradient")
		.attr("id", "linear-gradient-fossil");

	linearGradientFossil
		.selectAll("stop")
		.data([
			{ offset: "0%", color: "white" },
			{ offset: "100%", color: "red" },
		])
		.enter()
		.append("stop")
		.attr("offset", (d) => d.offset)
		.attr("stop-color", (d) => d.color);

	const legendScaleFossil = d3
		.scaleLinear()
		.domain([0, max_value_fossil])
		.range([0, legendWidth]);

	const legendAxisFossil = d3
		.axisBottom(legendScaleFossil)
		.tickValues([
			0,
			(0 + max_value_fossil) / 4,
			(0 + max_value_fossil) / 2,
			((0 + max_value_fossil) * 3) / 4,
			max_value_fossil,
		]);

	svg_plot
		.append("g")
		.attr("class", "legend-axis")
		.attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
		.call(legendAxisFossil);

	svg_plot
		.append("text")
		.attr("x", legendX + legendWidth / 2)
		.attr("y", legendY - 10)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.text("Fossil Emission Values (millions of tonnes)");

	// Legend 4 land
	const legendYLand = legendY + legendHeight + 60;

	svg_plot
		.append("g")
		.attr("class", "legend-land")
		.attr("transform", `translate(${legendX}, ${legendYLand})`)
		.append("rect")
		.attr("width", legendWidth)
		.attr("height", legendHeight)
		.style("fill", "url(#linear-gradient-land)");

	const linearGradientLand = defs
		.append("linearGradient")
		.attr("id", "linear-gradient-land");

	linearGradientLand
		.selectAll("stop")
		.data([
			{ offset: "0%", color: "green" },
			{ offset: "50%", color: "white" },
			{ offset: "100%", color: "red" },
		])
		.enter()
		.append("stop")
		.attr("offset", (d) => d.offset)
		.attr("stop-color", (d) => d.color);

	const legendScaleLand = d3
		.scaleLinear()
		.domain([min_value_land, 0, max_value_land])
		.range([0, legendWidth / 2, legendWidth]);

	const legendAxisLand = d3
		.axisBottom(legendScaleLand)
		.tickValues([
			min_value_land,
			min_value_land / 2,
			0,
			max_value_land / 2,
			max_value_land,
		]);

	svg_plot
		.append("g")
		.attr("class", "legend-axis-land")
		.attr(
			"transform",
			`translate(${legendX}, ${legendYLand + legendHeight})`
		)
		.call(legendAxisLand);

	svg_plot
		.append("text")
		.attr("x", legendX + legendWidth / 2)
		.attr("y", legendYLand - 10)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.text("Land Emission Values (millions of tonnes)");
		*/

	// Tooltip and interaction functions
	var mouseover = function (event, d) {
		d3.selectAll(id_div + "  rect").style("opacity", 0.2);
		d3.selectAll(".legend  rect").style("opacity", 1);
		d3.selectAll(".legend-land  rect").style("opacity", 1);
		d3.select(this).style("opacity", 1);
		info = d3.select(this).datum();
		tooltip
			.html(
				"Country: " +
					info.entity +
					"<br>" +
					"Value: " +
					info.value +
					" millions tonnes"
			)
			.style("opacity", 1);
	};

	var mousemove = function (event, d) {
		tooltip
			.style("left", event.pageX + 20 + "px")
			.style("top", event.pageY - 100 + "px");
	};

	var mouseleave = function (event, d) {
		d3.selectAll(id_div + " rect").style("opacity", 1);
		tooltip.style("opacity", 0);
	};

	svg_plot
		.selectAll()
		.data(data, function (d) {
			return d.group + ":" + d.entity;
		})
		.enter()
		.append("rect")
		.attr("y", function (d) {
			return y(d.group);
		})
		.attr("x", function (d) {
			return x(d.entity);
		})
		.attr("width", x.bandwidth())
		.attr("height", y.bandwidth())
		.style("stroke", "black")
		.style("fill", function (d) {
			if (d.group == "fossil") {
				return myColor_fossil(d.value);
			} else {
				return myColor_land(d.value);
			}
		})
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);
}

d3.csv("co-emissions-per-capita-last-year.csv", function (d) {
	return {
		entity: d.Entity,
		code: d.Code,
		emissions: +d["Annual CO2 emissions (per capita)"],
	};
}).then(function (data) {
	bar_plot(data, svg_plot1, "#plot1");
});

d3.csv("co-emissions-per-capita-last-decade.csv", function (d) {
	return {
		entity: d.Entity,
		code: d.Code,
		emissions: +d["Annual CO2 emissions (per capita)"],
	};
}).then(function (data) {
	bar_plot(data, svg_plot2, "#plot2");
});

d3.csv("co-emissions-last-year-region-comparison.csv", function (d) {
	return {
		region: d.Region,
		entity: d.Entity,
		emissions: +d["Annual CO2 emissions"],
		rank: d.Rank,
	};
}).then(function (data) {
	stacked_bar_plot(data, svg_plot3, "#plot3", false);
	small_multiples_bar_plot(data, "#plot4");
	stacked_bar_plot(data, svg_plot5, "#plot5", true);
});

d3.csv("co2-emission-type-last-year.csv", function (d) {
	return {
		entity: d.Entity,
		code: d.Code,
		group: d.Group,
		value: +d["Value"],
	};
}).then(function (data) {
	heatmap_plot(data, svg_plot6, "#plot6");
});
