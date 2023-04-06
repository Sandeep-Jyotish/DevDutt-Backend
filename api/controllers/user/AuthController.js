/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { JWT, ResponseCodes } = sails.config.constants;
const GetMessages = sails.config.getMessages;
module.exports = {
  /**
   * @description This method will Generate AuthTOken for user and
   * set that AuthToken to the user in database
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  login: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      //get the auth details for login
      let field = ["email", "password"];

      //validate the data
      let result = await User.validateBeforeCreateOrUpdate(req.body, field);
      if (result.hasError) {
        //if has any error in input field
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: Object.keys(result.errors).length,
          error: result.errors,
        });
      } else {
        //json destructuring
        let { email, password } = result.data;
        email = email.toLowerCase();
        //current time
        let currentTime = Math.floor(Date.now() / 1000);
        //find the user and check with the password
        let user = await User.findOne({
          where: {
            email: email,
            isDeleted: false,
          },
        });
        if (user) {
          // comparision of the password
          let isPwdMatch = await sails.helpers.auth.comparePassword(
            password,
            user.password
          );

          if (isPwdMatch) {
            // If Password matched
            //Generate Auth Token for the user
            let token = await JWT.sign(
              {
                id: user.id,
                email: email,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "2h",
              }
            );
            if (token) {
              //If TOken has generated
              // update the user with AuthTOken
              let update = await User.updateOne(user.id).set({
                authToken: token,
                lastLoginTime: currentTime,
              });

              //Send Response
              return res.ok({
                status: ResponseCodes.OK,
                data: update,
                message: GetMessages("User.LoggedinSuccessfully", lang),
                // message: "Password Matched & You are now Logged In",
                error: "",
              });
            } else {
              //return error
              return res.badRequest({
                status: ResponseCodes.BAD_REQUEST,
                data: {},
                message: GetMessages("User.AuthTokenError", lang),
                error: "",
              });
            }
          } else {
            //return error
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: GetMessages("User.WrongPassword", lang),
              error: "",
            });
          }
        }
      }
    } catch (error) {
      //return error
      return res.serverError({
        status: ResponseCodes.SERVER_ERROR,
        data: {},
        message: "",
        error: error.toString(),
      });
    }
  },
  /**
   * @description This method will set Auth Token as null of the user at database
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  logout: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      //   Set AuthToken Null as LogOut
      let update = await User.updateOne({
        id: req.me.id,
        isDeleted: false,
      }).set({
        authToken: null,
      });

      if (update) {
        //Send Response
        return res.ok({
          status: ResponseCodes.OK,
          data: {},
          message: `${update.firstName},` + GetMessages("User.LogOut", lang),
          error: "",
        });
      } else {
        //return error
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: GetMessages("User.LogOutError", lang),
          error: "",
        });
      }
    } catch (error) {
      //return error
      return res.serverError({
        status: ResponseCodes.SERVER_ERROR,
        data: {},
        message: "",
        error: error.toString(),
      });
    }
  },
};
