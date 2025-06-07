import React from 'react'
import { NavLink } from "react-router-dom"
import Faq from './Faq';
import Contact from './Contact';
import Footer from './Footer';
import CallToAction from './CallToAction';
import {MovingDots} from "../components/moving-dots"
import { RiMailSendFill, RiMoneyDollarCircleLine } from "react-icons/ri";

const LandingPage = () => {

  return (
    <>
      {/* Navbar & hero  */}
      <div id='home' className="min-h-screen bg-black text-white relative overflow-hidden">
        
      <MovingDots />

        <div className="absolute top-10 -left-14 w-1/2 h-72 bg-[#6f34ed] opacity-30 blur-3xl"></div>
        <div className="absolute bottom-10 -right-0 w-1/2 h-64 bg-[#6f34ed] opacity-30 blur-3xl"></div>

        {/* Navigation */}
        <header className="relative z-10 flex items-center justify-between px-4 py-6 md:py-5 md:px-16">
          <div className="flex items-center">
          <img src="/white-logo.png" alt="logo" className="h-9 w-9 md:h-11 md:w-11 p-1 rounded" />
              <span className="font-medium text-gray-100 text-xl md:text-2xl">
                𝐂𝐨𝐥𝐝𝐌𝐚𝐢𝐥𝐞𝐫.𝐀𝐢
              </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 bg-[rgba(63,62,62,0.3)] px-5 py-3 rounded-2xl">
            <a href="#features" className="hover:text-[#a18cef] hover:font-semibold transition-colors">
              Features
            </a>
            <a href="#faqs" className="hover:text-[#a18cef] hover:font-semibold transition-colors">
              Faqs
            </a>
            <a href="#contact" className="hover:text-[#a18cef] hover:font-semibold transition-colors">
              Contact
            </a>
            <NavLink to="/sign-up" className="hover:text-[#a18cef] hover:font-semibold transition-colors">
              Register
            </NavLink>
          </nav>

          <NavLink
            to="/generate-email"
            className="bg-[#5d30d1] hover:bg-[#482ab5] text-white px-2 md:px-4 py-2 md:py-3 rounded-lg transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-base"
          >
            <RiMailSendFill className='h-4 w-4' /> Generate Email
          </NavLink>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 flex flex-col items-center justify-center px-6 text-center mt-16 md:mt-24">
          <div className="inline-flex items-center bg-[#1a1133] shadow-2xl rounded-full px-4 py-2 mb-6 gap-1">
            <img src="/white-logo.png" alt="logo" className="h-6 w-6 md:h-7 md:w-7 p-1 rounded" />
            <span className="text-xs md:text-sm">ColdMailer.Ai - AI Powered Email Generator</span>
          </div>

          <h1 className="text-2xl md:text-6xl lg:text-7xl font-bold max-w-6xl leading-tight mb-6">
            Transforming outreach with AI powered cold emails
          </h1>

          <p className="text-base md:text-xl text-gray-300 max-w-[580px] mb-12">
            Enhance outreach with AI-driven, scalable cold email generation, designed to boost engagement and conversions.        
          </p>

          <div className="flex gap-4 mb-20 md:mb-24">
            <NavLink
              to="/sign-in"
              className="bg-[#3f1cbc] hover:bg-[#2c1679] text-white px-5 md:px-8 py-3 rounded-lg transition-colors font-medium"
            >
              Get started
            </NavLink>
            <NavLink
              to="/sign-up"
              className="flex items-center gap-1 border border-gray-600 hover:border-gray-400 text-white px-5 md:px-8 py-3 rounded-lg transition-colors"
            >
              It's Free <RiMoneyDollarCircleLine className='h-5 w-5'/>
            </NavLink>
          </div>

          {/* Client Logos */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-24 mb-16">
            <div className="flex items-center text-gray-400">
              <div className="w-3 h-3 md:w-5 md:h-5 mr-2 opacity-50">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-semibold">Sales cold mail</span>
            </div>

            <div className="flex items-center text-gray-400">
              <div className="w-3 h-3 md:w-5 md:h-5 mr-2 opacity-50">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-semibold">Job cold mail</span>
            </div>

            <div className="flex items-center text-gray-400">
              <div className="w-3 h-3 md:w-5 md:h-5 mr-2 opacity-50">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="12" r="4" />
                  <circle cx="16" cy="12" r="4" />
                </svg>
              </div>
              <span className="text-sm sm:text-base font-semibold">Marketing mail</span>
            </div>
          </div>
        </main>
      </div>

      {/* Feature */}
      <div id='features' className='min-h-screen bg-black relative overflow-hidden'>
        <section className="w-full max-w-7xl mx-auto py-10 ">
          <div className="max-w-24 flex justify-center bg-[#16151c] mx-auto rounded-full px-4 py-2 mb-8">
            <span className="text-sm sm:text-base font-normal text-gray-200">Features</span>
          </div>

          <h2 className="text-2xl md:text-5xl text-center text-white font-bold mb-4">Why ColdMailer.AI ?</h2>
          <p className="text-lg text-gray-300 px-2 md:px-0 max-w-2xl text-center mx-auto mb-8 md:mb-12">
            Discover the key benefits of our AI-powered cold email platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 p-5 md:p-0">
            {
              features.map((feature, index) => (
                <div key={index} className="bg-gradient-to-br from-[#1d1c1f] p-6 rounded-[28px]">
                  <div className="w-7 h-7 md:w-10 md:h-10 bg-[#28252ee7] rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#6435db]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-200">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-300">{feature.description}</p>
                </div>
              ))
            }
          </div>
        </section>
      </div>

      {/* Faqs */}
      <div id='faqs' className='min-h-screen bg-black relative overflow-hidden'>
        <section className="w-full max-w-5xl mx-auto py-10 px-2 md:px-0">
          <div className="max-w-24 flex justify-center bg-[#16151c] mx-auto rounded-full px-4 py-2 mb-8">
            <span className="text-sm sm:text-base font-normal text-gray-200">FAQs</span>
          </div>

          <h2 className="text-2xl md:text-5xl text-center text-white font-bold mb-4">We're here to help</h2>
          <p className="text-lg text-gray-300 max-w-2xl text-center mx-auto mb-16">
            FAQs designed to provide the information you need.
          </p>
          <Faq />
        </section>
      </div>
      
      {/* Contact */}
      <div id='contact' className='min-h-screen bg-black relative overflow-hidden'>
        <section className="w-full max-w-7xl mx-auto py-10">
          <div className="max-w-24 flex justify-center bg-[#16151c] mx-auto rounded-full px-4 py-2 mb-2 md:mb-8">
            <span className="text-sm sm:text-base font-normal text-gray-200">Contacts</span>
          </div>
          <Contact />
        </section>
      </div>

      <CallToAction />

      <Footer />
    </>
  )
}

export default LandingPage


const features = [
  {
    title: "Instant Email Generation",
    description: "Quickly generate professional cold emails tailored to your goals, whether you're reaching out for sales, networking, job applications, or collaborations.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 5H8a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2zm0 0l-4 4m0 0l-4-4m4 4V3" />
    ),
  },
  {
    title: "Context-Aware Writing",
    description: "Our AI understands your input and customizes the tone, structure, and message to fit your purpose, audience, and intent.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9m-9 0H3m9 0V4m0 0L8 8m4-4l4 4" />
    ),
  },
  {
    title: "Personalization Inputs",
    description: "Add key details about your recipient or company and let the AI craft emails that feel human, relevant, and specific.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
  {
    title: "Tone Customization",
    description: "Whether you want to sound friendly, formal, persuasive, or direct, you can adjust the tone to match your brand or style.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17a2.25 2.25 0 104.5 0m-4.5 0h4.5m4.5-5.25a2.25 2.25 0 10-4.5 0 2.25 2.25 0 004.5 0zM3.75 11.75a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0z" />
    ),
  },
  {
    title: "One-Click Copy & Export",
    description: "Easily copy your generated email or export it for your CRM, email platform, or outreach tools with a single click.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8m-4-4h4m-4-4h4m-4-4h4M4 6h.01M4 10h.01M4 14h.01M4 18h.01" />
    ),
  },
  {
    title: "Unlimited Revisions",
    description: "Not happy with the first draft? Instantly regenerate or edit your cold email until it’s just right—no limits.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M20 4l-4.35 4.35M4 20l4.35-4.35M20 4a9 9 0 00-12.73 0L4 7.27M4 20a9 9 0 0012.73 0L20 16.73" />
    ),
  },  
  // {
  //   title: "Multiple Use-Case Templates",
  //   description: "Choose from a variety of templates tailored for different needs—outreach, follow-ups, recruiting, product pitches, and more.",
  //   icon: (
  //     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  //   ),
  // },
];

