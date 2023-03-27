const Bcrypt = sails.config.constants.Bcrypt;

module.exports = {
  friendlyName: "Compare password",

  description: "Compares the password from database and from input for User",

  inputs: {
    inputPassword: {
      type: "string",
      required: true,
    },
    databasePassword: {
      type: "string",
      required: true,
    },
  },

  exits: {
    success: {
      result: false,
    },
  },

  fn: async function (inputs, exits) {
    try {
      Bcrypt.compare(
        inputs.inputPassword,
        inputs.databasePassword,
        (err, result) => {
          if (err) {
            return exits.success(result);
          } else {
            return exits.success(result);
          }
        }
      );
    } catch (error) {
      return exits.success(false);
    }
  },
};
