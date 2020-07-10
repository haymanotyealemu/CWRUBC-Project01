$(document).ready(function() {

  //var GoogleCloudSpeechToTextAPIKey = "AIzaSyCfh3JoXvDKFCwc3Wud0i8kUJdPaXpJJ4s";
  //var GoogleCloudSpeechToTextAPIKey = "AIzaSyDeuhX7sntzkbREuJ2ZTZoeh8JriCXydJc";
  var GoogleTranslationAPIKey = "AIzaSyBKTUVOk5a2Ud1rXCbkf8YAXDbaPzY5pyA";

  // Follow MDN advice on making "webkit" prefix optional in anticipation
  // of a name standardization once this API becomes widely available
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
  var recognition = new SpeechRecognition();

  function lightningAnimate() {
    $(".gif").attr("src", $(".gif").attr("data-animate"));
    $(".gif").attr("data-state", "animate");
  }

  function lightningStill() {
    $(".gif").attr("src", $(".gif").attr("data-still"));
    $(".gif").attr("data-state", "still");
  }

  var textbox = $("#text-display");
  // Where rendered text is displayed
  var content = '';
  recognition.continous = true;

  // Show status or instructions
  //var instruction = $("#status");

  recognition.onstart =function () {
    lightningAnimate()
    // instruction.text("Voice Recognition is on ");
  }

  recognition.onspeechend = function () {
    lightningStill()
    // instruction.text('No Activity');
  }

  recognition.onerror = function () {
    // instruction.text("Try Again");
  }

  recognition.onresult = function (event) {
    var current = event.resultIndex;
    var transcript = event.results[current][0].transcript;
    content += transcript;
    textbox.val(content);
  }

  $("#start").click(function (event) {
    if (content.length) {
      content += '\n';
    }
    recognition.start();
  });

  $("#stop").click(function (event) {
    lightningStill()
    recognition.stop();
  });

});
