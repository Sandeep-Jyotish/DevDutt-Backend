/**
 * BookingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { ResponseCodes, isEmpty } = sails.config.constants;
const GetMessages = sails.config.getMessages;
module.exports = {
  /**
   * @description This method will returns all Bookings details of current user
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
      let where = { bookingBy: req.me.id, isDeleted: false };
      let queryObj = {
        where: where,
        sort: "createdAt DESC",
      };
      if (limit) {
        queryObj.limit = limit;
        queryObj.skip = skip;
      }

      // Find All trips
      let bookings = await Booking.find(queryObj).populate("receiverId");
      let count = await Booking.count(where);
      //sending OK response
      return res.ok({
        status: ResponseCodes.OK,
        total: count,
        data: bookings,
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
   * @description This method will returns the Booking details through id
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
      // get the booking id
      let id = req.params.id;
      //Find the trip
      let bookingDetails = await Booking.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      }).populate("receiverId");
      if (bookingDetails) {
        //sending OK response
        return res.ok({
          status: ResponseCodes.OK,
          data: bookingDetails,
          message: "",
          error: "",
        });
      } else {
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: GetMessages("Booking.NotFound", lang),
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
   * @description This method will returns all the Booking details according to or suit for the trip id
   * @method GET
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  relatedBookings: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
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
        let { id } = result.data;

        // find the trip details
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
        // find Bookings who has the same destination and timing
        // Preparing the query object
        let where = {
          startingPoint: tripDetails.startingPoint,
          endingPoint: tripDetails.endingPoint,
          expStartTime: { ">=": tripDetails.startTime },
          expEndTime: { ">=": tripDetails.endTime },
          isBooked: false,
          isDeleted: false,
        };
        if (tripDetails.noOfPerson >= 1) {
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
        let count = await Booking.count(where);
        //send the response
        return res.ok({
          status: ResponseCodes.OK,
          total: count,
          data: bookings,
          message: GetMessages("Booking.RelatedBookings", lang),
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
   * @description This method will create a Booking for the user
   * @method POST
   * @param {Request} req
   * @param {Response} res
   * @returns HTTP Response
   * @author Sandeep Jyotish (Zignuts)
   */
  create: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    let error = "";
    let code = "";
    try {
      //fields to validate
      let fields = [
        "myself",
        "item",
        "weightType",
        "weight",
        "startingPoint",
        "endingPoint",
        "expStartTime",
        "expEndTime",
        "details",
      ];

      // Validate the data
      let result = await Booking.validateBeforeCreateOrUpdate(req.body, fields);
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
          myself,
          item,
          weightType,
          weight,
          startingPoint,
          endingPoint,
          expStartTime,
          expEndTime,
          details,
        } = result.data;

        let receiverData;
        if (!isEmpty(item)) {
          //fields to validate of Receiver details
          let receiverFields = ["firstName", "lastName", "email", "phoneNo"];
          // Validate the data
          let receiverResult = await Receiver.validateBeforeCreateOrUpdate(
            req.body,
            receiverFields
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
            receiverData = receiverResult.data;
          }
        }

        // converting time to unix
        let startCnvrt = Date.parse(expStartTime);
        let endCnvrt = Date.parse(expEndTime);
        let unixStartTime = Math.floor(startCnvrt / 1000);
        let unixEndTime = Math.floor(endCnvrt / 1000);

        // validation for the start Time is not to be a past time
        if (currentTime > unixStartTime) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Booking.PastStartTimeError", lang),
            error: "",
          });
        }
        if (unixStartTime >= unixEndTime) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Booking.SameStartAndEndTime", lang),
            error: "",
          });
        }

        //generating IDs
        let bookingId = sails.config.constants.UUID();
        let receiverId = sails.config.constants.UUID();
        // set data to store in database
        let dataToStore = {
          id: bookingId,
          myself: myself,
          item: myself == true ? null : item,
          weightType: myself == true ? null : weightType,
          weight: myself == true ? null : weight,
          startingPoint: startingPoint,
          endingPoint: endingPoint,
          expStartTime: unixStartTime,
          expEndTime: unixEndTime,
          details: details,
          receiverId: myself !== true ? receiverId : null,
          bookingBy: req.me.id,
          createdBy: req.me.id,
          createdAt: currentTime,
          updatedAt: currentTime,
          updatedBy: req.me.id,
        };

        // start the transaction
        await sails.getDatastore().transaction(async (db) => {
          // creatae the Booking for user
          await Booking.create(dataToStore)
            .usingConnection(db)
            .catch((err) => {
              sails.log.error(
                "Error from Booking controller, while create record in Booking table"
              );
              //if database error
              error = err.toString();
              code = ResponseCodes.BAD_REQUEST;
              throw error;
            });
          if (myself === false) {
            let receiverDataToStore = {
              id: receiverId,
              firstName: receiverData.firstName,
              lastName: receiverData.lastName,
              email: receiverData.email,
              phoneNo: receiverData.phoneNo,
              bookingId: bookingId,
              createdAt: currentTime,
              createdBy: req.me.id,
              updatedAt: currentTime,
              updatedBy: req.me.id,
            };
            // create Receiver details
            await Receiver.create(receiverDataToStore)
              .usingConnection(db)
              .catch((err) => {
                sails.log.error(
                  "Error from Trip controller, while create record in receiver table"
                );
                //if database error
                error = err.toString();
                code = ResponseCodes.BAD_REQUEST;
                throw error;
              });
          }
        });
        if (!isEmpty(receiverData)) {
          // send Mail and notification to the receiver to confirm the Booking
        }
        // find Trips who has the same destination and timing
        // Preparing the query object
        let where = {
          endingPoint: endingPoint,
          startTime: { ">=": unixStartTime },
          endTime: { "<=": unixEndTime },
          isDeleted: false,
        };
        if (myself) {
          where.or = [{ noOfPerson: { ">=": 1 } }];
        }
        let tripObj = {
          where: where,
          sort: "startTime DESC",
        };

        // find trips and user
        let trips = await Trip.find(tripObj).populate("tripBy");
        if (trips.length > 0) {
          // Send notification to the Trip riders about this Booking
          // Also send the Trips details to the user who want Booking
        }

        //sending OK response
        return res.ok({
          status: ResponseCodes.OK,
          data: { trips },
          message: GetMessages("Booking.Create", lang),
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
        "item",
        "weightType",
        "weight",
        "startingPoint",
        "endingPoint",
        "expStartTime",
        "expEndTime",
        "details",
      ];
      // Validate the data
      let result = await Booking.validateBeforeCreateOrUpdate(req.body, fields);
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
          item,
          weightType,
          weight,
          startingPoint,
          endingPoint,
          expStartTime,
          expEndTime,
          details,
        } = result.data;
        // converting time to unix
        let startCnvrt = Date.parse(expStartTime);
        let endCnvrt = Date.parse(expEndTime);
        let unixStartTime = Math.floor(startCnvrt / 1000);
        let unixEndTime = Math.floor(endCnvrt / 1000);

        // validation for the start Time is not to be a past time
        if (currentTime > unixStartTime) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Booking.PastStartTimeError", lang),
            error: "",
          });
        }
        if (unixStartTime >= unixEndTime) {
          //return error
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Booking.SameStartAndEndTime", lang),
            error: "",
          });
        }

        // find the Booking details for validation
        let booking = await Booking.findOne({
          where: {
            id: id,
            bookingBy: req.me.id,
            isBooked: false,
            isReached: false,
            isDeleted: false,
          },
        });
        // If Booking Exist
        if (booking) {
          // set data to update in database
          let dataToStore = {
            item: item,
            weightType: weightType,
            weight: weight,
            startingPoint: startingPoint,
            endingPoint: endingPoint,
            expStartTime: unixStartTime,
            expEndTime: unixEndTime,
            details: details,
            updatedAt: currentTime,
            updatedBy: req.me.id,
          };

          // Update the Booking
          let update = await Booking.updateOne({
            id: id,
            isDeleted: false,
          }).set(dataToStore);

          // find Trips who has the same destination and timing
          // Preparing the query object
          let where = {
            endingPoint: endingPoint,
            startTime: { ">=": unixStartTime },
            endTime: { "<=": unixEndTime },
            isDeleted: false,
          };
          let tripObj = {
            where: where,
            sort: "startTime DESC",
          };
          // find trips and user
          let trips = await Trip.find(tripObj).populate("tripBy");
          if (trips.length > 0) {
            // Send notification to the Trip riders about this Booking
            // Also send the Trips details to the user who want Booking
          }
          if (update) {
            //sending OK response
            return res.ok({
              status: ResponseCodes.OK,
              data: { update, trips },
              message: GetMessages("Booking.Update", lang),
              error: "",
            });
          } else {
            //return error
            return res.badRequest({
              status: ResponseCodes.BAD_REQUEST,
              data: {},
              message: GetMessages("Booking.UpdateError", lang),
              error: "",
            });
          }
        } else {
          //return error
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
   * @description This method is used for advanced filter search on Bookings
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
        item,
        startingPoint,
        endingPoint,
        startTime,
        endTime,
        weightType,
        weight,
        isBooked,
        isReached,
      } = req.query;

      //current time
      let currentTime = Math.floor(Date.now() / 1000);

      let selectClause,
        fromClause,
        whereClause,
        nativeQuery,
        nativeSkipLimit = ``;

      selectClause = `SELECT *`;
      fromClause = `\n FROM test.booking as b`;
      whereClause = `\n WHERE isDeleted = false
                        AND b.expStartTime > ${currentTime}
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

      //   if item name is provided
      if (!isEmpty(item)) {
        whereClause = whereClause.concat(`\n   AND item LIKE '%${item}%' `);
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
      //   if ending time is given
      if (!isEmpty(endTime)) {
        // converting time to unix
        let endCnvrt = Date.parse(endTime);
        let unixEndTime = Math.floor(endCnvrt / 1000);
        whereClause = whereClause.concat(`\n AND expEndTime >= ${unixEndTime}`);
      }

      //   if starting time is given
      if (!isEmpty(startTime)) {
        // converting time to unix
        let startCnvrt = Date.parse(startTime);
        let unixStartTime = Math.floor(startCnvrt / 1000);
        whereClause = whereClause.concat(
          `\n AND expStartTime <= ${unixStartTime}`
        );
      }

      //   if weight is provided
      if (!isEmpty(weight && weightType)) {
        whereClause = whereClause.concat(
          `\n AND weightType = "${weightType}"  \n AND weight >=${weight}`
        );
      }

      //   if isBooked is given
      if (!isEmpty(isBooked)) {
        whereClause = whereClause.concat(`\n   AND isBooked = ${isBooked} `);
      }
      //   if isReached is given
      if (!isEmpty(isReached)) {
        whereClause = whereClause.concat(`\n   AND isReached = ${isReached} `);
      }

      // Preparing the Query
      nativeQuery = selectClause
        .concat(fromClause)
        .concat(whereClause)
        .concat(nativeSkipLimit);
      nativeCount = nativeCount.concat(nativeQuery).concat(") as countNumber");
      //   console.log(nativeQuery);
      //   fire the Query
      let bookings = await sails.sendNativeQuery(nativeQuery);
      let count = await sails.sendNativeQuery(nativeCount);

      //send the response
      return res.ok({
        status: ResponseCodes.OK,
        total: count.rows[0].cnt,
        data: bookings.rows,
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
   * @description This method will Delete the Booking of the user
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
        //current time
        let currentTime = Math.floor(Date.now() / 1000);
        let { id } = result.data;

        // find the Booking for validation
        let bookingDetails = await Booking.findOne({
          where: {
            id: id,
            bookingBy: req.me.id,
            isDeleted: false,
          },
        });
        if (!bookingDetails) {
          return res.badRequest({
            status: ResponseCodes.BAD_REQUEST,
            data: {},
            message: GetMessages("Booking.NotFound", lang),
            error: "",
          });
        }

        // find PickRequest on that booking
        let pickRequest = await PickRequest.findOne({
          where: {
            bookingId: id,
            isApproved: true,
            isDeleted: false,
          },
        }).populate("tripId");
        let tripUpdateData = {};

        // set value of weight of trip and booking
        let tripCpacity = pickRequest.tripId.weightCapacity;
        let bookingWeight = bookingDetails.weight;
        if (pickRequest) {
          // if any pickRequest is active on that Booking
          // calculate the weight

          let weightCapacity;
          if (bookingDetails.item !== null) {
            if (pickRequest.tripId.weightType === "KG") {
              //  converting weight into gram
              tripCpacity = tripCpacity * 1000;
            }
            if (bookingDetails.weightType === "KG") {
              //  converting weight into gram
              bookingWeight = bookingWeight * 1000;
            }
            weightCapacity = tripCpacity + bookingWeight;
            if (pickRequest.tripId.weightType === "KG") {
              weightCapacity = weightCapacity / 1000;
            }
            tripUpdateData.weightCapacity = weightCapacity;
          }
          // set values to update at trip table
          tripUpdateData.noOfPerson =
            bookingDetails.myself === true
              ? pickRequest.tripId.noOfPerson + 1
              : pickRequest.tripId.noOfPerson;
          tripUpdateData.updatedBy = req.me.id;
          tripUpdateData.updatedAt = currentTime;
        }
        // start the transaction
        await sails.getDatastore().transaction(async (db) => {
          // delete the pickRequests on that Booking
          await PickRequest.update({
            where: {
              bookingId: id,
              isApproved: false,
              isDeleted: false,
            },
          })
            .set({
              isApproved: false,
              otp: null,
              isDeleted: true,
              deletedAt: currentTime,
              deletedBy: req.me.id,
            })
            .usingConnection(db)
            .catch((err) => {
              sails.log.error(
                "Error from Booking delete controller, while delete record in pickRequest table"
              );
              //if database error
              error = err.toString();
              code = ResponseCodes.BAD_REQUEST;
              throw error;
            });

          // delete the Booking
          await Booking.updateOne({
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
                "Error from Booking delete controller, while delete record in booking table"
              );
              //if database error
              error = err.toString();
              code = ResponseCodes.BAD_REQUEST;
              throw error;
            });
          if (!isEmpty(tripUpdateData)) {
            await Trip.updateOne({
              id: pickRequest.tripId.id,
              isDeleted: false,
            })
              .set(tripUpdateData)
              .usingConnection(db)
              .catch((err) => {
                sails.log.error(
                  "Error from Booking delete controller, while delete record in trip table"
                );
                //if database error
                error = err.toString();
                code = ResponseCodes.BAD_REQUEST;
                throw error;
              });
          }
        });
        //sending OK response
        return res.ok({
          status: ResponseCodes.OK,
          message: "Booking Deleted Successfully",
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
