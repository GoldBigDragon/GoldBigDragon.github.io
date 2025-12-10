/**
 * Futuristic Portfolio - Main JavaScript
 * Handles language switching, badge rendering, modal interactions, and animations
 */

(function() {
	'use strict';

	// ==================== Global Variables ====================
	let currentLang = 'en';
	let lastFocusedElement = null;

	// Language translations
	const TRANSLATIONS = {
		home: { en: 'Home', kr: '홈', jp: 'ホーム', cn: '主页', ru: 'Главная' },
		cartoon: { en: 'Cartoon', kr: '만화', jp: '漫画', cn: '漫画', ru: 'Комикс' },
		music: { en: 'Music', kr: '음악', jp: '音楽', cn: '音乐', ru: 'Музыка' },
		service: { en: 'Service', kr: '서비스', jp: 'サービス', cn: '服务', ru: 'Сервис' },
		program: { en: 'Program', kr: '프로그램', jp: 'プログラム', cn: '程序', ru: 'Программа' },
		...INDEX_LANG
	};

	// ==================== Initialization ====================
	document.addEventListener('DOMContentLoaded', function() {
		initNavbar();
		initLanguageSelector();
		loadBadges();
		initModal();
		initAnimations();
		updateLanguage();
	});

	// ==================== Navbar ====================
	function initNavbar() {
		const navbar = document.getElementById('navbar');

		// Scroll effect
		window.addEventListener('scroll', function() {
			if (window.scrollY > 50) {
				navbar.classList.add('scrolled');
			} else {
				navbar.classList.remove('scrolled');
			}
		});

		// Mobile menu toggle
		const mobileToggle = document.querySelector('.mobile-menu-toggle');
		const navbarMenu = document.querySelector('.navbar-menu');

		if (mobileToggle) {
			mobileToggle.addEventListener('click', function() {
				navbarMenu.classList.toggle('active');
				this.classList.toggle('active');
			});
		}
	}

	// ==================== Language Selector ====================
	function initLanguageSelector() {
		const langButtons = document.querySelectorAll('.lang-btn');

		langButtons.forEach(button => {
			button.addEventListener('click', function() {
				// Remove active class from all buttons
				langButtons.forEach(btn => btn.classList.remove('active'));

				// Add active class to clicked button
				this.classList.add('active');

				// Update current language
				currentLang = this.dataset.lang;

				// Update all text
				updateLanguage();

				// Save to cookie
				setCookie('lang', currentLang, 365);
			});
		});

		// Load saved language
		const savedLang = getCookie('lang');
		if (savedLang) {
			currentLang = savedLang;
			langButtons.forEach(btn => {
				btn.classList.toggle('active', btn.dataset.lang === currentLang);
			});
		}
	}

	function updateLanguage() {
		const langElements = document.querySelectorAll('.lang');

		langElements.forEach(element => {
			const key = element.dataset.langKey;
			if (TRANSLATIONS[key] && TRANSLATIONS[key][currentLang]) {
				const translation = TRANSLATIONS[key][currentLang];

				// Check if translation contains HTML
				if (translation.includes('<')) {
					element.innerHTML = translation;
				} else {
					element.textContent = translation;
				}
			}
		});
	}

	// ==================== Badge Rendering ====================
	function loadBadges() {
		if (typeof DATA_CAREER !== 'undefined') {
			renderBadges('career', DATA_CAREER, 'career-grid');
		}
		if (typeof DATA_EDUCATION !== 'undefined') {
			renderBadges('education', DATA_EDUCATION, 'education-grid');
		}
		if (typeof DATA_CERTIFICATE !== 'undefined') {
			renderBadges('certificate', DATA_CERTIFICATE, 'certificate-grid');
		}
		if (typeof DATA_ETC !== 'undefined') {
			renderBadges('etc', DATA_ETC, 'etc-grid');
		}
	}

	function renderBadges(category, data, containerId) {
		const container = document.getElementById(containerId);
		if (!container) return;

		const fragment = document.createDocumentFragment();

		data.forEach((item, index) => {
			const badge = createBadgeCard(category, item, index);
			fragment.appendChild(badge);
		});

		container.appendChild(fragment);
	}

	function createBadgeCard(category, data, index) {
		const card = document.createElement('div');
		card.className = 'badge-card';
		card.setAttribute('role', 'button');
		card.setAttribute('tabindex', '0');
		card.setAttribute('data-category', category);
		card.setAttribute('data-index', index);

		// Logo
		const logo = document.createElement('img');
		logo.className = 'badge-logo';
		logo.src = data.logo;
		logo.alt = data['logo-title']?.en || 'Badge logo';
		logo.loading = 'lazy';

		// Title
		const title = document.createElement('div');
		title.className = 'badge-title lang';
		title.dataset.langKey = `badge-${category}-${index}`;
		title.textContent = data['logo-title']?.[currentLang] || data['logo-title']?.en || '';

		// Add to translations
		if (data['logo-title']) {
			TRANSLATIONS[`badge-${category}-${index}`] = data['logo-title'];
		}

		card.appendChild(logo);
		card.appendChild(title);

		// Event listeners
		card.addEventListener('click', function() {
			openModal(category, index, data);
		});

		card.addEventListener('keydown', function(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				openModal(category, index, data);
			}
		});

		return card;
	}

	// ==================== Modal ====================
	function initModal() {
		const modal = document.getElementById('modal');
		const closeBtn = document.getElementById('modal-close');

		closeBtn.addEventListener('click', closeModal);

		modal.addEventListener('click', function(e) {
			if (e.target === modal) {
				closeModal();
			}
		});

		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape' && modal.classList.contains('active')) {
				closeModal();
			}
		});
	}

	function openModal(category, index, data) {
		lastFocusedElement = document.activeElement;

		const modal = document.getElementById('modal');
		const modalTitle = document.getElementById('modal-title');
		const modalBody = document.getElementById('modal-body');

		// Set title
		modalTitle.textContent = data['logo-title']?.[currentLang] || data['logo-title']?.en || '';

		// Clear previous content
		modalBody.innerHTML = '';

		// Render modal content based on category
		const content = createModalContent(category, data);
		modalBody.appendChild(content);

		// Show modal
		modal.classList.add('active');
		document.body.style.overflow = 'hidden';

		// Focus on close button
		setTimeout(() => {
			document.getElementById('modal-close').focus();
		}, 100);
	}

	function closeModal() {
		const modal = document.getElementById('modal');
		modal.classList.remove('active');
		document.body.style.overflow = '';

		if (lastFocusedElement) {
			lastFocusedElement.focus();
			lastFocusedElement = null;
		}
	}

	function createModalContent(category, data) {
		const fragment = document.createDocumentFragment();

		if (category === 'career') {
			// Company logo
			if (data.logo) {
				const logoImg = document.createElement('img');
				logoImg.src = data.logo;
				logoImg.alt = data.company + ' logo';
				logoImg.style.maxWidth = '150px';
				logoImg.style.marginBottom = '1rem';
				logoImg.style.display = 'block';
				fragment.appendChild(logoImg);
			}

			// Company info
			fragment.appendChild(createModalRow('Company', data.company));
			fragment.appendChild(createModalRow('Website', data['company-link'], true));

			const period = typeof data['end-date'] === 'object'
				? `${data['start-date']} ~ ${data['end-date'][currentLang]}`
				: `${data['start-date']} ~ ${data['end-date']}`;
			fragment.appendChild(createModalRow('Period', period));

			if (data.department?.[currentLang]) {
				fragment.appendChild(createModalRow('Department', data.department[currentLang]));
			}
			if (data.team?.[currentLang]) {
				fragment.appendChild(createModalRow('Team', data.team[currentLang]));
			}
			if (data.position?.[currentLang]) {
				fragment.appendChild(createModalRow('Position', data.position[currentLang]));
			}
			if (data.task?.[currentLang]) {
				fragment.appendChild(createModalRow('Tasks', data.task[currentLang]));
			}
		} else if (category === 'education') {
			if (data.proof) {
				const proofImg = document.createElement('img');
				proofImg.src = data.proof;
				proofImg.alt = 'Education proof';
				proofImg.style.maxWidth = '100%';
				proofImg.style.marginBottom = '1rem';
				fragment.appendChild(proofImg);
			}

			const period = typeof data['end-date'] === 'object'
				? `${data['start-date']} ~ ${data['end-date'][currentLang]}`
				: `${data['start-date']} ~ ${data['end-date']}`;

			fragment.appendChild(createModalRow('Name', data.name?.[currentLang] || ''));
			fragment.appendChild(createModalRow('Department', data.department?.[currentLang] || ''));
			fragment.appendChild(createModalRow('Degree', data.degree?.[currentLang] || ''));
			fragment.appendChild(createModalRow('Period', period));
			fragment.appendChild(createModalRow('Institution', data['educational-institution']?.[currentLang] || ''));
			fragment.appendChild(createModalRow('Website', data.url, true));
		} else if (category === 'certificate') {
			if (data.proof) {
				const proofImg = document.createElement('img');
				proofImg.src = data.proof;
				proofImg.alt = 'Certificate proof';
				proofImg.style.maxWidth = '100%';
				proofImg.style.marginBottom = '1rem';
				fragment.appendChild(proofImg);
			}

			fragment.appendChild(createModalRow('Name', data.name?.[currentLang] || ''));
			fragment.appendChild(createModalRow('Issuing Authority', data['issuing-authority']?.[currentLang] || ''));
			fragment.appendChild(createModalRow('Certificate No.', data['certificate-no'] || ''));
			fragment.appendChild(createModalRow('Acquisition Date', data['acquisition-date'] || ''));
		} else if (category === 'etc') {
			if (data.proof) {
				const proofImg = document.createElement('img');
				proofImg.src = data.proof;
				proofImg.alt = 'Award proof';
				proofImg.style.maxWidth = '100%';
				proofImg.style.marginBottom = '1rem';
				fragment.appendChild(proofImg);
			}

			fragment.appendChild(createModalRow('Award Name', data['award-name']?.[currentLang] || ''));
			fragment.appendChild(createModalRow('Organization', data['awarding-organization']?.[currentLang] || ''));
			fragment.appendChild(createModalRow('Award Date', data['award-date'] || ''));
			fragment.appendChild(createModalRow('Reason', data.reason?.[currentLang] || ''));
		}

		return fragment;
	}

	function createModalRow(label, value, isLink = false) {
		const row = document.createElement('div');
		row.className = 'modal-row';

		const keyDiv = document.createElement('div');
		keyDiv.className = 'modal-key';
		keyDiv.textContent = label;

		const valueDiv = document.createElement('div');
		valueDiv.className = 'modal-value';

		if (isLink && value) {
			const link = document.createElement('a');
			link.href = value;
			link.textContent = value;
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
			link.style.color = 'var(--primary)';
			valueDiv.appendChild(link);
		} else {
			valueDiv.innerHTML = value || '-';
		}

		row.appendChild(keyDiv);
		row.appendChild(valueDiv);

		return row;
	}

	// ==================== Animations ====================
	function initAnimations() {
		// Intersection Observer for scroll animations
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						entry.target.style.animationDelay = '0s';
						entry.target.style.opacity = '1';
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.1 }
		);

		const sections = document.querySelectorAll('.section');
		sections.forEach(section => {
			observer.observe(section);
		});

		// Stagger animation for badge cards
		const badgeCards = document.querySelectorAll('.badge-card');
		badgeCards.forEach((card, index) => {
			card.style.animationDelay = `${index * 0.05}s`;
		});
	}

	// ==================== Utility Functions ====================
	function setCookie(name, value, days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		const expires = 'expires=' + date.toUTCString();
		document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
	}

	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) {
			return parts.pop().split(';').shift();
		}
		return null;
	}

	// ==================== Expose to global scope ====================
	window.PortfolioApp = {
		updateLanguage,
		openModal,
		closeModal
	};

})();
