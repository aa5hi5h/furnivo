'use client'

import Image from "next/image"

const Gallery = () => {
    return (   
        <div className="px-4 md:px-8" style={{ color: '#5D4E37' }}>
        <div className="p-4 mx-auto relative z-10 w-full pt-10 md:pt-20 px-2">
          <div className="text-4xl md:text-7xl text-center bg-clip-text text-transparent bg-gradient-to-b from-amber-600 to-amber-900 pb-4">
            Our Design Gallery <br /> Inspiring Spaces
          </div>
          <p className="mt-4 text-lg font-normal max-w-lg text-center mx-auto px-4" style={{ color: '#7A6A4F' }}>
            Explore our stunning collection of interior design projects, from modern living spaces to elegant bedrooms and functional kitchens.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-10">
    <div className="grid gap-4">
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/stylish-living-rooms-katie-charlotte-0120-c32cbe4d5664423980d942071801b950.jpg" alt=""/>
        </div>
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/stylish-modern-kitchen-ideas-1578344245.png" alt=""/>
        </div>
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/sw_e4a443c3-7ef0-4f03-a042-111317e6ac54_GettyImages-1449479416.jpg" alt=""/>
        </div>
    </div>
    <div className="grid gap-4">
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/calgary-interior-design-14-living-room-concrete-fireplace-65369562aa0f0.avif" alt=""/>
        </div>
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/edc100124gambrel-006-66e0bc34ac150.avif" alt=""/>
        </div>
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/200522-EB_12-Living-Room_1267-b13debcb440a4471981d7ac637e76e7a.jpg" alt=""/>
        </div>
    </div>
    <div className="grid gap-4">
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/modern-kitchen-ideas-navy-blue-1577119453.avif" alt=""/>
        </div>
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/pacific-northwest-home-tour-great-room-0820-14d61b428237459b9e996c769ae92dd0.jpg" alt=""/>
        </div>
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/modern-living-room-design-ideas-4126797-hero-a2fd3412abc640bc8108ee6c16bf71ce.jpg" alt=""/>
        </div>
    </div>
    <div className="grid gap-4">
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/f0a9652d-f99c-4f80-b758-c912017f5158_large.webp" alt=""/>
        </div>
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/modern-living-room-design-ideas-4126797-hero-a2fd3412abc640bc8108ee6c16bf71ce.jpg" alt=""/>
        </div>
        <div>
            <Image
            width={500}
            height={500}
            priority
            className="h-auto max-w-full rounded-lg" src="/modern-kitchen-ideas-design-1664295332.png" alt=""/>
        </div>
    </div>
    </div>
    </div> );
}
 
export default Gallery;