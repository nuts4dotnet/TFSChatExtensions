$(function() {

	console.log("::::Initializing TFSChat"); 

	var cdnSyntaxHighlighter = "//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.0/";
	$('head').append('<link href="' + cdnSyntaxHighlighter + 'styles/default.min.css" rel="stylesheet" type="text/css" />');
	$('head').append('<link href="' + cdnSyntaxHighlighter + 'styles/obsidian.min.css" rel="stylesheet" type="text/css" />');

	// Load syntax highlighter
	$.getScript(cdnSyntaxHighlighter + "highlight.min.js", function () {
		hljs.initHighlightingOnLoad();
	});

	//observerConfig
	var config = {childList: true};

	//function when observer conditions are met
	var observer = new MutationObserver(function(mutations) {
  		mutations.forEach(function(mutation) {
    		//this is kinda lame on a reusable observer but we are only observing the chat-box in this extension...
    		//just check the last thing for images	
    		replaceImages(true);

    		//should probalby check that the value is there -- mutation *shouldn't* fire if not though
    		tfsChatExtensions.handlers.messageReceived("", $(".message-text").last()[0]);
  		});    
	});

    if (window.webkitNotifications.checkPermission() != 0) {
        window.webkitNotifications.requestPermission();
    }
   
    //scan thru all messages and look for images
    var replaceImages = function(last){
    	var arr = [];

    	if (last === true){
    		arr = $(".message-text:contains('http')").last();
    	} else { 
    		arr = $(".message-text:contains('http')");
    	}
        var isImgUrl= /https?:\/\/.*\.(?:png|jpg|gif)/i;
        $.each(arr, function(index, value){
            //look through text instead of html so thing that are currently images don't get messed up
            $(value).html($(value).text().replace(isImgUrl,'<img src="$&"/>'));
        });
    }
   
    // Activate the plugin after 10 seconds
    window.setTimeout(function() {
    	console.log("::::TFSChat Extension Loaded");

		// Process already displayed messages
		tfsChatExtensions.utility.processAllDisplayedMessages();

		// Scroll the list to the top
		window.setTimeout(tfsChatExtensions.utility.scrollChatToTop, 100);

		//setup observer on chat-box
		var target = $(".chat-box").not(".hidden")[0];

        //start observing
		observer.observe(target, config);

    }, 10000);
});