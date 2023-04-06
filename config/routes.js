/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  "/": { view: "pages/homepage" },
  "GET /stripe": "StripeController.create",
  "GET /pdfcreate": "PdfMakerController.pdfcreate",
  "GET /cron": "PdfMakerController.cron",
  "GET /create_invoice": "StripeController.createInvoice",
  "GET /firebase": "DeeplinkController.firebase",
  "GET /fcm": "DeeplinkController.fcm",
  "GET /get": "DeeplinkController.getUsers",
  "POST /signup": "DeeplinkController.signup",
  "POST /create_token": "DeeplinkController.createToken",
  "POST /authenticate_token": "DeeplinkController.authenticateToken",
  "POST /signin_token": "DeeplinkController.signinWthAuthToken",
  "POST /signin": "DeeplinkController.signinWthEmail",
  "POST /reset_password": "DeeplinkController.resetPasswordSendMail",
  "POST /update_user": "DeeplinkController.updateUser",
  "POST /delete_user": "DeeplinkController.deleteUser",
  "POST /upload_file": "DeeplinkController.uploadFile",
  "POST /download_file": "DeeplinkController.downloadFile",
  "POST /delete_file": "DeeplinkController.deleteFile",
  "POST /data_test": "DeeplinkController.dataTest",

  "POST /stripe/upload-file": "AwsController.uploadFile",

  "POST /lodash/testing/invoke": "LodashTestingController.invokeTest",
  "POST /lodash/testing/pick": "LodashTestingController.pickTest",
  "POST /lodash/testing/omit": "LodashTestingController.omitTest",
  "POST /jsonTest": "LodashTestingController.jsonTest",
  "POST /lodash/testing/map": "LodashTestingController.map",

  /** DevDutt Project Routs start Here... */
  //User Controller
  "POST /user/create": "user/UserController.create",
  "POST /user/update": "user/UserController.update",
  "GET /user/get": "user/UserController.get",

  // User Auth Controller
  "POST /user/login": "user/AuthController.login",
  "POST /user/logout": "user/AuthController.logout",

  // Trip Controller
  "GET /trip/get": "trip/TripController.get",
  "GET /trip/get/:id": "trip/TripController.getById",
  "GET /trip/advance-filter": "trip/TripController.advanceFilter",
  "POST /trip/create": "trip/TripController.create",
  "POST /trip/update": "trip/TripController.update",
  "POST /trip/delete": "trip/TripController.delete",
  "POST /trip/get/related-trips": "trip/TripController.relatedTrips",

  // Booking Controller
  "GET /booking/get": "booking/BookingController.get",
  "GET /booking/get/:id": "booking/BookingController.getById",
  "GET /booking/advance-filter": "booking/BookingController.advanceFilter",
  "POST /booking/create": "booking/BookingController.create",
  "POST /booking/update": "booking/BookingController.update",
  "POST /booking/delete": "booking/BookingController.delete",
  "POST /booking/get/related-bookings":
    "booking/BookingController.relatedBookings",

  // PickRequest Controller
  "GET /pick-request/get/:id": "pickRequest/PickRequestController.getById",
  "POST /pick-request/create": "pickRequest/PickRequestController.create",
  "GET /pick-request/get-trip-requests":
    "pickRequest/PickRequestController.getTripRequests",
  "GET /pick-request/get-booking-requests":
    "pickRequest/PickRequestController.getBookingRequests",
  "POST /pick-request/approve": "pickRequest/PickRequestController.approve",
  "POST /pick-request/delete": "pickRequest/PickRequestController.delete",

  // Validation Controller
  "GET /verification/get-otp/:id": "pickRequest/VerificationController.getOtp",
  "POST /verification/verify-otp":
    "pickRequest/VerificationController.verifyOtp",

  // Receiver Controller
  "GET /receiver/getById/:id": "booking/ReceiverController.getById",
  "POST /receiver/confirm-receiver":
    "booking/ReceiverController.confirmReceiver",

  // Paymetn Razorpay
  "POST /razorpay/payment": "PaymentController.razorpayTest",
  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/
};
