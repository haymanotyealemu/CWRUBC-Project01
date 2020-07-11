const key1MSUnifiedSpeechAPI = "318dd88e400d4ac48bf3740a108a565d";
//const key1MSUnifiedSpeechAPI = "54b1b031c6msh1d90d8db06bc946p115151jsn85d0cfde6b34";

var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key1MSUnifiedSpeechAPI, "westus");
var audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
var recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
var phrasesAsRecorded = [];
var phrasesTranslated = [];

$(document).ready(function() {
  function lightningToAnimated() {
    $(".gif").attr("src", $(".gif").attr("data-animate"));
    $(".gif").attr("data-state", "animate");
  }

  function lightningToStill() {
    $(".gif").attr("src", $(".gif").attr("data-still"));
    $(".gif").attr("data-state", "still");
  }

  $("#start").on("click", function(event) {
    /* {{{ **
    ** // Just record one utterance then stop
    ** recognizer.recognizeOnceAsync(result => {
    **   // Interact with result
    **   $("#text-display").text(result.text);
    ** });
    ** }}} */
    // First set up the events for recognition
    // Function hooked up for recognized event with finalized answer
    recognizer.recognized = function (s, e) {
      if (e.result.reason !== SpeechSDK.ResultReason.NoMatch) {
        // Have a recognized phrase, so
        // Display it
        $("#text-display").text(e.result.text);
        // Store it to array
        phrasesAsRecorded.push(e.result.text)
      } else {
      }
    }
    // Starts recognition
    recognizer.startContinuousRecognitionAsync();
    // Start the lightning animation as feedback
    lightningToAnimated();

  });

  $("#stop").on("click", function(event) {
    recognizer.stopContinuousRecognitionAsync(
        function () {
            recognizer.close();
            recognizer = undefined;
        },
        function (err) {
            recognizer.close();
            recognizer = undefined;
        });
    // Stop the lightning animation as feedback
    lightningToStill();
  });

});
