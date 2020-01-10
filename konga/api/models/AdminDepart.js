/**
 * AdminDepart.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  schema: true,
  migrate: 'safe',
  autoPK : false,
  tableName:'admin_depart',
  attributes: {
    id:{
      primaryKey: true,
      autoIncrement:true,
      type:'string',
      required:true
    },
    name:{
      type: 'string',
      required: false
    },
    admins:{
      collection : 'adminuser',
      via: 'fk_depart_id',
    },
  },

};

