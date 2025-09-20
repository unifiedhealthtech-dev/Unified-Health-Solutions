import { Router } from "express";
import { login, logout } from "../controller/loginApi.js";

const distributorLoginRouter = Router();
distributorLoginRouter.post('/login', login);
distributorLoginRouter.post('/logout', logout);


export default distributorLoginRouter;