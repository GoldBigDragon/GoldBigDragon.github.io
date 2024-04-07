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
	const modalTitle = document.getElementById("badgeModalTitle");
	const modalBody = document.getElementById("badgeModalBody");
	modalTitle.innerHTML = "";
	modalBody.innerHTML = "";
	if(category == "career"){
		badgeData = DATA_CAREER[index];
		const companyLogoDiv = document.createElement("div");
		companyLogoDiv.className = "row modal-panel";
		companyLogoDiv.style.marginBottom = "1rem";
		const companyLogo = document.createElement("img");
		companyLogo.src = badgeData["logo"];
		companyLogo.style.maxWidth = "10rem";
		companyLogo.style.maxHeight = "10rem";
		companyLogoDiv.appendChild(companyLogo);
		
		const companyNameDiv = document.createElement("div");
		companyNameDiv.className = "row modal-panel";
		const companyNameDescription = document.createElement("div");
		companyNameDescription.className = "col-3 key";
		companyNameDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["company-name"][NOW_LANG];
		const companyName = document.createElement("div");
		companyName.className = "col value";
		companyName.innerHTML = badgeData["company"];
		companyNameDiv.appendChild(companyNameDescription);
		companyNameDiv.appendChild(companyName);
		
		const companyUrlDiv = document.createElement("div");
		companyUrlDiv.className = "row modal-panel";
		const companyUrlDescription = document.createElement("div");
		companyUrlDescription.className = "col-3 key";
		companyUrlDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["company-site"][NOW_LANG];
		const companyUrl = document.createElement("a");
		companyUrl.className = "col value";
		companyUrl.href = badgeData["company-link"];
		companyUrl.target = "_blank";
		companyUrl.innerHTML = badgeData["company-link"];
		companyUrlDiv.appendChild(companyUrlDescription);
		companyUrlDiv.appendChild(companyUrl);
		
		const companyEmploymentPeriodDiv = document.createElement("div");
		companyEmploymentPeriodDiv.className = "row modal-panel";
		const companyEmploymentPeriodDescription = document.createElement("div");
		companyEmploymentPeriodDescription.className = "col-3 key";
		companyEmploymentPeriodDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["employment-period"][NOW_LANG];
		const companyEmploymentPeriod = document.createElement("div");
		companyEmploymentPeriod.className = "col value";
		if(badgeData["end-date"].constructor == Object) {
			companyEmploymentPeriod.innerHTML = badgeData["start-date"] + " ~ " + badgeData["end-date"][NOW_LANG];
		} else {
			companyEmploymentPeriod.innerHTML = badgeData["start-date"] + " ~ " + badgeData["end-date"];
		}
		companyEmploymentPeriodDiv.appendChild(companyEmploymentPeriodDescription);
		companyEmploymentPeriodDiv.appendChild(companyEmploymentPeriod);
		
		const departmentDiv = document.createElement("div");
		departmentDiv.className = "row modal-panel";
		const departmentDescription = document.createElement("div");
		departmentDescription.className = "col-3 key";
		departmentDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["department"][NOW_LANG];
		const department = document.createElement("div");
		department.className = "col value";
		department.innerHTML = badgeData["department"][NOW_LANG];
		departmentDiv.appendChild(departmentDescription);
		departmentDiv.appendChild(department);
		
		const teamDiv = document.createElement("div");
		teamDiv.className = "row modal-panel";
		const teamDescription = document.createElement("div");
		teamDescription.className = "col-3 key";
		teamDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["team"][NOW_LANG];
		const team = document.createElement("div");
		team.className = "col value";
		team.innerHTML = badgeData["team"][NOW_LANG];
		teamDiv.appendChild(teamDescription);
		teamDiv.appendChild(team);
		
		const positionDiv = document.createElement("div");
		positionDiv.className = "row modal-panel";
		const positionDescription = document.createElement("div");
		positionDescription.className = "col-3 key";
		positionDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["position"][NOW_LANG];
		const position = document.createElement("div");
		position.className = "col value";
		position.innerHTML = badgeData["position"][NOW_LANG];
		positionDiv.appendChild(positionDescription);
		positionDiv.appendChild(position);
		
		const taskDiv = document.createElement("div");
		taskDiv.className = "row modal-panel";
		const taskDescription = document.createElement("div");
		taskDescription.className = "col-3 key";
		taskDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["task"][NOW_LANG];
		const task = document.createElement("div");
		task.className = "col value";
		task.innerHTML = badgeData["task"][NOW_LANG];
		taskDiv.appendChild(taskDescription);
		taskDiv.appendChild(task);
		
		modalBody.appendChild(companyLogoDiv);
		modalBody.appendChild(companyNameDiv);
		modalBody.appendChild(companyUrlDiv);
		modalBody.appendChild(companyEmploymentPeriodDiv);
		modalBody.appendChild(departmentDiv);
		modalBody.appendChild(teamDiv);
		modalBody.appendChild(positionDiv);
		modalBody.appendChild(taskDiv);
	} else if(category == "education"){
		badgeData = DATA_EDUCATION[index];
	} else if(category == "certificate"){
		badgeData = DATA_CERTIFICATE[index];
	} else if(category == "etc"){
		badgeData = DATA_ETC[index];
	}
	if(badgeData != null) {
		modalTitle.innerHTML = badgeData["logo-title"][NOW_LANG].replace("<br>", " ");
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
