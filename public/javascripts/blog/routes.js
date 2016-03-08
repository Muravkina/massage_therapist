$(document).ready(function() {


//submit post

var submitPost = function(event){
  event.preventDefault()

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
      $(".submitPost > #spinster").hide();
      $(".submitPost > span").text("Submit");
      //remove error fields
      removeRed(fields);
      //hide form for a new post
      blogForm.closeBlogForm();
      //create a new post
      newPost(data.posts);
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
      newPost(data.posts)
      //Remove deleted post from popular posts
      posts.removePostFromPopular(post);
    })
}

$(".posts").on("click touchstart", ".deletePost", deletePost);

});
