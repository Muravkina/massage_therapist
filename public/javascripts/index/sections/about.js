var Section = function(selector){
  this.selector = selector;
  this.anchor = $(".about_pictures").children(".section");
  this.topPart = selector.find("img.top_part");
  this.middlePart = selector.find("img.middle_part");
  this.bottomPart = selector.find("img.bottom_part");
  this.word = selector.find("h2");
}
Section.prototype.findInfoBox = function(e){
  var name = this.selector.attr('class').replace("section", "");
  return $(".container#"+name).addClass('info');
}

Section.prototype.showWord = function(){
  this.word.show("slide", {direction: "left"}, 200);
}

Section.prototype.hideWord = function(){
  this.word.hide("slide", {direction: "left"}, 200);
}

Section.prototype.showImage = function(e){
  this.topPart.show("slide", { direction: "left" }, 200);
  this.middlePart.show("slide", { direction: "right" }, 200);
  this.bottomPart.show("slide", { direction: "left" }, 200);

}

Section.prototype.hideImage = function(e){
  this.topPart.hide("slide", { direction: "left" }, 200);
  this.middlePart.hide("slide", { direction: "right" }, 200);
  this.bottomPart.hide("slide", { direction: "left" }, 200);
}

Section.prototype.displayTitle = function(e){
  this.hideImage();
  this.showWord();
}

Section.prototype.hideTitle = function(e) {
  this.hideWord();
  this.showImage();
}

Section.prototype.iterateThoughImages = function(callback){
  $.each(this.anchor, function(i, imageWrap){
    $('div', imageWrap).each(function(b){
      var section = new Section($(imageWrap))
      if (screen.width >= 736 ) {
        callback.bind(section)();
      }
    })
  })
}

Section.prototype.hideAllImages = function(selector){
  this.iterateThoughImages(this.hideImage)
  this.hideWord();
  this.displayContent()
  // this.wait(selector, this.displayContent.bind(this))
}

Section.prototype.showAllImages = function(selector){
  this.iterateThoughImages(this.showImage)
}

Section.prototype.wait = function(selector, callback){
  var intervalID = setInterval(function(){
    console.log(!$(".top_part, .middle_part, .bottom_part, h2").is(":animated"))
    if(!$(".top_part, .middle_part, .bottom_part, h2").is(":animated")){
      clearInterval(intervalID)
      callback()
    }
  }, 0.01)
}

Section.prototype.displayContent = function(e){
  var infoBox = this.findInfoBox();
  $(".about_pictures").hide();
  //firefox margin width fix
  var x = $(window).width() - infoBox.width();
  infoBox.css("margin-left", x/2);
  infoBox.css("margin-right", x/2);

  infoBox.show("blind", {}, 200)
  this.anchor.off('mouseleave')
}

Section.prototype.hideContent = function(e){
  var infoBox = this.findInfoBox();
  infoBox.hide();
  $(".about_pictures").show();
  this.showAllImages();
  $(".section").on("mouseleave", function(){
    var section = new Section($(this));
    section.hideTitle();
  });
}

$(".section").on("mouseover", function(){
  var section = new Section($(this));
  section.displayTitle();
});

$(".section").on("mouseleave", function(){
  var section = new Section($(this));
  section.hideTitle();
});

$(".section").on("click", function(){
  var section = new Section($(this))
  section.hideAllImages($(this));
});

$(".close_icon_wrap").on("click", function(){
  var infoBoxId = $(this).parents(".container").attr('id');
  var sectionSelector = $(".section."+infoBoxId);
  var section = new Section(sectionSelector);
  section.hideContent();
})


