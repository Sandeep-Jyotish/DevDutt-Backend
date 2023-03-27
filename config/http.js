/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {
  /****************************************************************************
   *                                                                           *
   * Sails/Express middleware to run for every HTTP request.                   *
   * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
   *                                                                           *
   * https://sailsjs.com/documentation/concepts/middleware                     *
   *                                                                           *
   ****************************************************************************/

  middleware: {
    /***************************************************************************
     *                                                                          *
     * The order in which middleware should be run for HTTP requests.           *
     * (This Sails app's routes are handled by the "router" middleware below.)  *
     *                                                                          *
     ***************************************************************************/
    // order: [
    //   'cookieParser',
    //   'session',
    // "bodyParser",
    //   'compress',
    //   'poweredBy',
    //   'router',
    //   'www',
    //   'favicon',
    // ],
    /***************************************************************************
     *                                                                          *
     * The body parser that will handle incoming multipart HTTP requests.       *
     *                                                                          *
     * https://sailsjs.com/config/http#?customizing-the-body-parser             *
     *                                                                          *
     ***************************************************************************/
    // rawBody: function (req, res, next) {
    //   var data = "";
    //   req.setEncoding("utf8");
    //   req.on("data", function (chunk) {
    //     console.log("chunk", chunk);
    //     data += chunk;
    //   });
    //   req.on("end", function () {
    //     req.rawBody = data;
    //     console.log("rawBody", req.rawBody);
    //     next();
    //   });
    // },
    // bodyParser: (function _configureBodyParser() {
    //   var skipper = require("skipper");
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),
  },
};
