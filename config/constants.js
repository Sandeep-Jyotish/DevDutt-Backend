// response code
const ResponseCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  FORCE_LOGOUT: 303,
};
// for field validation
const Validator = require("validatorjs");
// for uuid generation
const { v4: uuidv4 } = require("uuid");

// for JWT generation
const JWT = require("jsonwebtoken");

//to encrypt password
const Bcrypt = require("bcrypt");
// custom message to display if error is thrown by validatorjs
const CustomValidationMsg = {
  regex: ":attribute format is not valid",
  required: "Please enter :attribute",
  max: "The :attribute is too long. Maximum length is :max.",
  min: "The :attribute is too short. Minnimum length is :min.",
  required_if: "Please enter :attribute",
  required_unless: "Please enter :attribute",
};
const passwordRegex =
  /(?=^.{8,}$)(?=.*\d)(?=.*[~()_+='":;?/|.><,`}{!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

//Validation Rules
const ValidationRules = {
  User: {
    firstName: "string|max:128",
    lastName: "string|max:128",
    phoneNo: "string",
    email: "email",
    password: [
      "required",
      "string",
      "min:8",
      "max:32",
      `regex:${passwordRegex}`,
    ],
    confirmPassword: [
      "required",
      "string",
      "min:8",
      "max:32",
      `regex:${passwordRegex}`,
    ],
  },
  Booking: {
    id: "required|string|max:40",
    item: "required|string|max:128",
    weightType: ["required", { in: ["G", "KG"] }],
    weight: ["required"],
    startingPoint: "required|string|max:128",
    endingPoint: "required|string|max:128",
    expStartTime: "required",
    expEndTime: "required",
  },
  Trip: {
    id: "required|string|max:40",
    startingPoint: "required|string|max:128",
    endingPoint: "required|string|max:128",
    startTime: "required",
    endTime: "required",
    vehicleType: "required|string|max:40",
    weightType: ["required", { in: ["G", "KG"] }],
    weightCapacity: ["required"],
    details: "string|max:300",
  },
  PickRequest: {
    id: "required|string|max:40",
    tripId: "required|string|max:40",
    bookingId: "required|string|max:40",
    requestFor: ["required", { in: ["Booking", "Trip"] }],
  },
};

const deeplink = require("node-deep-links");

deeplink({
  fallback: "https://cupsapp.com",
  android_package_name: "com.citylifeapps.cups",
  ios_store_link:
    "https://itunes.apple.com/us/app/cups-unlimited-coffee/id556462755?mt=8&uo=4",
});

const AWS = require("aws-sdk");
require("dotenv").config();
const Path = require("path");
function isEmpty(val) {
  return !val ||
    val === undefined ||
    val == null ||
    val === "" ||
    val.length <= 0
    ? true
    : false;
}

module.exports.constants = {
  ResponseCodes,
  UUID: uuidv4,
  AWS,
  Path,
  isEmpty,
  CustomValidationMsg,
  ValidationRules,
  Validator,
  Bcrypt,
  JWT,
};
