LANGUAGE_OBJECT["BADGE_LANG"] = {};

// 접근성: 모달 포커스 관리
let lastFocusedElement = null;

/**
 * 배지 추가 함수
 * 성능 최적화: 이미지 lazy loading 적용
 * 접근성: role, tabindex, aria-label 추가
 */
function addBadge(targetArea, category, index, badgeData){
	const badge = document.createElement("div");
	badge.className = "badge";

	// 접근성: role 및 tabindex 추가
	badge.setAttribute("role", "button");
	badge.setAttribute("tabindex", "0");
	badge.setAttribute("aria-label", `View details for ${badgeData["logo-title"]["en"]}`);

	// XSS 방지: onClick 속성 대신 addEventListener 사용
	const handleBadgeClick = function() {
		openModal(category, index);
	};

	badge.addEventListener('click', handleBadgeClick);

	// 접근성: 키보드 네비게이션 (Enter/Space)
	badge.addEventListener('keydown', function(e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleBadgeClick();
		}
	});

	const badgeLogo = document.createElement("img");
	badgeLogo.className = "badge-logo";
	badgeLogo.src = badgeData["logo"];
	// 성능 최적화: lazy loading 적용
	badgeLogo.loading = "lazy";
	// 접근성: alt 속성 추가
	badgeLogo.alt = badgeData["logo-title"]["en"] + " logo";

	const badgeTitle = document.createElement("div");
	badgeTitle.className = "badge-name lang";
	// XSS 방지: innerHTML 대신 textContent 사용
	badgeTitle.textContent = badgeData["logo-title"][NOW_LANG];
	LANGUAGE_OBJECT["BADGE_LANG"][category + "-" + index] = badgeData["logo-title"];
	badgeTitle.setAttribute("data-lang-var", "BADGE_LANG");
	badgeTitle.setAttribute("data-lang", category + "-" + index);
	badge.appendChild(badgeLogo);
	badge.appendChild(badgeTitle);
	targetArea.appendChild(badge);
}

/**
 * 모달 행 생성 헬퍼 함수
 * 성능 최적화: 중복 코드 제거
 */
function createModalRow(keyText, value, isLink = false, isImage = false) {
	const rowDiv = document.createElement("div");
	rowDiv.className = "row modal-panel";

	if (isImage) {
		const img = document.createElement("img");
		img.src = value;
		img.style.maxWidth = isImage.maxWidth || "20rem";
		img.style.maxHeight = isImage.maxHeight || "25rem";
		img.loading = "lazy"; // 성능 최적화
		img.alt = isImage.alt || "Badge proof image"; // 접근성
		rowDiv.style.marginBottom = "1rem";
		rowDiv.appendChild(img);
		return rowDiv;
	}

	const keyDiv = document.createElement("div");
	keyDiv.className = "col-3 key";
	keyDiv.textContent = keyText;

	const valueDiv = document.createElement(isLink ? "a" : "div");
	valueDiv.className = "col value";
	valueDiv.textContent = value;

	if (isLink) {
		valueDiv.href = value;
		valueDiv.target = "_blank";
		valueDiv.setAttribute("rel", "noopener noreferrer"); // 보안
		valueDiv.setAttribute("aria-label", `Visit ${value}`); // 접근성
	}

	rowDiv.appendChild(keyDiv);
	rowDiv.appendChild(valueDiv);
	return rowDiv;
}

