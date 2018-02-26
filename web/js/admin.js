$(document).ready(function(){
	loadVideoFirst(generateHTMLList);
	
})
//==============Lấy tham số url===============//
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
//==============Lấy tham số url===============//
//================load video lần đầu================//
function loadVideoFirst(generateHTMLList){
	window.history.pushState( {} , '', '?page=1');
	var page=getUrlParameter('page');
	var limit=$("#record").val()
	var status=$("#status").val()
	var ADMIN_API="https://api-challenger-2018.herokuapp.com/_api/v1/admin/video?fromDate="+Date.now()+"&toDate="+Date.now()+"&status="+status+"&search=&page="+page+"&maxResult="+limit
	$.ajax({
		url:ADMIN_API,
		type:'GET',
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			if(res.data!=""){
				responseVideo(res, checkStatus)
				var totalItem=parseInt(res.meta.totalItem);
				var limit=parseInt(res.meta.limit);
				loadPagination(1, limit, res.meta.totalPage);
			}else{
				$("#showmore").hide();
				Materialize.toast('Không tìm thấy kết quả', 2000,'red');
			}
		},
		error:function(res){
			console.log(res)
		}
	})
}
//================load video lần đầu================//
//function lấy các giá trị video trả về
function responseVideo(resSucc, checkStatus){
	for (var i = 0; i < resSucc.data.length; i++) {
		var videoWebsiteId = resSucc.data[i].videoWebsiteId;
		var name = resSucc.data[i].name;
		var thumbnail = resSucc.data[i].thumbnail;
		var description=resSucc.data[i].description;
		var url = resSucc.data[i].url;
		var createdAt = resSucc.data[i].createdAt;
		var userId = resSucc.data[i].userId;
		var date = new Date();
		date.setTime(createdAt);
		var formatDate=(date.getDate()+"/"+date.getMonth()+1+"/"+date.getFullYear());
		var statusRes= resSucc.data[i].status;
		var x = checkStatus(statusRes);
		generateHTMLList(i+1, videoWebsiteId, name, thumbnail, description, url, formatDate, x, loadButtonCheck, userId)	
	}
}
//Xử lý chuyển giá trị status thành chữ cái có ý nghĩa
function checkStatus(status){
	if(status=='1'){
		return status= 'Chưa kiểm duyệt'
	}else if(status=='2'){
		return status='Đã kiểm duyệt'
	}
}
// Xử lý nút Check/Uncheck
function loadButtonCheck(status, videoWebsiteId){
	if(status=='Chưa kiểm duyệt'){
		$("#c"+videoWebsiteId).show()
		$("#p"+videoWebsiteId).hide()
	}else if(status=='Đã kiểm duyệt'){
		$("#c"+videoWebsiteId).hide()
		$("#p"+videoWebsiteId).show()
	}
}
//render HTML danh sách video
function generateHTMLList(stt, videoWebsiteId, name, thumbnail, description, url, formatDate, status, loadButtonCheck, userId){
	html="";
	html+='<tr id="tr'+videoWebsiteId+'">'
	html+=	'<td>'+stt+'</td>'
	html+=	'<td>'+videoWebsiteId+'</td>'
	html+=	'<td id="n'+videoWebsiteId+'">'+name+'</td>'
	html+=	'<td id="d'+videoWebsiteId+'">'+description+'</td>'
	html+=	'<td><img id="i'+videoWebsiteId+'" src="'+thumbnail+'" width="100%"></td>'
	html+=	'<td id="u'+videoWebsiteId+'">'+formatDate+'</td>'
	html+=	'<td id="s'+videoWebsiteId+'">'+status+'</td>'
	html+=	'<td onclick="checkVideo(\''+videoWebsiteId+'\', \''+name+'\', \''+userId+'\', checkVideoNoti)" id="c'+videoWebsiteId+'" style="display:none;"><a class="waves-effect waves-light btn blue">Duyệt</a></td>'
	html+=	'<td onclick="putVideo(\''+videoWebsiteId+'\',\''+status+'\',uncheckVideoNoti)" id="p'+videoWebsiteId+'"><a class="waves-effect waves-light btn blue">Bỏ duyệt</a></td>'
	html+=	'<td onclick="getVideo(\'' + videoWebsiteId + '\')"><a class="modal-trigger waves-effect waves-light btn green edit" href="#modaledit">Sửa</a></td>'
	html+=	'<td onclick="getVideoToDelete(\'' + videoWebsiteId + '\')"><a class="modal-trigger waves-effect waves-light btn red delete" href="#modal">Xóa</a></td>'
	html+='</tr>'
	$("#list-video").append(html);
	loadButtonCheck(status, videoWebsiteId)
}
//==============Xủ lý phân trang================//
//render HTML danh sachs trang
function loadPagination(page, limit, totalPage){
	console.log(isNaN(page) && isNaN(limit))
	if(isNaN(page) && isNaN(limit)){
		$('.pagination').text("");
		return;
	}
	page = parseInt(page)
	var paginateContent = '';
	if(page > 1){
		paginateContent += '<li class="waves-effect"><a onclick = loadVideoFilter(\''+(page-1)+'\')><i class="material-icons">chevron_left</i></a></li>';
	}
	if(page > 2){
		paginateContent += '<li class="waves-effect"><a onclick = loadVideoFilter(\''+(page-2)+'\')>' + (page - 2) + '</a></li>';
	}
	if(page > 1){
		paginateContent += '<li class="waves-effect"><a onclick = loadVideoFilter(\''+(page-1)+'\')>' + (page - 1) + '</a></li>';
	}
	paginateContent += '<li class="waves-effect active pink darken-1 white-text"><a onclick = loadVideoFilter(\''+page+'\')>' + page + '</a></li>';			
	if(totalPage > page){
		paginateContent += '<li class="waves-effect"><a onclick = loadVideoFilter(\''+(page+1)+'\')>' + (page + 1) + '</a></li>';	
	}
	if((totalPage - 1) > page){
		paginateContent += '<li class="waves-effect"><a onclick = loadVideoFilter(\''+(page+2)+'\')>' + (page + 2) + '</a></li>';	
	}
	if(page < totalPage){
		paginateContent += '<li class="waves-effect"><a onclick = loadVideoFilter(\''+(page+1)+'\')><i class="material-icons">chevron_right</i></a></li>';
	}

	$('.pagination').html(paginateContent);
}
//Xử lý active trang được chọn
function activeLink(k){
	var page=getUrlParameter('page')
	var x = $(".pagination li");
	for(i = 0; i < x.length; i++){
		if((i+1) == page){
			var k = i + 1;
			$('#'+k).attr('class', 'active');
		}
	}    
}
//==============Xủ lý phân trang================//
//Xử lý sự change thay đổi số lượng bản ghi lấy về
$("#record").change(function(){
	var page = getUrlParameter('page');
	loadVideoFilter(page)
})
//Xử lý sự change thay đổi status bản ghi lấy về
$("#status").change(function(){
	var page = getUrlParameter('page');
	loadVideoFilter(page)
})


