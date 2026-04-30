'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: '🎭',
    title: 'Remove Objects',
    description: 'Erase people, objects, or anything — AI fills background naturally',
    time: '~25s',
  },
  {
    icon: '🖼️',
    title: 'Style Transfer',
    description: 'Turn any photo into anime, cyberpunk, oil painting, and more',
    time: '~35s',
  },
  {
    icon: '👤',
    title: 'Face Restoration',
    description: 'Sharpen and enhance faces with GFPGAN deep learning',
    time: '~15s',
  },
  {
    icon: '🔍',
    title: 'Image Upscale',
    description: 'Increase resolution 2× or 4× with Real-ESRGAN super-resolution',
    time: '~12s',
  },
  {
    icon: '✂️',
    title: 'Remove Background',
    description: 'Clean background removal, transparent PNG output',
    time: '~5s',
  },
  {
    icon: '🎨',
    title: 'Color Enhance',
    description: 'Fine-tune brightness, contrast, saturation and temperature',
    time: '<2s',
  },
];

const steps = [
  {
    num: '01',
    title: 'Upload Your Image',
    description: 'Drag & drop or click to upload any JPEG, PNG or WebP image up to 10 MB',
    icon: '📤',
  },
  {
    num: '02',
    title: 'Choose an Operation',
    description: 'Select from 7 AI-powered editing tools. Configure settings in the panel',
    icon: '⚙️',
  },
  {
    num: '03',
    title: 'Download Result',
    description: 'Your AI-edited image is ready in under 90 seconds. Download in one click',
    icon: '⬇️',
  },
];

const techStack = ['Stable Diffusion 1.5', 'LaMa Inpainting', 'Real-ESRGAN', 'GFPGAN', 'FastAPI', 'Google Colab T4'];

export function HomePage() {
  const featuresRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-screen flex flex-col">
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-36 pb-28 overflow-hidden"
        style={{ background: 'var(--gradient-hero)', backgroundSize: '300% 300%', animation: 'hero-gradient 8s ease infinite' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full text-xs font-medium border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
            Powered by Open-Source AI Models — Completely Free
          </div>

          <h1
            className="text-4xl sm:text-5xl font-extrabold leading-normal mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Edit Any Image With{' '}
            <span className="gradient-text">AI</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Remove people, transfer styles, enhance faces, upscale resolution — all powered by open-source models running on Google Colab. Free, unrestricted, and ready in under 90 seconds.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/editor">
              <Button variant="gradient" size="lg" icon={<span>✨</span>}>
                Start Editing Free
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              See Features
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 mt-16 flex gap-3 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {['No signup needed', '100% free GPU', 'Open-source models', '7 AI operations'].map((badge) => (
            <span
              key={badge}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]"
            >
              ✓ {badge}
            </span>
          ))}
        </motion.div>
      </section>

      <section ref={featuresRef} className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            7 Powerful AI Editing Tools
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Every operation runs on free Google Colab GPUs using state-of-the-art open-source models
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              className="card p-6 flex flex-col gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{feat.icon}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)]">
                  {feat.time}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1">{feat.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{feat.description}</p>
              </div>
              <Link href="/editor">
                <Button variant="ghost" size="sm" fullWidth>
                  Try it →
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              How It Works
            </h2>
            <p className="text-[var(--text-secondary)]">
              Start editing in 3 simple steps — no installation, no accounts
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex flex-col items-center text-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                viewport={{ once: true }}
              >
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-[var(--radius-lg)] flex items-center justify-center text-2xl"
                    style={{ background: 'var(--gradient-accent)', boxShadow: 'var(--shadow-glow)' }}
                  >
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--accent-blue)]">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{step.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Link href="/editor">
              <Button variant="gradient" size="lg" icon={<span>🚀</span>}>
                Launch Editor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center">
        <p className="text-sm text-[var(--text-muted)] mb-4">Powered by</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-full text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
