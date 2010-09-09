var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
context.save();
var height=600, width=600;
context.clear = function(){
  context.restore();
  context.clearRect(0,0,width,height);
  context.save();

};

var degToRad = 0.01745329525;
var Gear = function(opts){
  opts = opts||{};
  this.x = opts.x || width/2;
  this.y = opts.y || height/2;
  this.diameter = opts.diameter || 100;
  this.teethAngle = opts.teethAngle || 5*degToRad;
  this.teethLength = opts.teethLength || this.diameter/3;
  this.teethCount = opts.teethCount || 12;
  this.teethAngle = (opts.teethAngle || 5) * degToRad;
  this.teethDiameter = this.diameter+this.teethLength;
  this.teethTheta = (180 / this.teethCount);
  this.teethRatio = this.teethDiameter/this.diameter;
  this.teethSlip = Math.sin(this.teethAngle) * (this.teethDiameter-this.diameter);
  this.strokeStyle = opts.strokeStyle || 'rgba(0,192,0,255)';
  this.fillStyle = opts.fillStyle || null;
  this.hubDiameter = opts.hubDiameter || this.diameter / 2;
  this.rotation = opts.rotation||0;
  this.rotationSpeed = opts.rotationSpeed||1;
  // slip without angle
  // teethSlip = (teethTheta - (teethTheta / teethRatio ));
  var g = this;
  this._drawHub = function(){
    context.beginPath();
    if(this.strokeStyle) context.strokeStyle = this.strokeStyle;
    if(this.fillStyle) context.fillStyle = this.fillStyle;
    context.arc(0,0,this.hubDiameter,0,360*degToRad);
    context.stroke();
    context.closePath();
  };
  this.draw = function(){
    context.save();
    this.rotation+=this.rotationSpeed;
    context.translate (this.x, this.y);
    context.rotate(this.rotation*degToRad);
    this._drawHub();
    context.beginPath();
    if(this.strokeStyle) context.strokeStyle = this.strokeStyle;
    if(this.fillStyle) context.fillStyle = this.fillStyle;
    context.lineWidth = 1;
    var iterations = 360;
    var i, startAngle, endAngle;
    // dont start a tooth at the very start or end
    var teethAngleCnt = this.teethTheta/2;
    var teething = false;
    for(i = 1; i <= iterations; i++, teethAngleCnt++){
      startAngle = (i-1)*degToRad;
      endAngle = i*degToRad;
      var d = teething ? this.teethDiameter : this.diameter;
      context.arc(0,0,d,startAngle,endAngle);
      if(teethAngleCnt > this.teethTheta){
	teething = !teething;
	//handles distributing fractional degrees among all the teeth
	teethAngleCnt -= this.teethTheta;

        // trim the teeth so they can slip in/out
        i += this.teethSlip; teethAngleCnt+=this.teethSlip;
      }
    }
    context.lineTo(this.diameter, 0);
    context.stroke();
    context.closePath();
    context.restore();
  };
};

context.clear();
var g = new Gear({x: 150, y:150});
var g2 = new Gear({x: 325, y:325,
                   rotation:g.teethTheta/2,
                   rotationSpeed : -1 * g.rotationSpeed});
var spin = function(){
  context.clear();
  g.draw();
  g2.draw();
  window.setTimeout(spin, 25);
};
window.setTimeout(spin, 25);

