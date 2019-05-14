const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const uuid = require('uuid/v4');
const crypto = require('crypto');


const app = express()
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
function addUser(username,password, uuid){

	db.run('INSERT INTO users ( username, password, uuid ) VALUES (?,?,?);', [username,password, uuid], function(err) {
	    if (err) {
	      return console.log(err.message);
	    }

	    console.log(`A row has been inserted with rowid ${this.lastID}`);
	  });

    db.run('INSERT INTO scores ( username, score, avatar, gamesPlayed, joinedDate ) VALUES (?,?,?,?,?);', [username,"0","/images/default.jpg",0, new Date().toLocaleDateString() ], function(err) {
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

//todo listen for user path
///names/:nconst
//Index page
app.get('/users/:nconst', (req, res) => {
    console.log(req.params.nconst);

    db.all('SELECT * FROM scores WHERE username = ?', [req.params.nconst], (err, rows) => {
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

            	addUser(req.body.username, hashString(req.body.password) ,random);


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



app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`)
});