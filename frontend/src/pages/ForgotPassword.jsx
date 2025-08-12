import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';
import { FaArrowLeft } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPassword = () => {
    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    return (
        <PageTransition>
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <Link to="/login" className="flex items-center text-sm text-gray-600 hover:text-red-500">
                        <FaArrowLeft className="mr-2" /> Back to Login
                    </Link>
                    <h2 className="text-3xl font-bold text-center text-gray-800">Forgot Password</h2>
                    <p className="text-center text-sm text-gray-600">
                        Enter your email and we'll send you a link to reset your password.
                    </p>

                    <Formik
                        initialValues={{ email: '' }}
                        validationSchema={ForgotPasswordSchema}
                        onSubmit={async (values, { setSubmitting, setStatus }) => {
                            try {
                                await forgotPassword(values.email);
                                setStatus({ success: 'If an account with that email exists, a reset link has been sent.' });
                            } catch (err) {
                                setStatus({ error: err.message });
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting, status }) => (
                            <Form className="space-y-6">
                                {status?.success && <p className="p-3 text-sm text-center text-green-800 bg-green-100 rounded-md">{status.success}</p>}
                                {status?.error && <p className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md">{status.error}</p>}
                                
                                <div>
                                    <label className="text-sm font-bold text-gray-600">Email Address</label>
                                    <Field name="email" type="email" className="w-full p-3 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300" />
                                    <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
                                </div>
                                
                                <button type="submit" disabled={isSubmitting || status?.success} className="w-full py-3 font-bold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-red-300">
                                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </PageTransition>
    );
};

export default ForgotPassword;