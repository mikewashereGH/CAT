// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyDHqagLKHyTdC03oULCREbkxA1twi7AFWs",
    authDomain: "clicker-72afe.firebaseapp.com",
    projectId: "clicker-72afe",
    storageBucket: "clicker-72afe.appspot.com",
    databaseURL: "https://clicker-72afe-default-rtdb.firebaseio.com/",
    messagingSenderId: "691683048296",
    appId: "1:691683048296:web:6388ae6642e0b10fdef4dd"
};

firebase.initializeApp(firebaseConfig);

// Get references to necessary DOM elements
var countElement = document.getElementById("count");
var clickButton = document.getElementById("clickButton");
var leaderboardList = document.getElementById("leaderboardList");
var loggedInUser = document.getElementById("loggedInUser");
var loginButton = document.getElementById("loginButton");
var logoutButton = document.getElementById("logoutButton");

// Handle button click
clickButton.addEventListener("click", function () {
    var user = firebase.auth().currentUser;
    if (user) {
        incrementCounter(user.uid);
    } else {
        alert("Please log in to contribute!");
    }
});

// Handle login button click
loginButton.addEventListener("click", function () {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
        var user = result.user;
        loggedInUser.textContent = "Logged in as: " + user.displayName;
    }).catch(function (error) {
        console.error(error);
    });
});

// Handle logout button click
logoutButton.addEventListener("click", function () {
    firebase.auth().signOut().then(function () {
        loggedInUser.textContent = "";
    }).catch(function (error) {
        console.error(error);
    });
});

// Increment the counter in the database and update on click
function incrementCounter(userId) {
    var ref = firebase.database().ref("counter");
    ref.transaction(function (currentCount) {
        return currentCount + 1;
    }, function (error, committed, snapshot) {
        if (error) {
            console.error(error);
        } else if (committed) {
            countElement.textContent = snapshot.val();
            updateLeaderboard(userId);
        }
    });
}

// Update the leaderboard with the user's contribution count
function updateLeaderboard(userId) {
    var ref = firebase.database().ref("leaderboard").child(userId);
    ref.transaction(function (currentCount) {
        return currentCount ? currentCount + 1 : 1;
    }, function (error) {
        if (error) {
            console.error(error);
        } else {
            fetchLeaderboard();
        }
    });
}

// Fetch the leaderboard data and populate the leaderboard list
function fetchLeaderboard() {
    var ref = firebase.database().ref("leaderboard");
    ref.orderByValue().limitToLast(10).once("value", function (snapshot) {
        leaderboardList.innerHTML = "";
        snapshot.forEach(function (childSnapshot) {
            var userRef = firebase.database().ref("users").child(childSnapshot.key);
            userRef.once("value", function (userSnapshot) {
                var username = userSnapshot.val().username;
                var count = childSnapshot.val();
                var listItem = document.createElement("li");
                listItem.textContent = username + " - " + count + " contributions";
                leaderboardList.appendChild(listItem);
            });
        });
    });
}

// Listen for user authentication state changes
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        loggedInUser.textContent = "Logged in as: " + user.displayName;
        clickButton.disabled = false;
        logoutButton.disabled = false;
    } else {
        loggedInUser.textContent = "";
        clickButton.disabled = true;
        logoutButton.disabled = true;
    }
});

// Fetch the initial count and leaderboard data
var counterRef = firebase.database().ref("counter");
counterRef.on("value", function (snapshot) {
    var count = snapshot.val();
    countElement.textContent = count;
});

fetchLeaderboard();