/**
 * 경로 헬퍼 유틸리티
 * GitHub Pages와 로컬 환경 모두에서 작동하도록 경로를 관리합니다.
 *
 * @module PathHelper
 */

const PathHelper = (function() {
	'use strict';

	/**
	 * 현재 실행 환경의 base path를 가져옵니다.
	 * @returns {string} base path
	 */
	function getBasePath() {
		// GitHub Pages 환경 (https://goldbigdragon.github.io)
		if (window.location.protocol === 'https:' || window.location.protocol === 'http:') {
			// 현재 페이지의 경로 깊이에 따라 base path 계산
			const pathname = window.location.pathname;
			const depth = pathname.split('/').filter(segment => segment && segment.includes('.html')).length > 0
				? pathname.split('/').length - 2
				: pathname.split('/').length - 1;

			// 루트에서의 거리만큼 ../ 추가
			if (depth <= 1) {
				return '.';
			}
			return '../'.repeat(depth - 1).slice(0, -1);
		}

		// 로컬 파일 환경 (file://)
		// 현재 HTML 파일의 위치를 기준으로 상대 경로 계산
		const pathname = window.location.pathname;
		const depth = pathname.split('/').filter(segment => segment).length;

		// index.html이 루트에 있으므로
		if (depth <= 1) {
			return '.';
		}
		return '../'.repeat(depth - 1).slice(0, -1);
	}

	/**
	 * 리소스 경로를 생성합니다.
	 * @param {string} resourcePath - 리소스의 상대 경로 (예: 'resources/css/style.css')
	 * @returns {string} 완성된 리소스 경로
	 */
	function getResourcePath(resourcePath) {
		const basePath = getBasePath();
		// 슬래시로 시작하는 경우 제거
		const cleanPath = resourcePath.startsWith('/') ? resourcePath.slice(1) : resourcePath;
		return basePath === '.' ? cleanPath : `${basePath}/${cleanPath}`;
	}

	/**
	 * 현재 실행 환경이 로컬인지 확인합니다.
	 * @returns {boolean} 로컬 환경이면 true
	 */
	function isLocalEnvironment() {
		return window.location.protocol === 'file:';
	}

	/**
	 * fetch 호환 경로를 반환합니다.
	 * 로컬 환경에서는 경고를 표시하고 null을 반환합니다.
	 * @param {string} resourcePath - 리소스의 상대 경로
	 * @returns {string|null} fetch 가능한 경로 또는 null
	 */
	function getFetchPath(resourcePath) {
		if (isLocalEnvironment()) {
			console.warn(
				'⚠️ 로컬 파일 환경에서는 fetch API를 사용할 수 없습니다.\n' +
				'로컬 서버를 실행해주세요: python serve.py\n' +
				'자세한 내용은 LOCAL_SETUP.md를 참고하세요.'
			);
			return null;
		}
		return getResourcePath(resourcePath);
	}

	// Public API
	return {
		getBasePath,
		getResourcePath,
		isLocalEnvironment,
		getFetchPath
	};
})();

// 전역 스코프에 노출 (하위 호환성)
window.PathHelper = PathHelper;
