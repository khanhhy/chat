(function () {
	 
	function toDataURL(url, callback) {
	  var xhr = new XMLHttpRequest();
	  xhr.onload = function() {
		var reader = new FileReader();
		reader.onloadend = function() {
		  callback(reader.result);
		}
		reader.readAsDataURL(xhr.response);
	  };
	  xhr.open('GET', url);
	  xhr.responseType = 'blob';
	  xhr.send();
	}
	
	function processMessage(ele){
		
		var chatimg = "";
		if (ele.querySelector('.chat--profile-pic')){
		  chatimg = document.querySelector('.chat--profile-pic').style.backgroundImage.split('"')[1];
		}
		
		var name="";
		console.log(ele);
		if (ele.querySelector('.chat-history--username')){
		  name = ele.querySelector('.chat-history--username').innerText;
		  if (name){
			name = name.trim();
		  }
		} else if (ele.querySelector('.chat-history--rant-username')){
		  name = ele.querySelector('.chat-history--rant-username').innerText;
		  if (name){
			name = name.trim();
		  }
		}

		var msg = "";
		
		if (ele.querySelector('.chat-history--message')){
			if (textOnlyMode){
				try {
					msg = ele.querySelector('.chat-history--message').innerText;
				} catch(e){}
			} else {
				try {
					msg = ele.querySelector('.chat-history--message').innerHTML;
				} catch(e){}
			}
		} else if (ele.querySelector('.chat-history--rant-text')){
			if (textOnlyMode){
				try {
					msg = ele.querySelector('.chat-history--rant-text').innerText;
				} catch(e){}
			} else {
				try {
					msg = ele.querySelector('.chat-history--rant-text').innerHTML;
				} catch(e){}
			}
		}
		
		var dono = "";
		if (ele.querySelector('.chat-history--rant-price')){
			dono = ele.querySelector('.chat-history--rant-price').innerText;
		}
		
		if (msg){
			msg = msg.trim();
		}

		var data = {};
		data.chatname = name;
		data.chatbadges = "";
		data.backgroundColor = "";
		data.textColor = "";
		data.chatmessage = msg;
		data.chatimg = chatimg;
		data.hasDonation = dono;
		data.hasMembership = "";;
		data.contentimg = "";
		data.type = "rumble";
		
		if (data.chatimg){
			toDataURL(data.chatimg, function(dataUrl) {
				data.chatimg = dataUrl;
				pushMessage(data);
			});
		} else {
			pushMessage(data);
		}
	}

	function pushMessage(data){
		try{
			chrome.runtime.sendMessage(chrome.runtime.id, { "message": data }, function(e){});
		} catch(e){
		}
	}
	
	var textOnlyMode = false;
	chrome.runtime.sendMessage(chrome.runtime.id, { "getSettings": true }, function(response){  // {"state":isExtensionOn,"streamID":channel, "settings":settings}
		if ("settings" in response){
			if ("textonlymode" in response.settings){
				textOnlyMode = response.settings.textonlymode;
			}
		}
	});

	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
			try{
				if ("focusChat" == request){ // if (prev.querySelector('[id^="message-username-"]')){ //slateTextArea-
					document.querySelector('#chat-message-text-input').focus();
					sendResponse(true);
					return;
				}
				if ("textOnlyMode" == request){
					textOnlyMode = true;
					sendResponse(true);
					return;
				} else if ("richTextMode" == request){
					textOnlyMode = false;
					sendResponse(true);
					return;
				}
			} catch(e){}
			sendResponse(false);
		}
	);

	function onElementInserted(target) {
		var onMutationsObserved = function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.addedNodes.length) {
					for (var i = 0, len = mutation.addedNodes.length; i < len; i++) {
						try {
							if (mutation.addedNodes[i].skip){return;}
							mutation.addedNodes[i].skip = true;
							processMessage(mutation.addedNodes[i]);
						} catch(e){}
					}
				}
			});
		};
		if (!target){return;}
		var config = { childList: true, subtree: true };
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var observer = new MutationObserver(onMutationsObserved);
		observer.observe(target, config);
	}
	
	console.log("social stream injected");

	setInterval(function(){
		if (document.querySelector('.chat--height')){
			if (!document.querySelector('.chat--height').marked){
				document.querySelector('.chat--height').marked=true;
				onElementInserted(document.querySelector('.chat--height'));
			}
		}
	},1000);

})();