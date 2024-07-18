// LoginForm.js

import React from 'react';
import { Formik, Form } from 'formik';
import { generateFormFields } from '../../utilities/formFieldGenerator';
import { generateValidationSchema } from '../../utilities/validationGenerator';
import { LoginFormFields } from '../../FormFields/FormikFields';
import "../../styles/FormStyles.scss"

const initialValues = LoginFormFields.reduce((acc, field) => {
  acc[field.name] = '';
  return acc;
}, {});

const validationSchema = generateValidationSchema(LoginFormFields);

const LoginForm = () => {
  const handleSubmit = (values) => {
    console.log('Login form values', values);
    // Handle login logic here
  };

  return (
    <div className="form-container">
      <h1>HBHS Login</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            {generateFormFields(LoginFormFields)}
            <div className="form-group">
              <button type="submit" disabled={isSubmitting}>Login</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;
