const MailTypes = sails.config.constants.MailTypes;
const GetMessages = sails.config.getMessages;
module.exports = {
  friendlyName: "Send mail",

  description: "",

  inputs: {
    mailType: {
      type: "string",
    },
    data: {
      type: "json",
    },
    lang: {
      type: "string",
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs) {
    // TODO
    let SMTPTransport = sails.config.constants.Transport;

    let mailOptions = {
      to: inputs.data.email,
      from: "devdut@gmail.com",
      subject: inputs.data.subject,
      text: inputs.data.text,
      // html: mailBody,
    };
    // Sends email asynchronously and capturing the response
    SMTPTransport.sendMail(mailOptions, (err) => {
      // Handle the error if any and return the mailError exit route
      if (err) {
        sails.log.error(err);
        return exits.error(err);
      }
      sails.log.info("send mail successfull ...");
      // Mail has been sent successfully.
      return exits.success(true);
    });
  },
};
