var app;
var green = "#1fce1f";
var red = "#f44336"

//test

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
			avatar:"/images/default.jpg",
		},
		computed: {

		}
	});
}

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


function fillTable(){
	$.get("/getscores", (data) => {
			app.register_status = data['register_status'];
			app.username = data['username'];
			//app.testCookie = true; 
			var leaderboard = document.getElementById("leaderboardBody");

			for( var i = 0; i < data.length; i++ )
			{
				var entry = document.createElement("tr");                 
				var user = document.createElement("td");
				user.innerText = data[i]['username'];
				var score = document.createElement("td");
				score.innerText = data[i]['score'];


				entry.appendChild(user);
				entry.appendChild(score);

				leaderboard.appendChild(entry);
			}
		}, "json");
}

function register(event) {
	//console.log(app.register_status);
	//console.log(app.testCookie);

	if (app.username !== undefined) {
		console.log(app.username);
		console.log(app.password);
		
		$.post("/register", { username: app.username, password : app.password}, (data) => {
			app.register_status = data['register_status'];
		}, "json");

		//We want register status, uuid(set cookie) *Server sets cookie
		console.log(app.register_status);
		console.log(typeof(app.register_status));
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
			app.register_status = data['register_status'];
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
	game.src = "/game/index.html";
	game.className = "twelve columns";
	game.style.minHeight = "470px";


	/*	TO DO FIX HEIGHT
	game.width = "900px";
	game.height = "700px";*/                    

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
