/**
 * ConfirmBookingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { ResponseCodes, isEmpty } = sails.config.constants;
const GetMessages = sails.config.getMessages;
module.exports = {
  /**
   * @description This method will returns the OTP of the booking to give thier Trip user
   * for confirm the Request and start the trip
   * This operation is done by Booking user
   * @method GET
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  getOtp: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      // get the booking id
      let pickRequestId = req.params.id;

      // find pickRequest
      let pickRequest = await PickRequest.findOne({
        where: {
          id: pickRequestId,
          isDeleted: false,
          or: [{ requestFrom: req.me.id }, { requestTo: req.me.id }],
        },
      }).populate("bookingId");
      if (pickRequest) {
        if (pickRequest.bookingId.bookingBy !== req.me.id) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Otp.NotAllowedToGet", lang),
            error: "",
          });
        }
        if (!pickRequest.isApproved) {
          // if pick request is not approved
          // return Error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("PickRequest.NotApproved", lang),
            error: "",
          });
        }
        // Define the color codes
        const colors = {
          blue: "#0000ff",
          green: "#00ff00",
          red: "#ff0000",
          purple: "#800080",
        };
        const otp = `<span style="color: ${colors.red};">${pickRequest.otp}</span>`;

        // call sendMail helper to send mail
        let sendMail = await sails.helpers.mail.sendMail.with({
          mailType: "welcome",
          data: {
            subject: "OTP To Start Ride",
            email: req.me.email,
            // text: `Hello ${req.me.firstName}, \n ${pickRequest.otp} is the OTP to start ride `,
            html: `<div style="color: blue;">Hello ${req.me.firstName}, \n ${otp} is the OTP to start ride </div>`,
          },
          lang: lang,
        });
        //sending OK response
        return res.ok({
          status: ResponseCodes.OK,
          otp: pickRequest.otp,
          message: "Success",
          error: "",
        });
      } else {
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: GetMessages("PickRequest.NotFound", lang),
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
   * @description This method will check the OTP to verify
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  verifyOtp: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      let fields = ["otp", "id"];
      // Validate the data
      let result = await PickRequest.validateBeforeCreateOrUpdate(
        req.body,
        fields
      );
      if (result.hasError) {
        //if has any error in input field
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: Object.keys(result.errors).length,
          error: result.errors,
        });
      } else {
        //current time
        let currentTime = Math.floor(Date.now() / 1000);
        let { otp, id } = result.data;

        //   find the booking details
        let pickRequestDetails = await PickRequest.findOne({
          where: {
            id: id,
            isRejected: false,
            isDeleted: false,
          },
        }).populate("tripId");
        if (pickRequestDetails.tripId.tripBy === req.me.id) {
          if (otp == pickRequestDetails.otp) {
            // when OTP is matched
            // update the Booking table
            await Booking.updateOne({
              where: {
                id: pickRequestDetails.bookingId,
                isDeleted: false,
              },
            }).set({
              hasPickedUp: true,
              pickupTime: currentTime,
              updatedBy: req.me.id,
              updatedAt: currentTime,
            });
            //sending OK response
            return res.ok({
              status: ResponseCodes.OK,
              message: GetMessages("Otp.Verified", lang),
              error: "",
            });
          } else {
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: GetMessages("Otp.Wrong", lang),
              error: "",
            });
          }
        } else {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Otp.NotAllowedToVerify", lang),
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
