var docElem = (document.head || document.documentElement);
var scripts = docElem.getElementsByTagName("script");

var isTFSChat = false;
for(var i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.indexOf("TFS.ChatRoom.js") >= 0) {
        // If there's a script file named TFS.ChatRoom.js on the page...good chances this is TFS :-)
        isTFSChat = true;
    }
}

if (isTFSChat) {
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
    s.src = chrome.extension.getURL('/src/bg/TeamRoomScript.js');
    s.onload = function () {
        this.parentNode.removeChild(this);
    };
    docElem.appendChild(s);
}