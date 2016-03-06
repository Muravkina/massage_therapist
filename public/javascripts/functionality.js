
  var Post = function(selector){
    this.post = selector.parents(".post"),
    this.id = this.post.attr('data-id')
  }


  var Posts = function(){
    this.lastPost = $(".posts div:nth-child(10)"),
    this.postsNumber = $(".posts div:nth-child(10)"),
    this.firstPostId = $(".posts div:nth-child(1)").attr("data-id"),
    this.popularPosts = $(".popularPosts.widget")
  }

  Posts.prototype.removePostFromPopular = function(id){
    var deletedPost;
    var popularPostsLinks = this.popularPosts.find("a");
    popularPostsLinks.each(function(link){
      if ($(this).attr('href').indexOf(id) > -1) {
          deletedPost = $(this).parents(".popular_post_wrap")
      }
      deletedPost.remove();
    })
  }

  var BlogForm = function(){
    this.form = $("#blogForm"),
    this.previewImage = this.form.find("#preview")
  }

  BlogForm.prototype.closeBlogForm = function(){
    $("#blogForm").hide();
    //change buuton back to 'New Post'
    $(".openPostForm").text("New Post");
    //remove preview image
    this.previewImage.attr('src', '');
    $(":file").val('')
  }

  var getFormData = function(){
    var formData = new FormData();
    var form = $('form').serializeArray();
    formData.append("image", $("#submitImageForPost")[0].files[0]);
     $.each(form,function(key,input){
        formData.append(input.name,input.value);
    });
    return formData;
  }

  var updateCategories = function(postTags){
    var tags = "";
    var categories = [];
    var uniqueCategories = [];
    //find all existing categories
    $(".categories_wrap").children().each(function(category){
      categories.push($(this).text())
    })
    //add new category to the categories array
    postTags.forEach(function(tag){
      categories.push(tag)
    })
    //filter category array to keep only unique fileds
    uniqueCategories = categories.filter(function(elem, index, self){
      return index == self.indexOf(elem);
    })
    //update categories box on the page
    $(".categories_wrap").empty()
    uniqueCategories.forEach(function(category){
      if(category !== "") {
        var categoryField = "<p class='searchTag'>" + category + "</p>"
        $(".categories").append(categoryField)
      }
    })
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
        console.log(checkable[i])
        if(!isValid(checkable[i])){
          checkable[i].addClass('red');
          fieldsAreValid = false;
        }
      }
      return fieldsAreValid;
    }

    var removeRed = function(checkable) {
      var errorsForm = checkable[0].parents(".row").find(".formErrors");
      errorsForm.find("p").remove();
      for(var i = 0; i < checkable.length; i++){
        checkable[i].removeClass('red').val('');
      }
    }

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
            var fullChangeImageForm = '';
            post.tags.forEach(function(tag){
              tags += "<span class='searchTag'>" + tag + "</span> "
            })
            if (post.tags[0] !== "") {
              tagsImage = "<img src='/images/tag.png' width='20px'>";
              tagsValue = "'" + post.tags.join(', ') + "'";
            } else {
              tagsValue = "'Tags...' style='color: #D1D1D1'";
            }
            if (isAuthenticated) {
              if (post.image) {
                image = "<img src='" + post.image.url + "' class='postImage' id='preview'>";
                deleteImageButton = "<p class='deleteImage'>Delete Image</p>";
                changeImageForm = "<p class='openChangeImage'>Change Image</p><div class='changeImageInput'><input type='file' name='image' class='editFile'><p class='changeImage'>Submit Image</p></div>";
                fullChangeImageForm = "<div class='change_image_wrap'>" + deleteImageButton + changeImageForm + "</div>"
              } else {
                fileUploadInput = "<input type='file' name='image' class='editFile'><p class='removePreview'>X</p>";
              }
             editForm = " </div><div class='edit_delete_wrapper'><p class='deletePost'>Delete</p><p class='openEdit'>Edit</p><div class='edit'><form id='editPostForm'>" + fullChangeImageForm + fileUploadInput + "<input type='text' name='editPostTitle' class='editPostTitle' value='" + post.title + "'><textarea name='editPostBody' class='editPostBody'>" + post.body + "</textarea><input type='text' name='editPostTags' class='editPostTags' value=" + tagsValue + "><div class='edit_post_wrap'><p class='editPost'>Update</p></div></form></div></div>"
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

    var dateFormat = function(date){
      var date = new Date(date);
      return date.toDateString()
    }

$(document).ready(function() {

    //parse posts
    $(".postBody").each(function(){
      html = $.parseHTML($(this).text());
      $(this).text('');
      $(this).append(html)
    })

    //facebook sharing
    $('.fb-share').click(function() {
      FB.ui({
        method: 'feed',
        link: window.location.href,
        caption: 'http://massage-59439.onmodulus.net/',
      }, function(response){});
    });



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

    var removeEditPreview = function(){
      var edit = $(this).parents(".edit");
      var preview = $(this).parents(".edit").find("img#preview");
      var imageUrl = $(this).data("img_url")
      preview.fadeOut(1000, function(){
        if(imageUrl !== 'undefined'){
          $(this).attr("src", imageUrl).show();
        } else {
          $(".removeEditPreview").remove()
          $(this).attr("src", "")
        }
        $(":file").val('');
        $(this).parents().find(".editFile").replaceWith(selected_photo = $(this).parents().find(".editFile"));
      })
    }

    $("body").on("click touchstart", ".removePostPreview", removePostPreview)
    $("body").on("click touchstart", ".removeEditPreview", removeEditPreview)



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

    var errorForm = function(selector){
      errorsForm = selector.parents(".row").find(".formErrors");
      errorsForm.find("p").remove();
      var error = "<p>Don't forget to fill out the fields marked in red</p>"
      errorsForm.append(error)
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
            $(input).parents(".edit").find(".removeEditPreview").data("img_url", $(input).parents(".post").find("#preview").attr('src'));
            $(".removeEditPreview").remove();
            var image_url = $(input).parents(".post").find(".postImage").attr('src');
            var preview = "<p class='removeEditPreview' data-img_url='" + image_url + "''>Remove preview</p>";
            $(input).parents(".edit").find(".editFile").after(preview);
            $(input).parents(".edit").find("#preview").attr('src', e.target.result);

          }
          $(input).parents("form").find("#preview").show();
        }
      reader.readAsDataURL(input.files[0]);
      }
      $(input).parents(".edit").find(".postImage").show();
    }

