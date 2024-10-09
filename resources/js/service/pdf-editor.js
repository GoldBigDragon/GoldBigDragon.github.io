/*
	Toast utility
*/
let toastId = 0;

function removeToast(toastId) {
	const toast = document.getElementById("toast-" + toastId);
	const toastContainer = document.getElementById("toastContainer");
	if (toastContainer.contains(toast)) {
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
	setTimeout(() => {
		toast.classList.add("fade-out");
		setTimeout(() => {
			if (toastContainer.contains(toast)) {
				toastContainer.removeChild(toast);
			}
		}, 3000); // Wait until fade-out animation end
	}, 3000); // Start fade-out after 3 seconds
}

/*
	File drag&drop upload handler
*/
const dropZone = document.getElementById('dropZone');
const pdfContainer = document.getElementById('pdfContainer');
const loading = document.getElementById('loading');
const exportPdfBtn = document.getElementById('exportPdf');
const exportPngBtn = document.getElementById('exportPng');
const resetButton = document.getElementById('resetButton');
let pagesData = [];
let filesLoaded = 0;

dropZone.addEventListener('click', () => {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'application/pdf';
	input.multiple = true;
	input.addEventListener('change', handleFiles);
	input.click();
});

dropZone.addEventListener('dragover', (event) => {
	event.preventDefault();
	dropZone.classList.add('hover');
});

dropZone.addEventListener('dragleave', () => {
	dropZone.classList.remove('hover');
});

dropZone.addEventListener('drop', (event) => {
	event.preventDefault();
	dropZone.classList.remove('hover');
	handleFiles(event);
});

async function handleFiles(event) {
	filesLoaded = 0;
	toggleLoading(true);
	const files = event.target.files || event.dataTransfer.files;
	pagesData = [];
	for (const file of files) {
		if (!['application/pdf'].includes(file.type)) {
			showToast(`${file.name} is an unsupported type.`);
		} else {
			const arrayBuffer = await file.arrayBuffer();
			const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const pageData = { fileName: file.name, pageNum: i, pdf, removed: false };
				pagesData.push(pageData);
				renderPage(page, pageData);
			}
		}
	}
	if(filesLoaded == 0 ){
		toggleLoading(false);
	}
}

async function renderPage(page, pageData) {
	const viewport = page.getViewport({ scale: 1 });
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	canvas.height = viewport.height;
	canvas.width = viewport.width;
	canvas.classList.add('pdf-page');

	await page.render({ canvasContext: context, viewport }).promise;

	const pdfItem = document.createElement('div');
	pdfItem.classList.add('pdf-item');
	pdfItem.appendChild(canvas);

	const controls = document.createElement('div');
	controls.classList.add('controls');

	const removeButton = document.createElement('button');
	removeButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
	removeButton.addEventListener('click', () => {
		pageData.removed = true;
		pdfItem.remove();
	});

	controls.appendChild(removeButton);
	pdfItem.appendChild(controls);
	pdfContainer.appendChild(pdfItem);

	filesLoaded++;
	if (filesLoaded === pagesData.length) {
		toggleLoading(false);
	}
}

function toggleLoading(isLoading) {
	loading.style.color = isLoading ? 'black' : 'transparent';
	exportPdfBtn.disabled = isLoading;
	exportPngBtn.disabled = isLoading;
}

document.getElementById('exportPdf').addEventListener('click', async () => {
	const mergedPdf = await PDFLib.PDFDocument.create();
	for (const pageInfo of pagesData) {
		if (!pageInfo.removed) {
			const arrayBuffer = await pageInfo.pdf.getData();
			const loadedPdf = await PDFLib.PDFDocument.load(arrayBuffer);
			const [page] = await mergedPdf.copyPages(loadedPdf, [pageInfo.pageNum - 1]);
			mergedPdf.addPage(page);
		}
	}
	const mergedPdfBytes = await mergedPdf.save();
	download(mergedPdfBytes, 'merged.pdf', 'application/pdf');
});

document.getElementById('exportPng').addEventListener('click', async () => {
	const zip = new JSZip();
	const pngPromises = [];

	for (const pageInfo of pagesData) {
		if (!pageInfo.removed) {
			const page = await pageInfo.pdf.getPage(pageInfo.pageNum);
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			const viewport = page.getViewport({ scale: 2 });
			canvas.height = viewport.height;
			canvas.width = viewport.width;

			await page.render({ canvasContext: context, viewport }).promise;

			const promise = new Promise((resolve) => {
				canvas.toBlob(blob => {
					if (blob) {
						zip.file(`page_${pageInfo.pageNum}.png`, blob);
					}
					resolve();
				}, 'image/png');
			});
			pngPromises.push(promise);
		}
	}

	await Promise.all(pngPromises);
	const zipContent = await zip.generateAsync({ type: 'blob' });
	saveAs(zipContent, 'pages.zip');
});

function download(data, filename, type) {
	const blob = new Blob([data], { type });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
}

function clearHistory(){
	pagesData = [];
	pdfContainer.innerHTML = '';
	exportPdfBtn.disabled = true;
	exportPngBtn.disabled = true;
	printPdfBtn.disabled = true;
	toggleLoading(false);
}