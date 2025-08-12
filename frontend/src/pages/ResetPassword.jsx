import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';
import { FaArrowLeft } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required')
});

const ResetPassword = () => {
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const { resettoken } = useParams();

    return (
        <PageTransition>
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <Link to="/login" className="flex items-center text-sm text-gray-600 hover:text-red-500">
                        <FaArrowLeft className="mr-2" /> Back to Login
                    </Link>
                    <h2 className="text-3xl font-bold text-center text-gray-800">Reset Your Password</h2>

                    <Formik
                        initialValues={{ password: '', confirmPassword: '' }}
                        validationSchema={ResetPasswordSchema}
                        onSubmit={async (values, { setSubmitting, setStatus }) => {
                            try {
                                await resetPassword(resettoken, values.password);
                                navigate('/');
                            } catch (err) {
                                setStatus({ error: err.message });
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting, status }) => (
                            <Form className="space-y-6">
                                {status?.error && <p className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md">{status.error}</p>}
                                
                                <div>
                                    <label className="text-sm font-bold text-gray-600">New Password</label>
                                    <Field name="password" type="password" className="w-full p-3 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300" />
                                    <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-gray-600">Confirm New Password</label>
                                    <Field name="confirmPassword" type="password" className="w-full p-3 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300" />
                                    <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm mt-1" />
                                </div>
                                
                                <button type="submit" disabled={isSubmitting} className="w-full py-3 font-bold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-red-300">
                                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </PageTransition>
    );
};

export default ResetPassword;