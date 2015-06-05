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
				$state.go('bondzu.account');
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

.controller('AccountCtrl', function($scope, $ionicLoading, $state, $cordovaLocalNotification, Users) {
	$ionicLoading.show({
		content: 'Loading',
		animation: 'fade-in',
		showBackdrop: true,
		maxWidth: 200,
		showDelay: 0
	});

	var current_user = Parse.User.current();
	//console.log(current_user);
	if (current_user == null | current_user == undefined){
		current_user = 1;
		$ionicLoading.hide();
		$scope.user = current_user;
	}
	else{
		$ionicLoading.hide();
		$scope.user = current_user;
	}
	
	$scope.logOut = function(){
		function logoutBondzu(){
			$state.go('bondzu.catalog');
			Parse.User.logOut();
			facebookConnectPlugin.logout();
		}

		logoutBondzu();
	}

	$scope.logIn = function(){
	    $state.go('bondzu.loginAccount');
	}
})

.controller('CatalogCtrl', function($scope, $ionicLoading, Catalog) {
	/*
	if (PushbotsPlugin.isAndroid()) {
		alert("Es android");
        PushbotsPlugin.initializeAndroid('556bd7cb177959716d8b4567', '145091056519');
    } else if (PushbotsPlugin.isiOS()) {
        PushbotsPlugin.initializeiOS('556bd7cb177959716d8b4567');
    }*/

    // Setup the loader


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
		$ionicLoading.hide();
		$scope.$apply(function(){
            $scope.animals = result;
            $scope.fotos = fotos;
        });
	}, function(err){
		console.log("Error: " + err);
	});
})

.controller('AnimalDetailCtrl', function($scope, $ionicLoading, $state, $stateParams, $ionicSlideBoxDelegate, $cordovaLocalNotification, $ionicPopup, Catalog, Calendar, $ionicPopup){

	$ionicLoading.show({
		content: 'Loading',
		animation: 'fade-in',
		showBackdrop: true,
		maxWidth: 200,
		showDelay: 0
	});

	function infoAnimal(){
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
				$ionicLoading.hide();
				$scope.$apply(function(){
		            $scope.animal = result;
		            $scope.foto = fotoAnimal;
		            $scope.fotoProfile = fotoAnimalProfile;
		            $scope.zoo = idZoo;
		            $scope.adopted = adoption;
		        });
			},
			error: function(error){
				console.log(error);
			}
		});
	}

	//Saber si ya ha sido adoptado un animal
	function saberAdoptado(){
		var current_user = Parse.User.current();
		if (current_user != null || current_user != undefined){
			var relation = current_user.relation("adoptions");
			var query = relation.query();
			query.equalTo("objectId", $stateParams.animalId);
			query.find({
				success:function(list) {
				  	if (list.length > 0) {
				    	$scope.adopted = 1;
				  	}
				  	else {
				    	$scope.adopted = 0;
				  	}
				  },
				  error: function(error){
				  	console.log("Error en ver si ya eres adoptador: " + error)
				  }
			}).then(function(){infoAnimal();}, function(){console.log('Error saber adoptado');});
		}
		else{
			$scope.adopted = 3;
			infoAnimal();
		}
	}

	$scope.login = function(){
		$state.go('bondzu.account');
	}

	saberAdoptado();


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
		//Local Notifications
		function pushNotifications(calendar, callback){
			for (var i = 0; i < calendar.length; i++) {
    			var titulo = calendar[i].get('title');
    			var description = calendar[i].get('description');
    			var date = calendar[i].get('start_date');
    			console.log("Fecha: " + date);
    			var now             = new Date().getTime(),
	            _5_sec_from_now = new Date(now + 20*1000);
	            console.log("Fecha de 5 sec: " + _5_sec_from_now);
    			var ids = i+1;
    			var notificaciones = [];
		        var sound = device.platform == 'Android' ? 'file://sound.mp3' : 'file://beep.caf';
    			cordova.plugins.notification.local.schedule({
    				id:    ids,
		            title: titulo,
		            text:  description,
		            at:    date,
		            sound: sound
    			});
    		}
    		callback();
		}

		function addNotifications(){
			$state.go('bondzu.catalog');
		}

		function agendarNotificaciones(){
			var sound = device.platform == 'Android' ? 'file://sound.mp3' : 'file://beep.caf';
			var calendarQuery = Calendar.get(idAnimal);
			calendarQuery.find({
		        success: function(calendar){
	        		pushNotifications(calendar, addNotifications);
		        },
		        error: function(error){
		        	console.log(error);
		        	alert("Error en agendarNotificaciones");
		    	}
		    });
		}

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
				    		//Aqui se procede a hacer las notificaciones
				    		agendarNotificaciones();
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

    $scope.certificado = function(id){
    	$state.go('bondzu.animal-adoption', { animalId: id });
    }
})

