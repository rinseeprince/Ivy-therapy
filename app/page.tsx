'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { Brain, MessageCircle, TrendingUp, Shield, Sparkles, Heart, Lock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { DeviceFrame } from '@/components/DeviceFrame'
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider'

function HeroSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 0.2], [0, -20])

  return (
    <section ref={ref} className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-peach-100">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 220, 200, 0.6), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/80 text-maroon-900 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Introducing MindfulAI
            </motion.div>

            <h1 className="mb-6 text-maroon-900">
              Therapy that&apos;s there when you need it
            </h1>

            <p className="text-lg md:text-xl text-maroon-900/70 mb-8 leading-relaxed max-w-lg">
              While you&apos;re struggling, MindfulAI is listening. Talk naturally, get support instantly, and build lasting mental wellness.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-maroon-900 text-sand-50 hover:bg-maroon-900/90 px-8 h-12 text-base font-medium transition-all hover:scale-105"
              >
                <Link href="/session/new">Start a session</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            style={{ y }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="relative flex justify-center md:justify-end"
          >
            <div
              className="absolute inset-0 blur-3xl opacity-30 -z-10"
              style={{
                background: 'radial-gradient(circle, rgba(255, 200, 170, 0.6) 0%, transparent 70%)',
              }}
            />

            <DeviceFrame>
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src="/hero-loop.webm"
                poster="/hero-screen.png"
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-br from-sand-100 via-sand-200 to-sand-50 flex items-center justify-center">
                <div className="text-center p-8">
                  <Brain className="w-16 h-16 text-maroon-900/20 mx-auto mb-4" />
                  <p className="text-maroon-900/40 text-sm">Video placeholder</p>
                </div>
              </div>
            </DeviceFrame>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FeaturesGridSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-20 md:py-32 bg-lavender-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 text-maroon-900">
            The support that fits in your pocket
          </h2>
          <p className="text-lg md:text-xl text-maroon-900/70 max-w-2xl mx-auto">
            Professional-grade therapy tools designed to work with your life, not against it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Natural Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border-maroon-900/10 hover:shadow-soft transition-all hover:-translate-y-1 group">
              <MessageCircle className="w-10 h-10 text-maroon-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="mb-3 text-xl font-semibold text-maroon-900">
                Natural Conversations
              </h3>
              <p className="text-maroon-900/70 leading-relaxed">
                Speak naturally with our AI therapist. No scripts, no awkwardness—just real, empathetic dialogue.
              </p>
            </Card>
          </motion.div>

          {/* Contextual Memory */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border-maroon-900/10 hover:shadow-soft transition-all hover:-translate-y-1 group">
              <Brain className="w-10 h-10 text-maroon-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="mb-3 text-xl font-semibold text-maroon-900">
                Contextual Memory
              </h3>
              <p className="text-maroon-900/70 leading-relaxed">
                Your AI therapist remembers what you&apos;ve shared, building deeper understanding with every session.
              </p>
            </Card>
          </motion.div>

          {/* Track Progress */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border-maroon-900/10 hover:shadow-soft transition-all hover:-translate-y-1 group">
              <TrendingUp className="w-10 h-10 text-maroon-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="mb-3 text-xl font-semibold text-maroon-900">
                Track Progress
              </h3>
              <p className="text-maroon-900/70 leading-relaxed">
                See your growth with detailed summaries and actionable insights after every conversation.
              </p>
            </Card>
          </motion.div>

          {/* Private & Secure */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border-maroon-900/10 hover:shadow-soft transition-all hover:-translate-y-1 group">
              <Shield className="w-10 h-10 text-maroon-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="mb-3 text-xl font-semibold text-maroon-900">
                Private &amp; Secure
              </h3>
              <p className="text-maroon-900/70 leading-relaxed">
                Your conversations are end-to-end encrypted. What you share stays between you and your AI therapist.
              </p>
            </Card>
          </motion.div>

          {/* Always Available */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border-maroon-900/10 hover:shadow-soft transition-all hover:-translate-y-1 group">
              <Heart className="w-10 h-10 text-maroon-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="mb-3 text-xl font-semibold text-maroon-900">
                Always Available
              </h3>
              <p className="text-maroon-900/70 leading-relaxed">
                3am anxiety? Lunchbreak stress? Your AI therapist is ready whenever you need to talk.
              </p>
            </Card>
          </motion.div>

          {/* Professional Standards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border-maroon-900/10 hover:shadow-soft transition-all hover:-translate-y-1 group">
              <Lock className="w-10 h-10 text-maroon-900 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="mb-3 text-xl font-semibold text-maroon-900">
                Professional Standards
              </h3>
              <p className="text-maroon-900/70 leading-relaxed">
                Built on evidence-based CBT, DBT, and mindfulness techniques used by licensed therapists.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ConversationSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-20 md:py-32 bg-teal-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Image with floating card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Placeholder for lifestyle image */}
            <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-teal-200 to-teal-100 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <MessageCircle className="w-24 h-24 text-teal-500/20" />
              </div>

              {/* Floating message card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute top-8 left-8 right-8 bg-white rounded-2xl p-6 shadow-xl"
              >
                <p className="text-sm text-maroon-900/60 mb-2">Here for it</p>
                <p className="text-maroon-900 font-medium mb-3">
                  Can we talk through what happened today?
                </p>
                <div className="inline-block bg-maroon-900 text-white px-4 py-2 rounded-full text-sm">
                  Let&apos;s talk
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="mb-6 text-maroon-900">
              Therapy talks. MindfulAI talks back.
            </h2>
            <p className="text-lg md:text-xl text-maroon-900/70 mb-6 leading-relaxed">
              No more one-sided journaling. Have real, back-and-forth conversations with an AI that understands context, remembers what matters, and responds with genuine empathy.
            </p>
            <p className="text-base md:text-lg text-maroon-900/60 leading-relaxed">
              Powered by advanced natural language processing, your AI therapist picks up on nuance, validates your feelings, and helps you work through whatever&apos;s on your mind.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ProgressSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-20 md:py-32 bg-cream-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7 }}
            className="order-2 md:order-1"
          >
            <h2 className="mb-6 text-maroon-900">
              Leave the guesswork to us
            </h2>
            <p className="text-lg md:text-xl text-maroon-900/70 mb-6 leading-relaxed">
              MindfulAI works nonstop—identifying patterns, tracking your emotional trends, and suggesting next steps you can actually use.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-maroon-900/70">
                  Get session summaries that highlight your progress and breakthrough moments
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-maroon-900/70">
                  Track mood patterns over time with beautiful, insightful charts
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-maroon-900/70">
                  Receive personalized coping strategies based on what works for you
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Image with floating progress card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7 }}
            className="relative order-1 md:order-2"
          >
            <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-cream-200 to-cream-100 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <TrendingUp className="w-24 h-24 text-maroon-900/10" />
              </div>

              {/* Floating progress card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute bottom-8 left-8 right-8 bg-white rounded-2xl p-6 shadow-xl"
              >
                <p className="text-sm text-maroon-900/60 mb-3">Your progress</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-maroon-900/60">Anxiety management</span>
                      <span className="text-xs font-semibold text-teal-600">+32%</span>
                    </div>
                    <div className="h-2 bg-maroon-900/5 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-3/4 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-maroon-900/60">Mindfulness practice</span>
                      <span className="text-xs font-semibold text-teal-600">+58%</span>
                    </div>
                    <div className="h-2 bg-maroon-900/5 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-4/5 rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function SecuritySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-20 md:py-32 bg-peach-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-peach-300 to-peach-100 overflow-hidden flex items-center justify-center">
              <Shield className="w-32 h-32 text-maroon-900/10" />
            </div>
          </motion.div>

          {/* Right: Copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="mb-6 text-maroon-900">
              AI that&apos;s anything but careless
            </h2>
            <p className="text-lg md:text-xl text-maroon-900/70 mb-6 leading-relaxed">
              Your mental health deserves the highest level of protection. That&apos;s why we use bank-level encryption and follow strict privacy standards.
            </p>
            <p className="text-base md:text-lg text-maroon-900/60 leading-relaxed">
              We never sell your data, never share your conversations, and never use your sessions for training. Your privacy is non-negotiable.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function MissionSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-20 md:py-32 bg-maroon-900 text-sand-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="mb-6 text-sand-50">
              MindfulAI works for you<br />
              (not the other way around)
            </h2>
            <p className="text-lg md:text-xl text-sand-100/70 leading-relaxed">
              In other words, therapy that&apos;s in your pocket, not out of reach—always working toward better mental health, starting right now.
            </p>
          </motion.div>

          {/* Right: Image grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="aspect-square rounded-2xl bg-peach-200 overflow-hidden flex items-center justify-center">
              <Brain className="w-16 h-16 text-maroon-900/20" />
            </div>
            <div className="aspect-square rounded-2xl bg-teal-200 overflow-hidden flex items-center justify-center">
              <Heart className="w-16 h-16 text-maroon-900/20" />
            </div>
            <div className="aspect-square rounded-2xl bg-lavender-200 overflow-hidden flex items-center justify-center">
              <MessageCircle className="w-16 h-16 text-maroon-900/20" />
            </div>
            <div className="aspect-square rounded-2xl bg-cream-200 overflow-hidden flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-maroon-900/20" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  return (
    <section ref={ref} className="py-24 md:py-40 bg-gradient-to-br from-peach-50 to-cream-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="mb-8 text-maroon-900">
            Try MindfulAI for free
          </h2>
          <p className="text-lg md:text-xl text-maroon-900/70 mb-10 max-w-2xl mx-auto">
            Getting started takes less than 2 minutes
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full bg-maroon-900 text-sand-50 hover:bg-maroon-900/90 px-12 h-14 text-lg font-medium transition-all hover:scale-105"
          >
            <Link href="/session/new">Get started</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <FeaturesGridSection />
          <ConversationSection />
          <ProgressSection />
          <SecuritySection />
          <MissionSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  )
}
