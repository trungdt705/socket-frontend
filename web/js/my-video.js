$(document).ready(function() {
	$("#save-video").click(function(){
		if(validVideoName()){
			createVideo();
		}
	})
	if(localStorage.getItem('access-token')!=null){
		loadPlaylist();
		loadVideo(playlistId);
	}else{
		Materialize.toast('Bạn cần đăng nhập để sử dụng chức năng này', 5000, 'red')
	}


	$("[href='#video']").click(function(){
		removeTabEditVideo();
		$("[href='#video']").attr('class', 'active');
	})

	$("[href='#add-video']").click(function(){
		removeTabEditVideo();
		$("[href='#add-video']").attr('class', 'active');
	})

	$("#btn-edit-video").on('click', function(){
		editVideo($("#hidden-videoid").val(), reloadPage)
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
		$("[name='password']").val("")
	})

	loadUserInfo();

	function reloadPage(){
		setTimeout(function(){window.location.reload()},2000);
	}
})

function validVideoName(){
	if($("#name") == null||$("#name")==undefined||$("#name").val().length < 7){
		Materialize.toast('Tên video không được để trống và lớn hơn 7 kí tự', 2000, 'red');
		return false;
	}
	return true;
}

// $("#select").change(function(){
// 	console.log($("#select").val())
// })

function validPlaylist(){
	if($("#select")==null||$("#select")==undefined||$("#select").val().length < 7){
		Materialize.toast('Không được bỏ trống playlist', 2000, 'red');
		return false;
	}
	return true;
}

$("#name").keydown(function(event){
	if(event.keyCode==9){
		console.log($("#name").val().length)
		validVideoName();
	}
})
//==================load danh sách playlist=======================//
function loadPlaylist(){
	var PLAYLIST_API = "https://api-challenger-2018.herokuapp.com/_api/v1/playlist";
	$.ajax({
		url:PLAYLIST_API,
		type:"GET",
		headers:{
			"content-type":"application/json",
			"authorization":localStorage.getItem("access-token")
		},
		success:function(res){
			for (var i = 0; i < res.data.length; i++) {
				var playlistId=res.data[i].playlistId;
				var name=res.data[i].name;
				generatePlaylist(playlistId, name)
			}
		},
		error:function(res){
			var resErr=JSON.parse(res);
			Materialize.toast(resErr.message, 2000, 'red');
		}
	})
}
//==================load danh sách playlist=======================//
//======================render HTML danh sách playlist==================//
function generatePlaylist(playlistId, name){
	html="";
	html+=	'<option value="'+ playlistId +'">'+name+'</option>';
	$("#select").append(html);
	$("#select").material_select();
}
//======================render HTML danh sách playlist==================//

//========================Tạo video======================//
function createVideo(){
	var MYVIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/member-video";
	var video = {
			videoWebsiteId:$("#videoid").val(),
			name: $("#name").val(),
			description:$("#description").val(),
			keywords: $("#keywords").val(),
			url: $("#url").val(),
			playlistId:$("#select").val(),
			thumbnail: $("#thumbnail").val(),
	};
	$.ajax({
		url:MYVIDEO_API,
		type:"POST",
		data:JSON.stringify(video),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			Materialize.toast('Tạo video thành công', 2000, 'red');
		},
		error:function(res){
			var resErr=JSON.parse(res);
			Materialize.toast(resErr.message, 2000, 'red');
		}
	})
}
//========================Tạo video======================//

//=====Hàm lấy parameter cua url==========//
function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
	sURLVariables = sPageURL.split('&'),
	sParameterName,
	i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
}
//=====Hàm lấy parameter cua url==========//
// lấy id play list từ url
var playlistId=getUrlParameter('playlistId');
//==============================load danh sách video===============================//

var limit=getUrlParameter('maxResult');
var page=getUrlParameter('page');

