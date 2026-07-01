
const footerLinks = {
  Product: ['Features', 'Agents', 'Dashboard', 'Pricing', 'Changelog'],
  Resources: ['Documentation', 'API Reference', 'Architecture', 'Blog'],
  Company: ['About', 'Careers', 'Contact', 'Press'],
  Legal: ['Privacy', 'Terms', 'Security'],
}

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 mb-12 sm:mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.jpg" alt="TaskForge AI Logo" className="w-7 h-7 rounded-lg object-cover border border-white/10 shadow-sm" />
              <span className="text-white font-semibold text-base tracking-tight font-serif">TaskForge AI</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed">
              Your AI Workforce.
              <br />
              One Workspace.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white/60 text-xs uppercase tracking-wider font-medium mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/30 hover:text-white/60 transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            © 2026 TaskForge AI. Built with Google ADK & MCP Protocol.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/20 hover:text-white/40 transition-colors text-xs">
              Status
            </a>
            <a href="#" className="text-white/20 hover:text-white/40 transition-colors text-xs">
              GitHub
            </a>
            <a href="#" className="text-white/20 hover:text-white/40 transition-colors text-xs">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
