import express from "express";

import{ changeStatus, createTodo, deleteAllTemp, getTodos, tmpDeleteTodo, updateDesc }  from "../controllers/todoControllers.js";
import { verifyTokenMiddleware } from "../middlewares/index.js";
import { loginUser, signupUser, verify } from "../controllers/authControllers.js";
const router = express.Router();

router.post("/api/auth/register",signupUser)
router.post("/api/auth/login",loginUser)
router.get("/api/auth/verify",verifyTokenMiddleware,verify)

router.get("/api/getTodos/:adminName",verifyTokenMiddleware,getTodos)
router.post("/api/createtodo/:id",verifyTokenMiddleware,createTodo)

router.put("/api/:id/status",changeStatus)
router.put("/api/:id/updatedesc",updateDesc)

router.put("/api/:id/tmpdeltodo",verifyTokenMiddleware,tmpDeleteTodo)
router.delete("/api/:id/deleteAllTemp",verifyTokenMiddleware,deleteAllTemp)





export default router