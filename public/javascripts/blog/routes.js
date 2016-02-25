$(document).ready(function() {

//submit post

var submitPost = function(event){
  event.preventDefault()

  var checkable = [$("input[name='title']"), $("textarea[name='body']")];
  var fields = [$("input[name='title']"), $("textarea[name='body']"), $("input[name='tags']")];

  var formData = getFormData();
  var blogForm = new BlogForm();

  if (fieldsAreValid(checkable)) {
    $.ajax({
      type: 'POST',
      url: "/blog",
      contentType: false,
      processData: false,
      data: formData
    }).done(function(data){
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

});
