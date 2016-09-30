$(document).ready(function() {

  $(window).trigger('scroll load');
  var animation_elements = $(".scrollable");

  var check_if_in_view = function() {
    if ($(window).width() >= 736 ) {
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
  } else {
    $.each(animation_elements, function() {
      $(this).css({"opacity":1})
    })
  }
  }

  $(window).on('scroll resize', check_if_in_view);

  $(window).scroll(function() {
    if ($(window).width() >= 736 ) {
      if ($(this).scrollTop() > $(".bottom_div").offset().top ){
        $('.header').addClass("sticky");
      }
      else{
        $('.header').removeClass("sticky");
      }
    }
  });

  $(".landing_button_image").hover(function(){
    var button = $(this).find("img");
    var buttonName = $(this).attr('id');
    $(".landing_text").children().each(function(){
    })
    button.attr('src', 'gifs/' + buttonName + '.gif')
  }, function(){
    var button = $(this).find("img");
    var buttonName = $(this).attr('id');
        $(".landing_text").children().each(function(){
    })
    button.attr('src', 'images/' + buttonName + '.png');
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
    var offsetWithoutView;

    if ($(window).width() >= 736 ) {
      offsetWithoutView = 150;
    } else {
      offsetWithoutView = -75;
    }

    // if($(this).attr('class').indexOf('in-view') >= 0){
    // }
    $('html, body').animate({
        scrollTop: $("." + buttonName + ".scrollable" ).position().top - $(".header").outerHeight() - offsetWithoutView
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
      center: 'basicDay, basicWeek, month',
      right: 'today prev,next'
    },
    height: 1000
  })

  $('#calendar').off('click touchstart', 'div');


  changeDirection();
  $(window).on("scroll", startAnimation)
  $(".contact_directly").on("click touchstart", scrollToContact);
  $(".check_rates").on("click touchstart", scrollToRates)
  $(".landing_button_image").on("click touchstart", scrollToSectionFromTop);
  $(".landing_text").on("click touchstart", scrollToSection);

  //google map
  var displayMap = function(){
    clearTimeout($(this).data('timeoutId'));
    var map = $(".office_location");
    var mapHeight = $(".office_location").height();
    var mapWidth = $(".office_location").width();
    map.css("top", $(this).height() + mapHeight)
    map.css("left", $(this).offset().left - mapWidth + 100);
    map.fadeIn("fast");
  }
  var hideMap = function(){
    var map = $(".office_location");
    var button = $(this),
        timeoutId = setTimeout(function(){
          if (map.is(":hover")){
            setTimeout(hideMap, 100);
          } else {
            map.fadeOut("fast");
          }
        }, 650);
    button.data('timeoutId', timeoutId);
  }

  $(".office").hover(displayMap, hideMap);

  $('div.fc-day-grid > a' ).prop("onclick", null);
  $('div.fc-day-grid').off("mousedown");


})


