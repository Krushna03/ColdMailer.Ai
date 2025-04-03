import React from 'react'
import { NavLink } from "react-router-dom"
import { FaArrowRight } from "react-icons/fa6";
import Faq from './Faq';
import Contact from './Contact';
import Footer from './Footer';

const LandingPage = () => {

  return (
    <>
      {/* <MovingDots /> */}
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        

        <div className="absolute top-10 -left-14 w-1/2 h-72 bg-[#6f34ed] opacity-30 blur-3xl"></div>
        <div className="absolute bottom-10 -right-0 w-1/2 h-64 bg-[#6f34ed] opacity-30 blur-3xl"></div>

        {/* Navigation */}
        <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-16">
          <div className="flex items-center">
          <img src="/white-logo.png" alt="logo" className="h-11 w-11 p-1 rounded" />
              <span className="font-medium text-gray-100 text-2xl">
                𝐂𝐨𝐥𝐝𝐌𝐚𝐢𝐥𝐞𝐫.𝐀𝐢
              </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 bg-[rgba(3,3,3,0.3)] px-5 py-3 rounded-2xl">
            <NavLink href="#process" className="hover:text-purple-300 transition-colors">
              Process
            </NavLink>
            <NavLink href="#services" className="hover:text-purple-300 transition-colors">
              Services
            </NavLink>
            <NavLink href="#benefits" className="hover:text-purple-300 transition-colors">
              Benefits
            </NavLink>
            <NavLink href="#plans" className="hover:text-purple-300 transition-colors">
              Plans
            </NavLink>
            <NavLink href="#contact" className="hover:text-purple-300 transition-colors">
              Contact
            </NavLink>
          </nav>

          <NavLink
            href="#contact"
            className="bg-[#6435db] hover:bg-[#482ab5] text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            Generate Cold Email <FaArrowRight />
          </NavLink>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 flex flex-col items-center justify-center px-6 text-center mt-20 md:mt-24">
          <div className="inline-flex items-center bg-[#1a1133] shadow-2xl rounded-full px-4 py-2 mb-6">
            <img src="/white-logo.png" alt="logo" className="h-7 w-7 p-1 rounded" />
            <span className="text-sm">ColdMailer.Ai - AI Powered Email Generator</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-6xl leading-tight mb-6">
            Transforming outreach with AI powered cold emails
          </h1>

          <p className="text-xl text-gray-300 max-w-[580px] mb-12">
            Enhance outreach with AI-driven, scalable cold email generation, designed to boost engagement and conversions.        
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-24">
            <NavLink
              href="#services"
              className="bg-[#3f1cbc] hover:bg-[#2c1679] text-white px-8 py-3 rounded-lg transition-colors font-medium"
            >
              Get started
            </NavLink>
            <NavLink
              href="#plans"
              className="border border-gray-600 hover:border-gray-400 text-white px-8 py-3 rounded-lg transition-colors"
            >
              See Plans
            </NavLink>
          </div>

          {/* Client Logos */}
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 mb-16">
            <div className="flex items-center text-gray-400">
              <div className="w-5 h-5 mr-2 opacity-50">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <span className="text-xl font-semibold">Logoipsum</span>
            </div>
            <div className="flex items-center text-gray-400">
              <div className="w-5 h-5 mr-2 opacity-50">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                </svg>
              </div>
              <span className="text-xl font-semibold">Logoipsum</span>
            </div>
            <div className="flex items-center text-gray-400">
              <div className="w-5 h-5 mr-2 opacity-50">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="12" r="4" />
                  <circle cx="16" cy="12" r="4" />
                </svg>
              </div>
              <span className="text-xl font-semibold">Logoipsum</span>
            </div>
          </div>
        </main>
      </div>

      <div className='min-h-screen bg-black'>
      <section className="w-full max-w-7xl mx-auto py-10 ">
          <div className="max-w-24 flex justify-center bg-[#16151c] mx-auto rounded-full px-4 py-2 mb-8">
            <span className="text-base font-normal text-gray-200">Features</span>
          </div>

          <h2 className="text-4xl md:text-5xl text-center text-white font-bold mb-4">Why ColdMailer.AI ?</h2>
          <p className="text-lg text-gray-300 max-w-2xl text-center mx-auto mb-12">
            Discover the key benefits of our AI-powered cold email platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {
              features.map((feature, index) => (
                <div key={index} className="bg-gradient-to-br from-[#1d1c1f] p-6 rounded-[28px]">
                  <div className="w-10 h-10 bg-[#28252ee7] rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#6435db]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-200">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))
            }
          </div>
        </section>
      </div>

      <div className='min-h-screen bg-black'>
        <section className="w-full max-w-5xl mx-auto py-10 ">
          <div className="max-w-24 flex justify-center bg-[#16151c] mx-auto rounded-full px-4 py-2 mb-8">
            <span className="text-base font-normal text-gray-200">FAQs</span>
          </div>

          <h2 className="text-4xl md:text-5xl text-center text-white font-bold mb-4">We're here to help</h2>
          <p className="text-lg text-gray-300 max-w-2xl text-center mx-auto mb-16">
            FAQs designed to provide the information you need.
          </p>
          <Faq />
        </section>
      </div>
      
      <div className='min-h-screen bg-black'>
        <section className="w-full max-w-5xl mx-auto py-10 ">
          <div className="max-w-24 flex justify-center bg-[#16151c] mx-auto rounded-full px-4 py-2 mb-8">
            <span className="text-base font-normal text-gray-200">Contacts</span>
          </div>
          <Contact />
        </section>
      </div>

      <Footer />
    </>
  )
}

export default LandingPage


const features = [
  {
    title: "AI-Powered Personalization",
    description: "Generate highly personalized cold emails at scale using advanced AI that adapts to each recipient's profile and preferences.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: "Response Rate Analytics",
    description: "Track and analyze email performance with detailed metrics on open rates, response rates, and engagement to continuously improve your campaigns.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
  {
    title: "Automated Follow-ups",
    description: "Set up intelligent follow-up sequences that adapt timing and content based on recipient behavior and engagement patterns.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: "Anti-Spam Optimization",
    description: "Our AI ensures your emails bypass spam filters by optimizing content, subject lines, and sending patterns for maximum deliverability.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    title: "Audience Segmentation",
    description: "Segment your prospects with AI-driven insights to create targeted campaigns that resonate with specific audience groups and industries.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
  },
  {
    title: "Smart Scheduling",
    description: "Send emails at the optimal time for each recipient based on AI analysis of past engagement patterns and timezone considerations.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
  },
];