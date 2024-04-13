LANGUAGE_OBJECT["COVER_LANG"] = {};
let NOW_CARTOON_INDEX = 0;

function addCover(coverArea, coverData, index){
	const cover = document.createElement("div");
	cover.className = "cover col";
	cover.setAttribute("onClick", "readCartoon(" + index + ")");
	const coverImage = document.createElement("img");
	coverImage.className = "book-cover lang-src";
	coverImage.src = "/resources/img/cartoon/"+coverData["uid"]+"/" + [NOW_LANG]+"/cover.png";
	LANGUAGE_OBJECT["COVER_LANG"][coverData["uid"]+"-cover"] = {
		"en": "/resources/img/cartoon/"+coverData["uid"]+"/en/cover.png",
		"kr": "/resources/img/cartoon/"+coverData["uid"]+"/kr/cover.png",
		"jp": "/resources/img/cartoon/"+coverData["uid"]+"/jp/cover.png",
		"cn": "/resources/img/cartoon/"+coverData["uid"]+"/cn/cover.png",
		"ru": "/resources/img/cartoon/"+coverData["uid"]+"/ru/cover.png"
	};
	optionElement.setAttribute("data-lang-var", "COVER_LANG");
	optionElement.setAttribute("data-lang", coverData["uid"]+"-cover");
	const coverTitle = document.createElement("div");
	coverTitle.className = "book-title lang";
	coverTitle.innerHTML = coverData["title"][NOW_LANG];
	LANGUAGE_OBJECT["COVER_LANG"][coverData["uid"]] = coverData["title"];
	coverTitle.setAttribute("data-lang-var", "COVER_LANG");
	coverTitle.setAttribute("data-lang", coverData["uid"]);
	const translating = document.createElement("div");
	translating.className = "book-translating lang";
	translating.innerHTML = coverData["translating"][NOW_LANG];
	LANGUAGE_OBJECT["COVER_LANG"][coverData["uid"]+"-translating"] = coverData["translating"];
	translating.setAttribute("data-lang-var", "COVER_LANG");
	translating.setAttribute("data-lang", coverData["uid"]+"-translating");
	
	cover.appendChild(coverImage);
	cover.appendChild(coverTitle);
	cover.appendChild(translating);
	coverArea.appendChild(cover);
}

function readCartoon(cartoonIndex){
	NOW_CARTOON_INDEX = cartoonIndex;
	const book = document.getElementById("book");
	book.removeAttribute("hidden");
	const backButton = document.getElementById("button-back");
	backButton.removeAttribute("hidden");
	const coverArea = document.getElementById("coverArea");
	coverArea.setAttribute("hidden", "true");
	
	const pages = CARTOON_LIST[cartoonIndex]["pages"];
	const pageSelector = document.getElementById("page-selector");
	const title = document.getElementById("title");
	const createdAt = document.getElementById("createdAt");
	const pageInput = document.getElementById("page-input");
	const maxPage = document.getElementById("max-page");
	const pageArea = document.getElementById("pageArea");
	
	const maxPageValue = pages.length;
	pageArea.innerHTML = null;
	pageSelector.innerHTML = null;
	let pageIndex = 0;
	for(pageIndex = maxPageValue-1; pageIndex >= 0; pageIndex --) {
		const optionElement = document.createElement("option");
		optionElement.className = "lang";
		optionElement.value = pageIndex;
		optionElement.innerText = (pageIndex+1) + ". " + pages[pageIndex]["title"][NOW_LANG];
		LANGUAGE_OBJECT["COVER_LANG"][CARTOON_LIST[cartoonIndex]["uid"]+"-page-"+pageIndex] = {
			"en": (pageIndex+1) + ". " + pages[pageIndex]["title"]["en"],
			"kr": (pageIndex+1) + ". " + pages[pageIndex]["title"]["kr"],
			"jp": (pageIndex+1) + ". " + pages[pageIndex]["title"]["jp"],
			"cn": (pageIndex+1) + ". " + pages[pageIndex]["title"]["cn"],
			"ru": (pageIndex+1) + ". " + pages[pageIndex]["title"]["ru"]
		};
		optionElement.setAttribute("data-lang-var", "COVER_LANG");
		optionElement.setAttribute("data-lang", CARTOON_LIST[cartoonIndex]["uid"]+"-page-"+pageIndex);
		pageSelector.appendChild(optionElement);
	}
	pageInput.value = maxPageValue;
	maxPage.innerText = maxPageValue;
	
	const img = document.createElement("img");
	img.className = "cartoon lang-src";
	img.src = "/resources/img/cartoon/" + CARTOON_LIST[cartoonIndex]["uid"] + "/" + NOW_LANG + "/" + pages[maxPageValue - 1]["img"];
	LANGUAGE_OBJECT["COVER_LANG"]["NOW_PAGE"] = {
		"en": "/resources/img/cartoon/" + CARTOON_LIST[cartoonIndex]["uid"] + "/en/" + pages[maxPageValue - 1]["img"],
		"kr": "/resources/img/cartoon/" + CARTOON_LIST[cartoonIndex]["uid"] + "/kr/" + pages[maxPageValue - 1]["img"],
		"jp": "/resources/img/cartoon/" + CARTOON_LIST[cartoonIndex]["uid"] + "/jp/" + pages[maxPageValue - 1]["img"],
		"cn": "/resources/img/cartoon/" + CARTOON_LIST[cartoonIndex]["uid"] + "/cn/" + pages[maxPageValue - 1]["img"],
		"ru": "/resources/img/cartoon/" + CARTOON_LIST[cartoonIndex]["uid"] + "/ru/" + pages[maxPageValue - 1]["img"]
	};
	img.setAttribute("data-lang-var", "COVER_LANG");
	img.setAttribute("data-lang", "NOW_PAGE");
	
	title.innerHTML = pages[maxPageValue - 1]["title"][NOW_LANG];
	createdAt.innerHTML = pages[maxPageValue - 1]["created-at"];
	LANGUAGE_OBJECT["COVER_LANG"]["TITLE"] = pages[maxPageValue - 1]["title"];
	
	const prevPage = document.createElement("div");
	prevPage.className = "page-mover prev-page";
	prevPage.innerHTML = "<i class='fa-solid fa-chevron-left'></i>";
	prevPage.setAttribute("onClick", "goPage(" + (maxPageValue - 2) + ", false)");
	const nextPage = document.createElement("div");
	nextPage.className = "page-mover next-page";
	nextPage.innerHTML = "<i class='fa-solid fa-chevron-right'></i>";
	
	pageArea.appendChild(prevPage);
	pageArea.appendChild(img);
	pageArea.appendChild(nextPage);
}

