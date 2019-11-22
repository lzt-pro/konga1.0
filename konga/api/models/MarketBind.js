/**
 * MarketBind.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  schema: true,
  migrate: 'alter',
  autoPK : false,
  tableName:'market_bind',
  attributes: {

    consumerId:{
      type:'string',
      required: true,
    },
    routeId:{
      type:'string',
      required: true,
    },
    serviceId:{
      type:'string',
      required: true,
    },
    // serviceName:{
    //   type:'string',
    //   required: true,
    // },
    routeHost:{
      type:'string',
      required: true,
    },
    routeName:{
      type:'string',
      required: true,
    }
  }
};

