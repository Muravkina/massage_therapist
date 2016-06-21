$(document).ready(function($){
  //open popup
  $('.trigger, .current_status > img').on('click touchstart', function(event){
    event.preventDefault();
    getStatus();
    var el = $(this).hasClass('status_edit') ? $('.popup_form') : $('.popup')
    el.addClass('is-visible');
    $("#status_form").show();
  });

  //get current status
  function getStatus(){
    $(".popup_content > #spinster").show();
    $.ajax({
      type: 'GET',
      url: '/status'
    }).done(function(status){
      $('.popup_content #spinster').hide();
      updateStatusContent(status, function(){
      });
    })
  }

  //populate status box
  function updateStatusContent(status, cb) {

    // update availability
    console.log(status)

    var availabilityColor = (status.availability === 'available' || status.availability === 'limited availability') ? "available" : "unavailable";
    $(".popup_content > .availability").text(status.availability).addClass(availabilityColor)

    //update location

    if (status.location !== '') {
      $('.popup_content > p.location').show();
      $(".popup_content > p.location").find('span').text(status.location);

    } else {
      $('.popup_content > p.location').hide();
    }

    //update notes
    if (status.notes !== '') {
      $('.popup_content > p.notes').show();
      $(".popup_content > p.notes").find('span').text(status.notes);

    } else {
      $('.popup_content > p.notes').hide();
    }

    cb();
  }


  //close popup
  $('.popup, .popup_form').on('click touchstart', function(event){
    if( $(event.target).is('.popup_close') || $(event.target).is('.popup') || $(event.target).is('.popup_form') ) {
      event.preventDefault();
      $(this).removeClass('is-visible');
      $('.popup_content > .availability').removeClass('available').removeClass('unavailable');
      $('.popup_content > .location, .popup_content > .notes, .popup_form_content > .submission_status').hide();
      // $('.popup_form_content > .submission_status').hide();
    }
  });

  //close popup when clicking the esc keyboard button
  $(document).keyup(function(event){
      if(event.which=='27'){
        $('.popup, .popup_form').removeClass('is-visible');
        $('.popup_content > .availability').removeClass('available').removeClass('unavailable');
        $('.popup_form_content > .submission_status').hide();
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
        $(".popup_form_content > .submission_status").show();
      }
    });

  }
  $("#status_form").on("submit", submitStatus);
});


