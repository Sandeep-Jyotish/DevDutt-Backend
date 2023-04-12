/**
 * PickRequestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { ResponseCodes, isEmpty, VehicleType, weightType, VehicleBasePrice } =
  sails.config.constants;
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
   * @description This method will create a Request for the user to Booking or Trip
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  fareCalculate: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      //fields to validate
      let fields = ["tripId", "bookingId"];
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
        // json destructing
        let { tripId, bookingId } = result.data;
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
            message: GetMessages("Booking.NotFound", lang),
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
            message: GetMessages("Trip.NotFound", lang),
            error: "",
          });
        }
        if (bookingDetails.bookingBy === tripDetails.tripBy) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("PickRequest.SameTrip", lang),
            error: "",
          });
        }

        // declare fare value
        let fare = 0;

        // item value calculation
        let valueOfItem = 0;
        // calculate valueOfItem for person
        if (bookingDetails.myself) {
          valueOfItem = 2;
        }
        // if Booking is for send Item
        if (bookingDetails.item !== null) {
          // set weight
          let weight = bookingDetails.weight;
          if (bookingDetails.weightType === weightType.KiloGram) {
            weight = weight * 1000;
          }
          // calculate value of Item when weight is available
          switch (true) {
            case weight <= 500: {
              valueOfItem = 1;
              break;
            }
            case weight > 500 && weight <= 1000: {
              valueOfItem = 2;
              break;
            }
            case weight > 1000 && weight <= 1500: {
              valueOfItem = 3;
              break;
            }
            case weight > 1500: {
              valueOfItem = 5;
              break;
            }
          }
        }

        // Calculate Fare
        switch (tripDetails.vehicleType) {
          case VehicleType.Cycle: {
            // fare calculation for vehicle Type Cycle
            fare = VehicleBasePrice.ForCycle * valueOfItem;
            break;
          }
          case VehicleType.Bike: {
            // fare calculation for vehicle Type Bike
            fare = VehicleBasePrice.ForBike * valueOfItem;
            break;
          }
          case VehicleType.Auto: {
            // fare calculation for vehicle Type Auto
            fare = VehicleBasePrice.ForAuto * valueOfItem;
            break;
          }
          case VehicleType.Car: {
            // fare calculation for vehicle Type Car
            fare = VehicleBasePrice.ForCar * valueOfItem;
            break;
          }
          case VehicleType.Bus: {
            // fare calculation for vehicle Type Bus
            fare = VehicleBasePrice.ForBus * valueOfItem;
            break;
          }
          case VehicleType.Train: {
            // fare calculation for vehicle Type Train
            fare = VehicleBasePrice.ForTrain * valueOfItem;
            break;
          }
          case VehicleType.Flight: {
            // fare calculation for vehicle Type Flight
            fare = VehicleBasePrice.ForFlight * valueOfItem;
            break;
          }
          case VehicleType.Ship: {
            // fare calculation for vehicle Type Ship
            fare = VehicleBasePrice.ForShip * valueOfItem;
            break;
          }
        }
        let distance = 1800;
        //sending OK response
        return res.ok({
          status: ResponseCodes.OK,
          fare: fare * distance,
          message: "Your Fare",
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
   * @description This method will calaculate the fare for create PickRequest
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
      let fields = ["tripId", "bookingId", "fare", "requestFor"];

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
        let { tripId, bookingId, fare, requestFor } = result.data;

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
        // find any pickRequest is already have or not
        let pickRequest = await PickRequest.find({
          where: {
            bookingId: bookingId,
            tripId: tripId,
            isRejected: false,
            isDeleted: false,
          },
        });
        if (pickRequest.length > 0) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("PickRequest.Exists", lang),
            error: "",
          });
        } else {
          // when request is for Booking
          if (requestFor === "Booking") {
            if (req.me.id === bookingDetails.bookingBy) {
              //return error
              return res.badRequest({
                status: ResponseCodes.BAD_REQUEST,
                data: {},
                message: GetMessages("PickRequest.SameBooking", lang),
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
                message: GetMessages("PickRequest.SameTrip", lang),
                error: "",
              });
            }
            requestTo = tripDetails.tripBy;
          }

          // set data to store in database
          let dataToStore = {
            id: sails.config.constants.UUID(),
            fare: fare,
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
            message: GetMessages("PickRequest.Create", lang),
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
          message: GetMessages("Booking.NotFound", lang),
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
          message: GetMessages("Trip.NotFound", lang),
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
            message: GetMessages("PickRequest.NotFound", lang),
            error: "",
          });
        }

        if (pickRquest.isApproved) {
          // if the pickRequest is approved
          // return Error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("PickRequest.AlreadyApproved", lang),
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
            message: GetMessages("Trip.Started", lang),
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
              message: GetMessages("Booking.NoReceiver", lang),
              error: "",
            });
          } else if (!bookingDetails.isReceiverReady) {
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: GetMessages("Receiver.NotReady", lang),
              error: "",
            });
          }
        }

        // check the booking is already booked or not
        if (bookingDetails.isBooked) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Booking.AlreadyBooked", lang),
            error: "",
          });
        }

        let tripCpacity = tripDetails.weightCapacity;
        let bookingWeight = bookingDetails.weight;

        // calculate the weightCapacity to set
        let weightCapacity;
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
              message: GetMessages("Trip.CapacityExceed", lang),
              error: "",
            });
          }
          weightCapacity = tripCpacity - bookingWeight;
          if (tripDetails.weightType === "KG") {
            weightCapacity = weightCapacity / 1000;
          }
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
          message: GetMessages("PickRequest.Approve", lang),
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
          message: GetMessages("Database.Error", lang),
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
            message: GetMessages("PickRequest.NotFound", lang),
            error: "",
          });
        }
        // when request is approved
        if (pickRequest.isApproved) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("PickRequest.AlreadyApproved", lang),
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
            message: GetMessages("PickRequest.Delete", lang),
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
            message: GetMessages("PickRequest.Reject", lang),
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
