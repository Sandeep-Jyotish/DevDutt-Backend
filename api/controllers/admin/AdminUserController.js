/**
 * AdminUserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { ResponseCodes, isEmpty } = sails.config.constants;
const GetMessages = sails.config.getMessages;
module.exports = {
  /**
   * @description This method will create an admin
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  create: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      //fields to validate
      let field = [
        "firstName",
        "lastName",
        "picture",
        "email",
        "phoneNo",
        "password",
        "confirmPassword",
      ];

      // Validate the data
      let result = await Admin.validateBeforeCreateOrUpdate(req.body, field);
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
        let {
          firstName,
          lastName,
          picture,
          email,
          password,
          confirmPassword,
          phoneNo,
        } = result.data;
        console.log(result.data);

        // Find any admin exists or not for that email
        let checkUser = await Admin.findOne({
          where: {
            email: email,
            isDeleted: false,
          },
        });
        if (checkUser) {
          //if user exists
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Admin.AlreadyExist", lang),
            error: "",
          });
        }

        //Check Password and confirm Password are matched or not
        if (password !== confirmPassword) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Admin.PasswordMissMatched", lang),
            error: "",
          });
        }
        // await sails.helpers.razorPay.customer.create.with({});
        //generating user ID
        let id = sails.config.constants.UUID();
        //current time
        let currentTime = Math.floor(Date.now() / 1000);
        let dataToStore = {
          id: id,
          firstName: firstName,
          lastName: lastName,
          picture: picture,
          phoneNo: phoneNo,
          email: email,
          password: password,
          confirmPassword: confirmPassword,
          createdBy: id,
          createdAt: currentTime,
          updatedAt: currentTime,
          updatedBy: id,
        };
        //create the user
        let user = await Admin.create(dataToStore).fetch();
        //send the response
        return res.ok({
          status: ResponseCodes.OK,
          data: user,
          message: GetMessages("Admin.Created", lang),
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
  /**
   * @description This method will update the admoin details
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  update: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      let field = ["firstName", "lastName", "picture", "email", "phoneNo"];
      // Validate the data
      let result = await Admin.validateBeforeCreateOrUpdate(req.body, field);
      if (result.hasError) {
        //if has any error in input field
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: Object.keys(result.errors).length,
          error: result.errors,
        });
      } else {
        console.log("sahi hai");
        let dataToUpdate = {};

        //check which fields of inputs are coming and so that accordingly update them
        Object.keys(result.data).forEach(function (key) {
          if (!isEmpty(result.data[key])) {
            dataToUpdate[key] = result.data[key];
          }
        });

        //Update the user
        let update = await Admin.updateOne({
          id: req.me.id,
        }).set(dataToUpdate);
        if (update) {
          //send the response
          return res.ok({
            status: ResponseCodes.OK,
            data: update,
            error: "",
          });
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
};
