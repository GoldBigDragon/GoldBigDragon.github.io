function changeLang(){
	const languageField = document.getElementById("languageField");
	const nowLang = languageField.dataset.lang;
	if(nowLang == "k") {
		languageField.dataset.lang = "j";
	} else if(nowLang == "j") {
		languageField.dataset.lang = "c";
	} else if(nowLang == "c") {
		languageField.dataset.lang = "r";
	} else if(nowLang == "e") {
		languageField.dataset.lang = "k";
	} else {
		languageField.dataset.lang = "e";
	}
	changeLangIcon();
	textDataUpdate();
}

function changeLangIcon() {
	const languageField = document.getElementById("languageField");
	const nowLang = languageField.dataset.lang;
	if(nowLang == "k") {
		languageField.style.backgroundImage = "url(resources/img/korea.png)";
	} else if(nowLang == "j") {
		languageField.style.backgroundImage = "url(resources/img/japan.png)";
	} else if(nowLang == "c") {
		languageField.style.backgroundImage = "url(resources/img/china.png)";
	} else if(nowLang == "r") {
		languageField.style.backgroundImage = "url(resources/img/russia.png)";
	} else {
		languageField.style.backgroundImage = "url(resources/img/united_states_of_america.png)";
	}
}

function textDataUpdate(){
	const languageField = document.getElementById("languageField");
	const nowLang = languageField.dataset.lang;
	const textField = document.getElementsByClassName("text");
	changeLangIcon();
	Array.prototype.forEach.call(textField, function(field) {
		field.innerHTML = text[field.dataset.textid][nowLang];
	});
	
	const iframe = document.getElementById("contents");
	const contents = (iframe.contentDocument)? iframe.contentDocument: iframe.contentWindow.document;
	const iframeTextField = contents.getElementsByClassName("text");
	//const iframeTextField = window.frames["contents"].document.getElementsByClassName("text");
	Array.prototype.forEach.call(iframeTextField, function(field) {
		field.innerHTML = contents.text[field.dataset.textid][nowLang];
	});
}

// SELECT 태그 내 OPTION 태그를 생성하는 함수
function optionCreator(target, value, title, isSelect, tooltip) {
	const option = document.createElement("option");
	option.value = value;
	option.innerHTML = "&nbsp;" + title + "&nbsp;";
	if (isSelect) {
		option.selected = "selected";
	}
	if (tooltip != null) {
		option.title = tooltip;
	}
	target.appendChild(option);
}

window.onload = function() {
	document.getElementById('contents').onload = function() {
		textDataUpdate();
	}
};