const pdf = require("html-pdf");
let fs = require("fs");
const puppeteer = require("puppeteer");
module.exports = {


  friendlyName: 'Make pdf',


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


  fn: async function (inputs, exits) {
    
    let pdfFormat = await sails.helpers.pdf.prepareTemplate.with(inputs);

    let options = {
      height: "1922px",
      width: "1282px",
    };

    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: true,
    });
    var page = await browser.newPage();

    
    await page.goto(`data:text/pdfFormat,${pdfFormat}`, {
      waitUntil: "networkidle0",
    });
    const pdf = await page.pdf({ format: "A4" });
    await browser.close();
    console.log(pdf);
    return pdf;
    // await pdf.create(pdfFormat, options).toStream(function (err, stream) {
    //   if (err) {
    //     sails.log.error(err);
    //     return exits.error(err);
    //   }
    //   stream.pipe(fs.createWriteStream("/home/ztlab23/Downloads/image/example.pdf"));
    //   return exits.success(true);
 
    // });
    
  }


};

