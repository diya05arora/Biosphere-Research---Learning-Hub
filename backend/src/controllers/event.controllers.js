import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Event } from "../models/event.models.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import { normalizeEventPayload, isValidEventPayload } from "../utils/eventUtils.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";


const createEvent = asyncHandler(async (req, res) => {
    if(req.user.role !== 'admin'){
        throw new ApiError(403, "Only admins can create events");
    }

    if (req.body === undefined) {
        throw new ApiError(400, "All fields are required.")
    }

    const imageLocalPath = req.file?.path;
    console.log("Image local path: ", imageLocalPath);

    // Normalize incoming payload and validate
    const normalized = normalizeEventPayload(req.body, {});
    if (!isValidEventPayload(normalized)) {

        deleteUnusedFiles(imageLocalPath);
        throw new ApiError(400, "All fields are required.");
    }
    console.log("Normalized Event Payload: ", normalized);

    const { title, description, location, date, startTime, endTime } = normalized;

    const existedEvent = await Event.findOne({ title });

    if (existedEvent) {
        deleteUnusedFiles(imageLocalPath);
        throw new ApiError(409, "Event with this title already exists");
    }
    console.log("existed event", existedEvent);

    if(startTime >= endTime){
        deleteUnusedFiles(imageLocalPath);
        throw new ApiError(400, "Event end time must be after start time");
    }

    if(new Date(date) < new Date()){
        deleteUnusedFiles(imageLocalPath);
        throw new ApiError(400, "Event date must be in the future");
    }

    if(date.toLocaleDateString() !== startTime.toLocaleDateString() || date.toLocaleDateString() !== endTime.toLocaleDateString()){
        deleteUnusedFiles(imageLocalPath);
        throw new ApiError(400, "Event start time and end time must be on the same date as the event date");
    }

    if(startTime.Date !== date.Date || endTime.Date !== date.Date){
        deleteUnusedFiles(imageLocalPath);
        throw new ApiError(400, "Event start time and end time must be on the same date as the event date");
    }

    // if the location and time overlap with an existing event, throw an error
    const overlappingEvent = await Event.findOne({
        location,
        date,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    });

    if (overlappingEvent) {
        deleteUnusedFiles(imageLocalPath);
        throw new ApiError(409, "An event is already scheduled at this location and time");
    }

    let image;
    try {
        if (!imageLocalPath) {
            throw new ApiError(400, "Image is required");
        }
        console.log("Attempting to upload file:", imageLocalPath);
        image = await uploadOnCloudinary(imageLocalPath);
    } catch (error) {
        console.error("Upload error details:", error);
        throw new ApiError(400, `Failed to upload image: ${error.message}`);
    } finally {
        deleteUnusedFiles(imageLocalPath);
    }

    try {
        const event = await Event.create({
            title: title.trim().toLowerCase(),
            description,
            location: location.trim().toLowerCase(),
            date: new Date(date),
            startTime,
            endTime,
            image: image?.url,
            imagePublicId: image?.public_id,    
        })

        const createdEvent = await Event.findById(event._id);

        if (!createdEvent) {
            throw new ApiError(500, "Something went wrong while creating an event!")
        }

        return res
            .status(201)
            .json(new ApiResponse(201, createdEvent, "Event created successfully!"))

    } catch (error) {
        console.log("Event creation failed: ", error);
        deleteUnusedFiles(imageLocalPath);

        if (image) {
            await deleteFromCloudinary(image.public_id);
        }
        throw new ApiError(500, "Something went wrong while creating an event and images were deleted!")
    }
})

const deleteEvent = asyncHandler(async (req, res) => {
    if(req.user.role !== 'admin'){
        throw new ApiError(403, "Only admins can delete events");
    }
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found");
    }
    await Event.findByIdAndDelete(eventId);

    if (event.imagePublicId) {
        await deleteFromCloudinary(event.imagePublicId);
    }
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Event deleted successfully!"))
})

