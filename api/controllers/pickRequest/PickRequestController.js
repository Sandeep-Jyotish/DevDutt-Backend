/**
 * PickRequestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { ResponseCodes, isEmpty } = sails.config.constants;
module.exports = {
  /**
   * @description This method will create a Request for the user to Booking or Trip
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  create: async function (req, res) {
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
        if (requestFor === "Booking") {
          requestTo = tripDetails.tripBy;
        } else if (requestFor === "Trip") {
          requestTo = bookingDetails.bookingBy;
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
      let { skip, limit } = req.query;
      let where = {
        bookingId: bookingId,
        requestTo: req.me.id,
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
      let where = { tripId: tripId, requestTo: req.me.id, isDeleted: false };
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
            isDeleted: false,
          },
        });

        if (!pickRquest) {
          // if No pickRequest is found
          // retun Error
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
        // find pickRequest which is approved on that bookingId
        let pickRequestOnBooking = await PickRequest.findOne({
          where: {
            bookingId: pickRquest.bookingId,
            isApproved: true,
            isDeleted: false,
          },
        });
        if (pickRequestOnBooking) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: "Request on that Booking is already Approved",
            error: "",
          });
        }

        // find the Trip Details
        let tripDetails = await Trip.findOne({
          where: {
            id: pickRquest.tripId,
            isDeleted: false,
          },
        });

        // find the Booking Details
        let bookingDetails = await Booking.findOne({
          where: {
            id: pickRquest.bookingId,
            isDeleted: false,
          },
        });

        //  converting wight into gram
        let tripCpacity = tripDetails.weightCapacity;
        let bookingWeight = bookingDetails.weight;
        if (tripDetails.weightType === "KG") {
          tripCpacity = tripCpacity * 1000;
        }
        if (bookingDetails.weightType === "KG") {
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
        // calculate the weightCapacity to set
        let weightCapacity = tripCpacity - bookingWeight;
        if (tripDetails.weightType === "KG") {
          weightCapacity = weightCapacity / 1000;
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
            id: pickRquest.bookingId,
            isDeleted: false,
          })
            .set({
              isBooked: true,
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
            id: pickRquest.tripId,
            isDeleted: false,
          })
            .set({
              weightCapacity: weightCapacity,
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
          message: "You Request is Approved",
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
};
