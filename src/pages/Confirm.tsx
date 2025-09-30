import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Confirmation landing page.
 * Backend can redirect to /confirm?email=...&role=...&confirmationStatus=CONFIRMED
 * This component reads query params and redirects to /profile when confirmed.
 */

const ConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(search);
    const status = params.get("confirmationStatus") || params.get("status");
    if (status && status.toUpperCase() === "CONFIRMED") {
      // redirect to profile (user will need to be authenticated by cookie)
      navigate("/profile");
    } else {
      // show a simple message for other statuses
      // keep on this page or redirect to login
    }
  }, [search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="p-6 bg-gray-800 rounded">
        <h2 className="text-lg font-bold">Account confirmation</h2>
        <p className="mt-2">If your email was confirmed you will be redirected to your profile. If not, please check your email or contact support.</p>
      </div>
    </div>
  );
};

export default ConfirmPage;
