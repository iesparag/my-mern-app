import * as Yup from 'yup';
export const SignupFormFields = [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      validation: Yup.string().required('First Name is required')
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      validation: Yup.string().required('Last Name is required')
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      validation: Yup.string().email('Invalid email address').required('Email is required')
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      validation: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirm Password',
      validation: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required')
    },
    {
      name: 'gender',
      type: 'radio',
      label: 'Gender',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ],
      validation: Yup.string().required('Gender is required')
    },
    {
      name: 'acceptTerms',
      type: 'checkbox',
      label: 'Accept Terms and Conditions',
      validation: Yup.bool().oneOf([true], 'You must accept the terms and conditions')
    }
  ];


  export const LoginFormFields = [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      validation: Yup.string().email('Invalid email address').required('Email is required')
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      validation: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
    }
  ];