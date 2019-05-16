const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const uuid = require('uuid/v4');
const crypto = require('crypto');

const WebSocket = require('ws');
const http = require('http');



const app = express()

//WS
const server = http.createServer(app);

const port = 8019


var db_filename = path.join(__dirname, 'db', 'gameDb.sqlite3');
var public_dir = path.join(__dirname, 'public');

app.use(express.static(public_dir));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());





// set a cookie
app.use( function(req, res, next) {

  // check if client sent cookie
  var cookie = req.cookies.cookieName;

  if (cookie === undefined)
  {
    console.log("No cookie");
  } 
  else
  {
    // yes, cookie was already present 
    console.log('cookie exists', cookie);
  } 

  next();
});




//Establish db
// CREATE TABLE users (username TEXT PRIMARY KEY, password TEXT, uuid UNIQUE);
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});



//Insert a username and pass
function addUser(username,password, avatar, uuid){

	db.run('INSERT INTO users ( username, password, uuid ) VALUES (?,?,?);', [username,password, uuid], function(err) {
	    if (err) {
	      return console.log(err.message);
	    }

	    console.log(`A row has been inserted with rowid ${this.lastID}`);
	  });

    db.run('INSERT INTO scores ( username, score, avatar, gamesPlayed, joinedDate ) VALUES (?,?,?,?,?);', [username,"0",avatar,0, new Date().toLocaleDateString() ], function(err) {
        if (err) {
          return console.log(err.message);
        }

        console.log(`A row has been inserted with rowid ${this.lastID}`);
      });
}


function hashString(str){
    var hash = crypto.createHash('md5').update(str).digest("hex");
    console.log(hash);
    return hash;
}


//Index page
app.get('/', (req, res) => {

	fs.readFile("index.html", function (error, pgResp) {
	            if (error) {
	                res.writeHead(404);
	                res.write('Contents you are looking are Not Found');
	            } else {
	                res.writeHead(200, { 'Content-Type': 'text/html' });
	                res.write(pgResp);
	            }
	            res.end();
	        });
});





app.post('/getinfo', (req, res) => {
    console.log("Get info: " + req.body.username);

    
    db.all('SELECT * FROM scores WHERE username = ?', [req.body.username], (err, rows) => {
        if (err) {
            console.log(err);
        }
        else {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write( JSON.stringify(rows[0]) );
            res.end();
        }
    });

});





app.post('/sendscore', (req, res) => {

    //Get old score
    db.all('SELECT * FROM scores WHERE username = ?', [req.body.username], (err, rows) => {
        if (err) {
            console.log(err);
        }
        else {
            var oldScore = parseInt( rows[0]['score'] );
            var newScore = parseInt( req.body.score );

            //Update info
            db.all('UPDATE scores SET score = ?, gamesPlayed = gamesPlayed + 1 WHERE username = ?', [Math.max(oldScore,newScore),req.body.username], (err, rows) => {
                if (err) {
                    console.log(err);
                }
                else {
                    //update score, gamesplayed

                    respo = {"Score update":"Success"};

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write( JSON.stringify(respo) );
                    res.end();
                }
            });
            
        }
    });

    
});


app.get('/getavatars', (req, res) => {

    var final = {}
    final['avatars'] = fs.readdirSync(public_dir+"/avatars/");
    console.log(final);

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write( JSON.stringify(final) );
    res.end();
    
});


//Leaderboad page
app.get('/leaderboards.html', (req, res) => {

	fs.readFile("leaderboards.html", function (error, pgResp) {
	            if (error) {
	                res.writeHead(404);
	                res.write('Contents you are looking are Not Found');
	            } else {
	                res.writeHead(200, { 'Content-Type': 'text/html' });
	                res.write(pgResp);
	            }
	            res.end();
	        });
});


//
app.post('/login', function (req, res) {

    console.log(req.body.username);
    console.log(req.body.password);

    //res.write(JSON.stringify(rows));

    db.all('SELECT * FROM users WHERE username = ? ', [req.body.username], (err, rows) => {
        if (err) {
            console.log(err);
        }
        else {

        	if(rows.length > 0){
        		respo = rows[0];

        		//Password is right, respond with cookie
        		if( rows[0]['password'] == hashString(req.body.password) ){
        			res.cookie('cookieName',rows[0]['uuid'], {expire : new Date() + 9999});
        			respo['register_status'] = "Successfully logged in!";
        		}

        		//passwrod is wrong
        		else{
        			respo = {"register_status":"Invalid password"};
        		}

        		res.writeHead(200, {'Content-Type': 'application/json'});
            	res.write( JSON.stringify(respo) );
            	res.end();
            }

            //No users
            else{
            	res.writeHead(200, {'Content-Type': 'application/json'});

            	respo = {"register_status":"Invalid username"};

            	res.write(JSON.stringify(respo));
            	res.end();
            }
        }
    });
});