.controller('AnimalAdoptionCtrl', function($scope, $state, $stateParams, $ionicPopup, Catalog, Calendar){
	console.log($stateParams.animalId);
	$scope.adopt = function() {
		//Código para hacer la adopción
		var current_user = Parse.User.current();
		//Checar si ya esta adoptado ese animal
		if (current_user != null || current_user != undefined){
			var relation = current_user.relation("adoptions");
			var query = relation.query();
			query.equalTo("objectId", $stateParams.animalId);
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
				    	title: 'Adopt ',
				     	template: 'Are you sure you want to adopt?'
				   	});
				   	confirmPopup.then(function(res) {
				    	if(res) {
				    		Catalog.adopt($stateParams.animalId);
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
		//Si no esta logueado el usuario propone iniciar sesión o crear una cuenta en Bondzu
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
})

.controller('AdoptionsCtrl', function($scope, $ionicLoading, $state, $window, Catalog){
	var options = {
		successCallback: function() {
			console.log("Video exitoso");
		},
		errorCallback: function(errMsg) {
	  		var alertPopupStreamError = $ionicPopup.alert({
				title: 'Video',
				template: 'Video streaming not available. Try again later'
			});
		}
	}

	$scope.prueba = function(id){
		$state.go('bondzu.adoption-detail', { animalId: id });
	}

	var videostatus = false;
	var evento;

	$window.onYouTubeIframeAPIReady = function() {
		console.log("YouTube API Loaded");
	};

	$scope.playVideo = function(id){
		document.getElementById("contenido").innerHTML = '';
		document.getElementById("contenido").innerHTML = '<div id="player"></div>';
		buildYoutube(id);

		function onPlayerReady(event) {
			videostatus = true;
			console.log(videostatus);
			evento = event;
		}

		function onPlayerStateChange(event) {
			console.log("Pare");
		}

		function buildYoutube(id){
			$scope.player = new YT.Player('player', {
				height: '340',
				width: '100%',
				videoId: id,
				playerVars: {
					controls: '1', // don't show video controls in the player
					showinfo: '0',
					modestbranding: '1', // minimal branding
					rel: '0', // don't show related videos when the video ends
					theme: 'light', // light or dark theme
					origin: 'http://localhost:8100',
					iv_load_policy: '3', // don't show video annotations by default
					enablejsapi: '1',
					playsinline: 0
				},
				events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				},
			});
		}
	}


	var user = Parse.User.current();
	if (user == null | user == undefined){
    	$scope.adoptions = 0;
	}
	else{
		$ionicLoading.show({
			content: 'Loading',
			animation: 'fade-in',
			showBackdrop: true,
			maxWidth: 200,
			showDelay: 0
		});
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
				$ionicLoading.hide();
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

.controller('ZooDetailCtrl', function($scope, $ionicLoading, $state, $stateParams, Zoo){
	$ionicLoading.show({
		content: 'Loading',
		animation: 'fade-in',
		showBackdrop: true,
		maxWidth: 200,
		showDelay: 0
	});
	var queryZoo = Zoo.getZoo($stateParams.zooId);
	queryZoo.find({
		success: function(result){
			$ionicLoading.hide();
			$scope.$apply(function(){
	            $scope.zoo = result;
	        });
		},
		error: function(error){
			console.log("Error: " + error);
		}
	});
})

.controller('AdoptionDetailCtrl', function($scope, $ionicLoading, $timeout, $state, $stateParams, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicModal, $ionicPopup, Catalog, Calendar, Message, Camera){
	//-----------------------------------------------------------------
	$ionicLoading.show({
		content: 'Loading',
		animation: 'fade-in',
		showBackdrop: true,
		maxWidth: 200,
		showDelay: 0
	});

	var current_user = Parse.User.current();
	if (current_user == null || current_user == undefined) {
		$state.go('bondzu.adoptions');
	};

	var tipo_usuario = current_user.get('type');
	$scope.userType = tipo_usuario;

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
			$ionicLoading.hide();
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


	camerasQuery = Camera.getByAnimal($stateParams.animalId);
	camerasQuery.find({
		success: function(cameras){
			console.log(cameras);
			$scope.$apply(function(){
				$scope.camerasSize = cameras.length;
	            $scope.cameras = cameras;
	        });
		},
		error: function(error){
			console.log("Cameras: " + error);
		}
	});

	if (tipo_usuario == 1) {
		camerasAdminQuery = Camera.getAdminCameras($stateParams.animalId);
		camerasAdminQuery.find({
			success: function(camerasAdmin){
				console.log('Cameras admin ' + camerasAdmin);
				$scope.$apply(function(){
					$scope.camerasAdminSize = camerasAdmin.length;
		            $scope.camerasAdmin = camerasAdmin;
		        });
			},
			error: function(error){
				console.log("Cameras: " + error);
			}
		});
	}

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
    	console.log("Entrando a crear calendario");
    	var calendarQuery = Calendar.get($stateParams.animalId);
		calendarQuery.find({
	        success: function(calendar){
	        	$scope.$apply(function(){
	        		var events = [];
	        		for (var i = 0; i < calendar.length; i++) {
	        			console.log("Calendario 1: " + new Date(Date.UTC(2015, 2, 19)));
	        			console.log("Calendario 2: " + calendar[i].get('start_date'));
	        			console.log("Calendario 2: " + calendar[i].get('end_date'));
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
			console.log("Video exitoso");
		},
		errorCallback: function(errMsg) {
	  		var alertPopupStreamError = $ionicPopup.alert({
				title: 'Video',
				template: 'Video streaming not available. Try again later'
			});
		}
	}

	$scope.playVideo = function(url) {
		console.log(url);
		window.plugins.streamingMedia.playVideo(url, options);
	}

	$ionicModal.fromTemplateUrl('video.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	})

	$scope.openModal = function() {
		$scope.modal.show()
	}

	$scope.closeModal = function() {
		$scope.modal.hide();
	};

	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});

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
		mensajesQuery.ascending('createdAt');
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