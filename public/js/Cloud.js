$(function () {
	// 初始化宽高
	$(".sideMenu").height($(document).height());
	$(".container-admin").height($(document).height());
	$(".container-admin .adminBody").height($(document).height() - 50);

	// sideMenu
	$(".collapse_sidebar").click(function (e) {
		$(".sideMenu").toggleClass("sideMenu-collapse");
		$(".sideMenu").toggleClass("sideMenu-open");
		$(".container-admin").toggleClass("admin-collapse");
		$(".container-admin").toggleClass("admin-open");
	});
	$("[data-toggle=openMenu]").click(function (e) {
		$(this).siblings(".collapsedMenu").slideToggle();
	});

	// adminDropdown
	$(".admin_name").click(function (e) {
		$(this).toggleClass("active");
	});
	$("[data-toggle=adminDropdown]").click(function (e) {
		$("#adminDropdown").slideToggle();
	});
	$(window).click(function (e) {
		if(e.target != $("[data-toggle=adminDropdown]")[0]){
			$("#adminDropdown").slideUp();
		}
	});

	// focuser
	$(".table tr").hover(function (e) {
		var left = $(this).offset().left;
		var top = $(this).offset().top;
		var height = $(this).height();

		$(".focuser").show()

		$(".focuser").stop();
		$(".focuser").animate({
			"left": left,
			"top": top,
			"height": height
		}, "fast", "swing");
	});
	$(".table tr").mouseout(function (e) {
		$(".focuser").hide();
	});
});

function silence(obj) {
	var user = getThisChecked(obj);
	socket.emit('silence', user)
}

function kick(obj) {
	var user = getThisChecked(obj);
	socket.emit('kick', user);
	$("table#OnlineUser tbody").html("<tr><td width='100%' colspan='6' style='text-align:center;'><i class='loadingSVG-dark'></i></td><tr>")
	socket.emit('getOnlineUser');
}

function ban(obj) {
	var user = getThisChecked(obj);
	socket.emit('ban', user);
}

function banIP(obj) {
	var user = getThisChecked(obj);
	socket.emit('ban', user);
}

function silenceGroup() {
	var users = getAllChecked();
	socket.emit('silence', users);
}

function kickGroup() {
	var users = getAllChecked();
	socket.emit('kick', users);
	$("table#OnlineUser tbody").html("<tr><td width='100%' colspan='6' style='text-align:center;'><i class='loadingSVG-dark'></i></td><tr>")
	socket.emit('getOnlineUser');
}

function banGroup() {
	var users = getAllChecked();
	socket.emit('ban', users);
}

function banIPGroup() {
	var users = getAllChecked();
	socket.emit('banIP', users);
}

function getAllChecked() {
	var checkedList = [];
	var len = $("#OnlineUser tbody td input[type=checkbox]").length;
	if(len != 0){
		for(var i = 0; i < len; i++){
			if($("#OnlineUser tbody td input[type=checkbox]").eq(i)[0].checked){
				checkedList[i] = {
					id: $("#OnlineUser tbody td input[type=checkbox]").eq(i).parents('tr').data('uid'),
					ip: $("#OnlineUser tbody td input[type=checkbox]").eq(i).parents('tr').data('uip')
				}
			}
		}
	}
	return checkedList;
}

function getThisChecked(obj) {
	var user = [];
	user[0] = {
		id: $(obj).parents('tr').data('uid'),
		ip: $(obj).parents('tr').data('uip')
	}
	return user;
}

$(function () {
	$("#OnlineUser #checkAll").on('ifUnchecked', function (e) {
		$("#OnlineUser tbody td input[type=checkbox]").iCheck('uncheck');
	});
	$("#OnlineUser #checkAll").on('ifChecked', function (e) {
		$("#OnlineUser tbody td input[type=checkbox]").iCheck('check');
	})
});