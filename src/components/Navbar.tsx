'use client'

import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

interface NavbarProps {
  isDeepSpace?: boolean
  onThemeChange?: (isDeepSpace: boolean) => void
}

export const Navbar = ({ isDeepSpace = false, onThemeChange }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleThemeChange = (newTheme: boolean) => {
    onThemeChange?.(newTheme)
  }

  const navItems = [
    { name: "About", href: "#about" },
    { name: "Team", href: "#team" },
    { name: "Technology", href: "#technology" },
    { name: "Demo", href: "#demo" },
  ]

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 py-2 bg-transparent"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ 
        background: 'transparent',
        backdropFilter: 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 px-6 mx-2 ${
          isDeepSpace 
            ? 'bg-black/20 backdrop-blur-md border border-cyan-500/20' 
            : 'bg-white/10 backdrop-blur-md border border-white/20'
        } rounded-full shadow-2xl`}>
          
          {/* Logo Section */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {/* Logo Placeholder */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDeepSpace 
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' 
                : 'bg-gradient-to-br from-blue-500/20 to-green-500/20 border border-white/30'
            }`}>
              <span className={`text-lg font-bold ${
                isDeepSpace ? 'text-cyan-300' : 'text-white'
              }`}>
                ML
              </span>
            </div>
            
            {/* Brand Name */}
            <motion.h1 
              className={`text-xl font-bold font-poppins ${
                isDeepSpace ? 'text-cyan-300' : 'text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              MoonLight
            </motion.h1>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  isDeepSpace 
                    ? 'text-gray-300 hover:text-cyan-300' 
                    : 'text-white hover:text-blue-300'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {item.name}
              </motion.button>
            ))}
            
            {/* Theme Toggle Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleThemeChange(!isDeepSpace)}
                  className={`px-4 py-2 rounded-full transition-all duration-500 ${
                    isDeepSpace
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-500/50'
                      : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50'
                  }`}
                >
                  {isDeepSpace ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                  {isDeepSpace ? 'Deep Space' : 'MoonLight'}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-full ${
                isDeepSpace
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  : 'bg-white/10 text-white border-white/30'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`md:hidden mt-4 rounded-2xl ${
            isDeepSpace 
              ? 'bg-black/20 backdrop-blur-md border border-cyan-500/20' 
              : 'bg-white/10 backdrop-blur-md border border-white/20'
          }`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMenuOpen ? 1 : 0, 
            height: isMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-6 py-4 space-y-4">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => {
                  handleNavClick(item.href)
                  setIsMenuOpen(false)
                }}
                className={`block text-sm font-medium transition-all duration-300 ${
                  isDeepSpace 
                    ? 'text-gray-300 hover:text-cyan-300' 
                    : 'text-white hover:text-blue-300'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item.name}
              </motion.button>
            ))}
            
            {/* Mobile Theme Toggle */}
            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={() => handleThemeChange(!isDeepSpace)}
                className={`w-full px-4 py-2 rounded-full transition-all duration-500 ${
                  isDeepSpace
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30'
                    : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                }`}
              >
                {isDeepSpace ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                {isDeepSpace ? 'Deep Space Mode' : 'MoonLight Mode'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}
