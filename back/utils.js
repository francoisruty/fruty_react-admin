const { Client } = require('pg');
const client = new Client()
client.connect()

const Clientsync = require('pg-native')
var clientsync = new Clientsync()
clientsync.connectSync()


module.exports = {
  client: client,
  clientsync: clientsync
}
