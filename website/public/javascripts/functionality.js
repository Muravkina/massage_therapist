$(document).ready(function() {

    //parse posts
    $(".postBody").each(function(){
      html = $.parseHTML($(this).text());
      $(this).text('');
      $(this).append(html)
    })

    //facebook sharing
    $('.facebook-share').click(function() {
      FB.ui({
        method: 'share',
        href: 'https://b59f7719.ngrok.io',
      }, function(response){});
    });

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
          checkable[i].attr("id", "red");
          fieldsAreValid = false;
        }
      }
      return fieldsAreValid;
    }

    var removeRed = function(checkable) {
      $(".formErrors > p").remove();
      for(var i = 0; i < checkable.length; i++){
        checkable[i].attr("id", "").val('');
      }
    }

    var dateFormat = function(date){
      var date = new Date(date);
      return date.toDateString()
    }

    var removePostPreview = function(event){
      event.preventDefault();
      var preview = $(this).prev();
      preview.fadeOut(1000, function() {
        $(this).removeProp('src');
        $(this).parents().find(".removePostPreview").remove();
        $(this).parents().find(".editFile").replaceWith(selected_photo = $(this).parents().find(".editFile"));
        $(this).parent().find("#submitImageForPost").val('');
      });
    }

    var searchPostsPages = {
      totalPages: 0,
      currentPage: 1
    }

    var tagPostsPages = {
      totalPages: 0,
      currentPage: 1
    }

    var removeEditPreview = function(event){
      event.preventDefault();
      var preview = $(this).parents(".edit").find("img#preview");
      var imageUrl = $(this).data("img_url")
      preview.fadeOut(1000, function(){
        $(this).attr("src", imageUrl).show();
        $(":file").val('');
        $(this).parents().find(".editFile").replaceWith(selected_photo = $(this).parents().find(".editFile"));
      })
    }

    $("body").on("click", ".removePostPreview", removePostPreview)
    $("body").on("click", ".removeEditPreview", removeEditPreview)


    var newPost = function(posts, searchArray, totalPosts){
      $.ajax({
          type: 'GET',
          url: "/isAuthenticated",
          contentType: 'application/json'
      }).done(function(isAuthenticated){
        $(".posts").empty()
        var editForm = '';
        if (posts.length === 0) {
          var noPosts = "<p> Oops, no posts are found </p>"
          $(".posts").append(noPosts);
          $(".olderPosts").hide();
        } else {
          posts.forEach(function(post){
            var image = "<img class='postImage' id='preview'>";
            var deleteImageButton ='';
            var changeImageForm = '';
            var changeImageButton = '';
            var fileUploadInput = '';
            var tags = "";
            var maxLength = 700;
            var postBody = '';
            var tagsImage = '';
            post.tags.forEach(function(tag){
              tags += "<span class='searchTag'>" + tag + "</span> "
            })
            if (post.tags[0] !== "") {
              tagsImage = "<img src='/images/tag.png' width='20px'>"
            }
            if (isAuthenticated) {
              if (post.image) {
                image = "<img src='" + post.image.url + "' class='postImage' id='preview'>";
                deleteImageButton = "<button class='deleteImage'>Delete Image</button>";
                changeImageButton = "<button class='changeImage'>Change Image</button>";
                changeImageForm = "<button class='openChangeImage'>Change Image</button><div class='changeImageInput'><button class='removeEditPreview'>Remove preview</button><input type='file' name='image' class='editFile'><button class='changeImage'>Submit Image</button></div>"
              } else {
                fileUploadInput = "<input type='file' name='image' class='editFile'>";
              }
             editForm = " </div><div class='edit_delete_wrapper'><p class='deletePost'>Delete</p><p class='openEdit'>Edit</p><div class='edit'><form id='editPostForm'>" + changeImageForm + deleteImageButton + fileUploadInput + "<input type='text' name='editPostTitle' class='editPostTitle' value='" + post.title + "'><textarea name='editPostBody' class='editPostBody'>" + post.body + "</textarea><input type='text' name='editPostTags' class='editPostTags' value='" + post.tags.join(', ') + "'><input type='file' name='image' class='editFile'><button class='editPost'>Submit</button></form></div></div>"
            }
            if (post.image) {
              image = "<img src='" + post.image.url +"' class='postImage' id='preview'>"
            }
            if (post.body.length > maxLength) {
              var trimmedString = post.body.substr(0, maxLength);
              var trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
              postBody = "<p class='postBody'>" + trimmedString + " ... </p><div class='read_more_wrap'><a href='/posts/" + post._id + "' class='readMore'>READ MORE</a></div>"
            } else {
              postBody = "<p class='postBody'>" + post.body + "</p>"
            }

            var post = "<div class='post' data-id='" + post._id + "'><div class='postData'><p class='postDate'>" + dateFormat(post.date) + "</p><a href='/posts/" + post._id + "' class='postTitle'>" + post.title + "</a>" + image + "<div class='post_body_wrap'>" + postBody + "</div><p class='postTags'>" + tagsImage + tags + "</p><a href='/posts/"+ post._id +"' class='comment_link'>Comments (" + post.comments.length + ")</a>" + editForm + "</div>";
            $(".posts").append(post);
            $(".postImage#preview").show()
          });
          if (searchArray && searchArray !== "searchByTags") {
            $("p").highlight(searchArray);
            if(totalPosts > 10) {
              searchPostsPages.totalPages = Math.ceil(totalPosts/10);
              $(".olderSearchPosts").show()
              $(".olderPosts").hide();
            }
          } else if (searchArray && searchArray === "searchByTags"){
            if(totalPosts > 10) {
              tagPostsPages.totalPages = Math.ceil(totalPosts/10);
              $(".olderTagPosts").show()
              $(".olderPosts").hide();
            }
          }
        }
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
          if($(input).parents("#blogForm").length){
            $(input).parents("form").find("#preview").attr('src', e.target.result);
            $(".removePostPreview").remove();
            var preview = "<p class='removePostPreview'>X</p>";
            $(input).parents("#blogForm").find("#preview").attr("height", "100").attr("width", "100")
            $(input).parents("#blogForm").find("#preview").after(preview)
          } else {
            $(input).parents(".edit").find(".removeEditPreview").data("img_url", $(input).parents(".post").find("#preview").attr('src'))
            $(input).parents(".edit").find("#preview").attr('src', e.target.result);
          }
          $(input).parents("form").find("#preview").show();
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
    formData.append("image", $("#submitImageForPost")[0].files[0]);
    $.each(form,function(key,input){
        formData.append(input.name,input.value);
    });
    var postsData = {
      lastPost : $(".posts div:nth-child(10)"),
      postsNumber: $(".posts div:nth-child(10)"),
      previewImage : $(this).parents("#blogForm").find("#preview")
    }
    console.log($(":file")[$(":file").length-1].files[0])

    var checkable = [$("input[name='title']"), $("textarea[name='body']")];
    var fields = [$("input[name='title']"), $("textarea[name='body']"), $("input[name='tags']")];

    if (fieldsAreValid(checkable)) {
      $.ajax({
        type: 'POST',
        url: "/blog",
        contentType: false,
        processData: false,
        data: formData
      }).done(function(data){
        removeRed(fields);
        $("#blogForm").hide();
        $(".openPostForm").text("New Post")
        postsData.previewImage.attr('src', '');
        var tags = "";
        $(":file").val('')
        newPost(data.posts);

        //update the categories
        var categories = [];
        data.post.tags.forEach(function(tag){
          tags += "<span class='searchTag'>" + tag + "</span> ";
          categories.push(tag)
        })
        var uniqueCategories = [];
        $(".categories_wrap").children().each(function(category){
          categories.push($(this).text())
        })
        uniqueCategories = categories.filter(function(elem, index, self){
          return index == self.indexOf(elem);
        })
        $(".categories_wrap").empty()
        uniqueCategories.forEach(function(category){
          if(category !== "") {
            var categoryField = "<p class='searchTag'>" + category + "</p>"
            $(".categories").append(categoryField)
          }
        })
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
    var id = $(this).parents(".post").attr("data-id");
    var data = {
      postNumber: $(".posts div:nth-child(1)").attr("data-id")
    }
    $.ajax({
        url: '/posts/' + id,
        type: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify(data)
      }).done(function(data){
        newPost(data)
      })
  }
  $(".posts").on("click", ".deletePost", deletePost);


  //open edit form
  var openEdit = function(){
    var editForm = $(this).next();
    var post = $(this).parents(".post").children(".postData");
    var changeImageInput = editForm.find(".changeImageInput");
    if (!editForm.is(":visible")){
      editForm.show();
      console.log(post)
      post.hide();
      post.find("#preview").clone().prependTo(editForm)
      $(this).text("Close");
    } else {
      post.find(".postImage").attr("src", editForm.find(".removeEditPreview").data("img_url"))
      changeImageInput.hide();
      editForm.find(".openChangeImage").text("Change Image");
      $(":file").val("");
      editForm.hide();
      post.show();
      editForm.find("#preview").remove();
      $(this).text("Edit");
    }
  }

  //update post
  var updatePost = function(event){
    event.preventDefault();
    var id = $(this).parents(".post").attr("data-id");

    var formData = new FormData();
    if ($(this).parents(".edit").find(".editFile").length !== 0) {
      formData.append('image', $(this).parent().find('.editFile')[0].files[0]);
    }
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
        editForm.find("#preview").remove();
        editedPost.title.text(data.title);
        editedPost.body.html(data.body);
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

    var id = $(this).parents(".posts").find(".post").attr("data-id");
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
        var commentAuthorWebsiteImage = "";
        var commentTitleImage = "";

        ///if admin - add delete the comment button
        if(data.user){
          deleteButton = "<p class='deleteComment'>Delete</p>";
        }
        if(data.comment.website){
          commentAuthorWebsiteImage = "<img src='/images/triangle.png' width='6'>";
        }
        if(data.comment.title) {
          commentTitleImage = "<img src='/images/triangle.png' width='6'>";
        }
        var comment = "<div class='comment'><p class='commentTitle'>" + data.comment.title + "</p>" + commentTitleImage + "<p class='commentAuthorName'>" + data.comment.name + "</p>" + commentAuthorWebsiteImage + "<a href='http://" + data.comment.website + "' target='_blank'><p class='commentAuthorWebsite'>" + data.comment.website + "</p></a><p class='commentDate'>" + dateFormat(data.comment.date) + "</p><p class='commentBody'>" + data.comment.body + "</p>" + deleteButton + "</div>";
        $(".commentsCollection").prepend(comment);
        commentForm.prev(".openComment").text('Leave a comment');
        commentForm.hide();
      })
    } else {
      errorForm();
    }
  }

   $(".openComment").on("click", openComment);
   $(".posts").on("click", ".submitComment", submitComment);

// delete comment

  var deleteComment = function(event) {
  event.preventDefault();

  var postId = $(this).parents(".posts").find(".post").attr("data-id")
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

  $(".comment_section").on("click", ".deleteComment", deleteComment)

// search by tags
  var searchTag = function(){
    var tag = $(this).text();
    $(".tagPagination").data('searchTag', tag)
    $.ajax({
      url: '/tags/' + tag,
      type: 'GET',
      contentType: 'application/json'
    }).done(function(data){
      newPost(data.posts, "searchByTags", data.count);
      $('.all_posts').show();
    });
  }

  $("body").on("click", ".searchTag", searchTag)

  //search

  $("input[name='searchPosts']").on("keypress", function(event){
    if(event.which == 13){
      var searchArray = {params: $(this).val().trim().toLowerCase()};
      var word = $(this).val().replace(/[^a-zA-Z ]/g, '');
      $.ajax({
        url: '/search',
        type: 'GET',
        data: searchArray,
        contentType: 'application/json'
      }).done(function(data){
        newPost(data.posts, word, data.count);
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
    $('.olderSearchPosts, .newerSearchPosts, .olderTagPosts, .newerTagPosts').hide();
    $('.olderPosts').show();
    $.ajax({
        url: '/blog',
        type: 'GET',
        data: {back: true},
        contentType: 'application/json'
      }).done(function(posts){
        newPost(posts);
        $(".searchBox > input").val('')
        $(".widget").unhighlight({ element: 'span'});
        $(".widget").unhighlight({ element: 'p'});
        postPages.currentPage = 1;
        $(".all_posts").hide();
        $(".newerReviews").hide();
      })
  }

  $(".all_posts").on("click", backToPosts)

// delete image
  $(".posts").on("click", ".deleteImage", function(event){
    event.preventDefault()
    var id = $(this).parents(".post").attr("data-id");
    var postImage = $(this).parents(".post").find(".postImage");
    var changeButton = $(this).parents().find(".changeImage");
    var editForm = $(this).parents("#editPostForm");
    var deleteButton = $(this)

    $.ajax({
        url: '/deleteImage/' + id,
        type: 'DELETE',
        contentType: 'application/json'
      }).done(function(data){
        deleteButton.hide();
        changeButton.hide();
        var fileInput = "<input type='file' name='image' class='editFile'><img id='preview' height='100'/><p class='removePreview'>X</p>";
        editForm.prepend(fileInput);
        postImage.attr('src', '')
      })
  })

// open change image input
  var openChange = function(event){
    event.preventDefault();
    var editForm = $(this).parent();
    var changeImageInput = editForm.find(".changeImageInput");
    if (!changeImageInput.is(":visible")){
      changeImageInput.show();
      $(this).text("Nevermind, the picture is perfect");
    } else {
      $(this).parents(".post").find(".postImage").attr("src", editForm.find(".removeEditPreview").data("img_url"))
      $(":file").val("")
      changeImageInput.hide();
      $(this).text("Change Image");
    }

  }
// change Image
var changeImage = function(event){
  event.preventDefault();
  var id = $(this).parents(".post").attr("data-id");
  var images = $(this).parents(".post").find(".postImage");
  var editForm = $(this).parents("#editPostForm");
  var formData = new FormData();
  if ($(this).parent().find(".editFile").length !== 0) {
    formData.append('image', $(this).parent().find('.editFile')[0].files[0]);
  }
  $.ajax({
    url: '/changeImage/' + id,
    type: 'PUT',
    contentType: false,
    processData: false,
    data: formData
  }).done(function(data){
    images.attr("src", data.image.url);
    editForm.find(".changeImageInput").hide();
    editForm.find(".openChangeImage").text('Change Image');
  });
}


 $(".posts").on("click", ".openChangeImage", openChange)
 $(".posts").on("click", ".changeImage", changeImage)

// subscribe by email

  var addEmailToSubscribeList = function(event){
    event.preventDefault();
    var data = {
      email : $(".subscribeEmail").val()
    }
    $.ajax({
      url: '/addEmail',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(email){
      console.log(email)
    });
  }

  $(".subscribeByEmail").on("click", addEmailToSubscribeList)


  //pagination on serach by word

  var getOlderSearchPosts = function(){
    var data = {
      id: $(".posts div:nth-child(10)").attr("data-id"),
      searchWords: $("input[name='searchPosts']").val().trim().toLowerCase(),
      word : $("input[name='searchPosts']").val().replace(/[^a-zA-Z ]/g, '')
    };
     $.ajax({
      url: '/olderSearchPosts',
      type: 'GET',
      contentType: 'application/json',
      data: data
    }).done(function(posts){
      newPost(posts, data.word);
      $(".newerSearchPosts").show();
      $(".all_posts").show();
      searchPostsPages .currentPage += 1;
      if (searchPostsPages.totalPages === searchPostsPages.currentPage){
          $(".olderSearchPosts").hide();
      }
    })
  }

  var getNewerSearchPosts = function(){
    var data = {
      id: $(".posts div:nth-child(1)").attr("data-id"),
      searchWords: $("input[name='searchPosts']").val().trim().toLowerCase(),
      word : $("input[name='searchPosts']").val().replace(/[^a-zA-Z ]/g, '')
    };
     $.ajax({
      url: '/newerSearchPosts',
      type: 'GET',
      contentType: 'application/json',
      data: data
    }).done(function(posts){
      newPost(posts, data.word);
      searchPostsPages.currentPage -=1;
      if (searchPostsPages.currentPage === 1) {
        $(".newerSearchPosts").hide();
      }
      if (searchPostsPages.totalPages !== searchPostsPages.currentPage) {
        $(".olderSearchPosts").show();
      }
    })
  }

  $(".pages").on("click", ".olderSearchPosts", getOlderSearchPosts)
  $(".pages").on("click", ".newerSearchPosts", getNewerSearchPosts)


  //pagination on search by tag

  var getOlderTagPosts = function(){
    var data = {
      id: $(".posts div:nth-child(10)").attr("data-id"),
      searchTag: $(".tagPagination").data('searchTag')
    };
     $.ajax({
      url: '/olderTagPosts',
      type: 'GET',
      contentType: 'application/json',
      data: data
    }).done(function(posts){
      newPost(posts, "searchByTags");
      $(".newerTagPosts").show();
      $(".all_posts").show();
      tagPostsPages .currentPage += 1;
      if (tagPostsPages.totalPages === tagPostsPages.currentPage){
          $(".olderTagPosts").hide();
      }
    })
  }

  var getNewerTagPosts = function(){
    var data = {
      id: $(".posts div:nth-child(1)").attr("data-id"),
      searchTag: $(".tagPagination").data('searchTag')
    };
     $.ajax({
      url: '/newerTagPosts',
      type: 'GET',
      contentType: 'application/json',
      data: data
    }).done(function(posts){
      console.log(posts)
      newPost(posts, "serachByTags");
      tagPostsPages.currentPage -=1;
      if (tagPostsPages.currentPage === 1) {
        $(".newerTagPosts").hide();
      }
      if (tagPostsPages.totalPages !== tagPostsPages.currentPage) {
        $(".olderTagPosts").show();
      }
    })
  }

  var openPostForm = function(){
    var fields = [$("input[name='title']"), $("textarea[name='body']"), $("input[name='tags']")];
    blogForm = $("#blogForm");
    if (!blogForm.is(":visible")){
      blogForm.show();
      $(".openPostForm").text("Close")
    } else {
      removeRed(fields);
      blogForm.hide();
      $(".openPostForm").text("New Post")
    }

  }
  $(".openPostForm").on("click", openPostForm)
  $(".pages").on("click", ".olderTagPosts", getOlderTagPosts);
  $(".pages").on("click", ".newerTagPosts", getNewerTagPosts)
});
