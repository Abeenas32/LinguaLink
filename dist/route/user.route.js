"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_schema_1 = require("./../validators/user.schema");
const user_controller_1 = require("../controller/user.controller");
const express_1 = require("express");
const validator_1 = require("../middleware/validator");
const router = (0, express_1.Router)();
router.post("/register", (0, validator_1.validate)(user_schema_1.registerSchema), user_controller_1.registerUser);
exports.default = router;
