$(function() {


	//observerConfig
	var config = {childList: true};

	//function when observer conditions are met
	var observer = new MutationObserver(function(mutations) {
  		mutations.forEach(function(mutation) {
    		//this is kinda lame on a reusable observer but we are only observing the chat-box in this extension...
    		//just check the last thing for images	
    		replaceImages(true);
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
    	console.log("TFSChat Extension Loaded");
        replaceImages();

		//setup observer on chat-box
		var target = $(".chat-box").not(".hidden")[0];

        //start observing
		observer.observe(target, config);

    }, 10000);
});