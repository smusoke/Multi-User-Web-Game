var wsApp;
var ws;

function wsInit() {
    wsApp = new Vue({
        el: "#wsApp",
        data: {
            username: "New User " + Math.floor(Math.random() * 100) + 1  ,
            clientGroup: "",
            client_count: 0,
            messages_length: 0,
            new_message: "",
            chat_messages:[
                //["Bobby","Whats good"],
            ],
        }
    });

    var port = window.location.port || "80";
    console.log("ws://" + window.location.hostname + ":" + port);
    ws = new WebSocket("ws://" + window.location.hostname + ":" + port);

    ws.onopen = (event) => {
        console.log("Connection successful!");
    };

    ws.onmessage = (event) => {
        //console.log("event data: " + event.data);
        var message = JSON.parse(event.data);

        //Message so add it to the model
        if (message.msg === "text") {
            //List of lists that have each index correspodnto certain

            //wsApp.chat_messages.push(message.data);
            parsedData = JSON.parse(message.data)
            wsApp.chat_messages.push(parsedData);
        }

        else if (message.msg === "historical") {
            wsApp.chat_messages = message.data;
        }
    };

    //Scrol chat
    var scrollDown = setInterval(() => {
        //console.log("Curnume is " +wsApp.messages_length);
        //console.log("actual is " +wsApp.chat_messages.length);

        if( wsApp.messages_length < wsApp.chat_messages.length){
            var chatC = document.getElementById("chatContainer");
            chatC.scrollTop = chatC.scrollHeight;

            wsApp.messages_length = wsApp.chat_messages.length;

        }

        },250) ;
}


//Check for login
var cookieChec = setInterval(() => {
        var decodedCookie = getCookie("cookieName");
        //console.log("Cookie is: " + decodedCookie);

        if (decodedCookie === "") {
            ;
        }
        else {
            console.log("Logged in!!");

            //Get user info
            getUser(decodedCookie);
            clearInterval(cookieChec);
        }

    },500) ;







function getUser(id) {
    //console.log(app.register_status);
    //console.log(app.testCookie);

    $.post("/getuser", { uuid: id}, (data) => {
            wsApp.username = data['username'];
            //app.testCookie = true; 
        }, "json");

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


function updateRoom(){
    wsApp.clientGroup = document.getElementById("chatRoomInput").value;
    //Need to update chat text top of html

    //Send room to server
    roomInfo = {"msg":"roomUpdate", "room":wsApp.clientGroup}
    ws.send(JSON.stringify(roomInfo) );

    console.log("Chat room is now: " + wsApp.clientGroup);
}

function sendMessage() {
    if(wsApp.clientGroup === ""){
        alert("Please fill in chat name");
    }
    else{
        //Send message with room
        msg = [wsApp.username,wsApp.new_message];

        msgJson = {"msg":"text", "data":JSON.stringify(msg), "room":wsApp.clientGroup};
        ws.send(JSON.stringify(msgJson));
    }
}

