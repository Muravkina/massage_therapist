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

  var displayWord = function(event){
    var topPart = $(this).find("img.top_part");
    var middlePart = $(this).find("img.middle_part");
    var bottomPart = $(this).find("img.bottom_part");
    var word = $(this).find("h2");

    topPart.hide("slide", { direction: "left" }, 200);
    middlePart.hide("slide", { direction: "right" }, 200);
    word.show("slide", {direction: "left"}, 200);
    bottomPart.hide("slide", { direction: "left" }, 200);
  }

  var hideWord = function(){
    var topPart = $(this).find("img.top_part");
    var middlePart = $(this).find("img.middle_part");
    var bottomPart = $(this).find("img.bottom_part");
    var word = $(this).find("h2");

    topPart.show("slide", { direction: "left" }, 200);
    middlePart.show("slide", { direction: "right" }, 200);
    word.hide("slide", {direction: "left"}, 200);
    bottomPart.show("slide", { direction: "left" }, 200);
  }

  var displayContent = function(){
    var infoBox = $(this).parent().attr('class').replace(" about_image wrap", "_info");
    var topPart = $(".section").find("img.top_part");
    var middlePart = $(".section").find("img.middle_part");
    var bottomPart = $(".section").find("img.bottom_part");
    var word = $(this)

    if (screen.width >= 736 ) {
      topPart.hide("slide", { direction: "left" }, 200);
      middlePart.hide("slide", { direction: "right" }, 200);
      bottomPart.hide("slide", { direction: "left" }, 200);
    }

    word.hide("slide", {direction: "right"}, 200, function(){
      $(".about_pictures").hide();
        $("."+infoBox).show("blind", 200)
      });
    $(".section").off("mouseover").off("mouseleave")
  }

  var hideContent = function(){
    var infoBox = $(this).parents(".container");
    var section = infoBox.attr("class").replace("container ", "").replace("_info", "");
    var word = $(".section." + section).find("h2")
    var topPart = $(".section").find("img.top_part");
    var middlePart = $(".section").find("img.middle_part");
    var bottomPart = $(".section").find("img.bottom_part");

    infoBox.hide();
    $(".about_pictures").show()

    if (screen.width > 736) {
      console.log(screen.width)
      topPart.show("slide", { direction: "left" }, 200);
      middlePart.show("slide", { direction: "right" }, 200);
      bottomPart.show("slide", { direction: "left" }, 200);
    } else {
      word.show("slide", { direction: "left" }, 200);
    }

      $(".section").on("mouseover", displayWord).on("mouseleave", hideWord);
  }

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
    $('html, body').animate({
        scrollTop: $(".contact.scrollable").offset().top - 260
    }, 1000);
  };

  var scrollToRates = function(){
    $('html, body').animate({
        scrollTop: $(".rates.scrollable").offset().top - 260
    }, 1000);
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
    }
  })

  $('#calendar').off('click', 'div')


  changeDirection();
  $(window).on("scroll", startAnimation)
  $(".contact_directly").click(scrollToContact);
  $(".check_rates").click(scrollToRates)
  $(".section").on("mouseover", displayWord);
  $(".section").on("mouseleave", hideWord);
  $(".about_image").on("click", "h2", displayContent);
  $(".close_icon_wrap").on("click", hideContent);
  $(".landing_button_image").on("click", scrollToSectionFromTop);
  $(".landing_text").on("click", scrollToSection);
  console.log(screen.width)

})


