'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Sun, Moon, ChevronDown, BarChart3, MapPin, MessageSquare, Activity } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavbarProps {
  isDeepSpace?: boolean
  onThemeChange?: (isDeepSpace: boolean) => void
}

export const Navbar = ({ isDeepSpace = false, onThemeChange }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleThemeChange = (newTheme: boolean) => {
    onThemeChange?.(newTheme)
  }

  const navItems = [
    { name: "About", href: "#about" },
    { name: "Team", href: "#team" },
    { name: "Technology", href: "#technology" },
    { name: "Demo", href: "#demo" },
  ]

  const appPages = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Map", href: "/map", icon: MapPin },
    { name: "Analytics", href: "/analytics", icon: Activity },
    { name: "AI Chat", href: "/chat", icon: MessageSquare },
  ]

  const handleNavClick = (href: string) => {
    // If we're on the home page, scroll to the section
    if (pathname === '/') {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // If we're on another page, navigate to home and then scroll
      window.location.href = `/${href}`
    }
  }

  const getCurrentPageName = () => {
    if (pathname === '/') return 'MoonLight'
    
    const currentPage = appPages.find(page => page.href === pathname)
    if (currentPage) return currentPage.name
    
    return 'MoonLight'
  }

  const getCurrentPageIcon = () => {
    if (pathname === '/') return null
    
    const currentPage = appPages.find(page => page.href === pathname)
    if (currentPage) return currentPage.icon
    
    return null
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-[9999] py-2 bg-transparent"
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
            ? 'bg-black/30 backdrop-blur-md border border-cyan-500/20' 
            : 'bg-slate-900/30 backdrop-blur-md border border-white/20'
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
            
            {/* Current Page Name */}
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {getCurrentPageIcon() && React.createElement(getCurrentPageIcon()!, {
                className: `w-5 h-5 ${
                  isDeepSpace ? 'text-cyan-300' : 'text-white'
                }`
              })}
              <h1 
                className={`text-xl font-bold font-poppins ${
                  isDeepSpace ? 'text-cyan-300' : 'text-white'
                }`}
              >
                {getCurrentPageName()}
              </h1>
            </motion.div>
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

            {/* App Pages Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setIsAppMenuOpen(!isAppMenuOpen)}
                className={`flex items-center space-x-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  isDeepSpace 
                    ? 'text-gray-300 hover:text-cyan-300' 
                    : 'text-white hover:text-blue-300'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <span>App</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  isAppMenuOpen ? 'rotate-180' : ''
                }`} />
              </motion.button>

              {/* Dropdown Menu */}
              <motion.div
                className={`absolute top-full left-0 mt-2 w-48 rounded-lg shadow-lg z-[9998] ${
                  isDeepSpace 
                    ? 'bg-black/30 backdrop-blur-md border border-cyan-500/20' 
                    : 'bg-slate-900/30 backdrop-blur-md border border-white/20'
                }`}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ 
                  opacity: isAppMenuOpen ? 1 : 0, 
                  y: isAppMenuOpen ? 0 : -10,
                  scale: isAppMenuOpen ? 1 : 0.95
                }}
                transition={{ duration: 0.2 }}
                style={{ display: isAppMenuOpen ? 'block' : 'none' }}
              >
                <div className="py-2">
                  {appPages.map((page) => (
                    <Link
                      key={page.name}
                      href={page.href}
                      onClick={() => setIsAppMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-2 text-sm transition-all duration-200 hover:bg-white/10 ${
                        pathname === page.href
                          ? isDeepSpace
                            ? 'text-cyan-300 bg-cyan-500/10'
                            : 'text-blue-300 bg-blue-500/10'
                          : isDeepSpace
                            ? 'text-gray-300 hover:text-cyan-300'
                            : 'text-white hover:text-blue-300'
                      }`}
                    >
                      <page.icon className="w-4 h-4" />
                      <span>{page.name}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop Theme Toggle */}
            <motion.div
              className="hidden md:block"
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

            {/* Mobile Theme Toggle - Icon Only */}
            <motion.div
              className="md:hidden"
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
                  className={`p-2 rounded-full ${
                    isDeepSpace
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30'
                      : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                  }`}
                >
                  {isDeepSpace ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>
              </motion.div>
            </motion.div>

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
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`md:hidden mt-4 rounded-2xl z-[9998] ${
            isDeepSpace 
              ? 'bg-black/30 backdrop-blur-md border border-cyan-500/20' 
              : 'bg-slate-900/30 backdrop-blur-md border border-white/20'
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

            {/* Mobile App Pages */}
            <div className="pt-4 border-t border-white/10">
              <p className={`text-xs font-medium mb-3 ${
                isDeepSpace ? 'text-cyan-400' : 'text-blue-400'
              }`}>
                APPLICATION PAGES
              </p>
              {appPages.map((page) => (
                <Link
                  key={page.name}
                  href={page.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 py-2 text-sm font-medium transition-all duration-300 ${
                    pathname === page.href
                      ? isDeepSpace
                        ? 'text-cyan-300'
                        : 'text-blue-300'
                      : isDeepSpace
                        ? 'text-gray-300 hover:text-cyan-300'
                        : 'text-white hover:text-blue-300'
                  }`}
                >
                  <page.icon className="w-4 h-4" />
                  <span>{page.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}
