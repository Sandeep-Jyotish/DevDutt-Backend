module.exports = {


  friendlyName: 'Cron test',


  description: '',


  inputs: {
    data: {
      type: "json"
    }

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exists) {
    // let name = inputs.data.name;
    
    console.log("name");
    // sails.hooks.cron.jobs.myJob.stop();
    
  }


};

