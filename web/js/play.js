$(document).ready(function () {
	loadVideoPlay(videoId, generateVideo);
	loadUserInfo();
	if(localStorage.getItem('access-token')==null){	
		$(".checkexistuser").hide();
	}else{
		loadPlaylist(videoId, generatePlaylist);
		getLikeVideo(videoId);
		$(".checkexistuser").show()
	}

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

})

/*Phàn login*/
function reloadPage(){
	setTimeout(function(){window.location.reload()},2000);
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
/*Kết thúc Phàn login*/
/*Phần video*/
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

var videoId = getUrlParameter('videoId');

function loadVideoPlay(videoId, generateVideo){
	var VIDEO_API="https://api-challenger-2018.herokuapp.com/_api/v1/video";
	$.ajax({
		url:"https://api-challenger-2018.herokuapp.com/_api/v1/video/"+videoId,
		type:'GET',
		headers:{
			'content-type':'application/json'
		},
		success:function(res){
			// $("iframe").attr("src", resSucc.url);
			$("#title").text(res.name);
			$("#description").text(res.description);
			$("#keywords").text(res.keywords);
			$("#headset").text(res.play.listened);
			$("[name='numberoffavourite']").val(res.play.favourited);
			generateVideo(res.url);
		},
		error:function(res){
			Materialize.toast(res.message, 2000, 'red');
		}
	})
}

function generateVideo(url){
	html="";
	html+='<video controls class="responsive-video">'
	html+=	'<source src="'+url+'" type="video/mp4">'
	html+='</video>'
	$("#video").append(html);
}
/*Kết thúc phần*/
/*Phần like video*/
//Check like video khi load video về
function getLikeVideo(videoId){
	var LIKE_API="https://api-challenger-2018.herokuapp.com/_api/v1/like-video"
	$.ajax({
		url:LIKE_API+"/"+videoId,
		type:"GET",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(response){
			//Nếu trạng thái là 1 thì ẩn nút dislike hiện nút like
			if(response.data.favourited == 1){
				$('#nolike').hide();
				$('#like').show();			
			}
			//Nếu trạng thái là 0 thì ẩn nút like hiện nút dislike
			else if(response.data.favourited == 0){
				$('#nolike').show();
				$('#like').hide();
			}		
		},
		error:function(response){
			var responseErr=JSON.parse(response.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}

function checkLikeVideo(videoid){
	if(localStorage.getItem('access-token')!=null){
		var LIKE_API="https://api-challenger-2018.herokuapp.com/_api/v1/like-video"
		var likeVideo={
			videoWebsiteId:videoid,
			favourited:1,
			numberOfFavourited:parseInt($("[name='numberoffavourite']").val())+1
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
				$('#nolike').hide();
				$('#like').show();
			},
			error:function(response){
				var responseErr=JSON.parse(response.responseText);
				Materialize.toast(responseErr.message, 2000, 'red');
			}
		})
	}else{
		var $toastContent = $('<span>Bạn cần đăng nhập để sử dụng chức năng này</span><i class="material-icons right">info</i>');
		Materialize.toast($toastContent, 3000,'red');
	}		
}

$("#nolike").click(function(){
	checkLikeVideo(videoId);
})

$("#like").click(function(){
	editLikeVideo(videoId);
})

function editLikeVideo(videoid){
	var flag=parseInt($("[name='numberoffavourite']").val())-1;
	$("[name='numberoffavourite']").val(flag);
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
			$('#nolike').show();
			$('#like').hide();
		},
		error:function(response){
			var responseErr=JSON.parse(response.responseText)
			Materialize.toast(responseErr.message, 2000, 'red');
		}
	})
}
/*Kết thúc phần like*/

