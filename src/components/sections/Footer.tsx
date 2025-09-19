'use client'

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  ExternalLink,
  Heart,
  Rocket,
  Star
} from "lucide-react"

interface FooterProps {
  isDeepSpace?: boolean
}

export const Footer = ({ isDeepSpace = false }: FooterProps) => {
  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/team-moonlight",
      label: "GitHub",
      color: "hover:text-gray-300"
    },
    {
      icon: Linkedin,
      href: "https://linkedin.com/company/team-moonlight",
      label: "LinkedIn",
      color: isDeepSpace ? "hover:text-cyan-400" : "hover:text-blue-400"
    },
    {
      icon: Twitter,
      href: "https://twitter.com/team_moonlight",
      label: "Twitter",
      color: isDeepSpace ? "hover:text-purple-400" : "hover:text-cyan-400"
    },
    {
      icon: Mail,
      href: "mailto:team@moonlight-urban.com",
      label: "Email",
      color: isDeepSpace ? "hover:text-green-400" : "hover:text-green-400"
    }
  ]

  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "Team", href: "#team" },
    { name: "Technology", href: "#technology" },
    { name: "Demo", href: "#demo" }
  ]

  const projectLinks = [
    { name: "Documentation", href: "#docs" },
    { name: "API Reference", href: "#api" },
    { name: "GitHub Repository", href: "https://github.com/team-moonlight" },
    { name: "NASA Space Apps", href: "https://www.spaceappschallenge.org/" }
  ]

  return (
    <footer className={`relative overflow-hidden ${
      isDeepSpace 
        ? 'bg-gradient-to-br from-black via-slate-900 to-black' 
        : 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'
    }`}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <motion.div
          className={`absolute top-10 left-10 w-64 h-64 rounded-lg blur-3xl ${
            isDeepSpace ? 'bg-cyan-500/10' : 'bg-blue-500/10'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute bottom-10 right-10 w-80 h-80 rounded-lg blur-3xl ${
            isDeepSpace ? 'bg-purple-500/10' : 'bg-green-500/10'
          }`}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-sm ${
              isDeepSpace ? 'w-1 h-1 bg-cyan-400/30' : 'w-1 h-1 bg-white/20'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`p-3 rounded-xl ${
                  isDeepSpace 
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20' 
                    : 'bg-gradient-to-br from-blue-500/20 to-green-500/20'
                }`}>
                  <Rocket className={`w-8 h-8 ${
                    isDeepSpace ? 'text-cyan-400' : 'text-blue-400'
                  }`} />
                </div>
                <h3 className={`text-2xl font-bold ${
                  isDeepSpace ? 'text-white' : 'text-white'
                }`}>
                  Team MoonLight
                </h3>
              </motion.div>
              
              <p className={`text-lg leading-relaxed mb-6 ${
                isDeepSpace ? 'text-gray-300' : 'text-gray-300'
              }`}>
                Illuminating Urban Planning with AI. We&apos;re building the future of 
                sustainable cities using NASA Earth observation data and cutting-edge 
                artificial intelligence.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${
                      isDeepSpace ? 'text-cyan-400/60' : 'text-gray-400'
                    } ${social.color} transition-all duration-200 p-3 rounded-full hover:bg-white/10`}
                    whileHover={{ 
                      scale: 1.2,
                      rotate: 5,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className={`text-lg font-semibold mb-4 ${
                isDeepSpace ? 'text-white' : 'text-white'
              }`}>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className={`transition-colors duration-200 ${
                        isDeepSpace 
                          ? 'text-gray-300 hover:text-cyan-300' 
                          : 'text-gray-300 hover:text-blue-300'
                      }`}
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Project Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className={`text-lg font-semibold mb-4 ${
                isDeepSpace ? 'text-white' : 'text-white'
              }`}>
                Project
              </h4>
              <ul className="space-y-3">
                {projectLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={`transition-colors duration-200 flex items-center gap-2 ${
                        isDeepSpace 
                          ? 'text-gray-300 hover:text-cyan-300' 
                          : 'text-gray-300 hover:text-blue-300'
                      }`}
                    >
                      {link.name}
                      {link.href.startsWith('http') && (
                        <ExternalLink className="w-3 h-3" />
                      )}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Newsletter Signup */}
          <motion.div 
            className={`p-8 rounded-2xl mb-12 ${
              isDeepSpace 
                ? 'deep-space-card' 
                : 'bg-white/5 backdrop-blur-sm'
            }`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <h3 className={`text-2xl font-bold mb-4 ${
                isDeepSpace ? 'text-white' : 'text-white'
              }`}>
                Stay Updated
              </h3>
              <p className={`text-lg mb-6 ${
                isDeepSpace ? 'text-gray-300' : 'text-gray-300'
              }`}>
                Get the latest updates on our urban planning innovations and NASA Space Apps progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`flex-1 px-4 py-3 rounded-full border-0 ${
                    isDeepSpace 
                      ? 'bg-cyan-500/10 text-white placeholder-cyan-300/70 border border-cyan-500/20 focus:border-cyan-500/50' 
                      : 'bg-white/10 text-white placeholder-gray-300/70 border border-white/20 focus:border-white/50'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-200`}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      isDeepSpace
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white'
                    }`}
                  >
                    Subscribe
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className={`py-8 border-t ${
            isDeepSpace 
              ? 'border-cyan-500/20' 
              : 'border-white/10'
          }`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`flex items-center gap-2 ${
              isDeepSpace ? 'text-gray-400' : 'text-gray-400'
            }`}>
              <span>© 2024 Team MoonLight. Built for</span>
              <motion.span
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1"
              >
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold">NASA Space Apps Challenge</span>
              </motion.span>
            </div>
            
            <div className={`flex items-center gap-2 ${
              isDeepSpace ? 'text-gray-400' : 'text-gray-400'
            }`}>
              <span>Made with</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-500" />
              </motion.span>
              <span>by Team MoonLight</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
