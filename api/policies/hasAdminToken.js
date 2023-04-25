const ResponseCodes = sails.config.constants.ResponseCodes;

module.exports = async function (req, res, proceed) {
  try {
    sails.log.debug("hasUserToken policy called...");

    // Getting authToken from the header
    let authToken = req.headers["authorization"];

    if (authToken && authToken.startsWith("Bearer ")) {
      authToken = authToken.substring(7, authToken.length);
    } else {
      return res.status(ResponseCodes.FORBIDDEN).json({
        status: ResponseCodes.FORBIDDEN,
        data: {},
        message: "Invalid User",
        error: "",
      });
    }

    //calling auth verify token
    let decodedToken = await sails.helpers.auth.verifyToken(authToken);

    if (decodedToken) {
      // Check the token expiry

      if (
        decodedToken.exp &&
        decodedToken.exp < Math.floor(Date.now() / 1000)
      ) {
        //if token expired
        return res.status(ResponseCodes.FORBIDDEN).json({
          status: ResponseCodes.FORBIDDEN,
          data: {},
          message: "Invalid Token",
          error: "",
        });
      }
      // And if the token is valid, then check in the database
      // Using the decodedtoken's id, get the user data

      let userId = decodedToken.id;

      let user = await Admin.findOne({
        where: {
          id: userId,
          isDeleted: false,
        },
      });

      if (user && user.authToken === authToken) {
        // Setting the user object as req.me
        req.me = user;

        // Proceed to the next step
        return proceed();
      } else {
        return res.status(ResponseCodes.FORBIDDEN).json({
          status: ResponseCodes.FORBIDDEN,
          data: {},
          message: "Invalid User",
          error: "",
        });
      }
    } else {
      return res.status(ResponseCodes.FORBIDDEN).json({
        status: ResponseCodes.FORBIDDEN,
        data: {},
        message: "Invalid Token",
        error: "",
      });
    }
  } catch (error) {
    return res.serverError({
      status: ResponseCodes.SERVER_ERROR,
      data: {},
      message: "",
      error: error.toString(),
    });
  }
};
