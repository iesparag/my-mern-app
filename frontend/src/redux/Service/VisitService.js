import axios from "axios";

const getClinicianVisitDetailsData = async (optionParameter) => {
    try {
        const { data } = await axios.post(
            "https://visit-analytics-api.azurewebsites.net/clinician",
            optionParameter
        );
        return data;
    } catch (error) {
        return error;
    }
};

const getPatientVisitDetailsAndClinicianChecklist = async (clientId) => {
    try {
        const { data } = await axios(
            `https://visit-analytics-api.azurewebsites.net/patient/${clientId}`
        );
        return data;
    } catch (error) {
        return error;
    }
};

const getClientDocumentationByClientId = async (optionsData) => {
    try {
        const { data } = await axios.post(
            "https://visit-analytics-api.azurewebsites.net/clinician/documentation",
            optionsData
        );
        return data;
    } catch (error) {
        return error;
    }
};

const getVisitsConversationOverview = async (optionsData) => {
    try {
        const { data } = await axios.post(
            "https://visit-analytics-api.azurewebsites.net/clinician/conversation_overview",
            optionsData
        );
        return data;
    } catch (error) {
        return error;
    }
};

const getLastVisitNote = async (optionsData) => {
    try {
        const { data } = await axios.post(
            "https://visit-analytics-api.azurewebsites.net/textanalytics/abstractive-api",
            optionsData
        );
        return data;
    } catch (error) {
        return error;
    }
};

const getPerVisitSentimentAnalysis = async (optionsData) => {
    try {
        const { data } = await axios.post(
            "https://visit-analytics-api.azurewebsites.net/textanalytics/user.sentiment-api",
            optionsData
        );
        return data;
    } catch (error) {
        return error;
    }
};

const CallingModalData = async (optionsData) => {
    try {
        const { data } = await axios.get(
            `https://visit-analytics-api.azurewebsites.net/clinician/visit/note?visit_id=${optionsData}`
        );
        return data;
    } catch (error) {
        return error;
    }
};

const VisitService = {
    getClinicianVisitDetailsData,
    getPatientVisitDetailsAndClinicianChecklist,
    getClientDocumentationByClientId,
    getVisitsConversationOverview,
    getLastVisitNote,
    getPerVisitSentimentAnalysis,
    CallingModalData,
};
export default VisitService;
