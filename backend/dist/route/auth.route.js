"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const login_controller_1 = require("../controller/login.controller");
const login_schema_1 = require("../validators/login.schema");
const validator_1 = require("../middleware/validator");
const router = (0, express_1.Router)();
router.post("/login", (0, validator_1.validate)(login_schema_1.loginSchema), login_controller_1.login);
exports.default = router;
