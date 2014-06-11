// logged in
// login failure

// facebook friends updated

// registration successful
// registration failure

// reset password successful
// reset password failure

// facebook login successful
// facebook login failure

function NCSUser()
{
	this.construct("ncsuser");
}

NCSUser.inherits(EventDispatcher);

NCSUser.prototype.construct = function()
{
	this.type = "ncsuser";
	this.innerId = sequence(this.type, this);
	this.windowVar = this.type+"_"+this.innerId;
}

NCSUser.prototype.reset = function()
{	
	delete this.FB;
	delete this.fbId;
	delete this.fbToken;
	delete this.email;
	delete this.firstname;
	delete this.lastname;
	delete this.picture;
	delete this.id;
}

// -------------------
// RESET PASSWORD
// -------------------

NCSUser.prototype.resetPassword = function(email)
{
	var url = "resetPassword.php";
	var getObj = { email: email };
	// windowVar, success, failure, url, getObj
	ajaxGet(this.windowVar, "resetPasswordSuccess", "resetPasswordFailure", url, getObj);

}

NCSUser.prototype.resetPasswordSuccess = function(event)
{
	var req = event.target;
	var status = req.status;
	var statusText = req.statusText;
	var json = JSON.parse(req.responseText);
	if(status == 200)
	{
		this.dispatchEvent("reset password successful");
	}
	else
	{
		this.dispatchEvent("reset password failure", { message: json.message });
	}
}

NCSUser.prototype.resetPasswordFailure = function(event)
{
	this.dispatchEvent("reset password failure");
}


// ------------
// REGISTER
// ------------

NCSUser.prototype.register = function(email, password)
{
	// call checkUser fonction, to create a user
	var url = "createUser.php";
	var postObj = { email: email, password: password };

	ajaxPost(this.windowVar, "registerSuccess", "registerFailure", url, postObj);
}

NCSUser.prototype.registerSuccess = function(event)
{
	var req = event.target;
	var status = req.status;
	var statusText = req.statusText;
	var json = JSON.parse(req.responseText);
	// TODO: get the id, etc.
	if(status == 200)
	{
		this.dispatchEvent("registration successful");
	}
	else
	{
		this.dispatchEvent("registration failure", {message: json.message});
	}
}

NCSUser.prototype.registerFailure = function(event)
{
	// not sure what to do here
	alert("register failure");
}


// -------------
// LOGIN
// -------------

NCSUser.prototype.login = function(email, password)
{
	var url = "checkUser.php";
	var postObj = { email: email, password: password};
	ajaxPost(this.windowVar, "loginSuccess", "loginFailure", url, postObj);
}

NCSUser.prototype.loginSuccess = function(event)
{
	var req = event.target;
	var status = req.status;
	var statusText = req.statusText;
	var json = JSON.parse(req.responseText);
	if(status == 200)
	{
		this.dispatchEvent("logged in");
	}
	else
	{
		this.dispatchEvent("login failure");
	}
}

NCSUser.prototype.loginFailure = function(event)
{
	this.dispatchEvent("login failure");
}


function NCSFBUser(FB)
{
	this.construct("ncsfbuser");
	this.FB = FB;
	var windowVar = this.windowVar;

	this.initFB();
	this.triggerFBLoginCheck();
}

NCSFBUser.inherits(NCSUser);

// --------------------------------
// FACEBOOK AUTHENTICATION
// -------------------------------

NCSFBUser.prototype.initFB = function()
{
	this.FB.init({
	    appId      : '135808573225926',
	    cookie     : true,  // enable cookies to allow the server to access 
	                        // the session
	    xfbml      : true,  // parse social plugins on this page
	    version    : 'v2.0' // use version 2.0    
  	});
}

NCSFBUser.prototype.triggerFBLoginCheck = function()
{
	var windowVar = this.windowVar;
	this.FB.getLoginStatus(function(response)
	{
		window[windowVar].fbStatusChanged(response); 
    });
}

NCSFBUser.prototype.fbStatusChanged = function(response)
{ 
    if (response.status === 'connected')
    {
		this.fbToken = response.authResponse.accessToken;
		var windowVar = this.windowVar;
		this.FB.api('/v2.0/me?fields=id,first_name,last_name,email,picture', function(response)
		{
	    	window[windowVar].facebookUserInfoReceived(response);
    	});
    	this.dispatchEvent("facebook login successful");
    }
    else if (response.status === 'not_authorized')
    {
    	this.dispatchEvent("facebook login failure");
    }
    else
    {
    	// do nothing!
    }
}

