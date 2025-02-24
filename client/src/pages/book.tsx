"use client";

import { InlineWidget } from "react-calendly";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function Book() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Use Vite's environment variable
  const username = import.meta.env.VITE_CALENDLY_USERNAME;

  useEffect(() => {
    if (user) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-6xl text-center font-bold mb-8 
          bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Schedule a Consultation
        </h1>
        
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Book a free consultation to discuss how Chains-ERP can transform your business operations
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-4">
          <InlineWidget 
            url={`https://calendly.com/${username}`}
            styles={{
              height: '580px',
            }}
          />
        </div>
      </div>
    </div>
  );
} 