import { Router } from "express";
import { createEvent, deleteEvent, updateEvent, registerForEvent, unregisterFromEvent, getAllEvents } from "../controllers/event.controllers.js"

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

// secured routes
router.route("/create-event").post(
    upload.single("image"),
    verifyJWT,
    createEvent
)

router.route("/delete-event/:eventId").delete(
    verifyJWT,
    deleteEvent
)

router.route("/update-event/:eventId").post(
    verifyJWT,
    updateEvent
)

router.route("/register-for-event/:eventId").post(
    verifyJWT,
    registerForEvent
)

router.route("/unregister-from-event/:eventId").post(
    verifyJWT,
    unregisterFromEvent
)

router.route("/get-all-events").get(
    verifyJWT,
    getAllEvents
)


export default router;