/**
 * 파일 업로드 (Drag & Drop) 공통 유틸리티
 *
 * @module FileUpload
 */

const FileUploadManager = (function() {
	'use strict';

	/**
	 * Drag & Drop 파일 업로드 핸들러 초기화
	 * @param {string} dropZoneId - Drop zone 요소 ID
	 * @param {string} fileInputId - File input 요소 ID
	 * @param {Function} handleFilesCallback - 파일 처리 콜백 함수
	 * @param {Object} options - 추가 옵션
	 * @param {string} options.acceptTypes - 허용할 파일 타입 (예: "image/*")
	 */
	function initDragAndDrop(dropZoneId, fileInputId, handleFilesCallback, options = {}) {
		const dropZone = document.getElementById(dropZoneId);
		const fileInput = document.getElementById(fileInputId);

		if (!dropZone) {
			console.error(`Drop zone element not found: ${dropZoneId}`);
			return;
		}

		if (!fileInput) {
			console.error(`File input element not found: ${fileInputId}`);
			return;
		}

		// 클릭 시 파일 선택 다이얼로그 열기
		dropZone.addEventListener("click", function() {
			fileInput.click();
		});

		// Drag over 이벤트
		dropZone.addEventListener("dragover", function(event) {
			event.preventDefault();
			dropZone.classList.add("hover");
		});

		// Drag leave 이벤트
		dropZone.addEventListener("dragleave", function() {
			dropZone.classList.remove("hover");
		});

		// Drop 이벤트
		dropZone.addEventListener("drop", function(event) {
			event.preventDefault();
			dropZone.classList.remove("hover");
			fileInput.files = event.dataTransfer.files;
			handleFilesCallback(fileInput.files);
		});

		// File input change 이벤트
		fileInput.addEventListener("change", function() {
			handleFilesCallback(fileInput.files);
		});
	}

	/**
	 * 파일 크기 검증
	 * @param {File} file - 검증할 파일
	 * @param {number} maxSize - 최대 크기 (bytes)
	 * @returns {boolean} 검증 결과
	 */
	function validateFileSize(file, maxSize) {
		if (file.size > maxSize) {
			return false;
		}
		return true;
	}

	/**
	 * 파일 타입 검증
	 * @param {File} file - 검증할 파일
	 * @param {Array<string>} allowedTypes - 허용할 타입 배열
	 * @returns {boolean} 검증 결과
	 */
	function validateFileType(file, allowedTypes) {
		if (!allowedTypes || allowedTypes.length === 0) {
			return true;
		}
		return allowedTypes.includes(file.type);
	}

	/**
	 * 파일 크기 포맷팅
	 * @param {number} size - 파일 크기 (bytes)
	 * @returns {string} 포맷팅된 크기 문자열
	 */
	function formatFileSize(size) {
		const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		let index = 0;
		let formattedSize = size;

		while (formattedSize >= 1024 && index < units.length - 1) {
			formattedSize /= 1024;
			index++;
		}

		return `${formattedSize.toFixed(2)} ${units[index]}`;
	}

	// Public API
	return {
		initDragAndDrop: initDragAndDrop,
		validateFileSize: validateFileSize,
		validateFileType: validateFileType,
		formatFileSize: formatFileSize
	};
})();

// 전역 함수로도 사용 가능하도록 (하위 호환성)
const FileUpload = FileUploadManager;
