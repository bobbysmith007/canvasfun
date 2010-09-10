var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
context.save();
var height=600, width=600;
context.clear = function(){
  context.restore();
  context.clearRect(0,0,width,height);
  context.save();

};
var mergeHash = function(h1, h2){
  h1 = h1||{};
  h2 = h2||{};
  for(key in h2)if (!h1[key]) h1[key] = h2[key];
  return h1;
};

var degToRad = 0.01745329525;
var Gear = function(opts){
  opts = opts||{};
  // Set defaults and opts
  mergeHash(this, mergeHash(opts, {
    x: width/2,
    y: height/2,
    diameter: 100,
    teethAngle: 10*degToRad,
    teethCount: 12,
    strokeStyle: 'rgba(0,192,0,255)',
    rotation: 0,
    rotationSpeed: 1
  }));
  this.opts = opts;
  this.teethLength = opts.teethLength || this.diameter/3;
  this.teethDiameter = this.diameter+this.teethLength;
  this.teethTheta = (180 / this.teethCount);
  this.teethRatio = this.teethDiameter/this.diameter;
  this.teethSlip = Math.sin(this.teethAngle) * (this.teethDiameter-this.diameter);
  this.hubDiameter = opts.hubDiameter || this.diameter / 2;

  // slip without angle
  // teethSlip = (teethTheta - (teethTheta / teethRatio ));
  var g = this;
  this._drawHub = function(){
    context.beginPath();
    if(this.strokeStyle) context.strokeStyle = this.strokeStyle;
    if(this.fillStyle) context.fillStyle = this.fillStyle;
    context.arc(0,0,this.hubDiameter,0,360*degToRad, false);
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
      context.arc(0,0,d,startAngle,endAngle, false);
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
  this.makeNewAttachedGear = function(opts){
    opts = mergeHash(opts, g.opts );
    opts = mergeHash(opts, {relativeAngle:0, gearPadding:6, relativeSize:1});
    if(opts.diameter == g.diameter && opts.relativeSize!=1){
      opts.diameter = opts.relativeSize*g.diameter;
      opts.teethCount = Math.floor(g.teethCount*opts.relativeSize);
    }
    if(opts.rotationSpeed == g.rotationSpeed)
      opts.rotationSpeed = -(g.diameter / (opts.diameter||g.diameter)) * g.rotationSpeed;
    if(opts.x == g.x && opts.y == g.y){
      var dist = (g.diameter + (opts.teethDiameter || g.teethDiameter))+opts.gearPadding;
      opts.x = g.x+(dist * Math.cos(opts.relativeAngle * degToRad));
      opts.y = g.y+(dist * Math.sin(opts.relativeAngle * degToRad));
    }
    if(opts.rotation == g.rotation)
      opts.rotation = g.rotation + (g.teethTheta - g.teethSlip/2)/2;
    var g2 = new Gear(opts);
    return g2;
  };
};

context.clear();
var g = new Gear({x: 150, y:150});
var g2 = g.makeNewAttachedGear();
var g3 = g.makeNewAttachedGear({relativeAngle: 90});
//var g4 = g2.makeNewAttachedGear({relativeAngle: 90});
var spin = function(){
  context.clear();
  g.draw();
  g2.draw();
  g3.draw();
//  g4.draw();
//  window.setTimeout(spin, 25);
};
window.setTimeout(spin, 25);

