var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
context.save();
var height=600, width=600;
context.clear = function(){
  context.restore();
  context.clearRect(0,0,width,height);
  context.save();
  context.translate (width/2,height/2);
};

var degToRad = 0.01745329525;

var spiral = function(diameter, diameterGrowth, rotations){
  rotations = rotations||20;
  context.beginPath();
  context.strokeStyle = 'rgba(0,192,0,255)';
  context.lineWidth = 1;
  diameterGrowth = diameterGrowth || 10;
  diameter = diameter || 1;
  var iterations = 360 * rotations;
  var diameterGrowthRate = diameterGrowth / 360;
  var i, startAngle, endAngle;
  for(i = 1; i < iterations; i++){
      startAngle = (i-1)*degToRad;
      endAngle = i*degToRad;
      context.arc(0,0,diameter,startAngle,endAngle);
      diameter+=diameterGrowthRate;
  }
  // Merge back in / finish spiral
  for(i = 1; i < 360; i++){
      startAngle = (i-1)*degToRad;
      endAngle = i*degToRad;
      context.arc(0,0,diameter,startAngle,endAngle);
  }
  context.stroke();
  context.closePath();
};

var angle = 0;
var spin = function(){
  context.clear();
  angle+=15;
  context.rotate(angle*degToRad);
  spiral();
  window.setTimeout(spin, 25);
};
window.setTimeout(spin, 25);