/*phần playlist*/
function loadPlaylist(videoWebsiteId, generatePlaylist){
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
			Materialize.toast(res.message, 2000, 'red')
		}
	})
}
/*render ra danh sách playlist*/
function generatePlaylist(playlistId, name, videoWebsiteId){
	html="";
	html+='<li>'
	html+=	'<a>'
	html+=		'<input type="checkbox" id="'+videoWebsiteId+playlistId+'" onclick="getQuickvideo(\''+videoWebsiteId+'\',\''+playlistId+'\',createQuickVideo)"/>'
	html+=		'<label for="'+videoWebsiteId+playlistId+'">'+name+'</label>'
	html+=	'</a>'
	html+='</li>'
	$('#load-playlist').append(html);
	/*custom dropdown*/
	$('.dropdown-button').dropdown({
		inDuration: 300,
		outDuration: 225,
		constrainWidth: false,
		hover: false,
		gutter: 0,
		belowOrigin: false, 
		alignment: 'right', 
		stopPropagation: true
	});
	$('.dropdown-content').on('click', function(event) {
		event.stopPropagation();
	});
}
/* kết thúcphần playlist*/
/*Lấy nhanh video để thêm vào playlist*/
function getQuickvideo(videoWebsiteId, playlistId, createQuickVideo){
	var flag = $('#'+videoWebsiteId+playlistId).is(':checked');
	console.log(flag)
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
/*Thêm nhanh video*/
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
			Materialize.toast(res.message, 2000, 'red');
		}
	})
}
/*Xóa video*/
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
			Materialize.toast(res.message, 2000, 'red')
		}
	})
}
/*Kết thúc Lấy nhanh video để thêm vào playlist*/

/*Phần về comment*/
function createComment(generateComment){
	var COMMENT_API="https://api-challenger-2018.herokuapp.com/_api/v1/comment/"+videoId;
	var comment={
		comment:$("#content-comment").val(),
	}
	$.ajax({
		url:COMMENT_API,
		type:"POST",
		data:JSON.stringify(comment),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			var thumbnail=res.info.thumbnail;
			var comment=res.info.comment;
			var commentId=res.info.commentId;
			var createdAt=res.info.createdAt;
			var numberOfLike=res.info.numberOfLike;
			generateComment(thumbnail, comment, createdAt, commentId, videoId, numberOfLike);
		},
		error:function(res){
			Materialize.toast(res.message, 2000, 'red')
		}
	})
}

$("#content-comment").on('keydown', function(event){
	if(event.keyCode==13){
		if(localStorage.getItem('access-token')!=null||localStorage.getItem('access-token')!=undefined){
			createComment(generateComment);
			$("#content-comment").val("")
		}else{
			Materialize.toast('Bạn phải đăng nhập để sử dụng chức năng này', 2000, 'red')
		}	
	}
})

function calculateTimeComment(createdAt){
	var date=Date.now()-createdAt;
	var seconds=date/1000;
	var minutes=seconds/60;

	if(minutes<60){
		createdAt=Math.round(minutes)+' phút trước';
		return createdAt;
	}else if(minutes>60 && minutes/60/24 < 1){
		var hour=minutes/60
		createdAt='khoảng '+Math.round(hour)+' giờ trước';
		return createdAt;
	}else if(minutes/60/24 > 1){
		var date = new Date();
		date.setTime(createdAt);
		var createdAt=(date.getDate()+"-"+date.getMonth()+1+"-"+date.getFullYear());
		return createdAt;
	}
}

function generateComment(thumbnail, comment, createdAt, commentId, videoId, numberOfLike){
	var x = calculateTimeComment(createdAt)
	html="";
	html+='<div class="col xl1 s2">'
	html+=	'<img class=" circle responsive-img" src="'+thumbnail+'">';
	html+='</div>'
	html+='<div class="col xl11 s10">'
	html+=	'<div>'+comment+'</div>'
	html+=		'<div class="row">'
	html+=			'<div class="col xl1 s3" style="font-size: 12px;cursor:pointer" id="c'+commentId+'" onclick="createLikeComment(\''+videoId+'\', \''+commentId+'\')">Thích</div>'
	html+=			'<div class="col xl1 s3  blue-text" style="font-size: 12px;cursor:pointer; display:none;" id="dc'+commentId+'" onclick="putDontLikeComment(\''+videoId+'\', \''+commentId+'\')">Thích</div>'
	html+=			'<div class="col xl1 s3" style="font-size: 12px;cursor:pointer" id="nc'+commentId+'">'+numberOfLike+'</div>'
	html+=			'<div class="col offset-xl4 xl3 s6" style="font-size: 12px; opacity:0.5">'+x+'</div>'
	html+=		'</div>'						
	html+='</div>'
	$("#list-comment").append(html);	
}
var pagecomment=""

