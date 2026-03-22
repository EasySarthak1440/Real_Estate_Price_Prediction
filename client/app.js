// const BACKEND_URL = "http://127.0.0.1:5000";
const BACKEND_URL = "https://bangalore-house-price-backend.onrender.com"; // You will update this after Render deployment

// Allow cookies/sessions with jQuery AJAX
$.ajaxSetup({
    xhrFields: {
        withCredentials: true
    }
});

function getBathValue() {
  var uiBathrooms = document.getElementsByName("uiBathrooms");
  for(var i in uiBathrooms) {
    if(uiBathrooms[i].checked) {
        return parseInt(i)+1;
    }
  }
  return -1; // Invalid Value
}

function getBHKValue() {
  var uiBHK = document.getElementsByName("uiBHK");
  for(var i in uiBHK) {
    if(uiBHK[i].checked) {
        return parseInt(i)+1;
    }
  }
  return -1; // Invalid Value
}

function onClickedEstimatePrice() {
  console.log("Estimate price button clicked");
  var sqft = document.getElementById("uiSqft");
  var bhk = getBHKValue();
  var bathrooms = getBathValue();
  var location = document.getElementById("uiLocations");
  var estPrice = document.getElementById("uiEstimatedPrice");

  var url = BACKEND_URL + "/predict_home_price";

  $.post(url, {
      total_sqft: parseFloat(sqft.value),
      bhk: bhk,
      bath: bathrooms,
      location: location.value
  },function(data, status) {
      console.log(data.estimated_price);
      estPrice.innerHTML = "<h2>" + data.estimated_price.toString() + " Lakh</h2>";
      console.log(status);
  }).fail(function(err) {
      if (err.status === 401) {
          alert("Session expired. Please login again.");
          checkAuthStatus();
      } else {
          alert("Error predicting price. Make sure you are logged in.");
      }
  });
}

// Auth Logic
function checkAuthStatus() {
    var url = BACKEND_URL + "/check_auth";
    $.get(url, function(data) {
        if (data.is_authenticated) {
            $("#mainApp").show();
            $("#authContainer").hide();
            updateNav(true, data.user.username);
            onPageLoad();
        } else {
            $("#mainApp").hide();
            $("#authContainer").show();
            updateNav(false);
        }
    });
}

function updateNav(isAuth, username) {
    var navLinks = $("#navLinks");
    navLinks.empty();
    if (isAuth) {
        navLinks.append("<span>Welcome, " + username + "</span>");
        navLinks.append('<a href="#" onclick="onLogout()">Logout</a>');
    } else {
        navLinks.append('<a href="#" onclick="toggleAuth(\'login\')">Login</a>');
        navLinks.append('<a href="#" onclick="toggleAuth(\'signup\')">Sign Up</a>');
    }
}

function toggleAuth(type) {
    $("#loginBox, #signupBox, #forgotBox").hide();
    if (type === 'login') $("#loginBox").show();
    if (type === 'signup') $("#signupBox").show();
    if (type === 'forgot') $("#forgotBox").show();
}

function onLogin() {
    var email = $("#loginEmail").val();
    var password = $("#loginPassword").val();
    var url = BACKEND_URL + "/login";
    
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({email: email, password: password}),
        success: function(data) {
            checkAuthStatus();
        },
        error: function(err) {
            alert(err.responseJSON.message);
        }
    });
}

function onSignup() {
    var email = $("#signupEmail").val();
    var username = $("#signupUser").val();
    var password = $("#signupPassword").val();
    var url = BACKEND_URL + "/signup";

    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({email: email, username: username, password: password}),
        success: function(data) {
            alert("Signup successful! Please login.");
            toggleAuth('login');
        },
        error: function(err) {
            alert(err.responseJSON.message);
        }
    });
}

function onLogout() {
    var url = BACKEND_URL + "/logout";
    $.post(url, function() {
        checkAuthStatus();
    });
}

function onForgotPassword() {
    var email = $("#forgotEmail").val();
    var url = BACKEND_URL + "/forgot_password";
    
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({email: email}),
        success: function(data) {
            alert(data.message);
            toggleAuth('login');
        },
        error: function(err) {
            alert(err.responseJSON.message);
        }
    });
}

function onPageLoad() {
  console.log( "document loaded" );
  var url = BACKEND_URL + "/get_location_names";
  $.get(url,function(data, status) {
      console.log("got response for get_location_names request");
      if(data) {
          var locations = data.locations;
          var uiLocations = document.getElementById("uiLocations");
          $('#uiLocations').empty();
          for(var i in locations) {
              var opt = new Option(locations[i]);
              $('#uiLocations').append(opt);
          }
      }
  });
}

window.onload = checkAuthStatus;
