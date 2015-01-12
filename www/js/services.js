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
      var succ;
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
          succ = true;
        },
        error: function(error){
          console.log("Error en Adoption: " + error);
          succ = false;
        }
      });
      console.log(succ);
    },
    getCUser: function(){
      var query = new Parse.Query(UserObject);
      query.equalTo("objectId", 'fFEmuvHlvu');
      return query;
    },
    getAdoptions: function(){
      var user = Parse.User.current();
      var relation = user.relation("adoptions");
      return relation;
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