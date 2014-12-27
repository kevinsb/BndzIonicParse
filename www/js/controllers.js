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
				      		console.log("Usuario registrado via Facebook");
				      		$state.go('bondzu.account')
				    	} else {
				    		console.log("Login exitoso");
				      		$state.go('bondzu.account')
				    	}
				  	},
				  	
				  	error: function(user, error) {
				    	console.log("User cancelled the Facebook login or did not fully authorize.");
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
	var animalsQuery;
	var fotos = [];
	animalsQuery = Catalog.all();

	animalsQuery.find(function(result){
		for (var i = 0; i < result.length; i++) {
			foto = result[i].get('photo');
			fotos.push({
				url: foto.url()
			});
		};

		$scope.$apply(function(){
            $scope.animals = result;
            $scope.fotos = fotos;
        });
	}, function(err){
		console.log("Error: " + err);
	});
})

.controller('AnimalDetailCtrl', function($scope, $state, $stateParams, Catalog, $ionicPopup){
	var animalQuery = Catalog.all();
	animalQuery.equalTo('objectId', $stateParams.animalId);
	//LA SIGUIENTE LINEA DE CODIGO ES IMPORTANTE PARA REGRESAR EL OBJECTO QUE APUNTA A id_zoo sin hacer otro query
	animalQuery.include('id_zoo');
	animalQuery.find({
		success: function(result){
			fotoObj    = result[0].get('photo');
			fotoAnimal = fotoObj.url();
			idZoo      = result[0].get('id_zoo');
			$scope.$apply(function(){
	            $scope.animal = result;
	            $scope.foto = fotoAnimal;
	            $scope.zoo = idZoo;
	        });
		},
		error: function(error){
			console.log(error);
		}
	});

	$scope.adopt = function(nameAnimal, idAnimal) {
	   var confirmPopup = $ionicPopup.confirm({
	     title: 'Adopt ' + nameAnimal,
	     template: 'Are you sure you want to adopt ' + nameAnimal + '?'
	   });
	   confirmPopup.then(function(res) {
	     if(res) {
	     	Catalog.adopt(idAnimal);
	       	$state.go('bondzu.adoptions');
	     } else {
	       console.log('You are not sure');
	     }
	   });
	 };
	
})

.controller('AdoptionsCtrl', function($scope, Catalog){
	var fotos = [];
	var relationAdoptions = Catalog.getAdoptions();
	relationAdoptions.query().find({
    	success: function(result) {
    		for (var i = 0; i < result.length; i++) {
				foto = result[i].get('photo');
				fotos.push({
					url: foto.url()
				});
				console.log(foto.url)
			};
      		$scope.$apply(function(){
	            $scope.adoptions = result;
	            $scope.fotos = fotos;
	        });
    	}
  	});
})

.controller('ZoosCtrl', function($scope, Zoo){
	//Zoo.all();
})

.controller('ZooDetailCtrl', function($scope, $state, $stateParams, Zoo){
	var queryZoo = Zoo.getZoo($stateParams.zooId);
	queryZoo.find({
		success: function(result){
			$scope.$apply(function(){
	            $scope.zoo = result;
	        });
		},
		error: function(error){
			console.log("Error: " + error);
		}
	});
})

.controller('AdoptionDetailCtrl', function($scope, $state, $stateParams, Catalog){
	var animalQuery = Catalog.all();
	animalQuery.equalTo('objectId', $stateParams.animalId);
	//LA SIGUIENTE LINEA DE CODIGO ES IMPORTANTE PARA REGRESAR EL OBJECTO QUE APUNTA A id_zoo sin hacer otro query
	animalQuery.include('id_zoo');
	animalQuery.find({
		success: function(result){
			fotoObj    = result[0].get('photo');
			fotoAnimal = fotoObj.url();
			idZoo      = result[0].get('id_zoo');
			$scope.$apply(function(){
	            $scope.adoption = result;
	            $scope.foto = fotoAnimal;
	            $scope.zoo = idZoo;
	        });
		},
		error: function(error){
			console.log(error);
		}
	});
})