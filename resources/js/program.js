function searchEnter(){
    if (window.event.keyCode == 13) {
		search();
    }
}

function search(){
	const category = document.getElementById("search-category").value;
	const value = document.getElementById("search-input").value;
	const programArea = document.getElementById("programArea");
	programArea.innerHTML = null;
	
	if(value == null || value.length < 1){
		let index = 0;
		for(index = 0; index < PROGRAM_LIST.length; index ++) {
			addProgram(programArea, PROGRAM_LIST[index], index);
		}
	} else {
		let index = 0;
		if(category == "name") {
			for(index = 0; index < PROGRAM_LIST.length; index ++) {
				if(PROGRAM_LIST[index]["name"][NOW_LANG].includes(value)){
					addProgram(programArea, PROGRAM_LIST[index], index);
				}
			}
		} else if(category == "tag"){
			for(index = 0; index < PROGRAM_LIST.length; index ++) {
				if(PROGRAM_LIST[index]["tag"].includes(value)){
					addProgram(programArea, PROGRAM_LIST[index], index);
				}
			}
		} else if(category == "language"){
			for(index = 0; index < PROGRAM_LIST.length; index ++) {
				if(PROGRAM_LIST[index]["language"].includes(value)){
					addProgram(programArea, PROGRAM_LIST[index], index);
				}
			}
		}
	}
}

function addProgram(programArea, programData, index){
	const row = document.createElement("div");
	row.className = "row program";
	
	const col3 = document.createElement("div");
	col3.className = "col icon-box";
	const icon = document.createElement("img");
	icon.className = "icon";
	icon.src = programData["icon"];
	col3.appendChild(icon);
	row.appendChild(col3);
	
	const col = document.createElement("div");
	col.className = "col description-box";
	
	const title = document.createElement("div");
	title.className = "row lang program-name";
	title.innerHTML = programData["name"][NOW_LANG];
	LANGUAGE_OBJECT["PROGRAM_LANG"][programData["name"]["en"]+"-name"] = programData["name"];
	title.setAttribute("data-lang-var", "PROGRAM_LANG");
	title.setAttribute("data-lang", programData["name"]["en"]+"-name");
	col.appendChild(title);
	const description = document.createElement("div");
	description.className = "row lang program-description";
	description.innerHTML = programData["description"][NOW_LANG];
	LANGUAGE_OBJECT["PROGRAM_LANG"][programData["name"]["en"]+"-description"] = programData["description"];
	description.setAttribute("data-lang-var", "PROGRAM_LANG");
	description.setAttribute("data-lang", programData["name"]["en"]+"-description");
	col.appendChild(description);
	
	const dates = document.createElement("div");
	dates.className = "row";
	const updatedAtDesc = document.createElement("div");
	updatedAtDesc.className = "lang";
	updatedAtDesc.innerHTML = LANGUAGE_OBJECT["PROGRAM_LANG"]["updated-at"][NOW_LANG];
	updatedAtDesc.setAttribute("data-lang-var", "PROGRAM_LANG");
	updatedAtDesc.setAttribute("data-lang", "updated-at");
	dates.appendChild(updatedAtDesc);
	const updatedAt = document.createElement("div");
	updatedAt.innerHTML = programData["updated-at"];
	dates.appendChild(updatedAt);
	const createdAtDesc = document.createElement("div");
	createdAtDesc.className = "lang";
	createdAtDesc.innerHTML = LANGUAGE_OBJECT["PROGRAM_LANG"]["created-at"][NOW_LANG];
	createdAtDesc.setAttribute("data-lang-var", "PROGRAM_LANG");
	createdAtDesc.setAttribute("data-lang", "created-at");
	dates.appendChild(createdAtDesc);
	const createdAt = document.createElement("div");
	createdAt.innerHTML = programData["created-at"];
	dates.appendChild(createdAt);
	col.appendChild(dates);
	
	const icons = document.createElement("div");
	icons.className = "row align-left";
	if(programData["download"] != null){
		const downloadButton = document.createElement("a");
		downloadButton.className = "btn lang";
		downloadButton.innerHTML = "<i class='fa-solid fa-cloud-arrow-down'></i> Download";
		downloadButton.href = programData["download"];
		downloadButton.setAttribute("data-lang-var", "PROGRAM_LANG");
		downloadButton.setAttribute("data-lang", "download");
		icons.appendChild(downloadButton);
	}
	if(programData["document"] != null){
		const documentButton = document.createElement("a");
		documentButton.className = "btn lang";
		documentButton.innerHTML = "<i class='fa-solid fa-file-lines'></i> Document";
		documentButton.href = programData["document"];
		documentButton.setAttribute("data-lang-var", "PROGRAM_LANG");
		documentButton.setAttribute("data-lang", "document");
		icons.appendChild(documentButton);
	}
	if(programData["youtube"] != null){
		const youtubeButton = document.createElement("a");
		youtubeButton.className = "btn";
		youtubeButton.innerHTML = "<i class='fa-brands fa-youtube'></i> Youtube";
		youtubeButton.href = programData["youtube"];
		youtubeButton.target = '_blank';
		icons.appendChild(youtubeButton);
	}
	if(programData["video"] != null){
		const videoButton = document.createElement("a");
		videoButton.className = "btn lang";
		videoButton.innerHTML = "<i class='fa-solid fa-video'></i> Video";
		videoButton.href = programData["video"];
		videoButton.setAttribute("data-lang-var", "PROGRAM_LANG");
		videoButton.setAttribute("data-lang", "video");
		icons.appendChild(videoButton);
	}
	if(programData["github"] != null){
		const githubButton = document.createElement("a");
		githubButton.className = "btn";
		githubButton.innerHTML = "<i class='fa-brands fa-github'></i> Github";
		githubButton.href = programData["github"];
		githubButton.target = '_blank';
		icons.appendChild(githubButton);
	}
	col.appendChild(icons);
	
	const tags = document.createElement("div");
	tags.className = "row align-left";
	for(index = 0; index < programData["tag"].length; index ++) {
		const tag = document.createElement("div");
		tag.className = "program-tag";
		tag.innerHTML = programData["tag"][index];
		tag.setAttribute("onClick", "setSearchTagValue('"+programData["tag"][index]+"')");
		tags.appendChild(tag);
	}
	col.appendChild(tags);
	
	row.appendChild(col);
	programArea.appendChild(row);
}

function setSearchTagValue(tag){
	const category = document.getElementById("search-category");
	category.children[1].selected = true;
	document.getElementById("search-input").value = tag;
	search();
}

search();