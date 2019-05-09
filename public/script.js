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
			register_status: "",
			notLoggedIn: true
		},
		computed: {
			/*
			username: function(){
				console.log("Need to get login");
				return undefined;
			}*/


			testCookie: function() {
				var decodedCookie = getCookie("cookieName");
				console.log("Cookie is: " + decodedCookie);


				if (decodedCookie === "") {
					return false;
				}
				else {
					console.log("Logged in!!");
					this.notLoggedIn = false;

					//Get user info
					getUser(decodedCookie);


					showGame();
					return true;
				}
			}
		}
	});
}

function register(event) {
	//console.log(app.register_status);
	//console.log(app.testCookie);

	if (app.username !== undefined) {
		console.log(app.username);
		console.log(app.password);
		
		$.post("/register", { username: app.username, password : app.password}, (data) => {
			app.register_status = data['register_status'];
			app.notLoggedIn = false;
			app.testCookie = true; 
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
			//app.notLoggedIn = false;
			//app.testCookie = true; 
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
  var game = document.createElement("iframe");  
  game.src = "/game/index.html";
  game.className = "twelve columns";
  game.minHeight = "500px";


  /*	TO DO FIX HEIGHT
  game.width = "900px";
  game.height = "700px";*/                    

  div.appendChild(game);
			   


  // Get the reference node
  var referenceNode = document.getElementsByClassName('footer section')[0];

  // Insert the new node before the reference node
  referenceNode.parentNode.insertBefore(div, referenceNode);    
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


