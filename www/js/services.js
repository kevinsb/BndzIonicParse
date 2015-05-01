angular.module('starter.services', [])
/**
 * Factoría para Catalogo
 * @class Catalog
 */
.factory('Catalog', function(){
  //Se crean los objectos de Parse que van a ser utilizados en la factoria Catalog
  AnimalObject = Parse.Object.extend("Animal");
  ZooObject = Parse.Object.extend("Zoo");
  UserObject = Parse.Object.extend("User");
  return {
    /**
     * Crea un query para retornar todas tuplas del catalogo
     * @method all
     * @return {Parse Object} Retorna el query para ser ejecutado en controllers.js
     */
    all: function (){
      var query = new Parse.Query(AnimalObject);
      return query;
    },
    /**
     * Crea un query para retornar la información de un animal del catálogo
     * @method get
     * @param  {integer} animalId Id del animal
     * @return {Parse Object}          Retorna query para ser ejecutado en controllers.js
     */
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
    /**
     * Funcion que permite que un usuario adopte a un animal (Hace una relacion entre dos objetos de Parse [User-Animal])
     * @method adopt
     * @param  {integer} animalId Id del animal
     * @return {null}          No retorna nada
     */
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
              $state.go('bondzu.adoptions');
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
    /**
     * Funcion que obtiene todas las adopciones de un usuario
     * @method getAdoptions
     * @param  {Parse Object} user Recibe el usuario conectado actualmente
     * @return {Parse Object}      Retorna la relacion User-Animals
     */
    getAdoptions: function(user){
      var relation = user.relation("adoptions");
      return relation;
    },
    /**
     * Obtiene los adoptadores de un animal
     * @method getCarers
     * @param  {integer} animalId Id del animal
     * @return {Parse Object}          Retorna la relacion Animal-Users
     */
    getCarers: function(animalId){
      var animal = new AnimalObject();
      animal.id = animalId;
      var relation = animal.relation("carer");
      return relation;
    }
  }
})

/**
 * Factoria para Usuario
 * @class Users
 */
.factory('Users', function(){
  //Objectos de Parse utilizados en esta factoría
  UserObject = Parse.Object.extend("User");
  //Funciones para la factoría
  return {
    /**
     * Función que se encarga de crear un nuevo usuario en Parse
     * @method create
     * @param  {Array} user Datos obtenidos del form en la vista
     * @return {User Object}      Regresa el usuario creado en la función
     */
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
    /**
     * Funcion que se encarga de actualizar los datos de un Usuario
     * @method update
     * @param  {User Object} user El usuario que será actualizado
     * @return {User Object}      Retorna el usuario actualizado
     */
    update: function(user){
      var usuario = new UserObject();
    },
    /**
     * Retorna el usuario que está conectado en la app
     * @method getCurrentUser
     * @return {User Object} El usuario conectado
     */
    getCurrentUser: function(){
      var current_user = Parse.User.current();
      return current_user;
    }
  }
})
/**
 * Factoría para Zoo
 * @class Zoo
 */
.factory('Zoo', function(){
  //Objetos de Parse utilizados en ésta factoría
  ZooObject = Parse.Object.extend("Zoo");
  //Funciones para la factoría
  return {
    /**
     * Función que obtiene todos los Zoos de Parse
     * @method all
     * @return {Parse Object} Retorna el query para ser ejecutado en controllers.js
     */
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
    /**
     * Función que prepara el query que obtendrá la información de un Zoo en específico
     * @method getZoo
     * @param  {integer} idZoo id del Zoo
     * @return {Parse Object}       Retorna el query que será ejecutado en controllers.js
     */
    getZoo: function(idZoo){
      var query = new Parse.Query(ZooObject);
      query.equalTo("objectId", idZoo);
      return query;
    }
  }
})

/**
 * Factoría para Calendar
 * @class Calendar
 */
.factory('Calendar', function(){
  //Objetos de Parse utilizados en ésta factoría
  CalendarObject = Parse.Object.extend("Calendar");
  AnimalObject = Parse.Object.extend("Animal");
  //Funciones de la factoría
  return {
    /**
     * Funcion que prepara el query que obtendrá todos los eventos del calendario para un animal
     * @method get
     * @param  {integer} animalId id del Animal
     * @return {Parse Object}          Retorna query que se ejecutará en controllers.js
     */
    get: function (animalId){
      var animal = new AnimalObject();
      animal.id = animalId;
      var query = new Parse.Query(CalendarObject);
      query.equalTo("id_animal", animal);
      return query;
    }
  }
})

/**
 * Factoría para Message
 * @class Message
 */
.factory('Message', function(){
  //Objectos de Parse utilizados en ésta factoría
  MessageObject = Parse.Object.extend("Messages");
  //Funciones de la factoría
  return {
    /**
     * Funcion que crea un nuevo mensaje en el foro de un animal
     * @method create
     * @param  {integer} user    id del Usuario que postea el mensaje
     * @param  {integer} animal  id del Animal (Identifica el foro del animal)
     * @param  {string} mensaje Mensaje que será posteado
     * @return {Parse Object}         Retorna el mensaje creado para ser rendereado inmediatamente
     */
    create: function (user, animal, mensaje){
      var message = new MessageObject();
      message.set('id_user', user);
      message.set('id_animal', animal);
      message.set('message', mensaje);
      return message;
    },
    /**
     * Función que prepara el query que regresará todos los mensajes del foro de un animal
     * @method all
     * @return {Parse Object} Rertorna query que se ejecutará en controllers.js
     */
    all: function (){
      var query = new Parse.Query(MessageObject);
      return query;
    }
  }
})