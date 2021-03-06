this.submitLoginButton = document.getElementById('#submit');
this.storageRef = firebase.storage().ref();
this.databaseRef = firebase.database().ref();

var adminFlag = false;
var adminSelectUid;


//Session Logout
var idleTime = 0;
$(document).ready(function() {



    if (getCurrentuser()) {
        $("#login").css("display", "none");
        $("#myfiles").css("display", "inline");
        $("#signOut").css("display", "inline");
    }

    if (sessionStorage.loginFlag == null) {
        signOut();
    }
    //Increment the idle time counter every minute.
    if (getCurrentuser()) {
        var idleInterval = setInterval(timerIncrement, 60000); // 1 minute
    }

    //Zero the idle timer on mouse movement.
    $(this).mousemove(function(e) {
        idleTime = 0;
    });
    $(this).keypress(function(e) {
        idleTime = 0;
    });
});

function timerIncrement() {
    idleTime = idleTime + 1;
    console.log(idleTime);
    if (idleTime >= 3) { // 3 minutes
        signOut();
    }

}

//Delete File 
function deleteFile(key, folderkey, uid) {
    firebase.database().ref("files/" + uid + "/" + folderkey + "/").child(key).remove();
    location.reload();
    /*var deleteRef = storageRef.child("client/" + uid + "/" + fileName);

    // Delete the file
    deleteRef.delete().then(function() {
        console.log("File Deleted");
        databaseRef.child(key).remove();
        location.reload();
    }).catch(function(error) {
        console.log(error);
    });*/

}

$('#userSelect').on('change', function() {
    if (this.value == "all") {
        $(".display-section").empty();
        location.reload();
    } else {
        $(".filetable").empty();
        getFiles(this.value);
    }

});

$('#adminSelect').on('change', function() {
    adminSelectUid = this.value;
    $('#folderSelect').empty();
    getFolders(adminSelectUid);
});

//Get Files Of Client
function getFiles(uid) {
    databaseRef = firebase.database().ref("files/" + uid);
    databaseRef.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var folderKey = childSnapshot.key;
            var folderData = childSnapshot.val();

            if (folderKey) {
                $('.filetable').append('<div class="panel panel-default"><div class="panel-heading" role="tab" id="headingOne"><h4 class="panel-title"><a role="button" data-toggle="collapse" data-parent="#accordion" href="#' + folderKey + '" aria-expanded="false" aria-controls="' + folderKey + '">' + folderKey + '</a></h4></div><div id="' + folderKey + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne"><ul class="list-group ' + folderKey + '"></ul></div>');

                databaseFolderRef = firebase.database().ref("files/" + uid + "/" + folderKey);
                databaseFolderRef.once('value', function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();

                        $('.' + folderKey).append('<li class="list-group-item"> <p>' + childData.fileName + '</p><a href="' + childData.downloadUrl + '" target="_blank">View <i class="fa fa-eye"></i></a> <a href="' + childData.downloadUrl + '" download>Download <i class="fa fa-download "></i></a> <a href="#" onClick="deleteFile(\'' + childKey + '\',\'' + folderKey + '\' ,\'' + uid + '\')">delete <i class="fa fa-trash"></i></a></li>');

                    });
                    $('.filetable').append('</ul></div>');
                });
            }

        });
    });

}

