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

    var fieldsAreValid = function(checkable) {
      var fieldsAreValid = true;
      for (var i = 0; i < checkable.length; i++){
        if(!isValid(checkable[i])){
          checkable[i].addClass("red");
          fieldsAreValid = false;
        }
      }
      return fieldsAreValid;
    }

    var removeRed = function(checkable) {
      for(var i = 0; i < checkable.length; i++){
        checkable[i].removeClass("red").val('');
      }
      $(".formErrors > p").remove();
    }

    var dateFormat = function(date){
      var date = new Date(date);
      return date.toDateString()
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
      var fields = [$(".reviewAuthor"), $(".reviewBody"), $("input[name=rating]:checked"), $(".reviewEmail")];

      if (fieldsAreValid(checkable)) {
        $.ajax({
            type: 'POST',
            url: "/",
            contentType: 'application/json',
            data: JSON.stringify(data)
          }).done(function(data){
            removeRed(fields);
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
        body: $("textarea[name='body']").val(),
        tags: $("input[name='tags']").val()
      }

    var checkable = [$("input[name='title']"), $("textarea[name='body']")];
    var fields = [$("input[name='title']"), $("textarea[name='body']"), $("input[name='tags']")];

    if (fieldsAreValid(checkable)) {
        $.ajax({
            type: 'POST',
            url: "/blog",
            contentType: 'application/json',
            data: JSON.stringify(data)
          }).done(function(data){
            removeRed(fields);
            var tags = "";
            data.tags.forEach(function(tag){
              tags += "<span class='searchTag'>" + tag + "</span> "
            })

            var editForm = "<div class='edit'><form id='editPostForm'><input type='text' name='editPostTitle' class='editPostTitle' value='" + data.title + "'><textarea name='editPostBody' class='editPostBody'>" + data.body + "</textarea><input type='text' name='editPostTags' class='editPostTags' value='" + data.tags.join(', ') + "'><button class='editPost'>Submit</button></form></div>"
            var post = "<div class='post' data-id='" + data._id + "'><div class='postData'><p class='postDate'>" + dateFormat(data.date) + "</p><a href='/posts/" + data._id + "' class='postTitle'>" + data.title + "</a><p class='postBody'>" + data.body + "</p><p class='postTags'>" + tags + "</p> </div><button class='openEdit'>Edit</button>" + editForm + " <button class='deletePost'>Delete</button> <a href='/posts/"+data._id+"'>Comments (" + data.comments.length + ")</a></div>";
            $(".posts").prepend(post);
          })
      } else {
        var error = "<p>Don't forget to fill out the fields marked in red</p>";
        $(".formErrors").append(error);
      }

  }

  $(".submitPost").on("click", submitPost)


  //delete post
  var deletePost = function(event){
    event.preventDefault();
    var post = $(this).parent();
    var id = $(this).parent().attr("data-id")
    $.ajax({
        url: '/posts/' + id,
        type: 'DELETE',
        contentType: 'application/json'
      }).done(function(data){
        post.empty();
      })
  }
  $(".posts").on("click", ".deletePost", deletePost);


  //open edit form
  var openEdit = function(){
    var editForm = $(this).next();
    var post = $(this).parent().children(".postData");
    if (!editForm.is(":visible")){
      editForm.show();
      post.hide();
      $(this).text("Close");
      console.log($(this).parent())
    } else {
      editForm.hide();
      post.show();
      $(this).text("Edit");
    }
  }

  //update post
  var updatePost = function(event){
    event.preventDefault();
    var id = $(this).parents(".post").attr("data-id");

    var data = {
      title : $(this).parent().children(".editPostTitle").val(),
      body  : $(this).parent().children(".editPostBody").val(),
      tags  : $(this).parent().children(".editPostTags").val()
    }

    var editForm = $(this).parents(".edit");
    var post = $(this).parents(".post");
    var title = post.find(".postTitle");
    var body = post.find(".postBody");
    var tags = post.find(".postTags");
    $.ajax({
        url: '/posts/' + id,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data)
      }).done(function(data){
        var tagsText = "";
        data.tags.forEach(function(tag){
          tagsText += "<span class='searchTag'>" + tag + "</span> "
        })
        editForm.hide()
        title.text(data.title);
        body.text(data.body);
        tags.html(tagsText);
        post.children(".postData").show();
        editForm.prev(".openEdit").text("Edit");
      })
  }

  $(".posts").on("click", ".openEdit", openEdit);
  $(".posts").on("click", ".editPost", updatePost);


// open comment form
  var openComment = function(){
    var commentForm = $(this).next();
    if (!commentForm.is(":visible")){
      commentForm.show();
      $(this).text("Close");
    } else {
      commentForm.hide();
      $(this).text("Leave a comment");
    }
   }

//submit comment

  var submitComment = function(event){
    event.preventDefault();

    var data = {
      title   : $("input[name='commentTitle']").val(),
      body    : $("textarea[name='commentBody']").val(),
      name    : $("input[name='commentAuthorName']").val(),
      email   : $("input[name='commentAuthorEmail']").val(),
      website : $("input[name='commentAuthorWebsite']").val()
    }

    var id = $(this).parents(".post").attr("data-id");
    var commentForm = $(this).parents(".commentForm");
    var checkable = [$("textarea[name='commentBody']"), $("input[name='commentAuthorEmail']"), $("input[name='commentAuthorName']")];
    var fields = [$("input[name='commentTitle']"), $("textarea[name='commentBody']"), $("input[name='commentAuthorEmail']"), $("input[name='commentAuthorName']"), $("input[name='commentAuthorWebsite']")];

    if(fieldsAreValid(checkable)){
     $.ajax({
        url: '/posts/' + id + '/comments',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data)
      }).done(function(data){
        removeRed(fields);
        var deleteButton = "";

        ///if admin - add delete the comment button
        if(data.user){
          deleteButton = "<button class='deleteComment'>Delete</button>";
        }

        var comment = "<div class='comment'><p>" + dateFormat(data.comment.date) + "</p><p class='commentTitle'>" + data.comment.title + "</p><p class='commentBody'>" + data.comment.body + "</p><p class='commentAuthorName'>" + data.comment.name + "</p><p class='commentAuthorWebsite'>" + data.comment.website + "</p>" + deleteButton + "</div>";
        $(".commentsCollection").prepend(comment);
        commentForm.prev(".openComment").text('Leave a comment');
        commentForm.hide();
      })
    } else {
      var error = "<p>Don't forget to fill out the fields marked in red</p>";
      $(".formErrors").append(error);
    }
  }

   $(".post").on("click", ".openComment", openComment);
   $(".post").on("click", ".submitComment", submitComment);

