const express = require('express');
const {client, clientsync} = require('../utils');
const router = express.Router();

//NOTE: for react-admin, we must send an array directly in response, not an array wrapped in an object
router.get('/', function(req, res) {

  var text = `
  SELECT *
  FROM items
  `;
  var values = []

  var sort = req.query.sort;
  if (sort !== undefined) {
    sort = JSON.parse(sort);
    if (sort.length == 2 && sort[0] !== null && sort[1] !== null) {
      text = text + ` ORDER BY ` + sort[0] + ` ` + sort[1];
    }
  }

  var range = req.query.range;
  if (range !== undefined) {
    range = JSON.parse(range);
    nb = range[1] - range[0];
    text = text + ' LIMIT ' + nb;
    text = text + ' OFFSET ' + range[0];

    var count = clientsync.querySync(
      `
      SELECT COUNT(*) FROM items
      `,
      []
    )[0]['count'];

    var rows = clientsync.querySync(text, values);
    res.setHeader('Content-Range', range[0] + '-' + range[1] + '/' + count);

  } else {
    var rows = clientsync.querySync(text, values);
    res.setHeader('Content-Range', '0-' + rows.length + '/' + rows.length);

  }

  res.json(rows);


});

router.get('/:item_id', function(req, res) {

  var rows = clientsync.querySync(
    `SELECT *
    FROM items WHERE id=$1`,
  [req.params.item_id]
  );

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
