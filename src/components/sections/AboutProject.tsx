'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Satellite, 
  Brain, 
  MapPin, 
  TrendingUp, 
  Users, 
  Shield,
  Zap,
  Target
} from "lucide-react"

interface AboutProjectProps {
  isDeepSpace?: boolean
}

export const AboutProject = ({ isDeepSpace = false }: AboutProjectProps) => {
  const features = [
    {
      icon: Satellite,
      title: "Real-time NASA Data",
      description: "Live satellite imagery and climate data from MODIS, Landsat, and Aura missions",
      color: "blue-500",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Machine learning models for heat island detection, air quality prediction, and risk assessment",
      color: "purple-500",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: MapPin,
      title: "Interactive Mapping",
      description: "Point and area selection with comprehensive spatial analysis tools",
      color: "green-500",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Forecast climate trends and urban growth patterns for proactive planning",
      color: "orange-500",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: Users,
      title: "Community Engagement",
      description: "Citizen science integration and public input collection for inclusive planning",
      color: "pink-500",
      gradient: "from-pink-500 to-pink-600"
    },
    {
      icon: Shield,
      title: "Climate Resilience",
      description: "Comprehensive risk assessment and mitigation strategies for sustainable cities",
      color: "red-500",
      gradient: "from-red-500 to-red-600"
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
    <section id="about" className={`py-20 relative overflow-hidden ${
      isDeepSpace 
        ? 'bg-gradient-to-b from-black via-slate-900 to-black' 
        : 'bg-gradient-to-b from-slate-50 to-white'
    }`}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-10 left-10 w-32 h-32 rounded-lg blur-3xl ${
          isDeepSpace ? 'bg-cyan-500' : 'bg-blue-500'
        }`} />
        <div className={`absolute bottom-10 right-10 w-40 h-40 rounded-lg blur-3xl ${
          isDeepSpace ? 'bg-purple-500' : 'bg-green-500'
        }`} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header with animation */}
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
              <Zap className="w-4 h-4 mr-2" />
              NASA Space Apps Challenge 2024
            </Badge>
          </motion.div>
          
          <motion.h2 
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDeepSpace ? 'text-white' : 'text-gray-900'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Revolutionizing Urban Planning with
            <span className={`bg-gradient-to-r ${
              isDeepSpace 
                ? 'from-cyan-400 to-blue-400' 
                : 'from-purple-600 to-pink-600'
            } bg-clip-text text-transparent`}>
              AI & Space Data
            </span>
          </motion.h2>
          
          <motion.p 
            className={`text-xl max-w-3xl mx-auto leading-relaxed ${
              isDeepSpace ? 'text-gray-300' : 'text-gray-600'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Our platform combines cutting-edge NASA Earth observation data with advanced AI 
            to provide urban planners with unprecedented insights into climate risks, 
            environmental health, and sustainable development opportunities.
          </motion.p>
        </motion.div>

        {/* Enhanced Features Grid with stagger animation */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
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
                  : 'bg-white/80 backdrop-blur-sm hover:bg-white/90'
              }`}>
                {/* Hover gradient overlay */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
                
                <CardContent className="p-8 text-center relative z-10">
                  <motion.div 
                    className="mb-4 flex justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${
                      isDeepSpace 
                        ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-purple-50 group-hover:to-pink-50'
                    }`}>
                      <feature.icon className={`w-8 h-8 text-${feature.color} group-hover:scale-110 transition-transform duration-200`} />
                    </div>
                  </motion.div>
                  
                  <motion.h3 
                    className={`text-xl font-semibold mb-3 group-hover:scale-105 transition-transform duration-200 ${
                      isDeepSpace ? 'text-white group-hover:text-cyan-100' : 'text-gray-900 group-hover:text-gray-800'
                    }`}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <motion.p 
                    className={`leading-relaxed group-hover:scale-105 transition-transform duration-200 ${
                      isDeepSpace ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-700'
                    }`}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.description}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info Section */}
        <motion.div 
          className={`text-center p-8 rounded-2xl ${
            isDeepSpace 
              ? 'deep-space-card' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50'
          }`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Target className={`w-16 h-16 mx-auto ${
              isDeepSpace ? 'text-cyan-400' : 'text-purple-600'
            }`} />
          </motion.div>
          
          <h3 className={`text-2xl font-bold mb-4 ${
            isDeepSpace ? 'text-white' : 'text-gray-900'
          }`}>
            Built for the Future of Urban Planning
          </h3>
          
          <p className={`text-lg max-w-4xl mx-auto leading-relaxed ${
            isDeepSpace ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Our platform represents the next generation of urban planning tools, combining 
            real-time satellite data, advanced AI algorithms, and community engagement to 
            create more resilient, sustainable, and equitable cities for future generations.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
