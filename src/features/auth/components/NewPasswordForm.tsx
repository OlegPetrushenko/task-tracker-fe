import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { passwordValidation } from "../../../utils/passwordValidation";

interface NewPasswordFormValues {
  newPassword: string;
}

const NewPasswordForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resetCode, setResetCode] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error">("error");
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    setResetCode(code);
  }, [location.search]);

  const formik = useFormik<NewPasswordFormValues>({
    initialValues: { newPassword: "" },
    validationSchema: Yup.object({
      newPassword: passwordValidation,
    }),
    onSubmit: async (values) => {
      if (!resetCode) {
        setStatusMessage("Reset code is missing or invalid.");
        setStatusType("error");
        setShowButtons(true);
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/api/v1/auth/new-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: resetCode,
            newPassword: values.newPassword,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          setStatusMessage(err.message || "Failed to reset password");
          setStatusType("error");
          setShowButtons(true);
        } else {
          setStatusMessage("Password has been successfully reset.");
          setStatusType("success");
          setShowButtons(false);
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (err) {
        setStatusMessage("Network error. Please try again.");
        setStatusType("error");
        setShowButtons(true);
      }
    },
  });

  return (
    <div className="mx-auto max-w-sm p-6 mt-10 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-semibold text-center mb-4">Set New Password</h1>

      {statusMessage && (
        <p
          className={`text-center mb-4 text-sm ${
            statusType === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {statusMessage}
        </p>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            {...formik.getFieldProps("newPassword")}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
              formik.touched.newPassword && formik.errors.newPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Enter new password"
          />
          {formik.touched.newPassword && formik.errors.newPassword && (
            <p className="text-sm text-red-500">{formik.errors.newPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-black text-white font-medium rounded-md hover:bg-zinc-800"
        >
          Set Password
        </button>
      </form>

      {showButtons && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigate("/auth/reset-password")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Restore Password
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Go to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default NewPasswordForm;
