/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const { Bcrypt, Validator, ValidationRules, CustomValidationMsg } =
  sails.config.constants;
module.exports = {
  tableName: "user",
  attributes: {
    id: {
      type: "string",
      required: true,
      unique: true,
      columnType: "varchar(40)",
    },
    firstName: {
      type: "string",
      allowNull: true,
      columnType: "varchar(128)",
    },
    lastName: {
      type: "string",
      allowNull: true,
      columnType: "varchar(128)",
    },
    picture: {
      type: "string",
      allowNull: true,
      columnType: "varchar(128)",
    },
    email: {
      type: "string",
      required: true,
      columnType: "varchar(128)",
    },
    phoneNo: {
      type: "string",
      allowNull: true,
      columnType: "varchar(20)",
    },
    password: {
      type: "string",
      required: true,
      columnType: "varchar(128)",
    },
    authToken: {
      type: "string",
      allowNull: true,
      columnType: "varchar(255)",
    },
    // Association start
    // Association with trip table
    tripId: {
      collection: "Trip",
      via: "tripBy",
    },
    // Association with Booking table
    bookingId: {
      collection: "Booking",
      via: "bookingBy",
    },
    // Association with PickRequest table
    pickRequstFrom: {
      collection: "PickRequest",
      via: "requestFrom",
    },
    // Association with PickRequest table
    pickRequstTo: {
      collection: "PickRequest",
      via: "requestTo",
    },
    pickApprovedBy: {
      collection: "PickRequest",
      via: "approvedBy",
    },
  },
  customToJSON: function () {
    // Return a shallow copy of this record with following fields removed
    return _.omit(this, ["password", "isDeleted", "deletedBy", "deletedAt"]);
  },
  /**
   * @description This function will be executed before there is an creation of User
   * to Encrypt Password and store in the database
   * @param {value_to_set_in_database} valueToset
   * @param {respone_back} proceed
   * @returns Encrpted password to password field
   */
  beforeCreate: function (valueToset, proceed) {
    if (!valueToset.password) {
      return proceed();
    } else {
      //encrypt password
      Bcrypt.hash(
        valueToset.password,
        10,
        function passwordEncrypted(err, encryptedPassword) {
          if (err) {
            return proceed(err);
          }
          valueToset.password = encryptedPassword;
          // console.log(valueToset);
          proceed();
        }
      );
    }
  },
  beforeUpdate: function (valueToset, proceed) {
    //checking if we got password
    if (!valueToset.password) {
      //if no password return back
      return proceed();
    } else {
      //if password is present then encrypte using Bcrypt
      Bcrypt.hash(
        valueToset.password,
        10,
        function passwordEncrypted(err, encryptedPassword) {
          if (err) {
            return proceed(err);
          }
          valueToset.password = encryptedPassword;
          proceed();
        }
      );
    }
  },
  /**
   * @description This function will validate all the fields that comes as an parameter
   * @param {Data_To_Validate} data
   * @returns result json which contain all error related to field if any error
   */
  validateBeforeCreateOrUpdate: async function (data, requiredRules) {
    let result = {};
    sails.log.info("Validating before create...");
    //getting the rules from the constants.js related to User
    let Rules = ValidationRules.User;

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
