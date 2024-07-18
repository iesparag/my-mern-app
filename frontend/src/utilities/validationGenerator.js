import * as Yup from 'yup';

export const generateValidationSchema = (fields) => {
  const schemaFields = fields.reduce((acc, field) => {
    if (field.validation) {
      acc[field.name] = field.validation;
    }
    return acc;
  }, {});

  return Yup.object().shape(schemaFields);
};
