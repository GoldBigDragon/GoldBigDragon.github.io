LANGUAGE_OBJECT["COVER_LANG"] = {};

function addCover(coverArea, coverData){
	const cover = document.createElement("div");
	cover.className = "cover col";
	cover.setAttribute("onClick", "readCartoon('" + coverData["uid"] + "')");
	const coverImage = document.createElement("img");
	coverImage.className = "book-cover";
	coverImage.src = coverData["cover"];
	const coverTitle = document.createElement("div");
	coverTitle.className = "book-title lang";
	coverTitle.innerHTML = coverData["title"][NOW_LANG];
	LANGUAGE_OBJECT["COVER_LANG"][coverData["uid"]] = coverData["title"];
	coverTitle.setAttribute("data-lang-var", "COVER_LANG");
	coverTitle.setAttribute("data-lang", coverData["uid"]);
	cover.appendChild(coverImage);
	cover.appendChild(coverTitle);
	coverArea.appendChild(cover);
}

function readCartoon(cartoonUid){
	const book = document.getElementById("book");
	book.removeAttribute("hidden");
	const coverArea = document.getElementById("coverArea");
	coverArea.setAttribute("hidden", "true");
	
}

const coverArea = document.getElementById("coverArea");
if(CARTOON_LIST){
	let index = 0;
	for(index = 0; index < CARTOON_LIST.length; index ++) {
		addCover(coverArea, CARTOON_LIST[index]);
	}
}