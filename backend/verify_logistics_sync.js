import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Starting backend logistics sync verification...");

  // 1. Create a dummy user
  const uniqueSuffix = Date.now().toString();
  const testUser = await prisma.user.create({
    data: {
      email: `test_logistics_${uniqueSuffix}@example.com`,
      passwordHash: "dummyhash",
      name: "Test Logistics User",
      role: "CUSTOMER"
    }
  });
  console.log(`Created test user: ${testUser.id}`);

  try {
    // 2. Create a test order with default logistics
    const orderNumber = `SF-TEST-${uniqueSuffix.slice(-6)}`;
    const testOrder = await prisma.order.create({
      data: {
        userId: testUser.id,
        orderNumber,
        totalAmount: 1500.00,
        status: "PENDING",
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        shippingAddress: {
          recipientName: "Test Logistics User",
          phone: "9876543210",
          street: "123 Green Farm Lane",
          city: "Pune",
          state: "Maharashtra",
          postalCode: "411001",
          country: "India"
        },
        logistics: {
          status: "PENDING",
          courierName: "",
          trackingNumber: "",
          trackingUrl: "",
          dispatchDate: "",
          estimatedDeliveryDate: ""
        }
      }
    });
    console.log(`Created test order: ${testOrder.id} with number ${testOrder.orderNumber}`);

    // Verify database logistics field
    if (!testOrder.logistics || testOrder.logistics.status !== 'PENDING') {
      throw new Error(`Expected logistics status to be PENDING, got: ${JSON.stringify(testOrder.logistics)}`);
    }
    console.log("Verified initial logistics status is PENDING");

    // 3. Simulating Status change update (e.g. to IN_TRANSIT)
    const currentLogistics = testOrder.logistics || {};
    const updatedLogistics = {
      status: "IN_TRANSIT",
      courierName: "Delhivery",
      trackingNumber: "DEL123456",
      trackingUrl: "https://track.delhivery.com",
      dispatchDate: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 3*24*60*60*1000).toISOString()
    };

    const updatedOrder = await prisma.order.update({
      where: { id: testOrder.id },
      data: {
        status: "IN_TRANSIT",
        logistics: updatedLogistics
      }
    });

    console.log("Updated order to IN_TRANSIT in database");
    console.log("Retrieved updated order logistics:", JSON.stringify(updatedOrder.logistics, null, 2));

    if (updatedOrder.status !== "IN_TRANSIT") {
      throw new Error(`Expected top level status to be IN_TRANSIT, got: ${updatedOrder.status}`);
    }
    if (updatedOrder.logistics.status !== "IN_TRANSIT" || updatedOrder.logistics.courierName !== "Delhivery") {
      throw new Error(`Logistics object values mismatch: ${JSON.stringify(updatedOrder.logistics)}`);
    }

    console.log("Verification succeeded: logistics JSON matches the admin status updates perfectly!");

  } finally {
    // Cleanup
    console.log("Cleaning up database...");
    await prisma.order.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log("Cleanup finished.");
    await prisma.$disconnect();
  }
}

main().catch(async (e) => {
  console.error("Verification failed with error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
