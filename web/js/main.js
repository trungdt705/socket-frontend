$(document).ready(function(){
	//===================Bắt đầu login ===================//
	$("#btnLogin").on('click', function(){
		//Kiểm tra xem nếu validate ok sẽ login không thi thông báo cho ng dùng
		if(validUsername()){
			login();
			reloadPage();
		}
		else{
			Materialize.toast('Nhập thông tin đăng nhập', 2000, 'red');
		}
	});

	$("[name='password_chat']").keydown(function(e){
		if(e.keyCode == 13){
			loginChat();
			reloadPage();
		}
	})
	//Bắt sự kiện cho nút close(dóng form đăng nhập) sẽ xóa giá trị lưu trong input user và password
	$("#btnClose").click(function(){
		$("[name='username']").val("");
		$("[name='password']").val("");
	})
	//===================Kết thúc login ===================//
	$("#search").keydown(function(event){
		if(event.keyCode == 13){
			var inputSearch = $("#search").val();
			$("#list-video").html("");
			$("#showmore").hide();
			$("#showmore-search").show();
			loadVideoSearch(getLikeVideo, inputSearch, loadPlaylist);
		}
	});
	var page = "";
	loadVideo(getLikeVideo,loadPlaylist);

	$("#showmore").on('click', function(){
		loadVideo(getLikeVideo,loadPlaylist);
	})
	//Hàm gọi thông tin user
	loadUserInfo();

	function reloadPage(){
		setTimeout(function(){window.location.reload()},2000);
	}
	// getListenVideo()

	$("#btn-chat").click(function(){
		// getChat();
		$(".chatbox1").show(1000);
		$("#btn-chat").hide();
	})
	$("#btn-turn-off-chat").click(function(){
		$(".chatbox1").hide(1000);
		$("#btn-chat").show();
	})
})
//============================Push notification socket io============================//
var token = localStorage.getItem('access-token')
var userId = localStorage.getItem('userId')
if(token != null|| token != undefined){
	var socket = io("https://api-challenger-2018.herokuapp.com?token="+token)
//Lắng nghe sự kiện server phản hồi khi có thông báo từ admin
	socket.on('server-response-noti', function(data){
		if(data.userId == localStorage.getItem('userId')){
			var numbernoti = parseInt($("#number-noti").text())+1
			$("#number-noti").html("");
			$("#number-noti").append(numbernoti);
			Materialize.toast('Bạn có 1 tin nhắn mới',2000, 'green')
			generateNotificationQuick(data.videoWebsiteId, data.noti, data.notiId)
		}else{
			return;
		}
	})
	//Lắng nghe sự kiện server phản hồi connect để lây danh sách thông báo
	socket.on('reconnect', function(data){
		console.log(data)
		for (var i = 0; i < data.length; i++) {
			var contentNoti=data[i].contentNoti;
			var notiId=data[i].notiId;
			var videoWebsiteId=data[i].videoWebsiteId;
			generateNotification(videoWebsiteId,contentNoti, notiId)
		}
		$("#number-noti").append(data.length)
	});

	socket.on('server-uncheck-noti', function(data){
		if($('.li'+data.notiId).length!=0){
			$('.li'+data.notiId).hide();
			var numbernoti = parseInt($("#number-noti").text())-1;
			$("#number-noti").html("");
			$("#number-noti").append(numbernoti);
		}	
	})
}

function generateNotification(videoWebsiteId,contentNoti, notiId){
	html="";
	html+='<li class="li'+notiId+'"><a id="'+notiId+'" onclick="checkNoti(\''+notiId+'\',\''+videoWebsiteId+'\', redirectPlayPage)"><i class="tiny material-icons" id="i'+notiId+'">brightness_1</i>'+contentNoti+'</a></li>';
	html+='<li class="divider li'+notiId+'"></li>';
	$("#notification").append(html);
}

