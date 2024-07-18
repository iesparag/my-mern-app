import axios from "axios";

const getClinicianData = async () => {
  try {
    const { data } = await axios("https://djangoappbackend.azurewebsites.net/analytics/api/clinician/");
    return data;
  } catch (error) {
    return error;
  }
};

const clinicianService = {
  getClinicianData,
};
export default clinicianService;
