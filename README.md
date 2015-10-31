TFSChatExtensions
=================

Chrome Plugin that extends TFS/Visual Studio Team Chat (Online and On-premise)

##List of features:##
 * Popup notifications for messages
    - Link to enable notifications for your TFS site will be in the upper-right corner by your username.
 * Image embedding (jpg/png) by simply pasting the url
 * Animated GIF support (disabled by default)
 * Code Syntax Highlighting (using markdown's \`\`\` var i = 0; \`\`\` syntax)
 * YouTube embedding
 * Changeset referencing (by using ##cxxxx syntax, where xxxx is the changeset number.  i.e. ##c1234 will change into a link stating "Changeset 1234" that will take you directly to the changeset info page)

You can configure specific features of the plugin by accessing the options page (File -> Settings -> Extensions -> the "options" link under "TFS Chat Extensions")

---

##Version 0.1.3 10/31/2015##

####Experimental On-premise support####

As I don't have an on-premise server to test this on, that's why this is marked as experimental.  The plugin will always remain in-line with the cloud-based chat service (with some exceptions), so the plugin is not guaranteed to work with on-premise instances.  If it's something I can easily work around, I'll gladly add code to do so.  If you find any issues, please report them to the Github issues page:
https://github.com/nuts4dotnet/TFSChatExtensions

####Capitalization fix for VSO team room####

In 1.1.2, I introduced a fix to address variable capitalization changes in recent versions of the TFS Chat Room.  With the new experimental on-premise support, I realized that most customers may not be running the latest version with the capitalization changes, so I added backwards compatibility.

####Changeset identification####

In version prior to 1.1.3, you could specify a changeset by using #c1234.  As I found out quite a few times, url's like "http://someurl.com/#content" causes the URL to become "http://someurl.com/Changeset ontent".  So, to identify changesets now, use ##c1234.  Also, the URL's now open up in a new window/tab.

---

##Version 0.1.2 10/29/2015##

Integrated capitalization fixes for object names from Mike-999.  (Sorry for how long this took...I no longer use TFS Online...so this plugin doesn't get maintained like it should.)

##Version 0.1.1 6/18/2014##

Removed old code for webkitNotifications, and implemented W3C Notification class.  Link to enable notifications for your TFS site will be in the upper-right corner by your username.

##Version 0.1.0 6/18/2014##

Initial Release
