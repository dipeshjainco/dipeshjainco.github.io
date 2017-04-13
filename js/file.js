'use strict';

// Initializes FriendlyChat.
function FriendlyChat() {
    this.checkSetup();

    this.submitImageButton = document.getElementById('submitImage');
    this.mediaCapture = document.getElementById('mediaCapture');
    this.storageRef = firebase.storage().ref();
    this.databaseRef = firebase.database().ref();


    // Events for image upload.
    this.submitImageButton.addEventListener('click', function(e) {
        e.preventDefault();
        this.mediaCapture.click();
    }.bind(this));
    this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));


}



// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
    event.preventDefault();
    var file = event.target.files[0];

    // Clear the selection in the file picker input.


    // Check if the file is an image.
    if (!file.type.match('application/pdf')) {
        var data = {
            message: 'You can only add pdf',
            timeout: 2000
        };
        alert(data.message);
        return;
    }


    // Upload the image to Cloud Storage.
    var dataRef = this.databaseRef;
    var filePath = file.name;
    var user = firebase.auth().currentUser;
    this.storageRef.child("client/" + user.uid + "/" + filePath).put(file)
        .then(function(snapshot) {
            console.log('Uploaded a blob or file!', snapshot);
            dataRef.child("files").child(user.uid).push({
                fileName: snapshot.metadata.name,
                path: snapshot.metadata.fullPath,
                size: snapshot.metadata.size,
                downloadUrl: snapshot.downloadURL
            })
            location.reload();
        }).catch(function(error) {
            console.log(error.code);
            alert(error.message);
        });
}


// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';




// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
    if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
        window.alert('You have not configured and imported the Firebase SDK. ' +
            'Make sure you go through the codelab setup instructions.');
    } else if (config.storageBucket === '') {
        window.alert('Your Cloud Storage bucket has not been enabled. Sorry about that. This is ' +
            'actually a Firebase bug that occurs rarely. ' +
            'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
            'and make sure the storageBucket attribute is not empty. ' +
            'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
            'displayed there.');
    }
};

window.onload = function() {
    window.friendlyChat = new FriendlyChat();
};