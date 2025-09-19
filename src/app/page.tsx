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
    }`}>
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