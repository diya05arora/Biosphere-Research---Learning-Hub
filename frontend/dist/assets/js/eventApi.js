const token = localStorage.getItem('accessToken');
if (!token) window.location.href = '/login.html';

const API_URL = 'http://localhost:8000/api/v1/events';

async function fetchEvents() {
  try {
    const response = await fetch(`${API_URL}/get-all-events`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log('Fetch events response:', response);
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return { events: [] };
  }
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function createEventCard(event, userId) {
  const eventCard = document.createElement('div');
  eventCard.className = 'col-lg-4 col-md-6 d-flex align-items-stretch';

  const eventDate = new Date(event.date).toLocaleDateString();
  const startTime = new Date(event.startTime).toLocaleTimeString();
  const endTime = new Date(event.endTime).toLocaleTimeString();

  const isRegistered = event.registeredUsers.includes(userId);

  let buttonHtml = '';
  if (isRegistered) {
    buttonHtml = `<button class="btn btn-secondary btn-unregister" onclick="unregisterFromEvent('${event._id}')">Unregister</button>`;
  } else {
    buttonHtml = `<button class="btn btn-primary btn-register" onclick="registerForEvent('${event._id}')">Register</button>`;
  }

  eventCard.innerHTML = `
    <div class="card event-card">
      <img src="${event.image}" class="card-img-top" alt="${event.title}">
      <div class="card-body">
        <h5 class="card-title">${toTitleCase(event.title)}</h5>
        <p class="card-text"><strong>Date:</strong> ${eventDate}</p>
        <p class="card-text"><strong>Time:</strong> ${startTime} - ${endTime}</p>
        <div id="button-container-${event._id}">
          ${buttonHtml}
        </div>
      </div>
    </div>
  `;
  return eventCard;
}

async function displayEvents() {
  const eventsContainer = document.getElementById('events-container');
    eventsContainer.innerHTML = ''; // Clear existing events
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    // Optionally handle case where user is not logged in or token is invalid
    // For now, we'll proceed, but buttons might not work as expected without a user
  }
  const userId = currentUser ? currentUser._id : null;

  const response = await fetchEvents();
  const events = response.data;

  if (events && events.length > 0) {
    events.forEach(event => {
      const eventCard = createEventCard(event, userId);
      eventsContainer.appendChild(eventCard);
    });
  } else {
    eventsContainer.innerHTML = '<p>No upcoming events.</p>';
  }
}

document.addEventListener('DOMContentLoaded', displayEvents);