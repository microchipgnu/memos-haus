export default function Navbar() {
    return (
      <nav className="fixed top-0 left-0 right-0 h-12 border-b border-gray-200 z-30">
        <div className="h-full flex items-center justify-center">
          <img 
            src="/memos-logo-typeface.svg" 
            alt="Memos Logo"
            className="h-4 w-auto" // Adjust height based on your logo aspect ratio
          />
        </div>
      </nav>
    )
  }