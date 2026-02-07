"use client";

import { useEffect, useState } from "react";

interface PEEmailButtonProps {
  onVerify: (data: {
    user_email: string;
    user_first_name: string;
    user_last_name: string;
  }) => void;
}

const PEEmailButton: React.FC<PEEmailButtonProps> = ({ onVerify }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Load the external script
    const script = document.createElement("script");
    script.src = "https://www.phone.email/verify_email_v1.js";
    script.async = true;
    document.querySelector(".pe_verify_email")?.appendChild(script);

    // Define the listener function
    (window as any).phoneEmailReceiver = async (userObj: { user_json_url: string }) => {
      const user_json_url = userObj.user_json_url;
      setIsVerifying(true); // Start loading

      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_json_url }),
        });

        const data = await response.json();

        // ✅ Check if email exists before calling `toLowerCase()`
        const email = data.user_email_id?.toLowerCase().trim();
        if (!email) {
          alert("❌ Error: Email not found in response.");
          setIsVerifying(false); // Stop loading on error
          return;
        }

        // ✅ Pass structured user data to parent component
        onVerify({
          user_email: email,
          user_first_name: data.user_first_name || "Unknown",
          user_last_name: data.user_last_name || "Unknown",
        });
        // Do not stop loading here, let parent handle transition
      } catch (error) {
        console.error("Error:", error);
        setIsVerifying(false);
      }
    };

    return () => {
      (window as any).phoneEmailReceiver = null;
    };
  }, [onVerify]);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center p-3 border rounded-lg bg-secondary text-secondary-foreground animate-pulse">
        <span className="text-sm font-medium">Verifying...</span>
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="pe_verify_email"
      data-client-id="13006232029048972233"
    ></div>
  );
};

export default PEEmailButton;
