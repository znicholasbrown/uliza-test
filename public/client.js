// client-side js
// run by the browser each time your view template is loaded

$(function() {
  $.get('/questions', function(questions) {
    console.log(questions);
    questions.forEach(function(question) {
      $('<div></div>').text(question[0]).attr('id', question[2]).append($('<button>View Answer</button>').click(handleClick)).appendTo('div#questions');
    });
  });
  
  function handleClick (e) {
    $.get('/answer?q=' + e.target.parentNode.id, function () {
      $('div#' + e.target.parentNode.id).append(
    })
  }
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
