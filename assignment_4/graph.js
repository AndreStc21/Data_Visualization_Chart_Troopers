var checkList = document.getElementById('checkbox1');
var clicked_years = new Array()
checkList.getElementsByClassName('anchor')[0].onclick = function(evt) {
  if (checkList.classList.contains('visible'))
    checkList.classList.remove('visible');
  else
    checkList.classList.add('visible');
}

function checkbox(data, checkbox_list_id) {
	const current_year = new Date().getFullYear();
    const min_year = current_year - 10;

	const checkbox_list = document.getElementById(checkbox_list_id);

	// Iterate through the data array to create and append checkbox elements
	// Use a Set to track unique years
    const uniqueYears = new Set();

    data.forEach(item => {
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
				line_plot(avg_data, svg_plot1, "#plot1", clicked_years);
			} else {
				var index = clicked_years.indexOf(event.currentTarget.value);
				if (index > -1) {
					clicked_years.splice(index, 1);
				}
				let plot = document.getElementById("svg1");
				while (plot.firstChild) {
					plot.removeChild(plot.lastChild);
				}
				line_plot(avg_data, svg_plot1, "#plot1", clicked_years);
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



function add_axis_label(svg_plot, x, y, transform, text_anchor, label) {
	svg_plot
		.append("text")
		.attr("text-anchor", text_anchor)
		.attr("x", x)
		.attr("y", y)
		.attr("transform", transform)
		.text(label);
}

function line_plot(data, svg_plot, plot_id, years) {
	data = data.filter(d => years.includes(d.year))
	
	// Add X axis
    var x = d3.scaleLinear()
      .domain(['1', '12'])
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
	for(year of clicked_years){
		svg_plot.append("path")
		.datum(data.filter(d => d.year==year))
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-width", 1.5)
		.attr("d", d3.line()
			.x(function(d) { return x(d.month) })
			.y(function(d) { return y(d.temperature) })
			)
	}
}

avg_data = new Array()

d3.csv("monthly_avg_per_year.csv", function (d) {
	return {
		temperature: d.Value,
		year: d.year,
		month: d.month,
	};
}).then(function (data) {
	avg_data = data;
	checkbox(avg_data, "checkbox1_list");
	line_plot(avg_data, svg_plot1, "#plot1", clicked_years);
});
