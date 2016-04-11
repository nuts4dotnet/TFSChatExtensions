window.tfsChatExtensions = (typeof window.tfsChatExtensions === 'undefined')
	? {} : window.tfsChatExtensions;

$.extend(true, window.tfsChatExtensions, {
	constants: {
		tfsIdentityImageUrl: "/_api/_common/IdentityImage?id=",
		tfsServerIcon: "/_static/tfs/20131021T164530/_content/tfs-large-icons.png",
		chatBoxSelector: ".chatroom-chat-control.live-chat:not(.hidden) ul.chat-box, .chatroom-chat-control.transcript-chat:not(.hidden) ul.chat-box"
	},
	config: {
		notification: {
			//enableTextToSpeech: false,
			//enablePopupNotifications: true,
			//duration: 5000,
			//showMyOwnMessages: false, // For debugging purposes
			//keepMentionsOpen: true,
			//lastSpokeAt: 0 // Don't change this
		},
		content: {
			handlerExpressions: [
				{
					// animated gifs
					elementToParse: function() { return $('a', this); },
					matchFunction: function() { return /https?:\/\/.*\.(?:gif)/i.test($(this).attr('href')); },
					newElement: function() { return $('<img width="210" />').attr('src', $(this).attr('href')); },
					enabled: function() { return tfsChatExtensions.config.notification.enableAnimatedGifs; }
				},
				{
					// Image tags
					elementToParse: function() { return $('a', this); },
					matchFunction: function() { return /https?:\/\/.*\.(?:png|jpg|jpeg)/i.test($(this).attr('href')); },
					newElement: function() { return $('<img width="210" />').attr('src', $(this).attr('href')); },
					enabled: true
				},
				{
					// YouTube embedding
					elementToParse: function () { return $('a', this); },
					matchFunction: function () { return /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/i.test($(this).attr('href')); },
					newElement: function() {
						return $('<iframe width="210" height="157" frameborder="0"></iframe>')
							.attr('src', $(this).attr('href').replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/i, 'https://www.youtube.com/embed/$1'));
					},
					enabled: true
				},
				{
					// Changeset linkage
					elementToParse: function () { return $(this); },
					matchFunction: function () { return /##c(\d+)/i.test($(this).text()); },
					newElement: function () {
					    var collectionName = tfsChatExtensions.parsers.parseUrlParameter('collectionName');

					    if (collectionName == '')
					        collectionName = 'DefaultCollection';

						return $('<div class="message-text"></div>').html($(this).html().replace(/##c(\d+)/i, '<a target="_blank" href="/DefaultCollection/_versionControl/changeset/$1">Changeset $1</a>'));
					},
					enabled: true
				},
				{
					// Syntax Highlighting
					elementToParse: function () { return $(this); },
					matchFunction: function () { return /```([\s\S]*)```/i.test($(this).text()); },
					newElement: function () {
						return $('<div class="message-text"></div>').html($(this).html().replace(/```([\s\S]*)```/i, '<pre><code>$1</code></pre>'));
					},
					enabled: true
				}

			]
		}
	},
	notifications: {
		requestNotifyPermission: function() {
			// Verify notifications can be displayed
			if (window.Notification) {
				// 0 means we have permission to display notifications
				if (window.Notification.permission == "granted") {
					return true;
				}
			}

			return false;
		},
		show: function(icon, title, content, duration, id) {
			if (tfsChatExtensions.config.notification.enablePopupNotifications && tfsChatExtensions.notifications.requestNotifyPermission()) {
				var notification = new Notification(title, { icon: icon, body: content, tag: id });
				notification.onclick = tfsChatExtensions.utility.bringWindowIntoFocus;
				//notification.show();

				// If duration equals zero, then keep the notification open until user closes it
				if (duration != 0) {
					window.setTimeout(function() {
						notification.close();
					}, duration);
				}
			}

			if (tfsChatExtensions.config.notification.enableTextToSpeech) {
				var isSenderHidden = $('#message_' + id + ' .message-sender.hidden').length > 0;
				var currentTime = new Date() / 1000;
				var greeting = '';

				if (!isSenderHidden || (currentTime - tfsChatExtensions.config.notification.lastSpokeAt > 60))
					greeting = 'Message from ' + title + ' reads,,,';

				tfsChatExtensions.config.notification.lastSpokeAt = currentTime;

				var msg = new SpeechSynthesisUtterance(greeting + content);
				window.speechSynthesis.speak(msg);
			}
		}
	},
	parsers: {
		isUserMentioned: function(mentionList) {
			if (tfsChatExtensions.config.notification.keepMentionsOpen && mentionList.length > 0) {
				var isMentioned = false;
				$.each(mentionList, function() {
					isMentioned = isMentioned || this.TargetId == $.connection.chatHub.state.id;
				});
				return isMentioned;
			}

			return false;
		},
		parseSystemMessage: function(message) {
			var serverMessage = $.parseJSON(message.Content || message.content);

			return {
				title: serverMessage.type,
				content: serverMessage.title,
				icon: tfsChatExtensions.constants.tfsServerIcon,
				messageId: message.Id || message.id
			};
		},
		parseMessage: function(message) {
			if ((message.Content || message.content).indexOf("{") == 0)
				return tfsChatExtensions.parsers.parseSystemMessage(message);

			var userIcon = tfsChatExtensions.constants.tfsIdentityImageUrl + (message.PostedByUserTfId || message.postedByUserTfId);

			return {
				title: (message.PostedByUserName || message.postedByUserName),
				content: (message.Content || message.content),
				icon: tfsChatExtensions.constants.tfsIdentityImageUrl + (message.PostedByUserTfId || message.postedByUserTfId),
				messageId: message.id
			};
		},
		parseUrlParameter: function(name){
		    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		    if (results==null){
		        return null;
		    }
		    else{
		        return results[1] || 0;
		    }
		}
	},
	utility: {
		scrollChatToTop: function() {
			// Scroll to the top of the box
			var $chatBox = $(tfsChatExtensions.constants.chatBoxSelector);
			if ($chatBox.length != 0)
				$chatBox.scrollTop($chatBox[0].scrollHeight);
		},
		isChatScrolledToTop: function() {
			var $chatBox = $(tfsChatExtensions.constants.chatBoxSelector);
			return Math.abs($chatBox.scrollTop() - ($chatBox.height() + $chatBox[0].scrollHeight)) > 5;
		},
		processAllDisplayedMessages: function () {
			$.each($('.chatroom-chat-control .message-text'), function () {
				tfsChatExtensions.handlers.processDisplayedMessage(this);
			});
		},
		bringWindowIntoFocus: function () {
			window.focus();
			this.close();
		},
		isNotMe: function (message) {
			return (message.PostedByUserTfId || message.postedByUserTfId) != $.connection.chatHub.state.id;
		}
	},
	handlers: {
		processDisplayedMessage: function (messageDiv) {
			var messageDivParent = $(messageDiv).parent();
			// Run all handler expressions against the message body
			$.each(tfsChatExtensions.config.content.handlerExpressions, function() {
				var handler = this;
				if ((typeof(handler.enabled) === 'boolean' && handler.enabled) || handler.enabled()) {
					// Find all matching elements, and iterate through them
					$.each(handler.elementToParse.call($(messageDiv)), function() {
						// See if match function returns true against element
						if (handler.matchFunction.call(this)) {
							// Replace element with new element
							$(this).replaceWith(handler.newElement.call(this));
						}
					});
				}
			});

			// Apply syntax highlighting if the message block contains "<pre><code>"
			// Feels ugly doing this here, but couldn't think of a better alternative
			$.each($("pre code", messageDivParent), function() { hljs.highlightBlock(this); });
		},
		messageReceived: function (roomId, message) {
			if (tfsChatExtensions.config.notification.showMyOwnMessages || tfsChatExtensions.utility.isNotMe(message)) {
				var parsedMessage = tfsChatExtensions.parsers.parseMessage(message);

				var messageDuration = tfsChatExtensions.parsers.isUserMentioned(message.Mentions || message.mentions)
					? 0 // display indefinitely
					: tfsChatExtensions.config.notification.duration;

				tfsChatExtensions.notifications.show(parsedMessage.icon, parsedMessage.title, parsedMessage.content, messageDuration, parsedMessage.messageId);
			}

			// check if chat control is at scroll top
			var isChatScrolledToTop = tfsChatExtensions.utility.isChatScrolledToTop();

			tfsChatExtensions.handlers.processDisplayedMessage($('#message_' + (message.Id || message.id) + ' .message-text'));

			// If chat was near the top before processing, then scroll!
			if (isChatScrolledToTop) {
				tfsChatExtensions.utility.scrollChatToTop();
			}
		}
	}
});

// Where the magic happens
$(function () {
	console.log("TFS Notifications - Waiting for text area to initialize...");

	var cdnSyntaxHighlighter = "//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.0/";
	$('head').append('<link href="' + cdnSyntaxHighlighter + 'styles/default.min.css" rel="stylesheet" type="text/css" />');
	$('head').append('<link href="' + cdnSyntaxHighlighter + 'styles/obsidian.min.css" rel="stylesheet" type="text/css" />');

	// Load syntax highlighter
	$.getScript(cdnSyntaxHighlighter + "highlight.min.js", function () {
		hljs.initHighlightingOnLoad();
	});
	
	var timerId = window.setInterval(function() {
		var textBox = $(".inner-message-input textarea");
		if (textBox.length > 0) {
			if (!textBox.prop("disabled")) {
				window.clearInterval(timerId);

				// Process already displayed messages
				tfsChatExtensions.utility.processAllDisplayedMessages();

				// Scroll the list to the top
				window.setTimeout(tfsChatExtensions.utility.scrollChatToTop, 100);

				// Attach to message received event
				$.connection.chatHub.on('messageReceived', tfsChatExtensions.handlers.messageReceived);

				console.log("TFS Notification code has loaded.");
			}
		}
	}, 250);

	var timerId2 = window.setInterval(function() {
		var rightPane = $(".top-level-menu-v2.user-menu li[command='user']");
		if (rightPane.length > 0) {
			window.clearInterval(timerId2);
			if (window.Notification) {
				if (window.Notification.permission == "default") {
					var btn = $("<li></li>").addClass("requestnotificationpermission").addClass("menu-item").css("cursor", "pointer");
					btn.text("Enable Chat Notifications");
					$(".top-level-menu-v2.user-menu").prepend(btn);
					
					$(".requestnotificationpermission").click(function() {
						window.Notification.requestPermission(function(status) {
							window.Notification.permission = status;
							$(".requestnotificationpermission").remove();
						});
					});
				}
			}
		}
	}, 1000);

});
