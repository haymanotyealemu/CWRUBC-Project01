const key1MSUnifiedSpeechAPI = "318dd88e400d4ac48bf3740a108a565d";
//const key1MSUnifiedSpeechAPI = "f8975d9751e540d18b9a49efb3c81ebe";
//const key1MSUnifiedSpeechAPI = "54b1b031c6msh1d90d8db06bc946p115151jsn85d0cfde6b34";

var soundContext = undefined;
try {
  var AudioContext = window.AudioContext // our preferred impl
      || window.webkitAudioContext       // fallback, mostly when on Safari
      || false;                          // could not find.

  if (AudioContext) {
    soundContext = new AudioContext();
  } else {
    alert("Audio context not supported");
  }
}
catch (e) {
  window.console.log("no sound context found, no audio output. " + e);
}

//var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key1MSUnifiedSpeechAPI, "westus");
//var speechConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(key1MSUnifiedSpeechAPI, "westus");
var speechConfig;
//
// in case we have a function for getting an authorization token, call it.
var authorizationToken = '';
console.log('∞° authorizationToken="'+authorizationToken,'"');
/* {{{ **
** if (typeof RequestAuthorizationToken === "function") {
**     RequestAuthorizationToken();
** }
** }}} */
if (authorizationToken) {
  speechConfig = SpeechSDK.SpeechTranslationConfig.fromAuthorizationToken(authorizationToken, "westus");
} else {
  console.log('∞° B speechConfig....');
  speechConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(key1MSUnifiedSpeechAPI, "westus");
  console.log('∞° A speechConfig....');
}
// Source language
var SourceLang = 'EN';
speechConfig.speechRecognitionLanguage = SourceLang;
// Target translated language
var TargetLang = 'DE'
speechConfig.addTargetLanguage(TargetLang);
/* {{{ **
** var audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
** }}} */
var audioConfig;
/* {{{ **
** if (undefined != microphoneSource.value) {
**   console.info("Getting Microphone " + microphoneSource.value);
**   audioConfig = SpeechSDK.AudioConfig.fromMicrophoneInput(microphoneSource.value);
** } else {
**   audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
** }
** }}} */
audioConfig = SpeechSDK.AudioConfig.fromMicrophoneInput("undefined");
//var recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
console.log('∞° B recognizer....');
var recognizer = new SpeechSDK.TranslationRecognizer(speechConfig, audioConfig);
console.log('∞° A recognizer....');
var curPhrase = '';
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
      /* {{{ **
      ** if (e.result.reason !== SpeechSDK.ResultReason.NoMatch) {
      **   // Have a recognized phrase, so
      **   // Store it to array
      **   phrasesAsRecorded.push(e.result.text)
      **   // Display all the snippets starting each one on its own line
      **   $("#text-display").text(phrasesAsRecorded.join("\n"));
      ** } else {
      ** }
      ** }}} */
      window.console.log("recognized e="+e);
      curPhrase = e.result.translations.get(TargetLang);
      // Have a recognized phrase, so
      // Store it to array
      phrasesAsRecorded.push(curPhrase)
      // Display all the snippets starting each one on its own line
      $("#text-display").text(phrasesAsRecorded.join("\n"));
    }
    // Signals an audio payload of synthesized speech is ready for playback.
    // If the event result contains valid audio, it's reason will be ResultReason.SynthesizingAudio
    // Once a complete phrase has been synthesized, the event will be called with ResultReason.SynthesizingAudioComplete and a 0 byte audio payload.
    recognizer.synthesizing = function (s, e) {
        window.console.log(e);
        var audioSize = e.result.audio === undefined ? 0 : e.result.audio.byteLength;
    };
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
