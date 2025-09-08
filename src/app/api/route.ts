
import { NextResponse } from 'next/server'
 
export async function GET() { 
  return NextResponse.json({ message: 'This is the root of the DamDoh API. Specific endpoints handle application logic.' })
}
