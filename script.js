$(document).ready(function() {

  //var GoogleCloudSpeechToTextAPIKey = "AIzaSyCfh3JoXvDKFCwc3Wud0i8kUJdPaXpJJ4s";
  var GoogleCloudSpeechToTextAPIKey = "AIzaSyDeuhX7sntzkbREuJ2ZTZoeh8JriCXydJc";
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
  // Simple constraints object, for more advanced audio features see
  // https://addpipe.com/blog/audio-constraints-getusermedia/
  var constraints = {
    audio: true,
    video: false
  } 

  $("#begRecordWav").on("click", function(event) {
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      console.log("getUserMedia() success, stream created, initializing Recorder.js ..."); 
      // assign to gumStream for later use
      gumStream = stream;
      // use the stream
      input = audioContext.createMediaStreamSource(stream);
      // Create the Recorder object and configure to record mono sound
      // (1 channel) Recording 2 channels will double the file size
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
    console.log("Recording stopped");

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //create the wav blob and pass it on to createDownloadLink
    rec.exportWAV(passToSpeechToTextAPI);
  });

  function passToSpeechToTextAPI(blob) {
    // Base64 encoded data without header goes in content
    var Speech = {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: "16000",
        languageCode: "en-US"
      },
      audio: {
        content: ""
      }
    };
    // Need file reader object to perform Base64 encoding as a wrapper object
    // to handle Base64 encoding for the API call.
    var ToB64Reader = new FileReader();
    ToB64Reader.onload = function() {
      // Since the file reader object adds an extra Data URI as a header
      // chop this information off with a regular expression search/replace
      // and make the actual API call with that version
      Speech.audio.content = ToB64Reader.result.replace(/^data:.+;base64,/, '');
      console.log("Speech.content="+Speech.content); // Encoded data
      // Use jQuery .param to build the Google Cloud speech to text query URL
      var queryObj = {
        key: GoogleCloudSpeechToTextAPIKey
      };
      var queryURL = "https://speech.googleapis.com/v1/speech:recognize?";
      queryURL += $.param(queryObj);
      console.log("queryURL="+queryURL);
      $.ajax({
        url: queryURL,
        method: "POST",
        data: JSON.stringify(Speech)
      }).then(function(response) {
        $("#textReply").html(response.results.alternatives[0].transcript);
      });
    }
    // Now need to call readDataAsURL() to trigger the load event, which
    // will do all the actual work.
    ToB64Reader.readAsDataURL(blob);
  }

});
