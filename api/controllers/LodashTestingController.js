/**
 * LodashTestingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const _ = require("lodash");
const { Path, isEmpty, Axios, Fetch } = sails.config.constants;
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
      let address1 = req.body.from;
      let address2 = req.body.to;

      async function getLocation(address) {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address
        )}&format=json`;

        const response = await Axios.get(url);
        const result = response.data[0];

        if (!result) {
          throw new Error(`Could not find location for address "${address}"`);
        }

        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
      }

      // const location1 = await getLocation(address1);
      // const location2 = await getLocation(address2);
      const location1 = "21.371521698971804,84.71333565614415";
      const location2 = "20.295904043847365,85.81956377698508";
      // let distance = 0;
      // let arr1 = [location1.latitude, location1.longitude];
      // let arr2 = [location2.latitude, location2.longitude];
      // console.log(arr1);

      // let data;
      await Fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${location1}|${location2}&mode=drive&apiKey=${process.env.GEOAPIFY_KEY}`
      )
        .then((response) => response.json())
        .then((result) => {
          data = result;
        })
        .catch((error) => {
          throw error;
        });
      // console.log(data);
      // const data = await response.json();

      // const SphericalUtil = require("node-geometry-library");
      // let response = SphericalUtil.SphericalUtil.computeDistanceBetween(
      //   { lat: 21.1783895374338, lng: 72.83327906799516 }, //from object {lat, lng}
      //   { lat: 23.03279681745682, lng: 72.56462248704821 } // to object {lat, lng}
      // );
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
        // data: distance / 1000,
        data: data.features[0].properties.distance / 1000,
      });
    } catch (error) {
      return res.serverError({
        error: error,
      });
    }
  },
};
