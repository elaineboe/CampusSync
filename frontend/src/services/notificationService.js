const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://w25037992.nuwebspace.co.uk/backend';

export const notificationService = {
    async getNotifications() {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications`, { headers });
            if (!response.ok) throw new Error('Failed to fetch notifications');
            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async markAsRead(notificationId) {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to mark notification as read');
        }

        return await response.json();
    }
};
