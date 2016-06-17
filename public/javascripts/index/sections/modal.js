$(document).ready(function() {

var btnRadius = $('.modal_background').width()/2,
	left = $('.modal_background').offset().left + btnRadius,
	top = $('.modal_background').offset().top + btnRadius - $(window).scrollTop(),
	scale = scaleValue(top, left, btnRadius, $(window).height(), $(window).width());
 
function scaleValue( topValue, leftValue, radiusValue, windowW, windowH) {
	var maxDistHor = ( leftValue > windowW/2) ? leftValue : (windowW - leftValue),
		maxDistVert = ( topValue > windowH/2) ? topValue : (windowH - topValue);
	return Math.ceil(Math.sqrt( Math.pow(maxDistHor, 2) + Math.pow(maxDistVert, 2) )/radiusValue);
}
}
