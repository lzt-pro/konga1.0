/**
 * MarketRequests.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  schema: true,
  migrate: 'safe',
  autoPK : false,
  tableName:'market_requests',
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
    kind:{
      type:'string',
      required:false
    },
    null:{
      type:'boolean',
      required:false
    },
    msg:{
      type:'string',
      required:false
    },
    times:{
      type:'integer',
      required:false
    },
    fk_route_id:{
      model:'marketroutes'
    }
  },

  /*beforeCreate: function (valuesToSet, proceed) {
    valuesToSet.id = uuid.v4();
    return proceed();
  }*/
};

