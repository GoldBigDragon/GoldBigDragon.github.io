/**
 * Created : ‎2022‎.02.17 09:11:27
 * Author : GoldBigDragon (김태룡)
 * Contact : dnwndugod642@naver.com
 * Github : http://goldbigdragon.github.io
 * 
 * Purpose : 사용자 정보 창에서 사용되는 스크립트
 **/

const DEPLOYMENT_TARGET = ["10.5", "10.4", "10.3", "10.2", "10.1", "10.0"];
const DEVICE = ["iPhone", "Galaxy", "GIGABYTE", "Gram"];
const MAIN_INTEFACE = ["Main", "Sub", "Dual"];
const STATUS_BAR_STYLE = ["Default", "Up", "Down"];

function initData(userId){
	// 여기에 ajax로 실제 데이터를 가지고 오면 됨.
	let dataset;
	if(userId == 1) {
		dataset = {
			"displayName":"홍길동",
			"bundleIdentifier":"github.goldbigdragon.io",
			"version":"1.0",
			"build":"1",
			"account":null,
			"deploymentTarget":"10.3",
			"device":"iPhone",
			"mainInterface":"Main",
			"deviceOrientationPortrait":true,
			"deviceOrientationUpsideDown":false,
			"deviceOrientationLandscapeLeft":true,
			"deviceOrientationLandscapeRight":true,
			"statusBarStyle":"Default",
			"hideStatusBar":false,
			"requiresFullScreen":true,
			"appIconsSource":"AppIcon",
			"launchImagesSource":"Use Asset Catalog",
			"launchScreenFile":"LaunchScreen",
			"embeddedBinaries":null
		};
	} else if(userId == 2) {
		dataset = {
			"displayName":"임꺽정",
			"bundleIdentifier":"github.",
			"version":"1.0",
			"build":"1",
			"account":null,
			"deploymentTarget":"10.2",
			"device":"GIGABYTE",
			"mainInterface":"Main",
			"deviceOrientationPortrait":true,
			"deviceOrientationUpsideDown":false,
			"deviceOrientationLandscapeLeft":true,
			"deviceOrientationLandscapeRight":true,
			"statusBarStyle":"Up",
			"hideStatusBar":true,
			"requiresFullScreen":false,
			"appIconsSource":"AppIcon",
			"launchImagesSource":"Use Asset Catalog",
			"launchScreenFile":"LaunchScreen",
			"embeddedBinaries":null
		};
	}
	document.getElementById("displayName").value = dataset.displayName;
	document.getElementById("bundleIdentifier").value = dataset.bundleIdentifier;
	document.getElementById("version").value = dataset.version;
	document.getElementById("build").value = dataset.build;
	
	if(dataset.deviceOrientationPortrait){
		document.getElementById("portrait").checked = true;
	}
	if(dataset.deviceOrientationUpsideDown){
		document.getElementById("upsideDown").checked = true;
	}
	if(dataset.deviceOrientationLandscapeLeft){
		document.getElementById("landscpaeLeft").checked = true;
	}
	if(dataset.deviceOrientationLandscapeRight){
		document.getElementById("landscapeRight").checked = true;
	}
	if(dataset.hideStatusBar){
		document.getElementById("hideStatusBar").checked = true;
	}
	if(dataset.requiresFullScreen){
		document.getElementById("requiresFullScreen").checked = true;
	}

	const deployTarget = document.getElementById("deployTarget");
	DEPLOYMENT_TARGET.forEach((value, idx) =>{
		optionCreator(deployTarget, value, value, value===dataset.deploymentTarget, null);
	});
	const devices = document.getElementById("devices");
	DEVICE.forEach((value, idx) =>{
		optionCreator(devices, value, value, value===dataset.device, null);
	});
	const mainInterface = document.getElementById("mainInterface");
	MAIN_INTEFACE.forEach((value, idx) =>{
		optionCreator(mainInterface, value, value, value===dataset.mainInterface, null);
	});
	const statusBarStyle = document.getElementById("statusBarStyle");
	STATUS_BAR_STYLE.forEach((value, idx) =>{
		optionCreator(statusBarStyle, value, value, value===dataset.statusBarStyle, null);
	});
}

// SELECT 태그 내 OPTION 태그를 생성하는 함수
function optionCreator(target, value, title, isSelect, tooltip) {
	const option = document.createElement("option");
	option.value = value;
	option.innerHTML = "&nbsp;" + title + "&nbsp;";
	if (isSelect) {
		option.selected = "selected";
	}
	if (tooltip != null) {
		option.title = tooltip;
	}
	target.appendChild(option);
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const userId = urlParams.get('userId');
initData(userId);