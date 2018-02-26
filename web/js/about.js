$(document).ready(function(){
	//======================= Login =======================//
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

	$("#btnClose").click(function(){
		$("[name='username']").val("");
		$("[name='password']").val("");
	})

	loadUserInfo();

	function reloadPage(){
		setTimeout(function(){window.location.reload()},2000);
	}

	$("[name='username']").keydown(function(event){
		if(event.keyCode==9){
			validUsername();
		}
	})

	$("[name='password_chat']").keydown(function(e){
		if(e.keyCode == 13){
			loginChat();
			reloadPage();
		}
	})

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
	//======================= Login =======================//
	var token = localStorage.getItem('access-token')
	var userId = localStorage.getItem('userId')
	var socket = io("https://api-challenger-2018.herokuapp.com?token="+token);

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
socket.on('server-send-chat-from-admin', function(data){
	renderChatFromAdmin(data.thumbnail, data.content)
})

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

$("#btn-chat").click(function(){
	// getChat();
	$(".chatbox1").show(1000);
	$("#btn-chat").hide();
})
$("#btn-turn-off-chat").click(function(){
	$(".chatbox1").hide(1000);
	$("#btn-chat").show();
})

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
			var resSucc=JSON.parse(res)
			console.log(resSucc.info.thumbnail)
			renderChatToAdmin(resSucc.info.thumbnail, resSucc.info.chatContent)
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
			console.log(JSON.parse(res));
		},
		error:function(res){
			console.log(res)
		}
	})
}

})
