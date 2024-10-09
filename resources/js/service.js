function searchEnter(){
	if (window.event.keyCode == 13) {
		search();
	}
}

function search(){
	const category = document.getElementById("search-category").value;
	const value = document.getElementById("search-input").value.toLowerCase();
	const serviceArea = document.getElementById("serviceArea");
	serviceArea.innerHTML = null;
	
	if(value == null || value.length < 1){
		let index = 0;
		for(index = 0; index < SERVICE_LIST.length; index ++) {
			addService(serviceArea, SERVICE_LIST[index], index);
		}
	} else {
		let index = 0;
		if(category == "name") {
			for(index = 0; index < SERVICE_LIST.length; index ++) {
				if(SERVICE_LIST[index]["name"][NOW_LANG].toLowerCase().includes(value)){
					addService(serviceArea, SERVICE_LIST[index], index);
				}
			}
		} else if(category == "tag"){
			for(index = 0; index < SERVICE_LIST.length; index ++) {
				if(SERVICE_LIST[index]["tag"].includes(value)){
					addService(serviceArea, SERVICE_LIST[index], index);
				}
			}
		}
	}
}

function addService(serviceArea, serviceData, index){
	const row = document.createElement("div");
	row.className = "row service lang-title";
	
	const col3 = document.createElement("div");
	col3.className = "col icon-box";
	const icon = document.createElement("img");
	icon.className = "icon";
	icon.src = serviceData["icon"];
	icon.setAttribute("onClick", "window.location.href='" + serviceData["url"] + "';");
	col3.appendChild(icon);
	row.appendChild(col3);
	
	const col = document.createElement("div");
	col.className = "col description-box";
	
	const title = document.createElement("div");
	title.className = "row lang service-name";
	title.innerHTML = serviceData["name"][NOW_LANG];
	title.setAttribute("onClick", "window.location.href='" + serviceData["url"] + "';");
	LANGUAGE_OBJECT["SERVICE_LANG"][serviceData["name"]["en"]+"-name"] = serviceData["name"];
	title.setAttribute("data-lang-var", "SERVICE_LANG");
	title.setAttribute("data-lang", serviceData["name"]["en"]+"-name");
	col.appendChild(title);
	const description = document.createElement("div");
	description.className = "row lang service-description";
	description.innerHTML = serviceData["description"][NOW_LANG];
	description.setAttribute("onClick", "window.location.href='" + serviceData["url"] + "';");
	LANGUAGE_OBJECT["SERVICE_LANG"][serviceData["name"]["en"]+"-description"] = serviceData["description"];
	description.setAttribute("data-lang-var", "SERVICE_LANG");
	description.setAttribute("data-lang", serviceData["name"]["en"]+"-description");
	col.appendChild(description);
	
	
	row.setAttribute("title", LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"][NOW_LANG] + " " + serviceData["updated-at"] + "\u000d" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"][NOW_LANG] + " " + serviceData["created-at"]);
	
	row.setAttribute("data-lang-var", "SERVICE_LANG");
	row.setAttribute("data-lang-title", serviceData["name"]["en"]+"-title");
	LANGUAGE_OBJECT["SERVICE_LANG"][serviceData["name"]["en"]+"-title"] = {
		"en": LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"]["en"] + " " + serviceData["updated-at"] + "\u000d" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"]["en"] + " " + serviceData["created-at"],
		"kr": LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"]["kr"] + " " + serviceData["updated-at"] + "\u000d" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"]["kr"] + " " + serviceData["created-at"],
		"jp": LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"]["jp"] + " " + serviceData["updated-at"] + "\u000d" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"]["jp"] + " " + serviceData["created-at"],
		"cn": LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"]["cn"] + " " + serviceData["updated-at"] + "\u000d" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"]["cn"] + " " + serviceData["created-at"],
		"ru": LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"]["ru"] + " " + serviceData["updated-at"] + "\u000d" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"]["ru"] + " " + serviceData["created-at"],
	};
	
	const tags = document.createElement("div");
	tags.className = "row align-left";
	for(index = 0; index < serviceData["tag"].length; index ++) {
		const tag = document.createElement("div");
		tag.className = "service-tag";
		tag.innerHTML = serviceData["tag"][index];
		tag.setAttribute("onClick", "setSearchTagValue('"+serviceData["tag"][index]+"')");
		tags.appendChild(tag);
	}
	col.appendChild(tags);
	
	row.appendChild(col);
	serviceArea.appendChild(row);
}

function setSearchTagValue(tag){
	const category = document.getElementById("search-category");
	category.children[1].selected = true;
	document.getElementById("search-input").value = tag;
	search();
}

search();