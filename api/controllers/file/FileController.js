/**
 * FileController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { ResponseCodes, Path, FileType } = sails.config.constants;
const GetMessages = sails.config.getMessages;
module.exports = {
  uploadFile: async function (req, res) {
    //getting the language from locale
    const lang = req.getLocale();
    try {
      let fileDetails;
      let path = "";

      //   get the file and details
      let file = req.file("file");
      let type = req.body.type;
      let destination = "";

      //  Current Time
      let currentTime = Math.floor(Date.now() / 1000);
      let dirname = "";

      // if video file is coming
      if (type === FileType.Video) {
        dirname = Path.join(
          process.env.FILE_BASE_PATH,
          process.env.MY_FILE,
          process.env.VIDEO
        );

        destination = `video/${currentTime}video.mp4`;
      }
      // if image file coming
      if (type === FileType.Image) {
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

      //   Upload the file
      fileDetails = await sails.uploadOne(file, fileObject);

      path = fileDetails.fd;
      if (fileDetails) {
        //sending OK response
        return res.ok({
          status: ResponseCodes.OK,
          message: GetMessages("File.Upload", lang),
          data: path,
          error: "",
        });
      } else {
        return res.badRequest({
          status: ResponseCodes.BAD_REQUEST,
          data: {},
          message: GetMessages("File.UploadError", lang),
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
};
