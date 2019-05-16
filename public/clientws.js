var wsApp;
var ws;

function wsInit() {
    wsApp = new Vue({
        el: "#wsApp",
        data: {
            clientGroup: "default",
            client_count: 0,
            new_message: "",
            chat_messages: []
        }
    });

    var port = window.location.port || "80";
    console.log("ws://" + window.location.hostname + ":" + port);
    ws = new WebSocket("ws://" + window.location.hostname + ":" + port);

    ws.onopen = (event) => {
        console.log("Connection successful!");
    };

    ws.onmessage = (event) => {
        console.log("even data: " + event.data);
        var message = JSON.parse(event.data);
        if (message.msg === "client_count") {
            wsApp.client_count = message.data;
        }
        else if (message.msg === "text") {
            wsApp.chat_messages.push(message.data);
        }
        else if (message.msg === "historical") {
            wsApp.chat_messages = message.data;
        }
    };
}


function sendMessage() {
    ws.send(wsApp.new_message);
}

