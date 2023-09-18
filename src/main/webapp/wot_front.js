var baseURI = "http://localhost:8080/waslab02";
var tweetsURI = baseURI+"/tweets";

var req;
var tweetBlock = "	<div id='tweet_{0}' class='wallitem'>\n\
	<div class='likes'>\n\
	<span class='numlikes'>{1}</span><br /> <span\n\
	class='plt'>people like this</span><br /> <br />\n\
	<button onclick='{5}Handler(\"{0}\")'>{5}</button>\n\
	<br />\n\
	</div>\n\
	<div class='item'>\n\
	<h4>\n\
	<em>{2}</em> on {4}\n\
	</h4>\n\
	<p>{3}</p>\n\
	</div>\n\
	</div>\n";

String.prototype.format = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined'
			? args[number]
		: match
		;
	});
};

function likeHandler(tweetID) {
	var target = 'tweet_' + tweetID;
	var uri = tweetsURI+ "/" + tweetID +"/likes";
	// e.g. to like tweet #6 we call http://localhost:8080/waslab02/tweets/6/like

	req = new XMLHttpRequest();
	req.open('POST', uri, /*async*/true);
	req.onload = function() { 
		if (req.status == 200) { // 200 OK
			document.getElementById(target).getElementsByClassName("numlikes")[0].innerHTML = req.responseText;
		}
	};
	req.send(/*no params*/null);
}

function deleteHandler(tweetID) {
	/*

	 * TASK #4 

	 */	
	var target = 'tweet_' + tweetID;
	var uri = tweetsURI+ "/" + tweetID;
	var token = localStorage.getItem("token" + tweetID);

	req = new XMLHttpRequest();
	req.open('DELETE', uri, /*async*/true);
	req.setRequestHeader("Authorization", token);
	req.onload = function() { 
		if (req.status == 200) { 
			var tw = document.getElementById("tweet_" + tweetID);
			localStorage.removeItem("token" + tweetID);
			localStorage.removeItem("id" + tweetID);
			console.log(tweetID)
			tw.remove();
			document.getElementById(target).getElementsByClassName("numlikes")[0].innerHTML = req.responseText;
		}
	};
	req.send(/*no params*/null);
}
 
function getTweetHTML(tweet, action) {  // action :== "like" xor "delete"
	var dat = new Date(tweet.date);
	var dd = dat.toDateString()+" @ "+dat.toLocaleTimeString();
	return tweetBlock.format(tweet.id, tweet.likes, tweet.author, tweet.text, dd, action);

}

function getTweets() {
	req = new XMLHttpRequest(); 
	req.open("GET", tweetsURI, true); 
	req.onload = function() {
		if (req.status == 200) { // 200 OK
			var tweet_list = req.responseText;
			/*
			 * TASK #2 
			 */
			var twJSON = JSON.parse(tweet_list);
			var twHTML = "";
			for(let i = 0; i < twJSON.length; ++i){
				var tw = twJSON[i];
				if (localStorage.getItem("id" + tw.id) != null && tw.id == localStorage.getItem("id" + tw.id)) {
					twHTML += getTweetHTML(tw, "delete");
				} else {
					twHTML += getTweetHTML(tw, "like");
				}
			}
			
			document.getElementById("tweet_list").innerHTML = twHTML;
		}
	};
	req.send(null); 
};


function tweetHandler() {
	var author = document.getElementById("tweet_author").value;
	var text = document.getElementById("tweet_text").value;
	/*
	 * TASK #3 -->
	 */
	
	req = new XMLHttpRequest();
	req.open('POST', tweetsURI, /*async*/true);
	req.onload = function() { 
		if (req.status == 200) { // 200 OK
			var nt = JSON.parse(req.responseText);
			var tweetHTML = getTweetHTML(nt, "delete");
			var id = nt.id;
			var token = nt.token;
			
			localStorage.setItem("id" + id, id);
			localStorage.setItem("token" + id, token);
			
			document.getElementById("tweet_list").innerHTML = tweetHTML + document.getElementById("tweet_list").innerHTML;
		}
	};
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify({author:author, text: text}));


	// clear form fields
	document.getElementById("tweet_author").value = "";
	document.getElementById("tweet_text").value = "";

};

//main
function main() {
	document.getElementById("tweet_submit").onclick = tweetHandler;
	getTweets();
};
