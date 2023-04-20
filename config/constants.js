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

const AWS = require("aws-sdk");

const Axios = require("axios");

const Fetch = require("node-fetch");
require("dotenv").config();
const Path = require("path");
// vehicle Type
const VehicleType = {
  Cycle: "Cycle",
  Bike: "Bike",
  Auto: "Auto",
  Car: "Car",
  Bus: "Bus",
  Train: "Train",
  Flight: "Flight",
  Ship: "Ship",
};

const weightType = {
  Gram: "G",
  KiloGram: "KG",
};

const requestType = {
  Booking: "Booking",
  Trip: "Trip",
};
//Validation Rules
const ValidationRules = {
  User: {
    firstName: "string|max:128",
    lastName: "string|max:128",
    picture: "string|max:128",
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
    myself: "boolean",
    item: ["string", "max:128", { required_if: ["myself", false] }],
    weightType: [
      { in: [weightType.Gram, weightType.KiloGram] },
      { required_if: ["myself", false] },
    ],
    weight: [{ required_if: ["myself", false] }],
    startingPoint: "required|string|max:128",
    endingPoint: "required|string|max:128",
    expStartTime: "required",
    expEndTime: "required",
    details: "string|max:300",
    isBooked: "boolean",
    isReceiverReady: "boolean",
    isReached: "boolean",
  },
  Trip: {
    id: "required|string|max:40",
    noOfPerson: "integer",
    startingPoint: "required|string|max:128",
    endingPoint: "required|string|max:128",
    startTime: "required",
    endTime: "required",
    vehicleType: [
      "required",
      {
        in: [
          VehicleType.Cycle,
          VehicleType.Bike,
          VehicleType.Auto,
          VehicleType.Car,
          VehicleType.Bus,
          VehicleType.Train,
          VehicleType.Flight,
          VehicleType.Ship,
        ],
      },
    ],
    weightType: ["required", { in: [weightType.Gram, weightType.KiloGram] }],
    weightCapacity: ["required"],
    noOfPerson: "integer",
    details: "string|max:300",
  },
  PickRequest: {
    id: "required|string|max:40",
    fare: "required|min:0",
    tripId: "required|string|max:40",
    bookingId: "required|string|max:40",
    otp: "integer",
    requestFor: ["required", { in: [requestType.Booking, requestType.Trip] }],
  },
  Receiver: {
    id: "required|string|max:40",
    firstName: "required|string|max:128",
    lastName: "required|string|max:128",
    picture: "string|max:128",
    phoneNo: "required|string",
    email: "required|email",
    otp: "integer",
    bookingId: "string|max:40",
  },
};

const deeplink = require("node-deep-links");

deeplink({
  fallback: "https://cupsapp.com",
  android_package_name: "com.citylifeapps.cups",
  ios_store_link:
    "https://itunes.apple.com/us/app/cups-unlimited-coffee/id556462755?mt=8&uo=4",
});

// Vehicle wise Base Price
const VehicleBasePrice = {
  ForCycle: 1,
  ForBike: 2,
  ForAuto: 0.8,
  ForCar: 1,
  ForBus: 1,
  ForTrain: 0.05,
  ForFlight: 0.5,
  ForShip: 0.03,
};

// Drive Mode
const DriveMode = {
  Drive: "drive",
  LightTruch: "light_truck",
  MediumTruck: "medium_truck",
  Truck: "truck",
  Bus: "bus",
  Motorcycle: "motorcycle",
  Scooter: "scooter",
  Bicycle: "bicycle",
  Walk: "walk",
};

function isEmpty(val) {
  return !val ||
    val === undefined ||
    val == null ||
    val === "" ||
    val.length <= 0
    ? true
    : false;
}

// file Type
const FileType = {
  Video: "Video",
  Image: "Image",
};

// Razorpay intigration
const razorPay = require("razorpay");
const razorPayInstance = new razorPay({
  key_id: "rzp_test_Nzhd7DrTNJgoYz",
  key_secret: "utMBllnE0NbzCjY2Q7RbrReJ",
});

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
  Axios,
  razorPayInstance,
  VehicleType,
  weightType,
  requestType,
  VehicleBasePrice,
  FileType,
  DriveMode,
  Fetch,
};
