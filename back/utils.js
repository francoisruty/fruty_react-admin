const { Client } = require('pg');
const client = new Client()
client.connect()

const Clientsync = require('pg-native')
var clientsync = new Clientsync()
clientsync.connectSync()

const hasUpperCase = str => {
  return (/[A-Z]/.test(str));
}
const hasLowerCase = str => {
  return (/[a-z]/.test(str));
}
const hasNumber = myString => {
return /\d/.test(myString);
}

const ValidateEmail = mail =>
{
 if (/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(mail))
  {
    return true;
  }
    return false;
}

module.exports = {
  client: client,
  clientsync: clientsync,
  hasUpperCase: hasUpperCase,
  hasLowerCase: hasLowerCase,
  hasNumber: hasNumber,
  ValidateEmail: ValidateEmail
}
