/**
 * Created : ‎2022‎.02.17 08:59:24
 * Author : GoldBigDragon (김태룡)
 * Contact : dnwndugod642@naver.com
 * Github : http://goldbigdragon.github.io
 * 
 * Purpose : 사용자 목록 창에서 사용되는 스크립트
 **/

function getList(){
	const userList = document.getElementById("userList");
	
	// 여기에 ajax로 실제 데이터를 가지고 오면 됨.
	const dataset = [{"id":"1", "name":"홍길동", "device":"iPhone", "joinDate":"2022.02.16."},
					{"id":"2", "name":"임꺽정", "device":"GIGABYTE", "joinDate":"2022.02.17."}];
	
	dataset.forEach(data =>{
		const newTr = document.createElement("tr");
		const idTd = document.createElement("td");
		idTd.innerHTML = data.id;
		const nameTd = document.createElement("td");
		nameTd.innerHTML = data.name;
		const deviceTd = document.createElement("td");
		deviceTd.innerHTML = data.device;
		const joinDateTd = document.createElement("td");
		joinDateTd.innerHTML = data.joinDate;
		
		newTr.appendChild(idTd);
		newTr.appendChild(nameTd);
		newTr.appendChild(deviceTd);
		newTr.appendChild(joinDateTd);
		newTr.setAttribute("onclick", "userDetail("+data.id+")");
		userList.appendChild(newTr);
	});
}

function userDetail(userId){
	window.parent.postMessage({"command":"openUserInfo", "userId":userId}, '*');
}


getList();
