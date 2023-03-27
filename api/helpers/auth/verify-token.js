const { JWT } = sails.config.constants;
module.exports = {
  friendlyName: "Verify token",

  description: "to verify and decode the token",

  inputs: {
    token: {
      type: "string",
    },
  },

  exits: {
    success: {
      decode: "false",
    },
  },
  fn: async function (inputs, exits) {
    try {
      //decode token
      const decode = await JWT.verify(inputs.token, process.env.JWT_SECRET);

      if (decode) {
        return exits.success(decode);
      } else {
        return exits.success(false);
      }
    } catch (error) {
      //return error
      return exits.success(false);
    }
  },
};
