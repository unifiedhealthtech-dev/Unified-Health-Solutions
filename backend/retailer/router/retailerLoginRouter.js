import { Router } from "express";
import { login, logout } from "../controller/loginApi.js";

const retailerLoginRouter = Router();
retailerLoginRouter.post('/login', login);
retailerLoginRouter.post('/logout', logout);


export default retailerLoginRouter;