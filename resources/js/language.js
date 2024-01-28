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

loadLanguage();