function generateNotificationQuick(videoWebsiteId,contentNoti, notiId){
	html="";
	html+='<li class="li'+notiId+'"><a onclick="checkNoti(\''+notiId+'\',\''+videoWebsiteId+'\',redirectPlayPage)"><i class="tiny material-icons" id="i'+notiId+'">brightness_1</i>'+contentNoti+'</a></li>';
	html+='<li class="divider li'+notiId+'"></li>';
	$("#notification").prepend(html)
}

function redirectPlayPage(videoWebsiteId){
	window.location.href="play.html?videoId="+videoWebsiteId
}

function checkNoti(id,videoWebsiteId, redirectPlayPage){
	var CHECK_NOTI_API="https://api-challenger-2018.herokuapp.com/_api/v1/admin/noti_video"	
	var noti={
		status:2
	}
	$.ajax({
		url:CHECK_NOTI_API+"/"+id,
		type:"PUT",
		data:JSON.stringify(noti),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			$('#i'+id).hide();
			var numbernoti = parseInt($("#number-noti").text())-1;
			$("#number-noti").html("");
			$("#number-noti").append(numbernoti);
			redirectPlayPage(videoWebsiteId);
		},
		error:function(res){
			console.log(res)
		}
	})
}

//============================Push notification socket io============================//

//=========================Bắt đầu Chat socketIO==========================//

//Phát ra sự kiện có người dùng chat
var token=localStorage.getItem('access-token');
if(token != null || token != undefined){
	socket.emit('user-join-room-myself', localStorage.getItem('userId'));
	$("#login_chat").hide();
}
$("#txtChat").keydown(function(e){
	if(e.keyCode == 13 && (token!=null||token!=undefined)){
		saveChat($(this).val());
		var infoUserSendServer={
			content: $("#txtChat").val(),
			createdAt:Date.now()
		};
		socket.emit('user-chat-admin', infoUserSendServer);
			// var thumbnail=localStorage.getItem('thumbnail');
			// renderChatToAdmin(thumbnail, $("#txtChat").val())
			$("#txtChat").val("");
			console.log($(".chatbox").children().length)
			if($(".chatbox").children().length <= 1){
				saveConversation()
			}
		}else if(e.keyCode == 13){
			Materialize.toast('Bạn cần đăng nhập để có thể phản hồi với chúng tôi', 2000, 'red')
		}
	})
	//Lắng nghe sự kiện phía admin chat lại
	if(token != null || token != undefined){
		socket.on('server-send-chat-from-admin', function(data){
			renderChatFromAdmin(data.thumbnail, data.content)
		})
	}
	function renderChatToAdmin(thumbnail, content){
		console.log(thumbnail)
		var html="";
		html+='<div class="row purple lighten-4 message-chat" style="margin:10px 10px 10px; border-radius:5px;">';
		html+=		'<div class="col xl2 l2 m2 s2" style="margin: 0 5px;">';
		html+=			'<img src="'+thumbnail+'" style="width: 40px; height: 40px; border-radius: 5px;">';
		html+=		'</div>';
		html+=		'<div class="col xl9 l9 m9 s9" style="border-radius:5px;">'+content+'</div>';
		html+='</div>'
		$(".chatbox").append(html);
	}

	function renderChatFromAdmin(thumbnail, content){
		var html="";
		html+='<div class="row purple lighten-5" style="margin:10px 10px 10px; border-radius:5px;">';
		html+=	'<div class="col xl9 l9 m9 s9 left-align">'+content+'</div>'	
		html+=	'<div class="col col xl2 l2 m2 s2 right-align" style="margin: 0 5px;">';
		html+=		'<img src="'+thumbnail+'" style="width: 40px; height: 40px; border-radius: 5px;">';
		html+=	'</div>';
		html+='</div>'
		$(".chatbox").append(html);
	}

	//api lưu nội dung chat vào db
	function saveChat(content){
		var userId = localStorage.getItem('userId');
		var CHAT_API='https://api-challenger-2018.herokuapp.com/_api/v1/chat';
		var chat={
			conversationId:userId,
			userId:userId,
			chatContent:content,
			role:2
		}
		$.ajax({
			url:CHAT_API,
			type:'POST',
			data:JSON.stringify(chat),
			headers:{
				'content-type':'application/json',
				'authorization':localStorage.getItem('access-token')
			},
			success:function(res){
				console.log(res.info.thumbnail)
				renderChatToAdmin(res.info.thumbnail, res.info.chatContent)
			},
			error:function(res){
				console.log(res)
			}
		})
	}

	if(localStorage.getItem('access-token') != null 
		|| localStorage.getItem('access-token') != undefined){
		getChat()
}
function getChat(){
	var userId = localStorage.getItem('userId');
	var CHAT_API='https://api-challenger-2018.herokuapp.com/_api/v1/chat';
	$.ajax({
		url:CHAT_API+"/"+userId,
		type:'GET',
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			for (var i = 0; i < res.data.length; i++) {
				if(userId == res.data[i].userId && res.data[i].role==2){
					renderChatToAdmin(res.data[i].thumbnail, res.data[i].chatContent)
				}else{
					renderChatFromAdmin(res.data[i].thumbnail, res.data[i].chatContent)
				}	
			}	
		},
		error:function(res){
			console.log(res)
		}
	})
}
//Lưu cuộc hội thoại
function saveConversation(){
	var CONVERSATION_API='https://api-challenger-2018.herokuapp.com/_api/v1/conversation';
	var conversation = {
		conversationId:localStorage.getItem('userId'),
		username:localStorage.getItem('name')
	}
	$.ajax({
		url:CONVERSATION_API,
		type:'POST',
		data:JSON.stringify(conversation),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			console.log(res);
		},
		error:function(res){
			console.log(res)
		}
	})
}

