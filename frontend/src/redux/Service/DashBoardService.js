import axios from "axios";

const getDashboardCompliance = async (optionParameter) => {
    try {
        const { data } = await axios.post(
            `https://visit-analytics-api.azurewebsites.net/charts/line-chart-data`,
            optionParameter
        );
        return data;
    } catch (error) {
        return error;
    }
};

const getDashboardSentiment = async (optionsData) => {
    try {
        const { data } = await axios.post(
            "https://visit-analytics-api.azurewebsites.net/textanalytics/sentiment-data",
            optionsData
        );
        return data;
    } catch (error) {
        return error;
    }
};

const getDashboardKeyWords = async (optionsData) => {
    try {
        const { data } = await axios.post(
            "https://visit-analytics-api.azurewebsites.net/textanalytics/customNER-api",
            optionsData
        );
        return data;
    } catch (error) {
        return error;
    }
};

const getClientsPerCareCenterAndAverageTimePerVisit = async (optionsData) => {
    try {
        const { data } = await axios(
            `https://visit-analytics-api.azurewebsites.net/patient/client-per-center/${optionsData}`
        );
        return data;
    } catch (error) {
        return error;
    }
};

const getDashboardNotifications = async (optionsData) => {
    try {
        const { data } = await axios(
            `https://visit-analytics-api.azurewebsites.net//notification/list/${optionsData}`
        );
        return data;
    } catch (error) {
        return error;
    }
};

const dashboardService = {
    getDashboardCompliance,
    getDashboardSentiment,
    getDashboardKeyWords,
    getDashboardNotifications,
    getClientsPerCareCenterAndAverageTimePerVisit,
};
export default dashboardService;
