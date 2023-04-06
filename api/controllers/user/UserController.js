/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { ResponseCodes, isEmpty } = sails.config.constants;
const GetMessages = sails.config.getMessages;
module.exports = {
  /**
   * @description This method will create a user
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
        let {
          firstName,
          lastName,
          picture,
          email,
          password,
          confirmPassword,
          phoneNo,
        } = result.data;

        // Find user exists or not for that email
        let checkUser = await User.findOne({
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
            message: GetMessages("User.AlreadyExist", lang),
            error: "",
          });
        }

        //Check Password and confirm Password are matched or not
        if (password !== confirmPassword) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("User.PasswordMissMatched", lang),
            error: "",
          });
        }

        // // create RazorPay customer Id for the user
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
        let user = await User.create(dataToStore).fetch();
        //send the response
        return res.ok({
          status: ResponseCodes.OK,
          data: user,
          message: GetMessages("User.Created", lang),
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
   * @description This method will returns all the user details
   * @method GET
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  get: async function (req, res) {
    try {
      //   let whereClause = { isDeleted: false };
      //   let users = await User.find(whereClause);
      //   let count = await User.count(whereClause);

      let selectClause,
        fromClause,
        whereClause,
        nativeQuery = ``;

      selectClause = `SELECT *`;
      fromClause = `\n FROM test.user`;
      whereClause = `\n WHERE isDeleted = false`;
      let nativeCount = `
          SELECT
                count(*) as cnt
          FROM
          (`;
      nativeQuery = selectClause.concat(fromClause).concat(whereClause);

      nativeCount = nativeCount.concat(nativeQuery).concat(") as countNumber");
      let users = await sails.sendNativeQuery(nativeQuery);
      let count = await sails.sendNativeQuery(nativeCount);
      //   console.log(nativeCount);
      //send the response
      return res.ok({
        status: ResponseCodes.OK,
        total: count.rows[0].cnt,
        data: users,
        error: "",
      });
    } catch (error) {
      return res.serverError({
        status: ResponseCodes.SERVER_ERROR,
        data: {},
        message: "",
        error: error.toString(),
      });
    }
  },
  /**
   * @description This method will update the user
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  update: async function (req, res) {
    try {
      let id = req.me.id;
      if (!isEmpty(id)) {
        //find user on given id
        let user = await User.findOne({ where: { id: id, isDeleted: false } });
        if (user) {
          let field = [
            "firstName",
            "lastName",
            "picture",
            "email",
            "phoneNo",
            "password",
          ];
          // Validate the data
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
            console.log("sahi hai");
            let dataToUpdate = {};

            //check which fields of inputs are coming and so that accordingly update them
            Object.keys(result.data).forEach(function (key) {
              if (!isEmpty(result.data[key])) {
                dataToUpdate[key] = result.data[key];
              }
            });

            //Update the user
            let update = await User.updateOne({
              id: id,
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
        } else {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "No User found on that id",
            error: "",
          });
        }
      } else {
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: "Enter the correct id",
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
  },
};
