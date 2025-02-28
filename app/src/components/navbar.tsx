import Image from 'next/image';

export default function Navbar() {
    return (
      <nav className="fixed top-0 left-0 right-0 h-12 z-30">
        <div className="h-full flex items-center justify-center">
          <Image 
            src="/memos-logo-typeface.svg" 
            alt="Memos Logo"
            width={100}
            height={100}
          />
        </div>
      </nav>
    )
  }