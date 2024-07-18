import React from 'react';
import { Field, ErrorMessage } from 'formik';

const generateField = (field) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
      return (
        <div key={field.name} className="form-group">
          <label htmlFor={field.name}>{field.label}</label>
          <Field type={field.type} id={field.name} name={field.name} />
          <ErrorMessage name={field.name} component="div" className="error-message" />
        </div>
      );
    case 'checkbox':
      return (
        <div key={field.name} className="form-group">
          <div className="checkbox-group">
          <label>
            <Field type="checkbox" name={field.name} />
            {field.label}
          </label>
          </div>
          <ErrorMessage name={field.name} component="div" className="error-message" />
        </div>
      );
    case 'radio':
      return (
        <div key={field.name} className="form-group">
          <label>{field.label}</label>
          <div className="radio-group">
            {field.options.map((option) => (
              <label key={option.value}>
                <Field type="radio" name={field.name} value={option.value} />
                {option.label}
              </label>
            ))}
          </div>
          <ErrorMessage name={field.name} component="div" className="error-message" />
        </div>
      );
    default:
      return null;
  }
};

export const generateFormFields = (fields) => {
  return fields.map((field) => generateField(field));
};
