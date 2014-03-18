var s = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.extension.getURL('/src/bg/TeamRoomScript.tamper.js');
s.onload = function () {
	this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);