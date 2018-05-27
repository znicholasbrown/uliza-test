// init project
var express = require('express');
var Sequelize = require('sequelize');
var uniqid = require('uniqid');
const app = express();

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});

// default questions list
var questions = [
      ["How could you survive in the wilderness for a month?", "E123ABC", "Q1", true],
      ["Is there such a thing as universal time?", "E456ABC", "Q2", true],
      ["How do I get to Aba from Lagos?", "E123ABC", "Q3", true],
      ["How many people can a moon made of cheese feed?", "E456ABC", "Q4", false],
      ["Why do my feet look like a troll\'s feet?", "E457ABC", "Q5", false],
      ["Who killed JFK?", "E456ABC", "Q12", false],
      ["Does Darth Vader have asthma?", "E458ABC", "Q6", false],
      ["I saw 10 movies in one week once", "E459ABC", "Q7", false],
      ["Is yogurt gurt from a yo or yo from a gurt?", "E460ABC", "Q8", false],
      ["How much wood could a wood-chuck chuck if a wood-chuck could chuck wood?", "E460ABC", "Q9", false],
      ["Does middle-aged George Clooney make young George Clooney look like a dumpster full of garbage?", "E456ABC", "Q10", false],
      ["Why is nature so scary?", "E456ABC", "Q11", false]
    ];

var answers = [
      ["I couldn\'t.", "Q1", "U123ABC", "A123ABC"],
      ["Yes, but we'll never use it.", "Q2", "U456ABC", "A124ABC"],
      ["Make 3 lefts, a bizarre series of rights, and then go straight for 6 light years.", "Q3", "U123ABC", "A125ABC"]
    ];

var Question;
var Answer;

// setup a new database
// using database credentials set in .env
var sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
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
      },
      answered: {
        type: Sequelize.BOOLEAN
      }
    });
    // define a new table 'answers'
    Answer = sequelize.define('answers', {
        answer_text: {
          type: Sequelize.STRING
        },
        question_id: {
          type: Sequelize.STRING
        },
        uliza_expert_id: {
          type: Sequelize.STRING
        },
        answer_id: {
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

// populate table with default questions and answers
function setup(){
  Question.sync({force: true}) // We use 'force: true' in this example to drop the table questions if it already exists, and create a new one. You'll most likely want to remove this setting in your own apps
    .then(function(){
      // Add the default questions to the database
      for(var i=0; i<questions.length; i++){ // loop through all questions
        Question.create({ question_text: questions[i][0], enquirer_id: questions[i][1], question_id: questions[i][2], answered: questions[i][3] }); // create a new entry in the questions table
      }
    });  
  Answer.sync({force: true})
    .then(function(){
      // Add the default answers to the database
      for(var i=0; i<answers.length; i++){ // loop through all answers
        Answer.create({ answer_text: answers[i][0], question_id: answers[i][1], uliza_expert_id: answers[i][2], answer_id: answers[i][3] }); // create a new entry in the answers table
      }
    });  
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/askerIndex.html');
});

app.get("/experts", function (request, response) {
  response.sendFile(__dirname + '/views/expertIndex.html');
});


app.get("/questions", function (request, response) {
  var dbQuestions=[];
  Question.findAll().then(function(questions) { // find all entries in the questions tables
    questions.forEach(function(question) {
      dbQuestions.push([question.question_text, question.enquirer_id, question.question_id, question.answered]); // adds their info to the dbQuestions value
    });
    response.send(dbQuestions); // sends dbQuestions back to the page
  });

});

app.get("/unanswered", function (request, response) {
  var dbQuestions=[];
  Question.findAll({
    where: {
      answered: false
    }
  }).then(function(questions) { // find all entries in the questions tables
    questions.forEach(function(question) {
      dbQuestions.push([question.question_text, question.enquirer_id, question.question_id]); // adds their info to the dbQuestions value
    });
    response.send(dbQuestions); // sends dbQuestions back to the page
  });

});

// creates a new entry in the questions table
app.post("/questions", function (request, response) {
  let randomID = 'Q' + uniqid();
  Question.create({ question_text: request.query.question_text, enquirer_id: request.query.enquirer_id, question_id: randomID, answered: false });
  response.send({ question_text: request.query.question_text, enquirer_id: request.query.enquirer_id, question_id: randomID, answered: false });
});

app.post("/answer", function (request, response) {
  let randomID = 'A' + uniqid();

  Question.find({
    where: {
      question_id: request.query.question_id
    }
  }).then(function (record) {
    if (record) {
      console.log(record);
      record.updateAttributes({
        answered: true
      })
      Answer.create({ answer_text: request.query.answer_text, question_id: request.query.question_id, uliza_expert_id: request.query.uliza_expert_id, answer_id: randomID });
      
      let mailOptions = {
        from: 'youremail@gmail.com',
        to: 'useremail@email.com',
        subject: 'Your question has been answered!',
        text: '<a href="https://abrupt-visage.glitch.me/" target="_blank">View your questions</a>'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      
      response.sendStatus(200)
    }
  })

});

app.get("/answer", function (request, response) {
  var qAnswer;
  Answer.findAll({
    where: {
      question_id: request.query.question_id
    }
  }).then(function (answer) {
    qAnswer = answer;
    response.send(qAnswer);
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});