var browser=navigator.appName;
var b_version=navigator.appVersion;
var version=b_version.split(";");
var trim_Version=version[1].replace(/[ ]/g,"");
if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE6.0"){
	navigatorWrong(6);
}else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE7.0"){
	navigatorWrong(7);
}else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE8.0"){
	navigatorWrong(8);
}else if(browser=="Microsoft Internet Explorer" && trim_Version=="MSIE9.0"){
	navigatorWrong(9);
}
function navigatorWrong(v) {
	alert('检测到您正在使用IE' + v + '浏览器，部分功能将不被支持，建议您更换Chrome或更高版本浏览器以支持全部功能。');
}

$(function(){
	$("input").iCheck({
		checkboxClass: 'icheckbox_square-blue',
		radioClass: 'iradio_square-blue',
		increaseArea: '0%'
	});
});

Messenger.options = {
	extraClasses: 'messenger-fixed messenger-on-bottom',
	theme: 'flat',
	messageDefaults: {
		message: '默认信息',
		type: 'info',
		showCloseButton: true,
		hideAfter: 5
	}
}