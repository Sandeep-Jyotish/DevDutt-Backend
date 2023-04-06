/**
 * PickRequestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { ResponseCodes, isEmpty } = sails.config.constants;
const GetMessages = sails.config.getMessages;
module.exports = {
  /**
   * @description This method will return the details of Pick Request through Id
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  getById: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      // get the pickRequest id
      let id = req.params.id;

      // find the pickRequest details
      let pickRequestDetails = await PickRequest.findOne({
        where: {
          id: id,
          or: [{ requestFrom: req.me.id }, { requestTo: req.me.id }],
          isDeleted: false,
        },
      })
        .populate("tripId")
        .populate("bookingId");
      if (pickRequestDetails) {
        //sending OK response
        return res.ok({
          status: ResponseCodes.OK,
          data: pickRequestDetails,
          message: "",
          error: "",
        });
      } else {
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: "pickRequest Not Found",
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
   * @description This method will create a Request for the user to Booking or Trip
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
      let fields = ["tripId", "bookingId", "requestFor"];

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
        // json destructing
        let { tripId, bookingId, requestFor } = result.data;
        let requestTo;
        // find the Booking Details
        let bookingDetails = await Booking.findOne({
          where: {
            id: bookingId,
            isBooked: false,
            isReached: false,
            isDeleted: false,
          },
        });
        if (!bookingDetails) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "No Booking Found on that Id",
            error: "",
          });
        }
        // find the trip details
        let tripDetails = await Trip.findOne({
          where: {
            id: tripId,
            isDeleted: false,
          },
        });
        if (!tripDetails) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "No Trip Found on that Id",
            error: "",
          });
        }
        if (bookingDetails.bookingBy === tripDetails.tripBy) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "You Can not Book Your Own Trip on Booking",
            error: "",
          });
        }
        // when request is for Booking
        if (requestFor === "Booking") {
          if (req.me.id === bookingDetails.bookingBy) {
            //return error
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: "You Can not Book Your Own Booking",
              error: "",
            });
          }
          requestTo = bookingDetails.bookingBy;
        } else if (requestFor === "Trip") {
          if (req.me.id === tripDetails.tripBy) {
            //return error
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: "You Can not Book Your Own Trip",
              error: "",
            });
          }
          requestTo = tripDetails.tripBy;
        }

        // set data to store in database
        let dataToStore = {
          id: sails.config.constants.UUID(),
          requestFor: requestFor,
          tripId: tripId,
          bookingId: bookingId,
          requestFrom: req.me.id,
          requestTo: requestTo,
          createdBy: req.me.id,
          createdAt: currentTime,
          updatedAt: currentTime,
          updatedBy: req.me.id,
        };

        // create in database
        let create = await PickRequest.create(dataToStore).fetch();
        //sending OK response
        return res.ok({
          status: ResponseCodes.OK,
          data: create,
          message: "Request Sent Successfully",
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
   * @description This method will returns all Pick Request of a Booking
   * @method GET
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  getTripRequests: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      // get the Booking ID from query
      let bookingId = req.query.bookingId;

      //   find the Booking details
      let bookingDetails = await Booking.findOne({
        where: {
          id: bookingId,
          bookingBy: req.me.id,
          isDeleted: false,
        },
      });
      if (!bookingDetails) {
        //return error
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: "You don't have any Booking like this",
          error: "",
        });
      }
      // get skip && limit from query
      let { skip, limit } = req.query;
      // set query for find trip requests
      let where = {
        bookingId: bookingId,
        requestTo: req.me.id,
        isRejected: false,
        isDeleted: false,
      };
      let queryObj = {
        where: where,
        sort: "createdAt DESC",
      };

      if (limit) {
        queryObj.limit = limit;
        queryObj.skip = skip;
      }
      //   find all trip requests on that Booking
      let tripRequests = await PickRequest.find(queryObj).populate("tripId");
      let count = await PickRequest.count(where);
      //sending OK response
      return res.ok({
        status: ResponseCodes.OK,
        total: count,
        data: tripRequests,
        message: "",
        error: "",
      });
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
   * @description This method will returns all Pick Request of a Booking
   * @method GET
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  getBookingRequests: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      // get the Booking ID from query
      let tripId = req.query.tripId;

      //   find the Booking details
      let tripDetails = await Trip.findOne({
        where: {
          id: tripId,
          tripBy: req.me.id,
          isDeleted: false,
        },
      });
      if (!tripDetails) {
        //return error
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: "You don't have any Trip like this",
          error: "",
        });
      }
      let { skip, limit } = req.query;
      let where = {
        tripId: tripId,
        requestTo: req.me.id,
        isRejected: false,
        isDeleted: false,
      };
      let queryObj = {
        where: where,
        sort: "createdAt DESC",
      };

      if (limit) {
        queryObj.limit = limit;
        queryObj.skip = skip;
      }
      //   find all trip requests on that Booking
      let bookingRequests = await PickRequest.find(queryObj).populate(
        "bookingId"
      );
      let count = await PickRequest.count(where);
      //sending OK response
      return res.ok({
        status: ResponseCodes.OK,
        total: count,
        data: bookingRequests,
        message: "",
        error: "",
      });
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
   * @description This method will approve the request
   * This operation can be done only the use which Id is as requestTo
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  approve: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    let error = "";
    let code = "";
    try {
      // Validate the id of Booking
      let result = await PickRequest.validateBeforeCreateOrUpdate(req.body, [
        "id",
      ]);
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
        let { id } = result.data;

        // find the pickRequest
        let pickRquest = await PickRequest.findOne({
          where: {
            id: id,
            requestTo: req.me.id,
            isRejected: false,
            isDeleted: false,
          },
        })
          .populate("tripId")
          .populate("bookingId");

        if (!pickRquest) {
          // if No pickRequest is found
          // return Error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "PickRequest Not Found",
            error: "",
          });
        }

        if (pickRquest.isApproved) {
          // if the pickRequest is approved
          // return Error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "Request is already Approved",
            error: "",
          });
        }

        // find the Trip Details
        let tripDetails = pickRquest.tripId;

        // check for time is expired or not
        if (tripDetails.startTime < currentTime) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "Trip has been Started",
            error: "",
          });
        }

        // find the Booking Details
        let bookingDetails = pickRquest.bookingId;

        if (!bookingDetails.myself) {
          // check the booking has receiver or not
          if (isEmpty(bookingDetails.receiverId)) {
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: "Booking has no Eeceiver",
              error: "",
            });
          } else if (!bookingDetails.isReceiverReady) {
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: "Receiver is not ready to Receive",
              error: "",
            });
          }
        }

        // check the booking is already booked or not
        if (bookingDetails.isBooked) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "This Booking is already booked",
            error: "",
          });
        }

        let tripCpacity = tripDetails.weightCapacity;
        let bookingWeight = bookingDetails.weight;

        // calculate the weightCapacity to set

        if (bookingDetails.item !== null) {
          if (tripDetails.weightType === "KG") {
            //  converting weight into gram
            tripCpacity = tripCpacity * 1000;
          }
          if (bookingDetails.weightType === "KG") {
            //  converting weight into gram
            bookingWeight = bookingWeight * 1000;
          }
          // check the capacity
          if (tripCpacity < bookingWeight) {
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: "Trip does not have enough Capacity",
              error: "",
            });
          }
        }
        let weightCapacity = tripCpacity - bookingWeight;
        if (tripDetails.weightType === "KG") {
          weightCapacity = weightCapacity / 1000;
        }
        // calculate noOfPerson and set to the Trip details
        let noOfPerson = tripDetails.noOfPerson;
        if (noOfPerson !== null && bookingDetails.myself == true) {
          noOfPerson = noOfPerson - 1;
        }
        // start the transaction
        await sails.getDatastore().transaction(async (db) => {
          // update the pickRequest table
          await PickRequest.updateOne({
            where: {
              id: id,
              isDeleted: false,
            },
          })
            .set({
              isApproved: true,
              approvedBy: req.me.id,
              otp: Math.floor(Math.random() * 9000 + 1000),
              updatedAt: currentTime,
              updatedBy: req.me.id,
            })
            .usingConnection(db)
            .catch((err) => {
              sails.log.error(
                "Error from PickRequest controller, while update record in pickRequest table"
              );
              //if database error
              error = err.toString();
              code = ResponseCodes.BAD_REQUEST;
              throw error;
            });

          // update Booking table
          await Booking.updateOne({
            id: bookingDetails.id,
            isDeleted: false,
          })
            .set({
              isBooked: true,
              tripId: tripDetails.id,
              updatedAt: currentTime,
              updatedBy: req.me.id,
            })
            .usingConnection(db)
            .catch((err) => {
              sails.log.error(
                "Error from PickRequest controller, while update record in booking table"
              );
              //if database error
              error = err.toString();
              code = ResponseCodes.BAD_REQUEST;
              throw error;
            });

          // update Trip table
          await Trip.updateOne({
            id: tripDetails.id,
            isDeleted: false,
          })
            .set({
              weightCapacity: weightCapacity,
              noOfPerson: noOfPerson,
              updatedAt: currentTime,
              updatedBy: req.me.id,
            })
            .usingConnection(db)
            .catch((err) => {
              sails.log.error(
                "Error from PickRequest controller, while update record in trip table"
              );
              //if database error
              error = err.toString();
              code = ResponseCodes.BAD_REQUEST;
              throw error;
            });
        });
        //sending OK response
        return res.ok({
          status: ResponseCodes.OK,
          message: "Your Request is Approved",
          error: "",
        });
      }
    } catch (error) {
      //return error
      if (code != "") {
        // return database error
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: "Database Error",
          error: error.toString(),
        });
      } else {
        //return server error
        return res.serverError({
          status: ResponseCodes.SERVER_ERROR,
          data: {},
          message: "",
          error: error.toString(),
        });
      }
    }
  },
  /**
   * @description This method will Delete user's own sent pickRequest and
   * Reject the coming PickRequest to the user
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  delete: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      // Validate the id of Booking
      let result = await PickRequest.validateBeforeCreateOrUpdate(req.body, [
        "id",
      ]);
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
        let { id } = result.data;

        // find the pickRequest
        let pickRequest = await PickRequest.findOne({
          where: {
            id: id,
            isDeleted: false,
            or: [{ requestFrom: req.me.id }, { requestTo: req.me.id }],
          },
        });
        if (!pickRequest) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "Pick Request Not Found",
            error: "",
          });
        }
        // when request is approved
        if (pickRequest.isApproved) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "You can not change after the request is Approved",
            error: "",
          });
        }
        if (pickRequest.requestFrom === req.me.id) {
          // delete the PickRequest
          await PickRequest.updateOne({
            where: {
              id: id,
            },
          }).set({
            isDeleted: true,
            deletedBy: req.me.id,
            deletedAt: currentTime,
          });
          //sending OK response
          return res.ok({
            status: ResponseCodes.OK,
            message: "Pick Request Deleted Successfully",
            error: "",
          });
        } else if (pickRequest.requestTo === req.me.id) {
          // reject the PickRequest
          await PickRequest.updateOne({
            where: {
              id: id,
            },
          }).set({
            isRejected: true,
            updatedBy: req.me.id,
            updatedAt: currentTime,
          });
          //sending OK response
          return res.ok({
            status: ResponseCodes.OK,
            message: "Pick Request is Rejected Successfully",
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
   * @description This method will Reject the coming Pick Request
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  reject: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
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
