// Set up the dimensions and margins
const margin = { top: 10, right: 100, bottom: 10, left: 100 };
let width =
	document.getElementById("plot1").clientWidth - margin.left - margin.right;
let height =
	document.getElementById("plot1").clientHeight - margin.top - margin.bottom;

// Format variables
const units = "millions tonnes";
const formatNumber = d3.format(",.0f");
const format = (d) => `${formatNumber(d)} ${units}`;

// Create the SVG container for first plot
const svg_plot1 = d3
	.select("#plot1")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

// Create the SVG container for second plot
const svg_plot2 = d3
	.select("#plot2")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

function map_plot(data, topo, svg_plot, id_div, proj){
  // Map and projection
  const path = d3.geoPath();
  let projection = NaN
  if(proj==="orthographic"){
    projection = d3
    .geoOrthographic()
    .scale(200)
    .center([0, 0])
    .translate([width / 2, height / 2]);
  }
  else{
    projection = d3
    .geoMercator()
    .scale(100)
    .center([0, 0])
    .translate([width / 2, height / 2]);
  }


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

  minVal = d3.min(data.values());
	maxVal = d3.max(data.values());

	const numThresholds = 8;
	const thresholds = Array.from(
		{ length: numThresholds },
		(_, i) => minVal + ((i + 1) * (maxVal - minVal)) / (numThresholds + 1)
	);
	thresholds.unshift(minVal);
	thresholds.push(maxVal);

	const colorScale = d3
		.scaleThreshold()
		.domain(thresholds)
		.range(d3.schemeReds[7]);

	let mouseOver = function (d) {
		d3.selectAll(".Country "+id_div)
			.transition()
			.duration(200)
			.style("opacity", 0.5).style("stroke", "transparent");
		d3.select(this).transition().duration(200).style("opacity", 1).style("stroke", "black");
		tooltip
			.html(
				"Country: " +
					d.currentTarget.__data__.properties.name +
					"<br>Total CO2 emission: " +
					d.currentTarget.__data__.total +
					" " +
					units
			)
			.style("opacity", 1);
	};

	let mouseMove = function tooltipMousemove(event, d) {
		tooltip
			.style("left", event.pageX + 20 + "px")
			.style("top", event.pageY - 100 + "px");
	};

	let mouseLeave = function (d) {
		d3.selectAll(".Country "+id_div).transition().duration(200).style("opacity", 1).style("stroke", "transparent");
		d3.select(this)
			.transition()
			.duration(200)
			.style("stroke", "transparent");
		tooltip.style("opacity", 0);
	};

	// Draw the map
	svg_plot
		.append("g")
		.selectAll("path")
		.data(topo.features)
		.enter()
		.append("path")
		// draw each country
		.attr("d", d3.geoPath().projection(projection))
		// set the color of each country
		.attr("fill", function (d) {
			d.total = data.get(d.id) || 0;
			return colorScale(d.total);
		})
		.style("stroke", "transparent")
		.attr("class", function (d) {
			return "Country "+id_div;
		})
		.style("opacity", 1)
		.on("mouseover", mouseOver)
		.on("mouseleave", mouseLeave)
		.on("mousemove", mouseMove);
}


// Data and color scale
var data = new Map();
// Load external data and boot
Promise.all([
	d3.json("world.geojson"),
	d3.csv("co2-total-country-emissions.csv", function (d) {
		data.set(d.Code, +d.Emissions);
	}),
]).then(function (loadData) {
	let topo = loadData[0];
  map_plot(data, topo, svg_plot1, 'plot_1', 'mercator');
  map_plot(data, topo, svg_plot2, 'plot_2', 'orthographic');
});