function loadVideo(id){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/member-video";
	$.ajax({
		url:VIDEO_API+'?playlistId='+playlistId+'&page='+page+'&maxResult='+limit,
		type:'GET',
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			for (var i = 0; i < res.data.length; i++) {
				var videoId=res.data[i].videoId
				var videoWebsiteId = res.data[i].videoWebsiteId;
				var name = res.data[i].name;
				var thumbnail = res.data[i].thumbnail;
				var updatedAt=res.data[i].updatedAt;
				var date = new Date();
				date.setTime(updatedAt);
				var formatDate=(date.getDate()+"/"+date.getMonth()+1+"/"+date.getFullYear());
				generateVideoHTML(videoWebsiteId, name, thumbnail,formatDate, playlistId,videoId);	
			}
			pagination(parseInt(page), parseInt(limit), parseInt(res.meta.totalPage), playlistId);
			Materialize.toast('Tải video thành công', 2000, 'green');		
		},
		error:function(res){
			var resErr=JSON.parse(res);
			Materialize.toast(resErr.message, 2000, 'red');
		}
	})
}
//==============================load danh sách video===============================//

function pagination(page, limit, totalPage, playlistId){
	console.log(isNaN(page) && isNaN(limit))
	if(isNaN(page) && isNaN(limit)){
		$('.pagination').text("");
		return;
	}
	page=parseInt(page)
	var paginateContent = '';
	if(page > 1){
		paginateContent += '<li class="waves-effect"><a href="video.html?playlistId='+playlistId+'&page=' + (page - 1) + '&maxResult=' + limit + '"><i class="material-icons">chevron_left</i></a></li>';
	}
	if(page > 2){
		paginateContent += '<li class="waves-effect"><a href="video.html?playlistId='+playlistId+'&page=' + (page - 2) + '&maxResult=' + limit + '">' + (page - 2) + '</a></li>';
	}
	if(page > 1){
		paginateContent += '<li class="waves-effect"><a href="video.html?playlistId='+playlistId+'&page=' + (page - 1) + '&maxResult=' + limit + '">' + (page - 1) + '</a></li>';
	}
	paginateContent += '<li class="waves-effect active pink darken-1 white-text"><a href="video.html?playlistId='+playlistId+'&page=' + page + '">' + page + '</a></li>';			
	if(totalPage > page){
		paginateContent += '<li class="waves-effect"><a href="video.html?playlistId='+playlistId+'&page=' + (page + 1) + '&maxResult=' + limit + '">' + (page + 1) + '</a></li>';	
	}
	if((totalPage - 1) > page){
		paginateContent += '<li class="waves-effect"><a href="video.html?playlistId='+playlistId+'&page=' + (page + 2) + '&maxResult=' + limit + '">' + (page + 2) + '</a></li>';	
	}
	if(page < totalPage){
		paginateContent += '<li class="waves-effect"><a href="video.html?playlistId='+playlistId+'&page=' + (page + 1) + '&maxResult=' + limit + '"><i class="material-icons">chevron_right</i></a></li>';
	}

	$('.pagination').html(paginateContent);
}

function activeLink(){
    var x = $(".pagination li");
    console.log(x.length)
    for(i = 0; i < x.length; i++){
        if((i+1)==page){
        	var k=i+1;
            $('#'+k).attr('class', 'active');
        }
    }    
}

//==========================render ra HTML danh sách video===========================//
function generateVideoHTML(videoWebsiteId, name, thumbnail,formatDate, playlistId,videoId){
	html="";
	html+=	'<div class="col xl3 l3 s12 m6">';
	html+=		'<div class="card">';
	html+=			'<div class="card-image">';
	html+=				'<a class="waves-effect waves-light" onclick="playVideo(\'' + videoWebsiteId + '\')"><img src="'+thumbnail+'" style="max-height:170px;"></a>';
	html+=			'</div>';
	html+=			'<div class="card-content" style="overflow: hidden; height: 50px;">'+name+'</div>';
	html+=			'<div class="card-action blue-text">';
	html+=				'<a href="#" class="blue-text">Ngày upload</a><span>'+formatDate+'</span>';	
	html+=			'</div>';
	html+=			'<div class="card-action">';
	html+=				'<a onclick="getVideo(\'' + videoId + '\')" class="waves-effect waves-light btn yellow edit black-text" style="margin-right:3px;">Sửa</a>';
	html+=				'<a onclick="getVideoToDelete(\'' + videoId + '\')" class="waves-effect waves-light btn modal-trigger red accent-4 delete" href="#modal">Xóa</a>';
	html+=			'</div>';
	html+=		'</div>';
	html+=	'</div>'
	$("#list-video").append(html);
}
//==========================render ra HTML danh sách video===========================//

