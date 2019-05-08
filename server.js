const express = require('express')
const fs = require('fs');
const path = require('path')
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const uuid = require('uuid/v4')


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
    // set a new cookie
    var random = uuid()
    res.cookie('cookieName',random, { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully: ' + random);

  } 
  else
  {
    // yes, cookie was already present 
    console.log('cookie exists', cookie);
  } 

  next();
});




//Establish db
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

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


app.post('/login', function (req, res) {
    //res.send('POST Request');
    //console.log(res);
    console.log(req.body.username);
    console.log(req.body.password);

    /*
		-Check submission
		*/
});



app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`)
});