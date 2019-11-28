/**
 * MarketApply.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  schema: true,
  migrate: 'safe',
  autoPK : false,
  tableName:'market_apply',
  primaryKey:'id',
  attributes: {
    id:{
      primaryKey: true,
      unique: true,
      type:'string',
      required: true,
    },
    msg:{
      type:"string",
      required: false
    },
    state:{
      type:"integer",
      required: true
    },
    fk_user_id:{
      model:"marketuser"
    },
    fk_pack_id: {
      model: "marketpackage"
    }
  },
};

