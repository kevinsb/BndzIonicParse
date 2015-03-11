angular.module('starter.controllers', [])

.controller('LoginCtrl', ['$scope', '$state', function($scope, $state, $ionicPopup) {
	var fbSuccess = function (response) {
		statusFb = response.status;
		console.log(statusFb);

		if (statusFb == "connected") {
			$state.go('bondzu.catalog');
		}
		else{
			console.log("Conectate");
		}
	}

	var fbFail = function (error) {
		console.log("Error en recolectar estatus: " + error);
	}

	$scope.fbStatus = function facebookLogin () {
		console.log("Llamando a facebookConnectPlugin");
		setTimeout(function(){ facebookConnectPlugin.getLoginStatus(fbSuccess, fbFail); }, 500);
	}

	//---------------------------------------------------------------------------
	
    var fbLogged = new Parse.Promise();

    var fbStatusSuccess = function(response) {
		if (!response.status){
            fbStatusError("Cannot find the status");
            return;
        }
        var status = response.status;
       	/*if (!response.authResponse){
                alert("No encuentro authResponse");
        }*/
        if(status == "connected"){
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
	                    userObject.set('name', response.first_name);
	                    userObject.set('lastname', response.last_name);
	                    userObject.set('email', response.email);
	                    userObject.set('gender', response.gender);
	                    userObject.set('birthday', response.birthday);
	                    userObject.set('about', response.about);
	                    userObject.save(null, {
	                    	success: function(success){
	                    		facebookConnectPlugin.api('/me?fields=picture.width(800).height(800)', null,
					                function(responsephoto) {
					                	if (responsephoto && !responsephoto.error) {
									    	console.log("Todo chingón");
									    	var profile_picture = responsephoto.picture.data.url;
									    	console.log(profile_picture);
									    	userObject.set('photo', profile_picture);
					                    	userObject.save();
									    }
									    else {
									    	console.log("Todo mal")
									    }
					                }, 
					                function(error) {
					                    console.log("Error en foto: " + JSON.stringify(error));
					                }
					            );
	                    	},
	                    	error: function(errorSave){
	                    		console.log("Error Save");
	                    	}
	                    });
	                },
	                function(error) {
	                    console.log(error);
	                }
	            );
	            $state.go('bondzu.account');
	        }, function(error) {
	            console.log("Error nuevo: " + error);
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
		$state.go('bondzu.createUser');
	}

    $scope.loginFB = function() {
        console.log('Login Started');
        facebookConnectPlugin.getLoginStatus(fbStatusSuccess, fbStatusError);
    }

    $scope.login = function(user){		
		Parse.User.logIn(user.username, user.password, {
			success: function(user){
				$state.go('bondzu.adoptions');
			},
			error: function(error) {
				alert("Error");
			}
		});
    }
}])


.controller('CreateUser', function($scope, Users, $state, $ionicPopup) {
	$scope.createUser = function(user){
		if (user.nombre == undefined || user.apellido == undefined || user.email == undefined || user.username == undefined || user.password == undefined || user.password2 == undefined){
			var alertPopup = $ionicPopup.alert({
				title: 'Sing Up',
				template: 'All the fields are required'
			});
		}

		else{
			if(user.email.indexOf('@') === -1){
			    var alertPopup2 = $ionicPopup.alert({
					title: 'Sing Up',
					template: 'Invalid email'
				});
			}
			else{
				if (user.password == user.password2){
			    	var nuevoUsuario = Users.create(user);
			    	nuevoUsuario.signUp(null, {
				        success:function(object) {
				          	var alertPopup3 = $ionicPopup.alert({
								title: 'Sing Up',
								template: 'Welcome to Bondzu'
							});
							$state.go('bondzu.catalog');
				        }, 
				        error:function(user, error) {
				          	console.dir(error);
				          	var alertPopup4 = $ionicPopup.alert({
								title: 'Sing Up',
								template: 'Something happen, please try again'
							});
				        }
				    });
			    }
			    else{
		    		var alertPopup = $ionicPopup.alert({
						title: 'Password',
						template: 'The password do not match'
					});
			    }
			}			
		}    
	}
})

