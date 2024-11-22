// Set up the dimensions and margins
const margin = { top: 10, right: 100, bottom: 10, left: 100 };
let width = document.getElementById('plot1').clientWidth - margin.left - margin.right;
let height = document.getElementById('plot1').clientHeight - margin.top - margin.bottom;

// Format variables
const units = "millions tonnes";
const formatNumber = d3.format(",.0f");
const format = d => `${formatNumber(d)} ${units}`;

// Create the SVG container for first plot
const svg_plot1 = d3.select("#plot1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Create the SVG container for second plot
const svg_plot2 = d3.select("#plot2")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// Map and projection
const path = d3.geoPath();

const projection = d3.geoMercator()
  .scale(100)
  .center([0, 0])
  .translate([width / 2, height / 2]);

// Data and color scale
const data = new Map();

var tooltip = d3.select("#content-wrap")
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

// Load external data and boot
Promise.all([
d3.json("world.geojson"),
d3.csv("co2-total-country-emissions.csv", function(d) {
    data.set(d.Code, +d.Emissions)
})]).then(function(loadData){
    let topo = loadData[0]

    minVal = d3.min(data.values())
    maxVal = d3.max(data.values())

    const colorScale = d3.scaleThreshold()
    .domain([minVal, minVal + (maxVal - minVal) / 6, minVal + 2 * (maxVal - minVal) / 6, minVal + 3 * (maxVal - minVal) / 6, minVal + 4 * (maxVal - minVal) / 6, minVal + 5 * (maxVal - minVal) / 6, maxVal])
    .range(d3.schemeReds[7]);

    let mouseOver = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5)
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
    tooltip.html("Country: " + d.currentTarget.__data__.properties.name + "<br>Total CO2 emission: " + d.currentTarget.__data__.total + " " + units).style("opacity", 1);
  }

  let mouseMove = function tooltipMousemove(event, d) {
    tooltip.style('left', (event.pageX+20) + 'px').style('top', (event.pageY-100) + 'px');
  }

  let mouseLeave = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .8)
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "transparent")
    tooltip.style("opacity", 0);
  }

  // Draw the map
  svg_plot1.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )
      .on("mousemove", mouseMove)
})
