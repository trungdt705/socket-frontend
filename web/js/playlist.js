$(document).ready(function () {
	$("#save-playlist").click(function(){
		if(validPlaylistName()){
			createPlaylist();
			$("#name").val("");
			$("#description").val("");
			$("#thumbnail").val("")
		}
	})

	$("#name").keydown(function(event){
		if(event.keyCode==9){
			validPlaylistName();
		}
	})

	$("#reset").click(function(){
		$("#name").val("");
		$("#description").val("");
		$("#thumbnail").val("")
	})
	//========Lấy danh sách playlist=======//
	if(localStorage.getItem('access-token')!=null){
		getPlaylist();
		$(".checkuser").show();
	}else{
		Materialize.toast('Bạn cần đăng nhập để sử dụng chức năng này', 3000,'red')
		$(".checkuser").hide();
	}
	

	$("[href='#playlist']").click(function(){
		removeTabEditPlaylist();
		$("[href='#playlist']").attr('class', 'active');
	})

	$("[href='#add-playlist']").click(function(){
		removeTabEditPlaylist();
		$("[href='#add-playlist']").attr('class', 'active');
	})

	$("#btn-edit-playlist").on('click', function(){
		editPlaylist($("#hidden-playlistid").val())
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

	loadUserInfo()

	function reloadPage(){
		setTimeout(function(){window.location.reload()},2000);
	}

})

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
};


function validPlaylistName(){
	if($("#name")==null||$("#name")==undefined||$("#name").val().length < 7){
		Materialize.toast('Tên playlist phải lớn hơn 7 kí tự', 2000, 'red')
		return false;
	}
	return true;
}

function createPlaylist(){
	var PLAYLIST_API = "https://api-challenger-2018.herokuapp.com/_api/v1/playlist";
	var playlist = {
		name:$("#name").val(),
		description:$("#description").val(),
		thumbnail:$("#thumbnail").val(),
	};
	$.ajax({
		url:PLAYLIST_API,
		type:"POST",
		data:JSON.stringify(playlist),
		headers:{
			"content-type":"application/json",
			"authorization":localStorage.getItem("access-token")
		},
		success:function(res){
			Materialize.toast('Tạo playlist thành công', 2000, 'green')
			setTimeout(function(){window.location.reload()},1000);
		},
		error:function(res){
			var resErr=JSON.parse(res)
			Materialize.toast(resErr.message, 2000, 'red')
		}
	})
}

var limit=getUrlParameter('maxResult');
var page=getUrlParameter('page');

function getPlaylist(id){
	var PLAYLIST_API = "https://api-challenger-2018.herokuapp.com/_api/v1/playlist?page="+page+"&maxResult="+limit;
	$.ajax({
		url:PLAYLIST_API,
		type:"GET",
		headers:{
			"content-type":"application/json",
			"authorization":localStorage.getItem("access-token")
		},
		success:function(res){
			console.log(res)
			var totalItem=res.meta.totalItem;
			var limit=res.meta.limit;
			for (var i = 0; i < res.data.length; i++) {
				var playlistId=res.data[i].playlistId;
				var thumbnail=res.data[i].thumbnail;
				var description=res.data[i].description;
				var name=res.data[i].name;
				generatePlaylist(playlistId, thumbnail,description,name);			
			}
			pagination(parseInt(page), parseInt(limit), parseInt(res.meta.totalPage));
		},
		error:function(res){
			var resErr=JSON.parse(res);
			Materialize.toast(resErr.message, 2000, 'red')
		}
	})
}

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

function generatePlaylist(playlistId, thumbnail,description,name){
	html="";
	html+=	'<div class="col xl3 l3 m6 s12">';
	html+=		'<div class="card">';
	html+=			'<div class="card-image waves-effect waves-block waves-light img-playlist hoverable" >';
	html+=				'<a onclick="getPlaylistToEdit(\''+playlistId+'\')"><i class="material-icons small edit blue-text">create</i></a>';
	html+=				'<a onclick="getPlaylistToDelete(\''+playlistId+'\')" class="modal-trigger" href="#modal"><i class="material-icons small delete red-text">clear</i></a>';
	html+=				'<a><img class="activator image" src="'+ thumbnail +'" style="max-height:165px;"></a>';
	html+=			'</div>';
	html+=			'<div class="card-content">';
	html+=				'<div class="card-title activator grey-text text-darken-4 truncate">'+ name +'</div><i class="activator material-icons right" style="cursor:pointer">more_vert</i>';
	html+=				'<p><a href="video.html?playlistId='+playlistId+'&page=1&maxResult=3">Xem danh sách video</a></p>';
	html+=			'</div>';
	html+=			'<div class="card-reveal">';
	html+=				'<span class="card-title grey-text text-darken-4">'+ name +'<i class="material-icons right">close</i></span>';
	html+=				'<p>'+ description +'</p>';
	html+=			'</div>';
	html+=		'</div>';
	html+=	'</div>';
	$("#list-playlist").append(html);
}

function removeTabEditPlaylist(){
	$("[href='#edit-playlist']").hide();
}

function createTabEditPlaylist(){
	$("[href='#edit-playlist']").show();
	$("[href='#edit-playlist']").attr('class', 'active');
	$("[href='#edit-playlist']").click();
	$("[href='#playlist']").removeAttr('class');
	$("[href='#edit-playlist']").show();
}

function getPlaylistToEdit(id){
	createTabEditPlaylist();
	var PLAYLIST_API="https://api-challenger-2018.herokuapp.com/_api/v1/playlist";
	$.ajax({
		url:PLAYLIST_API+"/"+id,
		type:"GET",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			$(function() {
    			Materialize.updateTextFields();
			});
			$("#hidden-playlistid").val(res.playlistId)
			$("#edit-name").val(res.name);
			$("#edit-description").val(res.description);
			$("#edit-thumbnail").val(res.thumbnail);
		},
		error:function(res){
			console.log(res)
			var resErr=JSON.parse(res)
			Materialize.toast(resErr.message, 2000, 'red')
		}
	})
}

