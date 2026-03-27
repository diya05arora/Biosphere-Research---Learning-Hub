import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import passport from "passport"
import session from "express-session"
import "./config/passport.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import eventRouter from "./routes/event.routes.js"
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares/error.middlewares.js"

const app = express()

// Security middleware - must be before other middlewares
app.use(helmet())

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many authentication attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false
})

// General rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
})

// middlewares
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

// common middlewares
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"))
app.use(cookieParser());

// Session middleware - must be before passport
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            httpOnly: true
        }
    })
);

// Passport middleware - MUST be after session
app.use(passport.initialize());
app.use(passport.session());

app.use(limiter);

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);  
app.use("/api/v1/events",  eventRouter);

app.use(errorHandler);


export { app, authLimiter, limiter }