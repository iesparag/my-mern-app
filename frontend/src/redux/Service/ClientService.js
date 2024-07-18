import axios from "axios";

const getClientData = async () => {
    try {
        const { data } = await axios(
            "https://djangoappbackend.azurewebsites.net/analytics/api/clients"
        );
        return data;
    } catch (error) {
        return error;
    }
};

const clientService = {
    getClientData,
};
export default clientService;
