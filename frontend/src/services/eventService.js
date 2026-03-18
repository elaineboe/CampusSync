// Default to relative if deployed, or use localhost if local testing (stub proxy setup if needed)
// As per PRD, the deployment url is http://w25037992.nuwebspace.co.uk
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://w25037992.nuwebspace.co.uk/backend';

export const eventService = {
    async getEvents() {
        let token = localStorage.getItem('token');

        // For development/testing purposes, if no token exists, use the stub token from AuthController
        // This bypassed needing to fully simulate login to test Timebox 2
        if (!token) {
            token = btoa(JSON.stringify({
                id: 1,
                username: 'student1',
                role: 'student',
                exp: Date.now() + 3600000
            }));
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/events`, { headers });
            if (!response.ok) throw new Error('Failed to fetch events');
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            // Fallback empty array to prevent UI breaking
            return [];
        }
    },

    async createEvent(eventData) {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`${API_BASE_URL}/api/events`, {
            method: 'POST',
            headers,
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create event');
        }

        return await response.json();
    },

    async updateEvent(eventId, eventData) {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update event');
        }

        return await response.json();
    },

    async deleteEvent(eventId) {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete event');
        }

        return await response.json();
    }
};
