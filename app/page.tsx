"use client"
import Image from "next/image";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { MessageCircle, FileText, Map, UserCircle } from 'lucide-react';

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100">
      {/* Header */}
      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white/80 border-b border-blue-100 text-sm py-3 sm:py-0 shadow-md">
        <nav className="relative p-4 max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8" aria-label="Global">
          <div className="flex items-center justify-between">
            <div>
              <Image src={'/logo.svg'} alt="logo" width={150} height={150} />
            </div>
          </div>
          <div id="navbar-collapse-with-animation" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end sm:ps-7 cursor-pointer">
              {user ? (
                <div className="flex items-center">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 ring-2 ring-blue-400 rounded-full overflow-hidden shadow-md hover:ring-purple-500 transition-all duration-200"
                      }
                    }}
                  >
                    <UserButton.MenuItems>
                      <UserButton.Action label="signOut" />
                    </UserButton.MenuItems>
                  </UserButton>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="w-10 h-10 flex items-center justify-center ring-2 ring-blue-400 rounded-full bg-gray-100 shadow-md">
                    <UserCircle className="w-7 h-7 text-gray-400" />
                  </span>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="block font-extrabold text-gray-900 text-4xl md:text-5xl lg:text-6xl mb-4">
            Your <span className="bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-transparent">AI Career Copilot</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Personalized career advice, resume analysis, and step-by-step learning roadmaps—powered by AI. Take control of your career journey today.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
              <SignUpButton mode='modal' forceRedirectUrl='/dashboard'>
                <div className="flex items-center gap-x-2 font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-700 hover:to-blue-700 rounded-lg px-6 py-3 shadow-md transition text-lg">
                  Sign Up
                </div>
              </SignUpButton>
              <SignInButton mode='modal' forceRedirectUrl='/dashboard'>
                <div className="flex items-center gap-x-2 font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-700 hover:to-blue-700 rounded-lg px-6 py-3 shadow-md transition text-lg">
                  Sign In
                </div>
              </SignInButton>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Chat Feature */}
          <div className="group flex flex-col items-center bg-white rounded-2xl p-8 shadow-xl border border-blue-100 hover:shadow-2xl transition">
            <div className="flex justify-center items-center size-16 bg-blue-100 rounded-full mb-4">
              <MessageCircle className="text-blue-600" size={36} />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-purple-700 transition">AI Career Q&A Chat</h3>
            <p className="text-gray-600 mb-4 text-center">Ask any career question and get instant, personalized answers from your AI coach. From job search to interview prep, your AI is here 24/7.</p>
          </div>
          {/* Resume Analyzer Feature */}
          <div className="group flex flex-col items-center bg-white rounded-2xl p-8 shadow-xl border border-green-100 hover:shadow-2xl transition">
            <div className="flex justify-center items-center size-16 bg-green-100 rounded-full mb-4">
              <FileText className="text-green-600" size={36} />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2 group-hover:text-blue-700 transition">AI Resume Analyzer</h3>
            <p className="text-gray-600 mb-4 text-center">Upload your resume and receive actionable feedback, improvement tips, and a detailed analysis to help you stand out to employers.</p>
          </div>
          {/* Roadmap Generator Feature */}
          <div className="group flex flex-col items-center bg-white rounded-2xl p-8 shadow-xl border border-purple-100 hover:shadow-2xl transition">
            <div className="flex justify-center items-center size-16 bg-purple-100 rounded-full mb-4">
              <Map className="text-purple-600" size={36} />
            </div>
            <h3 className="text-xl font-bold text-purple-900 mb-2 group-hover:text-blue-700 transition">Career Roadmap Generator</h3>
            <p className="text-gray-600 mb-4 text-center">Get a step-by-step, visual learning roadmap for your dream role or skill. See what to learn next and track your progress with ease.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-white/80 border-t border-blue-100 text-center text-gray-500 text-sm mt-10">
        &copy; {new Date().getFullYear()} PathFinder. All rights reserved.
      </footer>
    </div>
  );
}
