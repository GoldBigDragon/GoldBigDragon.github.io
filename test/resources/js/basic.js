function copyClipboard(event) {
	let copiedText = event.target.innerHTML;
	navigator.clipboard.writeText(copiedText);
}

function copyClipboardText(text) {
	navigator.clipboard.writeText(text);
}