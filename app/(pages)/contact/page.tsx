'use client'

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import Services from "@/components/services";



const GetInTouch = () => {
  const [hasAnimated, setHasAnimated] = useState(false);

  const router = useRouter()

  useEffect(() => {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    if (navigation?.type === "reload" || navigation?.type === "navigate") {
      setHasAnimated(false);
    } else {
      setHasAnimated(true);
    }
  }, []);

  const headerVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: [0.25, 0.1, 0, 1],
      },
    },
  };

  const contentVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.9,
        ease: [0.25, 0.1, 0, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const buttonContainerVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4,
      },
    },
  };

  const buttonVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0, 1],
      },
    },
  };

  const contactButtons = [
    {
      text: "Contact Us",
      href: "mailto:info@furnz.in",
      icon: <Mail className="w-5 h-5" />,
      style: "text-white hover:shadow-lg",
      bgColor: "#5D4E37",
      hoverBgColor: "#8B6F47",
      primary: true
    },
    {
      text: "Chat on WhatsApp",
      href: "https://wa.me/+919731055295",
      icon: <MessageCircle className="w-5 h-5" />,
      style: "text-white hover:shadow-lg",
      bgColor: "#8B6F47",
      hoverBgColor: "#C9A882",
      primary: false
    },
    {
      text: "Call Now",
      href: "tel:+919731055295",
      icon: <Phone className="w-5 h-5" />,
      style: "border-2 hover:text-white hover:shadow-lg",
      bgColor: "transparent",
      hoverBgColor: "#5D4E37",
      borderColor: "#5D4E37",
      textColor: "#5D4E37",
      primary: false
    }
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto px-4 pt-10 pb-20">
        {/* Header Section */}
        <motion.div
          className="text-center mt-24 mb-12"
          initial={hasAnimated ? "visible" : "hidden"}
          animate="visible"
          variants={headerVariants}
        > 
          <motion.h1
            variants={headerVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
            style={{ color: "#5D4E37" }}
          >
            Let&apos;s Build Your Dream Space Together
          </motion.h1>
        </motion.div>

        {/* Content Section */}
        <motion.div
          className="text-center mb-12"
          initial={hasAnimated ? "visible" : "hidden"}
          animate="visible"
          variants={contentVariants}
        >
          <motion.p
            variants={contentVariants}
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "#8B6F47" }}
          >
            Got a space in mind? We&apos;d love to hear from you. Let&apos;s talk about ideas, 
            inspirations, and your perfect interior.
          </motion.p>
        </motion.div>

        {/* Contact Buttons */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center"
          initial={hasAnimated ? "visible" : "hidden"}
          animate="visible"
          variants={buttonContainerVariants}
        >
          {contactButtons.map((button, index) => (
            <motion.div
              key={index}
              variants={buttonVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
            >
              <Link
                href={button.href}
                target={button.href.startsWith('http') || button.href.startsWith('tel:') ? '_blank' : '_self'}
                rel={button.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`${button.style} px-6 md:px-8 py-3 md:py-4 rounded-full text-lg font-medium transition-all duration-300 inline-flex items-center gap-3 min-w-[200px] justify-center group`}
                style={{
                  backgroundColor: button.bgColor,
                  borderColor: button.borderColor,
                  color: button.textColor || undefined
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.backgroundColor = button.hoverBgColor;
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement;
                  target.style.backgroundColor = button.bgColor;
                }}
              >
                <span className="group-hover:scale-110 transition-transform duration-200">
                  {button.icon}
                </span>
                <span>{button.text}</span>
                {button.primary && (
                  <svg 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 8l4 4m0 0l-4 4m4-4H3" 
                    />
                  </svg>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <Services />

        {/* Additional Info */}
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
    </div>
  );
};

export default GetInTouch;