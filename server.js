const express = require('express')
const fs = require('fs');
const path = require('path')
const app = express()
const port = 3000

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

app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`)
});