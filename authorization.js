// Note: Replace the URL with a valid endpoint to retrieve
//       authorization tokens for your subscription.

// An authorization token is a more secure method to authenticate for a browser deployment as
// it allows the subscription keys to be kept secure on a server and a 10 minute use token to be
// handed out to clients from an endpoint that can be protected from unauthorized access.
//                             https://westus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US
//var authorizationEndpoint = "https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken";
//var authorizationEndpoint = "https://api.cognitive.microsofttranslator.com/";
var authorizationEndpoint = "https://westus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US";
function RequestAuthorizationToken() {
    if (authorizationEndpoint) {
        var a = new XMLHttpRequest();
        a.open("GET", authorizationEndpoint);
        a.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        a.send("");
        a.onload = function () {
            var token = JSON.parse(atob(this.responseText.split(".")[1]));
            regionOptions.value = token.region;
            authorizationToken = this.responseText;
            key.disabled = true;
            key.value = "using authorization token (hit F5 to refresh)";
            console.log("Got an authorization token: " + token);
        }
    }
}
