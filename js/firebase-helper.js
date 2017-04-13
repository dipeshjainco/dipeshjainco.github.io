this.submitLoginButton = document.getElementById('#submit');
this.storageRef = firebase.storage().ref();
this.databaseRef = firebase.database().ref();

function deleteFile(key, uid, fileName) {
    var deleteRef = storageRef.child("client/" + uid + "/" + fileName);

    // Delete the file
    deleteRef.delete().then(function() {
        console.log("File Deleted");
        databaseRef.child(key).remove();
        location.reload();
    }).catch(function(error) {
        console.log(error);
    });

}



firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log("Logged");
        $("#login").css("display", "none");
        $("#signOut").css("display", "inline");
        var user = getCurrentuser();
        var name, email, uid;
        if (user != null) {
            name = user.displayName;
            email = user.email;
            uid = user.uid;
        }
        databaseRef = firebase.database().ref("files/" + uid);
        databaseRef.once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                console.log(childData);
                if (childKey) {
                    $(".right-section").css("display", "block");
                    $('#filetable').append('<li class="list-group-item">' + childData.fileName + '<br><a href="' + childData.downloadUrl + '" target="_blank">View</a> <a href="' + childData.downloadUrl + '" download>download</a> <a href="#" onClick="deleteFile(\'' + childKey + '\',\'' + uid + '\',\'' + childData.fileName + '\')">delete</a></li>');

                }

            });
        });

        console.log(email + " User Logged In");

    } else {
        console.log("Logged Out");
        $("#signOut").css("display", "none");
        $("#login").css("display", "inline");

    }
})

function getCurrentuser() {
    var user = firebase.auth().currentUser;
    return user;
}

function signOut() {
    firebase.auth().signOut().then(function() {
        window.location = 'index.html';
    }, function(error) {
        console.error('Sign Out Error', error);
    });
}

$('#submitSignOut').click(function() {
    signOut();
});

$('#submitSignIn').click(function() {
    var emailId = $('#email').val();
    var password = $('#pwd').val();
    firebase.auth().signInWithEmailAndPassword(emailId, password)
        .then(function(firebaseUser) {
            alert("Logged In Successfully");
            user = getCurrentuser();
            if (user) {
                var usersRef = firebase.database().ref("users/" + user.uid);
                usersRef.set({
                    uid: user.uid,
                    emailId: user.email
                });

            }
        })
        .catch(function(error) {
            console.log(error.code);
            alert(error.message);
        });
});