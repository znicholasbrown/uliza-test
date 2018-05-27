// client-side js
// run by the browser each time your view template is loaded

$(function() {
  $.get('/questions', function(questions) {
    console.log(questions);
    questions.forEach(function(question) {
      $('<li></li>').text(question[0] + " " + question[1]).appendTo('ul#users');
    });
  });

  $('form').submit(function(event) {
    event.preventDefault();
    var questionAsked = $('input#askQuestion').val();
    $.post('/questions?' + $.param({question:questionAsked}), function() {
      $('<li></li>').text(questionAsked).appendTo('ul#questions');
      $('input#questionAsked').val('');
      $('input').focus();
    });
  });
});
