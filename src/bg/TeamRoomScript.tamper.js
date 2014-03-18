// ==UserScript==
// @name       TFS Team Room Chrome Plugin
// @namespace  http://nuts4.net
// @version    0.54
// @description Getting tired of switching back and forth between a browser and Visual Studio...just to see if you have any chat notifications?  Use this script, and get your notifications directly on your desktop!
// @match      https://*.visualstudio.com/_rooms*
// @copyright  2013+, Joe Coutcher
// ==/UserScript==

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
					// Image tags/animated gifs
					elementToParse: function() { return $('a', this); },
					matchFunction: function() { return /https?:\/\/.*\.(?:png|jpg|gif)/i.test($(this).attr('href')); },
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
					matchFunction: function () { return /#c(\d*)/i.test($(this).text()); },
					newElement: function () {
						return $('<div class="message-text"></div>').html($(this).html().replace(/#c(\d*)/i, '<a href="/DefaultCollection/_versionControl/changeset/$1">Changeset $1</a>'));
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
			if (window.webkitNotifications) {
				// 0 means we have permission to display notifications
				if (window.webkitNotifications.checkPermission() == 0) {
					return true;
				} else {
					window.webkitNotifications.requestPermission();
				}
			}

			return false;
		},
		show: function(icon, title, content, duration, id) {
			if (tfsChatExtensions.config.notification.enablePopupNotifications && tfsChatExtensions.notifications.requestNotifyPermission()) {
				var notification = window.webkitNotifications.createNotification(icon, title, content);
				notification.onclick = tfsChatExtensions.utility.bringWindowIntoFocus;
				notification.show();

				// If duration equals zero, then keep the notification open until user closes it
				if (duration != 0) {
					window.setTimeout(function() {
						notification.cancel();
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
			var serverMessage = $.parseJSON(message.Content);

			return {
				title: serverMessage.type,
				content: serverMessage.title,
				icon: tfsChatExtensions.constants.tfsServerIcon,
				messageId: message.Id
			};
		},
		parseMessage: function(message) {
			if (message.Content.indexOf("{") == 0)
				return parseSystemMessage(message);

			var userIcon = tfsChatExtensions.constants.tfsIdentityImageUrl + message.PostedByUserTfId;

			return {
				title: message.PostedByUserName,
				content: message.Content,
				icon: tfsChatExtensions.constants.tfsIdentityImageUrl + message.PostedByUserTfId,
				messageId: message.Id
			};
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
		},
		isNotMe: function (message) {
			return message.PostedByUserTfId != $.connection.chatHub.state.id;
		}
	},
	handlers: {
		processDisplayedMessage: function (messageDiv) {
			var messageDivParent = $(messageDiv).parent();
			// Run all handler expressions against the message body
			$.each(tfsChatExtensions.config.content.handlerExpressions, function() {
				var handler = this;
				if (handler.enabled) {
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

				var messageDuration = tfsChatExtensions.parsers.isUserMentioned(message.Mentions)
					? 0 // display indefinitely
					: tfsChatExtensions.config.notification.duration;

				tfsChatExtensions.notifications.show(parsedMessage.icon, parsedMessage.title, parsedMessage.content, messageDuration, parsedMessage.messageId);
			}

			// check if chat control is at scroll top
			var isChatScrolledToTop = tfsChatExtensions.utility.isChatScrolledToTop();

			tfsChatExtensions.handlers.processDisplayedMessage($('#message_' + message.Id + ' .message-text'));

			// If chat was near the top before processing, then scroll!
			if (isChatScrolledToTop) {
				tfsChatExtensions.utility.scrollChatToTop();
			}
		}
	}
});

// Where the magic happens
$(function () {
	console.log("TFS Notifications - Setting up 10 second delay...");

	var cdnSyntaxHighlighter = "//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.0/";
	$('head').append('<link href="' + cdnSyntaxHighlighter + 'styles/default.min.css" rel="stylesheet" type="text/css" />');
	$('head').append('<link href="' + cdnSyntaxHighlighter + 'styles/obsidian.min.css" rel="stylesheet" type="text/css" />');

	// Load syntax highlighter
	$.getScript(cdnSyntaxHighlighter + "highlight.min.js", function () {
		hljs.initHighlightingOnLoad();
	});

	// Activate the plugin after 10 seconds
	window.setTimeout(function () {
		// Process already displayed messages
		tfsChatExtensions.utility.processAllDisplayedMessages();

		// Scroll the list to the top
		window.setTimeout(tfsChatExtensions.utility.scrollChatToTop, 100);

		// Attach to message received event
		$.connection.chatHub.on('messageReceived', tfsChatExtensions.handlers.messageReceived);

		console.log("TFS Notification code has loaded.");
	}, 10000);
});