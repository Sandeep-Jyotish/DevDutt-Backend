const { log } = require("handlebars");

/**
 * ReceiverController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { ResponseCodes, isEmpty } = sails.config.constants;
const GetMessages = sails.config.getMessages;
module.exports = {
  /**
   * @description This method will get the details of Booking through
   * the receiver Id
   * @method GET
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  getById: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      //   let receiverId = req.params.id;
      //   console.log(receiverId);
      // Validate the data
      let receiverResult = await Receiver.validateBeforeCreateOrUpdate(
        req.params,
        ["id"]
      );
      if (receiverResult.hasError) {
        //if has any error in input field
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: Object.keys(receiverResult.errors).length,
          error: receiverResult.errors,
        });
      } else {
        // find the receiver Details
        let receiverDetails = await Receiver.findOne({
          id: receiverResult.data.id,
          isDeleted: false,
        }).populate("bookingId");
        if (receiverDetails) {
          //sending OK response
          return res.ok({
            status: ResponseCodes.OK,
            data: receiverDetails,
            message: "",
            error: "",
          });
        } else {
          // return Error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Receiver.NotFound", lang),
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
  /**
   * @description This method will set isReceiverReady true in Booking Table by the Receiver
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  confirmReceiver: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      let fields = ["id"];
      // Validate the data
      let result = await Receiver.validateBeforeCreateOrUpdate(
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
        let { id } = result.data;
        //current time
        let currentTime = Math.floor(Date.now() / 1000);

        // find Booking Details
        let bookingDetails = await Booking.findOne({
          receiverId: id,
          expStartTime: { ">": currentTime },
          isDeleted: false,
        });
        if (bookingDetails) {
          if (bookingDetails.isReceiverReady) {
            // return Error
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: GetMessages("Receiver.NotFound", lang),
              error: "",
            });
          }

          let isReceiverReady =
            req.body.isReceiverReady === "true" ? true : false;
          // update the booking
          let update = await Booking.updateOne({
            id: bookingDetails.id,
            isDeleted: false,
          }).set({
            isReceiverReady: isReceiverReady,
          });
          //sending OK response
          return res.ok({
            status: ResponseCodes.OK,
            data: update,
            message: GetMessages("Booking.Update", lang),
            error: "",
          });
        } else {
          // return Error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Booking.NotFound", lang),
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
  /**
   * @description This method will send OTP to the receiver for varification
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  sendReceiverOTP: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      let pickRequest = req.body.id;

      if (isEmpty(pickRequest)) {
        // return Error
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: GetMessages("Enter Pick Request Id", lang),
          error: "",
        });
      } else {
        // find the Pick Request details
        let pickRequestDetails = await PickRequest.findOne({
          id: pickRequest,
          isApproved: true,
          isDeleted: false,
        })
          .populate("bookingId")
          .populate("tripId");

        if (pickRequestDetails) {
          // If pickRequest found
          // Check the Trip owner is the current user or not
          if (pickRequestDetails.tripId.tripBy === req.me.id) {
            if (
              pickRequestDetails.bookingId.item !== null &&
              pickRequestDetails.bookingId.receiverId !== null
            ) {
              // find the receiver details
              let receiverDetails = await Receiver.findOne({
                id: pickRequestDetails.bookingId.receiverId,
                isDeleted: false,
              });

              if (receiverDetails) {
                // when got the Receiver Details
                // create OTP and update Receiver table
                let updateReceiver = await Receiver.updateOne({
                  id: pickRequestDetails.bookingId.receiverId,
                  isDeleted: false,
                }).set({
                  otp: Math.floor(Math.random() * 9000 + 1000),
                  updatedAt: Math.floor(Date.now() / 1000),
                  updatedBy: req.me.id,
                });
                //sending OK response
                return res.ok({
                  status: ResponseCodes.OK,
                  otp: updateReceiver.otp,
                  message: "",
                  error: "",
                });
              } else {
                // return Error
                return res.badRequest({
                  status: ResponseCodes.BAD_REQUEST,
                  data: {},
                  message: GetMessages("Receiver.NotFound", lang),
                  error: "",
                });
              }
            }
          } else {
            // return Error
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: GetMessages("Otp.NotAllowedToSend", lang),
              error: "",
            });
          }
        } else {
          // return Error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("PickRequest.NotFound", lang),
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
  /**
   * @description This method will check the OTP of receiver for receiving goods
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  confirmReceiverOTP: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      let fields = ["otp", "id"];
      // Validate the data
      let result = await Receiver.validateBeforeCreateOrUpdate(
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

        // find the pickRequest details
        let pickRequestDetails = await PickRequest.findOne({
          id: id,
          isApproved: true,
          isDeleted: false,
        })
          .populate("tripId")
          .populate("bookingId");

        if (pickRequestDetails) {
          if (pickRequestDetails.tripId.tripBy === req.me.id) {
            if (!pickRequestDetails.bookingId.isReached) {
              if (!isEmpty(otp)) {
                // find the receiver
                let receiverDetails = await Receiver.findOne({
                  id: pickRequestDetails.bookingId.receiverId,
                  isDeleted: false,
                });
                if (receiverDetails) {
                  if (receiverDetails.otp === Number(otp)) {
                    // when OTP is matched
                    // update the Booking with isReached true
                    await Booking.updateOne({
                      id: pickRequestDetails.bookingId.id,
                      isDeleted: false,
                    }).set({
                      isReached: true,
                      updatedAt: currentTime,
                      updatedBy: req.me.id,
                    });
                    //sending OK response
                    return res.ok({
                      status: ResponseCodes.OK,
                      message: GetMessages("Otp.Verified", lang),
                      error: "",
                    });
                  } else {
                    // return Error
                    return res.badRequest({
                      status: ResponseCodes.BAD_REQUEST,
                      data: {},
                      message: GetMessages("Otp.Wrong", lang),
                      error: "",
                    });
                  }
                } else {
                  // return Error
                  return res.badRequest({
                    status: ResponseCodes.BAD_REQUEST,
                    data: {},
                    message: GetMessages("Receiver.NotFound", lang),
                    error: "",
                  });
                }
              } else {
                // return Error
                return res.badRequest({
                  status: ResponseCodes.BAD_REQUEST,
                  data: {},
                  message: GetMessages("Otp.Empty", lang),
                  error: "",
                });
              }
            } else {
              // return Error
              return res.badRequest({
                status: ResponseCodes.BAD_REQUEST,
                data: {},
                message: GetMessages("Booking.Reached", lang),
                error: "",
              });
            }
          } else {
            // return Error
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: GetMessages("User.Invalid", lang),
              error: "",
            });
          }
        } else {
          // return Error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("PickRequest.NotFound", lang),
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
