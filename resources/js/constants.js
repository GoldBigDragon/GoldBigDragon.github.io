/**
 * 애플리케이션 전역 상수 정의
 * 매직 넘버를 제거하고 의미 있는 이름으로 관리
 *
 * @module Constants
 */

const AppConstants = (function() {
	'use strict';

	// 시간 관련 상수 (밀리초)
	const TIME = {
		MILLISECONDS_PER_DAY: 86400000,
		TOAST_DURATION: 3000,
		TOAST_FADE_OUT: 3000,
		MUSIC_PLAYER_UPDATE_INTERVAL: 500
	};

	// 쿠키 관련 상수
	const COOKIE = {
		LANGUAGE_KEY: "lang",
		DEFAULT_EXPIRY_DAYS: 31
	};

	// 언어 관련 상수
	const LANGUAGE = {
		DEFAULT: "en",
		SUPPORTED: ["en", "kr", "jp", "cn", "ru"],
		CYCLE_ORDER: {
			"en": "kr",
			"kr": "jp",
			"jp": "cn",
			"cn": "ru",
			"ru": "en"
		}
	};

	// 파일 크기 제한 (bytes)
	const FILE_SIZE = {
		MAX_HASH_CHECK: 128 * 1024 * 1024,  // 128MB
		MAX_IMAGE: 50 * 1024 * 1024,         // 50MB
		MAX_PDF: 100 * 1024 * 1024           // 100MB
	};

	// HTTP 상태 코드
	const HTTP_STATUS = {
		OK: 200,
		NOT_FOUND: 404,
		SERVER_ERROR: 500
	};

	// Public API
	return {
		TIME: TIME,
		COOKIE: COOKIE,
		LANGUAGE: LANGUAGE,
		FILE_SIZE: FILE_SIZE,
		HTTP_STATUS: HTTP_STATUS
	};
})();

// 전역 사용을 위한 개별 export (하위 호환성)
const MILLISECONDS_PER_DAY = AppConstants.TIME.MILLISECONDS_PER_DAY;
const TOAST_DURATION = AppConstants.TIME.TOAST_DURATION;
const DEFAULT_LANG = AppConstants.LANGUAGE.DEFAULT;
const SUPPORTED_LANGUAGES = AppConstants.LANGUAGE.SUPPORTED;
