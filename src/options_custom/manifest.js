// SAMPLE
this.manifest = {
    "name": "TFS Chat Extensions",
    "icon": "icon.png",
    "settings": [
        {
            "tab": "General Settings",
            "group": "Configuration",
            "name": "enableTextToSpeech",
            "type": "checkbox",
            "label": "Read messages via Text-to-Speech"
        },
		{
		    "tab": "General Settings",
		    "group": "Configuration",
		    "name": "enablePopupNotifications",
		    "type": "checkbox",
		    "label": "Enable Popup Notifications"
		},
		{
			"tab": "General Settings",
			"group": "Configuration",
			"name": "showMyOwnMessages",
			"type": "checkbox",
			"label": "Show my own messages"
		},
        {
        	"tab": "General Settings",
        	"group": "Configuration",
        	"name": "duration",
        	"type": "slider",
        	"label": "Notification Duration:",
        	"max": 20000,
        	"min": 1000,
        	"step": 1000,
        	"display": true,
        	"displayModifier": function (value) {
        		return (value / 1000) + " seconds";
        	}
        },
		{
			"tab": "General Settings",
			"group": "Configuration",
			"name": "keepMentionsOpen",
			"type": "checkbox",
			"label": "Keep Mentions Open"
		},
		{
			"tab": "General Settings",
			"group": "Configuration",
			"name": "enableAnimatedGifs",
			"type": "checkbox",
			"label": "Enable Animated GIFs"
		}
    ]
};
