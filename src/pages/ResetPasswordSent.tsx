import { Link } from "react-router-dom";

const ResetPasswordSent = () => {
  return (
    <div className="mx-auto max-w-sm p-6 mt-10 bg-white rounded-lg shadow-sm text-center">
      <h1 className="text-2xl font-semibold mb-4">Check Your Email</h1>
      <p className="text-gray-700">
        If the email exists in our system, a password reset link has been sent.
        Please check your inbox.
      </p>

      <div className="mt-6 flex justify-between">
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go to Login
        </Link>
        <Link
          to="/"
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordSent;
