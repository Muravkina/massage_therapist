var Email = function(message){
  this.from = 'massagebygerill@gmail.com';
  this.to = 'massagebygerill@gmail.com';
  this.subject = 'New Message from your website';
  this.html = message
}

module.exports = {
  Email   : Email
}

