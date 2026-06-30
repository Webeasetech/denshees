"use client";
import Link from "next/link";
import { EmailIcon } from "mage-icons-react/bulk";
import { ArrowRightIcon } from "mage-icons-react/stroke";
import GoogleButton from "@/components/auth/google-button";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left section - Feature showcase */}
      <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto md:mx-0 md:ml-auto">
          <h1 className="text-4xl font-bold mb-6 tracking-tight">Denshees</h1>
          <p className="text-xl mb-8">
            Join thousands of businesses using Denshees to scale their outreach.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-black text-white p-2 mt-1">
                <EmailIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Personalized Campaigns
                </h3>
                <p className="text-gray-700">
                  Create highly personalized email sequences that convert.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-black text-white p-2 mt-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6V18M6 12H18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Smart Scheduling</h3>
                <p className="text-gray-700">
                  Send emails at the perfect time with AI-powered scheduling.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-black text-white p-2 mt-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Reply Detection</h3>
                <p className="text-gray-700">
                  Automatically stop sequences when prospects respond.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-sm text-gray-600">Already have an account?</p>
            <Link
              href="/login"
              className="inline-flex items-center mt-2 text-black border-b-2 border-black hover:bg-gray-100 transition-colors"
            >
              Sign in to your account
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Right section - Authentication */}
      <div className="flex-1 bg-gray-50 p-8 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Create your account</h2>
            <p className="text-gray-600 mb-8">
              Sign up with Google to get started in seconds
            </p>
          </div>

          <div className="space-y-6">
            <GoogleButton />

            <p className="text-center text-xs text-gray-500">
              By continuing you agree to our{" "}
              <a href="#" className="text-black hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-black hover:underline">
                Privacy Policy
              </a>
              .
            </p>

            <p className="text-center text-sm text-gray-600">
              Prefer email and password? Sign up with Google first, then add a
              password from{" "}
              <span className="font-medium text-black">Settings</span> to enable
              email login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
