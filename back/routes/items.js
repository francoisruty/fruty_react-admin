const express = require('express');
const {client, clientsync} = require('../utils');
const router = express.Router();

//NOTE: for react-admin, we must send an array directly in response, not an array wrapped in an object
router.get('/', function(req, res) {

  var rows = clientsync.querySync(
    `SELECT *
    FROM items`,
  []
  );

  res.setHeader('Content-Range', '0-' + rows.length + '/' + rows.length);
  res.json(rows);


});

router.get('/:item_id', function(req, res) {

  var rows = clientsync.querySync(
    `SELECT *
    FROM items WHERE id=$1`,
  [req.params.item_id]
  );

  if (rows.length === 0) {
    res.json({});
    return;
  }
  res.json(rows[0]);

});

router.put('/:item_id', function(req, res) {

  var rows = clientsync.querySync(
    `UPDATE items SET title=$2, description=$3 WHERE id=$1 RETURNING *`,
  [req.params.item_id, req.body.title, req.body.description]
  );

  res.json(rows[0]);

});

router.post('/', function(req, res) {

  var rows = clientsync.querySync(
    `INSERT INTO items (id, title, description) VALUES(Default, $1, $2) RETURNING *`,
  [req.body.title, req.body.description]
  );

  res.json(rows[0]);


});

router.delete('/:item_id', function(req, res) {
  var rows = clientsync.querySync(
    `DELETE
    FROM items WHERE id=$1 RETURNING *`,
  [req.params.item_id]
  );

  res.json(rows[0]);

});

module.exports = router;
