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
		companyEmploymentPeriodDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["company-employment-period"][NOW_LANG];
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
		departmentDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["company-department"][NOW_LANG];
		const department = document.createElement("div");
		department.className = "col value";
		department.innerHTML = badgeData["department"][NOW_LANG];
		departmentDiv.appendChild(departmentDescription);
		departmentDiv.appendChild(department);
		
		const teamDiv = document.createElement("div");
		teamDiv.className = "row modal-panel";
		const teamDescription = document.createElement("div");
		teamDescription.className = "col-3 key";
		teamDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["company-team"][NOW_LANG];
		const team = document.createElement("div");
		team.className = "col value";
		team.innerHTML = badgeData["team"][NOW_LANG];
		teamDiv.appendChild(teamDescription);
		teamDiv.appendChild(team);
		
		const positionDiv = document.createElement("div");
		positionDiv.className = "row modal-panel";
		const positionDescription = document.createElement("div");
		positionDescription.className = "col-3 key";
		positionDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["company-position"][NOW_LANG];
		const position = document.createElement("div");
		position.className = "col value";
		position.innerHTML = badgeData["position"][NOW_LANG];
		positionDiv.appendChild(positionDescription);
		positionDiv.appendChild(position);
		
		const taskDiv = document.createElement("div");
		taskDiv.className = "row modal-panel";
		const taskDescription = document.createElement("div");
		taskDescription.className = "col-3 key";
		taskDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["company-task"][NOW_LANG];
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
		
		const proofDiv = document.createElement("div");
		proofDiv.className = "row modal-panel";
		proofDiv.style.marginBottom = "1rem";
		const proofLogo = document.createElement("img");
		proofLogo.src = badgeData["proof"];
		proofLogo.style.maxWidth = "20rem";
		proofLogo.style.maxHeight = "25rem";
		proofDiv.appendChild(proofLogo);
		
		const urlDiv = document.createElement("div");
		urlDiv.className = "row modal-panel";
		const urlDescription = document.createElement("div");
		urlDescription.className = "col-3 key";
		urlDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["education-link"][NOW_LANG];
		const url = document.createElement("a");
		url.className = "col value";
		url.href = badgeData["url"];
		url.target = "_blank";
		url.innerHTML = badgeData["url"];
		urlDiv.appendChild(urlDescription);
		urlDiv.appendChild(url);
		
		const periodDiv = document.createElement("div");
		periodDiv.className = "row modal-panel";
		const periodDescription = document.createElement("div");
		periodDescription.className = "col-3 key";
		periodDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["education-period"][NOW_LANG];
		const period = document.createElement("div");
		period.className = "col value";
		if(badgeData["end-date"].constructor == Object) {
			period.innerHTML = badgeData["start-date"] + " ~ " + badgeData["end-date"][NOW_LANG];
		} else {
			period.innerHTML = badgeData["start-date"] + " ~ " + badgeData["end-date"];
		}
		periodDiv.appendChild(periodDescription);
		periodDiv.appendChild(period);
		
		const nameDiv = document.createElement("div");
		nameDiv.className = "row modal-panel";
		const nameDescription = document.createElement("div");
		nameDescription.className = "col-3 key";
		nameDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["education-name"][NOW_LANG];
		const name = document.createElement("div");
		name.className = "col value";
		name.innerHTML = badgeData["name"][NOW_LANG];
		nameDiv.appendChild(nameDescription);
		nameDiv.appendChild(name);
		
		const departmentDiv = document.createElement("div");
		departmentDiv.className = "row modal-panel";
		const departmentDescription = document.createElement("div");
		departmentDescription.className = "col-3 key";
		departmentDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["education-department"][NOW_LANG];
		const department = document.createElement("div");
		department.className = "col value";
		department.innerHTML = badgeData["department"][NOW_LANG];
		departmentDiv.appendChild(departmentDescription);
		departmentDiv.appendChild(department);
		
		const degreeDiv = document.createElement("div");
		degreeDiv.className = "row modal-panel";
		const degreeDescription = document.createElement("div");
		degreeDescription.className = "col-3 key";
		degreeDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["education-degree"][NOW_LANG];
		const degree = document.createElement("div");
		degree.className = "col value";
		degree.innerHTML = badgeData["degree"][NOW_LANG];
		degreeDiv.appendChild(degreeDescription);
		degreeDiv.appendChild(degree);
		
		const institutionDiv = document.createElement("div");
		institutionDiv.className = "row modal-panel";
		const institutionDescription = document.createElement("div");
		institutionDescription.className = "col-3 key";
		institutionDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["education-institution"][NOW_LANG];
		const institution = document.createElement("div");
		institution.className = "col value";
		institution.innerHTML = badgeData["educational-institution"][NOW_LANG];
		institutionDiv.appendChild(institutionDescription);
		institutionDiv.appendChild(institution);
		
		modalBody.appendChild(proofDiv);
		modalBody.appendChild(nameDiv);
		modalBody.appendChild(departmentDiv);
		modalBody.appendChild(degreeDiv);
		modalBody.appendChild(periodDiv);
		modalBody.appendChild(institutionDiv);
		modalBody.appendChild(urlDiv);
	} else if(category == "certificate"){
		badgeData = DATA_CERTIFICATE[index];
		
		const proofDiv = document.createElement("div");
		proofDiv.className = "row modal-panel";
		proofDiv.style.marginBottom = "1rem";
		const proofLogo = document.createElement("img");
		proofLogo.src = badgeData["proof"];
		proofLogo.style.maxWidth = "20rem";
		proofLogo.style.maxHeight = "25rem";
		proofDiv.appendChild(proofLogo);
		
		const nameDiv = document.createElement("div");
		nameDiv.className = "row modal-panel";
		const nameDescription = document.createElement("div");
		nameDescription.className = "col-3 key";
		nameDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["certificate-name"][NOW_LANG];
		const name = document.createElement("div");
		name.className = "col value";
		name.innerHTML = badgeData["name"][NOW_LANG];
		nameDiv.appendChild(nameDescription);
		nameDiv.appendChild(name);
		
		const certificateNoDiv = document.createElement("div");
		certificateNoDiv.className = "row modal-panel";
		const certificateNoDescription = document.createElement("div");
		certificateNoDescription.className = "col-3 key";
		certificateNoDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["certificate-no"][NOW_LANG];
		const certificateNo = document.createElement("div");
		certificateNo.className = "col value";
		certificateNo.innerHTML = badgeData["certificate-no"];
		certificateNoDiv.appendChild(certificateNoDescription);
		certificateNoDiv.appendChild(certificateNo);
		
		const issuingAuthorityDiv = document.createElement("div");
		issuingAuthorityDiv.className = "row modal-panel";
		const issuingAuthorityDescription = document.createElement("div");
		issuingAuthorityDescription.className = "col-3 key";
		issuingAuthorityDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["certificate-issuing-authority"][NOW_LANG];
		const issuingAuthority = document.createElement("div");
		issuingAuthority.className = "col value";
		issuingAuthority.innerHTML = badgeData["issuing-authority"][NOW_LANG];
		issuingAuthorityDiv.appendChild(issuingAuthorityDescription);
		issuingAuthorityDiv.appendChild(issuingAuthority);
		
		const acquisitionDateDiv = document.createElement("div");
		acquisitionDateDiv.className = "row modal-panel";
		const acquisitionDateDescription = document.createElement("div");
		acquisitionDateDescription.className = "col-3 key";
		acquisitionDateDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["certificate-acquisition-date"][NOW_LANG];
		const acquisitionDate = document.createElement("div");
		acquisitionDate.className = "col value";
		acquisitionDate.innerHTML = badgeData["acquisition-date"];
		acquisitionDateDiv.appendChild(acquisitionDateDescription);
		acquisitionDateDiv.appendChild(acquisitionDate);
		
		modalBody.appendChild(proofDiv);
		modalBody.appendChild(nameDiv);
		modalBody.appendChild(issuingAuthorityDiv);
		modalBody.appendChild(certificateNoDiv);
		modalBody.appendChild(acquisitionDateDiv);
	} else if(category == "etc"){
		badgeData = DATA_ETC[index];
		
		const proofDiv = document.createElement("div");
		proofDiv.className = "row modal-panel";
		proofDiv.style.marginBottom = "1rem";
		const proofLogo = document.createElement("img");
		proofLogo.src = badgeData["proof"];
		proofLogo.style.maxWidth = "20rem";
		proofLogo.style.maxHeight = "25rem";
		proofDiv.appendChild(proofLogo);
		
		const nameDiv = document.createElement("div");
		nameDiv.className = "row modal-panel";
		const nameDescription = document.createElement("div");
		nameDescription.className = "col-3 key";
		nameDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["etc-award-name"][NOW_LANG];
		const name = document.createElement("div");
		name.className = "col value";
		name.innerHTML = badgeData["award-name"][NOW_LANG];
		nameDiv.appendChild(nameDescription);
		nameDiv.appendChild(name);
		
		const awardingOrganizationDiv = document.createElement("div");
		awardingOrganizationDiv.className = "row modal-panel";
		const awardingOrganizationDescription = document.createElement("div");
		awardingOrganizationDescription.className = "col-3 key";
		awardingOrganizationDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["etc-awarding-organization"][NOW_LANG];
		const awardingOrganization = document.createElement("div");
		awardingOrganization.className = "col value";
		awardingOrganization.innerHTML = badgeData["awarding-organization"][NOW_LANG];
		awardingOrganizationDiv.appendChild(awardingOrganizationDescription);
		awardingOrganizationDiv.appendChild(awardingOrganization);
		
		const awardDateDiv = document.createElement("div");
		awardDateDiv.className = "row modal-panel";
		const awardDateDescription = document.createElement("div");
		awardDateDescription.className = "col-3 key";
		awardDateDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["etc-award-date"][NOW_LANG];
		const awardDate = document.createElement("div");
		awardDate.className = "col value";
		awardDate.innerHTML = badgeData["award-date"];
		awardDateDiv.appendChild(awardDateDescription);
		awardDateDiv.appendChild(awardDate);
		
		const reasonDiv = document.createElement("div");
		reasonDiv.className = "row modal-panel";
		const reasonDescription = document.createElement("div");
		reasonDescription.className = "col-3 key";
		reasonDescription.innerHTML = LANGUAGE_OBJECT["INDEX_LANG"]["etc-reason"][NOW_LANG];
		const reason = document.createElement("div");
		reason.className = "col value";
		reason.innerHTML = badgeData["reason"][NOW_LANG];
		reasonDiv.appendChild(reasonDescription);
		reasonDiv.appendChild(reason);
		
		modalBody.appendChild(proofDiv);
		modalBody.appendChild(nameDiv);
		modalBody.appendChild(awardingOrganizationDiv);
		modalBody.appendChild(awardDateDiv);
		modalBody.appendChild(reasonDiv);
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