function loadVideoFilter(i){
	console.log(i)
	window.history.pushState( {} , '', '?page='+i+'');
	$("#list-video").html("")
	var limit=$("#record").val()
	var status=$("#status").val()
	var search=$("#search").val();
	var fromDate=new Date($("#fromdate").val());
	var toDate=new Date($("#todate").val());
	fromDate=fromDate.getTime();
	toDate=toDate.getTime();
	var ADMIN_API="https://api-challenger-2018.herokuapp.com/_api/v1/admin/video?fromDate="+fromDate+"&toDate="+toDate+"&status="+status+"&search="+search+"&page="+i+"&maxResult="+limit
	$.ajax({
		url:ADMIN_API,
		type:'GET',
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			if(res.data!=""){
				//function
				responseVideo(res, checkStatus)
				var totalItem=parseInt(res.meta.totalItem);
				var limit=parseInt(res.meta.limit);
				loadPagination(parseInt(i), limit, res.meta.totalPage);
			}else{
				$("#showmore").hide();
				Materialize.toast('Không tìm thấy kết quả', 2000,'red');
			}
		},
		error:function(res){
			Materialize.toast('Lỗi server', 2000,'red');
		}
	})
}
// =====================Bắt xự kiện bấm nut lọc =========================//
$("#filter").on('click', function(){
	window.history.pushState( {} , '', '?page=1');
	var page = getUrlParameter('page');	
	loadVideoFilter(page);
})
// =====================Bắt xự kiện bấm nut lọc  =========================//

