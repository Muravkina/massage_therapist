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

    $(".submit").on("click", function(event){
      event.preventDefault();
      var data = {
        author: $(".reviewAuthor").val(),
        body: $(".reviewBody").val(),
        stars: $("input[name=rating]:checked").val()
      }
    $.ajax({
      type: 'POST',
      url: "/",
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(data){
      $(".reviewAuthor").val("");
      $(".reviewBody").val("");
      $(".reviewEmail").val("");
      $('input[name=rating]').attr('checked', false);
      var review = "<div class='review'><p>" + data.body + "</p><p>" + data.author + "</p></div>"
      $(".reviews_collection").append(review)
    })
  })

  $(window).on('scroll resize', check_if_in_view);


});
