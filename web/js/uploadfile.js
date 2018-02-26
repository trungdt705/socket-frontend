$(document).ready(function () {
	//============================ upload file //============================//
	$("#uploadfile").submit(function(e){
		if($("[name='txtfile']").val() != ''){
			$("#loading").show();
			e.preventDefault();
			var formdata = new FormData(this);
			$.ajax({
				url:"https://api-challenger-2018.herokuapp.com/_api/v1/upload",
				data:formdata,		
				processData:false,
				contentType: false,
				type:"POST",
				success:function(response){
					$("#loading").hide(100, function(){
						Materialize.toast('Upload thành công', 2000, 'blue')
					});
					$("[name='url']").val(response.url);						
				},
				error:function(response){
					var responseErr=JSON.parse(response.responseText);
					$("#loading").hide(100, function(){
						Materialize.toast(responseErr.message, 2000, 'red')
					});
				}
			})
		}
		else{
			Materialize.toast('Chọn file cần upload', 2000, 'red');
			return false;
		}		
	});
	//============================ upload file //============================//
	$("#uploadvideo").click(function(){
		if(validVideoName()){
			uploadFile();
		}
		else{
			Materialize.toast('Điền thông tin video trước khi up', 2000, 'red');
		}		
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
var keywordArray=[];
$("[name='keywords']").keydown(function(event){
	if(event.keyCode==9){		
		keywordArray = $("[name='keywords']").val().split(/(?:,| )+/);
	}
})

function validVideoName(){
	if($("[name='name']")==null||$("[name='name']")==undefined||$("[name='name']").val().length < 7 || $("[name='name']").val().length==0){
		Materialize.toast('Tên video không được để trống và lớn hơn 7 kí tự', 2000, 'red');
		return false
	}
	else{
		return true
	}
}

function uploadFile(){
	var UPLOAD_API="https://api-challenger-2018.herokuapp.com/_api/v1/video";
	var videoInfo={
		'name': $("[name='name']").val(),
		'description': $("[name='description']").val(),
		'thumbnail': $("[name='thumbnail']").val(),
		'keywords': keywordArray,
		'url': $("[name='url']").val(),			
		play:{
			listened:'0',
			downloaded:'0',
			favourited:'0'
		}
	}
	$.ajax({
		url:UPLOAD_API,
		type:"POST",
		data:JSON.stringify(videoInfo),
		headers:{
			'content-type':'application/json',
			'Authorization': localStorage.getItem('access-token')
		},
		success:function(response){
			Materialize.toast('Tải bài hát lên website thành công', 2000, 'blue');
		},
		error:function(response){
			console.log(response)
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
