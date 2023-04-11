/**
 * TripController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { ResponseCodes, isEmpty } = sails.config.constants;
const GetMessages = sails.config.getMessages;
module.exports = {
  /**
   * @description This method will create a trip for the user
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
      //fields to validate of Trip details
      let tripFields = [
        "noOfPerson",
        "startingPoint",
        "endingPoint",
        "startTime",
        "endTime",
        "vehicleType",
        "weightType",
        "weightCapacity",
        "details",
      ];

      // Validate the data
      let tripResult = await Trip.validateBeforeCreateOrUpdate(
        req.body,
        tripFields
      );
      if (tripResult.hasError) {
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
        //json destructuring
        let {
          noOfPerson,
          startingPoint,
          endingPoint,
          startTime,
          endTime,
          vehicleType,
          weightType,
          weightCapacity,
          details,
        } = tripResult.data;

        // converting time to unix
        let startCnvrt = Date.parse(startTime);
        let endCnvrt = Date.parse(endTime);
        let unixStartTime = Math.floor(startCnvrt / 1000);
        let unixEndTime = Math.floor(endCnvrt / 1000);

        // validation for the start Time is not to be a past time
        if (currentTime > unixStartTime) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Trip.PastStartTimeError", lang),
            error: "",
          });
        }
        if (unixStartTime >= unixEndTime) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Trip.SameStartAndEndTime", lang),
            error: "",
          });
        }
        // Preparing the query object
        let where = {
          tripBy: req.me.id,
          isDeleted: false,
        };
        where.or = [
          {
            startTime: { "<=": unixStartTime },
            endTime: { ">=": unixStartTime },
          },
          {
            startTime: { "<=": unixEndTime },
            endTime: { ">=": unixEndTime },
          },
          {
            startTime: { ">": unixStartTime },
            endTime: { "<": unixEndTime },
          },
        ];
        //find the trip
        let prevTrip = await Trip.find(where);
        if (prevTrip.length <= 0) {
          // set data to store in database
          let tripDataToStore = {
            id: sails.config.constants.UUID(),
            tripBy: req.me.id,
            noOfPerson: noOfPerson,
            startingPoint: startingPoint,
            endingPoint: endingPoint,
            startTime: unixStartTime,
            endTime: unixEndTime,
            vehicleType: vehicleType,
            weightType: weightType,
            weightCapacity: weightCapacity,
            details: details,
            createdBy: req.me.id,
            createdAt: currentTime,
            updatedAt: currentTime,
            updatedBy: req.me.id,
          };

          // create the Trip for user
          let create = await Trip.create(tripDataToStore).fetch();

          // find Bookings who has the same destination and timing
          // Preparing the query object
          let where = {
            startingPoint: startingPoint,
            endingPoint: endingPoint,
            expStartTime: { ">=": unixStartTime },
            expEndTime: { ">=": unixEndTime },
            // myself: false,
            isDeleted: false,
          };
          if (noOfPerson >= 1) {
            where.or = [
              {
                myself: true,
              },
              {
                myself: false,
              },
            ];
          } else {
            where.myself = false;
          }
          let bookingObj = {
            where: where,
            sort: "expStartTime DESC",
          };
          // find boookings and user
          let bookings = await Booking.find(bookingObj).populate("bookingBy");
          if (bookings.length > 0) {
            // Send notification to the Booking user about this Trip
            // Also send the Booking details to the user who want Trip
          }
          //send the response
          return res.ok({
            status: ResponseCodes.OK,
            data: { bookings, create },
            error: "",
          });
        } else {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Trip.Exists", lang),
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
   * @description This method will Update the Trip details
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
      //fields to validate
      let fields = [
        "id",
        "startingPoint",
        "endingPoint",
        "startTime",
        "endTime",
        "vehicleType",
        "weightType",
        "weightCapacity",
        "details",
      ];
      // Validate the data
      let result = await Trip.validateBeforeCreateOrUpdate(req.body, fields);
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
        //json destructuring
        let {
          id,
          startingPoint,
          endingPoint,
          startTime,
          endTime,
          vehicleType,
          weightType,
          weightCapacity,
          details,
        } = result.data;

        // converting time to unix
        let startCnvrt = Date.parse(startTime);
        let endCnvrt = Date.parse(endTime);
        let unixStartTime = Math.floor(startCnvrt / 1000);
        let unixEndTime = Math.floor(endCnvrt / 1000);

        // validation for the start Time is not to be a past time
        if (currentTime > unixStartTime) {
          // if Starting Time is a Past time
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Trip.PastStartTimeError", lang),
            error: "",
          });
        }
        // Validation for Trip End Time should not to be back from Start Time
        if (unixStartTime >= unixEndTime) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Trip.SameStartAndEndTime", lang),
            error: "",
          });
        }
        // find the Trip is exist or not
        let trip = await Trip.findOne({
          where: {
            id: id,
            tripBy: req.me.id,
            isDeleted: false,
          },
        }).populate("tripBy");
        if (trip) {
          // Preparing the query object for search TRip on same time
          let where = {
            id: { nin: [id] },
            tripBy: req.me.id,
            isDeleted: false,
          };
          where.or = [
            {
              startTime: { "<=": unixStartTime },
              endTime: { ">=": unixStartTime },
            },
            {
              startTime: { "<=": unixEndTime },
              endTime: { ">=": unixEndTime },
            },
            {
              startTime: { ">": unixStartTime },
              endTime: { "<": unixEndTime },
            },
          ];
          //find the trip
          let prevTrip = await Trip.find(where);
          if (prevTrip.length <= 0) {
            // set data to store in database
            let dataToStore = {
              startingPoint: startingPoint,
              endingPoint: endingPoint,
              startTime: unixStartTime,
              endTime: unixEndTime,
              vehicleType: vehicleType,
              weightType: weightType,
              weightCapacity: weightCapacity,
              details: details,
              updatedAt: currentTime,
              updatedBy: req.me.id,
            };

            //   Update in database
            let update = await Trip.updateOne({ id: id, isDeleted: false }).set(
              dataToStore
            );
            //send the response
            return res.ok({
              status: ResponseCodes.OK,
              data: update,
              message: GetMessages("Trip.Update", lang),
              error: "",
            });
          } else {
            //return error
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: GetMessages("Trip.AlreadyTripExists", lang),
              error: "",
            });
          }
        } else {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Trip.NotFound", lang),
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
   * @description This method will returns all Trips details of current user
   * @method GET
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  get: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      let { skip, limit } = req.query;
      let where = { tripBy: req.me.id, isDeleted: false };
      let queryObj = {
        where: where,
        sort: "startTime DESC",
      };

      if (limit) {
        queryObj.limit = limit;
        queryObj.skip = skip;
      }

      // Find All trips
      let trips = await Trip.find(queryObj);
      let count = await Trip.count(where);
      //sending OK response
      return res.ok({
        status: ResponseCodes.OK,
        total: count,
        data: trips,
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
   * @description This method will returns the Trip details through id
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
      // get the trip id
      let id = req.params.id;

      //Find the trip
      let tripDetails = await Trip.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      });
      if (tripDetails) {
        //sending OK response
        return res.ok({
          status: ResponseCodes.OK,
          data: tripDetails,
          message: "",
          error: "",
        });
      } else {
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: GetMessages("Trip.NotFound", lang),
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
   * @description This method will returns all the Trips details
   * according to or suit for the Booking id
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  relatedTrips: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      // Validate the id of Booking
      let result = await Booking.validateBeforeCreateOrUpdate(req.body, ["id"]);
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

        // find the Booking details
        let bookingDetails = await Booking.findOne({
          id: id,
          bookingBy: req.me.id,
          isDeleted: false,
        });
        if (!bookingDetails) {
          // return Error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Booking.NotFound", lang),
            error: "",
          });
        }
        // find Trips who has the same destination and timing
        // Preparing the query object
        let where = {
          startingPoint: bookingDetails.startingPoint,
          endingPoint: bookingDetails.endingPoint,
          startTime: { ">=": bookingDetails.expStartTime },
          endTime: { "<=": bookingDetails.expEndTime },
          isDeleted: false,
        };
        if (bookingDetails.myself) {
          where.noOfPerson = { ">=": 1 };
        }

        let tripObj = {
          where: where,
          sort: "startTime DESC",
        };

        // find trips and user
        let trips = await Trip.find(tripObj).populate("tripBy");
        let count = await Trip.count(where);
        //send the response
        return res.ok({
          status: ResponseCodes.OK,
          total: count,
          data: trips,
          message: GetMessages("Trip.RelatedTrips", lang),
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
   * @description This method is used for advanced filter search on Trip
   * @method GET
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  advanceFilter: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      //get the query data
      let {
        skip,
        limit,
        startingPoint,
        endingPoint,
        startTime,
        endTime,
        vehicleType,
        weightType,
        weightCapacity,
      } = req.query;
      //current time
      let currentTime = Math.floor(Date.now() / 1000);

      let selectClause,
        fromClause,
        whereClause,
        nativeQuery,
        nativeSkipLimit = ``;

      selectClause = `SELECT *`;
      fromClause = `\n FROM test.trip as tr`;
      whereClause = `\n WHERE isDeleted = false
                        AND tr.startTime > ${currentTime}
                    `;
      let nativeCount = `
            SELECT
                  count(*) as cnt
            FROM
            (`;
      // setting limit and skip
      if (limit) {
        nativeSkipLimit = `\n LIMIT ${limit ? limit : 20} OFFSET ${
          skip ? skip : 0
        }`;
      }

      //   if startingPoint is provided
      if (!isEmpty(startingPoint)) {
        whereClause = whereClause.concat(
          `\n   AND startingPoint LIKE '%${startingPoint}%' `
        );
      }
      //   if endingPoint is provided
      if (!isEmpty(endingPoint)) {
        whereClause = whereClause.concat(
          `\n   AND endingPoint LIKE '%${endingPoint}%' `
        );
      }

      //   if starting time is given
      if (!isEmpty(startTime)) {
        // converting time to unix
        let startCnvrt = Date.parse(startTime);
        let unixStartTime = Math.floor(startCnvrt / 1000);
        whereClause = whereClause.concat(
          `\n AND startTime <= ${unixStartTime}`
        );
      }
      //   if ending time is given
      if (!isEmpty(endTime)) {
        // converting time to unix
        let endCnvrt = Date.parse(endTime);
        let unixEndTime = Math.floor(endCnvrt / 1000);
        whereClause = whereClause.concat(`\n AND endTime >= ${unixEndTime}`);
      }
      //   if vehicleType is given
      if (!isEmpty(vehicleType)) {
        whereClause = whereClause.concat(
          `\n   AND vehicleType LIKE '%${vehicleType}%' `
        );
      }
      //   if weightCapacity is provided
      if (!isEmpty(weightCapacity && weightType)) {
        whereClause = whereClause.concat(
          `\n AND weightType = "${weightType}"  \n AND weightCapacity >=${weightCapacity}`
        );
      }

      // Preparing the Query
      nativeQuery = selectClause
        .concat(fromClause)
        .concat(whereClause)
        .concat(nativeSkipLimit);
      nativeCount = nativeCount.concat(nativeQuery).concat(") as countNumber");
      //   console.log(nativeQuery);
      //   fire the Query
      let trips = await sails.sendNativeQuery(nativeQuery);
      let count = await sails.sendNativeQuery(nativeCount);

      //send the response
      return res.ok({
        status: ResponseCodes.OK,
        total: count.rows[0].cnt,
        data: trips.rows,
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
   * @description This method will Delete the Trip of the user
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  delete: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    let error = "";
    let code = "";
    try {
      // Validate the id of Booking
      let result = await Trip.validateBeforeCreateOrUpdate(req.body, ["id"]);
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

        // find the Booking for validation
        let tripDetails = await Trip.findOne({
          where: {
            id: id,
            tripBy: req.me.id,
            isDeleted: false,
          },
        });
        if (!tripDetails) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Trip.NotFound", lang),
            error: "",
          });
        }

        // find PickRequest on that booking
        let pickRequest = await PickRequest.find({
          where: {
            tripId: id,
            isApproved: true,
            isDeleted: false,
          },
        }).populate("bookingId");
        let bookingIds = [];
        if (pickRequest.length > 0) {
          // if any pickRequest is active on that Trip
          pickRequest.forEach((element) => {
            bookingIds.push(element.bookingId.id);
          });
        }
        // start the transaction
        await sails.getDatastore().transaction(async (db) => {
          // delete the pickRequests on that Booking
          await PickRequest.update({
            where: {
              tripId: id,
              isApproved: false,
              isDeleted: false,
            },
          })
            .set({
              isDeleted: true,
              deletedAt: currentTime,
              deletedBy: req.me.id,
            })
            .usingConnection(db)
            .catch((err) => {
              sails.log.error(
                "Error from Trip delete controller, while delete record in pickRequest table"
              );
              //if database error
              error = err.toString();
              code = ResponseCodes.BAD_REQUEST;
              throw error;
            });

          // when Trip was approved on PickRequest
          if (bookingIds.length > 0) {
            // update all Bookings
            await Booking.update(bookingIds)
              .set({
                isBooked: false,
                tripId: null,
                updatedAt: currentTime,
                updatedBy: req.me.id,
              })
              .usingConnection(db)
              .catch((err) => {
                sails.log.error(
                  "Error from Trip delete controller, while update record in booking table"
                );
                //if database error
                error = err.toString();
                code = ResponseCodes.BAD_REQUEST;
                throw error;
              });
          }

          // delete the Trip
          await Trip.updateOne({
            where: {
              id: id,
              isDeleted: false,
            },
          })
            .set({
              isDeleted: true,
              deletedAt: currentTime,
              deletedBy: req.me.id,
            })
            .usingConnection(db)
            .catch((err) => {
              sails.log.error(
                "Error from Trip delete controller, while delete record in trip table"
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
          message: GetMessages("Trip.Delete", lang),
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
};
