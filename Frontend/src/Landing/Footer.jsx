import { NavLink } from "react-router-dom"
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Logo and description */}
          <div className="mb-10 md:mb-0 max-w-md">
            <div className="flex items-center mb-4">
              {/* Logo */}
              <div className="mr-3">
                <div className="w-10 h-10 relative">
                  <div className="absolute inset-0 bg-white rounded-lg grid grid-cols-2 grid-rows-2 gap-1 p-1.5">
                    <div className="bg-white rounded-sm"></div>
                    <div className="bg-white rounded-sm"></div>
                    <div className="bg-white rounded-sm"></div>
                    <div className="bg-white rounded-sm"></div>
                  </div>
                </div>
              </div>
              <span className="text-2xl font-bold">Radison</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner in AI solutions, creating smarter systems for smarter businesses.
            </p>

            {/* Social icons */}
            <div className="flex space-x-3 mt-8">
              <NavLink
                to="#"
                className="w-10 h-10 bg-zinc-800 rounded-md flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <Facebook size={18} className="text-gray-400" />
                <span className="sr-only">Facebook</span>
              </NavLink>
              <NavLink
                to="#"
                className="w-10 h-10 bg-zinc-800 rounded-md flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <Twitter size={18} className="text-gray-400" />
                <span className="sr-only">Twitter</span>
              </NavLink>
              <NavLink
                to="#"
                className="w-10 h-10 bg-zinc-800 rounded-md flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <Instagram size={18} className="text-gray-400" />
                <span className="sr-only">Instagram</span>
              </NavLink>
              <NavLink
                to="#"
                className="w-10 h-10 bg-zinc-800 rounded-md flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <Linkedin size={18} className="text-gray-400" />
                <span className="sr-only">LinkedIn</span>
              </NavLink>
              <NavLink
                to="#"
                className="w-10 h-10 bg-zinc-800 rounded-md flex items-center justify-center hover:bg-zinc-700 transition-colors"
              >
                <Youtube size={18} className="text-gray-400" />
                <span className="sr-only">YouTube</span>
              </NavLink>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-8">
            {/* Sections */}
            <div>
              <h3 className="text-lg font-medium mb-6">Sections</h3>
              <ul className="space-y-4">
                <li>
                  <NavLink to="#process" className="text-gray-400 hover:text-white transition-colors">
                    Process
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#services" className="text-gray-400 hover:text-white transition-colors">
                    Services
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#benefits" className="text-gray-400 hover:text-white transition-colors">
                    Benefits
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#plans" className="text-gray-400 hover:text-white transition-colors">
                    Plans
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Pages */}
            <div>
              <h3 className="text-lg font-medium mb-6">Pages</h3>
              <ul className="space-y-4">
                <li>
                  <NavLink to="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/coming-soon" className="text-gray-400 hover:text-white transition-colors">
                    Coming soon
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/404" className="text-gray-400 hover:text-white transition-colors">
                    404
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

