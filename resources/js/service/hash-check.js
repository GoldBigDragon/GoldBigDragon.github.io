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
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

// Event listeners for drag-and-drop and file selection
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (event) => {
	event.preventDefault();
	dropZone.classList.add("hover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("hover"));
dropZone.addEventListener("drop", (event) => {
	event.preventDefault();
	dropZone.classList.remove("hover");
	fileInput.files = event.dataTransfer.files;
	handleFiles(fileInput.files);
});
fileInput.addEventListener("change", () => handleFiles(fileInput.files));

const downloadLinks = document.getElementById("downloadLinks");
const workers = [];
const MAX_WORKERS = 4;
let hashes = {};

function createWorker() {
	const workerBlob = new Blob([`
		importScripts('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js');

		onmessage = function(event) {
			const { name, data } = event.data;
			const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(data));

			const md5 = CryptoJS.MD5(wordArray).toString();
			const sha1 = CryptoJS.SHA1(wordArray).toString();
			const sha256 = CryptoJS.SHA256(wordArray).toString();

			postMessage({ name, size: data.byteLength, md5, sha1, sha256 });
		};
	`], { type: 'application/javascript' });

	return new Worker(URL.createObjectURL(workerBlob));
}

for (let i = 0; i < MAX_WORKERS; i++) {
	workers.push(createWorker());
}

workers.forEach(worker => {
	worker.onmessage = (event) => {
		const { name, size, md5, sha1, sha256 } = event.data;
		const fileSize = formatFileSize(size);
		const fileInfo = `
		<tr class="file-info">
			<td>${name}</td>
			<td>${fileSize}</td>
			<td class="hash" onclick="copyToClipboard('${md5}')" title="Copy ${md5}">${md5.slice(0, 10)}...${md5.slice(-5)}</td>
			<td class="hash" onclick="copyToClipboard('${sha1}')" title="Copy ${sha1}">${sha1.slice(0, 10)}...${sha1.slice(-5)}</td>
			<td class="hash" onclick="copyToClipboard('${sha256}')" title="Copy ${sha256}">${sha256.slice(0, 10)}...${sha256.slice(-5)}</td>
		</tr>
		`;
		hashes[name] = {"size": fileSize,
		"MD5": md5,
		"SHA-1": sha1,
		"SHA-256": sha256};
		downloadLinks.innerHTML += fileInfo;
	};
});

function handleFiles(files) {
	let workerIndex = 0;
	const fileQueue = Array.from(files);
	const downloadAllButtons = document.getElementsByClassName("downloadAllButton");
	Array.prototype.forEach.call(downloadAllButtons, function(downloadAllButton) {
		downloadAllButton.disabled = false;
	});

	const processNextFile = () => {
		if (fileQueue.length === 0) return;
		const file = fileQueue.shift();
		if (file.size > 128 * 1024 * 1024) {
			showToast(`File ${file.name } is too large (Up to 128MB)`)
			const fileSize = formatFileSize(file.size);
			const error = `
			<tr class="file-info">
				<td>${name}</td>
				<td>${fileSize}</td>
				<td>File is too large (Up to 128MB)</td>
				<td>File is too large (Up to 128MB)</td>
				<td>File is too large (Up to 128MB)</td>
			</tr>
			`;
			downloadLinks.innerHTML += error;
			processNextFile();
			hashes[name] = {"size": fileSize,
			"MD5": "File is too large (Up to 128MB)",
			"SHA-1": "File is too large (Up to 128MB)",
			"SHA-256": "File is too large (Up to 128MB)"};
			return;
		}
		const reader = new FileReader();
		reader.onload = (event) => {
			workers[workerIndex].postMessage({ name: file.name, data: event.target.result });
			workerIndex = (workerIndex + 1) % MAX_WORKERS;
			processNextFile();
		};
		reader.readAsArrayBuffer(file);
	};
	for (let i = 0; i < Math.min(MAX_WORKERS, fileQueue.length); i++) {
		processNextFile();
	}
}

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

function copyToClipboard(text) {
	navigator.clipboard.writeText(text).then(() => {
		showToast('Copied: ' + text);
	}).catch(err => {
		showToast('Copy error: ' + err);
	});
}

function downloadJSON() {
	let jsonStr = JSON.stringify(hashes, null, 2);
	let blob = new Blob([jsonStr], { type: 'application/json' });
	let link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'hashes.json';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function downloadCSV() {
	let csvContent = "Name,Size,MD5,SHA-1,SHA-256\n";
	for (const [fileName, fileData] of Object.entries(hashes)) {
		csvContent += `${fileName},${fileData.size},${fileData.MD5},${fileData["SHA-1"]},${fileData["SHA-256"]}\n`;
	}
	let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	let link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'hashes.csv';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function clearHistory() {
	const downloadAllButtons = document.getElementsByClassName("downloadAllButton");
	Array.prototype.forEach.call(downloadAllButtons, function(downloadAllButton) {
		downloadAllButton.disabled = true;
	});
	downloadLinks.innerHTML = '';
	fileInput.value = '';
	hashes = {};
}