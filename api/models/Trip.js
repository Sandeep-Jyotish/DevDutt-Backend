/**
 * Trip.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const { Validator, ValidationRules, CustomValidationMsg } =
  sails.config.constants;
module.exports = {
  tableName: "trip",
  attributes: {
    id: {
      type: "string",
      required: true,
      unique: true,
      columnType: "varchar(40)",
    },
    startingPoint: {
      type: "string",
      required: true,
      columnType: "varchar(128)",
    },
    endingPoint: {
      type: "string",
      required: true,
      columnType: "varchar(128)",
    },
    startTime: {
      type: "number",
      required: true,
      columnType: "unit(11)",
    },
    endTime: {
      type: "number",
      allowNull: true,
      columnType: "unit(11)",
    },
    vehicleType: {
      type: "string",
      required: true,
      columnType: "varchar(40)",
    },
    weightType: {
      type: "string",
      columnType: "enum",
      required: true,
      isIn: ["G", "KG"],
    },
    weightCapacity: {
      type: "number",
      required: true,
      columnType: "float",
    },
    details: {
      type: "string",
      allowNull: true,
      columnType: "varchar(300)",
    },
    // Associations start
    // Association with user table
    tripBy: {
      model: "User",
    },
    // Association with booking table
    bookingId: {
      collection: "Booking",
      via: "tripId",
    },
    // Association with PickRequest table
    pickRequestId: {
      collection: "PickRequest",
      via: "tripId",
    },
  },
  /**
   * @description This function will validate all the fields that comes as an parameter
   * @param {Data_To_Validate} data
   * @returns result json which contain all error related to field if any error
   */
  validateBeforeCreateOrUpdate: async function (data, requiredRules) {
    let result = {};
    sails.log.info("Validating before create...");
    //getting the rules from the constants.js related to Trip
    let Rules = ValidationRules.Trip;

    let checks = {};
    let dataValues = {};
    //looping all the rules and getting the rules that are required
    requiredRules.forEach((property) => {
      checks[property] = Rules[property];
    });

    requiredRules.forEach((property) => {
      if (data[property] === "" || data[property] === undefined) {
        data[property] = null;
      }
      dataValues[property] = data[property];
    });

    //if the user provide empty value or provide space
    Object.keys(dataValues).forEach(function (key) {
      if (typeof dataValues[key] === "string") {
        dataValues[key] = dataValues[key].trim();
      }
      if (dataValues[key] === "") {
        dataValues[key] = null;
      }
      if (key === "isActive") {
        dataValues[key] = dataValues[key] === "true" ? true : false;
      }
    });

    // Set the checks that you want to validate before create
    let validation = new Validator(data, checks, CustomValidationMsg);
    if (validation.passes()) {
      //if all rules are satisfied
      sails.log.info("Data validation succeeded.");
      result["hasError"] = false;
      result["data"] = dataValues;
    }
    if (validation.fails()) {
      //if any rule is violated
      result["hasError"] = true;
      result["errors"] = validation.errors.all();
    }
    return result;
  },
};
