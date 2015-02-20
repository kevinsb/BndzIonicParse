angular.module('starter.services', [])

.factory('Catalog', function(){
  AnimalObject = Parse.Object.extend("Animal");
  ZooObject = Parse.Object.extend("Zoo");
  UserObject = Parse.Object.extend("User");
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
    },
    adopt: function(animalId){
      var user = Parse.User.current();
      console.log(user);
      var relation = user.relation("adoptions");

      var animal = new AnimalObject();
      animal.id = animalId;

      relation.add(animal);
      user.save(null, {
        success: function(result){
          console.log("Se salvo relacion Adoptions");
          var relationAnimal = animal.relation("carer");
          relationAnimal.add(user);
          animal.save(null, {
            success: function(result){
              console.log('Se salvo relacion Carer');
            },
            error: function(error){
              console.log("Error en Carer: " + error);
            }
          })
        },
        error: function(error){
          console.dir("Error en Adoption: " + error);
        }
      });
    },
    getAdoptions: function(){
      var user = Parse.User.current();
      var relation = user.relation("adoptions");
      return relation;
    },
    getCarers: function(animalId){
      var animal = new AnimalObject();
      animal.id = animalId;
      var relation = animal.relation("carer");
      return relation;
    }
  }
})

.factory('Users', function(){
  UserObject = Parse.Object.extend("User");
  return {
    create: function(user){
      var usuario = new Parse.User();
      usuario.set('username', user.username)
      usuario.set('name', user.nombre);
      usuario.set('lastname', user.apellido);
      usuario.set('email', user.email);
      usuario.set('password', user.password);

      return usuario;
    },
    get: function(){
      var query = new Parse.Query(UserObject);
      return query;
    },

    update: function(user){
      var usuario = new UserObject();
      usuario.set
    },
    getCurrentUser: function(){
      var current_user = Parse.User.current();
      return current_user;
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
    },
    getZoo: function(idZoo){
      console.log(idZoo);
      var query = new Parse.Query(ZooObject);
      query.equalTo("objectId", idZoo);
      return query;
    }
  }
})

.factory('Calendar', function(){
  CalendarObject = Parse.Object.extend("Calendar");
  AnimalObject = Parse.Object.extend("Animal");
  return {
    get: function (animalId){
      var animal = new AnimalObject();
      animal.id = animalId;
      var query = new Parse.Query(CalendarObject);
      query.equalTo("id_animal", animal);
      return query;
    }
  }
})

.factory('Device', function(){
  DeviceObject = Parse.Object.extend("Device");
  return {
    create: function (user, deviceId, platform){
      var device = new DeviceObject();
      device.set('id_user', user);
      device.set('reg_id', deviceId);
      device.set('platform', platform);
      return device;
    }
  }
})

.factory('Message', function(){
  MessageObject = Parse.Object.extend("Messages");
  return {
    create: function (user, animal, mensaje){
      var message = new MessageObject();
      message.set('id_user', user);
      message.set('id_animal', animal);
      message.set('message', mensaje);
      return message;
    },
    all: function (){
      var query = new Parse.Query(MessageObject);
      return query;
    }
  }
})