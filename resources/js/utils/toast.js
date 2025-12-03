/**
 * Toast 알림 관리 유틸리티
 * XSS 방지를 위해 textContent 사용
 *
 * @module Toast
 */

const ToastManager = (function() {
	'use strict';

	let toastId = 0;

	/**
	 * Toast 알림 제거
	 * @param {number} id - 제거할 toast ID
	 */
	function removeToast(id) {
		const toast = document.getElementById("toast-" + id);
		const toastContainer = document.getElementById("toastContainer");
		if (toastContainer && toastContainer.contains(toast)) {
			toastContainer.removeChild(toast);
		}
	}

	/**
	 * Toast 알림 표시
	 * @param {string} message - 표시할 메시지
	 * @param {number} duration - 표시 시간 (ms, 기본값: 3000)
	 */
	function showToast(message, duration = 3000) {
		const toastContainer = document.getElementById("toastContainer");

		if (!toastContainer) {
			console.error('Toast container not found. Please add <div id="toastContainer" class="toast-container"></div> to your HTML.');
			return;
		}

		const toast = document.createElement("div");
		const currentToastId = toastId++;

		toast.id = "toast-" + currentToastId;
		toast.className = "toast show";
		// XSS 방지: textContent 사용
		toast.textContent = message;

		// 클릭 시 제거
		toast.addEventListener('click', function() {
			removeToast(currentToastId);
		});

		toastContainer.appendChild(toast);

		// Fade out 애니메이션 시작
		setTimeout(() => {
			toast.classList.add("fade-out");

			// 애니메이션 종료 후 제거
			setTimeout(() => {
				if (toastContainer.contains(toast)) {
					toastContainer.removeChild(toast);
				}
			}, 3000); // Fade out 애니메이션 시간
		}, duration);
	}

	// Public API
	return {
		show: showToast,
		remove: removeToast
	};
})();

// 전역 함수로도 사용 가능하도록 (하위 호환성)
function showToast(message, duration) {
	ToastManager.show(message, duration);
}

function removeToast(toastId) {
	ToastManager.remove(toastId);
}
