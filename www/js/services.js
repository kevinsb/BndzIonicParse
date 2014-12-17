angular.module('starter.services', [])

.factory('Friends', function() {

  // Some fake testing data
  var friends = [
    { id: 0, name: 'Scruff McGruff' },
    { id: 1, name: 'G.I. Joe' },
    { id: 2, name: 'Miss Frizzle' },
    { id: 3, name: 'Ash Ketchum' }
  ];

  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
})

.factory('Catalog', function(){

  AnimalObject = Parse.Object.extend("Animal");
  return {
    all: function (){
      var query = new Parse.Query(AnimalObject);
      return query;
    },
    get: function(animalId){
      console.log(animalId);
      var query = new Parse.Query(AnimalObject);
      query.equalTo("objectId", animalId);
      return query.find({
        success: function(result){
          return result;
        },
        error: function(error){
          return error;
        }
      });
      return result;
    }
  }
})

.factory('Users', function(){
  UserObject = Parse.Object.extend("User");
  return {
    create: function(user){
      var usuario = new UserObject();
      usuario.set('username', user.username)
      usuario.set('name', user.nombre);
      usuario.set('lastname', user.apellido);
      usuario.set('email', user.email);
      usuario.set('password', user.password);

      usuario.save(null, {
        success:function(object) {
          alert("Nuevo usuario agregado");
        }, 
        error:function(object, error) {
          console.dir(error);
          alert("No se pudo guardar el usuario, intente de nuevo");
        }
      });
    },

    get: function(userId){
      var usuario = new UserObject();
      var query = new Parse.Query(usuario);
      
      query.get(userId, {
        success: function(resusuario){
          console.log(resusuario);
        },
        error: function(object, error) {
          console.dir(error);
          alert("No se pudo guardar el usuario, intente de nuevo");
        }
      });
    },

    update: function(user){
      var usuario = new UserObject();
      usuario.set
    }
  }
})

.factory('Zoo', function(){
  ZooObject = Parse.Object.extend("Zoo");
  return {
    all: function (){
      var query = new Parse.Query(ZooObject);
      query.find({
        success: function(results){
          for (var i = 0; i < results.length; i++) {
          }
        },
        error: function(object, error){
          alert(error);
        }
      });
    }
  }
})