// =====================Duyệt video =========================//
function checkVideo(id , name, userId, checkVideoNoti){
	checkVideoNoti(id , name, userId);
	var CHECK_VIDEO_API = "https://api-challenger-2018.herokuapp.com/_api/v1/admin/video/verify";
	var video = {
		status:2
	};
	$.ajax({
		url:CHECK_VIDEO_API+"/"+id,
		type:"PUT",
		data:JSON.stringify(video),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			$('#s'+id).text('Đã kiểm duyệt')
			$('#p'+id).show();
			$('#c'+id).hide();
		},
		error:function(res){
			console.log(res)
		}
	})
}
// =====================Duyệt video  =========================//
// =====================Bỏ Duyệt video   =========================//
function putVideo(id,status, uncheckVideoNoti){
	var notiId = $('#p'+id).attr('class');
	uncheckVideoNoti(notiId, status)
	var CHECK_VIDEO_API = "https://api-challenger-2018.herokuapp.com/_api/v1/admin/video/verify";
	var video = {
		status:1
	};
	$.ajax({
		url:CHECK_VIDEO_API+"/"+id,
		type:"PUT",
		data:JSON.stringify(video),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			//Chuyển trạng thái status
			$('#s'+id).text('Chưa kiểm duyệt')
			//Hiện nut Duyệt
			$('#c'+id).show();
			//ẩn nút bỏ duyệt
			$('#p'+id).hide();
		},
		error:function(res){
			console.log(res)
		}
	})
}
// =====================Bỏ Duyệt video   =========================//
// =====================Xóa video   =========================//
function deleteVideo(id){
	var CHECK_VIDEO_API = "https://api-challenger-2018.herokuapp.com/_api/v1/admin/video";
	$.ajax({
		url:CHECK_VIDEO_API+"/"+id,
		type:"DELETE",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			//ẩn video đc xóa
			$('#tr'+id).hide();
		},
		error:function(res){
			console.log(res)
		}
	})
}
//============================Lấy video về để xóa===========================//
function getVideoToDelete(videoId){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/admin/video";
	$.ajax({
		url:VIDEO_API+"/"+videoId,
		type:"GET",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			//Gán giá trị vào thẻ input ẩn id của video
			$("#hidden-videoid-delete").val(res.data.videoWebsiteId)
		},
		error:function(res){
			Materialize.toast(res.message, 2000, 'red')
		}
	})
}
//============================Lấy video về để xóa===========================//
//============================Lấy video về để sửa===========================//
function getVideo(videoID){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/admin/video";
	$.ajax({
		url:VIDEO_API+"/"+videoID,
		type:"GET",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			$(function() {
				Materialize.updateTextFields();
			});
			//=================Gán giá trị vào input================//
			$("#edit-videoid").val(res.data.videoWebsiteId);
			$("#edit-name").val(res.data.name);
			$("#edit-description").val(res.data.description);
			$("#edit-thumbnail").val(res.data.thumbnail);
			$("#edit-url").val(res.data.url);
			$("#edit-keywords").val(res.data.keywords);
			$("#hidden-videoid").val(videoID);
			//=================Gán giá trị vào input================//
		},
		error:function(res){
			Materialize.toast(res.message, 2000, 'red')
		}
	})
}
//============================Lấy video về để sửa===========================//
function editVideo(id){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/admin/video";
	var video = {
		videoWebsiteId:$("#edit-videoid").val(),
		name: $("#edit-name").val(),
		description:$("#edit-description").val(),
		keywords: $("#edit-keywords").val(),
		url: $("#url").val(),
		thumbnail:$("#edit-thumbnail").val(),
		status:2
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
			//================sửa lại các thông tin về video được sửa===============//
			$('#n'+id).text($("#edit-name").val());
			$('#d'+id).text($("#edit-description").val());
			$('#i'+id).attr('src', $("#edit-thumbnail").val());
			Materialize.toast('Cập nhật video thành công', 2000, 'green');
			//================sửa lại các thông tin về video được sửa===============//
		},
		error:function(res){
			Materialize.toast(res.message, 2000, 'red');
		}
	})
}
//============Bắt sự kiện click xóa video==============//
$("#delete-video").on('click', function(){
	deleteVideo($("#hidden-videoid-delete").val())
	$("#modal").modal('close')
})
//============Bắt sự kiện click sửa video==============//
$("#btn-edit-video").on('click', function(){
	editVideo($("#hidden-videoid").val())
})

//======================Xử lý fileupload=========================//
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