// To check the login state
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        $('#myModal').modal('hide');
        $("#login").css("display", "none");
        $("#myfiles").css("display", "inline");
        $("#signOut").css("display", "inline");
        var user = getCurrentuser();
        var name, email, uid;
        if (user != null) {
            name = user.displayName;
            email = user.email;
            uid = user.uid;
        }
        adminRef = firebase.database().ref("admins/");
        adminRef.once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var adminKey = childSnapshot.key;

                if (adminFlag == false) {
                    if (adminKey == uid) {
                        adminFlag = true;
                        console.log(uid);
                        adminSelectUid = uid;
                        $("#texthint").show();
                        $(".selectbtn").css("display", "block");
                        $('#adminSelect').append('<option value="">Select User</option>');

                        userRef = firebase.database().ref("users/");
                        userRef.once('value', function(snapshot) {
                            snapshot.forEach(function(childSnapshot) {
                                var userKey = childSnapshot.key;
                                var userData = childSnapshot.val();
                                $('#userSelect').append('<option value=' + userData.uid + '>' + userData.emailId + '</option>');
                                $('#adminSelect').append('<option value=' + userData.uid + '>' + userData.emailId + '</option>');
                                //$('#folderSelect').prop("disabled", "disabled");

                            });
                        });
                        return;
                    } else {
                        getFiles(uid);
                        getFolders(uid);
                    }
                }

            });

        });

    } else {
        $("#myfiles").css("display", "none");
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

    }, function(error) {
        console.error('Sign Out Error', error);
    });
}

$('#submitSignOut').click(function() {
    signOut();
    window.location = 'index.html';
});

$('#submitSignIn').click(function() {
    var emailId = $('#email').val();
    var password = $('#pwd').val();
    firebase.auth().signInWithEmailAndPassword(emailId, password)
        .then(function(firebaseUser) {
            alert("Logged In Successfully");
            if (typeof(Storage) !== "undefined") {
                sessionStorage.loginFlag = true;

            }
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



function getFolders(uid) {
    databaseRef = firebase.database().ref("files/" + uid);
    databaseRef.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {

            var folderKey = childSnapshot.key;
            var folderData = childSnapshot.val();

            $('#folderSelect').append('<option value=' + folderKey + '>' + folderKey + '</option>');
        });
    });
    $('#folderSelect').append('<option value="newfolder">Add New Folder</option>');
}
$('#folderSelect').on('change', function() {
    if (this.value == "newfolder") {
        $("#txtFolderName").css({ "display": "block" });
    } else {
        $("#txtFolderName").css({ "display": "none" });
    }
});


function FriendlyChat() {
    this.checkSetup();

    this.submitImageButton = document.getElementById('submitImage');
    this.mediaCapture = document.getElementById('mediaCapture');
    this.storageRef = firebase.storage().ref();
    this.databaseRef = firebase.database().ref();

    if (this.submitImageButton) {
        this.submitImageButton.addEventListener('click', function(e) {
            e.preventDefault();
            this.mediaCapture.click();
        }.bind(this));
        this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));
    }
    // Events for image upload.


}



// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
    var eve = $(document).click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    });
    var file = event.target.files[0];

    // Clear the selection in the file picker input.


    // Check if the file
    /*if (!file.type.match('application/*')) {
        var data = {
            message: 'Please select valid file',
            timeout: 2000
        };
        alert(data.message);
        return;
    }*/


    // Upload the image to Cloud Storage.
    var dataRef = this.databaseRef;
    var filePath = file.name;
    var user = firebase.auth().currentUser;
    var folderName = $("#folderSelect").val();
    if (folderName == "newfolder") {
        folderName = $("#txtFolderName").val();
    }

    if (adminFlag == true) {
        storeFile(adminSelectUid, folderName);
    } else {
        storeFile(user.uid, folderName);
    }

    function storeFile(uid, folderName) {
        $("#progress-part").css('display', 'block');
        this.storageRef.child("client/" + user.uid + "/" + filePath).put(file)
            .then(function(snapshot) {
                alert("Uploaded a file!");
                dataRef.child("files").child(uid).child(folderName).push({
                    fileName: snapshot.metadata.name,
                    path: snapshot.metadata.fullPath,
                    size: snapshot.metadata.size,
                    downloadUrl: snapshot.downloadURL
                })

                location.reload();
            }).catch(function(error) {
                console.log(error);
                $("#progress-part").css('display', 'none');
                alert("PLease select folde and file properly!");
            });

    }

}





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