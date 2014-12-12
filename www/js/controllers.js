angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state) {

	$scope.create = function() {
		$state.go('createUser')
	}

	$scope.login = function() {
		window.fbAsyncInit = function() {
			Parse.FacebookUtils.init({ // this line replaces FB.init({
				appId      : '376601475842237', // Facebook App ID
			  	status     : true, // check Facebook Login status
			  	cookie     : true, // enable cookies to allow Parse to access the session
			  	xfbml      : true,
			  	version    : 'v2.1'
			});

			// Additional init code here
			FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
			    	// user logged in and linked to app
			    	// handle this case HERE
			    	$state.go('bondzu.account')
			  	}
			  	else{
			  		Parse.FacebookUtils.logIn(null, {
					success: function(user) {
				    	if (!user.existed()) {
				      		alert("Usuario registrado via Facebook");
				      		$state.go('bondzu.account')
				    	} else {
				      		$state.go('bondzu.account')
				    	}
				  	},
				  	
				  	error: function(user, error) {
				    	alert("User cancelled the Facebook login or did not fully authorize.");
				  	}
				});
			  	}
			});
		};

		(function(d, s, id){
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement(s); js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	}
})

.controller('FriendsCtrl', function($scope, Friends) {
	$scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  	$scope.friend = Friends.get($stateParams.friendId);
})

.controller('CreateUser', function($scope, Users) {
	$scope.createUser = function(user){
	    Users.create(user);
	}
})

.controller('AccountCtrl', function($scope) {

})

.controller('CatalogCtrl', function($scope, Catalog) {
	var animals;
	animals = Catalog.all();
	console.log(animals.length);
	for(var i=0; i < animals.length; i++){
		console.log(animals[i].get('name'));
	}
})

.controller('ZooCtrl', function($scope, Zoo){
	Zoo.all();
})