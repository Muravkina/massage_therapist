$(document).ready(function($){
  //open booking popup
  $(".trigger_booking").on('click touchstart', function(event){
    event.preventDefault();
    $(".popup_book").addClass('is-visible');
  });

  //close booking popup

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
  $('.popup, .popup_form, .popup_book').on('click touchstart', function(event){
    console.log($(event.target))
    if( $(event.target).is('.popup_close') || $(event.target).is('.popup') || $(event.target).is('.popup_form') ||  $(event.target).is('.popup_book')) {
      if ( !$(event.target).is('.popup_book') ) {
        event.preventDefault();
        $('.popup_content > .availability').removeClass('available').removeClass('unavailable');
        $('.popup_content > .location, .popup_content > .notes, .popup_form_content > .submission_status').hide();
      }
      $(this).removeClass('is-visible');
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


