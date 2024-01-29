const LANGUAGE_OBJECT = {};

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
			const lang = document.createElement('script');
			lang.type = 'application/javascript';
			lang.src = '/resources/lang/header.js';
			document.body.appendChild(lang);
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
			const lang = document.createElement('script');
			lang.type = 'application/javascript';
			lang.src = '/resources/lang/footer.js';
			document.body.appendChild(lang);
			const script = document.createElement('script');
			script.type = 'module';
			script.src = '/resources/js/footer.js';
			document.body.appendChild(script);
		});
	}
}

function setCookie(name, value, exp) {
	const date = new Date();
	date.setTime(date.getTime() + exp * 86400000);
	document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";path=/";
}

function getCookie(name) {
	const value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
	return value ? value[2] : null;
}

function deleteCookie(name) {
	document.cookie = name + "=; expires=Thu, 01 Jan 1999 00:00:01 GMT;";
}

function loadLanguage() {
	let nowLang = getCookie("lang");
	if(nowLang == null) {
		nowLang = "en";
	}
	const textField = document.getElementsByClassName("lang");
	Array.prototype.forEach.call(textField, function(languageElement) {
		languageElement.innerHTML = LANGUAGE_OBJECT[languageElement.dataset.langVar][languageElement.dataset.lang][nowLang];
	});
}

loadHeader();
loadFooter();

loadLanguage();