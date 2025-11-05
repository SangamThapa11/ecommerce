// app/api/orders/[orderCode]/pay-with-khalti/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { orderCode: string } }) {
  try {
    const orderCode = params.orderCode;
    
    // In a real app, you would:
    // 1. Verify the order exists and belongs to the user
    // 2. Get the order total
    // 3. Initiate Khalti payment with your backend
    
    // Mock Khalti response for demonstration
    const mockKhaltiResponse = {
      pidx: "f6uvyMRv5fTgWoLCfGn8jE",
      payment_url: "https://test-pay.khalti.com/?pidx=f6uvyMRv5fTgWoLCfGn8jE",
      expires_at: "2025-08-18T13:16:36.230742+05:45",
      expires_in: 1800
    };

    return NextResponse.json({
      data: mockKhaltiResponse,
      message: "Payment Initiated",
      status: "KHALTI_INITIATED"
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initiate Khalti payment" },
      { status: 500 }
    );
  }
}