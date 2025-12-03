/**
 * Navbar 공통 유틸리티
 * basic.js와 header.js에 중복되던 코드를 통합
 *
 * @module Navbar
 */

const NavbarManager = (function() {
	'use strict';

	/**
	 * Navbar 초기화
	 * - 스크롤 시 navbar shrink 효과
	 * - 모바일 메뉴 자동 닫기
	 */
	function initNavbar() {
		const navbarShrink = function() {
			const navbarCollapsible = document.body.querySelector('#mainNav');
			if (!navbarCollapsible) {
				return;
			}
			if (window.scrollY === 0) {
				navbarCollapsible.classList.remove('navbar-shrink');
			} else {
				navbarCollapsible.classList.add('navbar-shrink');
			}
		};

		// 초기 실행
		navbarShrink();

		// 스크롤 이벤트 리스너
		document.addEventListener('scroll', navbarShrink);

		// 모바일 메뉴 자동 닫기
		const navbarToggler = document.body.querySelector('.navbar-toggler');
		const responsiveNavItems = [].slice.call(
			document.querySelectorAll('#navbarResponsive .nav-link')
		);

		responsiveNavItems.map(function(responsiveNavItem) {
			responsiveNavItem.addEventListener('click', function() {
				if (window.getComputedStyle(navbarToggler).display !== 'none') {
					navbarToggler.click();
				}
			});
		});
	}

	// Public API
	return {
		init: initNavbar
	};
})();

// DOMContentLoaded 시 자동 초기화
window.addEventListener('DOMContentLoaded', function() {
	NavbarManager.init();
});
