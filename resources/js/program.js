/**
 * 프로그램 검색 및 표시
 */

/**
 * 검색 수행
 */
function search(event){
	if(event) {
		event.preventDefault();
	}

	const category = document.getElementById("search-category").value;
	const value = document.getElementById("search-input").value.toLowerCase();
	const programArea = document.getElementById("programArea");
	programArea.innerHTML = null;

	// 성능 최적화: DocumentFragment 사용
	const tempArea = document.createElement('div');

	if(value == null || value.length < 1){
		// 전체 프로그램 표시
		for(let index = 0; index < PROGRAM_LIST.length; index++) {
			addProgram(tempArea, PROGRAM_LIST[index], index);
		}
	} else {
		// 검색 수행
		if(category === "name") {
			for(let index = 0; index < PROGRAM_LIST.length; index++) {
				if(PROGRAM_LIST[index]["name"][NOW_LANG].toLowerCase().includes(value)){
					addProgram(tempArea, PROGRAM_LIST[index], index);
				}
			}
		} else if(category === "tag"){
			for(let index = 0; index < PROGRAM_LIST.length; index++) {
				if(PROGRAM_LIST[index]["tag"].some(tag => tag.toLowerCase().includes(value))){
					addProgram(tempArea, PROGRAM_LIST[index], index);
				}
			}
		} else if(category === "language"){
			for(let index = 0; index < PROGRAM_LIST.length; index++) {
				if(PROGRAM_LIST[index]["language"].some(lang => lang.toLowerCase().includes(value))){
					addProgram(tempArea, PROGRAM_LIST[index], index);
				}
			}
		}
	}

	programArea.appendChild(tempArea);
}

/**
 * 프로그램 카드 추가
 * 성능 최적화: 이미지 lazy loading
 * 접근성: ARIA 레이블, 키보드 네비게이션
 */