// delete comment

var deleteComment = function(event) {
  event.preventDefault();

  var postId = $(this).parents(".post").attr("data-id")
  var commentId = $(this).parents(".comment").attr("data-id");
  var comment = $(this).parents(".comment")

  $.ajax({
      url: '/posts/' + postId + '/comments/' + commentId,
      type: 'DELETE',
      contentType: 'application/json'
    }).done(function(data){
      comment.empty();
    })
}

  $(".post").on("click", ".deleteComment", deleteComment)
  $(window).on('scroll resize', check_if_in_view);

// search by tags
  var searchTag = function(){
    var tag = $(this).text();
    $.ajax({
      url: '/tags/' + tag,
      type: 'GET',
      contentType: 'application/json'
    }).done(function(posts){
      $(".posts").empty();
      posts.forEach(function(post){
      var tags = "";
          post.tags.forEach(function(tag){
            tags += "<span class='searchTag'>" + tag + "</span> "
          })
       var editForm = "<div class='edit'><form id='editPostForm'><input type='text' name='editPostTitle' class='editPostTitle' value='" + post.title + "'><textarea name='editPostBody' class='editPostBody'>" + post.body + "</textarea><input type='text' name='editPostTags' class='editPostTags' value='" + post.tags.join(', ') + "'><button class='editPost'>Submit</button></form></div>"
        var post = "<div class='post' data-id='" + post._id + "'><div class='postData'><p class='postDate'>" + dateFormat(post.date) + "</p><a href='/posts/" + post._id + "' class='postTitle'>" + post.title + "</a><p class='postBody'>" + post.body + "</p><p class='postTags'>" + tags + "</p> </div><button class='openEdit'>Edit</button>" + editForm + " <button class='deletePost'>Delete</button> <a href='/posts/"+ post._id +"'>Comments (" + post.comments.length + ")</a></div>";
        $(".posts").prepend(post);
      })
    });
  }

  $("body").on("click", ".searchTag", searchTag)

  //search

  $("input[name='searchPosts']").on("keypress", function(event){
    if(event.which == 13){
      var searchArray = {params: $(this).val().trim().replace(/[^a-zA-Z ]/g, '')};
      $.ajax({
      url: '/search',
      type: 'GET',
      data: searchArray,
      contentType: 'application/json'
    }).done(function(posts){
      $('.posts').empty();
      $("input[name='searchPosts']").val('');
      posts.forEach(function(post){
        var tags = "";
          post.tags.forEach(function(tag){
            tags += "<span class='searchTag'>" + tag + "</span> "
          })
       var editForm = "<div class='edit'><form id='editPostForm'><input type='text' name='editPostTitle' class='editPostTitle' value='" + post.title + "'><textarea name='editPostBody' class='editPostBody'>" + post.body + "</textarea><input type='text' name='editPostTags' class='editPostTags' value='" + post.tags.join(', ') + "'><button class='editPost'>Submit</button></form></div>"
        var post = "<div class='post' data-id='" + post._id + "'><div class='postData'><p class='postDate'>" + dateFormat(post.date) + "</p><a href='/posts/" + post._id + "' class='postTitle'>" + post.title + "</a><p class='postBody'>" + post.body + "</p><p class='postTags'>" + tags + "</p> </div><button class='openEdit'>Edit</button>" + editForm + " <button class='deletePost'>Delete</button> <a href='/posts/"+ post._id +"'>Comments (" + post.comments.length + ")</a></div>";
        $(".posts").prepend(post);
      })
    })

    }
  })

});
