/**
 * Debounce 유틸리티
 * 빈번한 이벤트 호출을 제어하여 성능 최적화
 *
 * @module Debounce
 */

const DebounceManager = (function() {
	'use strict';

	/**
	 * Debounce 함수 생성
	 * @param {Function} func - 디바운싱할 함수
	 * @param {number} wait - 대기 시간 (밀리초)
	 * @param {boolean} immediate - 즉시 실행 여부 (기본값: false)
	 * @returns {Function} 디바운싱된 함수
	 *
	 * @example
	 * const debouncedSearch = DebounceManager.create(searchMusic, 300);
	 * input.addEventListener('input', debouncedSearch);
	 */
	function createDebounce(func, wait, immediate = false) {
		let timeout;

		return function executedFunction(...args) {
			const context = this;

			const later = function() {
				timeout = null;
				if (!immediate) {
					func.apply(context, args);
				}
			};

			const callNow = immediate && !timeout;

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);

			if (callNow) {
				func.apply(context, args);
			}
		};
	}

	/**
	 * Throttle 함수 생성
	 * @param {Function} func - 쓰로틀링할 함수
	 * @param {number} limit - 제한 시간 (밀리초)
	 * @returns {Function} 쓰로틀링된 함수
	 *
	 * @example
	 * const throttledScroll = DebounceManager.throttle(handleScroll, 100);
	 * window.addEventListener('scroll', throttledScroll);
	 */
	function createThrottle(func, limit) {
		let inThrottle;

		return function(...args) {
			const context = this;

			if (!inThrottle) {
				func.apply(context, args);
				inThrottle = true;

				setTimeout(function() {
					inThrottle = false;
				}, limit);
			}
		};
	}

	// Public API
	return {
		create: createDebounce,
		throttle: createThrottle
	};
})();

// 전역 함수로도 사용 가능하도록 (하위 호환성)
function debounce(func, wait, immediate) {
	return DebounceManager.create(func, wait, immediate);
}

function throttle(func, limit) {
	return DebounceManager.throttle(func, limit);
}
