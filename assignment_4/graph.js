const margin = { top: 30, right: 30, bottom: 100, left: 100 },
	width = 550 - margin.left - margin.right,
	height = 550 - margin.top - margin.bottom;

const svg_plot1 = d3
	.select("#plot1")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
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

function line_plot(data, svg_plot, plot_id) {
	
	// Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.month; }))
      .range([ 0, width ]);
	  svg_plot.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.temperature; })])
      .range([ height, 0 ]);
	svg_plot.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    svg_plot.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.month) })
        .y(function(d) { return y(d.temperature) })
        )
	}

d3.csv("monthly_avg_per_year.csv", function (d) {
	return {
		temperature: d.Value,
		year: d.year,
		month: d.month,
	};
}).then(function (data) {
	line_plot(data, svg_plot1, "#plot1");
});
