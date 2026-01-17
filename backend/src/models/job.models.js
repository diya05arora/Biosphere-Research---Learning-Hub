import mongoose, { Schema } from "mongoose"
import { User } from "./user.models.js";

const jobSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        location: { type: String, required: true },
        salary: { type: Number, required: true },
        appliedUsers : [{ type: Schema.Types.ObjectId, ref: "User" }]
    },
    { timestamps: true }
)

export const Job = mongoose.model("Job", jobSchema)