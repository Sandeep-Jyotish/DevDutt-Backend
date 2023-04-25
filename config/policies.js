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
  "admin/AdminUserController": {
    update: "hasAdminToken",
  },
  "user/UserController": {
    update: "hasUserToken",
  },

  "user/AuthController": {
    logout: "hasUserToken",
  },

  "trip/TripController": {
    get: "hasUserToken",
    create: "hasUserToken",
    update: "hasUserToken",
    delete: "hasUserToken",
    relatedTrips: "hasUserToken",
  },
  "booking/BookingController": {
    get: "hasUserToken",
    create: "hasUserToken",
    update: "hasUserToken",
    delete: "hasUserToken",
    relatedBookings: "hasUserToken",
  },

  "booking/ReceiverController": {
    sendReceiverOTP: "hasUserToken",
    confirmReceiverOTP: "hasUserToken",
  },

  "pickRequest/PickRequestController": {
    getById: "hasUserToken",
    create: "hasUserToken",
    // update: "hasUserToken",
    getTripRequests: "hasUserToken",
    getBookingRequests: "hasUserToken",
    approve: "hasUserToken",
    delete: "hasUserToken",
  },
  "pickRequest/VerificationController": {
    getOtp: "hasUserToken",
    verifyOtp: "hasUserToken",
  },
  // '*': true,
};
