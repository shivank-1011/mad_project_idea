const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.product.createMany({
        data: [
            { name: "iPhone 15", brand: "Apple", specs: { ram: "6GB", storage: "128GB" }, price: 79999, rating: 4.8, imageUrl: "", affiliateLink: "https://amzn.to/3example1" },
            { name: "Galaxy S24", brand: "Samsung", specs: { ram: "8GB", storage: "256GB" }, price: 69999, rating: 4.7, imageUrl: "", affiliateLink: "https://amzn.to/3example2" }
        ]
    });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());

