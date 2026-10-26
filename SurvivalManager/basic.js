/** 공통 언어·테마 전환. 초기 언어는 ?lang= 또는 html[data-default-lang] */
(() => {
	/** select 값 → html lang 값 */
	const LOCALES = { ko: 'ko', en: 'en', zh: 'zh-CN', ja: 'ja', ru: 'ru' };
	/** 언어별 테마 버튼 문구 [다크로 전환, 라이트로 전환] */
	const THEME_LABELS = {
		ko: ['Dark', 'Light'],
		en: ['Dark', 'Light'],
		zh: ['深色模式', '浅色模式'],
		ja: ['ダーク', 'ライト'],
		ru: ['Тёмная тема', 'Светлая тема']
	};

	const root = document.documentElement;
	const body = document.body;
	const select = document.getElementById('lang-select');
	const themeButton = document.getElementById('theme-toggle');
	let current = root.dataset.defaultLang;

	const isDark = () => body.dataset.theme === 'dark';

	function renderThemeLabel() {
		themeButton.textContent = THEME_LABELS[current][isDark() ? 1 : 0];
	}

	/** html lang만 교체하고, 표시 전환은 CSS가 처리 */
	function setLanguage(code) {
		if (code === 'ba') code = 'ru';
		if (!Object.hasOwn(LOCALES, code)) code = root.dataset.defaultLang;
		current = code;
		root.lang = LOCALES[code];
		select.value = code;
		const heading = document.querySelector(`.i18n > [lang="${LOCALES[code]}"] h1`);
		if (heading) document.title = heading.textContent;
		renderThemeLabel();
	}

	select.addEventListener('change', () => setLanguage(select.value));
	themeButton.addEventListener('click', () => {
		if (isDark()) delete body.dataset.theme;
		else body.dataset.theme = 'dark';
		renderThemeLabel();
	});

	setLanguage(new URLSearchParams(location.search).get('lang'));
})();
