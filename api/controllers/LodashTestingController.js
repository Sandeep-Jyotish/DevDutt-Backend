/**
 * LodashTestingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const _ = require("lodash");
const { Path, isEmpty } = sails.config.constants;
const file = require("/home/zt63/demostripe/config/test.json");

module.exports = {
  invokeTest: async function (req, res) {
    try {
      let object = { a: [{ b: { c: [1, 2, 3, 4] } }] };
      let result = _.invoke(object, "a[0].b.c.slice", 1, 4);
      console.log(result);
      return res.json({
        message: "successful!",
        data: result,
      });
    } catch (error) {
      return res.serverError({
        error: error,
      });
    }
  },
  pickTest: async function (req, res) {
    try {
      //   let object = { a: 1, b: "2", c: 3 };
      let result = _.pick(req.body, ["b", "c"]);

      console.log(result);
      return res.json({
        message: "successful!",
        data: result,
      });
    } catch (error) {
      return res.serverError({
        error: error,
      });
    }
  },
  omitTest: async function (req, res) {
    try {
      //   let object = { a: 1, b: "2", c: 3 };
      let result = _.omit(req.body, ["a"]);
      console.log(result);
      function isEmpty(val) {
        process.nextTick(() => {
          console.log("Running at next tick => number 2");

          return !val ||
            val === undefined ||
            val == null ||
            val === "" ||
            val.length <= 0
            ? true
            : false;
        });
      }

      if (!isEmpty(result)) {
        console.log(result);
      }
      if (!isEmpty(result)) {
        console.log(result);
      }
      return res.json({
        message: "successful!",
        data: result,
      });
      //   let s = "";
      //   if (!isEmpty(s)) {
      //     console.log("validation Passed");
      //   }
    } catch (error) {
      return res.serverError({
        error: error,
      });
    }
  },
  jsonTest: async function (req, res) {
    try {
      let {
        quicktype,
        InputData,
        jsonInputForTargetLanguage,
      } = require("quicktype-core");
      async function convert(targetLanguage, typeName, jsonString) {
        let jsonInput = jsonInputForTargetLanguage(targetLanguage);
        // console.log(jsonString);
        await jsonInput.addSource({
          name: typeName,
          samples: [jsonString],
        });
        // console.log(jsonInput);
        let inputData = new InputData();

        inputData.addInput(jsonInput);
        return await quicktype({
          inputData,
          lang: targetLanguage,
          rendererOptions: {
            "just-types": "true",
            "explicit-unions": "true",
            "acronym-style": "camel",
          },

          InferenceFlags: {
            inferUuids: false,
            inferDateTimes: false,
            inferIntegerStrings: false,
            inferBooleanStrings: false,
            inferMaps: false,
            inferEnums: false,
          },
        });
      }
      const { lines: javaPerson } = await convert(
        "swift",
        "success",
        JSON.stringify(file)
      );

      console.log(javaPerson);
      return res.ok({
        data: javaPerson,
      });
      // console.log(convert("java", "person", file));
    } catch (error) {
      //return error
      return res.serverError({
        // status: ResponseCodes.SERVER_ERROR,
        data: {},
        // message: "",
        error: error.toString(),
      });
    }
  },
  map: async function (req, res) {
    try {
      const SphericalUtil = require("node-geometry-library");
      let response = SphericalUtil.SphericalUtil.computeDistanceBetween(
        { lat: 23.055238445144024, lng: 72.54887355427091 }, //from object {lat, lng}
        { lat: 23.198095596678552, lng: 72.62318632895979 } // to object {lat, lng}
      );
      // var latitude1 = 39.46;
      // var longitude1 = -0.36;
      // var latitude2 = 40.4;
      // var longitude2 = -3.68;
      // const google = require("google");
      // var distance = google.maps.geometry.spherical.computeDistanceBetween(
      //   new google.maps.LatLng(latitude1, longitude1),
      //   new google.maps.LatLng(latitude2, longitude2)
      // );
      // let distance = require("google-distance");
      // let dist;
      // distance.get(
      //   {
      //     origin: "San Francisco, CA",
      //     destination: "San Diego, CA",
      //   },
      //   function (err, data) {
      //     if (err) return console.log(err);
      //     console.log(data);
      //     dist = data;
      //   }
      // );
      return res.json({
        message: "successful!",
        // distance: dist,
        data: response / 1000,
      });
    } catch (error) {
      return res.serverError({
        error: error,
      });
    }
  },
};
