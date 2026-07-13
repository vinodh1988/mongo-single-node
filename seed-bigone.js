// Seed script for MongoDB mongosh.
// It recreates the bigone database with 5 collections and 25,000 total documents.
// Run with: mongosh seed-bigone.js

const databaseName = "bigone";
const docsPerCollection = 5000;
const batchSize = 500;

const dbRef = db.getSiblingDB(databaseName);

print(`Recreating database: ${databaseName}`);
dbRef.dropDatabase();

const firstNames = ["Asha", "Rahul", "Meera", "John", "Sneha", "Vikram", "Fatima", "Arjun", "Neha", "Kabir"];
const lastNames = ["Sharma", "Patel", "Rao", "Singh", "Khan", "Das", "Iyer", "Gupta", "Nair", "Mehta"];
const cities = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Noida", "Ahmedabad"];
const categories = ["Laptop", "Phone", "Tablet", "Monitor", "Keyboard", "Mouse", "Camera", "Printer", "Speaker", "Router"];
const skills = ["MongoDB", "JavaScript", "Python", "Java", "React", "Node.js", "Docker", "Linux", "AWS", "SQL"];
const ticketStatuses = ["open", "pending", "resolved", "closed"];

function pick(items, index) {
  return items[index % items.length];
}

function money(value) {
  return Number(value.toFixed(2));
}

function flush(collection, batch) {
  if (batch.length > 0) {
    dbRef[collection].insertMany(batch);
    batch.length = 0;
  }
}

function seedCustomers() {
  const batch = [];
  for (let i = 1; i <= docsPerCollection; i++) {
    batch.push({
      customerId: i,
      name: `${pick(firstNames, i)} ${pick(lastNames, i * 3)}`,
      email: `customer${i}@example.com`,
      age: 18 + (i % 53),
      city: pick(cities, i),
      address: {
        line1: `${100 + i} Main Road`,
        city: pick(cities, i),
        pincode: 400000 + i
      },
      interests: [pick(skills, i), pick(skills, i + 2), pick(categories, i + 4)],
      loyaltyPoints: i % 1200,
      active: i % 7 !== 0,
      joinedAt: new Date(2022, i % 12, (i % 28) + 1)
    });
    if (batch.length === batchSize) flush("customers", batch);
  }
  flush("customers", batch);
}

function seedProducts() {
  const batch = [];
  for (let i = 1; i <= docsPerCollection; i++) {
    const category = pick(categories, i);
    batch.push({
      productId: i,
      sku: `SKU-${String(i).padStart(5, "0")}`,
      name: `${category} Model ${i}`,
      category,
      brand: `Brand ${String.fromCharCode(65 + (i % 10))}`,
      price: money(499 + (i % 900) * 13.75),
      stock: i % 250,
      tags: [category.toLowerCase(), pick(skills, i).toLowerCase()],
      dimensions: {
        widthCm: 10 + (i % 40),
        heightCm: 5 + (i % 25),
        weightKg: money(0.5 + (i % 20) / 2)
      },
      createdAt: new Date(2023, i % 12, (i % 28) + 1)
    });
    if (batch.length === batchSize) flush("products", batch);
  }
  flush("products", batch);
}

function seedOrders() {
  const batch = [];
  for (let i = 1; i <= docsPerCollection; i++) {
    const quantity = 1 + (i % 5);
    const unitPrice = money(299 + (i % 700) * 9.5);
    batch.push({
      orderId: i,
      customerId: 1 + (i % docsPerCollection),
      orderDate: new Date(2024, i % 12, (i % 28) + 1),
      status: pick(["created", "paid", "packed", "shipped", "delivered", "cancelled"], i),
      items: [
        {
          productId: 1 + (i % docsPerCollection),
          quantity,
          unitPrice
        },
        {
          productId: 1 + ((i + 77) % docsPerCollection),
          quantity: 1,
          unitPrice: money(unitPrice / 2)
        }
      ],
      payment: {
        method: pick(["card", "upi", "netbanking", "wallet"], i),
        paid: i % 6 !== 0
      },
      total: money(quantity * unitPrice + unitPrice / 2),
      shippingCity: pick(cities, i + 3)
    });
    if (batch.length === batchSize) flush("orders", batch);
  }
  flush("orders", batch);
}

function seedReviews() {
  const batch = [];
  for (let i = 1; i <= docsPerCollection; i++) {
    batch.push({
      reviewId: i,
      productId: 1 + (i % docsPerCollection),
      customerId: 1 + ((i * 5) % docsPerCollection),
      rating: 1 + (i % 5),
      title: `Review ${i}`,
      comment: `Sample review text for product ${1 + (i % docsPerCollection)}.`,
      helpfulVotes: i % 300,
      verifiedPurchase: i % 4 !== 0,
      createdAt: new Date(2025, i % 12, (i % 28) + 1)
    });
    if (batch.length === batchSize) flush("reviews", batch);
  }
  flush("reviews", batch);
}

function seedSupportTickets() {
  const batch = [];
  for (let i = 1; i <= docsPerCollection; i++) {
    batch.push({
      ticketId: i,
      customerId: 1 + ((i * 11) % docsPerCollection),
      subject: `Support ticket ${i}`,
      category: pick(["billing", "delivery", "return", "technical", "account"], i),
      status: pick(ticketStatuses, i),
      priority: pick(["low", "medium", "high", "urgent"], i),
      messages: [
        {
          from: "customer",
          body: `I need help with issue ${i}.`,
          sentAt: new Date(2025, i % 12, (i % 28) + 1, 9, 15)
        },
        {
          from: "agent",
          body: `We are checking ticket ${i}.`,
          sentAt: new Date(2025, i % 12, (i % 28) + 1, 11, 30)
        }
      ],
      createdAt: new Date(2025, i % 12, (i % 28) + 1),
      resolvedAt: i % 3 === 0 ? new Date(2025, i % 12, ((i + 2) % 28) + 1) : null
    });
    if (batch.length === batchSize) flush("supportTickets", batch);
  }
  flush("supportTickets", batch);
}

seedCustomers();
seedProducts();
seedOrders();
seedReviews();
seedSupportTickets();

dbRef.customers.createIndex({ customerId: 1 }, { unique: true });
dbRef.products.createIndex({ productId: 1 }, { unique: true });
dbRef.orders.createIndex({ orderId: 1 }, { unique: true });
dbRef.reviews.createIndex({ reviewId: 1 }, { unique: true });
dbRef.supportTickets.createIndex({ ticketId: 1 }, { unique: true });
dbRef.orders.createIndex({ customerId: 1 });
dbRef.reviews.createIndex({ productId: 1 });
dbRef.supportTickets.createIndex({ status: 1, priority: 1 });

print("Seed complete.");
printjson({
  database: databaseName,
  collections: {
    customers: dbRef.customers.countDocuments(),
    products: dbRef.products.countDocuments(),
    orders: dbRef.orders.countDocuments(),
    reviews: dbRef.reviews.countDocuments(),
    supportTickets: dbRef.supportTickets.countDocuments()
  }
});
