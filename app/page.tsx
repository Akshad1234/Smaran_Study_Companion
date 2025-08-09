"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Play, Upload, Headphones, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [isLogoAnimated, setIsLogoAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLogoAnimated(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <SmaranLogo animated={isLogoAnimated} />
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/auth">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/auth">
            <Button className="bg-indigo-600 hover:bg-indigo-700">Try Smaran Free</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Turn notes into <span className="text-indigo-600">short study podcasts</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Upload your study materials and let Smaran transform them into bite-sized, exam-focused audio content.
              Study smarter, not harder.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/auth">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-4">
                Try Smaran Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-transparent">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid md:grid-cols-3 gap-8 mt-20"
          >
            <FeatureCard
              icon={<Upload className="h-8 w-8 text-indigo-600" />}
              title="Upload Anything"
              description="Photos, PDFs, DOCs, past-year questions - we handle it all with advanced OCR and parsing."
            />
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-emerald-500" />}
              title="AI-Powered Summaries"
              description="Smart extraction of exam-relevant content, ranked by importance and transformed into clear scripts."
            />
            <FeatureCard
              icon={<Headphones className="h-8 w-8 text-indigo-600" />}
              title="Podcast Experience"
              description="High-quality audio with timeline segments, bookmarks, and speed control for optimal learning."
            />
          </motion.div>
        </div>
      </main>
    </div>
  )
}

function SmaranLogo({ animated }: { animated: boolean }) {
  return (
    <div className="flex items-center space-x-3">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
        className="relative"
      >
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <AnimatePresence>
          {animated && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <span className="text-2xl font-bold text-slate-900">Smaran</span>
      </motion.div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </Card>
  )
}
