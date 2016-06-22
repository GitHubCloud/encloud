$(function () {
	$("form").submit(function (e) {
		return false;
	});

	var open = false;
	$(".collapse_btn").click(function (e) {
		if(open){
			$("#online_user").css("display", "none");
			$("#chat_room").width($("#chat_room").width() + 280);
			$(this).css("left", "0px");
			$(this).toggleClass("closed");
			open = false;
		}else{
			$("#chat_room").width($("#chat_room").width() - 280);
			$("#online_user").css("display", "block")
			$(this).css("left", "280px");
			$(this).toggleClass("closed");
			open = true;
		}
		replaceChatroom();
	});

	$(window).resize(function () {
		replaceChatroom();
	});
	replaceChatroom();
	function replaceChatroom() {
		$("body").outerHeight($(document).height());
		$("#online_user").outerHeight(document.documentElement.clientHeight - $("#headroom").height());
		$("#chat_room .panel-body").outerHeight(document.documentElement.clientHeight - $("#headroom").height() - $(".panel-footer").outerHeight());
		if(open){
			$("#chat_room").outerWidth(document.documentElement.clientWidth - $("#online_user").outerWidth());
		}else{
			$("#chat_room").outerWidth(document.documentElement.clientWidth);
		}
		$("#chat_input").outerWidth($("#chat_input").parents(".panel-footer").width() - 120);
	}

	$("#online_user").mCustomScrollbar({
		axis: 'y',
		autoHideScrollbar: true,
		theme: 'dark-2'
	});
	$("#chat_room .panel-body").mCustomScrollbar({
		axis: 'y',
		autoHideScrollbar: true,
		theme: 'dark-2'
	});
});

function pushSysMsg(msg) {
	$(".panel-body #mCSB_2_container").append($("<div>").addClass("sysmsg").text(msg));
	if($("#mCSB_2_container").height() > $("#mCSB_2").height()){
		$("#mCSB_2_container").css("top", $("#mCSB_2_container").height() - $("#mCSB_2").height());
	}
}

function pushMsg(type, from, msg, to) {
	var transChar = {
		'"':'&quot;',
		'&':'&amp;',
		'<':'&lt;',
		'>':'&gt;',
		' ':'&nbsp;'
	};
	// msg = msg.replace(/"/g, '&quot;');
	msg = msg.replace(/&/g, '&amp;');
	msg = msg.replace(/</g, '&lt;');
	msg = msg.replace(/>/g, '&gt;');
	msg = msg.replace(/ /g, '&nbsp;');

	var html = '<div class="' + (type=='SELF' ? 'my' : '') + 'message">';
	html += '<img src="/img/default-avatar.png" class="avatar">';
	html += '<div class="content"><a href="#"><div class="uname">' + from.uname + '</div></a>';
	html += '<div class="bubble">'+msg+'</div></div><div class="clearfix"></div></div>';

	$(".panel-body #mCSB_2_container").append(html);
	if($("#mCSB_2_container").height() > $("#mCSB_2").height()){
		$("#mCSB_2_container").css("top", $("#mCSB_2_container").height() - $("#mCSB_2").height());
	}
}