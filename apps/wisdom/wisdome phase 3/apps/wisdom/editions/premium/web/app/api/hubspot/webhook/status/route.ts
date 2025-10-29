import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if HubSpot webhook is configured
    const hubspotKey = process.env.HUBSPOT_ACCESS_TOKEN;
    const webhookUrl = process.env.HUBSPOT_WEBHOOK_URL;
    
    const configured = !!(hubspotKey && webhookUrl);
    
    // In production, you would check actual webhook registration status
    // For now, we'll return a mock status
    return NextResponse.json({
      configured,
      status: configured ? 'connected' : 'disconnected',
      webhookUrl: webhookUrl || null,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking HubSpot webhook status:', error);
    return NextResponse.json(
      { 
        configured: false, 
        status: 'error',
        error: 'Failed to check webhook status' 
      },
      { status: 500 }
    );
  }
}