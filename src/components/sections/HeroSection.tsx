'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Globe, Brain } from "lucide-react"
import { motion } from "framer-motion"

interface HeroSectionProps {
  isDeepSpace?: boolean
}

export const HeroSection = ({ isDeepSpace = false }: HeroSectionProps) => {

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden font-poppins transition-all duration-1000 pt-16 ${
      isDeepSpace 
        ? 'deep-space-hero' 
        : 'moonlight-hero'
    }`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0" suppressHydrationWarning>
        {/* Floating geometric shapes with improved animations */}
        <motion.div 
          className={`absolute top-20 left-20 w-72 h-72 rounded-lg blur-3xl ${
            isDeepSpace ? 'bg-cyan-500/20' : 'bg-blue-500/20'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className={`absolute bottom-20 right-20 w-96 h-96 rounded-lg blur-3xl ${
            isDeepSpace ? 'bg-purple-500/20' : 'bg-green-500/20'
          }`}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-lg blur-3xl ${
            isDeepSpace ? 'bg-blue-500/15' : 'bg-cyan-500/20'
          }`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
        
        {/* Floating geometric particles with improved animation */}
        {[...Array(15)].map((_, i) => {
          // Generate random positions once on mount to avoid hydration issues
          const randomLeft = Math.random() * 100;
          const randomTop = Math.random() * 100;
          const randomDuration = 3 + Math.random() * 2;
          const randomDelay = Math.random() * 5;
          
          return (
            <motion.div
              key={i}
              className={`absolute rounded-sm ${
                isDeepSpace 
                  ? 'w-1 h-1 bg-white' 
                  : 'w-2 h-2 bg-white/30'
              }`}
              style={{
                left: `${randomLeft}%`,
                top: `${randomTop}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                delay: randomDelay,
                ease: "easeInOut"
              }}
            />
          );
        })}

        {/* Deep space cosmic dust */}
        {isDeepSpace && [...Array(20)].map((_, i) => {
          // Generate random positions once on mount to avoid hydration issues
          const randomLeft = Math.random() * 100;
          const randomTop = Math.random() * 100;
          const randomDuration = 4 + Math.random() * 2;
          const randomDelay = Math.random() * 10;
          
          return (
            <motion.div
              key={`dust-${i}`}
              className="absolute w-0.5 h-0.5 bg-cyan-400/40 rounded-full"
              style={{
                left: `${randomLeft}%`,
                top: `${randomTop}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                delay: randomDelay,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">

        {/* Staggered text animations */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className={`text-6xl md:text-8xl font-bold mb-4 font-poppins ${
              isDeepSpace
                ? 'deep-space-text'
                : 'moonlight-text'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            Team MoonLight
          </motion.h1>
          <motion.div 
            className={`flex items-center justify-center gap-2 text-2xl font-poppins ${
              isDeepSpace ? 'text-cyan-300' : 'text-blue-300'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >✨</motion.span>
            <span>Illuminating Urban Planning with AI</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
            >✨</motion.span>
          </motion.div>
        </motion.div>


        {/* Enhanced feature highlights with stagger animation */}
        <motion.div 
          className="flex flex-wrap justify-center gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {[
            { icon: Globe, text: "Real-time NASA Data", color: isDeepSpace ? "cyan-400" : "blue-400" },
            { icon: Brain, text: "AI-Powered Insights", color: isDeepSpace ? "purple-400" : "green-400" },
            { icon: Sparkles, text: "Smart Recommendations", color: isDeepSpace ? "blue-400" : "cyan-400" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className={`flex items-center gap-2 rounded-full px-4 py-2 group cursor-pointer transition-all duration-300 ${
                isDeepSpace 
                  ? 'bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:bg-cyan-500/10' 
                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <feature.icon className={`w-5 h-5 text-${feature.color} group-hover:scale-110 transition-transform duration-200`} />
              <span className={`font-poppins group-hover:scale-105 transition-transform duration-200 ${
                isDeepSpace ? 'text-white group-hover:text-cyan-100' : 'text-white group-hover:text-blue-100'
              }`}>
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced CTA Buttons with micro-interactions */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className={`px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transition-all duration-300 font-poppins group relative overflow-hidden ${
                isDeepSpace
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white hover:shadow-cyan-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white hover:shadow-blue-500/25'
              }`}
            >
              <motion.span
                className="relative z-10 flex items-center"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Launch App
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.span>
              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              size="lg"
              className={`px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm font-poppins group relative overflow-hidden transition-all duration-300 ${
                isDeepSpace
                  ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/50'
                  : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              <motion.span
                className="relative z-10"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                View Demo
              </motion.span>
              {/* Subtle glow effect */}
              <motion.div
                className={`absolute inset-0 rounded-full ${
                  isDeepSpace 
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10' 
                    : 'bg-gradient-to-r from-blue-500/10 to-green-500/10'
                }`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </motion.div>
        </motion.div>
      </div>

    </section>
  )
}
