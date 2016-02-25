$(document).ready(function() {

  $(window).trigger('scroll');
  var animation_elements = $(".scrollable");

  var check_if_in_view = function() {
  var window_height = $(window).height();
  var window_top_position = $(window).scrollTop();
  var window_bottom_position = (window_top_position + window_height);


  $.each(animation_elements, function() {
    var element_height = $(this).outerHeight();
    var element_top_position = $(this).offset().top;
    var element_bottom_position = (element_top_position + element_height);

    //check to see if this current container is within viewport
    if ((element_bottom_position >= window_top_position) &&
        (element_top_position <= window_bottom_position)) {
      $(this).addClass('in-view');
    } else {
      $(this).removeClass('in-view');
    }
  });
  }

  $(window).on('scroll resize', check_if_in_view);

  $(window).scroll(function() {
    if ($(this).scrollTop() > $(".bottom_div").offset().top ){
      $('.header').addClass("sticky");
    }
    else{
      $('.header').removeClass("sticky");
    }
  });


  $(".landing_button_image").hover(function(){
    var button = $(this).children("img");
    var buttonName = $(this).attr('id');
    $(".landing_text").children().each(function(){
      if ($(this).attr('id') === buttonName) {
        $(this).css("border-bottom-color", 'white')
      }
    })
    button.attr('src', 'gifs/' + buttonName + '.gif')
  }, function(){
    var button = $(this).children("img");
    var buttonName = $(this).attr('id');
        $(".landing_text").children().each(function(){
      if ($(this).attr('id') === buttonName) {
        $(this).css("border-bottom-color", 'black')
      }
    })
    button.attr('src', 'images/' + buttonName + '.png');
  })

  $(".landing_text").hover(function(){
    $(this).children("p").css("border-bottom-color", 'white');
  }, function(){
    $(this).children("p").css("border-bottom-color", 'black');
  })

  var scrollToContact = function(){
    if ($(window).width() >= 736 ) {
      $('html, body').animate({
          scrollTop: $(".contact.scrollable").offset().top - 200
      }, 1000);
    }
  };

  var scrollToRates = function(){
    if ($(window).width() >= 736 ) {
      $('html, body').animate({
          scrollTop: $(".rates.scrollable").offset().top - 200
      }, 1000);
    }
  }


  var scrollToSectionFromTop = function(){
    var buttonName = $(this).attr("id");
    $('html, body').animate({
        scrollTop: $("." + buttonName + ".scrollable" ).offset().top - $(".header").outerHeight() - 200
    }, 1000);
  }

  var scrollToSection = function(){
    var buttonName = $(this).attr("id");
    var offsetWithoutView = 150;
    if($(this).attr('class').indexOf('in-view') >= 0){
    }
    $('html, body').animate({
        scrollTop: $("." + buttonName + ".scrollable" ).position().top - $(".header").outerHeight() - 150
    }, 1000);
  }

  var car = document.getElementById("car");
  car.style.left = car.width + "px";
  var dx = 1;
  var timer;

  var changeDirection = function(){
    dx *= -1;
    car.classList.toggle('drive-left');
  }

  var drive = function(){
    var newPos = ( parseInt(car.style.left) + dx).toString() + 'px';
    car.style.left = newPos;
  };

  var driveLeft = setInterval(function(){
    var distFromLeft = parseInt(car.style.left);
    var windowWidth = document.body.clientWidth;

    if( distFromLeft >= (windowWidth) ||
        (distFromLeft + car.width + 50) <= 0){
      changeDirection();
    }
  }, 45);

  var ifScrolledOver = function(){
    var roadSign = $(".road_sign");
    var windowScroll = $(this).scrollTop();
    var signTopPosition = roadSign.offset().top;
    var signHeight = roadSign.outerHeight();
    var windowHeight = $(window).height()

    if (windowScroll > (signTopPosition + signHeight - windowHeight)){
      return true
    } else {
      return false
    }

  }

  var startAnimation = function(){
    if(ifScrolledOver()) {
      clearTimeout(timer)
      timer = setInterval(drive, 8);
    } else {
      clearTimeout(timer);
    }
  }

  $('#calendar').fullCalendar({
    googleCalendarApiKey: 'AIzaSyCvJ-mAmNnVcETeC8P256wKBmiuJGXfaPU',
    events: {
      googleCalendarId: 'massagebygerill@gmail.com'
    },
    header: {
      left: 'title',
      center: 'basicDay, month',
      right: 'today prev,next'
    },
    height: 600
  })

  $('#calendar').off('click touchstart', 'div');

  $('body').swipe( {
        //Single swipe handler for left swipes
        swipeLeft: function () {
            $.sidr('open', 'sidr-main');
        },
        swipeRight: function () {
            $.sidr('close', 'sidr-main');
        },
        //Default is 75px, set to 0 for demo so any distance triggers swipe
        threshold: 45
  });


  changeDirection();
  $(window).on("scroll", startAnimation)
  $(".contact_directly").on("click touchstart", scrollToContact);
  $(".check_rates").on("click touchstart", scrollToRates)
  $(".landing_button_image").on("click touchstart", scrollToSectionFromTop);
  $(".landing_text").on("click touchstart", scrollToSection);

})


