"use client"

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-black/50 py-4 mt-6 backdrop-blur-xl">
      <div className="container flex flex-col items-center gap-4">
        <nav className="flex gap-8 text-sm">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Contact
          </a>
        </nav>
        <p className="text-sm text-gray-500">
          © 2025 Cold Mailer. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

