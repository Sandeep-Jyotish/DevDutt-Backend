/**
 * PdfMakerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var PDFDocument = require("pdfkit");
const fs = require("fs");
var path = require("path");
const ejs = require("ejs");
// const pdf = require("html-pdf");
const puppeteer = require("puppeteer");
let handlebars = require("handlebars");
module.exports = {
  pdfcreate: async function (req, res) {
    try {
      console.log("start");
      // Create a document
      const doc = new PDFDocument();
      // Saving the pdf file in root directory.
      doc.pipe(
        fs.createWriteStream("/home/ztlab23/Downloads/image/example.pdf")
      );
      ejs.renderFile(
        path.join(__dirname, "/home/ztlab23/demostripe/views/pages/demo.ejs"),
        (err, data) => {
          if (err) {
            res.send(err);
          } else {
            res.send(data);
          }
        }
      );
      // Adding functionality
      doc.fontSize(27).text("Hello, PDF created", 100, 100);
      doc.text("This is a footer", 20, doc.page.height - 50, {
        lineBreak: false,
      });
      // Add some text with annotations
      // Apply some transforms and render an SVG path with the
      // 'even-odd' fill rule
      doc
        .scale(0.6)
        .translate(470, -380)
        .path("M 250,75 L 323,301 131,161 369,161 177,301 z")
        .fill("red", "even-odd")
        .restore();

      // Finalize PDF file
      doc.end();
      console.log("end");
    } catch (error) {
      console.log(error);
    }
  },
  cron: async function (req, res) {
    // try {
    //   sails.hooks.cron.jobs.myJob.start();

    //   // await sails.helpers.cronTest.with({
    //   // });
    //   return res.ok({
    //     message: "cron after 5 sec",
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
    try {
      // const filePathName = path.resolve(
      //   __dirname,
      //   "/home/ztlab23/demostripe/views/pages/demo.hbs"
      // );
      // const htmlString = fs.readFileSync(filePathName).toString();

      // let  options = { format: 'Letter' };
      // const ejsData = ejs.render(htmlString, data);
      // let templateHtml = fs.readFileSync(filePathName, "utf8");
      let name = "sandeep Kumar";
      
      // templateHtml = templateHtml.replace('{{name}}', name)
      // let template = handlebars.compile(templateHtml);
      // let replacements = {
      //   name: name,
      //   phoneNo: "232322",
      //   message: "sasasa",
      // };
      // templateHtml = template(replacements);

      // await pdf.create(templateHtml, options).toStream(function (err, stream) {
      //   stream.pipe(fs.createWriteStream("/home/ztlab23/Downloads/image/example.pdf"));
      //   console.log(stream);

      //   return res.ok({
      //     message: "pdf created",
      //     data: stream.path,
      //   });

      // });
      let pdfFormat = await sails.helpers.pdf.prepareTemplate.with({
        pdfType: "invoicePDF",
        data: {
          logo: "https://buzo-test.s3.ap-south-1.amazonaws.com/assets/fa5a10c5-9542-42b4-919a-4760f6d75292.svg",
            name: name,
            phoneNo: "232322",
            message: "message from pdf maker",
        }
      });
      res.set("Content-type", "application/pdf");
      res.set("Content-Disposition", "attachment; filename=Invoice.pdf;");
      // await pdf.create(pdfFormat, options).toStream(function (err, stream) {
      //   if (err) {
      //     sails.log.error(err);
      //     return exits.error(err);
      //   }
      //   stream.pipe(res);

      // });

      const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        headless: true,
      });
      let page = await browser.newPage();

      
      // await page.goto(`data:text/html,${pdfFormat}`, {
      //   waitUntil: "networkidle0",
      // });
      let path = ''
      await page.setContent(pdfFormat); 
      let pdf = await page.pdf({path});
      res.set("Content-type", "application/pdf");
            res.set("Content-Disposition", "attachment; filename=Invoice.pdf;");
            res.send(pdf);
      
      await browser.close();
      console.log(pdf.location );
      // fs.unlinkSync('/home/zt63/Downloads/pdf.pdf')
      // let fileDetail = await sails.uploadOne(pdf, {
      //     dirname: '/home/zt63/Downloads/',
      //   });
     
      // return res.ok({
      //   pdf: pdf,
      //             });
      // fs.unlinkSync('/home/zt63/Downloads/pdf.pdf')
      // res.set("Content-type", "application/pdf");
      //       res.set("Content-Disposition", "attachment; filename=Invoice.pdf;");
      //       res.send(pdf);
      // //uploading the file in sails
      // let fileDetail = await sails.uploadOne(pdf, {
      //   dirname: '/home/zt63/Downloads/',
      // });
      // return res.ok({
      //   pdf: pdf,
      //             });
      
      // let fileObject = {
      //   dirname: "/home/ztlab23/Downloads/image",
      //   maxBytes: 90000000,
      // };
      // console.log(pdf);
      // let fileDetail = await sails.uploadOne(pdf,fileObject);
      // fs.createWriteStream("/home/ztlab23/Downloads/image/")
      // Returning the file read stream for the download
      //let filestream = fs.createReadStream("/home/zt63/Downloads/video/pdf.pdf");
      //filestream.pipe(res);
      // fs.unlinkSync("/home/ztlab23/Downloads/image/pdf.pdf")
      // res.send(pdf);

      //     .create(templateHtml, options)
      //     .toFile(
      //       "/home/ztlab23/Downloads/image/example.pdf",
      //       (err, response) => {
      //         if (err) {
      //           return console.log(err);
      //         } else {
      //           //send the response
      //           return res.ok({
      //             message: "pdf created",
      //           });
      //         }
      //       }
      //     );
    } catch (err) {
      console.log("Error processing request: " + err);
    }
  },
};
