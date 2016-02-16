var Car = {
  selector: document.getElementById("car"),
  dx: 1,
  changeDirection: function(){
    car.dx *= -1;
    car.selector.classList.toggle('drive-left')},

}
