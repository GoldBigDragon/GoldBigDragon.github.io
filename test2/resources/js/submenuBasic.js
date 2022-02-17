/**
 * Created : ‎2022‎.02.17 02:40:33
 * Author : GoldBigDragon (김태룡)
 * Contact : dnwndugod642@naver.com
 * Github : http://goldbigdragon.github.io
 * 
 * Purpose : 모든 서브메뉴에서 사용되는 스크립트
 **/

function closeSubMenu(){
	window.parent.postMessage({"command":"closeSubMenu"}, '*');
}

window.addEventListener('message', function(e) {
	if(e.data.command === "hideTitle"){
		document.getElementById("title").style.display = "none";
	} else if(e.data.command === "initData"){
		initData();
	}
});