function openModal(category, index){
	// 접근성: 모달 열기 전 현재 포커스 요소 저장
	lastFocusedElement = document.activeElement;

	let badgeData = null;
	const modalTitle = document.getElementById("badgeModalTitle");
	const modalBody = document.getElementById("badgeModalBody");
	modalTitle.innerHTML = "";
	modalBody.innerHTML = "";

	// 성능 최적화: DocumentFragment 사용
	const fragment = document.createDocumentFragment();
	if(category == "career"){
		badgeData = DATA_CAREER[index];

		// 회사 로고
		fragment.appendChild(createModalRow(null, badgeData["logo"], false, {
			maxWidth: "10rem",
			maxHeight: "10rem",
			alt: badgeData["company"] + " logo"
		}));

		// 회사 정보
		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["company-name"][NOW_LANG],
			badgeData["company"]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["company-site"][NOW_LANG],
			badgeData["company-link"],
			true
		));

		const employmentPeriod = badgeData["end-date"].constructor == Object
			? `${badgeData["start-date"]} ~ ${badgeData["end-date"][NOW_LANG]}`
			: `${badgeData["start-date"]} ~ ${badgeData["end-date"]}`;

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["company-employment-period"][NOW_LANG],
			employmentPeriod
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["company-department"][NOW_LANG],
			badgeData["department"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["company-team"][NOW_LANG],
			badgeData["team"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["company-position"][NOW_LANG],
			badgeData["position"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["company-task"][NOW_LANG],
			badgeData["task"][NOW_LANG]
		));
	} else if(category == "education"){
		badgeData = DATA_EDUCATION[index];

		// 증빙 이미지
		fragment.appendChild(createModalRow(null, badgeData["proof"], false, {
			alt: badgeData["name"]["en"] + " proof"
		}));

		const educationPeriod = badgeData["end-date"].constructor == Object
			? `${badgeData["start-date"]} ~ ${badgeData["end-date"][NOW_LANG]}`
			: `${badgeData["start-date"]} ~ ${badgeData["end-date"]}`;

		// 교육 정보
		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["education-name"][NOW_LANG],
			badgeData["name"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["education-department"][NOW_LANG],
			badgeData["department"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["education-degree"][NOW_LANG],
			badgeData["degree"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["education-period"][NOW_LANG],
			educationPeriod
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["education-institution"][NOW_LANG],
			badgeData["educational-institution"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["education-link"][NOW_LANG],
			badgeData["url"],
			true
		));
	} else if(category == "certificate"){
		badgeData = DATA_CERTIFICATE[index];

		// 증빙 이미지
		fragment.appendChild(createModalRow(null, badgeData["proof"], false, {
			alt: badgeData["name"]["en"] + " certificate"
		}));

		// 자격증 정보
		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["certificate-name"][NOW_LANG],
			badgeData["name"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["certificate-issuing-authority"][NOW_LANG],
			badgeData["issuing-authority"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["certificate-no"][NOW_LANG],
			badgeData["certificate-no"]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["certificate-acquisition-date"][NOW_LANG],
			badgeData["acquisition-date"]
		));
	} else if(category == "etc"){
		badgeData = DATA_ETC[index];

		// 증빙 이미지
		fragment.appendChild(createModalRow(null, badgeData["proof"], false, {
			alt: badgeData["award-name"]["en"] + " award"
		}));

		// 수상 정보
		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["etc-award-name"][NOW_LANG],
			badgeData["award-name"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["etc-awarding-organization"][NOW_LANG],
			badgeData["awarding-organization"][NOW_LANG]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["etc-award-date"][NOW_LANG],
			badgeData["award-date"]
		));

		fragment.appendChild(createModalRow(
			LANGUAGE_OBJECT["INDEX_LANG"]["etc-reason"][NOW_LANG],
			badgeData["reason"][NOW_LANG]
		));
	}

	if(badgeData != null) {
		// 성능 최적화: 한 번에 DOM에 추가
		modalBody.appendChild(fragment);

		// XSS 방지: textContent 사용
		modalTitle.textContent = badgeData["logo-title"][NOW_LANG].replace("<br>", " ");
		$('#badgeDetailModal').modal('show');

		// 접근성: 모달 열렸을 때 포커스 이동
		setTimeout(() => {
			const modal = document.getElementById('badgeDetailModal');
			const focusableElements = modal.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (focusableElements.length > 0) {
				focusableElements[0].focus();
			}
		}, 300);
	}
}

/**
 * 배지 초기화
 * 성능 최적화: DocumentFragment 사용
 */
document.addEventListener('DOMContentLoaded', function() {
	const careerBadgeArea = document.getElementById("career-badge-area");
	const educationBadgeArea = document.getElementById("education-badge-area");
	const certificateBadgeArea = document.getElementById("certificate-badge-area");
	const etcBadgeArea = document.getElementById("etc-badge-area");

	// 성능 최적화: DocumentFragment 사용
	if(DATA_CAREER && careerBadgeArea){
		const fragment = document.createDocumentFragment();
		const tempArea = document.createElement('div');
		for(let index = 0; index < DATA_CAREER.length; index ++) {
			addBadge(tempArea, 'career', index, DATA_CAREER[index]);
		}
		careerBadgeArea.appendChild(tempArea);
	}
	if(DATA_EDUCATION && educationBadgeArea){
		const tempArea = document.createElement('div');
		for(let index = 0; index < DATA_EDUCATION.length; index ++) {
			addBadge(tempArea, 'education', index, DATA_EDUCATION[index]);
		}
		educationBadgeArea.appendChild(tempArea);
	}
	if(DATA_CERTIFICATE && certificateBadgeArea){
		const tempArea = document.createElement('div');
		for(let index = 0; index < DATA_CERTIFICATE.length; index ++) {
			addBadge(tempArea, 'certificate', index, DATA_CERTIFICATE[index]);
		}
		certificateBadgeArea.appendChild(tempArea);
	}
	if(DATA_ETC && etcBadgeArea){
		const tempArea = document.createElement('div');
		for(let index = 0; index < DATA_ETC.length; index ++) {
			addBadge(tempArea, 'etc', index, DATA_ETC[index]);
		}
		etcBadgeArea.appendChild(tempArea);
	}

	// 접근성: 모달 닫힐 때 포커스 복원
	$('#badgeDetailModal').on('hidden.bs.modal', function () {
		if (lastFocusedElement) {
			lastFocusedElement.focus();
			lastFocusedElement = null;
		}
	});

	// 접근성: 모달 포커스 트랩
	$('#badgeDetailModal').on('shown.bs.modal', function () {
		const modal = document.getElementById('badgeDetailModal');
		const focusableElements = modal.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		modal.addEventListener('keydown', function(e) {
			// Escape 키로 모달 닫기
			if (e.key === 'Escape') {
				$('#badgeDetailModal').modal('hide');
				return;
			}

			// Tab 키 포커스 트랩
			if (e.key === 'Tab') {
				if (e.shiftKey) {
					// Shift + Tab
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					// Tab
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		});
	});
});