'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Plus,
  BarChart3,
  MapPin,
  Calendar,
  User
} from "lucide-react"

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const reports = [
    {
      id: 'air-quality-analysis',
      name: 'Air Quality Analysis Report',
      description: 'Comprehensive analysis of air quality trends and recommendations',
      type: 'Environmental',
      date: '2024-01-15',
      author: 'AI Assistant',
      status: 'Completed',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      id: 'urban-heat-assessment',
      name: 'Urban Heat Island Assessment',
      description: 'Detailed evaluation of heat island effects and mitigation strategies',
      type: 'Climate',
      date: '2024-01-12',
      author: 'Dr. Sarah Chen',
      status: 'Draft',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      id: 'population-growth',
      name: 'Population Growth Impact Study',
      description: 'Analysis of demographic changes and infrastructure needs',
      type: 'Demographics',
      date: '2024-01-10',
      author: 'Planning Team',
      status: 'In Review',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      id: 'climate-resilience',
      name: 'Climate Resilience Plan',
      description: 'Strategic plan for climate adaptation and resilience measures',
      type: 'Strategic',
      date: '2024-01-08',
      author: 'AI Assistant',
      status: 'Completed',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-400 bg-green-500/20'
      case 'Draft': return 'text-yellow-400 bg-yellow-500/20'
      case 'In Review': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Presentations</h1>
          <p className="text-gray-300">
            Generate, manage, and share comprehensive urban planning reports
          </p>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
                <div className="flex gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Report
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  selectedReport === report.id
                    ? `${report.bgColor} border-2 border-blue-500/50`
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-6 h-6 ${report.color}`} />
                      <div>
                        <h3 className="font-semibold text-white">{report.name}</h3>
                        <p className="text-sm text-gray-400">{report.type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-4">{report.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {report.author}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Report Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Report Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-white font-medium mb-1">Environmental Analysis</h3>
                  <p className="text-gray-400 text-sm">Air quality, temperature, vegetation</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <MapPin className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-white font-medium mb-1">Spatial Analysis</h3>
                  <p className="text-gray-400 text-sm">Geographic data and mapping</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-white font-medium mb-1">Trend Analysis</h3>
                  <p className="text-gray-400 text-sm">Time series and forecasting</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <User className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <h3 className="text-white font-medium mb-1">Stakeholder Report</h3>
                  <p className="text-gray-400 text-sm">Public engagement and communication</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Advanced Reporting Features</h3>
              <p className="text-gray-300 mb-4">
                Coming soon: AI-powered report generation, interactive presentations, and automated stakeholder notifications
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Notified
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
