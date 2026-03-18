// Default to relative if deployed, or use localhost if local testing (stub proxy setup if needed)
// As per PRD, the deployment url is http://w25037992.nuwebspace.co.uk
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const eventService = {
    async getEvents(studentId = null) {
        let token = localStorage.getItem('token');

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

        const url = studentId 
            ? `${API_BASE_URL}/events?student_id=${studentId}`
            : `${API_BASE_URL}/events`;

        try {
            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error('Failed to fetch events');
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
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

        const response = await fetch(`${API_BASE_URL}/events`, {
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

        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
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

        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete event');
        }

        return await response.json();
    },

    async getStudentFullCalendar(studentId) {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`${API_BASE_URL}/events/student?student_id=${studentId}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch student calendar');
        return await response.json();
    }
};
