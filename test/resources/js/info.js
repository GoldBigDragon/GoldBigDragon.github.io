function addBadge(badgeData){
	console.log(badgeData.container);
	const container = document.getElementById(badgeData.container);
	const targetDiv = document.createElement('div');
	targetDiv.className = "badge";
	targetDiv.style.backgroundImage = badgeData.background;
	
	const titleLabel = document.createElement('div');
	titleLabel.className = "label";
	titleLabel.data.textid = "name";
	
	const descriptionPane = document.createElement('div');
	descriptionPane.className = "descriptionPane";
	
	const description = document.createElement('div');
	description.className = "description";
	description.data.textid = "description";
	
	const dateInfo = document.createElement('div');
	dateInfo.className = "dateInfo";
	dateInfo.data.textid = "date";
	
	const descriptionImagePane = document.createElement('div');
	descriptionImagePane.className = "descriptionImage";
	descriptionImagePane.backgroundImage = badgeData.logo;
	
	textDataUpdate();
}

	Array.prototype.forEach.call(chronologyBadgeDatas, function(badgeData) {
		addBadge(badgeData);
	});