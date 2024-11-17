// Set up the dimensions and margins
const margin = { top: 10, right: 20, bottom: 10, left: 20 };
let width = document.getElementById('plot1').clientWidth - margin.left - margin.right;
let height = document.getElementById('plot1').clientHeight - margin.top - margin.bottom;

// Format variables
const units = "millions tonnes";
const formatNumber = d3.format(",.0f");
const format = d => `${formatNumber(d)} ${units}`;
const color_map = {
  'Asia': '#FFA630',
  'China': '#FFA630',
  'India': '#FFA630',
  'Indonesia': '#FFA630',

  'North America': '#D7E8BA',
  'United States': '#D7E8BA',
  'Mexico': '#D7E8BA',
  'Canada': '#D7E8BA',

  'Europe': '#4DA1A9',
  'Russia': '#4DA1A9',
  'Germany': '#4DA1A9',
  'United Kingdom': '#4DA1A9',

  'South America': '#2E5077',
  'Brazil': '#2E5077',
  'Argentina': '#2E5077',
  'Colombia': '#2E5077',

  'Africa': '#CEABB1',
  'Democratic Republic of Congo': '#CEABB1',
  'South Africa': '#CEABB1',
  'Egypt': '#CEABB1',

  'Oceania': '#E83F6F',
  'Australia': '#E83F6F',
  'New Zealand': '#E83F6F',
  'Papua New Guinea': '#E83F6F',

  'fossil': '#694A38',
  
  'land': '#2C5530',
}

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
    real_value: d.real_value
  }));

  // Process links data - convert string indices to numbers
  const links = linksData.map(d => ({
    source: parseInt(d.source),
    target: parseInt(d.target),
    value: parseFloat(d.value),
    real_value: parseFloat(d.real_value)
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
      .attr("stop-color", color_map[link.source.name]);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color_map[link.target.name]);
  });

  // Add the links
  const link = svg.append("g")
    .selectAll(".link")
    .data(sankeyLinks)
    .join("path")
    .attr("class", "link")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", (d, i) => `url(#gradient-${i})`)
    .attr("stroke-width", d => Math.max(1, d.width))
    .on("mouseover", highlightFlowLink)
    .on("mouseout", unhighlightFlow);

  // Add link titles (tooltips)
  link.append("title")
    .text(d => `${d.source.name} → ${d.target.name}\n${format(d.real_value)}`);

  // Add the nodes
  const node = svg.append("g")
    .selectAll(".node")
    .data(sankeyNodes)
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // Add rectangles for the nodes
  node.append("rect")
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => color_map[d.name])
    .attr("stroke", "#000")
    .on("mouseover", highlightFlowNode)
    .on("mouseout", unhighlightFlow);

  // Add titles for the nodes
  node.append("text")
    .attr("x", d => (d.x0 < width / 2) ? 6 + (d.x1 - d.x0) : -6)
    .attr("y", d => (d.y1 - d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => (d.x0 < width / 2) ? "start" : "end")
    .text(d => d.name);

  // Add tooltips for nodes
  node.append("title")
    .text(d => `${d.name}\n${format(d.real_value)}`);

  // Function to highlight the flow
  function highlightFlowNode(event, d) {
    // Reduce opacity of all links and nodes
    link.style("stroke-opacity", 0.1);
    node.style("opacity", 0.1);
    
    // Get all connected links
    const linkedNodes = new Set();
    linkedNodes.add(d);
    
    // Highlight connected links and their nodes
    link.filter(l => l.source === d || l.target === d)
      .style("stroke-opacity", 0.7)
      .each(l => {
        linkedNodes.add(l.source);
        linkedNodes.add(l.target);
      });
    
    // Highlight connected nodes
    node.filter(n => linkedNodes.has(n))
      .style("opacity", 1);
  }

  // Function to remove highlighting
  function unhighlightFlow() {
    link.style("stroke-opacity", 0.2);
    node.style("opacity", 1);
  }

  // Function to highlight the flow
  function highlightFlowLink(event, d) {
    // Reduce opacity of all links and nodes
    link.style("stroke-opacity", 0.1);
    node.style("opacity", 0.1);
    
    // Get all connected links
    const linkedNodes = new Set();
    
    // Highlight connected links and their nodes
    link.filter(l => l.source === d.source && l.target === d.target)
      .style("stroke-opacity", 0.7)
      .each(l => {
        linkedNodes.add(l.source);
        linkedNodes.add(l.target);
      });
    
    // Highlight connected nodes
    node.filter(n => linkedNodes.has(n))
      .style("opacity", 1);
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