// client-side expert js
// run by the browser each time your view template is loaded

$(function() {
  // These would be provided by the server.
  const uliza_expert_id = 'U123ABC';
  function getUnsanswered () {
      $.get('/unanswered', function(questions) {
      $('div#questions').html('');
      questions.forEach(function(question) {
          $('<div></div>').text(question[0]).attr('id', question[2]).attr('data-value', question[0]).append($('<button>Answer</button>').click(answer)).appendTo('div#questions');
        });
      });
  }

  
  function answer (e) {
    var question_id = e.target.parentNode.id;
    $('.answer>form>div').text('Answering question: ' + e.target.parentNode.attributes[1].nodeValue);
    $('.answer').attr('id', question_id);
    $('.answer').show();
    
  }
  
  
  $('form').submit(function(event) {
    event.preventDefault();
    var questionAsked = $('input#answerQuestion').val();
    $.post('/answer?' + $.param({answer_text:questionAsked, uliza_expert_id: uliza_expert_id, question_id: $('.answer').attr('id')}), function(response) {
      getUnsanswered();
      $('input#questionAnswered').val('');
      $('input').focus();
      $('.answer').attr('id', '');
      $('.answer').hide();
    });
  });
  
  getUnsanswered();
});
