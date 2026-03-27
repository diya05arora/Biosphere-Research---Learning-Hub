import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiRequest } from "../lib/api";

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
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
  }

  async function loadEvents() {
    setMessage("");
    const res = await apiRequest("/events/get-all-events", { method: "GET" });
    if (res.response.ok) {
      setEvents(res.payload?.data || []);
    } else {
      setMessage(res.payload?.message || "Failed to load events.");
    }
  }

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const me = await apiRequest("/users/current-user", { method: "GET" });
      if (!me.response.ok) {
        navigate("/login");
        return;
      }

      if (me.payload?.data?.role !== "admin") {
        navigate("/events");
        return;
      }

      loadEvents();
    }

    bootstrap();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(editingEventId ? "Updating event..." : "Creating event...");

    const fd = new FormData(e.currentTarget);
    const date = fd.get("date");
    const start = fd.get("startTime");
    const end = fd.get("endTime");
    const startTime = new Date(`${date}T${start}`).toISOString();
    const endTime = new Date(`${date}T${end}`).toISOString();

    let res;

    if (editingEventId) {
      res = await apiRequest(`/events/update-event/${editingEventId}`, {
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
      });
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

      res = await apiRequest("/events/create-event", {
        method: "POST",
        body,
      });
    }

    if (!res.response.ok) {
      setIsSubmitting(false);
      setMessage(res.payload?.message || "Action failed.");
      return;
    }

    setMessage(editingEventId ? "Event updated successfully!" : "Event created successfully!");
    resetForm();
    e.currentTarget.reset();
    await loadEvents();
    setIsSubmitting(false);
  }

  async function removeEvent(eventId) {
    const res = await apiRequest(`/events/delete-event/${eventId}`, { method: "DELETE" });
    if (!res.response.ok) {
      setMessage(res.payload?.message || "Delete failed.");
      return;
    }
    setMessage("Event deleted successfully!");
    await loadEvents();
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function logout() {
    localStorage.removeItem("accessToken");
    navigate("/login");
  }

  return (
    <Layout active="home" showLogout onLogout={logout}>
      <section id="admin-events" className="admin-events section">
        <div className="container">
          <div className="section-title">
            <h2>Event Management</h2>
            <p>Create, update and delete upcoming events</p>
          </div>

          <div className="row mb-5">
            <div className="col-lg-8 mx-auto">
              <div className="card p-4">
                <h4>{editingEventId ? "Update Event" : "Create New Event"}</h4>
                <form onSubmit={onSubmit}>
                  {message ? <p style={{ fontWeight: "bold" }}>{message}</p> : null}
                  <div className="mb-3"><label className="form-label">Event Title</label><input type="text" className="form-control" name="title" value={formState.title} onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))} required /></div>
                  <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="4" name="description" value={formState.description} onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))} required></textarea></div>
                  <div className="mb-3"><label className="form-label">Location</label><input type="text" className="form-control" name="location" value={formState.location} onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))} required /></div>
                  <div className="mb-3"><label className="form-label">Date</label><input type="date" className="form-control" name="date" value={formState.date} onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))} required /></div>
                  <div className="row">
                    <div className="col-md-6 mb-3"><label className="form-label">Start Time</label><input type="time" className="form-control" name="startTime" value={formState.startTime} onChange={(e) => setFormState((prev) => ({ ...prev, startTime: e.target.value }))} required /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">End Time</label><input type="time" className="form-control" name="endTime" value={formState.endTime} onChange={(e) => setFormState((prev) => ({ ...prev, endTime: e.target.value }))} required /></div>
                  </div>
                  <div className="mb-3"><label className="form-label">Event Image</label><input type="file" className="form-control" name="image" accept="image/*" onChange={(e) => setFormState((prev) => ({ ...prev, image: e.target.files?.[0] || null }))} required={!editingEventId} /><small className="text-muted">{editingEventId ? "Image update is optional and may be ignored by current backend update endpoint." : "Image is required while creating event."}</small></div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : (editingEventId ? "Update Event" : "Create Event")}</button>
                    {editingEventId ? <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel Edit</button> : null}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">All Events</h4>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Location</th>
                      <th>Registered Users</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event._id}>
                        <td><img src={event.image} alt={event.title} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 4 }} /></td>
                        <td>{event.title}</td>
                        <td>{new Date(event.date).toLocaleDateString()}</td>
                        <td>{new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(event.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                        <td>{event.location}</td>
                        <td>{event.registeredUsers?.length || 0}</td>
                        <td>
                          <button className="btn btn-sm btn-primary me-2" onClick={() => editEvent(event)}>
                            <i className="bi bi-pencil"></i> Edit
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => removeEvent(event._id)}>
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
