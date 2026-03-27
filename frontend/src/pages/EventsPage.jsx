import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiRequest } from "../lib/api";

function toTitleCase(str = "") {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}

function toInputTime(value) {
  if (!value) return "";
  const dt = new Date(value);
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [canViewEvents, setCanViewEvents] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isManaging, setIsManaging] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    startTime: "",
    endTime: "",
    image: null,
  });

  function withTimeout(promise, ms = 15000, errorMessage = "Request timed out") {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(errorMessage)), ms);
      }),
    ]);
  }

  function resetForm() {
    setEditingEventId(null);
    setFormState({
      title: "",
      description: "",
      location: "",
      date: "",
      startTime: "",
      endTime: "",
      image: null,
    });
    setMessage("");
  }

  function openCreateModal() {
    resetForm();
    setIsFormModalOpen(true);
  }

  function closeFormModal() {
    setIsFormModalOpen(false);
    resetForm();
  }

  async function load() {
    setIsLoading(true);
    setErrorMessage("");
    const token = localStorage.getItem("refreshToken");
    if (!token) {
      setCanViewEvents(false);
      setUserId(null);
      setUserRole(null);
      setEvents([]);
      setIsLoading(false);
      return;
    }

    const me = await apiRequest("/users/current-user", { method: "GET" });
    if (me.response.ok && me.payload?.data?._id) {
      setUserId(me.payload.data._id);
      setUserRole(me.payload.data.role);
      setCanViewEvents(true);
    }
    if (!me.response.ok) {
      setCanViewEvents(false);
      setUserId(null);
      setUserRole(null);
      setEvents([]);
      setIsLoading(false);
      return;
    }

    const all = await apiRequest("/events/get-all-events", { method: "GET" });
    if (all.response.ok) {
      setEvents(all.payload?.data || []);
    } else {
      setErrorMessage(all.payload?.message || "Failed to load events.");
    }
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function register(eventId) {
    const res = await apiRequest(`/events/register-for-event/${eventId}`, { method: "POST" });
    if (!res.response.ok) {
      setErrorMessage(res.payload?.message || "Failed to register for event.");
      return;
    }

    if (!userId) return;

    setEvents((prev) =>
      prev.map((event) => {
        if (event._id !== eventId) return event;
        const registeredUsers = Array.isArray(event.registeredUsers) ? event.registeredUsers : [];
        if (registeredUsers.includes(userId)) return event;
        return { ...event, registeredUsers: [...registeredUsers, userId] };
      })
    );
  }

  async function unregister(eventId) {
    const res = await apiRequest(`/events/unregister-from-event/${eventId}`, { method: "POST" });
    if (!res.response.ok) {
      setErrorMessage(res.payload?.message || "Failed to unregister from event.");
      return;
    }

    if (!userId) return;

    setEvents((prev) =>
      prev.map((event) => {
        if (event._id !== eventId) return event;
        const registeredUsers = Array.isArray(event.registeredUsers) ? event.registeredUsers : [];
        return { ...event, registeredUsers: registeredUsers.filter((id) => id !== userId) };
      })
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(editingEventId ? "Updating event..." : "Creating event...");

    try {
      const fd = new FormData(e.currentTarget);
      const date = fd.get("date");
      const start = fd.get("startTime");
      const end = fd.get("endTime");
      const startTime = new Date(`${date}T${start}`).toISOString();
      const endTime = new Date(`${date}T${end}`).toISOString();

      let res;

      if (editingEventId) {
        res = await withTimeout(apiRequest(`/events/update-event/${editingEventId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: fd.get("title"),
            description: fd.get("description"),
            location: fd.get("location"),
            date,
            startTime,
            endTime,
          }),
        }), 15000, "Update request timed out");
      } else {
        const body = new FormData();
        body.append("title", fd.get("title"));
        body.append("description", fd.get("description"));
        body.append("location", fd.get("location"));
        body.append("date", date);
        body.append("startTime", startTime);
        body.append("endTime", endTime);
        if (fd.get("image") && fd.get("image").size) {
          body.append("image", fd.get("image"));
        }

        res = await withTimeout(apiRequest("/events/create-event", {
          method: "POST",
          body,
        }), 15000, "Create request timed out");
      }

      if (!res.response.ok) {
        setMessage(res.payload?.message || "Action failed.");
        return;
      }

      setMessage(editingEventId ? "Event updated successfully!" : "Event created successfully!");
      setIsFormModalOpen(false);
      await withTimeout(load(), 15000, "Refresh request timed out");
      resetForm();
      e.currentTarget.reset();
    } catch {
      setMessage("Unable to save event right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeEvent(eventId) {
    const res = await apiRequest(`/events/delete-event/${eventId}`, { method: "DELETE" });
    if (!res.response.ok) {
      setMessage(res.payload?.message || "Delete failed.");
      return;
    }
    setMessage("Event deleted successfully!");
    await load();
    if (editingEventId === eventId) {
      resetForm();
    }
  }

  function editEvent(event) {
    setEditingEventId(event._id);
    setFormState({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      date: toInputDate(event.date),
      startTime: toInputTime(event.startTime),
      endTime: toInputTime(event.endTime),
      image: null,
    });
    setMessage(`Editing: ${event.title}`);
    setIsFormModalOpen(true);
  }

  const content = useMemo(() => {
    if (isLoading) return <p>Loading events...</p>;
    if (!canViewEvents) {
      return (
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <div className="card p-4 text-center">
              <h4 className="mb-2">Login To See Events</h4>
              <p className="mb-4">Please login to view and register for upcoming events.</p>
              <div>
                <button type="button" className="btn manage-events-btn" onClick={() => navigate("/login")}>Login</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (errorMessage) return <p>{errorMessage}</p>;
    if (!events.length) return <p>No upcoming events.</p>;

    if (isManaging) {
      // Admin manage mode - show event cards with edit/delete buttons
      return (
        <div className="row" id="events-container">
          {events.map((event) => (
            <div className="col-lg-4 col-md-6 d-flex align-items-stretch mb-3" key={event._id}>
              <div className="card event-card">
                <img src={event.image} className="card-img-top" alt={event.title} />
                <div className="card-body">
                  <h5 className="card-title">{toTitleCase(event.title)}</h5>
                  <p className="card-text"><strong>Location:</strong> {toTitleCase(event.location || "TBA")}</p>
                  <p className="card-text"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  <p className="card-text"><strong>Time:</strong> {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(event.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="card-text"><strong>Registered:</strong> {event.registeredUsers?.length || 0} users</p>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => editEvent(event)}>
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeEvent(event._id)}>
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // User view mode - show register/unregister buttons
      return (
        <div className="row" id="events-container">
          {events.map((event) => {
            const isRegistered = userId && (event.registeredUsers || []).includes(userId);
            return (
              <div className="col-lg-4 col-md-6 d-flex align-items-stretch mb-3" key={event._id}>
                <div className="card event-card">
                  <img src={event.image} className="card-img-top" alt={event.title} />
                  <div className="card-body">
                    <h5 className="card-title">{toTitleCase(event.title)}</h5>
                    <p className="card-text"><strong>Location:</strong> {toTitleCase(event.location || "TBA")}</p>
                    <p className="card-text"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                    <p className="card-text"><strong>Time:</strong> {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(event.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    {isRegistered ? (
                      <button type="button" className="btn btn-unregister" onClick={() => unregister(event._id)}>Unregister</button>
                    ) : (
                      <button type="button" className="btn btn-register" onClick={() => register(event._id)}>Register</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  }, [canViewEvents, errorMessage, events, isLoading, navigate, userId, isManaging]);

  const isAdmin = String(userRole || "").toLowerCase() === "admin";

  return (
    <Layout active="events">
      <section id="events" className="events section">
        <div className="container">
          <div className="events-header">
            <div className="events-header-text">
              <h2>Events</h2>
              <p>Check out our upcoming events.</p>
            </div>

            {isAdmin && (
              <button
                type="button"
                className={`btn manage-events-btn ${isManaging ? "is-managing" : ""}`}
                onClick={() => {
                  setIsManaging(!isManaging);
                  if (isManaging) {
                    setIsFormModalOpen(false);
                    resetForm();
                  }
                }}
              >
                {isManaging ? "Exit Manage Mode" : "Manage Events"}
              </button>
            )}
          </div>

          {isManaging && (
            <div className="d-flex justify-content-end mb-4">
              <button type="button" className="btn manage-events-btn create-event-btn" onClick={openCreateModal}>
                <i className="bi bi-plus-lg"></i>
                <span>Create Event</span>
              </button>
            </div>
          )}

          {isManaging && isFormModalOpen && (
            <div className="event-modal-backdrop" onClick={closeFormModal}>
              <div className="event-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="mb-0">{editingEventId ? "Update Event" : "Create Event"}</h4>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closeFormModal}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
                <form onSubmit={onSubmit}>
                  {message ? <p style={{ fontWeight: "bold", color: editingEventId ? "blue" : "green" }}>{message}</p> : null}
                  <div className="mb-3">
                    <label className="form-label">Event Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formState.title}
                      onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      name="description"
                      value={formState.description}
                      onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={formState.location}
                      onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={formState.date}
                      onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Start Time</label>
                      <input
                        type="time"
                        className="form-control"
                        name="startTime"
                        value={formState.startTime}
                        onChange={(e) => setFormState((prev) => ({ ...prev, startTime: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">End Time</label>
                      <input
                        type="time"
                        className="form-control"
                        name="endTime"
                        value={formState.endTime}
                        onChange={(e) => setFormState((prev) => ({ ...prev, endTime: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Event Image</label>
                    <input
                      type="file"
                      className="form-control"
                      name="image"
                      accept="image/*"
                      onChange={(e) => setFormState((prev) => ({ ...prev, image: e.target.files?.[0] || null }))}
                      required={!editingEventId}
                    />
                    <small className="text-muted">
                      {editingEventId ? "Image update is optional." : "Image is required while creating event."}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : (editingEventId ? "Update Event" : "Create Event")}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeFormModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {content}
        </div>
      </section>
    </Layout>
  );
}
