import { Router } from "express";
import { login, logout } from "../controller/loginApi.js";

const loginRouter = Router();
loginRouter.post('/login', login);
loginRouter.post('/logout', logout);


export default loginRouter;