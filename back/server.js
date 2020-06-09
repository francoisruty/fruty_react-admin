const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json()); // for parsing application/json
const cors = require('cors');
const request = require('request');
require('dotenv').config();
const {client, clientsync, hasUpperCase, hasLowerCase, hasNumber, ValidateEmail} = require('./utils');
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
    var email = req.headers['email'];
    var rows = clientsync.querySync(
      `SELECT id, token FROM users WHERE email = $1`,
    [email]
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
  var email = req.body.email.toLowerCase().trim();
  var password = req.body.password;

  if (password.length < 8 || !(hasUpperCase(password) && hasLowerCase(password) && hasNumber(password)) ) {
    res.status(400).send({
      "case": 2,
      "message": "Le mot de passe doit contenur une minuscule, une majuscule, un chiffre, et avoir au moins 8 caractères."
    });
    return;
  }
  if (ValidateEmail(email) === false) {
    res.status(400).send({
      "case": 3,
      "message": "Le format de l'email est incorrect."
    });
    return;
  }

  var rows = clientsync.querySync(
    "SELECT * FROM users where email=$1",
    [email]
  );

  if (rows.length > 0) {
    res.status(500).send({
      "message": "Cet email est déjà pris."
    });
    return;
  }


  bcrypt.hash(password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    var rows = clientsync.querySync(
      `INSERT INTO users (id, email, hash_pwd, token) VALUES(Default, $1, $2, '') RETURNING *`,
    [email, hash]
    );
    res.json({"result": "user created."});

  }); //end of bcrypt callback

});

app.post('/api/authenticate', function(req, res) {
  var email = req.body.email.toLowerCase().trim();
  var password = req.body.password;

  var rows = clientsync.querySync(
    `SELECT hash_pwd FROM users WHERE email=$1`,
  [email]
  );

  var hash = rows[0]['hash_pwd'];

  bcrypt.compare(password, hash, function(err, result) {
    //console.log(result);
    if (result == true) {
      var token = Date.now();
      var rows = clientsync.querySync(
        `UPDATE users set token = $1 WHERE email=$2`,
      [token, email]
      );
      res.json({"token": token, "email": email});
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
