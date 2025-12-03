/**
 * 서비스 검색 및 표시
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
	const serviceArea = document.getElementById("serviceArea");
	serviceArea.innerHTML = null;

	// 성능 최적화: DocumentFragment 사용
	const fragment = document.createDocumentFragment();
	const tempArea = document.createElement('div');

	if(value == null || value.length < 1){
		// 전체 서비스 표시
		for(let index = 0; index < SERVICE_LIST.length; index++) {
			addService(tempArea, SERVICE_LIST[index], index);
		}
	} else {
		// 검색 수행
		if(category === "name") {
			for(let index = 0; index < SERVICE_LIST.length; index++) {
				if(SERVICE_LIST[index]["name"][NOW_LANG].toLowerCase().includes(value)){
					addService(tempArea, SERVICE_LIST[index], index);
				}
			}
		} else if(category === "tag"){
			for(let index = 0; index < SERVICE_LIST.length; index++) {
				if(SERVICE_LIST[index]["tag"].some(tag => tag.toLowerCase().includes(value))){
					addService(tempArea, SERVICE_LIST[index], index);
				}
			}
		}
	}

	serviceArea.appendChild(tempArea);
}

/**
 * 서비스 카드 추가
 * 성능 최적화: 이미지 lazy loading
 * 접근성: ARIA 레이블, 키보드 네비게이션
 */
function addService(serviceArea, serviceData, index){
	const row = document.createElement("div");
	row.className = "row service lang-title";

	// 접근성: role 및 tabindex 추가
	row.setAttribute("role", "article");
	row.setAttribute("tabindex", "0");
	row.setAttribute("aria-label", `Service: ${serviceData["name"]["en"]}`);

	// 툴팁 정보
	const tooltipText = LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"][NOW_LANG] + " " + serviceData["updated-at"] + "\n" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"][NOW_LANG] + " " + serviceData["created-at"];
	row.setAttribute("title", tooltipText);

	row.setAttribute("data-lang-var", "SERVICE_LANG");
	row.setAttribute("data-lang-title", serviceData["name"]["en"]+"-title");
	LANGUAGE_OBJECT["SERVICE_LANG"][serviceData["name"]["en"]+"-title"] = {
		"en": LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"]["en"] + " " + serviceData["updated-at"] + "\n" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"]["en"] + " " + serviceData["created-at"],
		"kr": LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"]["kr"] + " " + serviceData["updated-at"] + "\n" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"]["kr"] + " " + serviceData["created-at"],
		"jp": LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"]["jp"] + " " + serviceData["updated-at"] + "\n" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"]["jp"] + " " + serviceData["created-at"],
		"cn": LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"]["cn"] + " " + serviceData["updated-at"] + "\n" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"]["cn"] + " " + serviceData["created-at"],
		"ru": LANGUAGE_OBJECT["SERVICE_LANG"]["updated-at"]["ru"] + " " + serviceData["updated-at"] + "\n" + LANGUAGE_OBJECT["SERVICE_LANG"]["created-at"]["ru"] + " " + serviceData["created-at"],
	};

	// 아이콘 섹션
	const col3 = document.createElement("div");
	col3.className = "col icon-box";

	const icon = document.createElement("img");
	icon.className = "icon";
	icon.src = serviceData["icon"];
	// 성능 최적화: lazy loading
	icon.loading = "lazy";
	// 접근성: alt 속성
	icon.alt = serviceData["name"]["en"] + " icon";

	// XSS 방지: onClick 속성 대신 addEventListener 사용
	const handleIconClick = function() {
		window.location.href = serviceData["url"];
	};
	icon.addEventListener('click', handleIconClick);

	// 접근성: 키보드 네비게이션
	icon.addEventListener('keydown', function(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleIconClick();
		}
	});

	col3.appendChild(icon);
	row.appendChild(col3);

	// 설명 섹션
	const col = document.createElement("div");
	col.className = "col description-box";

	const title = document.createElement("a");
	title.className = "row lang service-name";
	title.innerHTML = serviceData["name"][NOW_LANG];
	title.setAttribute("href", serviceData["url"]);
	title.setAttribute("target", "_blank");
	title.setAttribute("rel", "noopener noreferrer");
	title.setAttribute("aria-label", `Open ${serviceData["name"]["en"]}`);
	LANGUAGE_OBJECT["SERVICE_LANG"][serviceData["name"]["en"]+"-name"] = serviceData["name"];
	title.setAttribute("data-lang-var", "SERVICE_LANG");
	title.setAttribute("data-lang", serviceData["name"]["en"]+"-name");
	col.appendChild(title);

	const description = document.createElement("div");
	description.className = "row lang service-description";
	description.innerHTML = serviceData["description"][NOW_LANG];

	// XSS 방지: onClick 속성 대신 addEventListener 사용
	const handleDescriptionClick = function() {
		window.location.href = serviceData["url"];
	};
	description.addEventListener('click', handleDescriptionClick);

	LANGUAGE_OBJECT["SERVICE_LANG"][serviceData["name"]["en"]+"-description"] = serviceData["description"];
	description.setAttribute("data-lang-var", "SERVICE_LANG");
	description.setAttribute("data-lang", serviceData["name"]["en"]+"-description");
	col.appendChild(description);

	// 태그 섹션
	const tags = document.createElement("div");
	tags.className = "row align-left";
	tags.setAttribute("role", "list");
	tags.setAttribute("aria-label", "Service tags");

	for(let tagIndex = 0; tagIndex < serviceData["tag"].length; tagIndex++) {
		const tag = document.createElement("div");
		tag.className = "service-tag";
		tag.innerHTML = serviceData["tag"][tagIndex];

		// 접근성: role 및 tabindex 추가
		tag.setAttribute("role", "button");
		tag.setAttribute("tabindex", "0");
		tag.setAttribute("aria-label", `Search by tag: ${serviceData["tag"][tagIndex]}`);

		// XSS 방지: onClick 속성 대신 addEventListener 사용
		const handleTagClick = function() {
			setSearchTagValue(serviceData["tag"][tagIndex]);
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

	// 접근성: 전체 카드 키보드 네비게이션
	row.addEventListener('keydown', function(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			window.location.href = serviceData["url"];
		}
	});

	serviceArea.appendChild(row);
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

	// 초기 검색 (전체 서비스 표시)
	search();
});
