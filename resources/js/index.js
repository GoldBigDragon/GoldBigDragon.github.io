function addBadge(targetArea, category, index, badgeTitle, logoUrl){
	const badge = document.createElement("div");
	badge.className = "badge";
	badge.setAttribute("onClick", "openModal('" + category + "', " + index + ")");
	const badgeLogo = document.createElement("img");
	badgeLogo.className = "badge-logo";
	badgeLogo.src = logoUrl;
	const badgeTitle = document.createElement("div");
	badgeTitle.className = "badge-title";
	badgeTitle.innerHTML = badgeTitle;
	badge.appendChild(badgeLogo);
	badge.appendChild(badgeTitle);
	badge.appendChild(badgeSubtitle);
	targetArea.appendChild(badge);
}

const careerBadgeArea = document.getElementById("career-badge-area");
const educationBadgeArea = document.getElementById("education-badge-area");
const certificateBadgeArea = document.getElementById("certificate-badge-area");
const etcBadgeArea = document.getElementById("etc-badge-area");

if(DATA_CAREER){
	let index = 0;
	for(index = 0; index < DATA_CAREER.length; index ++) {
		addBadge(careerBadgeArea, 'career', index, DATA_CAREER[index]["logo-title"], DATA_CAREER[index]["logo"]);
	}
}
if(DATA_EDUCATION){
	let index = 0;
	for(index = 0; index < DATA_EDUCATION.length; index ++) {
		addBadge(careerBadgeArea, 'education', index, DATA_EDUCATION[index]["logo-title"], DATA_EDUCATION[index]["logo"]);
	}
}
if(DATA_CERTIFICATE){
	let index = 0;
	for(index = 0; index < DATA_CERTIFICATE.length; index ++) {
		addBadge(careerBadgeArea, 'certificate', index, DATA_CERTIFICATE[index]["logo-title"], DATA_CERTIFICATE[index]["logo"]);
	}
}
if(DATA_ETC){
	let index = 0;
	for(index = 0; index < DATA_ETC.length; index ++) {
		addBadge(careerBadgeArea, 'etc', index, DATA_ETC[index]["logo-title"], DATA_ETC[index]["logo"]);
	}
}

/*
Array.prototype.forEach.call(DATA_CAREER, (badgeData) => {
});
badgeSubtitle.setAttribute("onClick", "$('#badgeDetailModal').modal('show')");
*/