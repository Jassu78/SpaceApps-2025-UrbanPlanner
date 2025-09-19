'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  ArrowRight, 
  ExternalLink, 
  Play, 
  Github, 
  Award,
  Map,
  BarChart3,
  MessageSquare,
  Zap,
  Rocket
} from "lucide-react"

interface DemoSectionProps {
  isDeepSpace?: boolean
}

export const DemoSection = ({ isDeepSpace = false }: DemoSectionProps) => {
  const demoFeatures = [
    {
      icon: Map,
      title: "Interactive Mapping",
      description: "Explore urban areas with real-time NASA satellite data",
      color: "blue"
    },
    {
      icon: BarChart3,
      title: "Data Visualization",
      description: "Comprehensive analytics and climate insights",
      color: "green"
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Get instant answers about urban planning",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Live climate data and predictive modeling",
      color: "orange"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  }

  return (
    <section id="demo" className={`py-20 relative overflow-hidden ${
      isDeepSpace 
        ? 'bg-gradient-to-br from-black via-slate-900 to-black' 
        : 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'
    }`}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <motion.div
          className={`absolute top-20 left-20 w-96 h-96 rounded-lg blur-3xl ${
            isDeepSpace ? 'bg-cyan-500/10' : 'bg-blue-500/10'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute bottom-20 right-20 w-80 h-80 rounded-lg blur-3xl ${
            isDeepSpace ? 'bg-purple-500/10' : 'bg-green-500/10'
          }`}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-sm ${
              isDeepSpace ? 'w-1 h-1 bg-cyan-400/40' : 'w-2 h-2 bg-white/20'
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
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Badge className={`mb-4 transition-colors duration-300 ${
              isDeepSpace 
                ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border-cyan-500/30' 
                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            }`}>
              <Rocket className="w-4 h-4 mr-2" />
              Live Demo
            </Badge>
          </motion.div>
          
          <motion.h2 
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDeepSpace ? 'text-white' : 'text-white'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Experience the Future of
            <span className={`bg-gradient-to-r ${
              isDeepSpace 
                ? 'from-cyan-400 to-blue-400' 
                : 'from-blue-400 to-green-400'
            } bg-clip-text text-transparent`}>
              Urban Planning
            </span>
          </motion.h2>
          
          <motion.p 
            className={`text-xl max-w-3xl mx-auto leading-relaxed ${
              isDeepSpace ? 'text-gray-300' : 'text-gray-300'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Try our interactive demo and see how NASA data and AI can transform 
            urban planning for a more sustainable future.
          </motion.p>
        </motion.div>

        {/* Demo Preview */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className={`group hover:shadow-2xl transition-all duration-300 border-0 relative overflow-hidden ${
            isDeepSpace 
              ? 'deep-space-card' 
              : 'bg-white/10 backdrop-blur-sm'
          }`}>
            {/* Demo Interface Mockup */}
            <div className={`p-8 ${
              isDeepSpace ? 'bg-gradient-to-br from-cyan-500/5 to-blue-500/5' : 'bg-gradient-to-br from-blue-500/5 to-green-500/5'
            }`}>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Map Interface */}
                <motion.div 
                  className="space-y-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Map className={`w-6 h-6 ${
                      isDeepSpace ? 'text-cyan-400' : 'text-blue-400'
                    }`} />
                    <h3 className={`text-xl font-semibold ${
                      isDeepSpace ? 'text-white' : 'text-white'
                    }`}>
                      Interactive Map
                    </h3>
                  </div>
                  <div className={`h-64 rounded-lg border-2 border-dashed ${
                    isDeepSpace 
                      ? 'border-cyan-500/30 bg-cyan-500/5' 
                      : 'border-blue-500/30 bg-blue-500/5'
                  } flex items-center justify-center`}>
                    <div className="text-center">
                      <Map className={`w-16 h-16 mx-auto mb-2 ${
                        isDeepSpace ? 'text-cyan-400/50' : 'text-blue-400/50'
                      }`} />
                      <p className={`${
                        isDeepSpace ? 'text-cyan-300/70' : 'text-blue-300/70'
                      }`}>
                        Real-time NASA satellite data
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Analytics Dashboard */}
                <motion.div 
                  className="space-y-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className={`w-6 h-6 ${
                      isDeepSpace ? 'text-purple-400' : 'text-green-400'
                    }`} />
                    <h3 className={`text-xl font-semibold ${
                      isDeepSpace ? 'text-white' : 'text-white'
                    }`}>
                      Analytics Dashboard
                    </h3>
                  </div>
                  <div className={`h-64 rounded-lg border-2 border-dashed ${
                    isDeepSpace 
                      ? 'border-purple-500/30 bg-purple-500/5' 
                      : 'border-green-500/30 bg-green-500/5'
                  } flex items-center justify-center`}>
                    <div className="text-center">
                      <BarChart3 className={`w-16 h-16 mx-auto mb-2 ${
                        isDeepSpace ? 'text-purple-400/50' : 'text-green-400/50'
                      }`} />
                      <p className={`${
                        isDeepSpace ? 'text-purple-300/70' : 'text-green-300/70'
                      }`}>
                        Climate insights & predictions
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Demo Features */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {demoFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -10
              }}
            >
              <Card className={`group hover:shadow-2xl transition-all duration-300 border-0 h-full cursor-pointer relative overflow-hidden ${
                isDeepSpace 
                  ? 'deep-space-card hover:bg-cyan-500/5' 
                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
              }`}>
                <CardContent className="p-6 text-center relative z-10">
                  <motion.div 
                    className="mb-4 flex justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`p-3 rounded-xl ${
                      feature.color === 'blue' ? 'bg-blue-500/20' :
                      feature.color === 'green' ? 'bg-green-500/20' :
                      feature.color === 'purple' ? 'bg-purple-500/20' :
                      'bg-orange-500/20'
                    } group-hover:scale-110 transition-transform duration-200`}>
                      <feature.icon className={`w-6 h-6 text-${feature.color}-500`} />
                    </div>
                  </motion.div>
                  
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDeepSpace ? 'text-white group-hover:text-cyan-100' : 'text-white group-hover:text-blue-100'
                  } transition-colors duration-200`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`text-sm ${
                    isDeepSpace ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-300 group-hover:text-gray-200'
                  } transition-colors duration-200`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className={`px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transition-all duration-300 font-['Poppins'] group relative overflow-hidden ${
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
                  <Play className="mr-2 w-5 h-5" />
                  Launch Demo
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.span>
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
                className={`px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm font-['Poppins'] group relative overflow-hidden transition-all duration-300 ${
                  isDeepSpace
                    ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/50'
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
              >
                <motion.span
                  className="relative z-10 flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Github className="mr-2 w-5 h-5" />
                  View Source
                  <ExternalLink className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.span>
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
          </div>

          {/* Additional Info */}
          <motion.div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              isDeepSpace 
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' 
                : 'bg-white/10 text-white border border-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">
              NASA Space Apps Challenge 2024
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
