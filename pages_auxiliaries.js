// HEAD
document.write(`
    <meta charset="UTF-8">
    <meta name="theme-color" content="#2e68c0">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="${
		location.pathname.includes("assignment") ? "../main.css" : "main.css"
	}"/>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100..900&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto+Slab:wght@100..900&display=swap" rel="stylesheet">
`);

// NAV
document.addEventListener("DOMContentLoaded", function () {
	const navbar = document.createElement("nav");
	navbar.id = "topnav";
	navbar.innerHTML = `
	<div id="hamburger">
		<a href="javascript:void(0);" class="icon" onclick="toggleMenu()" style="text-decoration: none; color: inherit;">
			<i class="fa fa-bars"></i>
		</a>
	</div>
	<div id="nav-title">
		<h1>
			<a href="https://andrestc21.github.io/Data_Visualization_Chart_Troopers">CO2 Global Emissions Visual Analysis</a>
		</h1>
	</div>
	<div id="dropdown-menu">
		<a class="links" href="https://andrestc21.github.io/Data_Visualization_Chart_Troopers">Homepage</a>
		<a class="links" href="https://andrestc21.github.io/Data_Visualization_Chart_Troopers/assignment_1/website.html">CO2 emissions initial analysis</a>
		<a class="links" href="https://andrestc21.github.io/Data_Visualization_Chart_Troopers/assignment_2/website.html">CO2 Emissions Flow Analysis</a>
		<a class="links" href="https://andrestc21.github.io/Data_Visualization_Chart_Troopers/assignment_3/website.html">CO2 Emissions Topological Analysis</a>
		<a class="links" href="https://andrestc21.github.io/Data_Visualization_Chart_Troopers/assignment_4/website.html">U.S.A. Temperature Analysis</a>
	</div>`;

	document.body.insertBefore(navbar, document.body.firstChild);
});

// FOOTER
document.addEventListener("DOMContentLoaded", function () {
	const footer = document.getElementById("footer");
	if (footer) {
		footer.innerHTML = `
            <div id="footer-container">
                <div id="footer-up">
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
				<div id="footer-bottom">
					<div style="border-top: 1px solid white; margin: 16px 0;"></div>
					<div style="text-align: center">
						<a href="https://andrestc21.github.io/Data_Visualization_Chart_Troopers/sources.html" style="color: whitesmoke;">
							Data sources
						</a>
					</div>
				</div>
            </div>
        `;
	}
});

// NAVBAR Function
function toggleMenu() {
	var x = document.getElementById("dropdown-menu");
	if (x.style.display === "block") {
		x.style.display = "none";
	} else {
		x.style.display = "block";
	}
}
