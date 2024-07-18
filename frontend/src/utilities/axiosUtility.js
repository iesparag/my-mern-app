import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_LOCAL_URL || 'http://localhost:8080/api/v1', 
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - possibly invalid token');
    }
    return Promise.reject(error);
  }
);
const requestJSON = async (method, url, data = {}, config = {}) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error('Request JSON error:', error);
    throw error;
  }
};
const requestFormData = async (method, url, formData = new FormData(), config = {}) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error('Request FormData error:', error);
    throw error;
  }
};
const get = (url, config = {}) => requestJSON('get', url, {}, config);
const post = (url, data, config = {}) => requestJSON('post', url, data, config);
const put = (url, data, config = {}) => requestJSON('put', url, data, config);
const del = (url, config = {}) => requestJSON('delete', url, {}, config);
const patch = (url, data, config = {}) => requestJSON('patch', url, data, config);

const postFormData = (url, formData, config = {}) => requestFormData('post', url, formData, config);
const putFormData = (url, formData, config = {}) => requestFormData('put', url, formData, config);
const patchFormData = (url, formData, config = {}) => requestFormData('patch', url, formData, config);

export default {
  get,
  post,
  put,
  delete: del,
  patch,
  postFormData,
  putFormData,
  patchFormData,
};
