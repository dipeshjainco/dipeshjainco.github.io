var USERFLAG = false;
this.submitLoginButton = document.getElementById('#submit');

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        alert("Logged In Succesfully");

        var user = firebase.auth().currentUser;
        var name, email, photoUrl, uid, emailVerified;

        if (user != null) {
            name = user.displayName;
            email = user.email;
            uid = user.uid;
        }
        var users = firebase.database().ref("users");
        var rootRef = firebase.database().ref();
        rootRef.child("users").orderByChild("uid").equalTo(uid).once("value", function(snapshot) {
            var userData = snapshot.val();
            if (userData) {
                console.log("exists!");
            } else {
                users.push({
                    uid: uid,
                    emailId: email
                });
            }
        });

    } else {
        console.log("Logged Out");
    }
})

function getCurrentuser() {
    var user = firebase.auth().currentUser;
    if (user) {
        USERFLAG = true;
    }
}

$('#submit').click(function() {
    var emailId = $('#email').val();
    var password = $('#pwd').val();
    uf = getCurrentuser();
    if (!uf) {

        firebase.auth().signInWithEmailAndPassword(emailId, password)
            .then(function(firebaseUser) {
                console.log(password);
            })

        .catch(function(error) {
            console.log(error.code);
            console.log(error.message);
        });

    }

});