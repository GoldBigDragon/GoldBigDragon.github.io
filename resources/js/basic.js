/**
 * 전역 언어 관리 객체 및 변수
 * TODO: 향후 LanguageManager 모듈로 리팩토링 필요
 */
const LANGUAGE_OBJECT = {};
let NOW_LANG = "en";

/**
 * Header 컴포넌트 로드
 * @returns {Promise<void>}
 */
async function loadHeader() {
	const headerElement = document.querySelector('#header');
	if (!headerElement) {
		console.warn('Header element not found');
		return;
	}

	try {
		// 현재 페이지의 경로 깊이 계산
		const depth = window.location.pathname.split('/').filter(segment => segment && !segment.includes('.html')).length;
		const basePath = depth > 0 ? '../'.repeat(depth) : './';

		const response = await fetch(`${basePath}templates/components/header.html`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const text = await response.text();
		headerElement.innerHTML = text;

		// CSS 로드
		const style = document.createElement("link");
		style.rel = 'stylesheet';
		style.href = `${basePath}resources/css/header.css`;
		document.head.appendChild(style);

		// 언어 스크립트 로드
		const lang = document.createElement('script');
		lang.type = 'application/javascript';
		lang.src = `${basePath}resources/lang/header.js`;
		document.body.appendChild(lang);

		// Header 스크립트 로드
		const script = document.createElement('script');
		script.type = 'application/javascript';
		script.src = `${basePath}resources/js/header.js`;
		document.body.appendChild(script);
	} catch (error) {
		console.error('Failed to load header:', error);
		// 폴백: 기본 헤더 표시
		const depth = window.location.pathname.split('/').filter(segment => segment && !segment.includes('.html')).length;
		const basePath = depth > 0 ? '../'.repeat(depth) : './';
		headerElement.innerHTML = `<nav class="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNav"><div class="container"><a class="navbar-brand" href="${basePath}index.html">GoldBigDragon</a></div></nav>`;
	}
}

/**
 * Footer 컴포넌트 로드
 * @returns {Promise<void>}
 */
async function loadFooter() {
	const footerElement = document.querySelector('#footer');
	if (!footerElement) {
		console.warn('Footer element not found');
		return;
	}

	try {
		// 현재 페이지의 경로 깊이 계산
		const depth = window.location.pathname.split('/').filter(segment => segment && !segment.includes('.html')).length;
		const basePath = depth > 0 ? '../'.repeat(depth) : './';

		const response = await fetch(`${basePath}templates/components/footer.html`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const text = await response.text();
		footerElement.innerHTML = text;

		// CSS 로드
		const style = document.createElement("link");
		style.rel = 'stylesheet';
		style.href = `${basePath}resources/css/footer.css`;
		document.head.appendChild(style);

		// 언어 스크립트 로드
		const lang = document.createElement('script');
		lang.type = 'application/javascript';
		lang.src = `${basePath}resources/lang/footer.js`;
		document.body.appendChild(lang);

		// Footer 스크립트 로드
		const script = document.createElement('script');
		script.type = 'application/javascript';
		script.src = `${basePath}resources/js/footer.js`;
		document.body.appendChild(script);
	} catch (error) {
		console.error('Failed to load footer:', error);
		// 폴백: 기본 푸터 표시
		footerElement.innerHTML = '<footer class="footer py-4"><div class="container"><div class="row align-items-center"><div class="col-lg-12 text-center">Copyright &copy; GoldBigDragon</div></div></div></footer>';
	}
}

/**
 * 쿠키 설정
 * @param {string} name - 쿠키 이름
 * @param {string} value - 쿠키 값
 * @param {number} exp - 만료일 (일 단위)
 */
function setCookie(name, value, exp) {
	const date = new Date();
	const MILLISECONDS_PER_DAY = 86400000;
	date.setTime(date.getTime() + exp * MILLISECONDS_PER_DAY);

	// 보안 강화: SameSite 및 Secure 플래그 추가
	let cookieString = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict`;

	// HTTPS 환경에서만 Secure 플래그 추가
	if (window.location.protocol === 'https:') {
		cookieString += ";Secure";
	}

	document.cookie = cookieString;
}

/**
 * 쿠키 조회
 * @param {string} name - 쿠키 이름
 * @returns {string|null} 쿠키 값 또는 null
 */
function getCookie(name) {
	const value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
	return value ? value[2] : null;
}

/**
 * 쿠키 삭제
 * @param {string} name - 쿠키 이름
 */
function deleteCookie(name) {
	document.cookie = `${name}=; expires=Thu, 01 Jan 1999 00:00:01 GMT;path=/`;
}

/**
 * 언어 설정 로드 및 적용
 * 쿠키에서 언어 설정을 읽어 페이지에 적용
 */
function loadLanguage() {
	const DEFAULT_LANG = "en";
	NOW_LANG = getCookie("lang");

	if (NOW_LANG == null) {
		NOW_LANG = DEFAULT_LANG;
	}
	const textField = document.getElementsByClassName("lang");
	Array.prototype.forEach.call(textField, function(languageElement) {
		try{
			languageElement.innerHTML = LANGUAGE_OBJECT[languageElement.dataset.langVar][languageElement.dataset.lang][NOW_LANG];
		} catch(err){
			console.error('Language loading error:', err);
		}
	});
	const srcField = document.getElementsByClassName("lang-src");
	Array.prototype.forEach.call(srcField, function(languageElement) {
		try{
			languageElement.src = LANGUAGE_OBJECT[languageElement.dataset.langVar][languageElement.dataset.lang][NOW_LANG];
		} catch(err){
			console.error('Language source loading error:', err);
		}
	});
	const placeholderField = document.getElementsByClassName("lang-placeholder");
	Array.prototype.forEach.call(placeholderField, function(languageElement) {
		try{
			languageElement.placeholder = LANGUAGE_OBJECT[languageElement.dataset.langVar][languageElement.dataset.lang][NOW_LANG];
		} catch(err){
			console.error('Language placeholder loading error:', err);
		}
	});
	const titleField = document.getElementsByClassName("lang-title");
	Array.prototype.forEach.call(titleField, function(languageElement) {
		try{
			languageElement.removeAttribute("title");
			languageElement.setAttribute("title", LANGUAGE_OBJECT[languageElement.dataset.langVar][languageElement.dataset.langTitle][NOW_LANG]);
		} catch(err){
			console.error('Language title loading error:', err);
		}
	});
}

loadFooter();
loadHeader();