NCSFBUser.prototype.facebookUserInfoReceived = function(response)
{      
      this.facebookLogin(FB, response.id, response.email, response.first_name, response.last_name, response.picture.data.url);
}

// ----------------------
// LOGIN FROM FACEBOOK
// ----------------------

NCSFBUser.prototype.facebookLogin = function(FB, fbId, fbEmail, fbFirstName, fbLastName, fbPicture)
{
	this.FB = FB;
	this.fbId = fbId;
	this.email = fbEmail;
	this.firstname = fbFirstName;
	this.lastname = fbLastName;
	this.picture = fbPicture;

	var url = "checkUser.php";
	var postObj = { fbId: fbId, fbToken: this.fbToken, fbEmail: fbEmail, fbFirstName: fbFirstName, fbLastName: fbLastName, fbPicture: fbPicture };
	ajaxPost(this.windowVar, "userChecked", "userCheckFailed", url, postObj);
}

NCSFBUser.prototype.userChecked = function(event)
{
	// alert("userChecked");
	var req = event.target;
	var response = req.responseText;
	var result = JSON.parse(response);
	var status = req.status;
	var statusText = req.statusText;
	
	if(status == 200)
	{
		this.id = result.id;

		// TODO: store the id, and other fields
		this.updateFBFriends();
		this.dispatchEvent("logged in");
	}
}

NCSFBUser.prototype.userCheckFailed = function(event)
{
	alert("userCheckFailed");
	this.dispatchEvent("login failure");
	// dispatch some event
}

// --------------------------------------
// UPDATE FRIENDS FROM FACEBOOK
// --------------------------------------

NCSFBUser.prototype.getFBFriendsQuery = function()
{
    var query = "SELECT uid,first_name,last_name,pic_square FROM user WHERE uid in (SELECT uid2 FROM friend where uid1 = me())";    
    return query;
}

NCSFBUser.prototype.updateFBFriends = function()
{
	var FB = this.FB;
	var query = this.getFBFriendsQuery();
	var windowVar = this.windowVar;
	FB.api({
        method: 'fql.query',
        query: query,
        return_ssl_resources: 1
    }, function(response){
    	window[windowVar].setFacebookFriends(response);
    });
}


// --------------------------
// SET FACEBOOK FRIENDS
// --------------------------

NCSFBUser.prototype.setFacebookFriends = function(response)
{
	// TODO: make sure this.userId and this.fbId are set.
	var url = "saveFbFriends.php?userId="+this.id+"&fbId="+this.fbId;
	ajaxPostJSON(this.windowVar, "facebookFriendsSet", "facebookFriendSetError", url, response);
}

NCSFBUser.prototype.facebookFriendsSet = function(event)
{
	var req = event.target;
	var json = JSON.parse(req.responseText);
	var status = req.status;
	var statusText = req.statusText;
	if(status == 200)
	{
		this.dispatchEvent("facebook friends updated");		
	}
}

NCSFBUser.prototype.facebookFriendSetError = function(event)
{
	alert("facebookFriendSetError");
	// not sure what the output is yet
}


// ---------------------------
// GET FACEBOOK FRIENDS FROM VRAIPRO SERVER
// ---------------------------

NCSFBUser.prototype.getFacebookFriends = function()
{
	// get all facebook friends
	if(this.fbId == undefined)
		throw("fbId undefined");

	var getObj = { fb_id: this.fbId };
	var url = "getFacebookFriends.php";
	ajaxGet(this.windowVar, "facebookFriendsReceived", "facebookFriendsError", url, getObj);
}

NCSFBUser.prototype.getCommonFriends = function(otherUser)
{
	var user1 = this;
	var user2 = otherUser;
	var user1Class = get_class(user1);
	var user2Class = get_class(user2);
	if(user1Class == user2Class && user1Class == "NCSFBUser")
	{
		var user1Friends = user1.getFacebookFriends();
		var user2Friends = user2.getFacebookFriends();

		// not sure this should happen on the client side. anyways
	}
}