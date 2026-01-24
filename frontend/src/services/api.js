const API_URL = "http://localhost:5000/api";

const getAuthHeader = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export const authAPI = {
    register: (email, password, username) =>
        fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, username })
        }).then(r => r.json()),

    login: (email, password) =>
        fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        }).then(r => r.json())
};

export const projectAPI = {
    getAll: () =>
        fetch(`${API_URL}/projects`).then(r => r.json()),

    create: (title, description, category, link, creatorName, imageUrl) =>
        fetch(`${API_URL}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ title, description, category, link, creatorName, imageUrl })
        }).then(r => r.json()),

    delete: (projectId) =>
        fetch(`${API_URL}/projects/${projectId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", ...getAuthHeader() }
        }).then(r => r.json())
};

export const voteAPI = {
    upvote: (projectId) =>
        fetch(`${API_URL}/votes/upvote`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ projectId })
        }).then(r => r.json()),

    removeVote: (projectId) =>
        fetch(`${API_URL}/votes/removeVote`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ projectId })
        }).then(r => r.json()),

    checkVote: (projectId) =>
        fetch(`${API_URL}/votes/check/${projectId}`, {
            headers: getAuthHeader()
        }).then(r => r.json())
};

export const saveAPI = {
    saveProject: (projectId) =>
        fetch(`${API_URL}/saves/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ projectId })
        }).then(r => r.json()),

    unsaveProject: (projectId) =>
        fetch(`${API_URL}/saves/unsave`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ projectId })
        }).then(r => r.json()),

    checkSave: (projectId) =>
        fetch(`${API_URL}/saves/check/${projectId}`, {
            headers: getAuthHeader()
        }).then(r => r.json()),

    getSavedProjects: () =>
        fetch(`${API_URL}/saves/my-saves`, {
            headers: getAuthHeader()
        }).then(r => r.json())
};

export const userProjectsAPI = {
    getMyProjects: () =>
        fetch(`${API_URL}/projects/my-projects`, {
            headers: getAuthHeader()
        }).then(r => r.json())
};

export const friendsAPI = {
    sendRequest: (recipientId) =>
        fetch(`${API_URL}/friends/request/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ recipientId })
        }).then(r => r.json()),

    getPendingRequests: () =>
        fetch(`${API_URL}/friends/requests/pending`, {
            headers: getAuthHeader()
        }).then(r => r.json()),

    getSentRequests: () =>
        fetch(`${API_URL}/friends/requests/sent`, {
            headers: getAuthHeader()
        }).then(r => r.json()),

    acceptRequest: (requestId) =>
        fetch(`${API_URL}/friends/request/accept`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ requestId })
        }).then(r => r.json()),

    rejectRequest: (requestId) =>
        fetch(`${API_URL}/friends/request/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ requestId })
        }).then(r => r.json()),

    cancelRequest: (requestId) =>
        fetch(`${API_URL}/friends/request/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ requestId })
        }).then(r => r.json()),

    getFriendsList: () =>
        fetch(`${API_URL}/friends/list`, {
            headers: getAuthHeader()
        }).then(r => r.json()),

    checkFriendStatus: (userId) =>
        fetch(`${API_URL}/friends/status/${userId}`, {
            headers: getAuthHeader()
        }).then(r => r.json()),

    removeFriend: (friendId) =>
        fetch(`${API_URL}/friends/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ friendId })
        }).then(r => r.json())
};

export const messagesAPI = {
    sendMessage: (recipientId, content) =>
        fetch(`${API_URL}/messages/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ recipientId, content })
        }).then(r => r.json()),

    getConversation: (friendId) =>
        fetch(`${API_URL}/messages/conversation/${friendId}`, {
            headers: getAuthHeader()
        }).then(r => r.json()).then(data => {
            
            if (Array.isArray(data)) {
                return { success: true, data };
            }
            return data;
        }),

    getConversations: () =>
        fetch(`${API_URL}/messages/conversations`, {
            headers: getAuthHeader()
        }).then(r => r.json()).then(data => {
            
            if (Array.isArray(data)) {
                return { success: true, data };
            }
            return data;
        }),

    getUnreadCount: () =>
        fetch(`${API_URL}/messages/unread/count`, {
            headers: getAuthHeader()
        }).then(r => r.json())
};

export const onlineStatusAPI = {
    setOnline: () =>
        fetch(`${API_URL}/online-status/online`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({})
        }).then(r => r.json()),

    setOffline: () =>
        fetch(`${API_URL}/online-status/offline`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({})
        }).then(r => r.json()),

    getStatus: (userId) =>
        fetch(`${API_URL}/online-status/status/${userId}`, {
            headers: getAuthHeader()
        }).then(r => r.json()),

    getBatchStatus: (userIds) =>
        fetch(`${API_URL}/online-status/status/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ userIds })
        }).then(r => r.json())
};

export const userAPI = {
    getCurrentUser: () =>
        fetch(`${API_URL}/users/me`, {
            headers: getAuthHeader()
        }).then(r => r.json()),

    getUserById: (userId) =>
        fetch(`${API_URL}/users/${userId}`, {
            headers: getAuthHeader()
        }).then(r => r.json()),

    updateProfile: (displayName, bio, avatar) =>
        fetch(`${API_URL}/users/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...getAuthHeader() },
            body: JSON.stringify({ displayName, bio, avatar })
        }).then(r => r.json()),

    searchUsers: (query) =>
        fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
            headers: getAuthHeader()
        }).then(r => r.json())
};

