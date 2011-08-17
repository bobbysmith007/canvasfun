var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var Ab='Ab',A='A',Bb='Bb', B='B',C='C',Db='Db',D='D',Eb='Eb',
    E='E',Fb='Fb',F='F',Gb='Gb',G='G', T=true, X=false,
    Ionian = 'Ionian (I) - Major', Dorian = 'Dorian (II)',
    Phrygian = 'Phrygian (III)', Lydian='Lydian (IV)',
    Mixolydian='Mixolydian (V)', Aeolian='Aeolian (VI) - minor',
    Locrian = 'Locrian (VII)';

var chromaticScale = [  C, Db,  D, Eb,  E,  F, Gb,  G, Ab,  A, Bb,  B];
var majorScale     = [  T,  X,  T,  X,  T,  T,  X,  T,  X,  T,  X,  T];
var majorScale2    = [  C,  X,  D,  X,  E,  F,  X,  G,  X,  A,  X,  B];
var modeNames      = [Ionian, null, Dorian, null, Phrygian, Lydian, null,
                      Mixolydian, null, Aeolian, null, Locrian];

var ringref = function(ring, i, offset){
  if(!offset) offset = 0;
  i+=offset;
  var l = ring.length;
  while( i >= l ) i = i-l;
  while( i <  0 ) i = i+l;
  //console.log('ringref: ',i, offset, l);
  return ring[i];
};

var green = 'rgba(0,192,0,255)',
    red = 'rgba(192,0,0,255)',
    white = 'rgba(255,255,255,255)',
    black = 'rgba(0,0,0,255)';
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

var drawRing = function(diameter, ring, offset){
  context.save();
  context.translate(300,300);
  context.rotate((-dodecaRad/2) - 90*degToRad);
  var i=0, startAngle, endAngle, radStart;
  for(i = 0; i < 12; i++){
    radStart = (i * (360/12) * degToRad) - offset*dodecaRad;
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

var drawRingText = function(diameter, ring, offset){
  context.save();
  context.translate(300,300);
  var i=0, startAngle, endAngle, radStart;
  for(i = 0; i < 12; i++){
    if(!ring[i]) continue;
    radStart = (i * (360/12) * degToRad) - (90*degToRad) - offset*dodecaRad;
    context.save();
    var text = ringref(ring,i),
        diam = diameter-(text.length/2)*2.5,
        x =  Math.cos(radStart) * diam,
        y =  Math.sin(radStart) * diam;

    context.beginPath();
    context.textAlign= 'center';
    context.font = '10pt Arial';
    context.strokeStyle = i==0 ? red : black;
    context.strokeText(text, x, y);
    context.closePath();
    context.restore();
  }

  context.restore();
};

MODE=0;
KEY=0;
function decMode(){
  MODE--;
  if(!ringref(majorScale, MODE)) MODE--;
  drawRings();
}
function incMode(){
  MODE++;
  if(!ringref(majorScale, MODE)) MODE++;
  drawRings();
}

function decKey(){
  KEY--;
  if(!ringref(chromaticScale, KEY)) KEY--;
  drawRings();
}
function incKey(){
  KEY++;
  if(!ringref(chromaticScale, KEY)) KEY++;
  drawRings();
}

function noteSummary(scale){
  var out=[], i;
  for(i=0; i<12 ;i++)
    if(ringref(scale, i, MODE))
      out.push(ringref(chromaticScale, i, KEY));
  return out.join(' - ');
}

function drawRings(){
  context.clear();
  drawRingText(180, modeNames, MODE);
  drawRing(220, majorScale, MODE);
  drawRingText(240, chromaticScale, KEY);
  $('.mode .current').text( ringref(modeNames, MODE) );
  $('.key .current').text( ringref(chromaticScale, KEY) );
  $('.notes .current').text(noteSummary(majorScale, MODE+KEY));
}

drawRings();




