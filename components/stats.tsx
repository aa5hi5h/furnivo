'use client'

import React from "react";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils"; 

interface StatCardProps {
  number: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ number, label }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const formatNumber = (num: string): string => {
    if (num.includes("%")) {
      return num;
    }
    if (num.includes("₹")) {
      return num;
    }
    if (num.includes("Sq")) {
      return num;
    }
    if (num.includes("★")) {
      return num;
    }
    const numValue = parseFloat(num.replace(/[^0-9.]/g, ""));
    return `${isNaN(numValue) ? num : num.replace(/[^0-9]/g, "")}+`; 
  };

  const isSquareFootageCard = number.includes("Sq");

  return (
    <div 
      ref={cardRef} 
      className="bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition-all duration-300"
      style={{ borderWidth: '1px', borderColor: '#C9A882' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#8B6F47';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#C9A882';
      }}
    >
      <div className="h-14">
        <div
          className={cn(
            "font-bold mb-2 transform transition-all duration-700",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            isSquareFootageCard ? "text-4xl md:text-5xl" : "text-5xl"
          )}
          style={{ color: '#5D4E37' }}
        >
          {formatNumber(number)}
        </div>
      </div>
      <div
        className={`text-sm md:text-sm leading-relaxed transform transition-all duration-700 delay-200 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ color: '#7A6A4F' }}
      >
        {label}
      </div>
    </div>
  );
};

const Stats: React.FC = () => {
  const stats = [
    { number: "200", label: "Happy Families with Dream Homes Across Bengaluru" },
    { number: "15,000 Sq Ft", label: "Average Space Transformed Every Month" }, 
    { number: "4.5★", label: "Average Rating from Our Satisfied Customers" },
  ];

  return (
    <div
      className="mx-auto
        2xl:w-4/5 md:px-16
               px-6 py-16"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      <Separator className="my-8" style={{ backgroundColor: '#C9A882' }} />

      <div className="flex flex-col md:flex-row items-start justify-between">
        <div className="md:w-1/3 mb-8 md:mb-0 pr-8">
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#5D4E37' }}>
            Our Impact in Numbers
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: '#7A6A4F' }}>
            Every space we design tells a story of transformation. Here&apos;s how we&apos;ve been 
            creating beautiful, functional interiors that our clients love to call home.
          </p>
          <div 
            className="mt-6 p-4 bg-white rounded-lg border-l-4"
            style={{ borderColor: '#8B6F47' }}
          >
            <p className="text-sm italic" style={{ color: '#7A6A4F' }}>
              &quot;Quality design isn&apos;t just about aesthetics - it&apos;s about creating spaces 
              that enhance your daily life and reflect your personality.&quot;
            </p>
          </div>
        </div>
        
        <div className="md:w-2/3 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} number={stat.number} label={stat.label} />
            ))}
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div 
              className="bg-white p-4 rounded-lg shadow-sm"
              style={{ borderWidth: '1px', borderColor: '#C9A882' }}
            >
              <div className="text-2xl font-bold mb-1" style={{ color: '#5D4E37' }}>5+</div>
              <div className="text-xs" style={{ color: '#7A6A4F' }}>Years of Experience</div>
            </div>
            <div 
              className="bg-white p-4 rounded-lg shadow-sm"
              style={{ borderWidth: '1px', borderColor: '#C9A882' }}
            >
              <div className="text-2xl font-bold mb-1" style={{ color: '#5D4E37' }}>100%</div>
              <div className="text-xs" style={{ color: '#7A6A4F' }}>Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" style={{ backgroundColor: '#C9A882' }} />
    </div>
  );
};

export default Stats;