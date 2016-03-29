$(document).ready(function() {
//facebook sharing
// $('.fb-share').click(function() {
//   FB.ui({
//     method: 'feed',
//     link: window.location.href,
//     caption: 'http://massage-59439.onmodulus.net/',
//   }, function(response){});
// });

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
    $("#spinster.body").show();
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
      $("#spinster.body").hide();
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
$("#spinster.body").show();
$.ajax({
    url: '/posts/' + postId + '/comments/' + commentId,
    type: 'DELETE',
    contentType: 'application/json'
  }).done(function(data){
    comment.empty();
    $("#spinster.body").hide();
  })
}

$(".comment_section").on("click", ".deleteComment", deleteComment)

});
