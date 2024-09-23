const absoluteSizeButton = document.getElementById("absoluteSizeButton");
const relativeSizeButton = document.getElementById("relativeSizeButton");
const absoluteSizeInputs = document.getElementById("absoluteSizeInputs");
const relativeSizeInputs = document.getElementById("relativeSizeInputs");
let toastId = 0;

absoluteSizeButton.addEventListener("click", function() {
	absoluteSizeButton.classList.add("selected");
	relativeSizeButton.classList.remove("selected");
	absoluteSizeInputs.style.display = "block";
	relativeSizeInputs.style.display = "none";
});

relativeSizeButton.addEventListener("click", function() {
	relativeSizeButton.classList.add("selected");
	absoluteSizeButton.classList.remove("selected");
	absoluteSizeInputs.style.display = "none";
	relativeSizeInputs.style.display = "block";
});

function convertToICO(file, width, height) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = function(event) {
			const img = new Image();
			img.src = event.target.result;

			img.onload = function() {
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");

				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(function(blob) {
					resolve(blob);
				}, 'image/x-icon');
			};

			img.onerror = function() {
				reject("Error loading image");
			};
		};

		reader.onerror = function() {
			reject("Error reading file");
		};

		reader.readAsDataURL(file);
	});
}

function removeToast(toastId) {
	const toast = document.getElementById("toast-" + toastId);
	const toastContainer = document.getElementById("toastContainer");
	if(toastContainer.contains(toast)) {
		toastContainer.removeChild(toast);
	}
}

function showToast(message) {
	const toastContainer = document.getElementById("toastContainer");
	const toast = document.createElement("div");
	toast.id = "toast-" + toastId;
	toast.setAttribute("onClick", "removeToast(" + toastId + ")");
	toastId = toastId + 1;
	toast.className = "toast show";
	toast.textContent = message;

	toastContainer.appendChild(toast);
	// 3초 후부터 점점 투명해지도록 설정
	setTimeout(() => {
		toast.classList.add("fade-out");
		setTimeout(() => {
			if(toastContainer.contains(toast)) {
				toastContainer.removeChild(toast);
			}
		}, 3000); // fade-out 애니메이션이 끝날 때까지 대기
	}, 3000); // 3초 후 fade-out 시작
}

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("imageInput");
const downloadLinks = document.getElementById("downloadLinks");
const downloadAllButton = document.getElementById("downloadAllButton");
const downloadAllButton2 = document.getElementById("downloadAllButton2");
const clearHistoryButton = document.getElementById("clearHistoryButton");

// 드래그 앤 드롭 및 클릭을 통한 파일 첨부 처리
dropZone.addEventListener("click", function() {
	fileInput.click();
});

dropZone.addEventListener("dragover", function(event) {
	event.preventDefault();
	dropZone.classList.add("hover");
});

dropZone.addEventListener("dragleave", function() {
	dropZone.classList.remove("hover");
});

dropZone.addEventListener("drop", function(event) {
	event.preventDefault();
	dropZone.classList.remove("hover");
	fileInput.files = event.dataTransfer.files; // 드래그 앤 드롭으로 선택된 파일을 파일 입력에 설정
	handleFiles(fileInput.files);
});

fileInput.addEventListener("change", function() {
	handleFiles(fileInput.files);
});

const zip = new JSZip();
async function handleFiles(files) {
	const fileArray = Array.from(files);
	const isAbsoluteSize = absoluteSizeButton.classList.contains("selected");
	let width, height;

	let completedCount = 0;

	try {
		// 각 파일을 비동기적으로 처리
		const convertPromises = fileArray.map(async (file) => {
			try {
				// 파일 형식 체크 및 변환 사이즈 결정
				const fileType = file.type;
				if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(fileType)) {
					showToast(`${file.name}는 지원하지 않는 이미지 파일입니다.`);
					return;
				}

				const img = document.createElement('img');
				img.src = URL.createObjectURL(file);
				await new Promise((resolve) => {
					img.onload = resolve;
				});

				if (isAbsoluteSize) {
					// 절대적 크기 설정
					width = parseInt(document.getElementById("widthInput").value);
					height = parseInt(document.getElementById("heightInput").value);
				} else {
					// 상대적 크기 설정
					const percentage = parseFloat(document.getElementById("percentageInput").value) / 100;
					width = Math.round(img.width * percentage);
					height = Math.round(img.height * percentage);
				}

				// 이미지 변환 및 다운로드 링크 생성
				const icoBlob = await convertToICO(file, width, height);
				const icoFileName = file.name.replace(/\.[^/.]+$/, ".ico");
				const sizeInKB = (icoBlob.size / 1024).toFixed(2);

				// 다운로드 링크 생성
				const link = document.createElement("a");
				link.href = URL.createObjectURL(icoBlob);
				link.download = icoFileName;

				// 미리보기 이미지 생성
				const previewImage = document.createElement("img");
				previewImage.className = "preview";
				previewImage.src = URL.createObjectURL(icoBlob);

				// 테이블에 행 추가
				const row = document.createElement("tr");

				const previewCell = document.createElement("td");
				previewCell.appendChild(previewImage);
				row.appendChild(previewCell);

				const nameCell = document.createElement("td");
				nameCell.className = "file-name";
				nameCell.textContent = icoFileName;
				row.appendChild(nameCell);

				const sizeCell = document.createElement("td");
				sizeCell.className = "file-size";
				sizeCell.textContent = `${sizeInKB} KB`;
				row.appendChild(sizeCell);

				const downloadCell = document.createElement("td");
				const downloadButton = document.createElement("button");
				downloadButton.innerHTML = "<i class='fa-solid fa-cloud-arrow-down'></i> Download";
				downloadButton.addEventListener("click", () => {
					link.click();
				});
				downloadCell.appendChild(downloadButton);
				row.appendChild(downloadCell);

				downloadLinks.appendChild(row);

				// ZIP 파일에 추가
				zip.file(icoFileName, icoBlob);

				completedCount++;
			} catch (error) {
				showToast(`파일 ${file.name} 변환 중 오류가 발생했습니다.`);
			}
		});

		// 모든 변환이 완료될 때까지 대기
		await Promise.all(convertPromises);

		// 파일 선택 후 더 이상 입력을 받을 수 없도록 이벤트 제거
		fileInput.value = ''; // 파일 선택 초기화

		if (completedCount === fileArray.length) {
			// 변환 완료 후 전체 다운로드 버튼 활성화
			downloadAllButton.disabled = false;
			downloadAllButton2.disabled = false;

			// 전체 다운로드 버튼 클릭 시 ZIP 파일 생성
			downloadAllButton.addEventListener('click', downloadAll());
			// 전체 다운로드 버튼 클릭 시 ZIP 파일 생성
			downloadAllButton2.addEventListener('click', downloadAll());
		}
	} catch (error) {
		showToast(`파일 처리 중 오류가 발생했습니다: ${error.message}`);
	}
}

async function downloadAll(){
	const currentUTC = new Date().toISOString().replace(/[:.-]/g, "_");
	const zipFileName = `${currentUTC}_converted_ico.zip`;
	const zipBlob = await zip.generateAsync({ type: 'blob' });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(zipBlob);
	link.download = zipFileName;
	link.click();
}

// 히스토리 제거 버튼 클릭 시 처리
clearHistoryButton.addEventListener('click', function() {
	downloadLinks.innerHTML = ''; // 다운로드 링크 제거
	downloadAllButton.disabled = true; // 전체 다운로드 버튼 비활성화
	downloadAllButton2.disabled = true; // 전체 다운로드 버튼 비활성화
	fileInput.value = ''; // 파일 입력 초기화
});