window.onload = function() {
	parent.document.getElementById("languageField").onload = function(){
		const languageField = window.parent.document.getElementById("languageField");
		const nowLang = languageField.dataset.lang;
		const textField = document.getElementsByClassName("text");
		Array.prototype.forEach.call(textField, function(field) {
			field.innerHTML = text[field.dataset.textid][nowLang];
		});
	};
};