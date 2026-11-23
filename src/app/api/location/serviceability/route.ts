import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Calculate distance between two lat/lng coordinates in km using Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode')?.trim();
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    // Get active pricing rule
    const pricingRule = await prisma.deliveryPricingRule.findFirst({
      where: { isActive: true },
    }) || {
      minOrderValue: 99.0,
      standardDeliveryFee: 99.0,
      freeDeliveryThreshold: 499.0,
      quickExpressFee: 25.0,
      smallOrderFee: 20.0,
      handlingFee: 5.0,
      isFreeDeliveryCampaign: true,
      campaignDescription: 'Free Delivery on orders above ₹499 across India!',
    };

    // 1. If Coordinates provided
    if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (!isNaN(lat) && !isNaN(lng)) {
        const centres = await prisma.fulfilmentCentre.findMany({
          where: { isActive: true },
        });

        let nearestCentre: any = null;
        let minDistance = Infinity;

        for (const centre of centres) {
          const dist = calculateDistanceKm(lat, lng, centre.latitude, centre.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            nearestCentre = centre;
          }
        }

        if (nearestCentre && minDistance <= nearestCentre.deliveryRadiusKm) {
          // Within quick delivery radius of a dark store
          const estMins = Math.max(12, Math.round(minDistance * 2.5 + 8));
          return NextResponse.json({
            isServiceable: true,
            deliveryMode: 'QUICK_LOCAL',
            deliveryTimeText: `${estMins} MINS`,
            estimatedDeliveryMinutes: estMins,
            estimatedDeliveryDays: 0,
            distanceKm: parseFloat(minDistance.toFixed(2)),
            fulfilmentCentre: {
              id: nearestCentre.id,
              name: nearestCentre.name,
              code: nearestCentre.code,
              type: nearestCentre.type,
            },
            city: nearestCentre.city,
            state: nearestCentre.state,
            pincode: nearestCentre.pincode,
            pricing: {
              deliveryFee: pricingRule.quickExpressFee,
              freeDeliveryThreshold: pricingRule.freeDeliveryThreshold,
              minOrderValue: pricingRule.minOrderValue,
              campaignText: pricingRule.campaignDescription,
            },
            badges: ['⚡ 15-Min Delivery', '🛵 Live Partner Tracking', '❄️ Cold-Chain Freshness'],
          });
        }
      }
    }

    // 2. If Pincode provided
    if (pincode) {
      const pinRecord = await prisma.serviceablePinCode.findUnique({
        where: { pincode },
        include: { fulfilmentCentre: true },
      });

      if (pinRecord) {
        const isQuick = pinRecord.deliveryMode === 'QUICK_LOCAL';
        return NextResponse.json({
          isServiceable: pinRecord.isActive,
          pincode: pinRecord.pincode,
          city: pinRecord.city,
          state: pinRecord.state,
          district: pinRecord.district,
          deliveryMode: pinRecord.deliveryMode,
          deliveryTimeText: isQuick
            ? `${pinRecord.estimatedDeliveryMinutes} MINS`
            : `${pinRecord.estimatedDeliveryDays} DAYS`,
          estimatedDeliveryMinutes: pinRecord.estimatedDeliveryMinutes,
          estimatedDeliveryDays: pinRecord.estimatedDeliveryDays,
          fulfilmentCentre: pinRecord.fulfilmentCentre
            ? {
                id: pinRecord.fulfilmentCentre.id,
                name: pinRecord.fulfilmentCentre.name,
                code: pinRecord.fulfilmentCentre.code,
                type: pinRecord.fulfilmentCentre.type,
              }
            : null,
          pricing: {
            deliveryFee: isQuick ? pricingRule.quickExpressFee : pricingRule.standardDeliveryFee,
            freeDeliveryThreshold: pricingRule.freeDeliveryThreshold,
            minOrderValue: pricingRule.minOrderValue,
            campaignText: pricingRule.campaignDescription,
          },
          badges: isQuick
            ? ['⚡ 15-25 Min Delivery', '🛵 Live Partner Tracking', '❄️ Dark Store Freshness']
            : ['📦 Nationwide Courier', '🚚 Delhivery / Shiprocket Express', '⏱️ 2-4 Business Days'],
        });
      }

      // Check if valid 6-digit Indian PIN code format
      const isValidIndianPin = /^[1-9][0-9]{5}$/.test(pincode);
      if (isValidIndianPin) {
        // Fallback to Nationwide Courier Delivery
        return NextResponse.json({
          isServiceable: true,
          pincode,
          city: 'Regional Destination',
          state: 'India',
          deliveryMode: 'NATIONWIDE',
          deliveryTimeText: '3-4 DAYS',
          estimatedDeliveryMinutes: 4320,
          estimatedDeliveryDays: 3,
          fulfilmentCentre: {
            name: 'Central National Distribution Centre',
            code: 'NAT-NAG-01',
            type: 'WAREHOUSE',
          },
          pricing: {
            deliveryFee: pricingRule.standardDeliveryFee,
            freeDeliveryThreshold: pricingRule.freeDeliveryThreshold,
            minOrderValue: pricingRule.minOrderValue,
            campaignText: pricingRule.campaignDescription,
          },
          badges: ['📦 Standard Courier Delivery', '⏱️ 3-4 Business Days', '🔒 Safe Packaging'],
        });
      }

      return NextResponse.json(
        {
          isServiceable: false,
          pincode,
          error: 'Please enter a valid 6-digit Indian PIN code',
        },
        { status: 400 }
      );
    }

    // Default: Return Indiranagar Bengaluru default
    return NextResponse.json({
      isServiceable: true,
      pincode: '560038',
      city: 'Bengaluru',
      state: 'Karnataka',
      deliveryMode: 'QUICK_LOCAL',
      deliveryTimeText: '15 MINS',
      estimatedDeliveryMinutes: 15,
      estimatedDeliveryDays: 0,
      pricing: {
        deliveryFee: pricingRule.quickExpressFee,
        freeDeliveryThreshold: pricingRule.freeDeliveryThreshold,
        minOrderValue: pricingRule.minOrderValue,
        campaignText: pricingRule.campaignDescription,
      },
      badges: ['⚡ 15-Min Delivery', '🛵 Live Partner Tracking', '❄️ Dark Store Freshness'],
    });
  } catch (error: any) {
    console.error('Serviceability check error:', error);
    return NextResponse.json({ error: 'Failed to verify location serviceability' }, { status: 500 });
  }
}
