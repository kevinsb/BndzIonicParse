angular.module('starter.controllers', [])

.controller('LoginCtrl', ['$scope', '$state', function($scope, $state) {
	var fbSuccess = function (response) {
		console.log(response.status);
		statusFb = response.status;

		if (statusFb = "connected") {
			$state.go('bondzu.catalog');
		}
	}

	var fbFail = function (error) {
		console.log("Error en recolectar estatus: " + error);
	}

	$scope.fbStatus = function facebookLogin () {
		console.log("Llamando a facebookConnectPlugin");
		setTimeout(function(){ facebookConnectPlugin.getLoginStatus(fbSuccess, fbFail); }, 500);
	}
	
    var fbLogged = new Parse.Promise();

    var fbStatusSuccess = function(response) {
		console.log("Entrando");
		if (!response.status){
            fbStatusError("Cannot find the status");
            return;
        }
        var status = response.status;
        console.log("Status: " + status);
        if(status == "connected"){
        	console.log("Ya estas conectado, te llevo a adopciones");
        	$state.go('bondzu.catalog');
        }
        else{
        	facebookConnectPlugin.login(['email'], fbLoginSuccess, fbLoginError);

        	fbLogged.then( function(authData) {
	            console.log('Promised');
	            return Parse.FacebookUtils.logIn(authData);
	        })
	        .then( function(userObject) {
	            var authData = userObject.get('authData');
	            facebookConnectPlugin.api('/me', null, 
	                function(response) {
	                	console.log("Nombre: " + response.name);
	                	console.log("Email: " + response.email);
	                    console.log("Respuesta de datos de usuario: " + response);
	                    userObject.set('name', response.name);
	                    userObject.set('email', response.email);
	                    userObject.save();
	                },
	                function(error) {
	                    console.log(error);
	                }
	            );
	            facebookConnectPlugin.api('/me/picture', null,
	                function(response) {
	                    userObject.set('photo', response.data.url);
	                    userObject.save();
	                }, 
	                function(error) {
	                    console.log(error);
	                }
	            );
	            $state.go('bondzu.account');
	        }, function(error) {
	            console.log(error);
	        });
        }
	}

	var fbStatusError = function(error) {
		console.log(error);
	}

    var fbLoginSuccess = function(response) {
        if (!response.authResponse){
            fbLoginError("Cannot find the authResponse");
            return;
        }
        var expDate = new Date(
            new Date().getTime() + response.authResponse.expiresIn * 1000
        ).toISOString();

        var authData = {
            id: String(response.authResponse.userID),
            access_token: response.authResponse.accessToken,
            expiration_date: expDate
        }
        fbLogged.resolve(authData);
        fbLoginSuccess = null;
        console.log("fbLoginSuccess " + response);
    }

    var fbLoginError = function(error){
        fbLogged.reject(error);
    }

    $scope.create = function() {
		$state.go('createUser');
	}

    $scope.loginFB = function() {
        console.log('Login Started');
        facebookConnectPlugin.getLoginStatus(fbStatusSuccess, fbStatusError);
    }

    $scope.login = function(user){
    	var user = new Parse.User({
		  username: user.username,
		  password: user.password
		});

		user.logIn({
			success: function(response){
				$state.go('bondzu.catalog');
			},
			error: function(error) {
				alert("Error en login, intenta de nuevo");
			}
		});
    }
}])

.controller('FriendsCtrl', function($scope, Friends) {
	$scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  	$scope.friend = Friends.get($stateParams.friendId);
})

