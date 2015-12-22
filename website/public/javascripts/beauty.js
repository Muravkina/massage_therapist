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

  $("#path3397").on("click", function(){
    console.log("hello")
  })

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
    var topPart = $(".section").find("img.top_part");
    var middlePart = $(".section").find("img.middle_part");
    var bottomPart = $(".section").find("img.bottom_part");

    topPart.hide("slide", { direction: "left" }, 200);
    middlePart.hide("slide", { direction: "right" }, 200);
    bottomPart.hide("slide", { direction: "left" }, 200);

    $(".section").off("mouseover").off("mouseleave")

  }



  $(".section").on("mouseover", displayWord);
  $(".section").on("mouseleave", hideWord);
  $(".about_image").on("click", "h2", displayContent);


})
