// init project
const express = require('express');
const Sequelize = require('sequelize');
const app = express();

// default questions list
const questions = [
      ["How could you survive in the wilderness for a month?", "E123ABC", "Q1"],
      ["Is there such a thing as universal time?", "E456ABC", "Q2"],
      ["How do I get to Aba from Lagos?", "E123ABC", "Q3"],
      ["How many people can a moon made of cheese feed?", "E456ABC", "Q4"]
    ];

const answers = [
      ["I couldn't.", "Q1", "U123ABC"],
      ["Yes, but we'll never use it.", "Q2", "U456ABC"],
      ["Make 3 lefts, a bizarre series of rights, and then go straight for 6 light years.", "Q3", "U123ABC"]
    ];

let Question;
let Answers;

// setup a new database
// using database credentials set in .env
const sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
    // Security note: the database is saved to the file `database.sqlite` on the local filesystem. It's deliberately placed in the `.data` directory
    // which doesn't get copied if someone remixes the project.
  storage: '.data/database.sqlite'
});

// authenticate with the database
sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    // define a new table 'questions'
    Question = sequelize.define('questions', {
      question_text: {
        type: Sequelize.STRING
      },
      enquirer_id: {
        type: Sequelize.STRING
      },
      question_id: {
          type: Sequelize.STRING
      }
    });
    // define a new table 'answers'
    Answers = sequelize.define('answers', {
        answer_text: {
          type: Sequelize.STRING
        },
        question_id: {
          type: Sequelize.STRING
        },
        uliza_expert_id: {
            type: Sequelize.STRING
        }
      });
    // relevant: uliza_expert_id, enquirer_id, question_id,
    // question_text, answer_id, answer_text
    setup();
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

// populate table with default users
function setup(){
  Question.sync({force: false}) // We use 'force: true' in this example to drop the table users if it already exists, and create a new one. You'll most likely want to remove this setting in your own apps
    .then(function(){
      // Add the default questions to the database
      for(var i=0; i<questions.length; i++){ // loop through all users
        Question.create({ question_text: questions[i][0], enquirer_id: questions[i][1], question_id: questions[i][2]}); // create a new entry in the users table
      }
    });  
  Answers.sync({force: false}) // We use 'force: true' in this example to drop the table users if it already exists, and create a new one. You'll most likely want to remove this setting in your own apps
    .then(function(){
      // Add the default answers to the database
      for(var i=0; i<questions.length; i++){ // loop through all users
        Answers.create({ question_text: questions[i][0], enquirer_id: questions[i][1], question_id: questions[i][2]}); // create a new entry in the users table
      }
    });  
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/users", function (request, response) {
  var dbUsers=[];
  User.findAll().then(function(users) { // find all entries in the users tables
    users.forEach(function(user) {
      dbUsers.push([user.firstName,user.lastName]); // adds their info to the dbUsers value
    });
    response.send(dbUsers); // sends dbUsers back to the page
  });
});

// creates a new entry in the users table with the submitted values
app.post("/users", function (request, response) {
  User.create({ firstName: request.query.fName, lastName: request.query.lName});
  response.sendStatus(200);
});

// drops the table users if it already exists, populates new users table it with just the default users.
app.get("/reset", function (request, response) {
  setup();
  response.redirect("/");
});

// removes all entries from the users table
app.get("/clear", function (request, response) {
  User.destroy({where: {}});
  response.redirect("/");
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});