function uploadFile(){
	var UPLOAD_API="https://api-challenger-2018.herokuapp.com/_api/v1/video";
	var videoInfo={
		'name': $("[name='name']").val(),
		'description': $("[name='description']").val(),
		'thumbnail': $("[name='thumbnail']").val(),
		'keywords': keywordArray,
		'url': $("[name='url']").val(),			
		'play':{
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

$("#add-video").on('click', function(){
	$("#page-list-video").hide();
	$("#page-register").hide();
	$("#upload-video").show();
	$("#chat-box").show();
	$('.button-collapse').sideNav('hide');
})

$("#list-upload").on('click', function(){
	$("#page-list-video").show();
	$("#upload-video").hide();
	$("#page-register").hide();
	$("#chat-box").show();
	$('.button-collapse').sideNav('hide');
})
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

	function loadUserInfo(){
		if(localStorage.getItem('access-token')!=null||localStorage.getItem('access-token')!=undefined){
			$(".btn-login").hide();
			$(".btn-info").show();
			$("#btn-info").text(localStorage.getItem('name'));
			$(".btn-logout").show();
		}else{
			$("main").html('<h3>Bấm vào <a class="modal-trigger btn-login" href="#login">đăng nhập</a> để sử dụng website này hoặc <a href="main.html">click</a> để về trang chủ và thưởng thức âm nhạc</h3>')
			Materialize.toast('Bạn không được cấp quyền sử dụng trang web này', 2000, 'red');
		}
	}

	$("#btn-logout").click(function(){
		localStorage.removeItem('access-token');
		localStorage.removeItem('userId');
		localStorage.removeItem('name');
		localStorage.removeItem('thumbnail');
		window.location.reload()
	})

	function login(){
		var LOGIN_API="https://api-challenger-2018.herokuapp.com/_api/v1/admin/authenticate";
		var userLogin={
			username:$("[name='username']").val(),
			password:$("[name='password']").val(),
			role:1
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
				localStorage.setItem("userId", response.userId);
				localStorage.setItem("thumbnail", response.thumbnail);
				Materialize.toast('Đăng nhập thành công', 2000, 'red');
				setTimeout(reloadPage(),3000);
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
		console.log($("[name='username']").val())
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
//=========================Đăng kí tài khoản admin=============================//
$("[name='username-register']").keydown(function(event){
	if(event.keyCode==9){
		validUsernameRegister();
	}
})

$("[name='password-register']").keydown(function(event){
	if(event.keyCode==9){
		validPasswordRegister();
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
//Check username
function validUsernameRegister(){
	if($("[name='username-register']") == null
		||$("[name='username-register']")== undefined
		||$("[name='username-register']").val().length < 7
		||$("[name='username-register']").val().length == 0){
		var $toastContent = $('<span>Tài khoản phải lớn hơn 7 kí tự và không được để trống</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
	Materialize.toast($toastContent,2000,'red');
	return false;	
}else{
	return true;
}
}
// Check Password
function validPasswordRegister(){
	if($("[name='password-register']") == null
		||$("[name='password-register']") == undefined
		||$("[name='password-register']").val().length < 7
		||$("[name='password-register']").val().length == 0){
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
		||$("[name='repassword']").val() != $("[name='password-register']").val()){
		var $toastContent = $('<span>Mật khẩu không trùng khớp</span>').add($('<button class="btn-flat toast-action">Undo</button>'));
	Materialize.toast($toastContent,2000,'red');
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
	return(validUsernameRegister()
		&&validPasswordRegister()
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
		'username':$("[name='username-register']").val(),
		'password':$("[name='password-register']").val(),
		'gender':$("#gender").val(),
		'birthday':miliseconBirthday,
		'email':$("[name='email']").val(),
		'fullname':$("[name='fullname']").val(),
		'thumbnail':$("[name='avatar']").val(),
		'role':1
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
			return;
		},
		error:function(response){
			var responseError = JSON.parse(response.responseText)
			Materialize.toast(responseError.message, 2000, 'red');
		}
	})
}

$(".btn-register").on('click', function(){
	$("#page-list-video").hide();
	$("#upload-video").hide();
	$("#page-register").show();
	$("#chat-box").show();
	$('.button-collapse').sideNav('hide');
})
//=========================Đăng kí tài khoản admin=============================//
//=========================Socket io===========================//
var token=localStorage.getItem('access-token')
var socket = io("https://api-challenger-2018.herokuapp.com?token="+token);
function checkVideoNoti(id,name,userId){
	var CHECK_NOTI_API="https://api-challenger-2018.herokuapp.com/_api/v1/admin/noti_video";
	var noti = {
		videoWebsiteId:id,
		userId:userId,
		adminId:localStorage.getItem('userId'),
		contentNoti:'Video '+ name + ' đã được phê duyệt',
	}
	$.ajax({
		url:CHECK_NOTI_API,
		type:"POST",
		data:JSON.stringify(noti),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			$('#p'+id).attr('class', res.info.notiId)
			socket.emit('admin-send-noti', {noti:res.info.contentNoti, userId:res.info.userId, videoWebsiteId:id, notiId:res.info.notiId});
		},
		error:function(res){
			console.log(res)
		}
	})
}

function uncheckVideoNoti(id,status){
	var CHECK_NOTI_API="https://api-challenger-2018.herokuapp.com/_api/v1/admin/noti_video";
	$.ajax({
		url:CHECK_NOTI_API+"/"+id,
		type:"DELETE",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			socket.emit('admin-uncheck-noti', {notiId:id, status:status});
		},
		error:function(res){
			console.log(res)
		}
	})
}	
//=========================Socket io===========================//
//=========================Socket io chat===========================//
function loadFormChat(){
	$("#chat-box").show();
	$("#page-register").hide();
	$("#upload-video").hide();
	$("#page-list-video").hide();
	$('.button-collapse').sideNav('hide');
}

$("#list-chat").click(function(){
	loadFormChat()
})
//render ra danh sách các user
function renderUserChat(userId, username){
	var html="";
	html += '<a class="collection-item room" id="'+userId+'" onclick="chatUser(\''+userId+'\', getChatOfConversation)"><span id="c'+userId+'" class="new badge">1</span>'+username+'</a>';
	$("#list-user-chat").append(html);
}
//tạo box chat cho từng user
function renderBoxSupportForUser(userId){
	console.log('userId ' + userId)
	var html="";
	html+='<div id="b'+userId+'" class="box">'
	html+='</div>'
	$("#box-support").append(html);	
}
//render ra nội dung chat mà user gửi tới admin
function renderChatContentUserSendAdmin(userId,thumbnail,content){
	//đây là userId của user gửi nội dung đó
	console.log(userId)
	console.log('renderChatContentUserSendAdmin')
	var html="";
	html+='<div class="row purple lighten-5" style="margin:10px 10px 10px; border-radius:5px;">'
	html+=		'<div class="col xl2 l2 s2 m2 left-align">'
	html+=			'<img src="'+thumbnail+'" alt="Avatar" class="responsive-img" style="border-radius:5px;">'
	html+=		'</div>'
	html+=		'<div class="col xl9 l9 s9 m9" style="border-radius:5px;">'
	html+=			'<div class="col xl12 l12 s12 m12 p'+userId+'">'+content+'</div>'
	html+=		'</div>'
	html+='</div>'
	$("#b"+userId).append(html);
}

function renderChatContentAdminToUser(room, thumbnail, content){
	//room tương đương với conversationId và userId của khách hàng
	console.log('renderChatContentAdminToUser')
	var html="";
	html+='<div class="row purple lighten-4" style="margin:10px 10px 10px; border-radius:5px;">'
	html+=		'<div class="col xl10 l10 s10 m10" style="border-radius:5px;">'
	html+=			'<div class="col xl12 l12 s12 m12">'+content+'</div>'
	html+=		'</div>'
	html+=		'<div class="col xl2 l2 s2 m2 right-align">'
	html+=			'<img src="'+thumbnail+'" alt="Avatar" class="responsive-img" style="border-radius:5px;">'
	html+=		'</div>'
	html+='</div>'
	console.log(room)
	$("#b"+room).append(html);
}
var token=localStorage.getItem('access-token');

//Bắt sự kiện khi ng dung chat, admin sẽ join vào room của ng đó
socket.on('server-send-chat-admin', function(data){
	if($('#'+data.userId) == null || $('#'+data.userId)==undefined || $('#'+data.userId).length == 0){
		renderUserChat(data.userId, data.username);
		socket.emit('admin-join-rooms', data.userId);
		//tạo ra boxchat cho user trong lần đầu đc gửi
		renderBoxSupportForUser(data.userId)
		//append nội dung vào html của từng user
		// renderChatContentUserSendAdmin(data.userId, data.thumbnail, data.content);
		//Ẩn nội dung khi chưa click vào từng user
		$("#b"+data.userId).hide();
	}else{
		//thôn báo có tin nhắn mới
		createNew(data.userId)
		// renderBoxSupportForUser(data.userId)
		//render ra nội dung user chat cho user trong các lần sau
		renderChatContentUserSendAdmin(data.userId, data.thumbnail, data.content);
		//Kiểm tra điều kiện nếu box chat cho user nào đó đang hiển thị thì vẫn để đó
		if($("#b"+data.userId).is(":visible")){
			return;
		}else{
			//ẩn boxchat của user đó
			$("#b"+data.userId).hide();
		}
	}
})
//xóa tin nhắn khi click vào userChat hoặc input support
function clearNew(userId){
	$("#c" + userId).removeAttr('class', 'new');
	$("#c"+ userId).text("")
}
//Tăng số lượng báo tin nhắn mới khi có sự thay đổi
function createNew(userId){
	var numberofcontent = $("#c"+userId).text();
	numberofcontent++;
	$("#c"+userId).text(numberofcontent);
	$("#c"+userId).addClass('new badge')
}

function chatUser(userId,getChatOfConversation){
	//khi click thì chuyển boxchat về rỗng để get lại nội dung chat
	$("#b"+userId).text("")
	console.log('userId '+ userId)
	//show ra khung hội thoại
	$("#conversation").show();
	//nhận nội dung chat
	getChatOfConversation(userId);
	clearNew(userId)
	//ẩn tất cả các box
	for (var i = 0; i < $(".box").length; i++) {
		console.log('box')
		$(".box").hide();
	}
	//gán thuộc tính để lấy thông tin room
	$("#support-chat").attr('roomsocket', userId);
	//show boxchar của userid mà đc clicl
	$("#b"+userId).show();
}
//Bắt sự kiện bấm phím enter sẽ gửi nội dung support của admin
$("#support-chat").keydown(function(e){
	if(e.keyCode == 13){
		var infoAdminSendServer={
			content: $(this).val(),
			createdAt:Date.now(),
			room:$(this).attr('roomsocket')//room với user id đang chat
		};
		//lưu nội dung chat
		saveChat(infoAdminSendServer.room, infoAdminSendServer.content)
		socket.emit('admin-support-user', infoAdminSendServer);
		$(this).val("");
		clearNew($(this).attr('roomsocket'));
	}
})

socket.on('server-send-chat-from-admin', function(data){
	if(localStorage.getItem('userId') != data.userId){
		//thông báo có tin nhắn mới
		createNew(data.room)
	}
	//render ra nội dung admin chat cho user
	renderChatContentAdminToUser(data.room, data.thumbnail, data.content)
})
//lưu thông tin chat
function saveChat(room, content){
	var userId = localStorage.getItem('userId');
	var CHAT_API='https://api-challenger-2018.herokuapp.com/_api/v1/chat';
	var chat={
		conversationId:room,
		userId:userId,
		chatContent:content,
		role:1//thể hiện là admin, 2-là user
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
			console.log(res)
		},
		error:function(res){
			console.log(res)
		}
	})
}
//Lấy danh sách các đoạn thoại đã có trong db
if(localStorage.getItem('access-token') != null 
	|| localStorage.getItem('access-token') != undefined){
	getConversation()
}

function getConversation(){
	var CHAT_API='https://api-challenger-2018.herokuapp.com/_api/v1/conversation';
	$.ajax({
		url:CHAT_API,
		type:'GET',
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			var arrayRoom=[];
			for (var i = 0; i < res.data.length; i++) {
				//render ra các link cho các cuộc hoại thoại
				renderUserChat(res.data[i].conversationId, res.data[i].username);
				arrayRoom.push(res.data[i].conversationId);
				//server join vào các room của các cuộc hội thoại
				socket.emit('admin-join-rooms', arrayRoom)
			}		
		},
		error:function(res){
			console.log(res)
		}
	})
}
//Lấy nội dung chat
function getChatOfConversation(id){
	if($("#b"+id).length==0){
		renderBoxSupportForUser(id)
	}
	var CHAT_API='https://api-challenger-2018.herokuapp.com/_api/v1/chat';
	$.ajax({
		url:CHAT_API+"/"+id,
		type:'GET',
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			console.log(res)
			for (var i = 0; i < res.data.length; i++) {
				//check nếu là admin sẽ render ra nội dung admin gửi cho user và ngược lại(phục vụ mục đích của html và css cho từng loại chat)
				if(res.data[i].role == 1){
					renderChatContentAdminToUser(res.data[i].conversationId, res.data[i].thumbnail, res.data[i].chatContent)
				}else{
					renderChatContentUserSendAdmin(res.data[i].conversationId,res.data[i].thumbnail,res.data[i].chatContent)
				}
			}			
		},
		error:function(res){
			console.log(res)
		}
	})
}

//=========================Socket io chat===========================//