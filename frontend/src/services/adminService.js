const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Server error');
    }
    return data;
};

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const adminService = {
    getUsers: async () => {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    createUser: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    },

    updateUserRole: async (userId, newRole) => {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ role: newRole })
        });
        return handleResponse(response);
    },

    updateUserStatus: async (userId, isActive) => {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ is_active: isActive })
        });
        return handleResponse(response);
    },

    getModules: async () => {
        const response = await fetch(`${API_BASE_URL}/api/modules`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    createModule: async (moduleData) => {
        const response = await fetch(`${API_BASE_URL}/api/modules`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(moduleData)
        });
        return handleResponse(response);
    },

    deleteModule: async (moduleId) => {
        const response = await fetch(`${API_BASE_URL}/api/modules/${moduleId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getAssignments: async () => {
        const response = await fetch(`${API_BASE_URL}/api/modules/assignments`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    assignModules: async (userId, moduleIds) => {
        const response = await fetch(`${API_BASE_URL}/api/modules/assign`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ user_id: userId, module_ids: moduleIds })
        });
        return handleResponse(response);
    },

    removeAssignment: async (userId, moduleId) => {
        const response = await fetch(`${API_BASE_URL}/api/modules/assign/${userId}/${moduleId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getStudentsByModule: async (moduleId) => {
        const response = await fetch(`${API_BASE_URL}/api/modules/${moduleId}/students`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getStudentModules: async (studentId) => {
        const response = await fetch(`${API_BASE_URL}/api/users/${studentId}/modules`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};
