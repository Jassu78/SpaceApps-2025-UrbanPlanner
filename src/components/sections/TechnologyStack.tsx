'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  Code, 
  Database, 
  Cloud, 
  Cpu, 
  Globe, 
  Zap,
  Layers,
  Server
} from "lucide-react"

interface TechnologyStackProps {
  isDeepSpace?: boolean
}

export const TechnologyStack = ({ isDeepSpace = false }: TechnologyStackProps) => {
  const techCategories = [
    {
      title: "Frontend",
      icon: Code,
      color: "blue",
      technologies: [
        { name: "Next.js 14", description: "React framework with App Router" },
        { name: "TypeScript", description: "Type-safe JavaScript" },
        { name: "Tailwind CSS", description: "Utility-first CSS framework" },
        { name: "Framer Motion", description: "Animation library" },
        { name: "Shadcn/ui", description: "Component library" },
        { name: "Leaflet.js", description: "Interactive maps" }
      ]
    },
    {
      title: "Backend",
      icon: Server,
      color: "green",
      technologies: [
        { name: "Python", description: "Core programming language" },
        { name: "FastAPI", description: "High-performance API framework" },
        { name: "PostgreSQL", description: "Relational database" },
        { name: "PostGIS", description: "Spatial database extension" },
        { name: "Redis", description: "Caching and session storage" },
        { name: "Celery", description: "Task queue system" }
      ]
    },
    {
      title: "AI/ML",
      icon: Cpu,
      color: "purple",
      technologies: [
        { name: "TensorFlow", description: "Machine learning framework" },
        { name: "PyTorch", description: "Deep learning library" },
        { name: "Scikit-learn", description: "ML algorithms" },
        { name: "GeoPandas", description: "Geospatial data analysis" },
        { name: "OpenCV", description: "Computer vision" },
        { name: "Gemini AI", description: "Google's AI API" }
      ]
    },
    {
      title: "Cloud & DevOps",
      icon: Cloud,
      color: "orange",
      technologies: [
        { name: "AWS", description: "Cloud infrastructure" },
        { name: "Docker", description: "Containerization" },
        { name: "Kubernetes", description: "Container orchestration" },
        { name: "Terraform", description: "Infrastructure as code" },
        { name: "GitHub Actions", description: "CI/CD pipeline" },
        { name: "Vercel", description: "Frontend deployment" }
      ]
    },
    {
      title: "Data Sources",
      icon: Database,
      color: "cyan",
      technologies: [
        { name: "NASA APIs", description: "Earth observation data" },
        { name: "MODIS", description: "Satellite imagery" },
        { name: "Landsat", description: "Land surface data" },
        { name: "Aura OMI", description: "Air quality data" },
        { name: "GPM", description: "Precipitation data" },
        { name: "OpenStreetMap", description: "Geographic data" }
      ]
    },
    {
      title: "Visualization",
      icon: Globe,
      color: "pink",
      technologies: [
        { name: "D3.js", description: "Data visualization" },
        { name: "Mapbox GL", description: "Interactive maps" },
        { name: "Plotly", description: "Scientific plotting" },
        { name: "Chart.js", description: "Chart library" },
        { name: "Three.js", description: "3D graphics" },
        { name: "WebGL", description: "Hardware acceleration" }
      ]
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

  const categoryVariants = {
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

  const techVariants = {
    hidden: { 
      opacity: 0, 
      x: -20
    },
    visible: { 
      opacity: 1, 
      x: 0
    }
  }

  return (
    <section id="technology" className={`py-20 relative overflow-hidden ${
      isDeepSpace 
        ? 'bg-gradient-to-b from-black via-slate-900 to-black' 
        : 'bg-gradient-to-b from-slate-50 to-white'
    }`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-10 left-10 w-32 h-32 rounded-lg blur-3xl ${
          isDeepSpace ? 'bg-cyan-500' : 'bg-blue-500'
        }`} />
        <div className={`absolute bottom-10 right-10 w-40 h-40 rounded-lg blur-3xl ${
          isDeepSpace ? 'bg-purple-500' : 'bg-green-500'
        }`} />
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
              <Zap className="w-4 h-4 mr-2" />
              Technology Stack
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
            Built with <span className={`bg-gradient-to-r ${
              isDeepSpace 
                ? 'from-cyan-400 to-blue-400' 
                : 'from-purple-600 to-pink-600'
            } bg-clip-text text-transparent`}>
              Cutting-Edge Technology
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
            Our platform leverages the latest technologies in web development, 
            artificial intelligence, and data science to deliver powerful urban planning solutions.
          </motion.p>
        </motion.div>

        {/* Technology Categories Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {techCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              variants={categoryVariants}
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
                  className={`absolute inset-0 bg-gradient-to-br ${
                    category.color === 'blue' ? 'from-blue-500/10 to-blue-600/10' :
                    category.color === 'green' ? 'from-green-500/10 to-green-600/10' :
                    category.color === 'purple' ? 'from-purple-500/10 to-purple-600/10' :
                    category.color === 'orange' ? 'from-orange-500/10 to-orange-600/10' :
                    category.color === 'cyan' ? 'from-cyan-500/10 to-cyan-600/10' :
                    'from-pink-500/10 to-pink-600/10'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                
                <CardContent className="p-8 relative z-10">
                  {/* Category Header */}
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${
                      category.color === 'blue' ? 'from-blue-500/20 to-blue-600/20' :
                      category.color === 'green' ? 'from-green-500/20 to-green-600/20' :
                      category.color === 'purple' ? 'from-purple-500/20 to-purple-600/20' :
                      category.color === 'orange' ? 'from-orange-500/20 to-orange-600/20' :
                      category.color === 'cyan' ? 'from-cyan-500/20 to-cyan-600/20' :
                      'from-pink-500/20 to-pink-600/20'
                    } group-hover:scale-110 transition-transform duration-200`}>
                      <category.icon className={`w-6 h-6 text-${category.color}-500`} />
                    </div>
                    <h3 className={`text-xl font-bold ${
                      isDeepSpace ? 'text-white group-hover:text-cyan-100' : 'text-gray-900 group-hover:text-gray-800'
                    } transition-colors duration-200`}>
                      {category.title}
                    </h3>
                  </motion.div>
                  
                  {/* Technologies List */}
                  <motion.div 
                    className="space-y-3"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {category.technologies.map((tech, techIndex) => (
                      <motion.div
                        key={techIndex}
                        variants={techVariants}
                        className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                          isDeepSpace 
                            ? 'bg-cyan-500/5 hover:bg-cyan-500/10' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold ${
                            isDeepSpace ? 'text-cyan-200' : 'text-gray-800'
                          }`}>
                            {tech.name}
                          </h4>
                          <Badge className={`text-xs ${
                            isDeepSpace 
                              ? 'bg-cyan-500/20 text-cyan-300' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {category.title}
                          </Badge>
                        </div>
                        <p className={`text-sm ${
                          isDeepSpace ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {tech.description}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Architecture Overview */}
        <motion.div 
          className={`mt-16 text-center p-8 rounded-2xl ${
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
            <Layers className={`w-16 h-16 mx-auto ${
              isDeepSpace ? 'text-cyan-400' : 'text-purple-600'
            }`} />
          </motion.div>
          
          <h3 className={`text-2xl font-bold mb-4 ${
            isDeepSpace ? 'text-white' : 'text-gray-900'
          }`}>
            Modern Architecture
          </h3>
          
          <p className={`text-lg max-w-4xl mx-auto leading-relaxed ${
            isDeepSpace ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Built with a microservices architecture, our platform ensures scalability, 
            reliability, and maintainability. Each component is designed to work 
            seamlessly together while remaining independently deployable.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
