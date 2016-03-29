$(document).ready(function() {

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

var postPages = {
  totalPages: Math.ceil($(".pages").attr("data-id")/10),
  currentPage: 1
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

var searchPostsPages = {
  totalPages: 0,
  currentPage: 1
}

var tagPostsPages = {
  totalPages: 0,
  currentPage: 1
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

var newPost = function(posts, user, searchArray, totalPosts){
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
      if (user) {
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
      $(".olderPosts").hide()
      console.log(totalPosts)
      if(totalPosts > 10) {
        searchPostsPages.totalPages = Math.ceil(totalPosts/10);
        $(".olderSearchPosts").show();
      }
    } else if (searchArray && searchArray === "searchByTags"){
      $(".olderPosts").hide()
      if(totalPosts > 10) {
        tagPostsPages.totalPages = Math.ceil(totalPosts/10);
        $(".olderTagPosts").show()
      }
    }
  }
};

//parse posts
$(".postBody").each(function(){
  html = $.parseHTML($(this).text());
  $(this).text('');
  $(this).append(html)
})

//image previews

//remove preview image in creating post form
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

//remove preview image in editing post form
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
  $(".editPost > #spinster").show();
  $(".editPost > span").text('updating');
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
    $(".editPost > #spinster").hide();
    $(".editPost > span").text('update');
  })
}

$(".posts").on("click touchstart", ".openEdit", openEdit);
$(".posts").on("click touchstart", ".editPost", updatePost);

// search by tags
var searchTag = function(){
  var tag = $(this).text();
  $(".tagPagination").data('searchTag', tag)
  $("#spinster.body").show();
  $.ajax({
    url: '/tags/' + tag,
    type: 'GET',
    contentType: 'application/json'
  }).done(function(data){
    newPost(data.posts, data.user, "searchByTags", data.count);
    $('.all_posts').show();
    $("#spinster.body").hide();
  });
}

$("body").on("click touchstart", ".searchTag", searchTag)

//search
$("input[name='searchPosts']").on("keypress", function(event){
  if(event.which == 13){
    var searchArray = {params: $(this).val().trim().toLowerCase()};
    var word = $(this).val().replace(/[^a-zA-Z ]/g, '');
    $("#spinster.body").show();
    $.ajax({
      url: '/search',
      type: 'GET',
      data: searchArray,
      contentType: 'application/json'
    }).done(function(data){
      $("#spinster.body").hide();
      newPost(data.posts, data.user, word, data.count);
      $('.all_posts').show();
      $("input[name='searchPosts']").val('');
      $("input[name='searchPosts']").data('word', word);
    })
  }
})

//pagination

