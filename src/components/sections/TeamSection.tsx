'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Github, Linkedin, Twitter, Mail, Star } from "lucide-react"

interface TeamSectionProps {
  isDeepSpace?: boolean
}

export const TeamSection = ({ isDeepSpace = false }: TeamSectionProps) => {
  const teamMembers = [
    {
      name: "Jaswanth Jogi",
      role: "Team Lead",
      skills: ["Python", "React", "ML/AI", "GIS"],
      avatar: "👨‍💻",
      social: {
        github: "https://github.com/jassu78",
        linkedin: "https://linkedin.com/in/jassu78",
        email: "jaswanthjogi7815@gmail.com"
      }
    },
    {
      name: "Kadavakollu Chaitanya",
      role: "Backend Developer",
      skills: ["Python", "FastAPI", "ML/AI", "Data Science"],
      avatar: "👨‍💻",
      social: {
        github: "https://github.com/chaitanya07422",
        linkedin: "https://in.linkedin.com/in/chaitanya-kadavakollu-354084278",
        email: "Kadavakolluchaitanya@gmail.com"
      }
    },
    {
      name: "Gandreti Uday Kiran",
      role: "Full-Stack Developer",
      skills: ["React", "Node.js", "JavaScript", "Web Development"],
      avatar: "👨‍💻",
      social: {
        github: "https://github.com/udaykirangandreti",
        linkedin: "https://www.linkedin.com/in/gandreti-uday-kiran-52a50828a",
        email: "udaykirangandreti@gmail.com"
      }
    },
    {
      name: "Palisetti Ravi Shankar",
      role: "Data Engineer",
      skills: ["Python", "Data Processing", "Analytics", "Database"],
      avatar: "👨‍💻",
      social: {
        github: "https://github.com/Ravishankarpalisetti",
        linkedin: "https://www.linkedin.com/in/ravi-shankar-palisetti",
        email: "palisettiravishankar1115@gmail.com"
      }
    },
    {
      name: "Chintha Venkata Rama Subba Rao",
      role: "Frontend Developer",
      skills: ["React", "TypeScript", "UI/UX", "Web Development"],
      avatar: "👨‍💻",
      social: {
        github: "https://github.com/Rama2103",
        linkedin: "https://www.linkedin.com/in/rama-chintha21/",
        email: "ramach2103@gmail.com"
      }
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
      y: 50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  }

  return (
    <section id="team" className={`py-20 relative overflow-hidden ${
      isDeepSpace 
        ? 'bg-gradient-to-br from-black via-slate-900 to-black' 
        : 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'
    }`}>
      {/* Enhanced background effects */}
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
        
        {/* Floating geometric particles */}
        {[...Array(12)].map((_, i) => {
          // Use fixed positions to avoid hydration mismatch
          const positions = [
            { left: 3.68, top: 98.06 },
            { left: 12.96, top: 40.82 },
            { left: 14.39, top: 73.96 },
            { left: 97.85, top: 7.12 },
            { left: 63.42, top: 32.15 },
            { left: 63.58, top: 26.43 },
            { left: 15.23, top: 14.75 },
            { left: 35.56, top: 8.91 },
            { left: 97.65, top: 60.73 },
            { left: 63.81, top: 18.12 },
            { left: 14.27, top: 6.31 },
            { left: 21.67, top: 62.65 }
          ]
          const pos = positions[i] || { left: 50, top: 50 }
          
          return (
            <motion.div
              key={i}
              className={`absolute rounded-sm ${
                isDeepSpace ? 'w-2 h-2 bg-cyan-400/20' : 'w-2 h-2 bg-white/20'
              }`}
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3 + (i * 0.2),
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          )
        })}
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
          <motion.h2 
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDeepSpace ? 'text-white' : 'text-white'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Meet Team <span className={`bg-gradient-to-r ${
              isDeepSpace 
                ? 'from-cyan-400 to-blue-400' 
                : 'from-blue-400 to-green-400'
            } bg-clip-text text-transparent`}>
              MoonLight
            </span>
          </motion.h2>
          
          <motion.p 
            className={`text-xl max-w-3xl mx-auto ${
              isDeepSpace ? 'text-gray-300' : 'text-gray-300'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Our diverse team of passionate developers and designers working together 
            to revolutionize urban planning with cutting-edge technology.
          </motion.p>
        </motion.div>

        {/* Enhanced Team Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -15,
                scale: 1.02
              }}
            >
              <Card className={`group hover:shadow-2xl transition-all duration-300 border-0 h-full cursor-pointer relative overflow-hidden ${
                isDeepSpace 
                  ? 'deep-space-card hover:bg-cyan-500/5' 
                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
              }`}>
                {/* Hover gradient overlay */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    isDeepSpace 
                      ? 'from-cyan-500/10 to-blue-500/10' 
                      : 'from-blue-500/10 to-green-500/10'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                
                <CardContent className="p-8 text-center relative z-10">
                  {/* Avatar with animation */}
                  <motion.div 
                    className="mb-6 flex justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-all duration-300 ${
                      isDeepSpace 
                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500/30 group-hover:to-blue-500/30' 
                        : 'bg-gradient-to-br from-blue-500/20 to-green-500/20 group-hover:from-blue-500/30 group-hover:to-green-500/30'
                    }`}>
                      {member.avatar}
                    </div>
                  </motion.div>
                  
                  <motion.h3 
                    className={`text-2xl font-bold mb-2 group-hover:scale-105 transition-transform duration-200 ${
                      isDeepSpace ? 'text-white group-hover:text-cyan-100' : 'text-white group-hover:text-blue-100'
                    }`}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {member.name}
                  </motion.h3>
                  
                  <motion.p 
                    className={`mb-4 group-hover:scale-105 transition-transform duration-200 ${
                      isDeepSpace ? 'text-cyan-300 group-hover:text-cyan-200' : 'text-blue-300 group-hover:text-blue-200'
                    }`}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {member.role}
                  </motion.p>
                  
                  {/* Skills with stagger animation */}
                  <motion.div 
                    className="flex flex-wrap justify-center gap-2 mb-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    {member.skills.map((skill, skillIndex) => (
                      <motion.div
                        key={skillIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 + skillIndex * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Badge className={`transition-colors duration-200 ${
                          isDeepSpace 
                            ? 'bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30' 
                            : 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'
                        }`}>
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* Social links with enhanced animations */}
                  <motion.div 
                    className="flex justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    {[
                      { icon: Github, href: member.social.github, color: "hover:text-gray-300" },
                      { icon: Linkedin, href: member.social.linkedin, color: isDeepSpace ? "hover:text-cyan-400" : "hover:text-blue-400" },
                      { icon: Mail, href: `mailto:${member.social.email}`, color: isDeepSpace ? "hover:text-green-400" : "hover:text-green-400" }
                    ].map((social, socialIndex) => (
                      <motion.a
                        key={socialIndex}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${
                          isDeepSpace ? 'text-cyan-400/60' : 'text-gray-400'
                        } ${social.color} transition-all duration-200 p-2 rounded-full hover:bg-white/10`}
                        whileHover={{ 
                          scale: 1.2,
                          rotate: 5,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <social.icon className="w-5 h-5" />
                      </motion.a>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Stats Section */}
        <motion.div 
          className={`mt-16 text-center p-8 rounded-2xl ${
            isDeepSpace 
              ? 'deep-space-card' 
              : 'bg-white/5 backdrop-blur-sm'
          }`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Star className={`w-16 h-16 mx-auto ${
              isDeepSpace ? 'text-cyan-400' : 'text-blue-400'
            }`} />
          </motion.div>
          
          <h3 className={`text-2xl font-bold mb-4 ${
            isDeepSpace ? 'text-white' : 'text-white'
          }`}>
            Passionate About Innovation
          </h3>
          
          <p className={`text-lg max-w-4xl mx-auto leading-relaxed ${
            isDeepSpace ? 'text-gray-300' : 'text-gray-300'
          }`}>
            Our team combines expertise in AI, data science, urban planning, and software development 
            to create solutions that make a real difference in how cities are planned and managed.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
