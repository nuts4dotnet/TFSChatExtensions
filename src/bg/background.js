chrome.runtime.sendMessage({ method: "getOptions" }, function (response) {
	var actualCode = '(function() {' +
		'    window.tfsChatExtensions = (typeof window.tfsChatExtensions === "undefined") ? {} : window.tfsChatExtensions;' +
		'    $.extend(true, window.tfsChatExtensions, { config: { notification: ' +
			 JSON.stringify(response) + '}});' +
		'    console.log("TFS Notifications - Config options loaded");' +
		'})()';
	var script = document.createElement('script');
	script.textContent = actualCode;
	(document.head || document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
});

var s = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.extension.getURL('/src/bg/TeamRoomScript.tamper.js');
s.onload = function () {
	this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);
