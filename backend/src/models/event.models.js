import mongoose, {Schema} from "mongoose";

const eventSchema = new Schema(
    {
        title: { type: String, required: true , lowercase: true, unique: true},
        description: { type: String, required: true },
        location: { type: String, required: true, lowercase: true },
        date: { type: Date, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        image: { type: String }, // cloudinary image url
        imagePublicId: { type: String }, // cloudinary public id
        registeredUsers : [{ type: Schema.Types.ObjectId, ref: "User" }]
    },
    { timestamps: true
    }
);

export const Event = mongoose.model("Event", eventSchema);
