const key1MSUnifiedSpeechAPI = "318dd88e400d4ac48bf3740a108a565d";
//const key1MSUnifiedSpeechAPI = "54b1b031c6msh1d90d8db06bc946p115151jsn85d0cfde6b34";

var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key1MSUnifiedSpeechAPI, "westus");
var audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
var recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

$(document).ready(function() {
  $("#start").on("click", function(event) {
    // Start the lightning animation as feedback
    $(".gif").attr("src", $(".gif").attr("data-animate"));
    $(".gif").attr("data-state", "animate");
    //
    recognizer.recognizeOnceAsync(result => {
      // Interact with result
      $("#text-display").text(result.text);
    });
  });

  $("#stop").on("click", function(event) {
    // Stop the lightning animation as feedback
    $(".gif").attr("src", $(".gif").attr("data-still"));
    $(".gif").attr("data-state", "still");
    //
  });

  function passToSpeechToTextAPI(data) {
    // Need file reader object to perform Base64 encoding as a wrapper object
    // to handle Base64 encoding for the API call.
    var ToB64Reader = new FileReader();
    ToB64Reader.onload = function() {
      // Since the file reader object adds an extra Data URI as a header
      // chop this information off with a regular expression search/replace
      // and make the actual API call with that version
      speech.audio.content = ToB64Reader.result;
      console.log("speech.audio.content="+speech.audio.content); // Encoded data
      // Use jQuery .param to build the Google Cloud speech to text query URL
      var queryObj = {
        key: GoogleCloudSpeechToTextAPIKey
      };
      var queryURL = "https://speech.googleapis.com/v1/speech:recognize?";
      queryURL += $.param(queryObj);
      console.log("queryURL="+queryURL);
      var speechData = JSON.stringify(speech);
      $.ajax({
        url: queryURL,
        method: "POST",
        data: speechData,
        dataType: "JSON"
      }).then(function(response) {
        $("#textReply").html(response.results.alternatives[0].transcript);
      });
    }
    // Now need to call readDataAsURL() to trigger the load event, which
    // will do all the actual work.
    ToB64Reader.readAsDataURL(data);
  }

});
