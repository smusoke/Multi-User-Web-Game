var app;
var green = "#1fce1f";
var red = "#f44336"


function Init() {

	app = new Vue({
		el: "#app",
		data: {
			username: undefined,
			password: undefined,
			text_color: "color:" + green,
			notLoggedIn: true,
			cookieTrue: false,
			register_status: "",

			//Todo: store user info for stats page
			gamesPlayed: 0,
			avatar: "/avatars/default.jpg",
			availableAvatars: [],
		},
		computed: {
			avatars: function(){
				$.get("/getavatars", (data) => {
						console.log("in here");

						finalAvatars = [];

						for( var i = 0; i < data['avatars'].length; i++ )
						{
							finalAvatars.push( data['avatars'][i] );
						}

						this.availableAvatars = finalAvatars;
						console.log(finalAvatars);
						return finalAvatars;
					}, "json");
			}
		}
	});

}


//Check for login
var cookieCheck = setInterval(() => {
		var decodedCookie = getCookie("cookieName");
		//console.log("Cookie is: " + decodedCookie);

		if (decodedCookie === "") {
			;
		}
		else {
			console.log("Logged in!!");

			//Get user info
			getUser(decodedCookie);
			clearInterval(cookieCheck);
			app.cookieTrue = true;
		}

	},500) ;



//Avatar click listener
function selectAvatar(element){
	var el = document.createElement('a');
	el.href = element.src;

	app.avatar = el.pathname;
	console.log(app.avatar);

	//Make green
	element.style.border = "4px solid #8fff0c";
}


function fillTable(){
	$.get("/getscores", (data) => {
			app.register_status = data['register_status'];
			app.username = data['username'];
			//app.testCookie = true; 
			var leaderboard = document.getElementById("leaderboardBody");

			for( var i = 0; i < data.length; i++ )
			{
				var entry = document.createElement("tr");  

				var avatar = document.createElement("td");
				var image = document.createElement("img");
				image.src = data[i]['avatar'];
				image.style.width = "5vw";
				avatar.appendChild(image);    

				var user = document.createElement("td");
				var userLink = document.createElement("a");
				userLink.href = "/users/" + data[i]['username'];
				userLink.innerText = data[i]['username'];
				user.appendChild(userLink);

				var score = document.createElement("td");
				score.innerText = data[i]['score'];

				entry.appendChild(avatar);
				entry.appendChild(user);
				entry.appendChild(score);

				leaderboard.appendChild(entry);
			}
		}, "json");
}



function fillUser(){

	var user = location.href.split("/users/").pop()
	console.log(user)

	$.post("/getinfo", { username : user }, (data) => {
			app.gamesPlayed = data['gamesPlayed'];
			app.avatar = data['avatar'];

			//TODO ADD USER INFO TO PAGE
			var leaderboard = document.getElementById("avatarImage");
			leaderboard.src = data['avatar'];

			
		}, "json");
}





function register(event) {
	//console.log(app.register_status);
	//console.log(app.testCookie);

	if (app.username !== undefined) {
		console.log(app.username);
		console.log(app.password);
		//app.avatar = 
		
		$.post("/register", { username: app.username, password : app.password, avatar: app.avatar}, (data) => {
			app.register_status = data['register_status'];
		}, "json");

		//We want register status, uuid(set cookie) *Server sets cookie
		console.log(app.register_status);
		console.log(typeof(app.register_status));

		setTimeout( closePopup(), 2500);
	}
}

function login(event) {
	//console.log(app.register_status);
	//console.log(app.testCookie);

	if (app.username !== undefined) {
		console.log(app.username);
		console.log(app.password);
		
		$.post("/login", { username: app.username, password : app.password}, (data) => {
			app.register_status = data['register_status'];
			console.log(data['register_status']);

			if( data['register_status'].includes('!') ){
				showGame();
			}
		}, "json");

		//We want register status, uuid(set cookie) *Server sets cookie
		console.log(app.register_status);
		console.log(typeof(app.register_status));
	}
	else{
		app.register_status = "Invalid fields";
	}
}


function getUser(id) {
	//console.log(app.register_status);
	//console.log(app.testCookie);

	$.post("/getuser", { uuid: id}, (data) => {
			app.username = data['username'];
			//app.testCookie = true; 
		}, "json");

}

function showGame() {


	document.getElementById("main").style.display = "none";

	var div = document.createElement("div");
	div.className = "container";
	div.id = "game";
	var game = document.createElement("iframe");  
	game.src = "/game/index.html?username=" + app.username;
	game.className = "twelve columns";
	game.style.minHeight = "540px";
	game.style.minWidth = "400px";


	div.appendChild(game);
			   


	// Get the reference node
	var referenceNode = document.getElementsByClassName('footer section')[0];

	// Insert the new node before the reference node
	if( !document.getElementById("game") ){
		referenceNode.parentNode.insertBefore(div, referenceNode);
	}


}

function showPopup() {
  document.getElementById("popup").style.display = "block";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

function getUsername(){
	return app.username;
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
	var c = ca[i];
	while (c.charAt(0) == ' ') {
	  c = c.substring(1);
	}
	if (c.indexOf(name) == 0) {
	  return c.substring(name.length, c.length);
	}
  }
  return "";
}

function logout(){

	document.cookie = "cookieName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
	window.location.href = "/";
	return false;

}
