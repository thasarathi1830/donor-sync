"use client";

import { useEffect, useState } from "react";

interface PEPhoneButtonProps {
  onVerify: (data: {
    user_country_code: string;
    user_phone_number: string;
    user_first_name: string;
    user_last_name: string;
  }) => void;
}

const PEPhoneButton: React.FC<PEPhoneButtonProps> = ({ onVerify }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Load the external script
    const script = document.createElement("script");
    script.src = "https://www.phone.email/sign_in_button_v1.js";
    script.async = true;
    document.querySelector(".pe_signin_button")?.appendChild(script);

    // Define the listener function
    (window as any).phoneEmailListener = async (userObj: { user_json_url: string }) => {
      const user_json_url = userObj.user_json_url;
      setIsVerifying(true); // Start loading

      try {
        const response = await fetch("/api/verify-phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_json_url }),
        });

        const data = await response.json();
        if (data.error) {
          alert(`❌ Error: ${data.error}`);
          setIsVerifying(false); // Stop loading on error
        } else {
          // Pass the data to the parent component
          onVerify({
            user_country_code: data.user_country_code,
            user_phone_number: data.user_phone_number,
            user_first_name: data.user_first_name,
            user_last_name: data.user_last_name,
          });
          // Do not stop loading here, let parent handle transition
        }
      } catch (error) {
        console.error("Error:", error);
        setIsVerifying(false);
      }
    };

    return () => {
      (window as any).phoneEmailListener = null;
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
    <div suppressHydrationWarning className="pe_signin_button"
      data-client-id="13006232029048972233"
    ></div>
  );
};

export default PEPhoneButton;
