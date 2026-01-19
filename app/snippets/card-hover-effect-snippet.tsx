import { HoverEffect } from "@/components/ui/card-hover-effect";
import { PiBed, PiCouch, PiHouse, PiKnife,  PiOfficeChair, PiPaintBrush} from "react-icons/pi";

export function CardHoverEffectDemo() {
  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={projects} />
    </div>
  );
}
export const projects = [
    {
        icon : <div className="bg-[#F5DEB3] p-4 rounded-full"><PiHouse className="w-8 h-8 text-[#5D4E37]" /></div>,
        title: "Complete Home Design",
        description:
          "Transform your entire home with cohesive, beautiful spaces that reflect your style.",
      
      },
      {
        icon : <div className="bg-[#F5DEB3] p-4 rounded-full"><PiKnife className="w-8 h-8 text-[#5D4E37]" /></div>,
        title: "Modular Kitchens",
        description:
          "Smart, stylish kitchens that fit your lifestyle.",
       
      },
      {
        icon : <div className="bg-[#F5DEB3] p-4 rounded-full"><PiBed className="w-8 h-8 text-[#5D4E37]" /></div>,
        title: "Commercial Spaces",
        description:
          "Make an impression with impactful retail & hospitality interiors.",
      
      },
      {
        icon : <div className="bg-[#F5DEB3] p-4 rounded-full"><PiOfficeChair className="w-8 h-8 text-[#5D4E37]" /></div>,
        title: "Office Interiors",
        description:
          "Boost productivity with clean, inspiring workspaces.",
      
      },
      {
        icon : <div className="bg-[#F5DEB3] p-4 rounded-full"><PiCouch className="w-8 h-8 text-[#5D4E37]" /></div>,
        title: "Residential Interiors",
        description:
          "Elevate your home with custom-designed living, dining & bedroom spaces.",
      
      },
      {
        icon : <div className="bg-[#F5DEB3] p-4 rounded-full"><PiPaintBrush className="w-8 h-8 text-[#5D4E37]" /></div>,
        title: "Space Planning & 3D Design",
        description:
          "Visualize your dream interiors before they come to life.",
     
      },
];