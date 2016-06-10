$(document).ready(function() {

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
    $(".submit_documents> #spinster").show();
    $(".submit_documents > span").text("Submitting")
    removeRed(checkable);
    $.ajax({
      type: 'POST',
      url:'/documentRequest',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(data){
      $(".submit_documents> #spinster").hide();
      $(".submit_documents > span").text("Submit")
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

$(".submit_documents").on("click touchstart", submitDocuments);

var submitEmail = function(event){
  event.preventDefault();
  event.stopPropagation();
  $(".success_message").remove();

  var data = {
    name: $("#message_name").val(),
    email: $("#message_email").val(),
    message: $("#message_text").val()
  }

  var checkable = [$("#message_name"), $("#message_email"), $("#message_text")];
  if (fieldsAreValid(checkable)) {
    removeRed(checkable);
    $("#submitEmail > #spinster").show();
      $("#submitEmail > span").text("Submitting")
    $.ajax({
      type: 'POST',
      url:'/submitEmail',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).done(function(data){
      $("#submitEmail > #spinster").hide();
      $("#submitEmail > span").text("Submit")
      removeRed(checkable)
      var html = "<p class='success_message'>Your message was succesfully submitted</p>";
      var header = $("p.contact_info");
      header.after(html)
      })
  } else {
    errorForm($(this));
  }
}
  $("#submitEmail").on("click", submitEmail);

});
