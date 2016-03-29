$(document).ready(function() {

var newReview = function(reviews, user){
  $(".reviews_collection").empty();
  reviews.forEach(function(review){
    var deleteButton = '';
    if (user) {
      deleteButton = "<button class='deleteReview'>Delete</button>"
    }
    var review = "<div class='review six columns' data-id='" + review._id + "'><div class='star-ratings-css' title='" + review.stars + "'></div><p class='review_body'>" + review.body + "</p><p class='review_author'>" + review.author + "</p>" + deleteButton + "</div>";
    $(".reviews_collection").append(review);
  });
};

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
    $(".submit_review > #spinster").show();
    $(".submit_review > span").text("Submitting")
    $.ajax({
        type: 'POST',
        url: "/",
        contentType: 'application/json',
        data: JSON.stringify(data)
    }).done(function(review){
      $(".submit_review").text("Done")
      $(".submit_review > #spinster").hide();
      removeRed(fields);
      $('input[name=rating]').attr('checked', false);
      var review = "<div class='review six columns'><div class='star-ratings-css' title= '." + review.stars + "'></div><p class='review_body'>" + review.body + "</p><p class='review_author'>" + review.author + "</p></div>"

      //empty the last review if the number of reviews on the page is 10
      if (data.reviewsNumber === 10) {
        data.lastReview.empty()
      }
      $(".reviews_collection").prepend(review);
      $(".submit_review").off("click touchstart").on("click touchstart", function(e){
        e.preventDefault()
        var errorsForm = $(this).parents('.row').find(".formErrors");
        var text = "<p>Oops, seems like you've already submitted your review</p>"
        errorsForm.find("p").remove();
        errorsForm.append(text)
      })
    })
  } else {
    errorForm($(this));
  }
})

//pagination
var reviewsPages = {
  totalPages: Math.ceil($(".reviews_collection").attr("data-id")/10),
  currentPage: 1
}
//older reviews
$(".pages").on("click touchstart", ".olderReviews", function(){
  var id = {id: $(".reviews_collection div:nth-child(10)").attr("data-id")};
  $(".pages > #spinster").show();
  $.ajax({
    url: '/olderReviews',
    type: 'GET',
    data: id,
    contentType: 'application/json'
  }).done(function(data){
    $(".pages > #spinster").hide();
    newReview(data.reviews, data.user);
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
  $(".pages > #spinster").show();
  $.ajax({
    url: '/newerReviews',
    type: 'GET',
    data: id,
    contentType: 'application/json'
  }).done(function(data){
    $(".pages > #spinster").hide();
    newReview(data.reviews, data.user);
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
  $(this).children("#spinster").show();
  $(this).children("span").text("Deleting..")
  $.ajax({
      url: '/reviews/' + id,
      type: 'DELETE',
      contentType: 'application/json'
    }).done(function(data){
      review.empty();
      $(".deleteReview > #spinster").hide();
    })
}
$(".reviews_collection").on("click touchstart", ".deleteReview", deleteReview);

});
