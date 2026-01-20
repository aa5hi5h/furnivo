"use client"
import {motion, Variants} from "framer-motion"
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";


const CtaDirection = () => {

    const hasAnimated = true; // or use state if you want to trigger animations

    const headerVariants : Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: "easeOut"
        }
      }
    };

    return (
        <motion.div
        className="bg-gradient-to-r from-[#C47456] to-[#B86545] py-20"
        initial={hasAnimated ? "visible" : "hidden"}
        animate="visible"
        variants={headerVariants}
      >
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.p 
            variants={headerVariants}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to Transform Your Space?
          </motion.p>
          <motion.p
            variants={headerVariants}
             className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
          >
           Let&apos;s discuss your vision and create something extraordinary together. 
           Book your free consultation today.
          </motion.p>
      
          <motion.div
            variants={headerVariants}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 text-left max-w-2xl mx-auto border border-white/20"
          >
            <div className="flex items-start gap-4 mb-6">
              <MapPin className="w-6 h-6 text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Nelamangala</h3>
                <p className="text-white/90 mb-4 text-lg">
                  23/4, Behind Udayavani Press, K.Kempalinganahalli<br />
                  Nelamangala Town, Karnataka - 562123
                </p>
                <Link 
                  href="https://maps.google.com/?q=23/4+Behind+Udayavani+Press+K.Kempalinganahalli+Nelamangala+Town+Karnataka+562123"
                  target="_blank"
                  className="bg-white text-[#C47456] px-6 py-3 rounded-full font-medium hover:shadow-lg hover:bg-gray-100 inline-flex items-center gap-2 transition-all"
                >
                  GET DIRECTIONS
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
}

export default CtaDirection