.controller('AccountCtrl', function($scope, $state, $cordovaLocalNotification, Users) {
	cordova.plugins.notification.local.on('schedule', function (notification) {
                    console.log('onschedule', arguments);
                    // showToast('scheduled: ' + notification.id);
                });
                cordova.plugins.notification.local.on('update', function (notification) {
                    console.log('onupdate', arguments);
                    // showToast('updated: ' + notification.id);
                });
                cordova.plugins.notification.local.on('trigger', function (notification) {
                    console.log('ontrigger', arguments);
                    showToast('triggered: ' + notification.id);
                });
                cordova.plugins.notification.local.on('click', function (notification) {
                    console.log('onclick', arguments);
                    showToast('clicked: ' + notification.id);
                });
                cordova.plugins.notification.local.on('cancel', function (notification) {
                    console.log('oncancel', arguments);
                    // showToast('canceled: ' + notification.id);
                });
                cordova.plugins.notification.local.on('clear', function (notification) {
                    console.log('onclear', arguments);
                    showToast('cleared: ' + notification.id);
                });
                cordova.plugins.notification.local.on('cancelall', function () {
                    console.log('oncancelall', arguments);
                    // showToast('canceled all');
                });
                cordova.plugins.notification.local.on('clearall', function () {
                    console.log('onclearall', arguments);
                    // showToast('cleared all');
                });

	var id = 1;
    callback = function () {
        cordova.plugins.notification.local.getIds(function (ids) {
            showToast('IDs: ' + ids.join(' ,'));
        });
    };
    showToast = function (text) {
        setTimeout(function () {
            window.plugins.toast.showShortBottom(text);
        }, 100);
    };

	$scope.hasPermission = function () {
        cordova.plugins.notification.local.hasPermission(function (granted) {
            alert(granted);
        });
    };

    $scope.registerPermission = function () {
        cordova.plugins.notification.local.registerPermission(function (granted) {
            alert(granted);
        });
    };

    $scope.schedule = function () {
        cordova.plugins.notification.local.schedule({
            id:   1,
            text: 'Test Message 1',
            icon: 'http://www.optimizeordie.de/wp-content/plugins/social-media-widget/images/default/64/googleplus.png',
            sound: null,
            data: { test:id }
        });
    };

    $scope.scheduleMultiple = function () {
        cordova.plugins.notification.local.schedule([{
            id:   1,
            text: 'Multi Message 1'
        },{
            id:   2,
            text: 'Multi Message 2'
        },{
            id:   3,
            text: 'Multi Message 3'
        }]);
    };

    $scope.scheduleDelayed = function () {
    	console.log("Delayed");
        var now             = new Date().getTime(),
            _5_sec_from_now = new Date(now + 5*1000);
        var sound = device.platform == 'Android' ? 'file://sound.mp3' : 'file://beep.caf';
        cordova.plugins.notification.local.schedule({
            id:    1,
            title: 'Scheduled with delay',
            text:  'Test Message 1',
            icon:  '',
            at:    _5_sec_from_now,
            sound: sound
        });
    };

    $scope.scheduleMinutely = function () {
        var sound = device.platform == 'Android' ? 'file://sound.mp3' : 'file://beep.caf';
        cordova.plugins.notification.local.schedule({
            id:    1,
            text:  'Scheduled every minute',
            every: 'minute',
            sound: sound
        });
    };

    $scope.isPresent = function () {
        cordova.plugins.notification.local.isPresent(id, function (present) {
            showToast(present ? 'Yes' : 'No');
        });
    };
    $scope.isScheduled = function () {
        cordova.plugins.notification.local.isScheduled(id, function (scheduled) {
            showToast(scheduled ? 'Yes' : 'No');
        });
    };
    $scope.isTriggered = function () {
        cordova.plugins.notification.local.isTriggered(id, function (triggered) {
            showToast(triggered ? 'Yes' : 'No');
        });
    };

	var current_user = Parse.User.current();
	console.log(current_user);
	if (current_user == null | current_user == undefined){
		console.log("Eres null");
		current_user = 1;
		console.log(current_user);
	}

	$scope.user = current_user;

	$scope.logOut = function(){
		Parse.User.logOut();
		facebookConnectPlugin.logout();
	    $state.go('bondzu.catalog');
	}

	$scope.logIn = function(){
	    $state.go('bondzu.loginAccount');
	}
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

.controller('AnimalDetailCtrl', function($scope, $state, $stateParams, $ionicSlideBoxDelegate, $ionicPopup, Catalog, Calendar, $ionicPopup){
	var animalQuery = Catalog.all();
	animalQuery.equalTo('objectId', $stateParams.animalId);
	//LA SIGUIENTE LINEA DE CODIGO ES IMPORTANTE PARA REGRESAR EL OBJECTO QUE APUNTA A id_zoo sin hacer otro query
	animalQuery.include('id_zoo');
	animalQuery.find({
		success: function(result){
			fotoObj    = result[0].get('photo');
			fotoAnimal = fotoObj.url();
			fotoProfileObj = result[0].get('profilePicture');
			fotoAnimalProfile = fotoProfileObj.url();
			idZoo      = result[0].get('id_zoo');
			$scope.$apply(function(){
	            $scope.animal = result;
	            $scope.foto = fotoAnimal;
	            $scope.fotoProfile = fotoAnimalProfile;
	            $scope.zoo = idZoo;
	        });
		},
		error: function(error){
			console.log(error);
		}
	});


	var carersRelation = Catalog.getCarers($stateParams.animalId);
	carersRelation.query().find({
        success: function(carers){
          	$scope.$apply(function(){
	            $scope.carers = carers;
	        });
        },
        error: function(error){
          response.error(error);
        }
    });

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
		var current_user = Parse.User.current();
		if (current_user != null || current_user != undefined){
			//Checar si ya esta adoptado ese animal
			var relation = current_user.relation("adoptions");
			var query = relation.query();
			AnimalObject = Parse.Object.extend("Animal");
			var animal = new AnimalObject();
			animal.id = idAnimal;
			query.equalTo("objectId", idAnimal);
			query.find({
			  success:function(list) {
			  	if (list.length > 0) {
			  		var alertPopup = $ionicPopup.alert({
				     title: 'You already are carer',
				     template: 'You already are carer'
				   });
				   alertPopup.then(function(res) {
				     $state.go('bondzu.adoptions');
				   });
			  	}
			  	else {
			  		var confirmPopup = $ionicPopup.confirm({
				    	title: 'Adopt ' + nameAnimal,
				     	template: 'Are you sure you want to adopt ' + nameAnimal + '?'
				   	});
				   	confirmPopup.then(function(res) {
				    	if(res) {
				    		Catalog.adopt(idAnimal);
				     		console.log("Adopcion");
				       		$state.go('bondzu.adoptions');
				    	} else {
				    		console.log('You are not sure');
				    	}
				   	});
			  	}
			  },
			  error: function(error){
			  	console.log("Error en relation query: " + error)
			  }
			});

			
		}
	   	else{
			var alertPopup = $ionicPopup.alert({
		     title: 'You need a Bondzu Account',
		     template: 'Create my account or login'
		   });
		   alertPopup.then(function(res) {
		     $state.go('bondzu.login');
		   });
	   	}
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

.controller('AdoptionsCtrl', function($scope, Catalog){
	var user = Parse.User.current();
	if (user == null | user == undefined){
    	$scope.adoptions = 0;
	}
	else{
		var fotos = [];
	    var relationAdoptions = Catalog.getAdoptions(user);
		relationAdoptions.query().find({
	    	success: function(resulta) {
				for (var i = 0; i < resulta.length; i++) {
					foto = resulta[i].get('profilePicture');
					fotos.push({
						url: foto.url()
					});
				};
	      		$scope.$apply(function(){
		            $scope.adoptions = resulta;
		            $scope.fotos = fotos;
		        });
	    	}
	  	});
	}
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

.controller('AdoptionDetailCtrl', function($scope, $timeout, $state, $stateParams, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicPopup, Catalog, Calendar, Message){
	//-----------------------------------------------------------------
	var current_user = Parse.User.current();
	if (current_user == null || current_user == undefined) {
		$state.go('bondzu.adoptions');
	};

	$scope.tab = "tab0";
	$scope.data = {};
	$scope.data.currSlide = $ionicSlideBoxDelegate.currentIndex();
	console.log('Current Slide = ' + $scope.data.currSlide);

	$scope.slideChanged = function(slide) {
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

		$ionicScrollDelegate.scrollTop();
		$scope.data.currSlide = $ionicSlideBoxDelegate.currentIndex();
		$timeout( function() {
		  $ionicScrollDelegate.resize();
		}, 50);
	};

	$scope.toSlide = function(slide) {
		$ionicSlideBoxDelegate.slide(slide);
	}

	animalQuery = Catalog.all();
	animalQuery.equalTo('objectId', $stateParams.animalId);
	//LA SIGUIENTE LINEA DE CODIGO ES IMPORTANTE PARA REGRESAR EL OBJECTO QUE APUNTA A id_zoo sin hacer otro query
	animalQuery.include('id_zoo');
	animalQuery.find({
		success: function(result){
			fotoObj    = result[0].get('photo');
			fotoProfileObj    = result[0].get('profilePicture');
			fotoAnimal = fotoObj.url();
			fotoAnimalProfile = fotoProfileObj.url();
			idZoo      = result[0].get('id_zoo');
			$scope.$apply(function(){
	            $scope.adoption = result;
	            $scope.foto = fotoAnimal;
	            $scope.fotoProfile = fotoAnimalProfile;
	            $scope.zoo = idZoo;
	        });
		},
		error: function(error){
			console.log(error);
		}
	});

	var carersRelation = Catalog.getCarers($stateParams.animalId);
	carersRelation.query().find({
        success: function(carers){
          	$scope.$apply(function(){
	            $scope.carers = carers;
	        });
        },
        error: function(error){
          response.error(error);
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

	var options = {
		successCallback: function() {
	  		var alertPopupError = $ionicPopup.alert({
				title: 'Video',
				template: 'Video was closed without error.'
			});
		},
		errorCallback: function(errMsg) {
	  		var alertPopupStreamError = $ionicPopup.alert({
				title: 'Video',
				template: 'Video streaming not available. Try again later'
			});
		}
	}

	$scope.playVideo = function(url) {
		console.log("Llamando video: " + url);
		window.plugins.streamingMedia.playVideo(url, options);
	}

	//Mensajes
	$scope.postMessage = function(message){
		var current_user = Parse.User.current();
		var animal = new AnimalObject();
      	animal.id = $stateParams.animalId;
      	var mensaje = message.message;
      	var newMessage = Message.create(current_user, animal, mensaje);
      	newMessage.save(null, {
      		success: function(result){
      			document.getElementById('mes').value = "";
      			$scope.getMensajes();
      		},
      		error: function(error){
      			console.log("Error: " + error);
      		}
      	});
	}

	$scope.getMensajes = function(){
		var animalX = new AnimalObject();
	    animalX.id = $stateParams.animalId;
		var mensajesQuery = Message.all();
		mensajesQuery.equalTo('id_animal', animalX);
		//LA SIGUIENTE LINEA DE CODIGO ES IMPORTANTE PARA REGRESAR EL OBJECTO QUE APUNTA A id_zoo sin hacer otro query
		mensajesQuery.include('id_user');
		mensajesQuery.find({
			success: function(result){	
				$scope.$apply(function(){
		            $scope.userMessage = result;
		        });
		        $scope.$broadcast('scroll.refreshComplete');
			},
			error: function(error){
				console.log(error);
			},
		});
	}

	$scope.getMensajes();
})

.controller('UserDetailCtrl', function($scope, $stateParams, Users, Catalog){
	var queryUser = Users.get();
	queryUser.get($stateParams.userId, {
        success: function(resusuario){
          	$scope.$apply(function(){
	            $scope.user = resusuario;
	        });
        },
        error: function(object, error) {
          console.dir(error);
        }
    });

	var fotos = [];
	UserObject = Parse.Object.extend("User");
	var user = new UserObject();
	user.id = $stateParams.userId;
    var relationAdoptions = Catalog.getAdoptions(user);
	relationAdoptions.query().find({
    	success: function(resulta) {
			for (var i = 0; i < resulta.length; i++) {
				foto = resulta[i].get('profilePicture');
				fotos.push({
					url: foto.url()
				});
			};
      		$scope.$apply(function(){
	            $scope.adoptions = resulta;
	            $scope.fotos = fotos;
	        });
    	}
  	});
})