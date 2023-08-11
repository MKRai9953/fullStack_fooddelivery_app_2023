const router = require("express").Router();
const admin = require("firebase-admin");
let data = [];

router.get("/", (req, res) => {
  return res.send("inside the user router");
});

router.get("/jwtverification", async (req, res) => {
  // res.send("jwt verfication");
  if (!req.headers.authorization) {
    return res.status(500).send({ msg: "Token not found" });
  }

  const token = req.headers.authorization.split(" ")[1];
  try {
    const decodedValue = await admin.auth().verifyIdToken(token);
    if (!decodedValue) {
      return res
        .status(500)
        .json({ success: false, msg: "unauthorised access" });
    }
    return res.status(200).json({ success: true, data: decodedValue });
  } catch (err) {
    return res.send({
      success: false,
      msg: `error in extracting the token : ${err}`,
    });
  }
});

const listAllUsers = async (nextpagetoken) => {
  // let data = [];
  await admin
    .auth()
    .listUsers(1000, nextpagetoken)
    .then((listuserResult) => {
      console.log(listuserResult);
      listuserResult.users.forEach((rec) => {
        data.push(rec.toJSON());
      });
      if (listuserResult.pageToken) {
        listAllUsers(listuserResult.pageToken);
      }
    })
    .catch((er) => console.log(er));
  // return data;
};

// listAllUsers();

router.get("/all", async (req, res) => {
  try {
    await listAllUsers();
    // console.log("yoo", data);
    return res.status(200).send({ success: true, data: data });
  } catch (er) {
    return res.send({ success: false, msg: `Error in listing users: ,${er}` });
  }
});
module.exports = router;
