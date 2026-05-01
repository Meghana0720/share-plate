import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Donation APIs
export const donationAPI = {
  create: (donation) => api.post('/donations', donation),
  search: (pincode, foodType, foodCategory, minServings) => 
    api.get('/donations/search', {
      params: { 
        pincode, 
        foodType: foodType || null, 
        foodCategory: foodCategory || null, 
        minServings: minServings || null 
      }
    })
};

// Request APIs
export const requestAPI = {
  create: (request) => api.post('/donations/request', request),
  accept: (requestId) => api.put(`/donations/request/${requestId}/accept`),
  reject: (requestId) => api.delete(`/donations/request/${requestId}`),
  getByDonor: (donorName) => api.get(`/requests/donor/${donorName}`),
  getAcceptedByDonor: (donorName) => api.get(`/requests/accepted/${donorName}`)
};

// Pickup APIs
export const pickupAPI = {
  confirm: (uniqueCode) => api.post('/donations/confirm-pickup', null, {
    params: { uniqueCode }
  })
};

export default api;