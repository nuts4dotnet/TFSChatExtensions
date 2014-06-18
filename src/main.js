chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	var settings = new Store("settings", {
		"enableTextToSpeech": false,
		"enablePopupNotifications": true,
		"duration": 5000,
		"showMyOwnMessages": false,
		"keepMentionsOpen": true,
		"enableAnimagedGifs": false,
	});

	if (request.method == "getOptions") {
		sendResponse(settings.toObject());
	} else {
		sendResponse({}); // snub them.
	}
});
