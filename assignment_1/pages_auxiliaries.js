// HEAD
document.write(`
    <meta charset="UTF-8">
    <meta name="theme-color" content="#2e68c0">
    <link rel="stylesheet" type="text/css" href="${location.pathname.includes('assignment_1') ? '../main.css' : 'main.css'}"/>
    <script src="https://d3js.org/d3.v7.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100..900&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto+Slab:wght@100..900&display=swap" rel="stylesheet">
    <script src="${location.pathname.includes('assignment_1') ? 'graph.js' : 'pages/graph.js'}"></script>
    <title>Chart Troopers' Website</title>
`);

// NAV
document.addEventListener("DOMContentLoaded", function() {
    const navbar = document.createElement("nav");
    navbar.id = "navbar";
    navbar.innerHTML = `<h1 id="title" style="cursor: pointer;">
                           <a href="https://andrestc21.github.io/Data_Visualization_Chart_Troopers/" style="text-decoration: none">
                               Data Visualization Website
                           </a>
                       </h1>`;
    
    document.body.insertBefore(navbar, document.body.firstChild);
});

// FOOTER
document.addEventListener("DOMContentLoaded", function() {
    const footer = document.getElementById("footer");
    if (footer) {
        footer.innerHTML = `<span id="span-footer">Cookie</span>`;
    }
});