angular.module('starter.controllers', [])

/**
 * Controlador que inicializa cuando el estado 'bondzu.login (templates/login.html) es rendereado'
 * @class LoginCtrl
 * @param  {Object AngularJS} $scope       Ambito que permite manejar datos en el controlador y la vista
 * @param  {Object AngularJS} $state       Permite cambiar de estado en la aplicación
 * @param  {ionic} $ionicPopup			   Muestra Ionic Popups
 */
.controller('LoginCtrl', ['$scope', '$state', function($scope, $state, $ionicPopup) {
	// Facebook Login
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

    //End Facebook Login
  	
  	/**
  	 * Manda al estado 'bondzu.createUser'
  	 * @method create
  	 */
    $scope.create = function() {
		$state.go('bondzu.createUser');
	}

	/**
	 * Funcion que manda a llamar el inicio de sesión con Facebook
	 * @method loginFB
	 */
    $scope.loginFB = function() {
        console.log('Login Started');
        facebookConnectPlugin.getLoginStatus(fbStatusSuccess, fbStatusError);
    }

    /**
     * Función para iniciar sesion con la API de Parse
     * @method login
     * @param  {array} user Datos del usuario(username y password)
     * @return {string}   	Regresa un string success o error
     */
    $scope.login = function(user){		
		Parse.User.logIn(user.username, user.password, {
			success: function(user){
				console.log("que onda");
				$state.go('bondzu.account');
				console.log("success");
			},
			error: function(error) {
				alert("Error");
				console.log("Error en incio de sesión");
			}
		});
    }
}])

/**
 * Controlador que se carga cuando el estado 'bondzu.createUser' (templates/tab-create-user.html) es rendereado
 * @class CreateUser
 * @param  {Object AngularJS} $scope       Ambito que permite manejar datos en el controlador y la vista
 * @param  {Object} Users        		   Objeto de Users (services.js)
 * @param  {Object AngularJS} $state       Permite cambiar de estado en la aplicación
 * @param  {Object Ionic} $ionicPopup) {
 * $scope.createUser Crea un usuario en Parse
 */
