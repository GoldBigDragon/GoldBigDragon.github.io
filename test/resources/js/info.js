function addBadge(targetDivID, badgeImage, descriptionImage){
	const container = document.getElementById(targetDivID);
	const targetDiv = document.createElement('div');
	targetDiv.className = "badge";
	targetDiv.style.backgroundImage = badgeImage;
	
	const titleLabel = document.createElement('div');
	titleLabel.className = "text label";
	titleLabel.data.textid = "name";
	
	const descriptionPane = document.createElement('div');
	descriptionPane.className = "descriptionPane";
	
	const description = document.createElement('div');
	description.className = "text description";
	description.data.textid = "description";
	
	const dateInfo = document.createElement('div');
	dateInfo.className = "text dateInfo";
	dateInfo.data.textid = "date";
	
	const descriptionImagePane = document.createElement('div');
	descriptionImagePane.className = "descriptionImage";
	descriptionImagePane.backgroundImage = descriptionImage;
	
	Array.prototype.forEach.call(langFields, function(field) {
		if(nowLang == "k") {
			field.dataset.lang = "j";
		} else if(nowLang == "j") {
			field.dataset.lang = "c";
		} else if(nowLang == "c") {
			field.dataset.lang = "r";
		} else if(nowLang == "e") {
			field.dataset.lang = "k";
		} else {
			field.dataset.lang = "e";
		}
	});
	changeLangIcon(nowLang);
	textDataUpdate();
}