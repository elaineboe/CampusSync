// Default to relative if deployed, or use localhost if local testing (stub proxy setup if needed)
// As per PRD, the deployment url is http://w25037992.nuwebspace.co.uk
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const supervisionService = {
    // ------------------------------------
    // LECTURER
    // ------------------------------------
    async createSlot(slotData) {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`${API_BASE_URL}/supervision/slots`, {
            method: 'POST',
            headers,
            body: JSON.stringify(slotData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to publish supervision slot');
        }

        return await response.json();
    },

    async getLecturerSlots() {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`${API_BASE_URL}/supervision/lecturer/slots`, { headers });
        if (!response.ok) throw new Error('Failed to fetch personal slots');

        return await response.json();
    },

    // ------------------------------------
    // STUDENT
    // ------------------------------------

    async getAvailableSlots() {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`${API_BASE_URL}/supervision/slots`, { headers });
        if (!response.ok) throw new Error('Failed to fetch global slots');

        return await response.json();
    },

    async getMyBookings(studentId = null) {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const url = studentId 
            ? `${API_BASE_URL}/supervision/student/bookings?student_id=${studentId}`
            : `${API_BASE_URL}/supervision/student/bookings`;

        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error('Failed to fetch bookings');

        return await response.json();
    },

    async bookSlot(slotId, notes = '') {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`${API_BASE_URL}/supervision/book`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ slot_id: slotId, notes })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to book slot');
        }

        return await response.json();
    },

    async cancelBooking(bookingId) {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`${API_BASE_URL}/supervision/student/bookings/${bookingId}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to cancel booking');
        }

        return await response.json();
    }
};