//older posts
$(".pages").on("click touchstart", ".olderPosts", function(){
  var id = {id: $(".posts div:nth-child(10)").attr("data-id")};
  $(".pages #spinster").css('display', 'block');
  $.ajax({
    url: '/olderPosts',
    type: 'GET',
    data: id,
    contentType: 'application/json'
  }).done(function(data){
    $(".pages #spinster").css('display', 'none');
    newPost(data.posts, data.user);
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
  $(".pages #spinster").css('display', 'block');
  $.ajax({
    url: '/newerPosts',
    type: 'GET',
    data: id,
    contentType: 'application/json'
  }).done(function(data){
    $(".pages #spinster").css('display', 'none');
    newPost(data.posts, data.user);
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

//back to all posts
var backToPosts = function(){
  $('.olderSearchPosts, .newerSearchPosts, .olderTagPosts, .newerTagPosts').hide();
  $('.olderPosts').show();
  $(".all_posts.back > #spinster").show();
  $(".all_posts.back > span").text("One second, please..")
  $.ajax({
    url: '/back',
    type: 'GET',
    contentType: 'application/json'
  }).done(function(data){
    $(".all_posts.back > #spinster").hide();
    $(".all_posts.back > span").text('Back to all posts');
    newPost(data.posts, data.user);
    $(".searchBox > input").val('')
    $(".widget").unhighlight({ element: 'span'});
    $(".widget").unhighlight({ element: 'p'});
    postPages.currentPage = 1;
    $(".all_posts").hide();
    $(".newerReviews").hide();
  })
}

$(".all_posts").on("click touchstart", backToPosts)

// delete image
$(".posts").on("click touchstart", ".deleteImage", function(event){
  event.preventDefault()
  var id = $(this).parents(".post").attr("data-id");
  var postImage = $(this).parents(".post").find(".postImage");
  var changeButton = $(this).parents("#editPostForm").find(".openChangeImage");
  var editForm = $(this).parents("#editPostForm");
  var deleteButton = $(this)
  $(".deleteImage > #spinster").show();
  $(".deleteImage > span").text('Deleting')
  $.ajax({
      url: '/deleteImage/' + id,
      type: 'DELETE',
      contentType: 'application/json'
    }).done(function(data){
      $(".deleteImage > #spinster").hide();
      $(".deleteImage > span").text('Delete');
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
  $(".changeImage > #spinster").show();
  $(".changeImage > span").text('Submitting');
  $.ajax({
    url: '/changeImage/' + id,
    type: 'PUT',
    contentType: false,
    processData: false,
    data: formData
  }).done(function(data){
    $(".changeImage > #spinster").hide();
    $(".changeImage > span").text('Submit image');
    images.attr("src", data.image.url);
    editForm.find(".removeEditPreview").data('img_url', data.image.url)
    editForm.find(".changeImageInput").hide();
    editForm.find(".openChangeImage").text('Change Image');
  });
}

$(".posts").on("click touchstart", ".openChangeImage", openChange)
$(".posts").on("click touchstart", ".changeImage", changeImage);

// subscribe by email
var addEmailToSubscribeList = function(event){
  event.preventDefault();
  var data = {
    email : $(".subscribeEmail").val()
  }
  if (!data.email) {
    $(".subscribeEmail").css('border-color', 'red')
  } else {
    $(".subscribeByEmail > #spinster").show();
    $(".subscribeByEmail > span").text('Submitting');
    $(".subscribeEmail").css('border-color', '#aaaaaa')
    $.ajax({
      url: '/addEmail',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(email){
      $(".subscribeByEmail > #spinster").hide();
      $(".subscribeByEmail > span").text('Submit');
      $(".subscribeEmail").val('');
    });
  }
}

$(".subscribeByEmail").on("click touchstart", addEmailToSubscribeList)

//pagination on serach by word
var getOlderSearchPosts = function(){
  var data = {
    id: $(".posts div:nth-child(10)").attr("data-id"),
    searchWords: $("input[name='searchPosts']").data('word')
  };
  $(".newerPosts").hide();
  $(".pages #spinster").css('display', 'block');
   $.ajax({
    url: '/olderSearchPosts',
    type: 'GET',
    contentType: 'application/json',
    data: data
  }).done(function(posts){
    newPost(posts.posts, posts.user, data.word);
    $(".newerSearchPosts").show();
    $(".all_posts").show();
    searchPostsPages .currentPage += 1;
    if (searchPostsPages.totalPages === searchPostsPages.currentPage){
        $(".olderSearchPosts").hide();
    }
    $(".pages #spinster").css('display', 'none');
  })
}

var getNewerSearchPosts = function(){
  var data = {
    id: $(".posts div:nth-child(1)").attr("data-id"),
    searchWords: $("input[name='searchPosts']").data('word')
  };
  $(".pages #spinster").css('display', 'block');
   $.ajax({
    url: '/newerSearchPosts',
    type: 'GET',
    contentType: 'application/json',
    data: data
  }).done(function(posts){
    $(".pages #spinster").css('display', 'none');
    newPost(posts.posts, posts.user, data.word);
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
  $(".pages #spinster").css('display', 'block');
   $.ajax({
    url: '/olderTagPosts',
    type: 'GET',
    contentType: 'application/json',
    data: data
  }).done(function(posts){
    $(".pages #spinster").css('display', 'none');
    newPost(posts.posts, posts.user, "searchByTags");
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
  $(".pages #spinster").css('display', 'block');
   $.ajax({
    url: '/newerTagPosts',
    type: 'GET',
    contentType: 'application/json',
    data: data
  }).done(function(posts){
    $(".pages #spinster").css('display', 'none');
    newPost(posts.posts, posts.user, "serachByTags");
    tagPostsPages.currentPage -=1;
    if (tagPostsPages.currentPage === 1) {
      $(".newerTagPosts").hide();
    }
    if (tagPostsPages.totalPages !== tagPostsPages.currentPage) {
      $(".olderTagPosts").show();
    }
  })
}

var openPostForm = function(e){
  e.stopPropagation();
  e.preventDefault();
  var fields = [$("input[name='title']"), $("textarea[name='body']"), $("input[name='tags']")];
  blogForm = $("#blogForm");
  if (!blogForm.is(":visible")){
    blogForm.show();
    $(".openPostForm").text("Close");
    console.log($(this))
    $(this).siblings("#blogForm").find("#preview").attr("height", "0").attr("width", "0");
    $(".removePostPreview").remove();
  } else {
    removeRed(fields);
    blogForm.hide();
    $(".openPostForm").text("New Post")
  }
}

$(".openPostForm").on("click touchstart", openPostForm);
$(".pages").on("click touchstart", ".olderTagPosts", getOlderTagPosts);
$(".pages").on("click touchstart", ".newerTagPosts", getNewerTagPosts);

//submit post
var submitPost = function(event){
  event.preventDefault();
  event.stopPropagation();

  var checkable = [$("input[name='title']"), $("textarea[name='body']")];
  var fields = [$("input[name='title']"), $("textarea[name='body']"), $("input[name='tags']")];

  var formData = getFormData();
  var blogForm = new BlogForm();

  if (fieldsAreValid(checkable)) {
    $(".submitPost > #spinster").show();
    $(".submitPost > span").text("Submitting");
    $.ajax({
      type: 'POST',
      url: "/blog",
      contentType: false,
      processData: false,
      data: formData
    }).done(function(data){
      console.log(data)
      $(".submitPost > #spinster").hide();
      $(".submitPost > span").text("Submit");
      //remove error fields
      removeRed(fields);
      //hide form for a new post
      blogForm.closeBlogForm();
      //create a new post
      newPost(data.posts, data.user);
      //update the categories
      updateCategories(data.post.tags)
    })
  } else {
    errorForm()
  }
}

$(".submitPost").on("click touchstart", submitPost)

//delete post
var deletePost = function(event){
event.preventDefault();
var posts = new Posts();
var post = new Post($(this));
$("#spinster.body").show();
$.ajax({
    url: '/posts/' + post.id,
    type: 'DELETE',
    contentType: 'application/json',
    data: JSON.stringify(posts)
  }).done(function(data){
    $("#spinster.body").hide();
    newPost(data.posts, data.user)
    //Remove deleted post from popular posts
    posts.removePostFromPopular(post);
  })
}

$(".posts").on("click touchstart", ".deletePost", deletePost);

});
