$(document).ready(function() {

  var GoogleCloudSpeechToTextAPIKey = "AIzaSyCfh3JoXvDKFCwc3Wud0i8kUJdPaXpJJ4s";
  var GoogleTranslationAPIKey = "AIzaSyBKTUVOk5a2Ud1rXCbkf8YAXDbaPzY5pyA";

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
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
  window.URL = window.URL || window.webkitURL;
/* Simple constraints object, for more advanced audio features see
 * https://addpipe.com/blog/audio-constraints-getusermedia/
 */
  var constraints = {
    audio: true,
    video: false
  } 

  function createDownloadLink(blob) {
    
    //name of .wav file to use during upload and download (without extension)
    /* {{{ **
    ** var filename = 'statement';
    ** saveAs(blob,filename+".wav");
    ** }}} */
    Recorder.forceDownload(blob);
    rec.clear();

    /* {{{ **
    ** //upload link
    ** var upload = document.createElement('a');
    ** upload.href="#";
    ** upload.innerHTML = "Upload";
    ** upload.addEventListener("click", function(event){
    **     var xhr=new XMLHttpRequest();
    **     xhr.onload=function(e) {
    **         if(this.readyState === 4) {
    **             console.log("Server returned: ",e.target.responseText);
    **         }
    **     };
    **     var fd=new FormData();
    **     fd.append("audio_data",blob, filename);
    **     xhr.open("POST","upload.php",true);
    **     xhr.send(fd);
    ** })
    ** }}} */
  }

  $("#begRecordWav").on("click", function(event) {
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

  $("#endRecordWav").on("click", function(event) {
    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //create the wav blob and pass it on to createDownloadLink
    rec.exportWAV(createDownloadLink);
  });

});
