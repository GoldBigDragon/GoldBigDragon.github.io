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