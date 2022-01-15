function addBadge(dataKey, badgeData){
	const container = document.getElementById(badgeData.container);
	const targetDiv = document.createElement('div');
	targetDiv.className = "badge";
	targetDiv.style.backgroundImage = badgeData.background;
	
	const titleLabel = document.createElement('div');
	titleLabel.className = "label datatextid";
	titleLabel.dataset.dataname = badgeData.variableName;
	titleLabel.dataset.datakey = dataKey;
	titleLabel.dataset.datatextid = "name";
	
	const descriptionPane = document.createElement('div');
	descriptionPane.className = "descriptionPane";
	
	const description = document.createElement('div');
	description.className = "description datatextid";
	description.dataset.dataname = badgeData.variableName;
	description.dataset.datakey = dataKey;
	description.dataset.datatextid = "description";
	
	const dateInfo = document.createElement('div');
	dateInfo.className = "dateInfo datatextid";
	dateInfo.innerHTML = badgeData.date;
	
	const descriptionImagePane = document.createElement('div');
	descriptionImagePane.className = "descriptionImage";
	descriptionImagePane.backgroundImage = badgeData.logo;
	
	targetDiv.appendChild(titleLabel);
	targetDiv.appendChild(description);
	targetDiv.appendChild(dateInfo);
	targetDiv.appendChild(descriptionImagePane);
	container.appendChild(targetDiv);
}

function loadBadges(){
	for (var i = 0; i < Object.keys(chronologyBadgeDatas).length; i++) {
		addBadge(Object.keys(chronologyBadgeDatas)[i], chronologyBadgeDatas[Object.keys(chronologyBadgeDatas)[i]]);
	};
	iframeDataTextUpdate();
}