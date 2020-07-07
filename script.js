$(document).ready(function() {

  //var GoogleCloudSpeechToTextAPIKey = "AIzaSyCfh3JoXvDKFCwc3Wud0i8kUJdPaXpJJ4s";
  var GoogleCloudSpeechToTextAPIKey = "AIzaSyDeuhX7sntzkbREuJ2ZTZoeh8JriCXydJc";
  var GoogleTranslationAPIKey = "AIzaSyBKTUVOk5a2Ud1rXCbkf8YAXDbaPzY5pyA";

  var speechRecorder = window.webkitSpeechRecognition;
  var recognition = new speechRecognition();
  //text box
  var textbox = $("#textbox");
  //how to use machine - instructions 
  var content = $("#instructions")
  //what we talk into - talking into 
  var content = '';
  recognition.continous = true;
  var instruction = $("#instruction");

  recognition.onstart =function () {
    instruction.text("Voice Recognition is on ");
  }

  recognition.onspeechend = function () {
    instruction.text('No Activity');
  }

  recognition.onerror = function () {
    instruction.text("Try Again");
  }

  recognition.onresult = function (event) {
    var current = event.resultIndex;
    var transcript = event.results[current][0].transcript;
    content += transcript;
    textbox.val(content);
  }

  $("#start").click(function (event) {
    if (content.length) {
      content += '';
    }
  });

  $("#stop").click(function (event) {
    recognition.stop();
  });

  recognition.start();

});
