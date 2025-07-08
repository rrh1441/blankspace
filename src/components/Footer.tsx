export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Blank Space</h3>
            <p className="text-gray-600 text-sm">
              Turn your photos into beautiful coloring books
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
            <a 
              href="/privacy" 
              className="hover:text-black transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              className="hover:text-black transition-colors"
            >
              Terms of Service
            </a>
            <span className="text-gray-400">
              © 2024 Blank Space. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}