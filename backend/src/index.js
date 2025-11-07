// load environment variables as early as possible
import 'dotenv/config'
import { app } from "./app.js"
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 7000;

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB Connection error", err)
})