/**
 * Minimal Portfolio App
 * Clean, efficient, no duplication
 */

(function() {
	'use strict';

	// ==================== State ====================
	let currentLang = 'en';
	const translations = {
		'nav-home': { en: 'Home', kr: '홈', jp: 'ホーム', cn: '主页', ru: 'Главная' },
		'nav-cartoon': { en: 'Cartoon', kr: '만화', jp: '漫画', cn: '漫画', ru: 'Комикс' },
		'nav-music': { en: 'Music', kr: '음악', jp: '音楽', cn: '音乐', ru: 'Музыка' },
		'nav-service': { en: 'Service', kr: '서비스', jp: 'サービス', cn: '服务', ru: 'Сервис' },
		'nav-program': { en: 'Program', kr: '프로그램', jp: 'プログラム', cn: '程序', ru: 'Программа' },
		'hero-greeting': { en: 'Hello, I\'m', kr: '안녕하세요,', jp: 'こんにちは、', cn: '你好，我是', ru: 'Привет, я' },
		'meta-name': { en: 'NAME', kr: '이름', jp: '名前', cn: '姓名', ru: 'ИМЯ' },
		'meta-country': { en: 'COUNTRY', kr: '국적', jp: '国籍', cn: '国籍', ru: 'СТРАНА' },
		'contact-btn': { en: 'Contact Me', kr: '연락하기', jp: '連絡する', cn: '联系我', ru: 'Связаться' },
		'section-career': { en: 'Career', kr: '경력', jp: 'キャリア', cn: '职业', ru: 'Карьера' },
		'section-education': { en: 'Education', kr: '교육', jp: '教育', cn: '教育', ru: 'Образование' },
		'section-certificate': { en: 'Certificate', kr: '자격증', jp: '証明書', cn: '证书', ru: 'Сертификат' },
		'section-etc': { en: 'Awards & Achievements', kr: '수상 및 성과', jp: '受賞と成果', cn: '获奖与成就', ru: 'Награды' },
		...INDEX_LANG
	};

	// ==================== Init ====================
	document.addEventListener('DOMContentLoaded', () => {
		initMobileMenu();
		initLanguage();
		renderCards();
		initModal();
	});

	// ==================== Mobile Menu ====================
	function initMobileMenu() {
		const toggle = document.getElementById('menuToggle');
		const nav = document.getElementById('nav');

		if (!toggle || !nav) return;

		toggle.addEventListener('click', () => {
			toggle.classList.toggle('active');
			nav.classList.toggle('active');
		});

		// Close menu when clicking nav link
		nav.querySelectorAll('a').forEach(link => {
			link.addEventListener('click', () => {
				toggle.classList.remove('active');
				nav.classList.remove('active');
			});
		});
	}

	// ==================== Language ====================
	function initLanguage() {
		const buttons = document.querySelectorAll('.lang-btn');
		const savedLang = getCookie('lang');

		if (savedLang) {
			currentLang = savedLang;
			buttons.forEach(btn => {
				btn.classList.toggle('active', btn.dataset.lang === currentLang);
			});
		}

		buttons.forEach(btn => {
			btn.addEventListener('click', () => {
				buttons.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				currentLang = btn.dataset.lang;
				updateLanguage();
				setCookie('lang', currentLang, 365);
			});
		});

		updateLanguage();
	}

	function updateLanguage() {
		document.querySelectorAll('[data-lang]').forEach(el => {
			const key = el.dataset.lang;
			const text = translations[key]?.[currentLang];
			if (text) {
				if (text.includes('<')) {
					el.innerHTML = text;
				} else {
					el.textContent = text;
				}
			}
		});
	}

	// ==================== Render Cards ====================
	function renderCards() {
		renderSection('career', DATA_CAREER, 'career-cards');
		renderSection('education', DATA_EDUCATION, 'education-cards');
		renderSection('certificate', DATA_CERTIFICATE, 'certificate-cards');
		renderSection('etc', DATA_ETC, 'etc-cards');
	}

	function renderSection(category, data, containerId) {
		const container = document.getElementById(containerId);
		if (!container || !data) return;

		const fragment = document.createDocumentFragment();

		data.forEach((item, index) => {
			const card = createCard(category, item, index);
			fragment.appendChild(card);
		});

		container.appendChild(fragment);
	}

	function createCard(category, data, index) {
		const card = document.createElement('div');
		card.className = 'card';
		card.setAttribute('role', 'button');
		card.setAttribute('tabindex', '0');

		// Header
		const header = document.createElement('div');
		header.className = 'card-header';

		const icon = document.createElement('img');
		icon.className = 'card-icon';
		icon.src = data.logo;
		icon.alt = '';
		icon.loading = 'lazy';

		const title = document.createElement('div');
		title.className = 'card-title';
		const titleKey = `${category}-${index}-title`;
		title.dataset.lang = titleKey;
		title.textContent = data['logo-title']?.[currentLang] || '';
		translations[titleKey] = data['logo-title'];

		header.appendChild(icon);
		header.appendChild(title);

		// Meta
		const meta = document.createElement('div');
		meta.className = 'card-meta';

		if (category === 'career') {
			meta.appendChild(createMetaItem('Period', formatPeriod(data)));
			if (data.position?.[currentLang]) {
				const posKey = `${category}-${index}-position`;
				translations[posKey] = data.position;
				meta.appendChild(createMetaItem('Role', '', posKey));
			}
		} else if (category === 'education') {
			meta.appendChild(createMetaItem('Period', formatPeriod(data)));
			if (data.degree?.[currentLang]) {
				const degKey = `${category}-${index}-degree`;
				translations[degKey] = data.degree;
				meta.appendChild(createMetaItem('Degree', '', degKey));
			}
		} else if (category === 'certificate') {
			if (data['acquisition-date']) {
				meta.appendChild(createMetaItem('Date', data['acquisition-date']));
			}
		} else if (category === 'etc') {
			if (data['award-date']) {
				meta.appendChild(createMetaItem('Date', data['award-date']));
			}
		}

		card.appendChild(header);
		card.appendChild(meta);

		// Events
		card.addEventListener('click', () => openModal(category, data));
		card.addEventListener('keydown', e => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				openModal(category, data);
			}
		});

		return card;
	}

	function createMetaItem(label, value, langKey) {
		const item = document.createElement('div');
		item.className = 'card-meta-item';

		const labelEl = document.createElement('span');
		labelEl.className = 'card-meta-label';
		labelEl.textContent = label;

		const valueEl = document.createElement('span');
		valueEl.className = 'card-meta-value';
		if (langKey) {
			valueEl.dataset.lang = langKey;
			valueEl.textContent = translations[langKey]?.[currentLang] || '';
		} else {
			valueEl.textContent = value;
		}

		item.appendChild(labelEl);
		item.appendChild(valueEl);
		return item;
	}

	function formatPeriod(data) {
		const endDate = typeof data['end-date'] === 'object'
			? data['end-date'][currentLang]
			: data['end-date'];
		return `${data['start-date']} ~ ${endDate}`;
	}

	// ==================== Modal ====================
	function initModal() {
		const modal = document.getElementById('modal');
		const close = document.getElementById('modalClose');

		close.addEventListener('click', closeModal);
		modal.addEventListener('click', e => {
			if (e.target === modal) closeModal();
		});
		document.addEventListener('keydown', e => {
			if (e.key === 'Escape' && modal.classList.contains('active')) {
				closeModal();
			}
		});
	}

	function openModal(category, data) {
		const modal = document.getElementById('modal');
		const title = document.getElementById('modalTitle');
		const body = document.getElementById('modalBody');

		title.textContent = data['logo-title']?.[currentLang] || '';
		body.innerHTML = '';

		const content = createModalContent(category, data);
		body.appendChild(content);

		modal.classList.add('active');
		document.body.style.overflow = 'hidden';
	}

	function closeModal() {
		const modal = document.getElementById('modal');
		modal.classList.remove('active');
		document.body.style.overflow = '';
	}

	function createModalContent(category, data) {
		const fragment = document.createDocumentFragment();

		// Image
		const imageUrl = data.proof || data.logo;
		if (imageUrl) {
			const img = document.createElement('img');
			img.className = 'modal-image';
			img.src = imageUrl;
			img.alt = 'Preview';
			fragment.appendChild(img);
		}

		// Grid
		const grid = document.createElement('div');
		grid.className = 'modal-grid';

		if (category === 'career') {
			if (data.company) grid.appendChild(createModalRow('Company', data.company));
			if (data['company-link']) {
				grid.appendChild(createModalRow('Website', data['company-link'], true));
			}
			grid.appendChild(createModalRow('Period', formatPeriod(data)));
			if (data.department?.[currentLang]) {
				grid.appendChild(createModalRow('Department', data.department[currentLang]));
			}
			if (data.team?.[currentLang]) {
				grid.appendChild(createModalRow('Team', data.team[currentLang]));
			}
			if (data.position?.[currentLang]) {
				grid.appendChild(createModalRow('Position', data.position[currentLang]));
			}
			if (data.task?.[currentLang]) {
				grid.appendChild(createModalRow('Tasks', data.task[currentLang]));
			}
		} else if (category === 'education') {
			if (data.name?.[currentLang]) {
				grid.appendChild(createModalRow('Name', data.name[currentLang]));
			}
			if (data.department?.[currentLang]) {
				grid.appendChild(createModalRow('Department', data.department[currentLang]));
			}
			if (data.degree?.[currentLang]) {
				grid.appendChild(createModalRow('Degree', data.degree[currentLang]));
			}
			grid.appendChild(createModalRow('Period', formatPeriod(data)));
			if (data['educational-institution']?.[currentLang]) {
				grid.appendChild(createModalRow('Institution', data['educational-institution'][currentLang]));
			}
			if (data.url) {
				grid.appendChild(createModalRow('Website', data.url, true));
			}
		} else if (category === 'certificate') {
			if (data.name?.[currentLang]) {
				grid.appendChild(createModalRow('Name', data.name[currentLang]));
			}
			if (data['issuing-authority']?.[currentLang]) {
				grid.appendChild(createModalRow('Issuing Authority', data['issuing-authority'][currentLang]));
			}
			if (data['certificate-no']) {
				grid.appendChild(createModalRow('Certificate No.', data['certificate-no']));
			}
			if (data['acquisition-date']) {
				grid.appendChild(createModalRow('Acquisition Date', data['acquisition-date']));
			}
		} else if (category === 'etc') {
			if (data['award-name']?.[currentLang]) {
				grid.appendChild(createModalRow('Award Name', data['award-name'][currentLang]));
			}
			if (data['awarding-organization']?.[currentLang]) {
				grid.appendChild(createModalRow('Organization', data['awarding-organization'][currentLang]));
			}
			if (data['award-date']) {
				grid.appendChild(createModalRow('Award Date', data['award-date']));
			}
			if (data.reason?.[currentLang]) {
				grid.appendChild(createModalRow('Reason', data.reason[currentLang]));
			}
		}

		fragment.appendChild(grid);
		return fragment;
	}

	function createModalRow(label, value, isLink = false) {
		const row = document.createElement('div');
		row.className = 'modal-row';

		const labelEl = document.createElement('div');
		labelEl.className = 'modal-label';
		labelEl.textContent = label;

		const valueEl = document.createElement('div');
		valueEl.className = 'modal-value';

		if (isLink && value) {
			const link = document.createElement('a');
			link.href = value;
			link.textContent = value;
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
			valueEl.appendChild(link);
		} else {
			valueEl.innerHTML = value || '-';
		}

		row.appendChild(labelEl);
		row.appendChild(valueEl);
		return row;
	}

	// ==================== Utilities ====================
	function setCookie(name, value, days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict`;
	}

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		return parts.length === 2 ? parts.pop().split(';').shift() : null;
	}

})();
