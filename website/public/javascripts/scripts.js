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
    //check if the fields are valid
    var isValid = function(field){
      if (!field.val()){
        return false
      } else {
        return true
      }
    }


    var fieldsAreValid = true;
    var validate = function(checkable) {

      for (var i = 0; i < checkable.length; i++){
        if(!isValid(checkable[i])){
          fieldsAreValid = false;
          checkable[i].addClass("red");
        }
      }
    }

// submit review
    $(".submit").on("click", function(event){

      event.preventDefault();
      var data = {
        author: $(".reviewAuthor").val(),
        body: $(".reviewBody").val(),
        stars: $("input[name=rating]:checked").val(),
        email: $(".reviewEmail").val()
      }

      var checkable = [$(".reviewAuthor"), $(".reviewBody"), $("input[name=rating]:checked")];

      validate(checkable);

      if (fieldsAreValid) {
        $.ajax({
            type: 'POST',
            url: "/",
            contentType: 'application/json',
            data: JSON.stringify(data)
          }).done(function(data){
            console.log(data)
            $(".reviewAuthor").val("").removeClass("red");
            $(".reviewBody").val("").removeClass("red");
            $(".reviewEmail").val("").removeClass("red");
            $(".formErrors > p").remove()
            $('input[name=rating]').attr('checked', false);
            var review = "<div class='review six columns'><div class='star-ratings-css' title= '." + data.stars + "'></div><p class='review_body'>" + data.body + "</p><p class='review_author'>" + data.author + "</p></div>"
            $(".reviews_collection > .row").append(review)
          })
      } else {
        var error = "<p>Don't forget to fill out the fields marked in red</p>"
        $(".formErrors").append(error)
      }
  })

//submit post

  var submitPost = function(event){
    event.preventDefault()
    var data = {
        title: $("input[name='title']").val(),
        body: $("input[name='body']").val(),
        tags: $("input[name='tags']").val()
      }

    var checkable = [$("input[name='title']"), $("input[name='body']")];

    validate(checkable);

    if (fieldsAreValid) {
        $.ajax({
            type: 'POST',
            url: "/blog",
            contentType: 'application/json',
            data: JSON.stringify(data)
          }).done(function(data){
            console.log(data)
            $("input[name='title']").val("").removeClass("red");
            $("input[name='body']").val("").removeClass("red");
            $("input[name='body']").val("");
            $(".formErrors > p").remove();
            var tags = "";
            data.tags.forEach(function(tag){
              tags += "<span>" + tag + "</span> "
            })
            var post = "<p>" + data.date + "</p><p>" + data.title + "</p><p>" + data.body + "</p><p>" + tags + "</p>"
            $(".posts").prepend(post)
          })
      } else {
        var error = "<p>Don't forget to fill out the fields marked in red</p>"
        $(".formErrors").append(error)
      }

  }

  $(".submitPost").on("click", submitPost)

  $(window).on('scroll resize', check_if_in_view);


});
