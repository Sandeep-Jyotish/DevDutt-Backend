/**
 * AwsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { Path } = sails.config.constants;
module.exports = {
  uploadFile: async function (req, res) {
    try {
      let fileDetails;
      let path = "";
      let file = req.file("file");
      let type = req.body.type;
      let destination = "";
      let currentTime = Math.floor(Date.now() / 1000);
      let dirname = "";
      // let filedetail;
      if (type === "video") {
        dirname = Path.join(
          process.env.FILE_BASE_PATH,
          process.env.MY_FILE,
          process.env.VIDEO
        );

        destination = `video/${currentTime}video.mp4`;
      }
      if (type === "image") {
        dirname = Path.join(
          process.env.FILE_BASE_PATH,
          process.env.MY_FILE,
          process.env.IMAGE
        );
        destination = `image/${currentTime}image.jpeg`;
      }

      let fileObject = {
        dirname: dirname,
        maxBytes: 90000000,
      };
      fileDetails = await sails.uploadOne(file, fileObject);

      path = fileDetails.fd;
      if (fileDetails) {
        return res.json({
          message: " file(s) uploaded successfully!",
          data: path,
        });
      } else {
        return res.json({
          message: " Error in file(s) uploaded",
          data: {},
        });
      }

      // await sails.helpers.aws.s3.with({
      //     someInput: …,
      //     someOtherInput: …
      //   });
    } catch (error) {
      console.log(error.toString());
      return res.serverError({
        error: error,
      });
    }
  },
};
