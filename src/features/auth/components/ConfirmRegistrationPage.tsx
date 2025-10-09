import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ConfirmRegistrationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [statusMessage, setStatusMessage] = useState("Processing your registration...");
  const [statusType, setStatusType] = useState<"success" | "error" | "loading">("loading");
  const [showRedirectBtn, setShowRedirectBtn] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (!code) {
      setStatusMessage("Confirmation code is missing or invalid.");
      setStatusType("error");
      setShowRedirectBtn(true);
      return;
    }

    const confirmRegistration = async () => {
      try {
        const response = await fetch(`/api/v1/users/confirm/${code}`, {
          method: "GET",
        });

        if (!response.ok) {
          let errorMsg = "Confirmation failed. Please try again.";
          try {
            const data = await response.json();
            if (data?.message) errorMsg = data.message;
          } catch {
          }

          setStatusMessage(errorMsg);
          setStatusType("error");
          setShowRedirectBtn(true);
          return;
        }

        setStatusMessage("Your registration has been successfully confirmed! Redirecting to login...");
        setStatusType("success");

        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        console.error("Confirmation error:", error);
        setStatusMessage("A network error occurred. Please try again later.");
        setStatusType("error");
        setShowRedirectBtn(true);
      }
    };

    confirmRegistration();
  }, [location.search, navigate]);

  return (
    <div className="mx-auto max-w-md p-6 mt-20 bg-white rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-semibold mb-4">Registration Confirmation</h1>

      <p
        className={`text-base mb-6 ${
          statusType === "success"
            ? "text-green-600"
            : statusType === "error"
            ? "text-red-500"
            : "text-gray-700"
        }`}
      >
        {statusMessage}
      </p>

      {showRedirectBtn && (
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-zinc-800"
        >
          Go to Login
        </button>
      )}
    </div>
  );
}
