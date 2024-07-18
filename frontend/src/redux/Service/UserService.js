import api from '../../utilities/axiosUtility';

const registerUser = async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register user error:', error);
      throw error;
    }
  };
  
  const loginUser = async (userData) => {
    try {
      const response = await api.post('/login', userData);
      return response.data;
    } catch (error) {
      console.error('Login user error:', error);
      throw error;
    }
  };

const UserService = {
    registerUser,
    loginUser
};

export default UserService;

