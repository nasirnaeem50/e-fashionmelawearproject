import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';
import { FaArrowLeft } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// --- THIS IS THE UPDATED VALIDATION SCHEMA ---
// It now enforces a strong password policy.
const RegisterSchema = Yup.object().shape({
    name: Yup.string().required('Full Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters long.')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Must contain one uppercase, one lowercase, one number, and one special character.'
        ),
});

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    return (
        <PageTransition>
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-red-500 transition-colors mb-8">
                        <FaArrowLeft className="mr-2" />
                        Back to Home
                    </Link>
                    <h2 className="text-3xl font-bold text-center text-gray-800">Create an Account</h2>

                    <Formik
                        initialValues={{ name: '', email: '', password: '' }}
                        validationSchema={RegisterSchema}
                        onSubmit={async (values, { setSubmitting, setStatus }) => {
                            setStatus({ error: '' }); // Clear previous errors
                            try {
                                const success = await register(values.name, values.email, values.password);
                                if (success) {
                                    // Navigate to the login page with a success message.
                                    navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
                                }
                            } catch (err) {
                                setStatus({ error: err.message }); // Display API error (e.g., "email already exists")
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting, status }) => (
                            <Form className="space-y-6">
                                {status?.error && (
                                    <p className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md">
                                        {status.error}
                                    </p>
                                )}
                                <div>
                                    <label className="text-sm font-bold text-gray-600">Full Name</label>
                                    <Field
                                        name="name"
                                        type="text"
                                        className="w-full p-3 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
                                    />
                                    <ErrorMessage name="name" component="div" className="text-red-600 text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-600">Email Address</label>
                                    <Field
                                        name="email"
                                        type="email"
                                        className="w-full p-3 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
                                    />
                                    <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-600">Password</label>
                                    <Field
                                        name="password"
                                        type="password"
                                        className="w-full p-3 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
                                    />
                                    {/* The ErrorMessage component will now show the detailed password requirements */}
                                    <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 font-bold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-red-300"
                                >
                                    {isSubmitting ? 'Registering...' : 'Register'}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <p className="text-sm text-center text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-red-500 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </PageTransition>
    );
};

export default Register;