function addProgram(programArea, programData, index){
	const row = document.createElement("div");
	row.className = "row program lang-title";

	// 접근성: role 및 tabindex 추가
	row.setAttribute("role", "article");
	row.setAttribute("tabindex", "0");
	row.setAttribute("aria-label", `Program: ${programData["name"]["en"]}`);

	// 툴팁 정보
	const tooltipText = LANGUAGE_OBJECT["PROGRAM_LANG"]["updated-at"][NOW_LANG] + " " + programData["updated-at"] + "\n" + LANGUAGE_OBJECT["PROGRAM_LANG"]["created-at"][NOW_LANG] + " " + programData["created-at"];
	row.setAttribute("title", tooltipText);

	row.setAttribute("data-lang-var", "PROGRAM_LANG");
	row.setAttribute("data-lang-title", programData["name"]["en"]+"-title");
	LANGUAGE_OBJECT["PROGRAM_LANG"][programData["name"]["en"]+"-title"] = {
		"en": LANGUAGE_OBJECT["PROGRAM_LANG"]["updated-at"]["en"] + " " + programData["updated-at"] + "\n" + LANGUAGE_OBJECT["PROGRAM_LANG"]["created-at"]["en"] + " " + programData["created-at"],
		"kr": LANGUAGE_OBJECT["PROGRAM_LANG"]["updated-at"]["kr"] + " " + programData["updated-at"] + "\n" + LANGUAGE_OBJECT["PROGRAM_LANG"]["created-at"]["kr"] + " " + programData["created-at"],
		"jp": LANGUAGE_OBJECT["PROGRAM_LANG"]["updated-at"]["jp"] + " " + programData["updated-at"] + "\n" + LANGUAGE_OBJECT["PROGRAM_LANG"]["created-at"]["jp"] + " " + programData["created-at"],
		"cn": LANGUAGE_OBJECT["PROGRAM_LANG"]["updated-at"]["cn"] + " " + programData["updated-at"] + "\n" + LANGUAGE_OBJECT["PROGRAM_LANG"]["created-at"]["cn"] + " " + programData["created-at"],
		"ru": LANGUAGE_OBJECT["PROGRAM_LANG"]["updated-at"]["ru"] + " " + programData["updated-at"] + "\n" + LANGUAGE_OBJECT["PROGRAM_LANG"]["created-at"]["ru"] + " " + programData["created-at"],
	};

	// 아이콘 섹션
	const col3 = document.createElement("div");
	col3.className = "col icon-box";

	const icon = document.createElement("img");
	icon.className = "icon";
	icon.src = programData["icon"];
	// 성능 최적화: lazy loading
	icon.loading = "lazy";
	// 접근성: alt 속성
	icon.alt = programData["name"]["en"] + " icon";

	col3.appendChild(icon);
	row.appendChild(col3);

	// 설명 섹션
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

	// 버튼 섹션
	const icons = document.createElement("div");
	icons.className = "row align-left";
	icons.setAttribute("role", "list");
	icons.setAttribute("aria-label", "Program links");

	// Download 버튼
	if(programData["download"] != null){
		const downloadButton = document.createElement("a");
		downloadButton.className = "btn lang download";
		downloadButton.innerHTML = "<i class='fa-solid fa-cloud-arrow-down' aria-hidden='true'></i> Download";
		downloadButton.href = programData["download"];
		downloadButton.target = "_blank";
		downloadButton.setAttribute("rel", "noopener noreferrer");
		downloadButton.setAttribute("aria-label", "Download " + programData["name"]["en"]);
		downloadButton.setAttribute("data-lang-var", "PROGRAM_LANG");
		downloadButton.setAttribute("data-lang", "download");
		icons.appendChild(downloadButton);
	}

	// Document 버튼
	if(programData["document"] != null){
		const documentButton = document.createElement("a");
		documentButton.className = "btn lang document";
		documentButton.innerHTML = "<i class='fa-solid fa-file-lines' aria-hidden='true'></i> Document";
		documentButton.href = programData["document"];
		documentButton.target = "_blank";
		documentButton.setAttribute("rel", "noopener noreferrer");
		documentButton.setAttribute("aria-label", "View documentation for " + programData["name"]["en"]);
		documentButton.setAttribute("data-lang-var", "PROGRAM_LANG");
		documentButton.setAttribute("data-lang", "document");
		icons.appendChild(documentButton);
	}

	// GitHub 버튼
	if(programData["github"] != null){
		const githubButton = document.createElement("a");
		githubButton.className = "btn github";
		githubButton.innerHTML = "<i class='fa-brands fa-github' aria-hidden='true'></i> Github";
		githubButton.href = programData["github"];
		githubButton.target = "_blank";
		githubButton.setAttribute("rel", "noopener noreferrer");
		githubButton.setAttribute("aria-label", "View " + programData["name"]["en"] + " on GitHub");
		icons.appendChild(githubButton);
	}

	// Video 버튼
	if(programData["video"] != null){
		const videoButton = document.createElement("a");
		videoButton.className = "btn lang video";
		videoButton.innerHTML = "<i class='fa-solid fa-video' aria-hidden='true'></i> Video";
		videoButton.href = programData["video"];
		videoButton.target = "_blank";
		videoButton.setAttribute("rel", "noopener noreferrer");
		videoButton.setAttribute("aria-label", "Watch video about " + programData["name"]["en"]);
		videoButton.setAttribute("data-lang-var", "PROGRAM_LANG");
		videoButton.setAttribute("data-lang", "video");
		icons.appendChild(videoButton);
	}

	// YouTube 버튼
	if(programData["youtube"] != null){
		const youtubeButton = document.createElement("a");
		youtubeButton.className = "btn youtube";
		youtubeButton.innerHTML = "<i class='fa-brands fa-youtube' aria-hidden='true'></i> Youtube";
		youtubeButton.href = programData["youtube"];
		youtubeButton.target = "_blank";
		youtubeButton.setAttribute("rel", "noopener noreferrer");
		youtubeButton.setAttribute("aria-label", "Watch " + programData["name"]["en"] + " on YouTube");
		icons.appendChild(youtubeButton);
	}

	col.appendChild(icons);

	// 태그 섹션
	const tags = document.createElement("div");
	tags.className = "row align-left";
	tags.setAttribute("role", "list");
	tags.setAttribute("aria-label", "Program tags");

	for(let tagIndex = 0; tagIndex < programData["tag"].length; tagIndex++) {
		const tag = document.createElement("div");
		tag.className = "program-tag";
		tag.innerHTML = programData["tag"][tagIndex];

		// 접근성: role 및 tabindex 추가
		tag.setAttribute("role", "button");
		tag.setAttribute("tabindex", "0");
		tag.setAttribute("aria-label", `Search by tag: ${programData["tag"][tagIndex]}`);

		// XSS 방지: onClick 속성 대신 addEventListener 사용
		const handleTagClick = function() {
			setSearchTagValue(programData["tag"][tagIndex]);
		};
		tag.addEventListener('click', handleTagClick);

		// 접근성: 키보드 네비게이션
		tag.addEventListener('keydown', function(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleTagClick();
			}
		});

		tags.appendChild(tag);
	}
	col.appendChild(tags);

	row.appendChild(col);
	programArea.appendChild(row);
}

/**
 * 태그로 검색
 */
function setSearchTagValue(tag){
	const category = document.getElementById("search-category");
	category.children[1].selected = true;
	document.getElementById("search-input").value = tag;
	search();
}

/**
 * 초기화 및 이벤트 리스너 설정
 */
document.addEventListener('DOMContentLoaded', function() {
	// 검색 폼 이벤트 리스너
	const searchForm = document.querySelector('form[role="search"]');
	if(searchForm) {
		searchForm.addEventListener('submit', search);
	}

	// 검색 버튼 이벤트 리스너 (폼 submit 외 직접 클릭)
	const searchButton = document.getElementById("search-button");
	if(searchButton) {
		searchButton.addEventListener('click', search);
	}

	// 검색 입력 필드 엔터 키 이벤트 리스너
	const searchInput = document.getElementById("search-input");
	if(searchInput) {
		searchInput.addEventListener('keydown', function(e) {
			if (e.key === 'Enter') {
				e.preventDefault();
				search();
			}
		});
	}

	// 초기 검색 (전체 프로그램 표시)
	search();
});
