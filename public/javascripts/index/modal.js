$(document).ready(function($){
  //open popup
  $('.trigger').on('click', function(event){
    event.preventDefault();
    getStatus()
    var el = $(this).hasClass('status_edit') ? $('.popup_form') : $('.popup')
    el.addClass('is-visible');
  });

  //get current status
  function getStatus(){
    $.ajax({
      type: 'GET',
      url: '/status',
    }).done(function(status){
      console.log(status);
    })
  }

  //close popup
  $('.popup, .popup_form').on('click', function(event){
    if( $(event.target).is('.popup_close') || $(event.target).is('.popup') || $(event.target).is('.popup_form') ) {
      event.preventDefault();
      $(this).removeClass('is-visible');
    }
  });
  //close popup when clicking the esc keyboard button
  $(document).keyup(function(event){
      if(event.which=='27'){
        $('.popup, .popup_form').removeClass('is-visible');
      }
    });

  //submit status
  function submitStatus(event){
    event.preventDefault();

    //form data
    var data = $(this).serializeArray();

    $.ajax({
        type: 'POST',
        url: '/submitStatus',
        data: data
    }).done(function(status){
      if(status) {
        $("#status_form").hide();
        $(".popup_form_content").append("Your status was successfully submitted!");
      }
    });

  }
  $("#status_form").on("submit", submitStatus);
});


