var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var redis = require('redis');
var client = redis.createClient();

const { promisify } = require('util')
const hmsetAsync = promisify(client.hmset).bind(client);
const incrAsync = promisify(client.incr).bind(client);
const hgetallAsync = promisify(client.hgetall).bind(client);

//parses valid strings of json for use of objects. POST reqs must contain content-type header with value of "application/json"
app.use(bodyParser.json());

//defines root route
app.get('/', function (req, res) {
  res.send('Hello World')
});

//stores resource at unique addres (ID)
app.post('/person', async function (req, res) {
  const id = await incrAsync('people-id');
  const person = { ...req.body, id };
  await hmsetAsync(`person:${id}`, person)
  res.status(201).send({ ...person });
});

//returns a resource stored at unique address (in this case is a number- ID)
app.get('/person/:id', async function (req, res) {
  const person = await hgetallAsync(`person:${req.params.id}`)
  res.status(200).send({ ...person })
});
console.log('port 3000 is listening!')
app.listen(3000);
