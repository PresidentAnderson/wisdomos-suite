import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const timestamp = new Date().toISOString()
  const checks = {
    database: false,
    api: true
  }
  
  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
    
    const allHealthy = Object.values(checks).every(check => check)
    
    return NextResponse.json(
      { 
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp,
        service: 'wisdomos-web',
        version: process.env.npm_package_version || '0.1.0',
        checks,
        uptime: process.uptime()
      },
      { status: allHealthy ? 200 : 503 }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp,
        service: 'wisdomos-web',
        version: process.env.npm_package_version || '0.1.0',
        checks,
        error: 'Health check failed',
        uptime: process.uptime()
      },
      { status: 503 }
    )
  }
}