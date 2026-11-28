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
	/** 언어별 페이지 버튼 문구 */
	const NAV_LABELS = {
		ko: { introduction: '소개', devlog: '개발 기록', privacy: '개인정보 처리방침' },
		en: { introduction: 'Introduction', devlog: 'Development Log', privacy: 'Privacy Policy' },
		zh: { introduction: '应用介绍', devlog: '开发日志', privacy: '隐私政策' },
		ja: { introduction: 'アプリ紹介', devlog: '開発記録', privacy: 'プライバシーポリシー' },
		ru: { introduction: 'Описание', devlog: 'Журнал разработки', privacy: 'Конфиденциальность' }
	};

	const root = document.documentElement;
	const body = document.body;
	const select = document.getElementById('lang-select');
	const themeButton = document.getElementById('theme-toggle');
	const navLinks = document.querySelectorAll('.page-nav a[data-page]');
	const page = location.pathname.split('/').pop().replace(/\.html$/, '');
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
		renderNav();
	}

	/** 페이지 버튼 문구와 링크에 현재 언어(?lang=) 반영 */
	function renderNav() {
		const labels = NAV_LABELS[current];
		for (const a of navLinks) {
			const name = a.dataset.page;
			a.textContent = labels[name];
			a.href = `/SurvivalManager/${name}.html?lang=${current}`;
			if (name === page) a.setAttribute('aria-current', 'page');
		}
	}

	select.addEventListener('change', () => {
		setLanguage(select.value);
		const url = new URL(location.href);
		url.searchParams.set('lang', current);
		history.replaceState(null, '', url);
	});
	themeButton.addEventListener('click', () => {
		if (isDark()) delete body.dataset.theme;
		else body.dataset.theme = 'dark';
		renderThemeLabel();
	});

	setLanguage(new URLSearchParams(location.search).get('lang'));
})();