function playVideo(id){
	setTimeout(function(){window.location.href='play.html?videoId='+id},1000);
}

// ========================= Ajax edit video========================//

function editVideo(id, reloadPage){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/member-video";
	var video = {
			videoWebsiteId:$("#edit-videoid").val(),
			name: $("#edit-name").val(),
			description:$("#edit-description").val(),
			keywords: $("#edit-keywords").val(),
			url: $("#url").val(),
			playlistId:$("#edit-select").val(),
			thumbnail: $("#edit-thumbnail").val(),
	};
	$.ajax({
		url:VIDEO_API+"/"+id,
		type:"PUT",
		data:JSON.stringify(video),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			Materialize.toast('Cập nhật video thành công', 2000, 'green');
			reloadPage();
		},
		error:function(res){
			var resErr=JSON.parse(res);
			Materialize.toast(resErr.message, 2000, 'red');
		}
	})
}
// ========================= Ajax edit video========================//

//=============== Ẩn tab edit-video================//
function removeTabEditVideo(){
	$("[href='#edit-video']").hide();
}

function createTabEditVideo(){
	$("[href='#edit-video']").show();
	$("[href='#edit-video']").attr('class', 'active');
	$("[href='#edit-video']").click();
	$("[href='#video']").removeAttr('class');
	$("[href='#edit-video']").show();
}

//============================== Load danh sách playlist để sửa =============================//

function loadPlaylistEdit(){
	var PLAYLIST_API = "https://api-challenger-2018.herokuapp.com/_api/v1/playlist";
	$.ajax({
		url:PLAYLIST_API,
		type:"GET",
		headers:{
			"content-type":"application/json",
			"authorization":localStorage.getItem("access-token")
		},
		success:function(res){
			for (var i = 0; i < res.data.length; i++) {
				var playlistId=res.data[i].playlistId;
				var name=res.data[i].name;
				generatePlaylistEdit(playlistId, name)
			}
		},
		error:function(res){
			var resErr=JSON.parse(res)
			Materialize.toast(resErr.message, 2000, 'red')
		}
	})
}
//============================== Load danh sách playlist để sửa =============================//

function generatePlaylistEdit(playlistId, name){
	html="";
	html+=	'<option value="'+ playlistId +'">'+name+'</option>';
	$("#edit-select").append(html);
	$("#edit-select").material_select();
}
//=============================Lấy video về để sửa===============================//
function getVideo(videoID){
	loadPlaylistEdit();
	createTabEditVideo();
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/member-video";
	$.ajax({
		url:VIDEO_API+"/"+videoID,
		type:"GET",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			// Cho các label của form input lên trên cho không bị chèn chữ
			$(function() {
    			Materialize.updateTextFields();
			});
			$("#hidden-videoid").val(res.videoId)
			$("#edit-videoid").val(res.videoWebsiteId);
			$("#edit-name").val(res.name);
			$("#edit-description").val(res.description);
			$("#edit-thumbnail").val(res.thumbnail);
			$("#edit-url").val(res.url);
			$("#edit-keywords").val(res.keywords);
			$("#select").val(res.playlistId);

		},
		error:function(res){
			var resErr=JSON.parse(res)
			Materialize.toast(resErr.message, 2000, 'red')
		}
	})
}
//=============================Lấy video về để sửa===============================//

//=============================== Lấy Id video về để xóa ===============================//
function getVideoToDelete(videoId){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/member-video";
	$.ajax({
		url:VIDEO_API+"/"+videoId,
		type:"GET",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			$("#hidden-videoid-delete").val(res.videoId)
		},
		error:function(res){
			var resErr=JSON.parse(res)
			Materialize.toast(resErr.message, 2000, 'red')
		}
	})
}
//=============================== Lấy Id video về để xóa ===============================//
//================================Ajax Xóa video ================================//
function deleteVideo(videoID){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/member-video";
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
			var resErr=JSON.parse(res)
			Materialize.toast(resErr.message, 2000, 'red')
		}
	})
}
//================================Ajax Xóa video ================================//

//================================Xóa video================================//
$("#delete-video").on('click', function(){
	deleteVideo($("#hidden-videoid-delete").val())
})
//================================Xóa video================================//

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
			Materialize.toast('Đăng nhập thành công', 2000, 'red');
		},
		error:function(response){
			var responseErr=JSON.parse(response.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}

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




