// client-side expert js
// run by the browser each time your view template is loaded

$(function() {
  // These would be provided by the server.
  const uliza_expert_id = 'U123ABC';
  
  $.get('/unanswered', function(questions) {
    questions.forEach(function(question) {
      $('<div></div>').text(question[0]).attr('id', question[2]).append($('<button>Answer</button>').click(answer)).appendTo('div#questions');
    });
  });
  
  function answer (e) {
    var question_id = e.target.parentNode.id;
    $('.answer').attr('id', question_id);
    $('.answer').show();
    
  }
  
  
  $('form').submit(function(event) {
    event.preventDefault();
    var questionAsked = $('input#askQuestion').val();
    $.post('/answer?' + $.param({question_text:questionAsked, enquirer_id: enquirer_id}), function(response) {
      console.log(response);
      $('<div></div>').text(response.question_text).attr('id', response.question_id).append($('<button>View Answer</button>').click(viewAnswer)).appendTo('div#questions');
      $('input#questionAnswered').val('');
      $('input').focus();
    });
  });
});
