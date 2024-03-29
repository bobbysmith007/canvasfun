var canvas = document.getElementById('canvas');
var trebleStaff = document.getElementById('treble');
var bassStaff = document.getElementById('bass');
var fretBoard = $('#fretboard');
var context = canvas.getContext('2d');
var treblecontext = trebleStaff.getContext('2d');
var basscontext = bassStaff.getContext('2d');
var Ab='Ab',A='A',Bb='Bb', B='B',C='C',Db='Db',D='D',Eb='Eb',
    E='E',Fb='Fb',F='F',Gb='Gb',G='G', T=true, X=false,
    Ionian = 'Ionian (I)\nMajor', Dorian = 'Dorian (II)',
    Phrygian = 'Phrygian (III)', Lydian='Lydian (IV)',
    Mixolydian='Mixolydian (V)', Aeolian='Aeolian (VI)\nMinor',
    Locrian = 'Locrian (VII)';

var chromaticScale    = [  C, Db,  D, Eb,  E,  F, Gb,  G, Ab,  A, Bb,  B];
var majorScale        = [  T,  X,  T,  X,  T,  T,  X,  T,  X,  T,  X,  T];
var melodicMinorScale = [  T,  X,  T,  X,  T,  X,  T,  X,  T,  T,  X,  T];
var harmonicMinorScale= [  T,  X,  T,  X,  T,  T,  X,  X,  T,  T,  X,  T];
var modeNames         = [Ionian, null, Dorian, null, Phrygian, Lydian, null,
                         Mixolydian, null, Aeolian, null, Locrian];

var fretboards ={
  bass5 :[B,E,A,D,G],
  bass  :[E,A,D,G],
  bass6 :[B,E,A,D,G,C],
  guitar:[E,A,D,G,B,E],
  mando :[G,D,A,E],
  uke   :[G,C,E,A]
};

var numFrets = 25;
var chordColors = ['blue', 'green'];

var SCALE= majorScale;

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
var height=400, width=400;
initFretBoard();


context.clear = function(){
  context.restore();
  context.clearRect(0,0,width,height);
  context.save();
};
var clearStaves = function(){
  treblecontext.restore();
  treblecontext.clearRect(0,0,width,100);
  treblecontext.save();
  basscontext.restore();
  basscontext.clearRect(0,0,width,100);
  basscontext.save();
};
var degToRad = 0.01745329525;
var dodecaDeg = (360/12);
var dodecaRad = dodecaDeg * degToRad;

var drawRing = function(diameter, ring, offset){
  context.save();
  context.translate(200,200);
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
  context.translate(200,200);
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
    context.textAlign= i > 10 ? 'center'
      :(i > 7) ? "right"
      :(i > 4) ? "center"
      :(i > 1)  ? "left"
      : "center";
    context.textAlign = "center";
    context.font = '10pt Arial';
    context.strokeStyle = i==0 ? red : black;
    var txts = text.split('\n');
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
  if(!ringref(SCALE, MODE)) MODE--;
  drawRings();
}
function incMode(){
  MODE++;
  if(!ringref(SCALE, MODE)) MODE++;
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
  return out;
}