$("body").delegate(".editFile","change", function(){
    readURL(this);
});

// submit review
    $(".submit_review").on("click touchstart", function(event){
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
        errorForm($(this));
      }
  })


// submit request for documents
  var submitDocuments = function(event){
    event.preventDefault();
    event.stopPropagation();
    var form = $("#document_request_form");
    var checkable = [form.find("input[name='email']"), form.find("textarea[name='comment']")];
    var data = {
      phone: $("#phone").val(),
      email: $(".email").val(),
      comment: $(".comment").val(),
      documents: {
        Resume: $("#resume_document").is(":checked"),
        NYC_Registration: $("#registration").is(":checked"),
        AMTA_Insurance: $("#insurance").is(":checked"),
        Medical_Exams: $("#medical").is(":checked"),
        Continue_Ed_Certificates: $("#certificates").is(":checked"),
        CPR_Card: $("#cpr").is(":checked")
      }
    }
    if (fieldsAreValid(checkable)) {
      $("#spinster").show();
      $.ajax({
        type: 'POST',
        url:'/documentRequest',
        contentType: 'application/json',
        data: JSON.stringify(data)
      }).done(function(data){
        $("#spinster").hide();
        var html = "<p class='success_message'>Your request was succesfully submitted</p>";
        var header = $("#resume").find("h2");
        header.after(html);
        form.find('input, textarea').val('');
        $("#resume").find('input[type=checkbox]').each(function(){
          this.checked = false
        })
      })
    } else {
      errorForm($(this));
    }
  }

  $(".submit_documents").on("click touchstart", submitDocuments)

  //open edit form
  var openEdit = function(){
    var editForm = $(this).next();
    var post = $(this).parents(".post").children(".postData");
    var changeImageInput = editForm.find(".changeImageInput");
    if (!editForm.is(":visible")){
      editForm.show();
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
      formData.append('image', $(this).parents("#editPostForm").find('.editFile')[0].files[0]);
    }
    formData.append('title', $(this).parents("#editPostForm").children(".editPostTitle").val());
    formData.append('body', $(this).parents("#editPostForm").children(".editPostBody").val());
    formData.append('tags', $(this).parents("#editPostForm").children(".editPostTags").val());

    var editForm = $(this).parents(".edit");
    var post = $(this).parents(".post");

    var editedPost = {
      title : post.find(".postTitle"),
      body  : post.find(".postBody"),
      tags  : post.find(".postTags"),
      image : post.find(".postImage")
    }
    $("#spinster").show();
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
        $("#spinster").hide();
      })
  }

  $(".posts").on("click touchstart", ".openEdit", openEdit);
  $(".posts").on("click touchstart", ".editPost", updatePost);


