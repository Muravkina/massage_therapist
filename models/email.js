var Email = function(message){
  this.from = 'massagebygerill@gmail.com';
  this.to = 'massagebygerill@gmail.com';
  this.subject = 'New Message from your website';
  this.message = message
}

module.exports = {
  Email   : Email
}

var Message = function(req){
  this.body = "<b>Hello from your favourite wife</b><p>You received a new email from your website</p><h2>Email</h2><p><b>Name: </b>" + req.body.name + "<br><b>Email: </b>" + req.body.email + "<br><b>Message: </b>" + req.body.message + "<br><br>Don't forget to answer!<br> Best, your email provider - wife.com"
}
