if (!token) window.location.href = '/login.html';

async function registerForEvent(eventId) {
    try {
        const response = await fetch(`${API_URL}/register-for-event/${eventId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (response.ok) {
            console.log('Successfully registered for event:', result.data);
            // Update button without re-rendering all events
            const buttonContainer = document.getElementById(`button-container-${eventId}`);
            if (buttonContainer) {
                buttonContainer.innerHTML = `<button class="btn btn-secondary btn-unregister" onclick="unregisterFromEvent('${eventId}')">Unregister</button>`;
            }
        } else {
            console.error('Failed to register for event:', result.message);
            alert(`Registration failed: ${result.message}`);
        }
    } catch (error) {
        console.error('Error registering for event:', error);
        alert('An error occurred while trying to register for the event.');
    }
}

async function unregisterFromEvent(eventId) {
    try {
        const response = await fetch(`${API_URL}/unregister-from-event/${eventId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (response.ok) {
            console.log('Successfully unregistered from event:', result.data);
            // Update button without re-rendering all events
            const buttonContainer = document.getElementById(`button-container-${eventId}`);
            if (buttonContainer) {
                buttonContainer.innerHTML = `<button class="btn btn-primary btn-register" onclick="registerForEvent('${eventId}')">Register</button>`;
            }
        } else {
            console.error('Failed to unregister from event:', result.message);
            alert(`Unregistration failed: ${result.message}`);
        }
    } catch (error) {
        console.error('Error unregistering from event:', error);
        alert('An error occurred while trying to unregister from the event.');
    }
}

async function getCurrentUser() {
    try {
        const response = await fetch('http://localhost:8000/api/v1/users/current-user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (response.ok) {
            return result.data;
        } else {
            console.error('Failed to get current user:', result.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}