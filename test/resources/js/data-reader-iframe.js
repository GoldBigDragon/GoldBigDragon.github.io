window.onload = function() {
	iframeTextDataUpdate();
};

function iframeTextDataUpdate(){
	try {	  
		const languageField = window.parent.document.getElementById("languageField");
		const nowLang = languageField.dataset.lang;
		const textField = document.getElementsByClassName("text");
		Array.prototype.forEach.call(textField, function(field) {
			field.innerHTML = text[field.dataset.textid][nowLang];
		});
	} catch (error) {
		const nowLang = "e";
		const textField = document.getElementsByClassName("text");
		Array.prototype.forEach.call(textField, function(field) {
			field.innerHTML = text[field.dataset.textid][nowLang];
		});
	}
	const dataTextField = document.getElementsByClassName("datatextid");
	Array.prototype.forEach.call(dataTextField, function(field) {
		if(field.dataset.dataname === "chronologyBadgeDatas") {
			field.innerHTML = chronologyBadgeDatas[field.dataset.datakey][field.datatextid][nowLang];
		}
	});
}