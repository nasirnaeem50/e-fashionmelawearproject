import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';
import { FaArrowLeft } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = location.state?.message;

    return (
        <PageTransition>
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-red-500 transition-colors mb-8"><FaArrowLeft className="mr-2" />Back to Home</Link>
                    <h2 className="text-3xl font-bold text-center text-gray-800">Login to Your Account</h2>
                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={LoginSchema}
                        onSubmit={async (values, { setSubmitting, setStatus }) => {
                            try {
                                await login(values.email, values.password);
                                const from = location.state?.from?.pathname || '/';
                                navigate(from, { replace: true });
                            } catch (err) {
                                setStatus({ error: err.response?.data?.error || err.message });
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting, status }) => (
                            <Form className="space-y-6">
                                {successMessage && <p className="p-3 text-sm text-center text-green-800 bg-green-100 rounded-md">{successMessage}</p>}
                                {status?.error && <p className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md">{status.error}</p>}
                                <div>
                                    <label className="text-sm font-bold text-gray-600">Email Address</label>
                                    <Field name="email" type="email" className="w-full p-3 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300" />
                                    <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-600">Password</label>
                                    <Field name="password" type="password" className="w-full p-3 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300" />
                                    <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
                                </div>
                                <div className="flex justify-end text-sm"><Link to="/forgot-password" className="font-medium text-red-500 hover:underline">Forgot Password?</Link></div>
                                <button type="submit" disabled={isSubmitting} className="w-full py-3 font-bold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-red-300">{isSubmitting ? 'Logging in...' : 'Login'}</button>
                            </Form>
                        )}
                    </Formik>
                    <p className="text-sm text-center text-gray-600">Don't have an account?{' '}<Link to="/register" className="font-bold text-red-500 hover:underline">Register here</Link></p>
                </div>
            </div>
        </PageTransition>
    );
};

export default Login;