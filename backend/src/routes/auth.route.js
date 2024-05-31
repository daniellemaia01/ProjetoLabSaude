const { Router } = require("express");
const router = Router();

const login = require("../controllers/auth.controller.js");

router.post("/", login);

module.exports = router;