var staffs={};
function drawStaff(scale){
  staffs.treblerenderer = new Vex.Flow.Renderer(trebleStaff, Vex.Flow.Renderer.Backends.CANVAS);
  staffs.bassrenderer = new Vex.Flow.Renderer(bassStaff, Vex.Flow.Renderer.Backends.CANVAS);
  staffs.treblestaff = new Vex.Flow.Stave(10, 0, 550);
  staffs.bassstaff = new Vex.Flow.Stave(10, 0, 550);
  // Add a treble clef

  function create_4_4_voice(len) {
    return new Vex.Flow.Voice({
      num_beats: len,
      beat_value: 4,
      resolution: Vex.Flow.RESOLUTION
    });
  }
  var underStart=3;
  function note(letter, clef){
    var under=underStart;
    if(clef == 'bass')under--;
    var note = new Vex.Flow.StaveNote({
      clef:clef,
      keys: [letter.toUpperCase()+"/"+under],
      duration: "q"
    });
    if ( letter[1] && letter[1]=='b' ){
      note.addAccidental(0, new Vex.Flow.Accidental("b"));
    }
    return note;
  }

  var inNotes=noteSummary(scale),trebleNotes=[],bassNotes=[], i, letter, lastLetter;
  for(i=0; letter=inNotes[i] ;i++, lastLetter=letter){
    // keep the scale ascending
    if((lastLetter == null || lastLetter < C)
       && letter >= C) underStart++;
    trebleNotes.push(note(letter, "treble",i ));
    bassNotes.push(note(letter, "bass", i ));
  }
  staffs.tvoice = create_4_4_voice(trebleNotes.length).addTickables(trebleNotes);
  staffs.bvoice = create_4_4_voice(bassNotes.length).addTickables(bassNotes);

  staffs.treblestaff.addClef("treble");
  // staffs.treblestaff.addKeySignature(ringref(chromaticScale, KEY));
  staffs.treblestaff.setContext(treblecontext).draw();
  staffs.tformatter = new Vex.Flow.Formatter().joinVoices([staffs.tvoice])
    .format([staffs.tvoice], 200);
  staffs.bformatter = new Vex.Flow.Formatter().joinVoices([staffs.bvoice])
    .format([staffs.bvoice], 200);
  staffs.tvoice.draw(treblecontext, staffs.treblestaff);

  staffs.bassstaff.addClef("bass");

  // staffs.bassstaff.addKeySignature(ringref(chromaticScale, KEY));
  staffs.bassstaff.setContext(basscontext).draw();
  staffs.bvoice.draw(basscontext, staffs.bassstaff);


}

function drawRings(){
  context.clear();
  clearStaves();
  drawRingText(150, modeNames, MODE);
  drawRing(90, SCALE, MODE);
  drawRingText(70, chromaticScale, KEY);
  $('.mode .current').text( ringref(modeNames, MODE) );
  $('.key .current').text( ringref(chromaticScale, KEY) );
  $('.notes .current').text(noteSummary(SCALE, MODE+KEY).join(' - '));
  drawStaff(SCALE);
  drawFretBoard();
}

drawRings();


function selectedFretBoard(){
  return fretboards[fretBoard.selector.val()];
};


function makeString(rootNote){
  console.log('makeString(',rootNote,')');
  var string = $('<div class="string"></div>');
  var note, idx, offset = chromaticScale.indexOf(rootNote);
  var dots = [3,5,7,9,15,17,19,21];
  for(var i=0 ; i< numFrets ; i++){
    if(rootNote) note = ringref(chromaticScale, i, offset);
    else{
      note = i ;
      if(dots.indexOf(i)>=0) note += "<b>&middot;</b>";
      else if (i==12) note += "<b>:</b>";
    }
    string.append($('<div class="fret"><span class="note">'+note+'</span></div>')
                  .addClass('note-'+note)
                  .addClass('fret-'+i));
  }
  return string;
};

function highlightFrets(){
   $('.sel', fretBoard).removeClass('sel');
  var sum = noteSummary(SCALE, MODE+KEY);
  var i=0,note,cls;
  for(i=0, note; note = sum[i];i++){
    cls = (i%2==0 && i < 5 ) ? "tri" : "";
    $('.note-'+note, fretBoard).addClass('sel '+cls);};

};

function drawFretBoard(){
  $('#fretboard .string').detach();
  var fb = selectedFretBoard();
  var i=0,note;
  fretBoard.selector.after(makeString(null).addClass('fret-idx'));
  for(i=0,note; note = fb[i] ; i++)
    fretBoard.selector.after(makeString(note));
  highlightFrets();
};


function initFretBoard (){
  fretBoard.selector = $('<select name="frettype"/>');
  fretBoard.append(fretBoard.selector);
  fretBoard.selector.change(function(evt){drawFretBoard();});
  $.each(fretboards,function(k,v){
    fretBoard.selector.append($('<option>'+k+'</option>')); });

};




