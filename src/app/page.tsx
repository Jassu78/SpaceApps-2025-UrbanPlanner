'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutProject } from '@/components/sections/AboutProject'
import { TeamSection } from '@/components/sections/TeamSection'
import { TechnologyStack } from '@/components/sections/TechnologyStack'
import { DemoSection } from '@/components/sections/DemoSection'
import { Footer } from '@/components/sections/Footer'

export default function Home() {
  const [isDeepSpace, setIsDeepSpace] = useState(false)

  const handleThemeChange = (newTheme: boolean) => {
    setIsDeepSpace(newTheme)
  }

  return (
    <main className={`min-h-screen transition-all duration-1000 ${
      isDeepSpace ? 'deep-space-scrollbar' : ''
    }`} style={{
      background: isDeepSpace 
        ? 'linear-gradient(135deg, #000000 0%, #0A0E27 25%, #1A1F3A 50%, #2D1B69 75%, #000000 100%)'
        : 'linear-gradient(135deg, #1e293b 0%, #1e40af 25%, #1e293b 50%, #1e40af 75%, #1e293b 100%)'
    }}>
      <Navbar isDeepSpace={isDeepSpace} onThemeChange={handleThemeChange} />
      <HeroSection isDeepSpace={isDeepSpace} />
      <AboutProject isDeepSpace={isDeepSpace} />
      <TeamSection isDeepSpace={isDeepSpace} />
      <TechnologyStack isDeepSpace={isDeepSpace} />
      <DemoSection isDeepSpace={isDeepSpace} />
      <Footer isDeepSpace={isDeepSpace} />
    </main>
  )
}