// Set up the dimensions and margins
const margin = { top: 10, right: 100, bottom: 10, left: 100 };
let width = document.getElementById('plot1').clientWidth - margin.left - margin.right;
let height = document.getElementById('plot1').clientHeight - margin.top - margin.bottom;

// Format variables
const units = "millions tonnes";
const formatNumber = d3.format(",.0f");
const format = d => `${formatNumber(d)} ${units}`;

// Create the SVG container
const svg = d3.select("#plot1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Create gradient definitions
const defs = svg.append("defs");

// Set up the sankey generator
const sankey = d3.sankey()
  .nodeWidth(36)
  .nodePadding(20)
  .extent([[0, 0], [width, height]]);

// Load and process the data
Promise.all([
  d3.csv('nodes.csv'),
  d3.csv('links.csv')
]).then(([nodesData, linksData]) => {
  // Process nodes data - create array of node objects
  const nodes = nodesData.map(d => ({
    name: d.node,
    value: d.real_value,
    value_fake: d.value,
    indirect_links: new Set(JSON.parse(d.indirect_links)),
    color: d.color
  }));

  // Process links data - convert string indices to numbers
  const links = linksData.map(d => ({
    source: parseInt(d.source),
    target: parseInt(d.target),
    value: parseFloat(d.real_value),
    // real_value: parseFloat(d.real_value)
  }));

  // Generate the sankey diagram
  const { nodes: sankeyNodes, links: sankeyLinks } = sankey({
    nodes: nodes,
    links: links
  });

  // Create gradients for each link
  sankeyLinks.forEach((link, i) => {
    const gradientId = `gradient-${i}`;
    const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", link.source.x1)
      .attr("x2", link.target.x0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", link.source.color);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", link.target.color);
  });

  // Add the links
  const link = svg.append("g")
    .selectAll(".link")
    .data(sankeyLinks)
    .join("path")
    .attr("class", "link")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", (d, i) => `url(#gradient-${i})`)
    .attr("stroke-width", d => Math.max(0, d.width))
    .on("mouseover", highlightFlowLink)
    .on("mouseout", unhighlightFlow)
    .on("mousemove", tooltipMousemove);
  
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

  // // Add link titles (tooltips)
  // link.append("title")
  //   .text(d => `${d.source.name} → ${d.target.name}\n${format(d.real_value)}`);

  // Add the nodes
  const node = svg.append("g")
    .selectAll(".node")
    .data(sankeyNodes)
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // Add rectangles for the nodes
  node.append("rect")
    .attr("height", d => (d.y1 - d.y0)*(d.value/d.value_fake))
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => d.color)
    .attr("stroke", "#000")
    .on("mouseover", highlightFlowNode)
    .on("mouseout", unhighlightFlow)
    .on("mousemove", tooltipMousemove);

  // Add titles for the nodes
  node.append("text")
    .attr("x", d => (d.x0 < width / 2) ? 6 + (d.x1 - d.x0) : -6)
    .attr("y", d => (d.y1 - d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => (d.x0 < width / 2) ? "start" : "end")
    .text(d => d.name);

  // // Add tooltips for nodes
  // node.append("title")
  //   .text(d => `${d.name}\n${format(d.real_value)}`);

  // Function to highlight the flow
  function highlightFlowNode(event, d) {
    // Reduce opacity of all links and nodes
    link.style("stroke-opacity", 0.1);
    node.style("opacity", 0.1);
    
    // Get all connected links
    const linkedNodes = new Set();
    linkedNodes.add(d);
    
    // Highlight connected links and their nodes
    link.filter(l => l.source === d || l.target === d || d.indirect_links.has(l.source.index) || d.indirect_links.has(l.target.index))
      .style("stroke-opacity", 0.7)
      .each(l => {
        linkedNodes.add(l.source);
        linkedNodes.add(l.target);
      });
    
    // Highlight connected nodes
    node.filter(n => linkedNodes.has(n))
      .style("opacity", 1);
    
    tooltip.html("Total CO2 emission: " + d.value + " " + units).style("opacity", 1);
  }

  // Function to remove highlighting
  function unhighlightFlow() {
    link.style("stroke-opacity", 0.2);
    node.style("opacity", 1);
    tooltip.style("opacity", 0);
  }

  function tooltipMousemove(event, d) {
    tooltip.style('left', (event.pageX+20) + 'px').style('top', (event.pageY-100) + 'px');
  }

  // Function to highlight the flow
  function highlightFlowLink(event, d) {
    // Reduce opacity of all links and nodes
    link.style("stroke-opacity", 0.1);
    node.style("opacity", 0.1);
    
    // Get all connected links
    const linkedNodes = new Set();
    
    // Highlight connected links and their nodes
    link.filter(l => (l.source === d.source && l.target === d.target) || (l.source === d.target && nodes[d.source.index].indirect_links.has(l.target.index)) || (l.target === d.source && nodes[d.target.index].indirect_links.has(l.source.index)))
      .style("stroke-opacity", 0.7)
      .each(l => {
        linkedNodes.add(l.source);
        linkedNodes.add(l.target);
      });
    
    // Highlight connected nodes
    node.filter(n => linkedNodes.has(n))
      .style("opacity", 1);
    if(d.target.name==="fossil"||d.target.name==="land"){
      tooltip.html(d.source.name + " CO2 " + d.target.name+ " emission: " + d.value + " " + units).style("opacity", 1);
    }
    if(d.source.name==="fossil"||d.source.name==="land"){
      tooltip.html(d.target.name + " CO2 " + d.source.name+ " emission: " + d.value + " " + units).style("opacity", 1);
    }
  }

}).catch(error => {
  console.error('Error loading the data:', error);
});

// Make it responsive
function resize() {
  width = document.getElementById('plot1').clientWidth - margin.left - margin.right;
  height = document.getElementById('plot1').clientHeight - margin.top - margin.bottom;
  
  d3.select("#plot1 svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
    
  sankey.extent([[0, 0], [width, height]]);
}

window.addEventListener("resize", resize);