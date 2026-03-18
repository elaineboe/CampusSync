export const authService = {
    login: async (username, password) => {
        try {
            // Determine API URL based on environment OR fallback to explicit production URL if no local env available
            const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://w25037992.nuwebspace.co.uk/backend';

            const response = await fetch(`${apiBaseURL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                // To avoid JSON parsing failure on HTML 404 pages from Nuwebspace, check if response is JSON
                const contentType = response.headers.get("content-type");
                let errorMessage = 'Login failed';
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } else {
                    errorMessage = `Server Error: Received non-JSON response from ${apiBaseURL}`;
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://w25037992.nuwebspace.co.uk/backend';

            const response = await fetch(`${apiBaseURL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorMessage = 'Registration failed';
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } else {
                    errorMessage = `Server Error: Received non-JSON response from ${apiBaseURL}`;
                }
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
};
