import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Lanyard API
export const fetchLanyardData = async (userId: string) => {
  try {
    const response = await api.get(`/lanyard/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Lanyard data:', error);
    return null;
  }
};

// Discord Profile API (badges, banner, etc.)
export const fetchDiscordProfile = async (userId: string) => {
  try {
    const response = await api.get(`/discord/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Discord profile:', error);
    return null;
  }
};

// Last.fm API
export const fetchLastFmData = async () => {
  try {
    const response = await api.get('/lastfm/recent');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Last.fm data:', error);
    return null;
  }
};

// WakaTime API
export const fetchWakaTimeData = async () => {
  try {
    const response = await api.get('/wakatime/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch WakaTime data:', error);
    return null;
  }
};

// Auth API
export const getAuthUser = async () => {
  try {
    const response = await api.get('/auth/user');
    return response.data.user;
  } catch (error) {
    console.error('Failed to fetch auth user:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Failed to logout:', error);
  }
};

// Contact API
export const sendDiscordMessage = async (message: string) => {
  try {
    const response = await api.post('/contact/discord', { message });
    return response.data;
  } catch (error) {
    console.error('Failed to send Discord message:', error);
    throw error;
  }
};

export const sendEmail = async (name: string, email: string, subject: string, message: string) => {
  try {
    const response = await api.post('/contact/email', { name, email, subject, message });
    return response.data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export default api;