.controller('CreateUser', function($scope, Users, $state) {
	$scope.createUser = function(user){
	    Users.create(user);
	    $state.go('bondzu.catalog');
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

.controller('AnimalDetailCtrl', function($scope, $state, $stateParams, $ionicSlideBoxDelegate, Catalog, Calendar, $ionicPopup){
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

	var options = {
		successCallback: function() {
	  		alert("Video was closed without error.");
		},
		errorCallback: function(errMsg) {
	  		alert("Video streaming not available. Try again later");
		}
	}

	$scope.playVideo = function(url) {
		console.log("Llamando video: " + url);
		window.plugins.streamingMedia.playVideo(url, options);
	}

	$scope.tab = "tab0";
	$scope.toSlide = function(slide) {
		$ionicSlideBoxDelegate.slide(slide);
	}
	$scope.slideHasChanged = function(slide) {
		if (slide == 0) {
			$scope.tab = "tab0";
		}
		if (slide == 1) {
			$scope.tab = "tab1";
		}
		if (slide == 2) {
			$scope.tab = "tab2";
		}
		if (slide == 3) {
			$scope.tab = "tab3";
		}
	}
	

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

	$scope.changeMode = function (mode) {
        console.log("Entrando a change mod " + mode);
        $scope.mode = mode;
    };

    $scope.today = function () {
        $scope.currentDate = new Date();
    }

    $scope.isToday = function () {
        var today = new Date(),
            currentCalendarDate = new Date($scope.currentDate);

        today.setHours(0, 0, 0, 0);
        currentCalendarDate.setHours(0, 0, 0, 0);
        return today.getTime() === currentCalendarDate.getTime();
    }

    /*$scope.loadEvents = function () {
        $scope.eventSource = createRandomEvents();
    };*/

    $scope.onEventSelected = function (event) {
        $scope.event = event;
    };

    createRandomEvents();

    function createRandomEvents() {
    	var calendarQuery = Calendar.get($stateParams.animalId);
		calendarQuery.find({
	        success: function(calendar){
	        	$scope.$apply(function(){
	        		var events = [];
	        		//console.log(calendar.length);
	        		for (var i = 0; i < calendar.length; i++) {
	        			events.push({
		                    title: calendar[i].get('title'),
		                    startTime: calendar[i].get('start_date'),
		                    endTime: calendar[i].get('end_date'),
		                    allDay: false
		                });
	        		}
		        	$scope.eventSource = events;
		    	});
	        },
	        error: function(error){
	        	console.log(error);
	    	}
	    });
        /*var events = [];
        for (var i = 0; i < 20; i += 1) {
            var date = new Date();
            var eventType = Math.floor(Math.random() * 2);
            var startDay = Math.floor(Math.random() * 90) - 45;
            var endDay = Math.floor(Math.random() * 2) + startDay;
            var startTime;
            var endTime;
            if (eventType === 0) {
                startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));
                console.log(startTime);
                if (endDay === startDay) {
                    endDay += 1;
                }
                endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + endDay));
                events.push({
                    title: 'All Day - ' + i,
                    startTime: startTime,
                    endTime: endTime,
                    allDay: true
                });
            } else {
                var startMinute = Math.floor(Math.random() * 24 * 60);
                var endMinute = Math.floor(Math.random() * 180) + startMinute;
                startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + startDay, 0, date.getMinutes() + startMinute);
                endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + endDay, 0, date.getMinutes() + endMinute);
                events.push({
                    title: 'Event - ' + i,
                    startTime: startTime,
                    endTime: endTime,
                    allDay: false
                });
            }
        }
        return events;*/
    }
})

.controller('AdoptionsCtrl', function($scope, Catalog){
	var fotos = [];
    var relationAdoptions = Catalog.getAdoptions();
	relationAdoptions.query().find({
    	success: function(resulta) {
    		for (var i = 0; i < resulta.length; i++) {
				foto = resulta[i].get('photo');
				fotos.push({
					url: foto.url()
				});
				console.log(foto.url)
			};
      		$scope.$apply(function(){
	            $scope.adoptions = resulta;
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

.controller('AdoptionDetailCtrl', function($scope, $state, $stateParams, $ionicSlideBoxDelegate, Catalog, Calendar){
	$scope.playVideo = function(url) {
		console.log("Llamando video: " + url);
		window.plugins.streamingMedia.playVideo(url);
	}

	$scope.tab = "tab0";
	$scope.toSlide = function(slide) {
		$ionicSlideBoxDelegate.slide(slide);
	}
	$scope.slideHasChanged = function(slide) {
		if (slide == 0) {
			$scope.tab = "tab0";
		}
		if (slide == 1) {
			$scope.tab = "tab1";
		}
		if (slide == 2) {
			$scope.tab = "tab2";
		}
		if (slide == 3) {
			$scope.tab = "tab3";
		}
	}


	animalQuery = Catalog.all();
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

	$scope.changeMode = function (mode) {
        console.log("Entrando a change mod " + mode);
        $scope.mode = mode;
    };

    $scope.today = function () {
        $scope.currentDate = new Date();
    }

    $scope.isToday = function () {
        var today = new Date(),
            currentCalendarDate = new Date($scope.currentDate);

        today.setHours(0, 0, 0, 0);
        currentCalendarDate.setHours(0, 0, 0, 0);
        return today.getTime() === currentCalendarDate.getTime();
    }

    /*$scope.loadEvents = function () {
        $scope.eventSource = createRandomEvents();
    };*/

    $scope.onEventSelected = function (event) {
        $scope.event = event;
    };

    createRandomEvents();

    function createRandomEvents() {
    	var calendarQuery = Calendar.get($stateParams.animalId);
		calendarQuery.find({
	        success: function(calendar){
	        	$scope.$apply(function(){
	        		var events = [];
	        		//console.log(calendar.length);
	        		for (var i = 0; i < calendar.length; i++) {
	        			events.push({
		                    title: calendar[i].get('title'),
		                    startTime: calendar[i].get('start_date'),
		                    endTime: calendar[i].get('end_date'),
		                    allDay: false
		                });
	        		}
		        	$scope.eventSource = events;
		    	});
	        },
	        error: function(error){
	        	console.log(error);
	    	}
	    });
	}
})

.controller('ZooCtrl', function($scope){
	var options = {
		successCallback: function() {
	  		alert("Video was closed without error.");
		},
		errorCallback: function(errMsg) {
	  		alert("Error! " + errMsg);
		}
	};

	$scope.playVideo = function(url) {
		console.log("Llamando video: " + url);
		window.plugins.streamingMedia.playVideo(url, options);
	}
})

.controller('CalendarCtrl', function($scope, Calendar){
	
})