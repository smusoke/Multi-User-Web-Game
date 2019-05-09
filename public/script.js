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
        },
        computed: {
            register_status: function() {
                if (this.username === undefined && this.password === undefined) {
                    return "";
                }
                else {
                    return "Yo";
                }
            }
        }
    });
}

function register(event) {
	console.log(app.register_status);

    if (app.username !== undefined) {
    	console.log(app.username);
    	console.log(app.password);
    	console.log(app.register_status);
       	/*
        $.get(app.movie_type, app.movie_search, (data) => {
            app.search_results = data;
        }, "json");*/
    }
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