LANGUAGE_OBJECT["BADGE_LANG"] = {};

function addBadge(targetArea, category, index, badgeData){
	const badge = document.createElement("div");
	badge.className = "badge";
	badge.setAttribute("onClick", "openModal('" + category + "', " + index + ")");
	const badgeLogo = document.createElement("img");
	badgeLogo.className = "badge-logo";
	badgeLogo.src = badgeData["logo"];
	const badgeTitle = document.createElement("div");
	badgeTitle.className = "badge-name lang";
	badgeTitle.innerHTML = badgeData["logo-title"][NOW_LANG];
	LANGUAGE_OBJECT["BADGE_LANG"][category + "-" + index] = badgeData["logo-title"];
	badgeTitle.setAttribute("data-lang-var", "BADGE_LANG");
	badgeTitle.setAttribute("data-lang", category + "-" + index);
	badge.appendChild(badgeLogo);
	badge.appendChild(badgeTitle);
	targetArea.appendChild(badge);
}

function openModal(category, index){
	let badgeData = null;
	if(category == "career"){
		badgeData = DATA_CAREER[index];
	} else if(category == "education"){
		badgeData = DATA_EDUCATION[index];
	} else if(category == "certificate"){
		badgeData = DATA_CERTIFICATE[index];
	} else if(category == "etc"){
		badgeData = DATA_ETC[index];
	}
	if(badgeData != null) {
		$('#badgeDetailModal').modal('show');
	}
}

const careerBadgeArea = document.getElementById("career-badge-area");
const educationBadgeArea = document.getElementById("education-badge-area");
const certificateBadgeArea = document.getElementById("certificate-badge-area");
const etcBadgeArea = document.getElementById("etc-badge-area");


if(DATA_CAREER){
	let index = 0;
	for(index = 0; index < DATA_CAREER.length; index ++) {
		addBadge(careerBadgeArea, 'career', index, DATA_CAREER[index]);
	}
}
if(DATA_EDUCATION){
	let index = 0;
	for(index = 0; index < DATA_EDUCATION.length; index ++) {
		addBadge(educationBadgeArea, 'education', index, DATA_EDUCATION[index]);
	}
}
if(DATA_CERTIFICATE){
	let index = 0;
	for(index = 0; index < DATA_CERTIFICATE.length; index ++) {
		addBadge(certificateBadgeArea, 'certificate', index, DATA_CERTIFICATE[index]);
	}
}
if(DATA_ETC){
	let index = 0;
	for(index = 0; index < DATA_ETC.length; index ++) {
		addBadge(etcBadgeArea, 'etc', index, DATA_ETC[index]);
	}
}
