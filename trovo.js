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
	  
	  var chatmessage = "";
	  var chatname = "";
	  var chatimg = "";
	  
	  try{
		chatname = ele.querySelector(".nick-name").innerText;
	  } catch(e){}
	  
	  if (!textOnlyMode){
		  try{
			chatmessage = ele.querySelector(".content").innerHTML;
		  } catch(e){return;}
	  } else {
		  try{
			chatmessage = ele.querySelector(".content").innerText;
		  } catch(e){
			  return;
		  }
	  }
	  
	  try{
		chatimg = ele.querySelector('div.avatar.wrapper').querySelector('img.img-face').src;
	  } catch(e){}
	  
	  var chatdonation = "";
	  var chatmembership = "";
	  var chatsticker = "";
	  var chatbadges = "";
	  var hasDonation = '';
	  var hasMembership = '';
	  var backgroundColor = "";
	  var textColor = "";
	

	  var data = {};
	  data.chatname = chatname;
	  data.chatbadges = chatbadges;
	  data.backgroundColor = backgroundColor;
      data.textColor = textColor;
	  data.chatmessage = chatmessage;
	  data.chatimg = chatimg;
	  data.hasDonation = hasDonation;
	  data.hasMembership = hasMembership;
	  data.type = "trovo";
	  
		if (data.chatimg && avatars){
			toDataURL(data.chatimg, function(dataUrl) {
				data.chatimg = dataUrl;
				try {
					chrome.runtime.sendMessage(chrome.runtime.id, { "message": data }, function(){});
				} catch(e){}
			});
		} else {
			data.chatimg = "";
			try {
				chrome.runtime.sendMessage(chrome.runtime.id, { "message": data }, function(){});
			} catch(e){}
		}
	}

	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
			try{
				if ("focusChat" == request){
					try{
						document.querySelector(".input-box>.editor").focus();
					} catch(e){
						sendResponse(false);
						return
					}
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
				
				if ("noAvatars" == request){
					avatars = false;
					sendResponse(true);
					return;
				} else if ("sendAvatars" == request){
					avatars = true;
					sendResponse(true);
					return;
				}
			} catch(e){}
			sendResponse(false);
		}
	);
	var avatars = true;
	var textOnlyMode = false;
	chrome.runtime.sendMessage(chrome.runtime.id, { "getSettings": true }, function(response){  // {"state":isExtensionOn,"streamID":channel, "settings":settings}
		if ("settings" in response){
			if ("textonlymode" in response.settings){
				textOnlyMode = response.settings.textonlymode;
			}
		}
		if ("settings" in response){
			if ("noavatars" in response.settings){
				avatars = !response.settings.noavatars;
			}
		}
	});

	var started = false;
	function onElementInserted(target, callback) {
		var onMutationsObserved = function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.addedNodes.length) {
					for (var i = 0, len = mutation.addedNodes.length; i < len; i++) {
						if (mutation.addedNodes[i].classList.contains("message-comp")) {
							if (mutation.addedNodes[i].set123){continue;}
							mutation.addedNodes[i].set123 = true;
							callback(mutation.addedNodes[i]);
						} 
					}
				}
			});
		};
		if (!target){return;}
		started = true;
		var config = { childList: true, subtree: true };
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var observer = new MutationObserver(onMutationsObserved);
		observer.observe(target, config);
	}

    console.log("Social stream inserted");
	
	document.querySelectorAll(".message-comp").forEach(ele=>{
		ele.set123 = true;
	});
	setTimeout(function(){
		if (!started){
			var ele = document.querySelector(".chat-list"); 
			if (ele){
				onElementInserted(ele, function(element){
				  processMessage(element);
				});
			}
		}
	},4000);

	
})();