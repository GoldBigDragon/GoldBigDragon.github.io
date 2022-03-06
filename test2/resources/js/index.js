/**
 * Created : ‎2022‎.02.16 20:47:36
 * Author : GoldBigDragon (김태룡)
 * Contact : dnwndugod642@naver.com
 * Github : http://goldbigdragon.github.io
 * 
 * Purpose : main.js에서 사용되는 스크립트
 **/
 
let isCategoryOpen = false;
let nowCategory = "homeCategory";
let isSubmenuHold = false;
let nowLang = "E";

const CATEGORY_NAME = {"homeCategory":"Home", "dashboardCategory":"Dashboard", "caseCategory":"Case", "userCategory":"User", "groupCategory":"Group", "reportCategory":"Report", "optionCategory":"Option"};
const SUB_MENU = {
		"homeCategory":
		[
			{"title":{"E":"Home", "K":"홈", "J":"", "C":"", "R":""},
			"link":"./submenu/home.html"},
			{"title":{"E":"Notice", "K":"공지사항", "J":"", "C":"", "R":""},
			"link":"./submenu/home.html"},
		], "dashboardCategory":
		[
			{"title":{"E":"Dashboard", "K":"대시보드", "J":"", "C":"", "R":""},
			"link":"./submenu/dashboard.html"},
		], "caseCategory":
		[
			{"title":{"E":"Case", "K":"케이스", "J":"", "C":"", "R":""},
			"link":"./submenu/case.html"},
		], "userCategory":
		[
			{"title":{"E":"User List", "K":"사용자 목록", "J":"", "C":"", "R":""},
			"link":"./submenu/userList.html"}
		], "groupCategory":
		[
			{"title":{"E":"Group", "K":"그룹", "J":"", "C":"", "R":""},
			"link":"./submenu/group.html"}
		], "reportCategory":
		[
			{"title":{"E":"Report", "K":"보고서", "J":"", "C":"", "R":""},
			"link":"./submenu/report.html"}
		], "optionCategory":
		[
			{"title":{"E":"Option", "K":"설정", "J":"", "C":"", "R":""},
			"link":"./submenu/option.html"}
		]
	};

function changeLanguage(e){
	if(nowLang === "K"){
		nowLang = "J";
	} else if(nowLang === "J"){
		nowLang = "C";
	} else if(nowLang === "C"){
		nowLang = "R";
	} else if(nowLang === "E"){
		nowLang = "K";
	} else {
		nowLang = "E";
	}
	e.target.className = "categoryIcon lang"+nowLang;
	subCategoryUpdate();
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
	} catch(err) {
		console.log(err);
	}
}

function clickCategory(e){
	const targetId = e.target.id;
	const subMenuPane = document.getElementById("subMenuPane");
	const subMenuSlot = document.getElementById("subMenuSlot");
	const bigIcon = document.getElementById("bigIcon");
	const categoryName = document.getElementById("categoryName");
	
	if(nowCategory == targetId && isCategoryOpen) {
		subMenuPane.style.width = "0rem";
		subMenuPane.style.padding = "0rem";
		isCategoryOpen = false;
		subMenuSlot.style.display = "none";
	} else {
		if(nowCategory != null){
			const prevTargetIcon = document.getElementById(nowCategory);
			prevTargetIcon.className="categoryIcon " + nowCategory;
		}
		subMenuPane.style.width = "12rem";
		subMenuPane.style.padding = "1rem";
		isCategoryOpen = true;
		subMenuSlot.style.display = null;
	}
	nowCategory = targetId;
	bigIcon.className="bigIcon " + nowCategory+"Selected";
	categoryName.innerText=CATEGORY_NAME[nowCategory];
	const targetIcon = document.getElementById(nowCategory);
	targetIcon.className="categoryIcon " + nowCategory +"Selected";
	subCategoryUpdate();
}

function subCategoryUpdate(){
	const subCategory = document.getElementById("subCategory");
	subCategory.innerHTML = "";
	SUB_MENU[nowCategory].forEach(SUB_MENU_ELEMENT =>{
		const newLi = document.createElement("li");
		newLi.innerHTML = SUB_MENU_ELEMENT["title"][nowLang];
		newLi.setAttribute("onclick", "openPage(\""+SUB_MENU_ELEMENT["link"]+"\")");
		subCategory.appendChild(newLi);
	});
}

function closeSubMenu(){
	if(!isSubmenuHold) {
		const subMenuPane = document.getElementById("subMenuPane");
		subMenuPane.style.width = "0rem";
		subMenuPane.style.padding = "0rem";
		isCategoryOpen = false;
		subMenuSlot.style.display = "none";
	}
}

function holdSubMenu(e){
	const pin = e.target;
	if(isSubmenuHold) {
		pin.className = "smallIcon pin";
	} else {
		pin.className = "smallIcon pin" +"Selected";
	}
		
	isSubmenuHold = !isSubmenuHold;
}

function openPage(url){
	console.log(url);
    const iframe = document.getElementById("page");
	iframe.src = url;
}

window.addEventListener('message', function(e) {
	if(e.data.command === "closeSubMenu"){
		closeSubMenu();
	} else if(e.data.command === "openUserInfo"){
		openPage("./submenu/userInfo.html?userId=" + e.data.userId);
	} else if(e.data.command === "testCommand"){
		document.getElementById('page').contentWindow.postMessage({"command":"hideTitle"}, '*');
	}
});
