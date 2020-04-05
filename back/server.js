const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json()); // for parsing application/json
const cors = require('cors');
const request = require('request');
require('dotenv').config();
const {client, clientsync} = require('./utils');
const fs = require('fs');
const {parse, stringify} = require('flatted/cjs');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const corsOptions =  {
  origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers", "X-Total-Count, Content-Range");
    next();
});

app.use(function(req, res, next) {
    //when the front calls /api/authenticate, it doesn't have a token yet
    if (req.path == '/api/authenticate' || req.path == '/api/create_user') {
      return next();
    }

    var token = req.headers['authorization'];
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    var username = req.headers['username'];
    var rows = clientsync.querySync(
      `SELECT id, token FROM users WHERE username = $1`,
    [username]
    );
    if (rows.length == 0) {
      res.send(401);
    }

    var db_token = rows[0]['token'];
    var user_id = rows[0]['id']
    if (db_token !== token) {
      res.send(401);
      return;
    } else {
      req.headers['user_id'] = user_id;
      next();
    }
});

app.post('/api/create_user', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  bcrypt.hash(password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    var rows = clientsync.querySync(
      `INSERT INTO users (id, username, hash_pwd, token) VALUES(Default, $1, $2, '') RETURNING *`,
    [req.body.username, hash]
    );
    res.json({"result": "user created."});

  }); //end of bcrypt callback

});

app.post('/api/authenticate', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var rows = clientsync.querySync(
    `SELECT hash_pwd FROM users WHERE username=$1`,
  [req.body.username]
  );

  var hash = rows[0]['hash_pwd'];

  bcrypt.compare(password, hash, function(err, result) {
    //console.log(result);
    if (result == true) {
      var token = Date.now();
      var rows = clientsync.querySync(
        `UPDATE users set token = $1 WHERE username=$2`,
      [token, req.body.username]
      );
      res.json({"token": token});
      return;
    } else {
      res.send(401);
      return;
    }
  }); //end of hash compare callback

});

app.use('/api/items', require('./routes/items'));


app.use(function(err, req, res, next){
  console.error(err.stack);
  return res.status(err.status).json({ message: err.message });
});

app.listen(3010);
console.log('Listening on http://localhost:3010');
