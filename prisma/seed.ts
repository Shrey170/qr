import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing database...')
  await prisma.inventoryLog.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.bill.deleteMany()
  await prisma.tableSession.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menuCategory.deleteMany()
  await prisma.table.deleteMany()
  await prisma.staffUser.deleteMany()

  console.log('Seeding users...')
  const passwordHash = await bcrypt.hash('password123', 10)
  
  await prisma.staffUser.createMany({
    data: [
      { name: 'Admin', email: 'admin@tableserve.com', passwordHash, role: 'ADMIN' },
      { name: 'Staff 1', email: 'staff1@tableserve.com', passwordHash, role: 'STAFF' },
      { name: 'Staff 2', email: 'staff2@tableserve.com', passwordHash, role: 'STAFF' },
    ]
  })

  console.log('Seeding tables...')
  const tables = []
  for (let i = 1; i <= 8; i++) {
    tables.push({
      number: i,
      qrToken: `table-${i}-token-${Math.random().toString(36).substring(7)}`,
      status: 'AVAILABLE' as const
    })
  }
  await prisma.table.createMany({ data: tables })

  console.log('Seeding menu...')
  const categories = [
    { name: 'Starters', sortOrder: 1 },
    { name: 'Mains', sortOrder: 2 },
    { name: 'Breads', sortOrder: 3 },
    { name: 'Desserts & Beverages', sortOrder: 4 },
  ]

  for (const cat of categories) {
    const createdCat = await prisma.menuCategory.create({ data: cat })
    
    let items = []
    if (cat.name === 'Starters') {
      items = [
        { name: 'Paneer Tikka', price: 250, description: 'Marinated cottage cheese grilled in tandoor', stockQty: 20 },
        { name: 'Samosa Chaat', price: 150, description: 'Crushed samosas topped with yogurt and chutneys', stockQty: 30 },
        { name: 'Hara Bhara Kebab', price: 200, description: 'Healthy spinach and pea patties', stockQty: 15 },
        { name: 'Chicken Tikka', price: 300, description: 'Spicy grilled chicken chunks', stockQty: 25 },
      ]
    } else if (cat.name === 'Mains') {
      items = [
        { name: 'Butter Chicken', price: 450, description: 'Classic chicken in tomato gravy', stockQty: 40 },
        { name: 'Palak Paneer', price: 350, description: 'Cottage cheese in spinach gravy', stockQty: 30 },
        { name: 'Dal Makhani', price: 280, description: 'Slow-cooked black lentils', stockQty: 50 },
        { name: 'Mutton Rogan Josh', price: 550, description: 'Kashmiri style mutton curry', stockQty: 20 },
        { name: 'Vegetable Biryani', price: 320, description: 'Fragrant basmati rice cooked with mixed vegetables', stockQty: 25 },
      ]
    } else if (cat.name === 'Breads') {
      items = [
        { name: 'Butter Naan', price: 60, description: 'Soft refined flour bread', stockQty: 100 },
        { name: 'Garlic Naan', price: 75, description: 'Naan topped with garlic', stockQty: 80 },
        { name: 'Tandoori Roti', price: 40, description: 'Whole wheat bread', stockQty: 150 },
        { name: 'Lachha Paratha', price: 80, description: 'Flaky layered bread', stockQty: 50 },
      ]
    } else {
      items = [
        { name: 'Gulab Jamun', price: 120, description: 'Fried milk dumplings in syrup', stockQty: 40 },
        { name: 'Rasmalai', price: 150, description: 'Cottage cheese discs in sweetened milk', stockQty: 30 },
        { name: 'Masala Chai', price: 60, description: 'Spiced Indian tea', stockQty: 100 },
        { name: 'Mango Lassi', price: 110, description: 'Sweet yogurt drink with mango', stockQty: 50 },
        { name: 'Fresh Lime Soda', price: 80, description: 'Refreshing lime drink', stockQty: 80 },
      ]
    }

    await prisma.menuItem.createMany({
      data: items.map(item => ({
        categoryId: createdCat.id,
        name: item.name,
        price: item.price,
        description: item.description,
        stockQty: item.stockQty,
        isAvailable: true,
      }))
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
