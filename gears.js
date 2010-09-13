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
  for(key in h2)if (h1[key]==null) h1[key] = h2[key];
  return h1;
};

var Frame = function(opts){
  opts = opts||{};
  if(opts[0]) this.drawables = opts;
  else this.drawables = opts.drawables || [];
  this.draw = function(){
    context.clear();
    for(var j=0, drawable ; drawable=this.drawables[j] ; j++)
      drawable.draw();
  };
};

var Animation = function(opts) {
  opts = opts||{};
  if(opts && opts[0]) this.frames = opts;
  else this.frames = opts.frames || [];
  this.iterations = null;
  this.timing = opts.timing || 25;
  this.framePointer = 0;
  var animation = this;
  animation.spin = function(){
    if(!animation.iterations || animation.iterations > 0){
      if(animation.frames[animation.framePointer]){
	animation.frames[animation.framePointer].draw();
	animation.framePointer++;
      }else{
	animation.framePointer = 0;
	var frame = animation.frames[animation.framePointer];
	frame && frame.draw();
      }
      animation.iterations--;
      window.setTimeout(animation.spin, animation.timing);
    }
  };
  this.go = function (iterations){
    this.iterations = iterations || null;
    window.setTimeout(animation.spin, animation.timing);
  };
  this.stop = function(){this.iterations=-1;};
};

/////////////////////////////////////////////////


var degToRad = 0.01745329525;
var Drawable = { draw:function(){} };
var Gear = function(opts){
  this.prototype = Drawable;
  opts = opts||{};
  // Set defaults and opts
  mergeHash(this, mergeHash(opts, {
    x: width/2,
    y: height/2,
    diameter: 30,
    teethAngle: 30*degToRad,
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
    var tmp = context.globalCompositeOperation;
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    if(this.strokeStyle) context.strokeStyle = this.strokeStyle;
    if(this.fillStyle) context.fillStyle = this.fillStyle;
    context.arc(0,0,this.hubDiameter,0,360*degToRad, false);
    context.stroke();
    context.fill();
    context.closePath();
    context.globalCompositeOperation = tmp;
  };
  this.draw = function(){
    context.save();
    this.rotation+=this.rotationSpeed;
    context.translate (this.x, this.y);
    context.rotate(this.rotation*degToRad);
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
    if(this.fillStyle) context.fill();
    context.closePath();
    this._drawHub();
    context.restore();
    return true;
  };
  this.makeNewAttachedGear = function(opts){
    opts = mergeHash(opts, g.opts );
    opts = mergeHash(opts, {relativeAngle:0, gearPadding: (.1 * g.diameter), relativeSize:1});
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
      if(g.parent) opts.rotation = g.parent.rotation;
      else opts.rotation = g.rotation + g.teethTheta/2;
    opts.parent = g;
    var g2 = new Gear(opts);
    return g2;
  };
};

context.clear();

/*
var g = new Gear({x: 100, y:100, fillStyle:'rgb(0,128,0)'});
var g2 = g.makeNewAttachedGear();
var g3 = g.makeNewAttachedGear({relativeAngle: 90});
var g4 = g2.makeNewAttachedGear({relativeAngle: 45});
var g5 = g2.makeNewAttachedGear({relativeAngle: 360-45});
var g6 = g5.makeNewAttachedGear({relativeAngle: 45});
var frame = new Frame([g, g2, g3, g4, g5, g6]);
*/
/*   Tile canvas */
var frame = new Frame();
var g = new Gear({x: 0, y:0, fillStyle:'rgb(0,128,0)', rotationSpeed:2});
frame.drawables.push(g);
for(var i=0 ; i <= 12 ; i++)
  for(var j=0 ; j <= 12 ; j++){
    angle = i%2==0?(j%2==0?45:(360-45)):(j%2==1?(180+45):(180-45));
    frame.drawables.push(g = g.makeNewAttachedGear({relativeAngle:angle}));
  }





var animation = new Animation({frames:[frame], timing:5});
animation.go(10000);


