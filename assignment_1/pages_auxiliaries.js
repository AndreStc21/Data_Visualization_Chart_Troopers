// HEAD
document.write(`
    <meta charset="UTF-8">
    <meta name="theme-color" content="#2e68c0">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="${location.pathname.includes('assignment_1') ? '../main.css' : 'main.css'}"/>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100..900&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto+Slab:wght@100..900&display=swap" rel="stylesheet">
    <title>Chart Troopers' Website</title>
`);

// NAV
document.addEventListener("DOMContentLoaded", function() {
    const navbar = document.createElement("nav");
    navbar.id = "navbar";
	if (false) { // location.pathname.includes('assignment_1')) {
		navbar.innerHTML = `
		<div id="hamburger">
			<a href="javascript:void(0);" class="icon" onclick="toggleMenu()" style="text-decoration: none; color: inherit;">
				<i class="fa fa-bars"></i>
			</a>
		</div>
		<div id="title">
			<h1 style="cursor: pointer;">
			<a href="https://andrestc21.github.io/Data_Visualization_Chart_Troopers/" style="text-decoration: none; color: inherit;">Data Visualization Website</a>
			</h1>
		</div>
		<div id="dropdown-menu" class="dropdown-menu">
			<a href="#plot1">Plot 1</a>
			<a href="#plot2">Plot 2</a>
			<a href="#plot3">Plot 3</a>
			<a href="#plot4">Plot 4</a>
			<a href="#plot5">Plot 5</a>
			<a href="#plot6">Plot 6</a>
		</div>`;
		navbar.style.display = "flex";
	}
    else {
		navbar.innerHTML = `
							<h1 id="title" style="cursor: pointer;">
							<a href="https://andrestc21.github.io/Data_Visualization_Chart_Troopers/" style="text-decoration: none; color: inherit;">
								Data Visualization Website
							</a>
							</h1>`;
	}
    
    document.body.insertBefore(navbar, document.body.firstChild);
});

// FOOTER
document.addEventListener("DOMContentLoaded", function() {
    const footer = document.getElementById("footer");
    if (footer) {
        footer.innerHTML = `
            <div id="footer-container">
                <div id="footer-left">
                    <span>Chart Troopers:</span>
                    <span>Andrea Stucchi - Marco Cosulich - Riccardo Cicala</span>
                </div>
				<div id=footer-center>
					<span>Universita' di Genova</span>
				</div>
                <div id="footer-right">
                    <span>Follow us on:</span>
                    <div id="footer-list">
                        <span><i class="fab fa-twitter"></i> Twitter</span>
                        <span><i class="fab fa-instagram"></i> Instagram</span>
                        <span><i class="fab fa-linkedin"></i> LinkedIn</span>
                    </div>
                </div>
            </div>
        `;
    }
});

// NAVBAR Function
function toggleMenu() {
	var x = document.getElementById("dropdown-menu");
	if (x.style.display === "flex") { // w3c dice block entrambi
		x.style.display = "none";
  	} else {
    	x.style.display = "flex";
  	}
}