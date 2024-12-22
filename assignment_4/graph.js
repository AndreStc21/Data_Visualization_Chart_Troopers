var checkList = document.getElementById('checkbox1');
var clicked_years = new Array()
checkList.getElementsByClassName('anchor')[0].onclick = function(evt) {
  if (checkList.classList.contains('visible'))
    checkList.classList.remove('visible');
  else
    checkList.classList.add('visible');
}

function checkbox(data_min, data_max, data_avg, checkbox_list_id, plot_id) {
	const current_year = new Date().getFullYear();
    const min_year = current_year - 10;

	const checkbox_list = document.getElementById(checkbox_list_id);

	// Iterate through the data array to create and append checkbox elements
	// Use a Set to track unique years
    const uniqueYears = new Set();

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

	const checkbox = document.querySelectorAll("input[type='checkbox']");

	for(check of checkbox){
		check.addEventListener('change', (event) => {
			if (event.currentTarget.checked) {
				clicked_years.push(event.currentTarget.value);
				let plot = document.getElementById("svg1");
				while (plot.firstChild) {
					plot.removeChild(plot.lastChild);
				}
				line_scatter_plot(data_min, data_max, data_avg, svg_plot1, clicked_years);
			} else {
				var index = clicked_years.indexOf(event.currentTarget.value);
				if (index > -1) {
					clicked_years.splice(index, 1);
				}
				let plot = document.getElementById("svg1");
				while (plot.firstChild) {
					plot.removeChild(plot.lastChild);
				}
				line_scatter_plot(data_min, data_max, data_avg, svg_plot1, clicked_years);
			}
		})
	}
	
	clicked_years.push('2024')
}

const margin = { top: 30, right: 30, bottom: 100, left: 100 },
	width = 550 - margin.left - margin.right,
	height = 550 - margin.top - margin.bottom;

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

function line_scatter_plot(data_min, data_max, data_avg, svg_plot, years) {
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
    .range(d3.schemeCategory10); 
    
    const datasets = [
        { data: data_min, label: "Min" },
        { data: data_max, label: "Max" }
    ];

    
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
                );
            });

        // Add scatter plot for the current year
        svg_plot.selectAll(`circle-${year}`)
            .data(data_avg.filter(d => d.year == year))
            .enter()
            .append("circle")
            .attr("cx", d => x(d.month))
            .attr("cy", d => y(d.temperature))
            .attr("r", 3)
            .attr("fill", shades[1]); // Use brighter shade for scatter points
    });
}

Promise.all([
    d3.csv("monthly_min_per_year.csv", d => ({ temperature: d.Value, year: d.year, month: d.month })),
    d3.csv("monthly_max_per_year.csv", d => ({ temperature: d.Value, year: d.year, month: d.month })),
    d3.csv("monthly_avg_per_year.csv", d => ({ temperature: d.Value, year: d.year, month: d.month }))
]).then(([minData, maxData, avgData]) => {
    checkbox(minData, maxData, avgData, "checkbox1_list", "#plot1");
    line_scatter_plot(minData, maxData, avgData, svg_plot1, clicked_years);
});