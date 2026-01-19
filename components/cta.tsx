'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Faq = () => {

  const router = useRouter()

  return (
    <div className="mx-auto 2xl:w-4/5 md:px-16 px-6 py-16 pb-32" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm border text-center" style={{borderColor: '#C9A882'}}>
  <h3 className="text-2xl font-bold mb-4" style={{color: '#5D4E37'}}>
    Let&apos;s Build Your Dream Space Together
  </h3>
  <p className="mb-6" style={{color: '#7A6A4F'}}>
    Got a space in mind? We&apos;d love to hear from you. Let&apos;s talk about ideas, inspirations, and your perfect interior.
  </p>
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <button onClick={()=> { router.push("/contact") } } className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-white" 
            style={{backgroundColor: '#5D4E37'}}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = '#8B6F47';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = '#5D4E37';
            }}>
      Contact Us
    </button>
    <a href="tel:+919731055295"  className="border-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            style={{
              borderColor: '#C9A882',
              color: '#5D4E37'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = '#8B6F47';
              target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'transparent';
              target.style.color = '#5D4E37';
            }}>
      Call Us: +91 97310 55295
    </a>
  </div>
</div>
      </div>
    </div>
  );
};

export default Faq;