function backToCartoonList() {
	const book = document.getElementById("book");
	book.setAttribute("hidden", "true");
	const backButton = document.getElementById("button-back");
	backButton.setAttribute("hidden", "true");
	const coverArea = document.getElementById("coverArea");
	coverArea.removeAttribute("hidden");
}

function pageInputEnter() {
    if (window.event.keyCode == 13) {
		const pageInput = document.getElementById("page-input");
        goPage(pageInput.value - 1, false);
    }
}

function pageMove() {
	const pageInput = document.getElementById("page-input");
	goPage(pageInput.value - 1, false);
}

function goPage(page, isSelected) {
	const pageInt = parseInt(page);
	if(pageInt < 0) {
		pageInt = 0;
	}
	if(pageInt > CARTOON_LIST[NOW_CARTOON_INDEX]["pages"].length - 1) {
		pageInt = CARTOON_LIST[NOW_CARTOON_INDEX]["pages"].length - 1;
	}
	if( ! isSelected){
		const pageSelector = document.getElementById("page-selector");
		pageSelector.children[pageSelector.children.length - (pageInt+1)].selected = true;
	}
	
	const pages = CARTOON_LIST[NOW_CARTOON_INDEX]["pages"];
	const pageInput = document.getElementById("page-input");
	pageInput.value = (parseInt(pageInt) + 1);
	const pageArea = document.getElementById("pageArea");
	pageArea.innerHTML = null;
	
	const prevPage = document.createElement("div");
	prevPage.className = "page-mover prev-page";
	prevPage.innerHTML = "<i class='fa-solid fa-chevron-left'></i>";
	if(pageInt > 0) {
		prevPage.setAttribute("onClick", "goPage(" + (pageInt - 1) + ")");
	}
	const nextPage = document.createElement("div");
	nextPage.className = "page-mover next-page";
	nextPage.innerHTML = "<i class='fa-solid fa-chevron-right'></i>";
	if(pageInt < pages.length -1){
		nextPage.setAttribute("onClick", "goPage(" + (pageInt + 1) + ")");
	}
	
	const img = document.createElement("img");
	img.className = "cartoon lang-src";
	img.src = "/resources/img/cartoon/" + CARTOON_LIST[NOW_CARTOON_INDEX]["uid"] + "/" + NOW_LANG + "/" + pages[pageInt]["img"];
	LANGUAGE_OBJECT["COVER_LANG"]["NOW_PAGE"] = {
		"en": "/resources/img/cartoon/" + CARTOON_LIST[NOW_CARTOON_INDEX]["uid"] + "/en/" + pages[pageInt]["img"],
		"kr": "/resources/img/cartoon/" + CARTOON_LIST[NOW_CARTOON_INDEX]["uid"] + "/kr/" + pages[pageInt]["img"],
		"jp": "/resources/img/cartoon/" + CARTOON_LIST[NOW_CARTOON_INDEX]["uid"] + "/jp/" + pages[pageInt]["img"],
		"cn": "/resources/img/cartoon/" + CARTOON_LIST[NOW_CARTOON_INDEX]["uid"] + "/cn/" + pages[pageInt]["img"],
		"ru": "/resources/img/cartoon/" + CARTOON_LIST[NOW_CARTOON_INDEX]["uid"] + "/ru/" + pages[pageInt]["img"]
	};
	img.setAttribute("data-lang-var", "COVER_LANG");
	img.setAttribute("data-lang", "NOW_PAGE");
	
	title.innerHTML = pages[pageInt]["title"][NOW_LANG];
	createdAt.innerHTML = pages[pageInt]["created-at"];
	LANGUAGE_OBJECT["COVER_LANG"]["TITLE"] = pages[pageInt]["title"];
	
	pageArea.appendChild(prevPage);
	pageArea.appendChild(img);
	pageArea.appendChild(nextPage);
}


const coverArea = document.getElementById("coverArea");
if(CARTOON_LIST){
	let index = 0;
	for(index = 0; index < CARTOON_LIST.length; index ++) {
		addCover(coverArea, CARTOON_LIST[index], index);
	}
}