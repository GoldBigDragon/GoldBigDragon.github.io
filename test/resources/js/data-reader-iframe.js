window.onload = function() {
	iframeTextDataUpdate();
};

function iframeTextDataUpdate(){
	let nowLang = 'e';
	try {	  
		const languageField = window.parent.document.getElementById("languageField");
		nowLang = languageField.dataset.lang;
	} catch (error) {
		console.log(error);
	}
	const textField = document.getElementsByClassName("text");
	Array.prototype.forEach.call(textField, function(field) {
		field.innerHTML = text[field.dataset.textid][nowLang];
	});
	iframeDataTextUpdate();
}

function iframeDataTextUpdate() {
	let nowLang = 'e';
	try {	  
		const languageField = window.parent.document.getElementById("languageField");
		nowLang = languageField.dataset.lang;
	} catch (error) {
		console.log(error);
	}
	const dataTextField = document.getElementsByClassName("datatextid");
	Array.prototype.forEach.call(dataTextField, function(field) {
		if(field.dataset.dataname === "chronologyBadgeDatas") {
			console.log(chronologyBadgeDatas[field.dataset.datakey][field.dataset.datatextid]);
			field.innerHTML = chronologyBadgeDatas[field.dataset.datakey][field.dataset.datatextid][nowLang];
		}
	});
}