const updateEvent = asyncHandler(async (req, res) => {
    if(req.user.role !== 'admin'){
        throw new ApiError(403, "Only admins can update events");
    }
    const { eventId } = req.params;
    const { title, description, location, date, startTime, endTime } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    // check if title is being updated to an existing title
    if (title && title.trim().toLowerCase() !== event.title) {
        const existingEvent = await Event.findOne({ _id: { $ne: eventId }, title: title.trim().toLowerCase() });
        if (existingEvent) {
            throw new ApiError(409, "Event with this title already exists");
        }
    }

    // normalize incoming values; fall back to existing event values when not provided
    const newTitle = typeof title === 'string' ? title.trim().toLowerCase() : event.title;
    const newDescription = typeof description === 'string' ? description : event.description;
    const newLocation = typeof location === 'string' ? location.trim().toLowerCase() : event.location;
    const newDate = date ? new Date(date) : event.date;
    const newStartTime = startTime ? new Date(startTime) : event.startTime;
    const newEndTime = endTime ? new Date(endTime) : event.endTime;

    // check overlapping events using the normalized values
    const overlappingEvent = await Event.findOne({
        location: newLocation,
        date: newDate,
        $or: [
            {
                _id: { $ne: eventId },
                startTime: { $lt: newEndTime },
                endTime: { $gt: newStartTime }
            }
        ]
    });

    if (overlappingEvent) {
        throw new ApiError(409, "An event is already scheduled at this location and time");
    }

    if(newStartTime >= newEndTime){
        throw new ApiError(400, "Event end time must be after start time");
    }

    if(new Date(newDate) < new Date()){
        throw new ApiError(400, "Event date must be in the future");
    }

    if(newDate.toLocaleDateString() !== newStartTime.toLocaleDateString() || newDate.toLocaleDateString() !== newEndTime.toLocaleDateString()){
        throw new ApiError(400, "Event start time and end time must be on the same date as the event date");
    }

    // Update fields (use normalized values)
    event.title = newTitle;
    event.description = newDescription;
    event.location = newLocation;
    event.date = newDate;
    event.startTime = newStartTime;
    event.endTime = newEndTime;

    await event.save();

    return res
        .status(200)
        .json(new ApiResponse(200, event, "Event updated successfully!"))
})


const registerForEvent = asyncHandler(async(req, res) => {
    const { eventId } = req.params;
    if(!eventId){
        throw new ApiError(400, "Event ID is required");
    }

    const event = await Event.findById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    // Check if user is already registered
    if (event.registeredUsers.includes(req.user._id)) {
        throw new ApiError(409, "User already registered for this event");
    }

    // check if the event overlaps with another event the user is registered for
    const userEvents = await Event.find({ registeredUsers: req.user._id });
    for (const userEvent of userEvents) {
        if (
            userEvent.date.toDateString() === event.date.toDateString() &&
            event.startTime < userEvent.endTime && event.endTime > userEvent.startTime
        ) {
            throw new ApiError(409, "Event timing overlaps with another registered event");
        }
    }

    event.registeredUsers.push(req.user._id);
    await event.save();
    return res
        .status(200)
        .json(new ApiResponse(200, event, "User registered for event successfully!"))
})

const unregisterFromEvent = asyncHandler(async(req, res) => {
    const { eventId } = req.params;
    if(!eventId){
        throw new ApiError(400, "Event ID is required");
    }

    const event = await Event.findById(eventId);

    if (!event) {
        throw new ApiError(404, "Event not found");
    }
    // Check if user is registered
    if (!event.registeredUsers.includes(req.user._id)) {
        throw new ApiError(409, "User is not registered for this event");
    }

    event.registeredUsers = event.registeredUsers.filter(userId => userId.toString() !== req.user._id.toString());
    await event.save();
    return res
        .status(200)
        .json(new ApiResponse(200, event, "User unregistered from event successfully!"))
});

const getAllEvents = asyncHandler(async (req, res) => {
    const events = await Event.find();
    if (!events) {
        throw new ApiError(404, "No events found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, events, "Events fetched successfully!"))
});



function deleteUnusedFiles(filePath) {
    try {
        if (filePath){
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error("Failed to delete file:", error);
    }
}


export {
    createEvent,
    deleteEvent,
    updateEvent,
    registerForEvent,
    unregisterFromEvent,
    getAllEvents
}