$("#show-more").on('click', function(){
	getComment(generateComment, getLikeComment);
})
/*load danh sachs comment và comment like*/
getComment(generateComment, getLikeComment);

function getComment(generateComment, getLikeComment){
	var COMMENT_API="https://api-challenger-2018.herokuapp.com/_api/v1/comment?videoId="+videoId+"&page="+pagecomment+"&maxResult=5";
	$.ajax({
		url:COMMENT_API,
		type:"GET",
		headers:{
			'content-type':'application/json',
		},
		success:function(res){
			pagecomment = parseInt(res.meta.page)+1
			if(res.data.length!=""){
				for (var i = 0; i < res.data.length; i++) {
					var thumbnail=res.data[i].thumbnail;
					var comment=res.data[i].comment;
					var commentId=res.data[i].commentId;
					var createdAt=res.data[i].createdAt;
					var numberOfLike=res.data[i].numberOfLike;
					generateComment(thumbnail, comment, createdAt, commentId, videoId, numberOfLike);
				}
				if(res.meta.totalItem > 5){
					$("#show-more").show();
				}			
				getLikeComment();
			}		
		},
		error:function(res){
			Materialize.toast(res.message, 2000, 'red')
		}
	})
}

function createLikeComment(videoWebsiteId, commentId){
	$('#c'+commentId).hide();
	$('#dc'+commentId).show();
	var numberOfLike=parseInt($('#nc'+commentId).text())+1;
	$('#nc'+commentId).text(numberOfLike)
	var COMMENTLIKE_API="https://api-challenger-2018.herokuapp.com/_api/v1/like-comment/"+videoId
	var likecomment = {
		commentId:commentId,
		videoWebsiteId:videoWebsiteId,
		numberOfLike:numberOfLike,
	};
	$.ajax({
		url:COMMENTLIKE_API,
		type:"POST",
		data:JSON.stringify(likecomment),
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			console.log(res)
		},
		error:function(res){
			Materialize.toast(res.message, 2000, 'red')
		}
	})
}

function putDontLikeComment(videoWebsiteId, commentId){
	$('#c'+commentId).show();
	$('#dc'+commentId).hide();
	var numberOfLike=parseInt($('#nc'+commentId).text())-1;
	console.log(numberOfLike)
	$('#nc'+commentId).text(numberOfLike)
	var COMMENTLIKE_API="https://api-challenger-2018.herokuapp.com/_api/v1/like-comment/"+videoId+"/"+commentId
	var likecomment = {
		numberOfLike:numberOfLike,
	};
	$.ajax({
		url:COMMENTLIKE_API,
		type:"PUT",
		data:JSON.stringify(likecomment),
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

function getLikeComment(){
	var COMMENTLIKE_API="https://api-challenger-2018.herokuapp.com/_api/v1/like-comment/"+videoId;
	$.ajax({
		url:COMMENTLIKE_API,
		type:"GET",
		headers:{
			'content-type':'application/json',
			'authorization':localStorage.getItem('access-token')
		},
		success:function(res){
			if(res.data!=""){
				for (var i = 0; i < res.data.length; i++) {
					if(res.data[i].liked==1){
						$('#c'+res.data[i].commentId).hide();
						$('#dc'+res.data[i].commentId).show();
					}else{
						$('#c'+res.data[i].commentId).show();
						$('#dc'+res.data[i].commentId).hide();
					}
				}
			}
			return false;	
		},
		error:function(res){
			console.log(res)
		}
	})
}

/*Kết thúc Phần về comment*/
