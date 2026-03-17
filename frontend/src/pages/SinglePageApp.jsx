import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import StickyNavbar from '@/components/onepage/StickyNavbar'
import MobileQuickNav from '@/components/onepage/MobileQuickNav'
import HeroSection from '@/components/onepage/HeroSection'
import WorkflowSection from '@/components/onepage/WorkflowSection'
import AnalyticsSection from '@/components/onepage/AnalyticsSection'
import InspectSection from '@/components/onepage/InspectSection'
import HistorySection from '@/components/onepage/HistorySection'
import AlertsSection from '@/components/onepage/AlertsSection'
import SettingsSection from '@/components/onepage/SettingsSection'
import RevealSection from '@/components/onepage/RevealSection'
import { useAuthStore } from '@/store/auth'

const SECTION_IDS = ['home', 'workflow', 'dashboard', 'inspect', 'history', 'alerts', 'settings']

export default function SinglePageApp() {
  const [active, setActive] = useState('home')
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const observerOptions = useMemo(
    () => ({ root: null, rootMargin: '-40% 0px -45% 0px', threshold: 0 }),
    []
  )

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]?.target?.id) {
        setActive(visible[0].target.id)
      }
    }, observerOptions)

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [observerOptions])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020617_0%,#0f172a_55%,#0b1120_100%)]">
      <StickyNavbar
        activeSection={active}
        onNavigate={scrollTo}
        onLogout={() => {
          logout()
          navigate('/login')
        }}
      />

      <RevealSection delay={0}><HeroSection onStart={() => scrollTo('workflow')} /></RevealSection>
      <RevealSection delay={80}><WorkflowSection /></RevealSection>
      <RevealSection delay={120}><AnalyticsSection /></RevealSection>
      <RevealSection delay={160}><InspectSection /></RevealSection>
      <RevealSection delay={200}><HistorySection /></RevealSection>
      <RevealSection delay={240}><AlertsSection /></RevealSection>
      <RevealSection delay={280}><SettingsSection /></RevealSection>

      <MobileQuickNav activeSection={active} onNavigate={scrollTo} />
    </div>
  )
}
