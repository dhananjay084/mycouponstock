import express from "express";
import { subscribeUser, unsubscribeUser } from "../Controllers/subscriberController.js";

const router = express.Router();

router.post("/subscribe", subscribeUser);
router.get("/unsubscribe", unsubscribeUser);
router.post("/unsubscribe", unsubscribeUser);

export default router;