function getPlaylistToDelete(id){
	var PLAYLIST_API="https://api-challenger-2018.herokuapp.com/_api/v1/playlist";
	$.ajax({
		url:PLAYLIST_API+"/"+id,
		type:"GET",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			$("#hidden-playlistid-delete").val(res.playlistId)
		},
		error:function(res){
			var resErr=JSON.parse(res)
			Materialize.toast(resErr.message, 2000, 'red')
		}
	})
}

function deletePlaylist(id){
	var PLAYLIST_API="https://api-challenger-2018.herokuapp.com/_api/v1/playlist";
	$.ajax({
		url:PLAYLIST_API+"/"+id,
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

$("#delete-playlist").on('click', function(){
	deletePlaylist($("#hidden-playlistid-delete").val())
})

function editPlaylist(id){
	var PLAYLIST_API="https://api-challenger-2018.herokuapp.com/_api/v1/playlist";
	var playlist = {
		name: $("#edit-name").val(),
		description:$("#edit-description").val(),
		thumbnail: $("#edit-thumbnail").val(),
	};
	$.ajax({
		url:PLAYLIST_API+"/"+id,
		type:"PUT",
		data:JSON.stringify(playlist),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			Materialize.toast('Cập nhật playlist thành công', 2000, 'green');
			setTimeout(function(){window.location.reload()},2000);
		},
		error:function(res){
			var resErr=JSON.parse(res);
			Materialize.toast(resErr.message, 2000, 'red');
		}
	})
}

function resetCreatePlaylist(){
	$("[name='name']").val("");
	$("[name='description']").val("");
	$("[name='thumbnail']").val("");
}

$("#reset").on('click', function(){
	resetCreatePlaylist()
})

function resetEditPlaylist(){
	$("[name='edit-name']").val("");
	$("[name='edit-description']").val("");
	$("[name='edit-thumbnail']").val("");
}

$("#btn-reset").on('click', function(){
	resetEditPlaylist()
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

$("#btn-logout-mobile").click(function(){
	localStorage.removeItem('access-token');
	localStorage.removeItem('name');
	window.location.reload()
})


$("#btn-logout").click(function(){
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
			Materialize.toast('Đăng nhập thành công', 2000, 'green');
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
