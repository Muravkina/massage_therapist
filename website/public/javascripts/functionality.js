$(document).ready(function() {

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

    var removePreview = function(event){
      event.preventDefault();
      var preview = $(this).prev();
      preview.fadeOut(1000, function() {
        $(this).removeProp('src');
        $(this).parents().find(".editFile").replaceWith(selected_photo = $(this).parents().find(".editFile").clone(true));
      });
    }

    $("body").on("click", ".removePreview", removePreview)

    var newPost = function(posts){
      $.ajax({
          type: 'GET',
          url: "/isAuthenticated",
          contentType: 'application/json'
      }).done(function(isAuthenticated){
        $(".posts").empty()
        var editForm = '';
        var image = "<img class='postImage' id='preview'>";
        var deleteImageButton = "";
        posts.forEach(function(post){
          var tags = "";
          post.tags.forEach(function(tag){
            tags += "<span class='searchTag'>" + tag + "</span> "
          })
          if (isAuthenticated) {
            if (post.image) {
              image = "<img src='" + post.image.url + "' class='postImage' id='preview'>";
              deleteImageButton = "<button class='deleteImage'>Delete Image</button>";
            }
           editForm = " </div><button class='openEdit'>Edit</button><div class='edit'><form id='editPostForm'>" + image + deleteImageButton + "<input type='text' name='editPostTitle' class='editPostTitle' value='" + post.title + "'><textarea name='editPostBody' class='editPostBody'>" + post.body + "</textarea><input type='text' name='editPostTags' class='editPostTags' value='" + post.tags.join(', ') + "'><input type='file' name='image' class='editFile'><img id='preview' height='100'/><p class='removePreview'>X</p><button class='editPost'>Submit</button></form></div><button class='deletePost'>Delete</button> "
          }
          if (post.image) {
            image = "<img src='" + post.image.url +"' class='postImage' id='preview'>"
          }
          var post = "<div class='post' data-id='" + post._id + "'><div class='postData'><p class='postDate'>" + dateFormat(post.date) + "</p><a href='/posts/" + post._id + "' class='postTitle'>" + post.title + "</a>" + image + "<p class='postBody'>" + post.body + "</p><p class='postTags'>" + tags + "</p>" + editForm + "<a href='/posts/"+ post._id +"'>Comments (" + post.comments.length + ")</a></div>";
          $(".posts").append(post);
          $(".postImage#preview").show()
        });
      });
    };

    var newReview = function(reviews){
      $.ajax({
          type: 'GET',
          url: "/isAuthenticated",
          contentType: 'application/json'
      }).done(function(isAuthenticated){
        $(".reviews_collection").empty();
        reviews.forEach(function(review){
          var deleteButton = '';
          if (isAuthenticated) {
            deleteButton = "<button class='deleteReview'>Delete</button>"
          }
          var review = "<div class='review six columns' data-id='" + review._id + "'><div class='star-ratings-css' title='" + review.stars + "'></div><p class='review_body'>" + review.body + "</p><p class='review_author'>" + review.author + "</p>" + deleteButton + "</div>";
          $(".reviews_collection").append(review);
        });
      });
    };

    var errorForm = function(){
      $(".formErrors > p").remove();
      var error = "<p>Don't forget to fill out the fields marked in red</p>"
      $(".formErrors").append(error)
    }

    var postPages = {
      totalPages: Math.ceil($(".pages").attr("data-id")/10),
      currentPage: 1
    }

    var reviewsPages = {
      totalPages: Math.ceil($(".reviews_collection").attr("data-id")/10),
      currentPage: 1
    }

//image preview before submitting the post
    var readURL = function(input) {
      if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          $(input).parents().find("#preview").attr('src', e.target.result);
          $(input).parents().find("#preview").show();
        }
      reader.readAsDataURL(input.files[0]);
      }
    }

$("body").delegate(".editFile","change", function(){
    readURL(this);
});

// submit review
    $(".submit").on("click", function(event){

      event.preventDefault();
      var data = {
        author: $(".reviewAuthor").val(),
        body: $(".reviewBody").val(),
        stars: $("input[name=rating]:checked").val(),
        email: $(".reviewEmail").val(),
        lastReview: $(".reviews_collection div:nth-child(10)"),
        reviewsNumber: $(".reviews_collection").children().length
      }

      var checkable = [$(".reviewAuthor"), $(".reviewBody"), $("input[name=rating]:checked")];
      var fields = [$(".reviewAuthor"), $(".reviewBody"), $("input[name=rating]:checked"), $(".reviewEmail")];

      if (fieldsAreValid(checkable)) {
        $.ajax({
            type: 'POST',
            url: "/",
            contentType: 'application/json',
            data: JSON.stringify(data)
          }).done(function(review){
            removeRed(fields);
            $('input[name=rating]').attr('checked', false);
            var review = "<div class='review six columns'><div class='star-ratings-css' title= '." + review.stars + "'></div><p class='review_body'>" + review.body + "</p><p class='review_author'>" + review.author + "</p></div>"

            //empty the last review if the number of reviews on the page is 10
            if (data.reviewsNumber === 10) {
              data.lastReview.empty()
            }
            $(".reviews_collection").prepend(review);
          })
      } else {
        errorForm();
      }
  })