app.get('/getscores', function (req, res) {

    //res.write(JSON.stringify(rows));


    db.all('SELECT * FROM scores ORDER BY score DESC LIMIT 10', (err, rows) => {
        if (err) {
            console.log(err);
        }
        else {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write( JSON.stringify(rows) );
            res.end();
        }
    });

});


app.post('/register', function (req, res) {

    console.log(req.body.username);
    console.log(req.body.password);

    db.all('SELECT * FROM users WHERE username = ?', [req.body.username], (err, rows) => {
        if (err) {
            console.log(err);
        }
        else {

        	if(rows.length > 0){
        		res.writeHead(200, {'Content-Type': 'application/json'});

            	respo = {"register_status":"User already registered"};

            	res.write(JSON.stringify(respo) );
            	res.end();
            }

            //No user found so add it
            else{
            	// set a new cookie
            	var random = uuid()
            	res.cookie('cookieName',random, {expire : new Date() + 9999});
            	console.log('Cookie created successfully: ' + random);

            	res.writeHead(200, {'Content-Type': 'application/json'});

            	addUser(req.body.username, hashString(req.body.password) ,req.body.avatar ,random);


            	respo = {"register_status":"Registered!"};

            	res.write(JSON.stringify(respo));
            	res.end();
            }
        }
    });


});



app.post('/getuser', function (req, res) {

    console.log(req.body.uuid);

    //res.write(JSON.stringify(rows));

    db.all('SELECT * FROM users WHERE uuid = ? ', [req.body.uuid], (err, rows) => {
        if (err) {
            console.log(err);
        }
        else {

        	if(rows.length > 0){

        		res.writeHead(200, {'Content-Type': 'application/json'});
            	res.write( JSON.stringify(rows[0]) );
            	res.end();
            }

            //No users
            else{
            	res.writeHead(200, {'Content-Type': 'application/json'});

            	respo = {"register_status":"Invalid uuid"};

            	res.write(JSON.stringify(respo));
            	res.end();
            }
        }
    });
});


//user path
app.get('/users/:nconst', (req, res) => {
    console.log(req.params.nconst);

    fs.readFile(public_dir + "/user.html", function (error, pgResp) {
                if (error) {
                    console.log(error);
                    res.writeHead(404);
                    res.write('Contents you are looking are Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(pgResp);
                }
                res.end();
            });

});


//WS
var wss = new WebSocket.Server({server: server});
//Need for clientcount
var clients = {};

var client_count = 0;

//Maintain chat rooms
var rooms = {
    //"default" : [],
};



///WS functions
function UpdateClientCount() {
    var message = {msg: 'client_count', data: client_count};
    Broadcast(JSON.stringify(message));
}

function Broadcast(message) {

    parsedMsg = JSON.parse(message);

    if( parsedMsg.msg == "client_count" ){
        var id;
        for (id in clients) {
            if (clients.hasOwnProperty(id)) {
                clients[id].send(message);
            }
        }
    }
    //Text message broadcast
    else if ( parsedMsg.msg == "text" ){

        console.log(rooms[parsedMsg.room]);
        console.log(rooms[parsedMsg.room].length);
        //console.log( Object.keys(clients) );

        //for (var id in rooms[parsedMsg.room]) {
        for (var x = 0; x < rooms[parsedMsg.room].length ; x++){

            cur = rooms[parsedMsg.room][x];

            if (clients.hasOwnProperty(cur)) {
                console.log("sending to "+cur);
                clients[cur].send(message);
            }
        }
    }


}

wss.on('connection', (ws) => {
    var client_id = ws._socket.remoteAddress + ":" + ws._socket.remotePort;
    console.log('New connection: ' + client_id);

    clients[client_id] = ws;
    client_count++;

    ws.on('message', (message) => {
        parsedMessage = JSON.parse(message);
        console.log('Message from ' + client_id + ': ' + JSON.stringify(parsedMessage) );

        console.log(parsedMessage);

        //Server update
        if( parsedMessage.msg == "roomUpdate" ){
            curRoom = parsedMessage.room;

            //Check if room exits, if not create
            if( !rooms[curRoom] ){
                rooms[curRoom] = [];
            }

            //Make sure not duplicate
            if( !rooms[curRoom].includes(client_id) ){
                rooms[curRoom].push(client_id);
            }

            console.log(rooms);
        }
        //Receiving a message to broadcast
        else if( parsedMessage.msg == "text" ){
            var chat = {msg: 'text' ,data: parsedMessage.data, room: parsedMessage.room };
            Broadcast(JSON.stringify(chat));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected: ' + client_id);
        delete clients[client_id];
        client_count--;

        //Remove from all rooms
        for( var key in rooms ){
            for( var i =0; i < rooms[key].length; i++ ){
                if( client_id == rooms[key][i] ){
                    delete rooms[key][i];
                }
            }
        }

        console.log("New rooms: " + JSON.stringify(rooms));


        UpdateClientCount();
    });

    UpdateClientCount();
});






server.listen(port, () => {
	console.log(`Example app listening on port ${port}!`)
});