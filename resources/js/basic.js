window.addEventListener('DOMContentLoaded', event => {
    const navbarShrink = function() {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }
    };
    navbarShrink();
    document.addEventListener('scroll', navbarShrink);
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function(responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
});

function loadHeader() {
	const headerElement = document.querySelector('#header');
	if (headerElement) {
		const headerElement = fetch('/templates/components/header.html');
		headerElement.then((res) => res.text()).then((text) => {
			document.querySelector('#header').innerHTML = text;
			const style = document.createElement("link");
			style.rel = 'stylesheet';
			style.href = '/resources/css/header.css';
			document.head.appendChild(style);
			const script = document.createElement('script');
			script.type = 'module';
			script.src = '/resources/js/header.js';
			document.body.appendChild(script);
		});
	}
}
function loadFooter() {
	const footerElement = document.querySelector('#footer');
	if (footerElement) {
		const footerElement = fetch('/templates/components/footer.html');
		footerElement.then((res) => res.text()).then((text) => {
			document.querySelector('#footer').innerHTML = text;
			const style = document.createElement("link");
			style.rel = 'stylesheet';
			style.href = '/resources/css/footer.css';
			document.head.appendChild(style);
			const script = document.createElement('script');
			script.type = 'module';
			script.src = '/resources/js/footer.js';
			document.body.appendChild(script);
		});
	}
}
loadHeader();
loadFooter();