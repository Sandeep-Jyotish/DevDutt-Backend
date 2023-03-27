let fs = require("fs");
let path = require("path");
let handlebars = require("handlebars");
module.exports = {


  friendlyName: 'Prepare template',


  description: '',


  inputs: {
    pdfType: {
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
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    let TemplateBasePath = "views/pages";
    let invoicePdfTemplateFile = await fs.readFileSync(
      path.join(TemplateBasePath, `${inputs.pdfType}.hbs`),
      {
        encoding: "utf-8",
      }
    );
    // const filePathName = path.resolve(
    //   __dirname,
    //   "/home/ztlab23/demostripe/views/pages/demo.hbs"
    // );
    // let templateHtml = fs.readFileSync(filePathName, "utf8");
    let template = handlebars.compile(invoicePdfTemplateFile);
    
    let replacements = {
      logo: inputs.data.logo,
      name: inputs.data.name,
      phoneNo: inputs.data.phoneNo,
      message: inputs.data.message,
    };
    invoicePdfTemplateFile = template(replacements);
    return invoicePdfTemplateFile;
  }


};

