<!-- <authorizationfunction> -->
<!-- Speech SDK Authorization token -->
// Note: Replace the URL with a valid endpoint to retrieve
//       authorization tokens for your subscription.
//var authorizationEndpoint = "https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken";
//var authorizationEndpoint = "https://luis-resource-01.cognitiveservices.azure.com/";
var authorizationEndpoint = "https://westus.api.cognitive.microsoft.com/sts/v1.0";

function RequestAuthorizationToken() {
  if (authorizationEndpoint) {
    var a = new XMLHttpRequest();
    a.open("GET", authorizationEndpoint);
    a.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    a.send("");
    a.onload = function() {
        var token = JSON.parse(atob(this.responseText.split(".")[1]));
        serviceRegion.value = token.region;
        authorizationToken = this.responseText;
        subscriptionKey.disabled = true;
        subscriptionKey.value = "using authorization token (hit F5 to refresh)";
        console.log("Got an authorization token: " + token);
    }
  }
}
<!-- </authorizationfunction> -->
