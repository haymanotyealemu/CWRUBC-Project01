const key1MSUnifiedSpeechAPI = "318dd88e400d4ac48bf3740a108a565d";
const regionCode = "westus";

//const key1MSUnifiedSpeechAPI = "54b1b031c6msh1d90d8db06bc946p115151jsn85d0cfde6b34";
//const regionCode = "eastus";

// Copy convention of having a global scope copy of of window.SpeechSDK
var SpeechSDK;
var speechConfig = undefined;
var audioConfig = undefined;
var recognizer = undefined;
var RecDuration = 0;

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
    ** initializeSpeechSDK();
    ** }}} */
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
      var min, sec, time;
      if (e.result.reason !== SpeechSDK.ResultReason.NoMatch) {
        // Have a recognized phrase, so
        // Store it to array
        phrasesAsRecorded.push(e.result.text)
        // Display all the snippets starting each one on its own line
        $("#recognized").text(phrasesAsRecorded.join("\n"));
        // Pass to callback for translation
        passPhraseToMSTranslator(phrasesAsRecorded.length-1,'de');
        // Time duration display
        // Note: only break time into minutes and seconds not hours or bigger
        RecDuration += parseInt(e.result.duration) / 10000000;
        min = Math.floor(RecDuration / 60);
        // Get seconds including fractional remaining
        sec = (RecDuration - 60 * min);
        // Pad seconds to two digits with 0 as needed
        time = min+':'+((sec < 10.0) ? '0' : '')+sec.toFixed(2);
        //$("#time-span").text('Total Record Time is:  '+RecDuration+' seconds')
        $("#time-span").text('Total Record Time is: '+time)
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
          /* {{{ **
          ** recognizer.close();
          ** recognizer = undefined;
          ** }}} */
        },
        function (err) {
          /* {{{ **
          ** recognizer.close();
          ** recognizer = undefined;
          ** }}} */
        });
    // Stop the lightning animation as feedback
    lightningToStill();
  });

  function passPhraseToMSTranslator(phraseIndex, lang) {
    //URL PATTERN: {{{
    //https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=es
    //sample value }}}
    var queryURL = "https://api.cognitive.microsofttranslator.com/translate?"
    var queryObj = {
      'api-version':'3.0',
      to:'de'
    };
    var callObj = {
      url: '',
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': 'a9b0d0e3a840456a8257618e073be609',
        'content-type': 'application/json',
      },
      data: ''
    }
    var escaped = '';
    // Assemble query url and call data
    if (lang) {
      queryObj.to = lang;
    }
    queryURL += $.param(queryObj);
    // Set call url to constructed value
    callObj.url = queryURL;
    // Set data property to an object with property Text inside an array
    // Do regular expression search and replace for apostrophe
    // replacing with back slash escaped apostrophe, not the 
    // doubled back slash is needed in the regex pattern.
    escaped = phrasesAsRecorded[phraseIndex].replace(/'/g,"\\'");
    callObj.data = "[{'Text':'"+escaped+"'}]";
    // Make asynchronous API call
    $.ajax(callObj).then(function (response) {
      var retData = '';
      retData = response[0].translations[0].text;
      phrasesTranslated.push(retData);
      //console.log('response=\n'+JSON.stringify(response));
      // Display all the snippets starting each one on its own line
      //$("#text-display").text(phrasesTranslated.join("\n"));
      $("#translated").text(phrasesTranslated.join("\n"));
    }).catch(function(e) {;
      var err='';
      console.log('in phrasesTranslated .catch() e=\n'+JSON.stringify(e));
      err = 'Could not translate that.  Please try saying that again.';
      phrasesTranslated.push(err);
      //$("#text-display").text(phrasesTranslated.join("\n"));
      $("#translated").text(phrasesTranslated.join("\n"));
    });
  }

  function initializeSpeechSDK() {
    speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key1MSUnifiedSpeechAPI, regionCode);
    audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  }
  // Copy convention of having a global scope copy of of window.SpeechSDK
  SpeechSDK = window.SpeechSDK;
  initializeSpeechSDK();
});