//=========================Kết thúcChat socketIO==========================//

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
			console.log(response)
			localStorage.setItem("thumbnail", response.thumbnail);
			localStorage.setItem("access-token", response.token);
			localStorage.setItem("name", response.username);
			localStorage.setItem("userId", response.userId);
			Materialize.toast('Đăng nhập thành công', 2000, 'green');
		},
		error:function(response){
			var responseErr=JSON.parse(response.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}

function loginChat(){
	var userLogin={
		username:$("[name='username_chat']").val(),
		password:$("[name='password_chat']").val()
	};
	$.ajax({
		url:LOGIN_API,
		type:"POST",
		data:JSON.stringify(userLogin),
		headers:{
			'content-type':'application/json'
		},
		success:function(response){
			console.log(response)
			localStorage.setItem("thumbnail", response.thumbnail);
			localStorage.setItem("access-token", response.token);
			localStorage.setItem("name", response.username);
			localStorage.setItem("userId", response.userId);
			Materialize.toast('Đăng nhập thành công', 2000, 'green');
		},
		error:function(response){
			var responseErr=JSON.parse(response.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}

$("[name='username_chat']").keydown(function(event){
	if(event.keyCode==9){
		validUsernameChat();
	}
})

function validUsernameChat(){
	if($("[name='username_chat']") == null
		||$("[name='username_chat']")== undefined
		||$("[name='username_chat']").val().length < 7
		||$("[name='username_chat']").val().length == 0){
		var $toastContent = $('<span>Tài khoản phải lớn hơn 7 kí tự và không được để trống</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
	Materialize.toast($toastContent, 2000, 'red');
	return false;	
}
return true;
}

//=================== Xử lý request server login ===================//

//=========================== Xử lý load video===========================//
var page = 1;
function loadVideo(getLikeVideo,loadPlaylist){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/video?page="+page+"&maxResult=4";
	$.ajax({
		url:VIDEO_API,
		type:'GET',
		success:function(res){
			console.log(res)
			page = parseInt(res.meta.page)+1;
			console.log(res.meta.page)
			console.log(page)
			if(res.data!=""){
				for (var i = 0; i < res.data.length; i++) {
					var videoWebsiteId = res.data[i].videoWebsiteId;
					var name = res.data[i].name;
					var thumbnail = res.data[i].thumbnail;
					var listened = res.data[i].play.listened;
					var favourited = res.data[i].play.favourited;
					var url = res.data[i].url;
					generateVideoHTML(videoWebsiteId, name, thumbnail, listened,favourited, url);
					if(localStorage.getItem('access-token')!=null||localStorage.getItem('access-token')!=undefined)	
						getLikeVideo();
					loadPlaylist(videoWebsiteId, generatePlaylist);
					$('select').material_select();

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

var pageSearch="";
function loadVideoSearch(getLikeVideo, inputSearch, loadPlaylist){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/video?search= "+ inputSearch + " &page="+pageSearch+"&maxResult=4";
	$.ajax({
		url:VIDEO_API,
		type:'GET',
		success:function(res){
			pageSearch = parseInt(res.meta.page)+1;
			if(res.data!=""){
				for (var i = 0; i < resSucc.data.length; i++) {
					var videoWebsiteId = res.data[i].videoWebsiteId;
					var name = res.data[i].name;
					var thumbnail = res.data[i].thumbnail;
					var listened = res.data[i].play.listened;
					var favourited = res.data[i].play.favourited;
					var url = res.data[i].url;
					generateVideoHTML(videoWebsiteId, name, thumbnail, listened,favourited,url);
					if(localStorage.getItem('access-token')!=null||localStorage.getItem('access-token')!=undefined)	
						getLikeVideo();
					loadPlaylist(videoWebsiteId, generatePlaylist);
				}	
			}else{
				$("#showmore-search").hide();
				Materialize.toast('Không tìm thấy kết quả', 2000,'red');
			}

		},
		error:function(res){
			var responseErr=JSON.parse(res.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}

$("#showmore-search").on('click', function(){
	var inputSearch = $("#search").val();
	loadVideoSearch(getLikeVideo, inputSearch, loadPlaylist);
})

function generateVideoHTML(videoWebsiteId, name, thumbnail, listened,favourited, url){
	html="";
	html+=	'<div class="col xl3 m6 s12">'
	html+=		'<div class="card">'
	html+=			'<div class="card-image">'
	html+=				'<a class="waves-effect waves-light hoverable" onclick="checkListenVideo(\''+videoWebsiteId+'\')" download><img class="activator img-video" src="'+ thumbnail +'" style="height:180px;"></a>'
	html+=				'<a class="btn-floating halfway-fab waves-effect waves-light red" onclick="checkListenVideo(\''+videoWebsiteId+'\')"><i class="material-icons">play_arrow</i></a>'
	html+=			'</div>'
	html+=			'<div class="card-content">'
	html+=				'<div>'
	html+=				'<div class="truncate">'+ name +'</div>'
	html+=					'<div>'
	html+=						'<a style="cursor:pointer;" href="'+url+'" download><i class="material-icons blue-text">file_download</i></a>'
	html+=						'<a style="cursor:pointer;" class="dropdown-button" data-activates="d'+videoWebsiteId+'" onclick="checkUserForLoadPlaylist()"><i class="material-icons green-text">add</i></a>'
	html+=						'<ul id="d'+videoWebsiteId+'" class="dropdown-content" style="min-width:250px;">'				
	html+=							'<li>'
	html+=								'<a class="waves-effect waves-light modal-trigger" href="playlist.html"><i class="material-icons left">add</i>Thêm playlist</a>'
	html+=							'</li>'
	html+=						'</ul>'
	html+=						'<a style="cursor:pointer;" onclick="checkLikeVideo(\''+videoWebsiteId+'\')" id="s'+videoWebsiteId+'"><i class="material-icons red-text">favorite_border</i></a>'
	html+=						'<a style="cursor:pointer;display:none;" id='+videoWebsiteId+' onclick="editLikeVideo(\''+videoWebsiteId+'\')"><i class="material-icons red-text">favorite</i></a>'
	html+=					'</div>'
	html+=					'<div>'					
	html+=						'<div><a>Lượt nghe: '+ listened +'<i class="material-icons">headset</i></a></div>'
	html+=						'<div><input type="hidden" id="l'+videoWebsiteId+'" value="'+listened+'" /></div>'
	html+=						'<div><a id="a'+videoWebsiteId+'">Lượt thích: '+ favourited +'<i class="material-icons pink-text">favorite_border</i></a></div>'
	html+=						'<div><input type="hidden" id="i'+videoWebsiteId+'" value="'+favourited+'" /></div>'
	html+=					'</div>'
	html+=				'</div>'	
	html+=			'</div>'
	html+=		'</div>'
	html+=	'</div>'
	$("#list-video").append(html);
	customDropdown();
}

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

function checkLikeVideo(videoid){
	if(localStorage.getItem('access-token')!=null){
		var LIKE_API="https://api-challenger-2018.herokuapp.com/_api/v1/like-video"
		var likeVideo={
			videoWebsiteId:videoid,
			favourited:1,
			numberOfFavourited:parseInt($('#i'+videoid).val())+1
		};
		$.ajax({
			url:LIKE_API,
			type:"POST",
			data:JSON.stringify(likeVideo),
			headers:{
				'content-type':'application/json',
				'authorization':localStorage.getItem('access-token')
			},
			success:function(response){
				$('#s'+videoid).hide();
				$('#'+videoid).show();
			},
			error:function(response){
				var responseErr=JSON.parse(response.responseText)
				Materialize.toast(responseErr.message, 2000, 'red');
			}
		})
	}else{
		var $toastContent = $('<span>Bạn cần đăng nhập để sử dụng chức năng này</span><i class="material-icons right">info</i>');
		Materialize.toast($toastContent, 3000,'red');
	}		
}

function editLikeVideo(videoid){
	var flag=parseInt($('#i'+videoid).val())-1;
	$('#i'+videoid).val(flag);
	var LIKE_API="https://api-challenger-2018.herokuapp.com/_api/v1/like-video"
	var likeVideo={
		videoWebsiteId:videoid,
		numberOfFavourited:flag
	};
	$.ajax({
		url:LIKE_API+"/"+videoid,
		type:"PUT",
		data:JSON.stringify(likeVideo),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(response){
			$('#s'+videoid).show();
			$('#'+videoid).hide();
		},
		error:function(response){
			var responseErr=JSON.parse(response.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}

function getLikeVideo(){
	var LIKE_API="https://api-challenger-2018.herokuapp.com/_api/v1/like-video"
	$.ajax({
		url:LIKE_API,
		type:"GET",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(response){
			for (var i = 0; i < response.data.length; i++) {
				if(response.data[i].favourited=='1'){
					$('#s'+response.data[i].videoWebsiteId).hide();
					$('#'+response.data[i].videoWebsiteId).show();			
				}
				else{
					$('#s'+response.data[i].videoWebsiteId).show();
					$('#'+response.data[i].videoWebsiteId).hide();	
				}
			}			
		},
		error:function(response){
			var responseErr=JSON.parse(response.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}

function checkListenVideo(videoid){
	var LISTEN_API="https://api-challenger-2018.herokuapp.com/_api/v1/listen-video"
	var listenVideo={
		videoWebsiteId:videoid,
		numberOfListened:parseInt($('#l'+videoid).val())+1
	};
	$.ajax({
		url:LISTEN_API,
		type:"POST",
		data:JSON.stringify(listenVideo),
		headers:{
			'content-type':'application/json',
		},
		success:function(response){
			setTimeout(function(){window.location.href="play.html?videoId="+videoid},500);
		},
		error:function(response){
			var responseErr=JSON.parse(response.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}

function checkUserForLoadPlaylist(){
	if(localStorage.getItem("access-token")==null){
		var $toastContent = $('<span>Bạn cần đăng nhập để sử dụng chức năng này</span><i class="material-icons right">info</i>');
		Materialize.toast($toastContent, 3000,'red');
	}
}

function loadPlaylist(videoWebsiteId, generatePlaylist){
	if(localStorage.getItem("access-token")!=null){
		var PLAYLIST_API = "https://api-challenger-2018.herokuapp.com/_api/v1/playlist?page=1&maxResult=100";
		$.ajax({
			url:PLAYLIST_API,
			type:"GET",
			headers:{
				"content-type":"application/json",
				"authorization":localStorage.getItem("access-token")
			},
			success:function(res){
				for (var i = 0; i < res.data.length; i++) {			
					var playlistId = res.data[i].playlistId;
					var name=res.data[i].name;
					generatePlaylist(playlistId, name, videoWebsiteId);
				}			
			},
			error:function(res){
				console.log(res);
			}
		})
	}
}

function generatePlaylist(playlistId, name, videoWebsiteId){
	html="";
	html+='<li>'
	html+=	'<a>'
	html+=		'<input type="checkbox" id="'+videoWebsiteId+playlistId+'" onclick="getQuickvideo(\''+videoWebsiteId+'\',\''+playlistId+'\',createQuickVideo)"/>'
	html+=		'<label for="'+videoWebsiteId+playlistId+'">'+name+'</label>'
	html+=	'</a>'
	html+='</li>'
	$('#d'+videoWebsiteId).append(html);
	customDropdown();	
}

function customDropdown(){
	$('.dropdown-button').dropdown({
		inDuration: 300,
		outDuration: 225,
		constrainWidth: false,
		hover: false,
		gutter: 0,
		belowOrigin: true, 
		alignment: 'right', 
		stopPropagation: true
	});
	$('.dropdown-content').on('click', function(event) {
		event.stopPropagation();
	});
}

function getQuickvideo(videoWebsiteId, playlistId, createQuickVideo){
	var flag = $('#'+videoWebsiteId+playlistId).is(':checked');
	if(flag){
		var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/video";
		$.ajax({
			url:VIDEO_API+"/"+videoWebsiteId,
			type:'GET',
			headers:{
				'content-type':'application/json',
			},
			success:function(res){
				var name=res.name;
				var description=res.description;
				var keywords=res.keywords;
				var url=res.url;
				var thumbnail=res.thumbnail;
				createQuickVideo(videoWebsiteId, name, description, keywords, url, playlistId, thumbnail);
			},
			error:function(res){
				Materialize.toast(res.message, 2000, 'red');
			}
		})
	}else{
		deleteVideo(videoWebsiteId);
	}
}

function createQuickVideo(videoWebsiteId, name, description, keywords, url, playlistId, thumbnail){
	var MYVIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/member-video";
	var video = {
			videoWebsiteId:videoWebsiteId,
			name: name,
			description:description,
			keywords: keywords,
			url: url,
			playlistId:playlistId,
			thumbnail: thumbnail,
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
			Materialize.toast('Tạo video thành công', 2000, 'green');
		},
		error:function(res){
			var resErr=JSON.parse(res);
			Materialize.toast(resErr.message, 2000, 'red');
		}
	})
}

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
		},
		error:function(res){
			var resErr=JSON.parse(res)
			Materialize.toast(resErr.message, 2000, 'red')
		}
	})
}
//Check có đăng nhập không để upload file
$(".upload-page").click(function(){
	if(localStorage.getItem('access-token')!=null){
		window.location.href="upload.html"
	}else{
		var $toastContent = $('<span>Bạn cần đăng nhập để sử dụng chức năng này</span><i class="material-icons right">info</i>');
		Materialize.toast($toastContent, 3000,'red');
	}
})

$(".list-playlist").click(function(){
	if(localStorage.getItem('access-token')!=null){
		window.location.href="playlist.html"
	}else{
		var $toastContent = $('<span>Bạn cần đăng nhập để sử dụng chức năng này</span><i class="material-icons right">info</i>');
		Materialize.toast($toastContent, 3000,'red');
	}
})

$(".list-upload").click(function(){
	if(localStorage.getItem('access-token')!=null){
		window.location.href="list-upload.html"
	}else{
		var $toastContent = $('<span>Bạn cần đăng nhập để sử dụng chức năng này</span><i class="material-icons right">info</i>');
		Materialize.toast($toastContent, 3000,'red');
	}
})

$(".list-favourite").click(function(){
	if(localStorage.getItem('access-token')!=null){
		window.location.href="list-playlist.html"
	}else{
		var $toastContent = $('<span>Bạn cần đăng nhập để sử dụng chức năng này</span><i class="material-icons right">info</i>');
		Materialize.toast($toastContent, 3000,'red');
	}
})








