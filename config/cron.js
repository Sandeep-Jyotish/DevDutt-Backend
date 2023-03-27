module.exports.cron = {
    myJob: {
      schedule: '*/10 * * * * *',
      onTick: async function(req, res) {
        let name = "Sandeep"
        await sails.helpers.cronTest();
        
      },
      start: false
    }
  };