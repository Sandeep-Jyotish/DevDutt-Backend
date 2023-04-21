/**
 * DeeplinkController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
//var deeplink = require("node-deep-links");

var admin = require("firebase-admin");
var FCM = require("fcm-node");
const FS = require("fs");
var serviceAccount = require("/home/zt63/devdutt-backend/config/serviceAccountKey.json");
const Firebase = require("firebase/app");
const { sendPasswordResetEmail, getAuth } = require("firebase/auth");
require("firebase/auth");
const firebaseConfig = {
  apiKey: "AIzaSyDObHW0p3CtJx8vgdiDF30l58uSPAJs180",
  authDomain: "fcm-test-c1c5c.firebaseio.com",
  projectId: "fcm-test-c1c5c",
  storageBucket: "gs://fcm-test-c1c5c.appspot.com",
  messagingSenderId: "994728356963",
  appId: "1:994728356963:android:744ac46bbec2852eca9c56",
};
Firebase.initializeApp(firebaseConfig);

admin.initializeApp({
  firebaseConfig,
  credential: admin.credential.cert(serviceAccount),
});

// require("firebase/auth");
module.exports = {
  firebase: async function (req, res) {
    try {
      var topic = "general";
      var message = {
        notification: {
          title: "Message from node",
          body: "hey there",
        },
        topic: topic,
      };
      // Send a message to devices subscribed to the provided topic.
      admin
        .messaging()
        .send(message)
        .then((response) => {
          // Response is a message ID string.
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
      return res.ok({
        data: message,
      });
    } catch (error) {
      return error;
    }
  },
  fcm: async function (req, res) {
    try {
      var serverKey =
        "BM9_RYCQAh5zvLFntXQwRNQ0D4vUGqtZ-3D-4sj-KIVQHN5YTYMk1-jUE2rmBuxTY3IVh1hq-FclJFTpmwg3hWE"; //put your server key here
      var fcm = new FCM(serverKey);

      var message = {
        //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: "1938828554574115310",
        collapse_key: "green",

        notification: {
          title: "Title of your push notification",
          body: "Body of your push notification",
        },

        // data: {  //you can send only notification or only data(or include both)
        //     my_key: 'BM9_RYCQAh5zvLFntXQwRNQ0D4vUGqtZ-3D-4sj-KIVQHN5YTYMk1-jUE2rmBuxTY3IVh1hq-FclJFTpmwg3hWE',
        //     my_another_key: 'my another value'
        // }
      };

      fcm.send(message, function (err, response) {
        console.log(message);
        if (err) {
          console.log("Something has gone wrong!");
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });
      return res.ok({
        data: message,
      });
    } catch (error) {
      return error;
    }
  },
  getUsers: async function (req, res) {
    try {
      admin
        .auth()
        .listUsers()
        .then((data) => {
          console.log(data.users);
          return res.ok({
            data: data.users,
          });
        });
    } catch (error) {
      console.log(error);
    }
  },
  signup: async function (req, res) {
    try {
      const email = req.body.email;
      const password = req.body.password;
      let id = "";

      admin
        .auth()
        .createUser({
          email: email,
          password: password,
        })
        .then(function (userRecord) {
          // admin.auth().sendPasswordResetEmail(email);
          // A UserRecord representation of the newly created user is returned
          id = userRecord.uid;
          console.log("Successfully created new user:", userRecord.uid);
          return res.ok({
            data: userRecord,
          });
        })
        .catch(function (error) {
          console.log("Error creating new user:", error);
          return res.serverError({
            data: {},
            message: "2 catch error",
            error: error.toString(),
          });
        });
    } catch (error) {
      return error;
    }
  },
  signinWthEmail: async function (req, res) {
    try {
      let email = req.body.email;
      let password = req.body.password;

      admin
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
          // if user found
          console.log(user);
          return res.ok({
            data: user,
            message: "success",
            error: "",
          });
        })
        .catch((err) => {
          return res.serverError({
            data: {},
            message: "2 catch error",
            error: err.toString(),
          });
        });
    } catch (error) {
      return res.serverError({
        data: {},
        message: "",
        error: error.toString(),
      });
    }
  },
  createToken: async function (req, res) {
    try {
      var myTokenToSave;
      admin
        .auth()
        .createCustomToken("yUIRTn2iXKVgYVe9nt2GAPQcYBa2")
        .then(function (customToken) {
          myTokenToSave = customToken;
          console.log("Token: ", myTokenToSave);
        });
      return res.ok({
        data: myTokenToSave,
      });
    } catch (error) {
      return error;
    }
  },
  authenticateToken: async function (req, res) {
    try {
      let idToken = req.body.idToken;
      console.log(idToken);
      var uid;
      admin
        .auth()
        .verifyIdToken(idToken)
        .then(function (decodedToken) {
          uid = decodedToken.uid;
          console.log("id :", uid);
          // ...
        })
        .catch(function (error) {
          console.log(error);
          // Handle error
        });
      return res.ok({
        data: uid,
      });
    } catch (error) {
      // console.log(error);
      return res.serverError({
        error: error,
      });
    }
  },
  signinWthAuthToken: async function (req, res) {
    try {
      let token = req.body.token;
      admin
        .auth()
        .signInWithCustomToken(auth, token)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user);
          res.ok({ user: user });
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ...
        });
    } catch (error) {
      return error;
    }
  },
  resetPasswordSendMail: async function (req, res) {
    try {
      let email = req.body.email;
      let auth = getAuth();
      // admin
      //   .auth()
      //   .generatePasswordResetLink(email)
      //   .then((link) => {
      //     console.log(link);
      //     admin.auth().sendPasswordResetEmail(email);
      //     console.log(link);
      //     return res.ok({
      //       data: link,
      //     });
      //   })
      sendPasswordResetEmail(auth, email)
        .then((password) => {
          return res.ok({
            data: password,
            message: "Password reset mail sent Successfully",
          });
        })
        .catch(function (error) {
          // An error happened.
          return res.serverError({
            data: {},
            message: "",
            error: error.toString(),
          });
        });
    } catch (error) {
      console.log(error);
    }
  },
  updateUser: async function (req, res) {
    try {
      let { uid, phoneNumber, email, displayName, photoURL } = req.body;

      admin
        .auth()
        .updateUser(uid, {
          displayName: displayName,
          email: email,
          photoURL: photoURL,
          phoneNumber: phoneNumber,
        })
        .then(function (userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log("Successfully updated user", userRecord.toJSON());
        })
        .catch(function (error) {
          console.log("Error updating user:", error);
        });
      return res.ok({
        data: uid,
      });
    } catch (error) {
      console.log(error);
    }
  },
  deleteUser: async function (req, res) {
    try {
      let uid = req.body.uid;
      admin
        .auth()
        .deleteUser(uid)
        .then(() => {
          console.log("Successfully deleted user");
          return res.ok({
            message: "Successfully deleted user",
          });
        })
        .catch((error) => {
          console.log("Error deleting user:", error);
        });
    } catch (error) {
      console.log(error);
    }
  },
  uploadFile: async function (req, res) {
    try {
      let fileDetails;
      let path;
      let file = req.file("file");
      let type = req.body.type;
      let destination = "";
      let currentTime = Math.floor(Date.now() / 1000);
      // let filedetail;
      if (type === "video") {
        destination = `video/${currentTime}video.mp4`;
      }
      if (type === "image") {
        destination = `image/${currentTime}image.jpeg`;
      }

      let fileObject = {
        dirname: "/home/zt63/Downloads",
        maxBytes: 90000000,
      };
      fileDetails = await sails.uploadOne(file, fileObject);
      path = fileDetails.fd;
      //console.log(path);

      let upload = await admin
        .storage()
        .bucket(`gs://fcm-test-c1c5c.appspot.com`)
        .upload(path, {
          destination: destination,
        });

      try {
        FS.unlinkSync(path);
        console.log(upload);
        return res.json({
          message: " file(s) uploaded successfully!",
          data: upload[0].metadata,
        });
      } catch (error) {}
    } catch (error) {
      console.log(error.toString());
    }
  },
  downloadFile: async function (req, res) {
    try {
      let path = req.body.path;
      admin
        .storage()
        .bucket(`gs://fcm-test-c1c5c.appspot.com`)
        .file(path)
        .download(function (err, data) {
          if (err) {
            // var object = JSON.parse(data);
            console.log(err.toString());
            return res.ok({
              error: err.toString(),
            });
          }
          let buffer = Buffer.from(data);
          FS.writeFile("pic.png", buffer, (err) => {
            if (err) throw err;
            res.send("pic.png");
            console.log("The file has been saved!");
          });
        });
    } catch (error) {
      console.log(error);
    }
  },
  deleteFile: async function (req, res) {
    let file = req.body.file;
    console.log(file);
    try {
      console.log(file);
      let data = await admin
        .storage()
        .bucket("fcm-test-c1c5c.appspot.com")
        .file(file)
        .getMetadata();
      // .delete();
      return res.json({
        message: " file(s) deleted successfully!",
        data: data,
      });
    } catch (error) {
      return error;
    }
  },
  dataTest: async function (req, res) {
    try {
      let data = req.body;
      console.log("data", data);

      let raw = req.rawBody;
      // console.log("raw", raw);
      return res.ok({
        raw: raw,
      });
    } catch (error) {
      console.log(error);
      return res.serverError({
        error: error,
      });
    }
  },
};
