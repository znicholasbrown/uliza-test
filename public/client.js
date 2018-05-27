// client-side js
// run by the browser each time your view template is loaded

$(function() {
  // These would be provided by the server.
  const enquirer_id = 'E123ABC'; 
  
  $.get('/questions', function(questions) {
    questions.forEach(function(question) {
      $('<div></div>').text(question[0]).attr('id', question[2]).append($('<button>View Answer</button>').click(viewAnswer)).appendTo('div#questions');
    });
  });
  
  function viewAnswer (e) {
    var question_id = e.target.parentNode.id;
    $.get('/answer?' + $.param({question_id: question_id}), function (response) {
      if (response.length > 0) {
        $('<div></div>').text(response[0].answer_text).appendTo('div#' + e.target.parentNode.id)
      } else {
        $('<div></div>').text('No answer yet.').appendTo('div#' + e.target.parentNode.id);
      }
      
    })
  }
  
  
  $('form').submit(function(event) {
    event.preventDefault();
    var questionAsked = $('input#askQuestion').val();
    $.post('/questions?' + $.param({question_text:questionAsked, enquirer_id: enquirer_id}), function(response) {
      console.log(response);
      $('<div></div>').text(response.question_text).attr('id', response.question_id).append($('<button>View Answer</button>').click(viewAnswer)).appendTo('div#questions');
      $('input#questionAsked').val('');
      $('input').focus();
    });
  });
});
