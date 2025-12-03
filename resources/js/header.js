/**
 * Header 스크립트
 * 언어 선택 및 변경 기능
 * Navbar 초기화는 navbar.js에서 처리
 */

function checkLanguage(){
	let nowLang = getCookie("lang");
	const languageElement = document.getElementById("language");
	if(nowLang == "kr") {
		languageElement.src= "/resources/img/header/lang/kr.png";
	} else if(nowLang == "jp") {
		languageElement.src= "/resources/img/header/lang/jp.png";
	} else if(nowLang == "cn") {
		languageElement.src= "/resources/img/header/lang/cn.png";
	} else if(nowLang == "ru") {
		languageElement.src= "/resources/img/header/lang/ru.png";
	} else {
		setCookie("lang", "en", 31);
		languageElement.src= "/resources/img/header/lang/en.png";
	}
}

function changeLanguage() {
	NOW_LANG = getCookie("lang");
	const languageElement = document.getElementById("language");
	if(NOW_LANG == "kr") {
		setCookie("lang", "jp", 31);
		languageElement.src= "/resources/img/header/lang/jp.png";
	} else if(NOW_LANG == "jp") {
		setCookie("lang", "cn", 31);
		languageElement.src= "/resources/img/header/lang/cn.png";
	} else if(NOW_LANG == "cn") {
		setCookie("lang", "ru", 31);
		languageElement.src= "/resources/img/header/lang/ru.png";
	} else if(NOW_LANG == "ru") {
		setCookie("lang", "en", 31);
		languageElement.src= "/resources/img/header/lang/en.png";
	} else {
		setCookie("lang", "kr", 31);
		languageElement.src= "/resources/img/header/lang/kr.png";
	}
	loadLanguage();
}

setTimeout(checkLanguage, 0);
setTimeout(loadLanguage, 0);