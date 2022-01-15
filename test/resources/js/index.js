function changeLang(){
	const languageField = document.getElementById("languageField");
	const nowLang = languageField.dataset.lang;
	const langFields = document.getElementsByClassName("languageField");
	Array.prototype.forEach.call(langFields, function(field) {
		if(nowLang == "k") {
			field.dataset.lang = "j";
		} else if(nowLang == "j") {
			field.dataset.lang = "c";
		} else if(nowLang == "c") {
			field.dataset.lang = "r";
		} else if(nowLang == "e") {
			field.dataset.lang = "k";
		} else {
			field.dataset.lang = "e";
		}
	});
	changeLangIcon(nowLang);
	textDataUpdate();
}

function changeLangIcon(nowLang) {
	const langFields = document.getElementsByClassName("languageField");
	Array.prototype.forEach.call(langFields, function(field) {
		if(nowLang == "k") {
			field.style.backgroundImage = "url(resources/img/korea.png)";
		} else if(nowLang == "j") {
			field.style.backgroundImage = "url(resources/img/japan.png)";
		} else if(nowLang == "c") {
			field.style.backgroundImage = "url(resources/img/china.png)";
		} else if(nowLang == "r") {
			field.style.backgroundImage = "url(resources/img/russia.png)";
		} else {
			field.style.backgroundImage = "url(resources/img/united_states_of_america.png)";
		}
	});
}

function textDataUpdate(){
	const languageField = document.getElementById("languageField");
	const nowLang = languageField.dataset.lang;
	const textField = document.getElementsByClassName("text");
	changeLangIcon(nowLang);
	Array.prototype.forEach.call(textField, function(field) {
		field.innerHTML = text[field.dataset.textid][nowLang];
	});
	try{
		document.getElementById("contents").contentWindow.iframeTextDataUpdate();
		const dataTextField = document.getElementsByClassName("datatextid");
		Array.prototype.forEach.call(dataTextField, function(field) {
			if(field.dataset.dataname === "chronologyBadgeDatas") {
				field.innerHTML = chronologyBadgeDatas[field.dataset.datakey][field.datatextid][nowLang];
			}
		});
	} catch(err) {
		console.log(err);
	}
}

function iframeChange(url){
    document.getElementById("contents").src = url;
}

window.onload = function() {
	textDataUpdate();
};