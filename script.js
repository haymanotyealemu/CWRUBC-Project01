$(document).ready(function() {

  //Example Demo as reference found:
  //https://blog.addpipe.com/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/
  //
  var gumStream;
  //stream from getUserMedia() 
  var rec;
  //Recorder.js object 
  var input;
  //MediaStreamAudioSourceNode we'll be recording 
  // shim for AudioContext when it's not avb. 
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext;
  //new audio context to help us record 

/* Simple constraints object, for more advanced audio features see
  https://addpipe.com/blog/audio-constraints-getusermedia/ */
  var constraints = {
    audio: true,
    video: false
  } 

  $("#begRecordWav").on.("click", function(event) {
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      console.log("getUserMedia() success, stream created, initializing Recorder.js ..."); 
      /* assign to gumStream for later use */
      gumStream = stream;
      /* use the stream */
      input = audioContext.createMediaStreamSource(stream);
      /* Create the Recorder object and configure to record mono sound
       * (1 channel) Recording 2 channels will double the file size
       */
      rec = new Recorder(input, {
          numChannels: 2
      }); 
      //start the recording process 
      rec.record();
      console.log("Recording started");
    }).catch(function(err) {
      //enable the record button if getUserMedia() fails 
    });
  });

  $("#endRecordWav").on.("click", function(event) {
  });
});
