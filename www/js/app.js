// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ui.rCalendar'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    
    .state('login', {
      url: "/login",
      templateUrl: "templates/login.html",
      controller: 'LoginCtrl'
    })

    .state('createUser', {
      url: '/createUser',
      templateUrl: 'templates/tab-create-user.html',
      controller: 'CreateUser'
    })

    .state('bondzu', {
      url: "/bondzu",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:
    
    .state('bondzu.catalog', {
      url: '/catalog',
      views: {
        'bondzu-catalog': {
          templateUrl: 'templates/catalog/catalog.html',
          controller: 'CatalogCtrl'
        }
      }
    })

    .state('bondzu.animal-detail', {
      url: '/animal/:animalId',
      views: {
        'bondzu-catalog': {
          templateUrl: 'templates/catalog/animal-detail.html',
          controller: 'AnimalDetailCtrl'
        }
      }
    })

    .state('bondzu.zoo', {
      url: '/zoos',
      views: {
        'bondzu-catalog': {
          templateUrl: 'templates/catalog/zoos.html',
          controller: 'ZoosCtrl'
        }
      }
    })

    .state('bondzu.zoo-detail', {
      url: '/zoo/:zooId',
      views: {
        'bondzu-catalog': {
          templateUrl: 'templates/catalog/zoo-detail.html',
          controller: 'ZooDetailCtrl'
        }
      }
    })

    .state('bondzu.account', {
      url: '/account',
      views: {
        'bondzu-account': {
          templateUrl: 'templates/tab-account.html',
          controller: 'AccountCtrl'
        }
      }
    })

    .state('bondzu.adoptions', {
      url: '/adoptions',
      views: {
        'bondzu-adoptions': {
          templateUrl: 'templates/tab-friends.html',
          controller: 'AdoptionsCtrl'
        }
      }
    })

    .state('bondzu.carer-detail', {
      url: '/carer/:userId',
      views: {
        'bondzu-adoptions': {
          templateUrl: 'templates/user-detail.html',
          controller: 'UserDetailCtrl'
        }
      }
    })

    .state('bondzu.zooCarer-detail', {
      url: '/zoo_carer/:zooId',
      views: {
        'bondzu-adoptions': {
          templateUrl: 'templates/catalog/zoo-detail.html',
          controller: 'ZooDetailCtrl'
        }
      }
    })
    
    .state('bondzu.adoption-detail', {
      url: '/adoption/:animalId',
      views: {
        'bondzu-adoptions': {
          templateUrl: 'templates/friend-detail.html',
          controller: 'AdoptionDetailCtrl'
        }
      }
    })

    .state('bondzu.user-detail', {
      url: '/user/:userId',
      views: {
        'bondzu-catalog': {
          templateUrl: 'templates/user-detail.html',
          controller: 'UserDetailCtrl'
        }
      }
    })

    .state('bondzu.adoption-calendar', {
      url: '/adoption/calendar/:animalId',
      views: {
        'bondzu-adoptions': {
          templateUrl: 'templates/calendar.html',
          controller: 'AdoptionDetailCtrl'
        }
      }
    });

    

  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/bondzu/catalog');
  $urlRouterProvider.otherwise('/login');

});