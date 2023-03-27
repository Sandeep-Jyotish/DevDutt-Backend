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
        });
      }
      const { lines: javaPerson } = await convert(
        "java",
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
};