.controller('CreateUser', function($scope, Users, $state, $ionicPopup) {
	/**
	 * Crea un nuevo usuario en Parse con los datos del formulario
	 * @method createUser
	 * @param  {array} user Array de los datos del formulario
	 * @return {null}      No regresa nada
	 */
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

/**
 * Controlador que se carga cuando 'bondzu.account' es rendereado
 * @class AccountCtrl
 * @param  {Object AngularJS} $scope Ambito que permite manejar datos en el controlador y la vista
 * @param  {Object AngularJS} $state Permite cambiar de estado en la aplicación
 * @param  {Object Users} Users Objeto de Users (services.js)) {		var       current_user Usuario logueado en la aplicación actualmente
 * @return {null}        No regresa nada
 */
.controller('AccountCtrl', function($scope, $state, Users) {
	//Usuario logueado actualmente
	var current_user = Parse.User.current();

	if (current_user == null | current_user == undefined){
		console.log("Eres null");
		current_user = 1;
		console.log(current_user);
	}
	//Se manda si esta logueado o no el usuario a la vista para saber que renderear
	$scope.user = current_user;

	/**
	 * Cierra sesión en la aplicación de Bondzu
	 * @method logOut
	 * @return {null} No regresa nada
	 */
	$scope.logOut = function(){
		Parse.User.logOut();
		facebookConnectPlugin.logout();
	    $state.go('bondzu.catalog');
	}

	/**
	 * Manda al estado de Login para que el usuario pueda iniciar sesión
	 * @method logIn
	 * @return {null} No regresa nada
	 */
	$scope.logIn = function(){
	    $state.go('bondzu.loginAccount');
	}
})

/**
 * Controlador que es cargado cuando el estado 'bondzu.catalog' es rendereado
 * @class CatalogCtrl
 * @param  {Object AngularJS} $scope       Ambito que permite manejar datos en el controlador y la vista
 * @param  {Object services.js}            Catalog Objecto de Catalog en services.js 
 * @return {null}                          No regresa nada
 */
.controller('CatalogCtrl', function($scope, Catalog) {
	/**
	 * Funcion que obtiene los animales disponibles en Parse
	 * @method cargaCatalogo
	 * @return {array} Todos los animales en la clase Animals de Parse
	 */
	function cargaCatalogo(){
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
	}

	//Se llama la función para cargar los Animales
	cargaCatalogo();
})

/**
 * Controlador que se carga cuando el estado 'bondzu.animal-detail' es rendereado
 * @class AnimalDetailCtrl
 * @param  {Object AngularJS} $scope                    Ambito que permite manejar datos en el controlador y la vista
 * @param  {Object AngularJS} $state                    Permite cambiar de estado en la aplicación
 * @param  {Object AngularJS} $stateParams              Parametros de estado que recibe el controlador
 * @param  {Object AngualrJS} $ionicSlideBoxDelegate    Permite controlar ionSlideBox (Permite crear pestañas y cambiar horizontalmente entre ellas)
 * @param  {Object Ioni} $ionicPopup               		Permite implementar Popups con Ionic
 * @param  {Object Services.js} Catalog                 Objecto Catalago de services.js
 * @param  {Object Services.js} Calendar                Objecto Calendar de services.js
 * @return {null}                           			No regresa nada
 */
.controller('AnimalDetailCtrl', function($scope, $state, $stateParams, $ionicSlideBoxDelegate, $ionicPopup, Catalog, Calendar){
	/**
	 * Regresa un objeto de la clase Animal con toda su información, incluso objectos de otras clases que están relacionadas con el Animal, por ejemplo Zoo
	 * @method cargaInfoAnimal
	 * @return {Array} Datos del animal
	 */
	function cargaInfoAnimal(){
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
				//Saber si ya adoptaste un animal
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

		//Saber si ya ha sido adoptado un animal
		var current_user = Parse.User.current();
		if (current_user != null || current_user != undefined){
			var relation = current_user.relation("adoptions");
			var query = relation.query();
			query.equalTo("objectId", $stateParams.animalId);
			var adoption = "Hola mundo";
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
			});
		}

		//Recupera la lista de los 'carers' de un Animal
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
	}

	/**
	 * Funcion para ir a un estado de las tabs
	 * @method toSlide
	 * @type {int}
	 */
	$scope.tab = "tab0";
	$scope.toSlide = function(slide) {
		$ionicSlideBoxDelegate.slide(slide);
	}
	/**
	 * Funcion para renderear el 'tab' correcto
	 * @method slideHasChanged
	 * @param  {int} slide Int para saber el estado de cada tab
	 * @return {null}       No regresa nada
	 */
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
		}/*
		if (slide == 4) {
			$scope.tab = "tab4";
		}*/
	}
	
	/**
	 * Permite adoptar a un animal
	 * @method adopt
	 * @param  {string} nameAnimal Nombre del animal
	 * @param  {int} idAnimal   id del Animal a adoptar
	 * @return {null}            No regresa nada
	 */
	$scope.adopt = function(nameAnimal, idAnimal) {
		/**
		 * Suscribe notificaciones locales al usuario para avisarle eventos de su nuevo animal adoptado
		 * @method pushNotifications
		 * @param  {array}   calendar Objeto de la clase Calendario en Parse
		 * @param  {Function} callback addNotificacions
		 * @return {null}            No regresa nada
		 */
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
		/**
		 * Una vez agregadas las notificaciones se procede a ir al catálogo de animales
		 * @method addNotifications
		 */
		function addNotifications(){
			$state.go('bondzu.catalog');
		}

		/**
		 * Obtiene los eventos del animal adoptado para luego agendar las notificaciones
		 * @method agendarNotificaciones
		 * @return {array} Objeto de la clase Calendario de Parse
		 */
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

		//Código para hacer la adopción
		var current_user = Parse.User.current();
		//Checar si ya esta adoptado ese animal
		if (current_user != null || current_user != undefined){
			var relation = current_user.relation("adoptions");
			var query = relation.query();
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

    /**
     * Manda la estado de 'bondzu.animal-adoption' (Muestra el certificado)
     * @method certificado
     * @param  {int} id Id del animal a adoptar
     * @return {null}    No regresa nada
     */
    $scope.certificado = function(id){
    	$state.go('bondzu.animal-adoption', { animalId: id });
    }

    cargaInfoAnimal();
    createRandomEvents();
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

/**
 * Controlador que se carga cuando 'bondzu-adoptions' se renderea, se encarga de obtener la lista de los animales adoptados por un usuario
 * @class AdoptionsCtrl
 * @param  {Object AngularJS} $scope     Ambito que permite manejar datos en el controlador y la vista
 * @param  {Object Services.js Catalog} Catalog    Objeto Catalog de services.js
 * @param  {Object Services.js Zoo} Zoo Objecto
 * @return {null}            No retorna nada
 */
.controller('AdoptionsCtrl', function($scope, Catalog, Zoo){
	//Checa si exite un usuario conectado
	var user = Parse.User.current();
	if (user == null | user == undefined){
    	$scope.adoptions = 0;
	}
	//Si esta conectado procede a sacar la lista de animales en adopción
	else{
		var fotos = [];
		var ids_zoo = [];
	    var relationAdoptions = Catalog.getAdoptions(user);
	    relationAdoptions.add('id_zoo');
	    relationAdoptions.query().find({
	    	success: function(resulta) {
				for (var i = 0; i < resulta.length; i++) {
					id_zoo = resulta[i].get('id_zoo').id;
					ids_zoo.push({
						id: id_zoo
					});
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

	/**
	 * Función que se encarga de reproducir el video en vivo
	 * @method playVideo
	 * @param  {url} url Recibe la url correspondiente a cada animal
	 * @return {null}     No regresa nada
	 */
	$scope.playVideo = function(url) {
		window.plugins.streamingMedia.playVideo(url, options);
	}
})

.controller('ZoosCtrl', function($scope, Zoo){
	//Zoo.all();
})

/**
 * Controlador que se carga cuando 'bondzu.zoo' es rendereado, se encarga de cargar los datos de un Zoo
 * @class ZooDetailCtrl
 * @param  {Object AngularJS} $scope       Ambito que permite manejar datos en el controlador y la vista
 * @param  {Object AngularJS} $state       Permite cambiar de estado en la aplicación
 * @param  {Object AngularJS} $stateParams Parametros de estado que recibe el controlador
 * @param  {Object Services.js Zoo} 		Objeto Zoo de services.js
 * @return {null}              No regresa nada
 */
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

/**
 * Controlador que se carga cuando 'bondzu.adoption-detail' es rendereado, se encarga de cargar los datos de un animal adoptado por un usuario
 * @param  {Object AngularJS} $scope                 Ambito que permite manejar datos en el controlador y la vista
 * @param  {Object AngularJS} $timeout               Permite configurar timeout
 * @param  {Object AngularJS} $state                 Permite cambiar de estado en la aplicación
 * @param  {Object AngularJS} $stateParams           Parametros de estado que recibe el controlador
 * @param  {Object Ionic} $ionicSlideBoxDelegate 	 Permite hacer slide en las paginas de translación
 * @param  {Object Ionic} $ionicScrollDelegate       Permite hacer paginas de translacion
 * @param  {Object Ionic} $ionicModal            	 Modal dentro de la aplicación
 * @param  {Object Ionic} $ionicPopup            	 Popup en la aplicación
 * @param  {Object Services.js Catalog} Catalog      Objeto Catalog de services.js
 * @param  {Object Services.js Calendar} Calendar    Objeto Calendar de services.js
 * @param  {Object Services.js Message} Message		 Objeto Message de services.js
 * @return {null}                        No retorna nada
 */
.controller('AdoptionDetailCtrl', function($scope, $timeout, $state, $stateParams, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicModal, $ionicPopup, Catalog, Calendar, Message){
	//-----------------------------------------------------------------
	var current_user = Parse.User.current();
	if (current_user == null || current_user == undefined) {
		$state.go('bondzu.adoptions');
	};

	$scope.tab = "tab0";
	$scope.data = {};
	$scope.data.currSlide = $ionicSlideBoxDelegate.currentIndex();
	//console.log('Current Slide = ' + $scope.data.currSlide);

	/**
	 * Funcion que se encarga de renderear en la vista el estado de la tab adecuado para cada caso
	 * @method slideChanged
	 * @param  {int} slide Estado de la tab
	 * @return {int}       Retorna estado actualizado
	 */
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

	/**
	 * Se encarga de dirigir a un estado de tab en la vista
	 * @method toSlide
	 * @param  {int} slide Estado de la tab a la que se desea ir
	 * @return {null}       No retorna nada
	 */
	$scope.toSlide = function(slide) {
		$ionicSlideBoxDelegate.slide(slide);
	}

	$ionicModal.fromTemplateUrl('my-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	})

	/**
	 * Funcion cuando el boton openModal es llamado, se encarga de abrir el Modal
	 * @method openModal
	 * @return {null} No retorna nada
	 */
	$scope.openModal = function() {
		$scope.modal.show()
	}

	/**
	 * Funcion para cerrar el modal
	 * @method closeModal
	 * @return {null} No retorna nada
	 */
	$scope.closeModal = function() {
		$scope.modal.hide();
	};


	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});

	/**
	 * Funcion que se encarga de descargar una imagen de la galería de cada animal
	 * @method download
	 * @return {null} No retorna nada
	 */
	$scope.download = function(){
		console.log("Entrando a descarga");
		var url = 'http://i.forbesimg.com/media/lists/people/kobe-bryant_416x416.jpg';
	    var filePath = cordova.file.externalRootDirectory + "testImage.png";
	    var fileTransfer = new FileTransfer();
	    var uri = encodeURI(url);

	    fileTransfer.download(
	        uri,
	        filePath,
	        function(entry) {
	            alert("download complete: " + entry.fullPath);
	        },
	        function(error) {
	            alert("download error source " + error.source);
	            alert("download error target " + error.target);
	            alert("upload error code" + error.code);
	        },
	        false,
	        {
	            headers: {
	                "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
	            }
	        }
	    );
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
    	//console.log("Entrando a crear calendario");
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

	/**
	 * Función que se encarga de reproducir el video en vivo
	 * @method playVideo
	 * @param  {url} url Recibe la url correspondiente a cada animal
	 * @return {null}     No regresa nada
	 */
	$scope.playVideo = function(url) {
		console.log("Llamando video: " + url);
		window.plugins.streamingMedia.playVideo(url, options);
	}

	/**
	 * Funcion que se encarga de guadar un mensaje posteado por un usuario en el área de Foro de cada adopción
	 * @method postMessage
	 * @param  {string} message Mensaje que se guardará
	 * @return {string}         Regresa el mensaje y lo renderea en la vista para actualizar el foro
	 */
	$scope.postMessage = function(message){
		var mensaje = message.message;
		var animal = new AnimalObject();
		var current_user = Parse.User.current();
      	animal.id = $stateParams.animalId;
      	var newMessage = Message.create(current_user, animal, mensaje);
      	newMessage.save(null, {
      		success: function(result){
      			$scope.getMensajes();
      			document.getElementById('mes').value = "";
      		},
      		error: function(error){
      			console.dir("Error: " + error);
      		}
      	});
	}

	/**
	 * Función que se encarga de obtener los mensajes del foro de un animal adoptado
	 * @method getMensajes
	 * @return {array} Retorna un objecto parse con todos los mensajes correspondientes a un animal
	 */
	$scope.getMensajes = function(){
		console.log("Entrando get messages");
		var animalX = new AnimalObject();
	    animalX.id = $stateParams.animalId;
		var mensajesQuery = Message.all();
		mensajesQuery.equalTo('id_animal', animalX);
		//LA SIGUIENTE LINEA DE CODIGO ES IMPORTANTE PARA REGRESAR EL OBJECTO QUE APUNTA A id_zoo sin hacer otro query
		mensajesQuery.include('id_user');
		mensajesQuery.ascending("createdAt");
		mensajesQuery.find({
			success: function(result){	
				for (var i = result.length - 1; i >= 0; i--) {
					console.log(result[i].get('message'));
				}
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

/**
 * Controlador que se carga cuando 'bondzu.user-detail' es rendereado, se encarga de obtener la información de un Usuario
 * @class UserDetailCtrl
 * @param  {Object AngularJS} $scope         Ambito que permite manejar datos en el controlador y la vista
 * @param  {Obejct AngularJS} $stateParams   Parametros de estado que recibe el controlador
 * @param  {Object Services.js Users} Users          Objecto Users en servicies.js
 * @param  {Object Services.js Catalog} CatalogObjecto Catalog en services.js
 * @return {Array}                Regresa un objecto de la clase Usuario de Parse
 */
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