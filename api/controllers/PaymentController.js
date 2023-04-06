/**
 * PaymentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { razorPayInstance, razorPay } = sails.config.constants;
module.exports = {
  razorpayTest: async function (req, res) {
    try {
      //   // create Order
      //   let options = {
      //     amount: 50000, // amount in the smallest currency unit
      //     currency: "INR",
      //     receipt: "order_rcptid_11",
      //   };
      //   razorPayInstance.orders.create(options, function (err, order) {
      //     console.log(order);
      //     return res.json({
      //       message: "successful!",
      //       data: order,
      //     });
      //   });

      //   //   fetch all payments
      //   let payments = await razorPayInstance.payments.all({
      //     from: "2022-03-30",
      //     to: "2022-03-31",
      //   });

      //   // create Customer
      //   let dataToAdd = {
      //     name: "Abhijit Swain",
      //     contact: 7089097867,
      //     email: "abhijit@gmail.com",
      //     fail_existing: 0,
      //   };
      //   razorPayInstance.customers.create(dataToAdd, function (err, cutomer) {
      //     console.log(cutomer);
      //     return res.json({
      //       message: "successful!",
      //       data: cutomer,
      //     });
      //   });
      //   //   get CUstomer Details
      //   razorPayInstance.customers.fetch(
      //     "cust_LY2my6Pk9ic38S",
      //     function (err, cutomer) {
      //       console.log(cutomer);
      //       return res.json({
      //         message: "successful!",
      //         data: cutomer,
      //       });
      //     }
      //   );

      //   //   fetch payment through Order
      //   razorPayInstance.orders.fetchPayments(
      //     "order_LY3JvPtNuhOp2g",
      //     function (err, payment) {
      //       console.log(payment);
      //       return res.json({
      //         message: "successful!",
      //         data: payment,
      //       });
      //     }
      //   );
      //   let payments = await razorPayInstance.orders.fetchPayments(
      //     "order_LY2VSwTt4aG2Xn"
      //   );
      //   let orders = await razorPayInstance.orders.all();

      return res.json({
        message: "successful!",
        data: orders,
      });
    } catch (error) {
      return res.serverError({
        error: error,
      });
    }
  },
};
