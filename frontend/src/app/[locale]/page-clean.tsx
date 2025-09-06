'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  MapPinIcon,
  TrendingUpIcon,
  BoltIcon,
  StarIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  ChartPieIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTranslation } from '@/shared/hooks/use-translation';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const scaleOnHover = {
  scale: 1.05,
  transition: { duration: 0.3 }
};

interface Feature {
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
  color: string;
  bgColor: string;
}

interface Stat {
  numberKey: string;
  labelKey: string;
  iconColor: string;
}

interface Testimonial {
  nameKey: string;
  roleKey: string;
  contentKey: string;
  rating: number;
  avatar: string;
}

const features: Feature[] = [
  {
    icon: ChartBarIcon,
    titleKey: 'features.analytics.title',
    descKey: 'features.analytics.desc',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    icon: MapPinIcon,
    titleKey: 'features.location.title',
    descKey: 'features.location.desc',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    icon: CpuChipIcon,
    titleKey: 'features.ai.title',
    descKey: 'features.ai.desc',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    icon: TrendingUpIcon,
    titleKey: 'features.growth.title',
    descKey: 'features.growth.desc',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    icon: ShieldCheckIcon,
    titleKey: 'features.security.title',
    descKey: 'features.security.desc',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    icon: GlobeAltIcon,
    titleKey: 'features.global.title',
    descKey: 'features.global.desc',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

const stats: Stat[] = [
  {
    numberKey: 'stats.restaurants.number',
    labelKey: 'stats.restaurants.label',
    iconColor: 'text-blue-600'
  },
  {
    numberKey: 'stats.accuracy.number',
    labelKey: 'stats.accuracy.label',
    iconColor: 'text-green-600'
  },
  {
    numberKey: 'stats.growth.number',
    labelKey: 'stats.growth.label',
    iconColor: 'text-purple-600'
  },
  {
    numberKey: 'stats.satisfaction.number',
    labelKey: 'stats.satisfaction.label',
    iconColor: 'text-orange-600'
  }
];

const testimonials: Testimonial[] = [
  {
    nameKey: 'testimonials.sarah.name',
    roleKey: 'testimonials.sarah.role',
    contentKey: 'testimonials.sarah.content',
    rating: 5,
    avatar: '/avatars/sarah.jpg'
  },
  {
    nameKey: 'testimonials.michael.name',
    roleKey: 'testimonials.michael.role',
    contentKey: 'testimonials.michael.content',
    rating: 5,
    avatar: '/avatars/michael.jpg'
  },
  {
    nameKey: 'testimonials.priya.name',
    roleKey: 'testimonials.priya.role',
    contentKey: 'testimonials.priya.content',
    rating: 5,
    avatar: '/avatars/priya.jpg'
  }
];

export default function HomePage({ params }: { params: { locale: string } }) {
  const { t } = useTranslation(params.locale);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerContainer}
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200/50 mb-8">
              <BoltIcon className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {t('hero.badge')}
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                {t('hero.title.part1')}
              </span>
              <br />
              <span className="text-gray-800">
                {t('hero.title.part2')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-xl lg:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div whileHover={scaleOnHover}>
                <Link href={`/${params.locale}/dashboard`} className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  {t('hero.cta.primary')}
                  <ArrowUpRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>

              <motion.div whileHover={scaleOnHover}>
                <button className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                  <PlayIcon className="mr-2 h-5 w-5" />
                  {t('hero.cta.secondary')}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <motion.div
                  whileHover={scaleOnHover}
                  className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-4"
                >
                  <ChartPieIcon className={`h-6 w-6 text-white`} />
                </motion.div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {t(stat.numberKey)}
                </div>
                <div className="text-gray-600">
                  {t(stat.labelKey)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('features.title')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={scaleOnHover}
                className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.bgColor} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(feature.descKey)}
                </p>
                <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:text-purple-600 transition-colors duration-300">
                  {t('common.learnMore')}
                  <ChevronRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('testimonials.title')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('testimonials.subtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={scaleOnHover}
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {t(testimonial.nameKey).charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{t(testimonial.nameKey)}</h4>
                    <p className="text-gray-600 text-sm">{t(testimonial.roleKey)}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {t(testimonial.contentKey)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl lg:text-5xl font-bold text-white mb-6">
              {t('cta.title')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              {t('cta.subtitle')}
            </motion.p>

            <motion.div variants={fadeInUp}>
              <motion.div whileHover={scaleOnHover}>
                <Link href={`/${params.locale}/dashboard`} className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl">
                  {t('cta.button')}
                  <ArrowUpRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
