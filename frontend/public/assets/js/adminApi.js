const token = localStorage.getItem('accessToken');
if (!token) window.location.href = '/login.html';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';
// Note: In plain JS files, prefer window.location.origin if Vite env unavailable
const API_URL_FALLBACK = window.location.origin.includes('localhost') ? 'http://localhost:8000/api/v1/events' : '/api/v1/events';

// Load all events on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAllEvents();
});

// Create Event
async function createEvent(formData) {
    try {
        console.log('Starting fetch request...');
        const response = await fetch(`${API_URL}/events/create-event`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        console.log('Fetch completed. Response status:', response.status);
        console.log('Response ok?', response.ok);
        console.log('Response headers:', [...response.headers.entries()]);
        
        // Get the response text first
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        // Try to parse it as JSON
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('Parsed JSON result:', result);
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            console.log('Response was:', responseText);
            alert('Event may have been created, but received invalid response from server. Please refresh the page.');
            loadAllEvents();
            return;
        }
        
        if (response.ok) {
            alert('Event created successfully!');
            resetForm();
            loadAllEvents();
        } else {
            console.error('Failed to create event:', result);
            alert(`Failed to create event: ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Caught error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Full error object:', error);
    }
}

// Update Event
async function updateEvent(eventId, formData) {
    try {
        const response = await fetch(`${API_URL}/events/update-event/${eventId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const result = await response.json();
        if (response.ok) {
            alert('Event updated successfully!');
            resetForm();
            loadAllEvents();
        } else {
            alert(`Failed to update event: ${result.message}`);
        }
    } catch (error) {
        console.error('Error updating event:', error);
    }
}

// Delete Event
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/events/delete-event/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (response.ok) {
            alert('Event deleted successfully!');
            loadAllEvents();
        } else {
            alert(`Failed to delete event: ${result.message}`);
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('An error occurred while deleting the event.');
    }
}

// Load all events
async function loadAllEvents() {
    try {
        const response = await fetch(`${API_URL}/events/get-all-events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (response.ok) {
            displayEventsTable(result.data);
        } else {
            console.error('Failed to load events:', result.message);
        }
    } catch (error) {
        console.error('Error loading events:', error);
        alert('An error occurred while loading events.');
    }
}

// Display events in table
function displayEventsTable(events) {
    const tableBody = document.getElementById('events-table-body');
    tableBody.innerHTML = '';

    if (events && events.length > 0) {
        events.forEach(event => {
            const eventDate = new Date(event.date).toLocaleDateString();
            const startTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${event.image}" alt="${event.title}" crossorigin="anonymous" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
                <td>${event.title}</td>
                <td>${eventDate}</td>
                <td>${startTime} - ${endTime}</td>
                <td>${event.location}</td>
                <td>${event.registeredUsers ? event.registeredUsers.length : 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-2" onclick="editEvent('${event._id}')">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent('${event._id}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row); 
        });
    } else {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No events found</td></tr>';
    }
}

// Edit event - populate form with event data
async function editEvent(eventId) {
    try {
        const response = await fetch(`${API_URL}/events/get-all-events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (response.ok) {
            const event = result.data.find(e => e._id === eventId);
            if (event) {
                document.getElementById('event-id').value = event._id;
                document.getElementById('title').value = event.title;
                document.getElementById('description').value = event.description;
                document.getElementById('location').value = event.location;
                
                // Format date for input field (YYYY-MM-DD)
                const date = new Date(event.date);
                document.getElementById('date').value = date.toISOString().split('T')[0];
                
                // Format time for input field (HH:MM)
                const startTime = new Date(event.startTime);
                document.getElementById('startTime').value = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;
                
                const endTime = new Date(event.endTime);
                document.getElementById('endTime').value = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
                
                // Update form UI
                document.getElementById('form-title').textContent = 'Update Event';
                document.getElementById('submit-btn').textContent = 'Update Event';
                document.getElementById('cancel-btn').style.display = 'inline-block';
                
                // Scroll to form
                document.getElementById('event-form').scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error('Error loading event for edit:', error);
        alert('An error occurred while loading the event.');
    }
}

// Handle form submission
document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const eventId = document.getElementById('event-id').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const imageFile = document.getElementById('image').files[0];
    
    // Combine date and time
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    console.log('Form data:', {
        title,
        description,
        location,
        date,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        hasImage: !!imageFile
    });
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('date', date);
    formData.append('startTime', startDateTime.toISOString());
    formData.append('endTime', endDateTime.toISOString());
    
    if (imageFile) {
        formData.append('image', imageFile);
    }
    await createEvent(formData);
    
});

// Reset form
function resetForm() {
    document.getElementById('event-form').reset();
    document.getElementById('event-id').value = '';
    document.getElementById('form-title').textContent = 'Create New Event';
    document.getElementById('submit-btn').textContent = 'Create Event';
    document.getElementById('cancel-btn').style.display = 'none';
}

// Logout function
function logout() {
    localStorage.removeItem('accessToken');
    window.location.href = '/login.html';
}
