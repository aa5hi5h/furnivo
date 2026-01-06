import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.review.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.product.deleteMany()
  await prisma.collection.deleteMany()
  await prisma.contactInquiry.deleteMany()
  await prisma.designServiceBooking.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: hashedPassword,
        phone: '+1234567890',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        password: hashedPassword,
        phone: '+1234567891',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        password: hashedPassword,
        phone: '+1234567892',
      },
    }),
  ])

  console.log('✅ Created users')

  // Create Collections
  const collections = await Promise.all([
    prisma.collection.create({
      data: {
        name: 'Modern Living',
        slug: 'modern-living',
        description: 'Contemporary furniture for modern homes',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      },
    }),
    prisma.collection.create({
      data: {
        name: 'Classic Elegance',
        slug: 'classic-elegance',
        description: 'Timeless pieces with elegant designs',
        imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800',
      },
    }),
    prisma.collection.create({
      data: {
        name: 'Minimalist',
        slug: 'minimalist',
        description: 'Simple and functional minimalist furniture',
        imageUrl: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800',
      },
    }),
    prisma.collection.create({
      data: {
        name: 'Outdoor Paradise',
        slug: 'outdoor-paradise',
        description: 'Durable and stylish outdoor furniture',
        imageUrl: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
      },
    }),
  ])

  console.log('✅ Created collections')

  // Create Products
  const products = await Promise.all([
    // Living Room
    prisma.product.create({
      data: {
        name: 'Modern Grey Sofa',
        slug: 'modern-grey-sofa',
        description: 'Luxurious 3-seater sofa with premium fabric upholstery. Perfect for modern living rooms.',
        category: 'Living Room',
        price: 1299.99,
        originalPrice: 1599.99,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        images: [
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        ],
        colors: ['Grey', 'Beige', 'Navy Blue'],
        materials: 'Premium fabric, solid wood frame',
        featured: true,
        rating: 4.8,
        reviewCount: 124,
        collectionId: collections[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Velvet Accent Chair',
        slug: 'velvet-accent-chair',
        description: 'Elegant accent chair with soft velvet upholstery and gold metal legs.',
        category: 'Living Room',
        price: 449.99,
        originalPrice: 599.99,
        stock: 28,
        image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800',
        images: [
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800',
        ],
        colors: ['Emerald Green', 'Navy Blue', 'Blush Pink'],
        materials: 'Velvet, metal legs',
        featured: true,
        rating: 4.6,
        reviewCount: 89,
        collectionId: collections[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Coffee Table Set',
        slug: 'coffee-table-set',
        description: 'Modern coffee table with marble top and gold frame. Includes 2 nesting side tables.',
        category: 'Living Room',
        price: 699.99,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800',
        images: [
          'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800',
        ],
        colors: ['White Marble', 'Black Marble'],
        materials: 'Marble, stainless steel',
        featured: true,
        rating: 4.7,
        reviewCount: 56,
        collectionId: collections[0].id,
      },
    }),

    // Bedroom
    prisma.product.create({
      data: {
        name: 'King Size Platform Bed',
        slug: 'king-size-platform-bed',
        description: 'Elegant platform bed with upholstered headboard and wooden frame.',
        category: 'Bedroom',
        price: 1899.99,
        originalPrice: 2299.99,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
        ],
        colors: ['Grey', 'Beige', 'Charcoal'],
        materials: 'Solid wood, upholstered fabric',
        featured: true,
        rating: 4.9,
        reviewCount: 203,
        collectionId: collections[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Modern Nightstand',
        slug: 'modern-nightstand',
        description: '2-drawer nightstand with sleek design and ample storage space.',
        category: 'Bedroom',
        price: 249.99,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
        images: [
          'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
        ],
        colors: ['Walnut', 'Oak', 'White'],
        materials: 'Solid wood',
        featured: false,
        rating: 4.5,
        reviewCount: 78,
        collectionId: collections[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Dresser with Mirror',
        slug: 'dresser-with-mirror',
        description: '6-drawer dresser with large mirror. Perfect for spacious bedrooms.',
        category: 'Bedroom',
        price: 1099.99,
        stock: 8,
        image: 'https://images.unsplash.com/photo-1558211583-803a5dc0e0b5?w=800',
        images: [
          'https://images.unsplash.com/photo-1558211583-803a5dc0e0b5?w=800',
        ],
        colors: ['White', 'Grey', 'Natural Wood'],
        materials: 'Solid wood, glass mirror',
        featured: false,
        rating: 4.6,
        reviewCount: 45,
        collectionId: collections[1].id,
      },
    }),

    // Dining
    prisma.product.create({
      data: {
        name: 'Dining Table Set',
        slug: 'dining-table-set',
        description: 'Modern dining table for 6 with comfortable upholstered chairs.',
        category: 'Dining',
        price: 1599.99,
        originalPrice: 1999.99,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
        images: [
          'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
        ],
        colors: ['Oak', 'Walnut', 'White'],
        materials: 'Solid wood, fabric cushions',
        featured: true,
        rating: 4.8,
        reviewCount: 167,
        collectionId: collections[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bar Stool Set',
        slug: 'bar-stool-set',
        description: 'Set of 2 modern bar stools with adjustable height and swivel feature.',
        category: 'Dining',
        price: 299.99,
        stock: 42,
        image: 'https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=800',
        images: [
          'https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=800',
        ],
        colors: ['Black', 'White', 'Grey'],
        materials: 'Metal frame, PU leather',
        featured: false,
        rating: 4.4,
        reviewCount: 92,
        collectionId: collections[2].id,
      },
    }),

    // Office
    prisma.product.create({
      data: {
        name: 'Executive Office Desk',
        slug: 'executive-office-desk',
        description: 'Spacious L-shaped desk with built-in storage and cable management.',
        category: 'Office',
        price: 899.99,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800',
        images: [
          'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800',
        ],
        colors: ['Black', 'Walnut', 'White'],
        materials: 'Engineered wood, metal frame',
        featured: true,
        rating: 4.7,
        reviewCount: 134,
        collectionId: collections[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ergonomic Office Chair',
        slug: 'ergonomic-office-chair',
        description: 'Premium ergonomic chair with lumbar support and breathable mesh back.',
        category: 'Office',
        price: 549.99,
        originalPrice: 699.99,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
        images: [
          'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
        ],
        colors: ['Black', 'Grey', 'Blue'],
        materials: 'Mesh fabric, aluminum base',
        featured: true,
        rating: 4.9,
        reviewCount: 289,
        collectionId: collections[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bookshelf',
        slug: 'modern-bookshelf',
        description: '5-tier open bookshelf with modern design. Perfect for home office or living room.',
        category: 'Office',
        price: 349.99,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
        images: [
          'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
        ],
        colors: ['Walnut', 'White', 'Black'],
        materials: 'Solid wood',
        featured: false,
        rating: 4.6,
        reviewCount: 71,
        collectionId: collections[2].id,
      },
    }),

    // Outdoor
    prisma.product.create({
      data: {
        name: 'Patio Dining Set',
        slug: 'patio-dining-set',
        description: 'Weather-resistant outdoor dining set for 6. Includes table and chairs.',
        category: 'Outdoor',
        price: 1299.99,
        stock: 14,
        image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
        images: [
          'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
        ],
        colors: ['Brown', 'Grey', 'Black'],
        materials: 'Wicker, aluminum frame, tempered glass',
        featured: true,
        rating: 4.7,
        reviewCount: 98,
        collectionId: collections[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Outdoor Lounge Chair',
        slug: 'outdoor-lounge-chair',
        description: 'Comfortable lounge chair with adjustable backrest and weather-resistant cushions.',
        category: 'Outdoor',
        price: 449.99,
        stock: 22,
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
        images: [
          'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
        ],
        colors: ['Grey', 'Beige', 'Navy'],
        materials: 'Aluminum, water-resistant fabric',
        featured: false,
        rating: 4.5,
        reviewCount: 63,
        collectionId: collections[3].id,
      },
    }),
  ])

  console.log('✅ Created products')

  // Create Reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Absolutely love this sofa! Super comfortable and looks amazing in my living room.',
        userName: 'John Doe',
        userEmail: 'john.doe@example.com',
        verified: true,
        productId: products[0].id,
        userId: users[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Great quality chair, very comfortable. Only issue is the delivery took a bit long.',
        userName: 'Jane Smith',
        userEmail: 'jane.smith@example.com',
        verified: true,
        productId: products[1].id,
        userId: users[1].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Best office chair I\'ve ever owned. My back pain is gone!',
        userName: 'Bob Wilson',
        userEmail: 'bob.wilson@example.com',
        verified: true,
        productId: products[9].id,
        userId: users[2].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'The bed frame is sturdy and looks elegant. Highly recommend!',
        userName: 'Alice Johnson',
        userEmail: 'alice.j@example.com',
        verified: false,
        productId: products[3].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Beautiful dining set. The table is exactly what I was looking for.',
        userName: 'Mike Brown',
        userEmail: 'mike.b@example.com',
        verified: false,
        productId: products[6].id,
      },
    }),
  ])

  console.log('✅ Created reviews')

  // Create Addresses
  const addresses = await Promise.all([
    prisma.address.create({
      data: {
        userId: users[0].id,
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: users[1].id,
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
        isDefault: true,
      },
    }),
  ])

  console.log('✅ Created addresses')

  // Create Orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        status: 'delivered',
        totalAmount: 1749.98,
        paymentMethod: 'credit_card',
        addressId: addresses[0].id,
        orderItems: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: 1299.99,
            },
            {
              productId: products[1].id,
              quantity: 1,
              price: 449.99,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        status: 'processing',
        totalAmount: 899.99,
        paymentMethod: 'paypal',
        addressId: addresses[1].id,
        orderItems: {
          create: [
            {
              productId: products[8].id,
              quantity: 1,
              price: 899.99,
            },
          ],
        },
      },
    }),
  ])

  console.log('✅ Created orders')

  // Create Cart Items
  await Promise.all([
    prisma.cartItem.create({
      data: {
        userId: users[0].id,
        productId: products[2].id,
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: users[1].id,
        productId: products[3].id,
        quantity: 1,
      },
    }),
  ])

  console.log('✅ Created cart items')

  // Create Wishlist Items
  await Promise.all([
    prisma.wishlistItem.create({
      data: {
        userId: users[0].id,
        productId: products[6].id,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        userId: users[1].id,
        productId: products[11].id,
      },
    }),
  ])

  console.log('✅ Created wishlist items')

  // Create Contact Inquiries
  await Promise.all([
    prisma.contactInquiry.create({
      data: {
        name: 'Sarah Connor',
        email: 'sarah.connor@example.com',
        phone: '+1234567893',
        subject: 'Product Question',
        message: 'I would like to know more about the warranty on the Modern Grey Sofa.',
        status: 'new',
      },
    }),
    prisma.contactInquiry.create({
      data: {
        name: 'Tom Hardy',
        email: 'tom.hardy@example.com',
        subject: 'Delivery Issue',
        orderNumber: 'ORD-12345',
        message: 'My order hasn\'t arrived yet. Can you help me track it?',
        status: 'in_progress',
      },
    }),
  ])

  console.log('✅ Created contact inquiries')

  // Create Design Service Bookings
  await Promise.all([
    prisma.designServiceBooking.create({
      data: {
        name: 'Emma Watson',
        email: 'emma.watson@example.com',
        phone: '+1234567894',
        serviceType: 'virtual',
        preferredDate: '2026-01-15',
        preferredTime: '2:00 PM',
        budgetRange: '$5,000 - $10,000',
        message: 'Looking to redesign my living room with modern furniture.',
        status: 'pending',
      },
    }),
    prisma.designServiceBooking.create({
      data: {
        name: 'Chris Evans',
        email: 'chris.evans@example.com',
        phone: '+1234567895',
        serviceType: 'inhome',
        preferredDate: '2026-01-20',
        preferredTime: '10:00 AM',
        budgetRange: '$10,000+',
        message: 'Complete home makeover needed.',
        status: 'confirmed',
      },
    }),
  ])

  console.log('✅ Created design service bookings')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })