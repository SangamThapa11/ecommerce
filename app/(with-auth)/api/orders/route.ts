// app/api/orders/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real app, you would:
    // 1. Verify the user is authenticated
    // 2. Fetch orders from your database for the logged-in user
    // 3. Return the orders
    
    // Mock response for demonstration
    const mockOrders = [
      {
        _id: "685bc86e47628b191ec2e2ed",
        buyer: {
          _id: "6848d4b1f908826f1202ec69",
          name: "Sangam",
          email: "sangammagar3@gmail.com",
          phone: "9805100112"
        },
        code: "fSAqlta9HBG7FQv",
        items: [
          {
            _id: "685bc80747628b191ec2e2d9",
            product: "68528ebd7aefacfd55e2bb53",
            price: 425000,
            subTotal: 4250000,
            deliveryCharge: 10000,
            total: 4260000,
            status: "pending"
          }
        ],
        grossTotal: 4250000,
        tax: 553800,
        total: 4813800,
        status: "pending",
        isPaid: false,
        createdAt: "2025-06-25T09:59:10.109Z"
      },
      // Include other mock orders as needed
    ];

    return NextResponse.json({
      data: mockOrders,
      message: "Your orders",
      status: "ORDER_LIST"
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}