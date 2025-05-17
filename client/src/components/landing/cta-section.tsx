'use client'

import { ArrowRight, CheckCircle } from 'lucide-react'
import { Link } from 'wouter'
import { useEffect } from "react";

export function CTASection() {
  const openCalendly = () => {
    // Replace this with your actual Calendly URL
    const calendlyURL = "https://calendly.com/caspianodhis";
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: calendlyURL,
        prefill: {},
        text: 'Schedule time with me',
        color: '#0069ff',
        textColor: '#ffffff',
      });
    }
  };

  useEffect(() => {
    const head = document.querySelector('head');
    if (!head) return;

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    head.appendChild(script);

    return () => {
      head.removeChild(script);
    };
  }, []);

  const benefits = [
    'Free 14-day trial with all features',
    'No credit card required',
    'Dedicated support team',
    'Easy setup and onboarding',
    'Regular updates and improvements',
    'Secure and reliable platform'
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          
          <div className="relative">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already using our ERP to streamline operations
                and drive growth. Start your free trial today!
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <Link href="https://forms.gle/nHs8eDTv5D727yfq5">
                  <a className="inline-flex items-center px-8 py-3 rounded-lg bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Link>
                <Link href="/book">
                  <a className="inline-flex items-center px-8 py-3 rounded-lg bg-blue-700 text-white font-medium hover:bg-blue-600 transition-colors">
                    Schedule a Demo
                  </a>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center text-blue-100">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { label: 'Active Users', value: '10,000+' },
                  { label: 'Countries', value: '50+' },
                  { label: 'Transactions', value: '$500M+' },
                  { label: 'Customer Satisfaction', value: '98%' }
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-blue-100">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 