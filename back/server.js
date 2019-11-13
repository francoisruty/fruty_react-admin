const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json()); // for parsing application/json
const cors = require('cors');
const request = require('request');
require('dotenv').config();
const { Client } = require('pg')
const client = new Client()
client.connect()
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
    if (req.path == '/api/authenticate') {
      return next();
    }

    var token = req.headers['authorization'];
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    var username = req.headers['username'];
    const text = `SELECT token FROM creds WHERE username = $1`;
    const values = [username];
    client.query(text, values, (err, results) => {
      if (err) {
        console.log(err);
        res.send(401);
      } else {
        if (results.rows.length == 0) {
          res.send(401);
        }
        var db_token = results.rows[0]['token'];
        if (db_token !== token) {
          res.send(401);
        } else {
          return next();
        }
      }
    });//end of db check callback

});

app.post('/api/create_user', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  bcrypt.hash(password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    const text = `INSERT INTO creds (id, username, hash_pwd, token) VALUES(Default, $1, $2, '') RETURNING *`;
    const values = [req.body.username, hash];
    client.query(text, values, (err, results) => {
      if (err) {
        res.json({"result": "error with DB insertion"});
      } else {
        res.json({"result": "user created."});
      }
    });//end of db insert callback
  }); //end of bcrypt callback

});

app.post('/api/authenticate', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  const text = `SELECT hash_pwd FROM creds WHERE username=$1`;
  const values = [req.body.username];
  client.query(text, values, (err, results) => {
    if (err) {
      console.log(err);
      res.send(401);
    } else {
      var hash = results.rows[0]['hash_pwd'];
      //console.log(hash);
      //console.log(password);
      bcrypt.compare(password, hash, function(err, result) {
        //console.log(result);
        if (result == true) {
          var token = Date.now();
          const text = `UPDATE creds set token = $1 WHERE username=$2`;
          const values = [token, req.body.username];
          client.query(text, values, (err, results) => {
            if (err) {
              res.send(401);
            } else {
              res.json({"token": token});
            }
          }); //end of token insertion callback
        } else {
          res.send(401);
        }
      }); //end of hash compare callback
    }
  });//end of db select callback

});

//NOTE: for react-admin, we must send an array directly in response, not an array wrapped in an object
app.get('/api/items', function(req, res) {
  const text = `SELECT *
  FROM items`;
  const values = [];
  client.query(text, values, (err, results) => {
    if (err) {
      res.setHeader('Content-Range', 'items 0-0/0');
      res.json([]);
    } else {
      res.setHeader('Content-Range', '0-' + results.rows.length + '/' + results.rows.length);
      res.json(results.rows);
    }
  });
});

app.get('/api/items/:item_id', function(req, res) {
  const text = `SELECT *
  FROM items WHERE id=$1`;
  const values = [req.params.item_id];
  client.query(text, values, (err, results) => {
    if (err) {
      res.json({});
    } else {
      res.json(results.rows[0]);
    }
  });
});

app.put('/api/items/:item_id', function(req, res) {
  const text = `UPDATE items SET title=$2, description=$3 WHERE id=$1`;
  const values = [req.params.item_id, req.body.title, req.body.description];
  client.query(text, values, (err, results) => {
    if (err) {
      res.json({});
    } else {
      res.json(req.body);
    }
  });
});

app.post('/api/items', function(req, res) {
  const text = `INSERT INTO items (id, title, description) VALUES(Default, $1, $2) RETURNING *`;
  const values = [req.body.title, req.body.description];
  client.query(text, values, (err, results) => {
    if (err) {
      res.json({});
    } else {
      res.json(results.rows[0]);
    }
  });
});

app.delete('/api/items/:item_id', function(req, res) {
  const text = `DELETE
  FROM items WHERE id=$1`;
  const values = [req.params.item_id];
  client.query(text, values, (err, results) => {
    if (err) {
      res.json({});
    } else {
      res.json({id: req.params.item_id});
    }
  });
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  return res.status(err.status).json({ message: err.message });
});

app.listen(3010);
console.log('Listening on http://localhost:3010');
