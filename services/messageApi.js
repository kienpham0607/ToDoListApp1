import { API_BASE_URL } from '@/config/api';

export const getMessagesByProject = async (token, projectId, offset = 0, limit = 20) => {
    const url = `${API_BASE_URL}/message/getByProject?projectId=${projectId}&offset=${offset}&limit=${limit}`;

    if (!token) {
        throw new Error('Authentication token is missing.');
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept': '*/*',
            },
        });

        if (!response.ok) {
            let errorMessage = 'Failed to fetch messages';
            try {
                const errorJson = await response.json();
                errorMessage = errorJson.message || errorJson.code || errorMessage;
            } catch (_) {
                const errorText = await response.text();
                errorMessage = errorText.trim() || errorMessage;
            }
            throw new Error(errorMessage);
        }
        return await response.json();
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const sendMessage = async (token, messageData) => {
    const url = `${API_BASE_URL}/message/create`;

    if (!token) {
        throw new Error('Authentication token is missing.');
    }

    try {
        console.log('Sending message to:', url);
        console.log('Token length:', token ? token.length : 0);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept': '*/*',
            },
            body: JSON.stringify(messageData),
        });

        if (!response.ok) {
            let errorMessage = 'Failed to send message';
            try {
                const errorJson = await response.json();
                errorMessage = errorJson.message || errorJson.code || errorMessage;
            } catch (_) {
                const errorText = await response.text();
                errorMessage = errorText.trim() || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteMessage = async (token, messageId) => {
    const url = `${API_BASE_URL}/message/delete?id=${messageId}`;

    if (!token) {
        throw new Error('Authentication token is missing.');
    }

    try {
        console.log('Deleting message:', url);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept': '*/*',
            },
        });

        if (!response.ok) {
            let errorMessage = 'Failed to delete message';
            try {
                const errorJson = await response.json();
                errorMessage = errorJson.message || errorJson.code || errorMessage;
            } catch (_) {
                const errorText = await response.text();
                errorMessage = errorText.trim() || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        throw error.response?.data || error.message;
    }
};