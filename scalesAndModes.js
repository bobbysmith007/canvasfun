var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var Ab='Ab',A='A',Bb='Bb', B='B',C='C',Db='Db',D='D',Eb='Eb',
    E='E',Fb='Fb',F='F',Gb='Gb',G='G', T=true, X=false,
    Ionian = 'Ionian (I)', Dorian = 'Dorian (II)',
    Phrygian = 'Phrygian (III)', Lydian='Lydian (IV)',
    Mixolydian='Mixolydian (V)', Aeolian='Aeolian (VI)',
    Locrian = 'Locrian (VII)';

var chromaticScale = [  C, Db,  D, Eb,  E,  F, Gb,  G, Ab,  A, Bb,  B];
var majorScale     = [  T,  X,  T,  X,  T,  T,  X,  T,  X,  T,  X,  T];
var majorScale2    = [  C,  X,  D,  X,  E,  F,  X,  G,  X,  A,  X,  B];
var modeNames      = [Ionian, null, Dorian, null, Phrygian, Lydian, null,
                      Mixolydian, null, Aeolian, null, Locrian];

var ringref = function(ring, i, offset){
  if(!offset) offset = 0;
  i+=offset;
  while( i > ring.length ) i = i-ring.lenght;
  while( i < 0 ) i = i+ring.lenght;
  return ring[i];
};

var green = 'rgba(0,192,0,255)', white = 'rgba(255,255,255,255)', black = 'rgba(0,0,0,255)';
context.save();
var height=600, width=600;
context.clear = function(){
  context.restore();
  context.clearRect(0,0,width,height);
  context.save();
};
var degToRad = 0.01745329525;
var dodecaDeg = (360/12);
var dodecaRad = dodecaDeg * degToRad;



var drawRing = function(diameter, ring){
  context.save();
  context.translate(300,300);
  context.rotate((-dodecaRad/2) - 90*degToRad);

  var i=0, startAngle, endAngle, radStart;
  for(i = 0; i < 12; i++){

    radStart = i * (360/12) * degToRad;
    context.save();

    context.beginPath();
    context.strokeStyle = green;
    context.lineWidth = 10;
    context.arc(0,0,diameter,radStart,radStart+dodecaRad);
    context.stroke();
    context.closePath();

    context.beginPath();
    context.strokeStyle = ring[i] ? black : white;

    context.lineWidth = 6;
    context.arc(0,0,diameter,radStart+.02,(radStart+dodecaRad)-.02);
    context.stroke();
    context.closePath();


    context.restore();
  }

  context.restore();
};
var drawRingText = function(diameter, ring){
  context.save();
  context.translate(300,300);
  var i=0, startAngle, endAngle, radStart;
  for(i = 0; i < 12; i++){
    if(!ring[i]) continue;
    radStart = (i * (360/12) * degToRad) - (90*degToRad);
    context.save();
    var x =  Math.cos(radStart) * diameter,
        y =  Math.sin(radStart) * diameter;

    context.beginPath();
    context.textAlign= 'center';
    context.strokeText(ringref(ring,i), x, y);
    context.strokeStyle = green;
    context.lineWidth = 2;
    context.closePath();
    context.restore();
  }

  context.restore();
};
drawRingText(230, modeNames);
drawRing(200, majorScale);
drawRingText(175, chromaticScale);


