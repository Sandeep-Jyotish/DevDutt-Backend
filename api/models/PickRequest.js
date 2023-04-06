/**
 * PicRequest.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const { Validator, ValidationRules, CustomValidationMsg } =
  sails.config.constants;
module.exports = {
  tableName: "pick_request",
  attributes: {
    id: {
      type: "string",
      required: true,
      unique: true,
      columnType: "varchar(40)",
    },
    requestFor: {
      type: "string",
      columnType: "enum",
      required: true,
      isIn: ["Booking", "Trip"],
    },
    isApproved: {
      type: "boolean",
      defaultsTo: false,
    },
    otp: {
      type: "number",
      allowNull: true,
      columnType: "unit(11)",
    },
    isRejected: {
      type: "boolean",
      defaultsTo: false,
    },
    // Associations start
    // Association with trip table
    tripId: {
      model: "Trip",
    },
    // Association with booking table
    bookingId: {
      model: "Booking",
    },
    // Association with user table
    requestFrom: {
      model: "User",
    },
    // Association with user table
    requestTo: {
      model: "User",
    },
    // Association with user table
    approvedBy: {
      model: "User",
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
    //getting the rules from the constants.js related to PickRequest
    let Rules = ValidationRules.PickRequest;

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
