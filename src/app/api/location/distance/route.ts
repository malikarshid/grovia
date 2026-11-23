import { NextRequest, NextResponse } from 'next/server';
import { MapsService } from '@/services/mapsService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const originLat = parseFloat(searchParams.get('originLat') || '12.9716');
    const originLng = parseFloat(searchParams.get('originLng') || '77.5946');
    const destLat = parseFloat(searchParams.get('destLat') || '12.9784');
    const destLng = parseFloat(searchParams.get('destLng') || '77.6408');

    const result = await MapsService.calculateDistance(
      originLat,
      originLng,
      destLat,
      destLng
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate distance' },
      { status: 500 }
    );
  }
}
