module.exports = {


  friendlyName: 'Market route',


  description: '对Route的相关操作',


  inputs: {
    id:{
      type:'string',
      required:true,
      description:'该Route的ID'
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    // TODO
  }


};

