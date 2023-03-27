/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/
  "user/UserController": {
    update: "hasUserToken",
  },

  "trip/TripController": {
    get: "hasUserToken",
    create: "hasUserToken",
    update: "hasUserToken",
    delete: "hasUserToken",
  },
  "booking/BookingController": {
    get: "hasUserToken",
    create: "hasUserToken",
    update: "hasUserToken",
    delete: "hasUserToken",
  },
  "pickRequest/PickRequestController": {
    get: "hasUserToken",
    create: "hasUserToken",
    update: "hasUserToken",
    getTripRequests: "hasUserToken",
    getBookingRequests: "hasUserToken",
    approve: "hasUserToken",
  },
  // '*': true,
};