// open comment form
  var openComment = function(){
    var commentForm = $(this).next();
    var fields = [$("input[name='commentAuthorName']"), $("textarea[name='commentBody']"), $("input[name='commentAuthorEmail']")];
    if (!commentForm.is(":visible")){
      commentForm.show();
      $(this).text("Close");
    } else {
      commentForm.hide();
      removeRed(fields)
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
      $("#spinster").show();
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
        $("#spinster").hide();
      })
    } else {
      errorForm($(this));
    }
  }

   $(".openComment").on("click touchstart", openComment);
   $(".posts").on("click touchstart", ".submitComment", submitComment);

// delete comment

  var deleteComment = function(event) {
  event.preventDefault();

  var postId = $(this).parents(".posts").find(".post").attr("data-id")
  var commentId = $(this).parents(".comment").attr("data-id");
  var comment = $(this).parents(".comment")
  $("#spinster").show();
  $.ajax({
      url: '/posts/' + postId + '/comments/' + commentId,
      type: 'DELETE',
      contentType: 'application/json'
    }).done(function(data){
      comment.empty();
      $("#spinster").hide();
    })
  }

  $(".comment_section").on("click", ".deleteComment", deleteComment)

// search by tags
  var searchTag = function(){
    var tag = $(this).text();
    $(".tagPagination").data('searchTag', tag)
    $("#spinster").show();
    $.ajax({
      url: '/tags/' + tag,
      type: 'GET',
      contentType: 'application/json'
    }).done(function(data){
      newPost(data.posts, "searchByTags", data.count);
      $('.all_posts').show();
      $("#spinster").hide();
    });
  }

  $("body").on("click touchstart", ".searchTag", searchTag)

  //search

  $("input[name='searchPosts']").on("keypress", function(event){
    if(event.which == 13){
      var searchArray = {params: $(this).val().trim().toLowerCase()};
      var word = $(this).val().replace(/[^a-zA-Z ]/g, '');
      $("#spinster").show();
      $.ajax({
        url: '/search',
        type: 'GET',
        data: searchArray,
        contentType: 'application/json'
      }).done(function(data){
        $("#spinster").hide();
        newPost(data.posts, word, data.count);
        $('.all_posts').show();
        $("input[name='searchPosts']").val('');
      })
    }
  })

  //pagination

  //older posts
  $(".pages").on("click touchstart", ".olderPosts", function(){
    var id = {id: $(".posts div:nth-child(10)").attr("data-id")};
    $("#spinster").show();
    $.ajax({
      url: '/olderPosts',
      type: 'GET',
      data: id,
      contentType: 'application/json'
    }).done(function(posts){
      $("#spinster").hide();
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
  $(".pages").on("click touchstart", ".newerPosts", function(){
    var id = {id: $(".posts div:nth-child(1)").attr("data-id")};
    $("#spinster").show();
    $.ajax({
      url: '/newerPosts',
      type: 'GET',
      data: id,
      contentType: 'application/json'
    }).done(function(posts){
      $("#spinster").hide();
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
  $(".pages").on("click touchstart", ".olderReviews", function(){
    var id = {id: $(".reviews_collection div:nth-child(10)").attr("data-id")};
    $("#spinster").show();
    $.ajax({
      url: '/olderReviews',
      type: 'GET',
      data: id,
      contentType: 'application/json'
    }).done(function(reviews){
      $("#spinster").hide();
      newReview(reviews);
      reviewsPages.currentPage += 1;
      if (reviewsPages.totalPages === reviewsPages.currentPage){
          $(".olderReviews").hide();
      }
      $(".newerReviews").show();
    })
  })

   //newer reviews
  $(".pages").on("click touchstart", ".newerReviews", function(){
    var id = {id: $(".reviews_collection div:nth-child(1)").attr("data-id")};
    $("#spinster").show();
    $.ajax({
      url: '/newerReviews',
      type: 'GET',
      data: id,
      contentType: 'application/json'
    }).done(function(reviews){
      $("#spinster").hide();
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
    $("#spinster").show();
    $.ajax({
        url: '/reviews/' + id,
        type: 'DELETE',
        contentType: 'application/json'
      }).done(function(data){
        review.empty();
        $("#spinster").hide();
      })
  }
  $(".reviews_collection").on("click touchstart", ".deleteReview", deleteReview);

//back to all posts

  var backToPosts = function(){
    $('.olderSearchPosts, .newerSearchPosts, .olderTagPosts, .newerTagPosts').hide();
    $('.olderPosts').show();
    $("#spinster").show();
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
        $("#spinster").hide();
      })
  }

  $(".all_posts").on("click touchstart", backToPosts)

// delete image
  $(".posts").on("click touchstart", ".deleteImage", function(event){
    event.preventDefault()
    var id = $(this).parents(".post").attr("data-id");
    var postImage = $(this).parents(".post").find(".postImage");
    var changeButton = $(this).parents("#editPostForm").find(".openChangeImage");
    console.log(changeButton)
    var editForm = $(this).parents("#editPostForm");
    var deleteButton = $(this)
    $("#spinster").show();
    $.ajax({
        url: '/deleteImage/' + id,
        type: 'DELETE',
        contentType: 'application/json'
      }).done(function(data){
        $("#spinster").hide();
        deleteButton.hide();
        changeButton.hide();
        var fileInput = "<input type='file' name='image' class='editFile'>";
        editForm.prepend(fileInput);
        postImage.removeAttr('src')
      })
  })

// open change image input
  var openChange = function(event){
    event.preventDefault();
    var editForm = $(this).parent();
    var changeImageInput = editForm.find(".changeImageInput");
    if (!changeImageInput.is(":visible")){
      changeImageInput.show();
      $(this).text("Nevermind");
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
  $("#spinster").show();
  $.ajax({
    url: '/changeImage/' + id,
    type: 'PUT',
    contentType: false,
    processData: false,
    data: formData
  }).done(function(data){
    $("#spinster").hide();
    images.attr("src", data.image.url);
    editForm.find(".changeImageInput").hide();
    editForm.find(".openChangeImage").text('Change Image');
  });
}


 $(".posts").on("click touchstart", ".openChangeImage", openChange)
 $(".posts").on("click touchstart", ".changeImage", changeImage)

// subscribe by email

  var addEmailToSubscribeList = function(event){
    event.preventDefault();
    var data = {
      email : $(".subscribeEmail").val()
    }
    $("#spinster").show();
    $.ajax({
      url: '/addEmail',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(email){
      $("#spinster").hide();
      $(".subscribeEmail").val('');
    });
  }

  $(".subscribeByEmail").on("click touchstart", addEmailToSubscribeList)


  //pagination on serach by word

  var getOlderSearchPosts = function(){
    var data = {
      id: $(".posts div:nth-child(10)").attr("data-id"),
      searchWords: $("input[name='searchPosts']").val().trim().toLowerCase(),
      word : $("input[name='searchPosts']").val().replace(/[^a-zA-Z ]/g, '')
    };
    $("#spinster").show();
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
      $("#spinster").hide();
    })
  }

  var getNewerSearchPosts = function(){
    var data = {
      id: $(".posts div:nth-child(1)").attr("data-id"),
      searchWords: $("input[name='searchPosts']").val().trim().toLowerCase(),
      word : $("input[name='searchPosts']").val().replace(/[^a-zA-Z ]/g, '')
    };
    $("#spinster").show();
     $.ajax({
      url: '/newerSearchPosts',
      type: 'GET',
      contentType: 'application/json',
      data: data
    }).done(function(posts){
      $("#spinster").hide();
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

  $(".pages").on("click touchstart", ".olderSearchPosts", getOlderSearchPosts)
  $(".pages").on("click touchstart", ".newerSearchPosts", getNewerSearchPosts)


  //pagination on search by tag

  var getOlderTagPosts = function(){
    var data = {
      id: $(".posts div:nth-child(10)").attr("data-id"),
      searchTag: $(".tagPagination").data('searchTag')
    };
    $("#spinster").show();
     $.ajax({
      url: '/olderTagPosts',
      type: 'GET',
      contentType: 'application/json',
      data: data
    }).done(function(posts){
      $("#spinster").hide();
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
    $("#spinster").show();
     $.ajax({
      url: '/newerTagPosts',
      type: 'GET',
      contentType: 'application/json',
      data: data
    }).done(function(posts){
      $("#spinster").hide();
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

  var submitEmail = function(event){
    event.preventDefault();
    event.stopPropagation();

    var data = {
      name: $("#message_name").val(),
      email: $("#message_email").val(),
      message: $("#message_text").val()
    }

    var checkable = [$("#message_name"), $("#message_email"), $("#message_text")];
    console.log(checkable)
    if (fieldsAreValid(checkable)) {

    $("#spinster").show();
    $.ajax({
      type: 'POST',
      url:'/submitEmail',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(data){
      $("#spinster").hide();
      $("#message_name").val('');
      $("#message_email").val('');
      $("#message_text").val('');
      removeRed(checkable)
      var html = "<p class='success_message'>Your message was succesfully submitted</p>";
      var header = $("p.contact_info");
      header.after(html)
    })

  } else {
    errorForm($(this));
  }
  }





  $("#submitEmail").on("click", submitEmail)
  $(".openPostForm").on("click touchstart", openPostForm)
  $(".pages").on("click touchstart", ".olderTagPosts", getOlderTagPosts);
  $(".pages").on("click touchstart", ".newerTagPosts", getNewerTagPosts)
});
