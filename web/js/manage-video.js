$(document).ready(function(){
	if(localStorage.getItem('access-token')!=null||localStorage.getItem('access-token')!=undefined){
		loadVideo();
	}
	else{
		Materialize.toast('Bạn cần đăng nhập để sử dụng chức năng này', 2000, 'red');
		$("#showmore").hide();
	}

	$("#showmore").on('click', function(){
		if(localStorage.getItem('access-token')!=null
			||localStorage.getItem('access-token')!=undefined){
			loadVideo();
		}
		else{
			Materialize.toast('Bạn cần đăng nhập để sử dụng chức năng này', 2000, 'red');
		}	
	})
})
var page="";
function loadVideo(){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/upload-video?page="+page+"&maxResult=3";
	$.ajax({
		url:VIDEO_API,
		type:'GET',
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			page = parseInt(res.meta.page)+1;
			if(res.data!=""){
				for (var i = 0; i < res.data.length; i++) {
					var videoWebsiteId = res.data[i].videoWebsiteId;
					var name = res.data[i].name;
					var thumbnail = res.data[i].thumbnail;
					var url = res.data[i].url;
					var createdAt=res.data[i].createdAt;
					var date = new Date();
					date.setTime(createdAt);
					var formatDate=(date.getDate()+"/"+date.getMonth()+1+"/"+date.getFullYear());
					generateVideoHTML(videoWebsiteId, name, thumbnail, url, formatDate)
				}		
			}else{
				$("#showmore").hide();
				Materialize.toast('Không tìm thấy kết quả', 2000,'red');
			}
			
		},
		error:function(res){
			var responseErr=JSON.parse(res.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}

function generateVideoHTML(videoWebsiteId, name, thumbnail, url, formatDate){
	html=""
	html+='<div class="row">'
	html+=	'<div class="col xl3 l3 m3 s12">'
	html+=		'<a href="play.html?videoId='+videoWebsiteId+'"><img class="responsive-img" src="'+thumbnail+'"></a>'
	html+=	'</div>'
	html+=	'<div class="col xl7 l7 m7 s12">'
	html+=		'<h6 style="overflow: hidden;max-height: 65px;"><strong>'+name+'</strong></h6>'
	html+=		'<div>Ngày upload:'+formatDate+'</div>'
	html+=	'</div>'
	html+=	'<div class="col xl2 l2 m2 s12" style="cursor:pointer; opacity:0.3">'
	html+=		'<a onclick="getVideoToDelete(\''+videoWebsiteId+'\')" class="modal-trigger delete" href="#modal"><i class="material-icons">close</i></a>'
	html+=	'</div>'
	html+='</div>'
	$('#list-video-upload').append(html);
}
var pageFilter=""
function loadVideoFromFilter(){
	var inputsearch=$("#search").val();
	var fromDate = new Date($("[name='fromdate']").val());
	var toDate = new Date($("[name='todate']").val());
	if($("[name='fromdate']").val()=="" && $("[name='todate']").val()==""){
		toDate=""
		fromDate="";
		var VIDEO_API="http://api-challenger-0705.appspot.com/_api/v1/upload-video?search="+inputsearch+"&fromDate="+fromDate+"&toDate="+toDate+"&page="+pageFilter+"&maxResult=3";
	}else if($("[name='fromdate']").val()=="" && $("[name='todate']").val()!=""){
		Materialize.toast('Bạn phải nhập từ ngày đến ngày', 2000, 'red');
		return false;
	}else if($("[name='fromdate']").val()!="" && $("[name='todate']").val()==""){
		toDate="";
		var VIDEO_API="http://api-challenger-0705.appspot.com/_api/v1/upload-video?search="+inputsearch+"&fromDate="+fromDate.getTime()+"&toDate="+toDate+"&page="+pageFilter+"&maxResult=3";
	}else if($("[name='fromdate']").val()!="" && $("[name='todate']").val()!="" && fromDate<=toDate){
		var VIDEO_API="http://api-challenger-0705.appspot.com/_api/v1/upload-video?search="+inputsearch+"&fromDate="+fromDate.getTime()+"&toDate="+toDate.getTime()+"&page="+pageFilter+"&maxResult=3"
	}else if($("[name='fromdate']").val()!="" && $("[name='todate']").val()!="" && fromDate>=toDate){
		Materialize.toast('Ngày đến phải lớn hơn ngày từ 123', 2000,'red');
		return false;
	}

	$.ajax({
		url:VIDEO_API,
		type:'GET',
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			pageFilter = parseInt(res.meta.page)+1;
			if(resSucc.data!=""){
				for (var i = 0; i < res.data.length; i++) {
					var videoWebsiteId = res.data[i].videoWebsiteId;
					var name = res.data[i].name;
					var thumbnail = res.data[i].thumbnail;
					var url = res.data[i].url;
					var createdAt=res.data[i].createdAt;
					var date = new Date();
					date.setTime(createdAt);
					var formatDate=(date.getDate()+"/"+date.getMonth()+1+"/"+date.getFullYear());
					generateVideoHTML(videoWebsiteId, name, thumbnail, url, formatDate)
				}		
			}else{
				$("#showmore-filter").hide();
				Materialize.toast('Không tìm thấy kết quả', 2000,'red');
			}
			
		},
		error:function(res){
			var responseErr=JSON.parse(res.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}

$("#filter-video").on('click', function(){
	pageFilter="";
	$("#list-video-upload").html("");
	$("#showmore").hide();
	$("#showmore-filter").show();
	loadVideoFromFilter();
})

$("#showmore-filter").on('click', function(){
	loadVideoFromFilter();
})

function getVideoToDelete(videoId){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/video";
	$.ajax({
		url:VIDEO_API+"/"+videoId,
		type:"GET",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			$("#hidden-videoid-delete").val(videoId)
		},
		error:function(res){
			var resErr=JSON.parse(res)
			Materialize.toast(resErr.message, 2000, 'red')
		}
	})
}

function deleteVideo(videoID){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/video";
	$.ajax({
		url:VIDEO_API+"/"+videoID,
		type:"DELETE",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			Materialize.toast('Xóa video thành công', 2000, 'green');
			$('.modal').modal('close');
			window.location.reload();
		},
		error:function(res){
			Materialize.toast(res.message, 2000, 'red')
		}
	})
}

$("#delete-video").on('click', function(){
	deleteVideo($("#hidden-videoid-delete").val())
})

function loadUserInfo(){
	if(localStorage.getItem('access-token')!=null||localStorage.getItem('access-token')!=undefined){
		$(".btn-login").hide();
		$(".btn-register").hide();
		$(".btn-info").show();
		$("#btn-info").text(localStorage.getItem('name'));
		$("#btn-info-mobile").text(localStorage.getItem('name'));
		$(".btn-logout").show();
	}
}
loadUserInfo()

$("#btn-logout").click(function(){
	localStorage.removeItem('access-token');
	localStorage.removeItem('name');
	window.location.reload()
})

$("#btn-logout-mobile").click(function(){
	localStorage.removeItem('access-token');
	localStorage.removeItem('name');
	window.location.reload()
})

$("#btnLogin").on('click', function(){
		if(validUsername()){
			login();
			reloadPage();
		}
		else{
			Materialize.toast('Nhập thông tin đăng nhập', 2000, 'red');
		}
	});

	$("#btnClose").click(function(){
		$("[name='username']").val("");
		$("[name='password']").val("");
	})
	//=================== login ===================//
	$("#search").keydown(function(event){
		if(event.keyCode == 13){
			var inputSearch = $("#search").val();
			$("#list-video").html("");
			$("#showmore").hide();
			$("#showmore-search").show();
			loadVideoSearch(inputSearch);
		}
	});

	loadUserInfo();

	function reloadPage(){
		setTimeout(function(){window.location.reload()},2000);
	}
	// getListenVideo()

//===================validate login ===================//
$("[name='username']").keydown(function(event){
	if(event.keyCode==9){
		validUsername();
	}
})

function validUsername(){
	if($("[name='username']") == null
		||$("[name='username']")== undefined
		||$("[name='username']").val().length < 7
		||$("[name='username']").val().length == 0){
		var $toastContent = $('<span>Tài khoản phải lớn hơn 7 kí tự và không được để trống</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
	Materialize.toast($toastContent, 2000, 'red');
	return false;	
}
return true;
}
//===================validate login ===================//
//=================== Xử lý request server login ===================//
var LOGIN_API="https://api-challenger-2018.herokuapp.com/_api/v1/authenticate";
function login(){
	var userLogin={
		username:$("[name='username']").val(),
		password:$("[name='password']").val()
	};
	$.ajax({
		url:LOGIN_API,
		type:"POST",
		data:JSON.stringify(userLogin),
		headers:{
			'content-type':'application/json'
		},
		success:function(response){
			localStorage.setItem("access-token", response.token);
			localStorage.setItem("name", response.username);
			Materialize.toast('Đăng nhập thành công', 2000, 'green');
		},
		error:function(response){
			var responseErr=JSON.parse(response.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}
//=================== Xử lý request server login ===================//


