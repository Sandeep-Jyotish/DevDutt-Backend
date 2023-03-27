/**
 * StripeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

//pk_test_51Lyvv0SHp8ZbAYVAMCTMLMhWxjYgPHKdPHLmHUzrFcBDSCoIDrO5MjIkarbSZ8OUMde4eSAuRZ1SOyug9nZDWhre00b5D2yVdO
module.exports = {
  create: async function (req, res) {
    console.log("sassa");
    try {
      const stripe = require("stripe")(
        "sk_test_51Lyvv0SHp8ZbAYVAWZVjDIyCCIVtWT0dQUC32l08lIUuKcAisPP4VK8v2ZXh4C3K0UUxk3KW1tbtOJLgi0zOdaf900h26XLgZV"
      );

      // const token = await stripe.tokens.create({
      //     card: {
      //         number: '4242424242424242',
      //         exp_month: 2,
      //         exp_year: 2023,
      //         cvc: '314',
      //     }
      // });

      // create Price of the product
      // const price = await stripe.prices.create(
      //     {
      //     unit_amount: 30000,
      //     currency: 'inr',
      //     recurring: {interval: 'month'},
      //     product: 'prod_MiNDpbxMnXCcjA',
      //   });

      // //create Customer
      // const customer = await stripe.customers.create({
      //   description: "My First Test Customer ",
      //   name: "Soujanya Kumar",
      //   phone: "9078432185",
      // });
      // console.log(customer);
      // return res.ok({
      //   data: customer,
      // });

      // //retrive Customer
      // const customer = await stripe.customers.retrieve("cus_NHZf6xsrdZJNrc");
      // console.log(customer);
      // return res.ok({
      //   data: customer,
      // });

      //Edit Customer Details
      const customer = await stripe.customers.update("cus_NHZf6xsrdZJNrc", {
        email: "soujanya@gmail.com",
        description: "My Second Test Customer",
        balance: 12222234,
        address: { city: "" },
        shipping: {
          address: {
            line1: "sas",
            line2: "sasa",
            postal_code: "saa",
            city: "sa",
            state: "",
          },
          name: "sasa",
        },
      });
      console.log("updated", customer);
      return res.ok({
        data: customer,
      });

      // //make Payment Method or default card
      // const paymentMethod = await stripe.paymentMethods.create({
      //   type: "card",
      //   card: {
      //     number: "4242424242424242",
      //     exp_month: 11,
      //     exp_year: 2023,
      //     cvc: "314",
      //   },
      // });
      // console.log(paymentMethod);
      // return res.ok({
      //   data: paymentMethod,
      // });

      // //crete Source
      // const card = await stripe.customers.createSource("cus_MidwZRsQaRWWlp", {
      //   source: "tok_visa",
      // });
      // console.log(card);
      // return res.ok({
      //   data: card,
      // });

      //Edit  source details of Customer
      // const card = await stripe.customers.updateSource(
      //   'cus_MidwZRsQaRWWlp',
      //   'card_1LzCvNSHp8ZbAYVAlNuiftL6',
      //   {name: 'Abhijit Swain',
      //   exp_year: 2025}
      // );

      // //create Product
      // const product = await stripe.products.create({
      //   name: "Gold Special",
      // });
      // console.log(product);
      // return res.ok({
      //   data: product,
      // });

      // //create Invoice
      // const invoice = await stripe.invoices.create({
      //   customer: "cus_NHZf6xsrdZJNrc",
      // });
      // console.log(invoice);
      // return res.ok({
      //   data: invoice,
      // });

      // //update Invoice payment details
      // const invoice = await stripe.invoices.update(
      //   "in_1MX0lhSHp8ZbAYVA6PCvHfg0",
      //   { paid: true }
      // );
      // console.log(invoice);
      // return res.ok({
      //   data: invoice,
      // });

      //Create Plan for a product
      // const plan = await stripe.plans.create({
      //   amount: 30000,
      //   currency: 'inr',
      //   interval: 'month',
      //   product: 'prod_MiNDpbxMnXCcjA',
      // });

      //Create Subscription
      // const subscription = await stripe.subscriptions.create({
      //   customer: 'cus_MidwZRsQaRWWlp',
      //   items: [
      //     {price: 'plan_MleS0rCYsPc7Bd'},
      //   ],
      // });

      //delete Plan
      // const deleted = await stripe.plans.del(
      //   'plan_MiehVZqUrVy8pG'
      // );

      // //Make payment of Subscription
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: 200,
      //   currency: 'usd',
      //   customer: 'cus_MidwZRsQaRWWlp',
      // });

      // const balanceTransactions = await stripe.balanceTransactions.list({
      // });

      //retrieve paymentIntents
      // const paymentIntents = await stripe.paymentIntents.list({
      //   limit: 3,
      //   starting_after: "pi_3M26ZDSHp8ZbAYVA1fHCFAXj",
      // });

      // console.log(paymentIntents.data.length);
      // //send the response
      // return res.ok({
      //   data: paymentIntents,
      //   error: "",
      // });

      // //Edit Product details
      // const product = await stripe.products.update("prod_MiNDpbxMnXCcjA", {
      //   name: "Netflix",
      //   images: [
      //     "https://ci5.googleusercontent.com/proxy/n4C7xL0BabZVUEJ1T39EcpmY3OZ9ha8pjERB0ELvpa-pS2ogqRtO8O1hWmOu1EcokjT8X7vdnfHUBrM3oUIPg91CVmc9wk1rIPfHyzUMyNWYIft3nDkO8LAv4nLz0QKqTyevDgEndDsup3-12-MMERTKoEUB=s0-d-e1-ft#https://stripe-images.s3.amazonaws.com/html_emails/2022-09-13/header/stripe_logo_blurple_email.png",
      //   ],
      // });
      // console.log(product);
      // return res.ok({
      //   data: product,
      // });

      // //Price Update
      // const price = await stripe.prices.update(
      //     'price_1Lyx6LSHp8ZbAYVABzpxKidi',
      //     {active: false}
      //   );
      // console.log(price);
      // return res.ok({
      //   data: price,
      // });

      // const charge = await stripe.charges.create({
      //     amount: 2000,
      //     currency: 'usd',
      //     source: 'tok_amex',
      //     description: 'First Test Charge'
      // });
      //   console.log(charge);
      //   console.log("sassa");
    } catch (error) {
      return res.serverError({
        data: {},
        message: "",
        error: error.toString(),
      });
    }
  },
  createInvoice: async function (req, res) {
    try {
      const stripe = require("stripe")(
        "sk_test_51Lyvv0SHp8ZbAYVAWZVjDIyCCIVtWT0dQUC32l08lIUuKcAisPP4VK8v2ZXh4C3K0UUxk3KW1tbtOJLgi0zOdaf900h26XLgZV"
      );
      // const invoice = await stripe.invoices.create({
      //   customer: 'cus_MidwZRsQaRWWlp',
      //   subscription:'sub_1M26ZCSHp8ZbAYVANHe6hTzF'
      // });
      // const invoice = await stripe.invoices.retrieve(
      //   'in_1M27ABSHp8ZbAYVAdqvHKgZm'

      // );
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: "cus_MidwZRsQaRWWlp",
        subscription: "sub_1M27ABSHp8ZbAYVAfxR3SHrc",
      });
      console.log(invoice.lines.data);
      //send the response
      return res.ok({
        data: invoice,
        error: "",
      });
    } catch (error) {
      console.log(error);
    }
  },
};
