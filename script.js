$(document).ready(function() {

  //var GoogleCloudSpeechToTextAPIKey = "AIzaSyCfh3JoXvDKFCwc3Wud0i8kUJdPaXpJJ4s";
  var GoogleCloudSpeechToTextAPIKey = "AIzaSyDeuhX7sntzkbREuJ2ZTZoeh8JriCXydJc";
  var GoogleTranslationAPIKey = "AIzaSyBKTUVOk5a2Ud1rXCbkf8YAXDbaPzY5pyA";

  //Example Demo as reference found:
  //https://blog.addpipe.com/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/
  //
  //stream from getUserMedia() 
  var gumStream;
  //Recorder.js object 
  var rec;
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

  // Base64 encoded data without header goes in content
  var wavSampleRate = 0;
  var speech = {
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 0,
      languageCode: "en-US"
    },
    audio: {
      content: ""
    }
  };

  $("#begRecordWav").on("click", function(event) {
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      console.log("getUserMedia() success, stream created, initializing Recorder.js ..."); 
      // Assign to gumStream for later use
      gumStream = stream;
      // Need to resume the audio context for Chrome to work
      // Use .then() promise to an arrow (lambda) function to confirm resumed.
      audioContext.resume().then(() => {
        console.log('resumed stream for Chrome');
      });
      // Use the stream
      input = audioContext.createMediaStreamSource(stream);
      // Create the Recorder object and configure to record mono sound
      // (1 channel) Recording 2 channels will double the file size
      // NB. Need mono sound for Google Cloud Speech to Text API.
      rec = new Recorder(input, {
        numChannels: 1
      }); 
      //start the recording process 
      rec.record();
      // Note what sample rate the Web API felt like using since
      // it cannot be controlled.
      wavSampleRate = audioContext.sampleRate;
      Speech.config.sampleRateHertz = audioContext.sampleRate;
      console.log("Speech.config.sampleRateHertz="+
        Speech.config.sampleRateHertz);
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

  /* {{{ **
  ** function convertWavToFLAC(wavBlob) {
  **   var flac_encoder;
  **   var channels = 1;
  **   var samplerate = 44100;
  **   var compression = 5;
  **   var bps = 16;
  **   var verify = false;
  **   var block_size = 0;
  **   var flac_ok = 1;
  **   var encBuffer = [];
  **   //for storing the encoding FLAC metadata summary
  **   var metaData;
  **   var status_encoder;
  ** 
  **   //init encoder
  **   flac_encoder = Flac.create_libflac_encoder(wavSampleRate,
  **     channels, bps, compression, 0, verify, block_size);
  ** 
  **   if (flac_encoder == 0){
  **     return;
  **   }
  ** 
  **   var write_callback_fn = function(encodedData, //Uint8Array
  **     bytes, samples, current_frame)
  **   {
  **     //store all encoded data "pieces" into a buffer
  **     encBuffer.push(encodedData);
  **   };
  **   function metadata_callback_fn(data){
  **     // data -> [example] {
  **     //  min_blocksize: 4096,
  **     //  max_blocksize: 4096,
  **     //  min_framesize: 14,
  **     //  max_framesize: 5408,
  **     //  sampleRate: 44100,
  **     //  channels: 2,
  **     //  bitsPerSample: 16,
  **     //  total_samples: 267776,
  **     //  md5sum: "50d4d469448e5ea75eb44ab6b7f111f4"
  **     //}
  **     console.info('meta data: ', data);
  **     metaData = data;
  **   };
  **   // encode to native FLAC container
  **   status_encoder = Flac.init_encoder_stream(flac_encoder,
  **     write_callback_fn,    //required callback(s)
  **     metadata_callback_fn  //optional callback(s)
  **   );
  **   flac_ok &= (status_encoder == 0);    
  ** 
  **   var buf_length = buffer.length;
  **   var buffer_i32 = new Int32Array(buf_length);
  **   var view = new DataView(buffer_i32.buffer);
  **   var volume = 1;
  **   var index = 0;
  **   for (var i = 0; i < buf_length; i++){
  **     view.setInt32(index, (buffer[i] * (0x7FFF * volume)), true);
  **     index += 4;
  **   }
  ** 
  **   var flac_return = Flac.FLAC__stream_encoder_process_interleaved(flac_encoder, buffer_i32, buf_length);
  **   if (flac_return != true) {
  **     console.log("Error: FLAC__stream_encoder_process_interleaved returned false. " + flac_return);
  **   }
  ** 
  **   flac_ok &= Flac.FLAC__stream_encoder_finish(flac_encoder);
  **   console.log("flac finish: " + flac_ok);
  ** 
  **   Flac.FLAC__stream_encoder_delete(flac_encoder);
  ** }
  ** }}} */

  function convertWavToFLAC(wavBlob) {
    // Adapt libflac example from app-encode.js
    //
    // Recorder.JS already converted its array buffer to a blob,
    // so now convert it back so raw, uncompressed Wav data can be
    // converted to FLAC and then turned into a different blob.
    //var arrayBuffer = new Uint8Array(this.result);
    var arrayBuffer = extractUintArrayFromBlob(wavBlob);

    var encData = [];
    var result;

    function extractUintArrayFromBlob(wavBlob) {
      var arrBuffer;
      var cvtReader = new FileReader();
      cvtReader.onload = function(event) {
        arrBuffer = event.target.result
      }
      cvtReader.readAsArrayBuffer(wavBlob);
      arrayBuffer = new Uint8Array(arrBuffer);
    }

    // Utilize libflac example from encode-func.js
    function encodeFlac(binData, recBuffers, isVerify, isUseOgg) {
      var ui8_data = new Uint8Array(binData);
      var sample_rate=0,
        channels=0,
        bps=0,
        total_samples=0,
        block_align,
        position=0,
        recLength = 0,
        meta_data;

      // records/saves the output data of libflac-encode method
      function write_callback_fn(buffer, bytes, samples, current_frame){
        recBuffers.push(buffer);
        recLength += bytes;
        // recLength += buffer.byteLength;
      }

      function metadata_callback_fn(data){
        console.info('meta data: ', data);
        meta_data = data;
      }

      // check: is file a compatible wav-file?
      if (wav_file_processing_check_wav_format(ui8_data) == false){
        return {error: 'Wrong WAV file format', status: 0};
      }

      // get WAV/PCM parameters from data / file
      var wav_parameters = wav_file_processing_read_parameters(ui8_data);

      console.log("sample_rate  : " + wav_parameters.sample_rate);
      console.log("channels     : " + wav_parameters.channels);
      console.log("bps          : " + wav_parameters.bps);
      console.log("block_align  : " + wav_parameters.block_align);
      console.log("total_samples: " + wav_parameters.total_samples);

      // convert the PCM-Data to the appropriate format for the libflac library methods (32-bit array of samples)
      // creates a new array (32-bit) and stores the 16-bit data of the wav-file as 32-bit data
      var buffer_i32 = wav_file_processing_convert_to32bitdata(ui8_data.buffer,
        wav_parameters.bps,
        wav_parameters.block_align);

      if(!buffer_i32){
        var msg = 'Unsupported WAV format';
        console.error(msg);
        return {error: msg, status: 1};
      }

      var tot_samples = 0;
      var compression_level = 5;
      var flac_ok = 1;
      var is_verify = isVerify;
      var is_write_ogg = isUseOgg;

      var flac_encoder = Flac.create_libflac_encoder(wav_parameters.sample_rate,
        wav_parameters.channels,
        wav_parameters.bps,
        compression_level,
        tot_samples,
        is_verify);
      if (flac_encoder != 0) {
        var init_status = Flac.init_encoder_stream(flac_encoder,
          write_callback_fn,
          metadata_callback_fn,
          is_write_ogg,
          0);
        flac_ok &= init_status == 0;
        console.log("flac init: " + flac_ok);
      } else {
        Flac.FLAC__stream_encoder_delete(flac_encoder);
        var msg = 'Error initializing the decoder.';
        console.error(msg);
        return {error: msg, status: 1};
      }

      var flac_return = Flac.FLAC__stream_encoder_process_interleaved(flac_encoder,
        buffer_i32,
        buffer_i32.length / wav_parameters.channels);

      if (flac_return != true) {
        console.error("Error: FLAC__stream_encoder_process_interleaved returned false. " + flac_return);
        flac_ok = Flac.FLAC__stream_encoder_get_state(flac_encoder);
        Flac.FLAC__stream_encoder_delete(flac_encoder);
        return {error: 'Encountered error while encoding.', status: flac_ok};
      }

      flac_ok &= Flac.FLAC__stream_encoder_finish(flac_encoder);

      Flac.FLAC__stream_encoder_delete(flac_encoder);

      return {metaData: meta_data, status: flac_ok};
    }
    
    //result = encodeFlac(arrayBuffer, encData, isVerify(), isUseOgg());
    result = encodeFlac(arrayBuffer, encData, true, false));
  }

  function passToSpeechToTextAPI(blob) {
    // Need file reader object to perform Base64 encoding as a wrapper object
    // to handle Base64 encoding for the API call.
    var ToB64Reader = new FileReader();
    ToB64Reader.onload = function() {
      // Since the file reader object adds an extra Data URI as a header
      // chop this information off with a regular expression search/replace
      // and make the actual API call with that version
      Speech.audio.content = ToB64Reader.result.replace(/^data:.+;base64,/, '');
      console.log("Speech.audio.content="+Speech.audio.content); // Encoded data
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
