"use client"

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Create a higher-order component that wraps framer-motion components for dynamic import
export function withDynamicMotion<T extends object>(
  Component: ComponentType<T>
): ComponentType<T> {
  return dynamic(() => Promise.resolve(Component), {
    ssr: false,
    loading: () => <div className="w-full h-full" />
  })
}

// Export motion components that are safe for SSR
export const motion = {
  div: dynamic(() => import('framer-motion').then(mod => mod.motion.div), {
    ssr: false,
    loading: () => <div />
  }),
  section: dynamic(() => import('framer-motion').then(mod => mod.motion.section), {
    ssr: false,
    loading: () => <section />
  }),
  header: dynamic(() => import('framer-motion').then(mod => mod.motion.header), {
    ssr: false,
    loading: () => <header />
  }),
  footer: dynamic(() => import('framer-motion').then(mod => mod.motion.footer), {
    ssr: false,
    loading: () => <footer />
  }),
  button: dynamic(() => import('framer-motion').then(mod => mod.motion.button), {
    ssr: false,
    loading: () => <button />
  }),
  h1: dynamic(() => import('framer-motion').then(mod => mod.motion.h1), {
    ssr: false,
    loading: () => <h1 />
  }),
  h2: dynamic(() => import('framer-motion').then(mod => mod.motion.h2), {
    ssr: false,
    loading: () => <h2 />
  }),
  h3: dynamic(() => import('framer-motion').then(mod => mod.motion.h3), {
    ssr: false,
    loading: () => <h3 />
  }),
  p: dynamic(() => import('framer-motion').then(mod => mod.motion.p), {
    ssr: false,
    loading: () => <p />
  }),
  span: dynamic(() => import('framer-motion').then(mod => mod.motion.span), {
    ssr: false,
    loading: () => <span />
  }),
  li: dynamic(() => import('framer-motion').then(mod => mod.motion.li), {
    ssr: false,
    loading: () => <li />
  }),
  ul: dynamic(() => import('framer-motion').then(mod => mod.motion.ul), {
    ssr: false,
    loading: () => <ul />
  }),
  nav: dynamic(() => import('framer-motion').then(mod => mod.motion.nav), {
    ssr: false,
    loading: () => <nav />
  }),
  img: dynamic(() => import('framer-motion').then(mod => mod.motion.img), {
    ssr: false,
    loading: () => <img />
  }),
  form: dynamic(() => import('framer-motion').then(mod => mod.motion.form), {
    ssr: false,
    loading: () => <form />
  }),
}

export const useInView = dynamic(() => import('framer-motion').then(mod => mod.useInView), {
  ssr: false,
})
