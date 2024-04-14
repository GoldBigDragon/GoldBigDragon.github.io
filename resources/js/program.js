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
	
	const dates = document.createElement("div");
	dates.className = "row";
	col.appendChild(dates);
	
	const environment = document.createElement("div");
	environment.className = "row";
	col.appendChild(environment);
	
	const icons = document.createElement("div");
	icons.className = "row align-left";
	col.appendChild(icons);
	
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