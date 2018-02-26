$(document).ready(function () {
	$("[name='username']").keydown(function(event){
		if(event.keyCode==9){
			validUsername();
		}
	})

	$("[name='password']").keydown(function(event){
		if(event.keyCode==9){
			validPassword();
		}
	})

	$("[name='repassword']").keydown(function(event){
		if(event.keyCode==9){
			validRepassword();
		}
	})

	$("[name='email']").keydown(function(event){
		if(event.keyCode==9){
			validEmail();
		}
	})

	$("[name='fullname']").keydown(function(event){
		if(event.keyCode==9){
			validFullname();
		}
	})

	$("#policy").click(function(){
		validPolicy();
	})

	$("#register").click(function(){
		if(validForm()){
			registerMember();
		}
		else{
			var $toastContent = $('<span>Hãy điền đầy đủ thông tin</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
			Materialize.toast($toastContent,2000);
		}
	})
	$("#gender").change(function(){
		return;
	})
})

//Check username
function validUsername(){
	if($("[name='username']") == null
		||$("[name='username']")== undefined
		||$("[name='username']").val().length < 7
		||$("[name='username']").val().length == 0){
		var $toastContent = $('<span>Tài khoản phải lớn hơn 7 kí tự và không được để trống</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
		Materialize.toast($toastContent,2000,'red');
		return false;	
	}else{
		return true;
	}
}
// Check Password
function validPassword(){
	if($("[name='password']") == null
		||$("[name='password']") == undefined
		||$("[name='password']").val().length < 7
		||$("[name='password']").val().length == 0){
		var $toastContent = $('<span>Mật khẩu phải lớn hơn 7 kí tự và không được để trống</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
	Materialize.toast($toastContent,2000,'red');
	return false;
	}
	return true;
}
//Check repassword
function validRepassword(){
	if($("[name='repassword']") == null
		||$("[name='repassword']") == undefined
		||$("[name='repassword']").val() != $("[name='password']").val()){
		Materialize.toast('Không trùng mật khẩu',2000,'red');
		return false;
	}else{
		return true;
	}
}
//Check birthday
function validBirthday(){
	if($("[name='birthday']") == null
		||$("[name='birthday']") == undefined
		||$("[name='birthday']").val().length == 0){
		var $toastContent = $('<span>Ngày sinh không được để trống</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
	Materialize.toast($toastContent, 2000, 'red');
	return false;
	}else{
		return true;
	}
}
//Check email
function validEmail(){
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var flag = re.test($("[name='email']").val())
	if(flag 
		&& $("[name='email']") != null 
		&& $("[name='email']") != undefined
		&& $("[name='email']").val().length > 0){
		return true;
	}
	else{
		var $toastContent = $('<span>Nhập đúng email</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
		Materialize.toast($toastContent,2000,'red');
		return false;
	}
}
//check fullname
function validFullname(){
	if($("[name='fullname']") == null
		||$("[name='fullname']") == undefined
		||$("[name='fullname']").val().length == 0){
		var $toastContent = $('<span>Tên không được để trống</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
		Materialize.toast($toastContent,2000,'red');
	return false;
	}
	return true;
}
//Check Policy
function validPolicy(){
	if($("#policy")[0].checked == true){
		return true;
	}else{
		var $toastContent = $('<span>Chưa chấp nhận điều khoản sử dụng</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
		Materialize.toast($toastContent,2000,'red');
		return false;

	}
}
//Check form
function validForm(){
	return(validUsername()
		&&validPassword()
		&&validRepassword()
		&&validBirthday()
		&&validPolicy()
		&&validEmail()
		&&validFullname())
}

function registerMember(){
	var REGISTER_API="https://api-challenger-2018.herokuapp.com/_api/v1/members";
	var x = new Date($("[name='birthday']").val());
	var miliseconBirthday = x.getTime();
	var user = {
			'username':$("[name='username']").val(),
			'password':$("[name='password']").val(),
			'gender':$("#gender").val(),
			'birthday':miliseconBirthday,
			'email':$("[name='email']").val(),
			'fullname':$("[name='fullname']").val(),
			'thumbnail':$("[name='avatar']").val(),
			'role':2,	
	}		
	$.ajax({
		url:REGISTER_API,
		type:'POST',
		data:JSON.stringify(user),
		headers:{
			'content-type':'application/json'
		},
		success:function(response){
			Materialize.toast('Đăng kí tài khoản thành công', 2000, 'blue');
			setTimeout(function(){window.location.href="index.html"}, 2000);
			// return;
		},
		error:function(response){
			var responseError = JSON.parse(response.responseText)
			Materialize.toast(responseError.message, 2000, 'red');
		}
	})
}