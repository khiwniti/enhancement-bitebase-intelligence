'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Heart,
  Shield,
  Award,
  Globe
} from 'lucide-react'
import BiteBaseLogo from '@/components/BiteBaseLogo'

interface FooterSection {
  title: string
  links: {
    name: string
    href: string
    external?: boolean
  }[]
}

const footerSections: FooterSection[] = [
  {
    title: 'Platform',
    links: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'AI Intelligence', href: '/ai-center' },
      { name: 'Analytics', href: '/analytics-center' },
      { name: 'Location Intelligence', href: '/location-center' },
      { name: 'Operations', href: '/operations-center' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/help' },
      { name: 'API Reference', href: '/docs/api', external: true },
      { name: 'Tutorials', href: '/help/tutorials' },
      { name: 'Best Practices', href: '/help/best-practices' },
      { name: 'Community', href: 'https://community.bitebase.ai', external: true }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Partners', href: '/partners' },
      { name: 'Contact', href: '/contact' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Data Processing', href: '/data-processing' },
      { name: 'Security', href: '/security' }
    ]
  }
]

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/bitebaseai' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/bitebaseai' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/bitebaseai' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/bitebaseai' }
]

const contactInfo = [
  { icon: Mail, text: 'hello@bitebase.ai', href: 'mailto:hello@bitebase.ai' },
  { icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
  { icon: MapPin, text: 'San Francisco, CA', href: 'https://maps.google.com/?q=San+Francisco,+CA' }
]

const certifications = [
  { icon: Shield, text: 'SOC 2 Type II' },
  { icon: Award, text: 'ISO 27001' },
  { icon: Globe, text: 'GDPR Compliant' }
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="text-white">
                <BiteBaseLogo />
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              AI-powered business intelligence platform helping restaurants optimize operations, 
              boost profits, and delight customers with data-driven insights.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              {contactInfo.map((contact, index) => (
                <motion.a
                  key={index}
                  href={contact.href}
                  className="flex items-center space-x-3 text-gray-400 hover:text-orange-400 transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <contact.icon className="h-4 w-4" />
                  <span className="text-sm">{contact.text}</span>
                </motion.a>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-400 hover:bg-gray-700 transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center"
                    >
                      <span>{link.name}</span>
                      {link.external && <ExternalLink className="h-3 w-3 ml-1" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400 text-sm">
                Get the latest insights, updates, and tips delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-6">
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-2 text-gray-400">
                  <cert.icon className="h-4 w-4" />
                  <span className="text-xs">{cert.text}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 text-gray-400 text-xs">
              <span>Available in 50+ countries</span>
              <Separator orientation="vertical" className="h-4" />
              <span>99.9% uptime SLA</span>
              <Separator orientation="vertical" className="h-4" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>© 2024 BiteBase Intelligence. All rights reserved.</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>Made for restaurants worldwide</span>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <span>Status: All systems operational</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}