import { Router } from "express";
import { login } from "../controller/loginRegisterApi.js";

const loginRegisterRouter = Router();
loginRegisterRouter.post('/login', login);

export default loginRegisterRouter;