//submit post

  var submitPost = function(event){
    event.preventDefault()

    var formData = new FormData();
    var form = $('form').serializeArray();
    formData.append("image", $(":file")[0].files[0]);
    $.each(form,function(key,input){
        formData.append(input.name,input.value);
    });
    var postsData = {
      lastPost : $(".posts div:nth-child(10)"),
      postsNumber: $(".posts div:nth-child(10)"),
      previewImage : $(this).parents().find("#preview")
    }
    console.log(postsData.image)
    var checkable = [$("input[name='title']"), $("textarea[name='body']")];
    var fields = [$("input[name='title']"), $("textarea[name='body']"), $("input[name='tags']")];

    if (fieldsAreValid(checkable)) {
        $.ajax({
            type: 'POST',
            url: "/blog",
            contentType: false,
            processData: false,
            data: formData
          }).done(function(post){
            removeRed(fields);
            postsData.previewImage.attr('src', '').hide();
            var tags = "";
            var image = "<img class='postImage' id='preview'>";
            var deleteImageButton ='';
            $(":file").val('')
            var categories = [];
            post.tags.forEach(function(tag){
              tags += "<span class='searchTag'>" + tag + "</span> ";
              categories.push(tag)
            })
            if (post.image) {
              image = "<img src='" + post.image.url + "' class='postImage' id='preview'>";
              deleteImageButton = "<button class='deleteImage'>Delete Image</button>";
            }

            var editForm = "<div class='edit'><form id='editPostForm'>" + image + deleteImageButton + "<input type='text' name='editPostTitle' class='editPostTitle' value='" + post.title + "'><textarea name='editPostBody' class='editPostBody'>" + post.body + "</textarea><input type='text' name='editPostTags' class='editPostTags' value='" + post.tags.join(', ') + "'><input type='file' name='image' class='editFile'><img id='preview' height='100'/><p class='removePreview'>X</p><button class='editPost'>Submit</button></form></div>";
            var newPost = "<div class='post' data-id='" + post._id + "'><div class='postData'><p class='postDate'>" + dateFormat(post.date) + "</p><a href='/posts/" + post._id + "' class='postTitle'>" + post.title + "</a>" + image + "<p class='postBody'>" + post.body + "</p><p class='postTags'>" + tags + "</p> </div><button class='openEdit'>Edit</button>" + editForm + " <button class='deletePost'>Delete</button> <a href='/posts/"+post._id+"'>Comments (" + post.comments.length + ")</a></div>";
            $(".posts").prepend(newPost);
            $(".postImage#preview").show()

            //update the categories
            var uniqueCategories = [];
            $(".categories").children().each(function(category){
              categories.push($(this).text())
            })
            uniqueCategories = categories.filter(function(elem, index, self){
              return index == self.indexOf(elem);
            })
            $(".categories").empty()
            uniqueCategories.forEach(function(category){
              var categoryField = "<p class='searchTag'>" + category + "</p>"
              $(".categories").append(categoryField)
            })

            //empty the last post if the number of posts on the page is 10
            if (postsData.postsNumber === 10) {
              postsData.lastPost.empty()
            }

          })
      } else {
        errorForm()
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
      editForm.find("#preview").show()
      $(this).text("Close");
    } else {
      editForm.hide();
      post.show();
      $(this).text("Edit");
    }
  }

  //update post
  var updatePost = function(event){
    event.preventDefault();
    console.log("wrong")
    var id = $(this).parents(".post").attr("data-id");
    var formData = new FormData();
    formData.append('image', $(this).parent().find('.editFile')[0].files[0]);
    formData.append('title', $(this).parent().children(".editPostTitle").val());
    formData.append('body', $(this).parent().children(".editPostBody").val());
    formData.append('tags', $(this).parent().children(".editPostTags").val());

    var editForm = $(this).parents(".edit");
    var post = $(this).parents(".post");

    var editedPost = {
      title : post.find(".postTitle"),
      body  : post.find(".postBody"),
      tags  : post.find(".postTags"),
      image : post.find(".postImage")
    }
    $.ajax({
        url: '/posts/' + id,
        type: 'PUT',
        contentType: false,
        processData: false,
        data: formData
      }).done(function(data){
        var tagsText = "";
        data.tags.forEach(function(tag){
          tagsText += "<span class='searchTag'>" + tag + "</span> "
        })
        editForm.hide()
        editedPost.title.text(data.title);
        editedPost.body.text(data.body);
        editedPost.tags.html(tagsText);
        if (data.image){
          editedPost.image.attr('src', data.image.url)
        }
        post.children(".postData").show();
        $(":file").val('');
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
      errorForm();
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

// search by tags
  var searchTag = function(){
    var tag = $(this).text();
    $.ajax({
      url: '/tags/' + tag,
      type: 'GET',
      contentType: 'application/json'
    }).done(function(posts){
      newPost(posts);
      $('.all_posts').show();
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
        $("input[name='searchPosts']").val('');
        newPost(posts);
        $('.all_posts').show();
      })
    }
  })

  //pagination

  //older posts
  $(".pages").on("click", ".olderPosts", function(){
    var id = {id: $(".posts div:nth-child(10)").attr("data-id")};
    $.ajax({
      url: '/olderPosts',
      type: 'GET',
      data: id,
      contentType: 'application/json'
    }).done(function(posts){
      newPost(posts);
      $(".newerPosts").show();
      $(".all_posts").show();
      postPages.currentPage += 1;
      if (postPages.totalPages === postPages.currentPage){
          $(".olderPosts").hide();
      }
    })
  })

  //newer posts
  $(".pages").on("click", ".newerPosts", function(){
    var id = {id: $(".posts div:nth-child(1)").attr("data-id")};
    $.ajax({
      url: '/newerPosts',
      type: 'GET',
      data: id,
      contentType: 'application/json'
    }).done(function(posts){
      newPost(posts);
      postPages.currentPage -=1;
      if (postPages.currentPage === 1) {
        $(".newerPosts").hide();
        $(".all_posts").hide();
      }
      if (postPages.totalPages !== postPages.currentPage) {
        console.log("hi")
        $(".olderPosts").show();
      }

    })
  })

   //older reviews
  $(".pages").on("click", ".olderReviews", function(){
    var id = {id: $(".reviews_collection div:nth-child(10)").attr("data-id")};
    $.ajax({
      url: '/olderReviews',
      type: 'GET',
      data: id,
      contentType: 'application/json'
    }).done(function(reviews){
      newReview(reviews);
      reviewsPages.currentPage += 1;
      if (reviewsPages.totalPages === reviewsPages.currentPage){
          $(".olderReviews").hide();
      }
      $(".newerReviews").show();
    })
  })

   //newer reviews
  $(".pages").on("click", ".newerReviews", function(){
    var id = {id: $(".reviews_collection div:nth-child(1)").attr("data-id")};
    $.ajax({
      url: '/newerReviews',
      type: 'GET',
      data: id,
      contentType: 'application/json'
    }).done(function(reviews){
      newReview(reviews);
      reviewsPages.currentPage -=1;

      if (reviewsPages.currentPage === 1) {
        $(".newerReviews").hide();
      }
      if (reviewsPages.totalPages !== reviewsPages.currentPage) {
        $(".olderReviews").show();
      }
    })
  })

// delete review
  var deleteReview = function(event){
    event.preventDefault();
    var review = $(this).parent();
    var id = $(this).parent().attr("data-id")
    $.ajax({
        url: '/reviews/' + id,
        type: 'DELETE',
        contentType: 'application/json'
      }).done(function(data){
        review.empty();
      })
  }
  $(".reviews_collection").on("click", ".deleteReview", deleteReview);

//back to all posts

  var backToPosts = function(){
    $.ajax({
        url: '/blog',
        type: 'GET',
        data: {back: true},
        contentType: 'application/json'
      }).done(function(posts){
        newPost(posts);
        postPages.currentPage = 1;
        $(".all_posts").hide();
        $(".newerReviews").hide();
      })
  }

  $(".all_posts").on("click", backToPosts)


  $(".posts").on("click", ".deleteImage", function(event){
    event.preventDefault()
    var id = $(this).parents(".post").attr("data-id");
    var editImage = $(this).prev();
    var postImage = $(this).parents().find(".postImage")
    console.log(postImage)
    var deleteButton = $(this)

    $.ajax({
        url: '/deleteImage/' + id,
        type: 'DELETE',
        contentType: 'application/json'
      }).done(function(data){
        editImage.remove();
        deleteButton.hide();
        postImage.attr('src', '')
      })
  })

});
