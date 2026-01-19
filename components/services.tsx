'use client'

import { CardHoverEffectDemo } from "../app/snippets/card-hover-effect-snippet";

const Services = () => {
    return ( 
      <div className="max-w-5xl mx-auto pb-10 md:py-20">
   
        <div className="text-4xl pb-5 md:text-7xl text-center
         bg-clip-text text-transparent bg-gradient-to-b
          from-amber-600 to-amber-900 bg-opacity-50 mt-20">
          What We Do
        </div>
        <p className="mt-4 text-lg font-normal
          max-w-lg 
          text-center mx-auto" style={{ color: '#7A6A4F' }}>
        From residential interiors to commercial spaces, we create beautiful, functional designs that reflect your style and enhance your lifestyle. 
        </p>

        <CardHoverEffectDemo />

      </div> 
    );
}
 
export default Services;