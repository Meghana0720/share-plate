import axios from 'axios';


const API_BASE_URL = 'https://share-plate-5kmm.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const donationAPI = {
  create: (donation) => api.post('/donations', donation),
  search: (pincode, foodType, foodCategory, minServings) => 
    api.get('/donations/search', {
      params: { 
        pincode, 
        foodType: foodType || '', 
        foodCategory: foodCategory || '', 
        minServings: minServings || '' 
      }
    }),
};

export const requestAPI = {
  create: (request) => api.post('/donations/request', request),
  accept: (requestId) => api.put(`/donations/request/${requestId}/accept`),
  reject: (requestId) => api.delete(`/donations/request/${requestId}`),
  getByDonor: (donorName) => api.get(`/requests/donor/${donorName}`),
  getAcceptedByDonor: (donorName) => api.get(`/requests/accepted/${donorName}`),
};

export const pickupAPI = {
  confirm: (uniqueCode) => api.post('/donations/confirm-pickup', null, { 
    params: { uniqueCode } 
  }),
};

export default api;