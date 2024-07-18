import React from "react";
import { Formik, Form } from "formik";
import { generateFormFields } from "../../utilities/formFieldGenerator";
import { generateValidationSchema } from "../../utilities/validationGenerator";
import { SignupFormFields } from "../../FormFields/FormikFields";
import { Text } from "@chakra-ui/react";
import "../../styles/SignUpForm.scss";
import "../../styles/FormStyles.scss";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../redux/Feature/userSlice";
import Loading from "../Loading/Loading";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  acceptTerms: false,
};

const validationSchema = generateValidationSchema(SignupFormFields);
const SignUpForm = () => {
  const dispatch = useDispatch();
  const { successMessage, isLoading, isError, errorMessage } = useSelector(
    (store) => store.User
  );
  console.log("🚀 ~ SignUpForm ~ errorMessage:", errorMessage);
  console.log("🚀 ~ SignUpForm ~ isError:", isError);
  console.log("🚀 ~ SignUpForm ~ isLoading:", isLoading);
  console.log("🚀 ~ SignUpForm ~ successMessage:", successMessage);
  const handleSubmit = (values) => {
    const formData = {
      ...values,
      role: "user",
    };
    console.log("Form data", formData);
    debugger;
    dispatch(register(formData));
  };

  return (
    <div className="form-container form">
      {isLoading ? (
        <Loading size="lg" color="red.500" bgColor="rgba(0, 0, 0, 0.5)" />
      ) : (
        <>
          <Text className="form_heading">Register in MART</Text>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                {generateFormFields(SignupFormFields)}
                <button
                  className="form-button"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Submit
                </button>
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};

export default SignUpForm;
