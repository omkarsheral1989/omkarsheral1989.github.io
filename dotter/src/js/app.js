(function initializeFirebase() {
  var config = {
    apiKey: "AIzaSyBCKwhBou4qEJfHAJuuH_rUSoPiNcjp3v0",
    authDomain: "dotter-3859e.firebaseapp.com",
    databaseURL: "https://dotter-3859e.firebaseio.com",
    projectId: "dotter-3859e",
    storageBucket: "",
    messagingSenderId: "708047503280"
  };
  firebase.initializeApp(config);
})();

function sendFeedback(feedbackStr) {
  var database = firebase.database();
  database.ref("feedbacks/v1").push().set(
      {
        feedback: feedbackStr
      }
  );
}
