//check if the fields are valid
var isValid = function(field){
  if (!field.val()){
    return false
  } else {
    return true
  }
};

var fieldsAreValid = function(checkable) {
  var fieldsAreValid = true;
  for (var i = 0; i < checkable.length; i++){
    if(!isValid(checkable[i])){
      checkable[i].addClass('red');
      fieldsAreValid = false;
    }
  }
  return fieldsAreValid;
};

//remove red fields from errors
var removeRed = function(checkable) {
  var errorsForm = checkable[0].parents(".row").find(".formErrors");
  errorsForm.find("p").remove();
  for(var i = 0; i < checkable.length; i++){
    checkable[i].removeClass('red').val('');
  }
};

//date formatting
var dateFormat = function(date){
  var date = new Date(date);
  return date.toDateString()
};
//errors

var errorForm = function(selector){
  errorsForm = selector.parents(".row").find(".formErrors");
  errorsForm.find("p").remove();
  var error = "<p>Don't forget to fill out the fields marked in red</p>"
  errorsForm.append(error)
};
