import { NextRequest, NextResponse } from 'next/server';

// POST - Get walk and transit scores
export async function POST(request: NextRequest) {
  try {
    const { coordinates } = await request.json();
    
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return NextResponse.json({ error: 'Coordinates are required' }, { status: 400 });
    }

    // Mock walk scores - in production, this would use Walk Score API or similar
    // Generate realistic scores based on location
    const walkScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const transitScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const bikeScore = Math.floor(Math.random() * 30) + 65; // 65-95

    return NextResponse.json({
      walkScore,
      transitScore,
      bikeScore,
      description: {
        walk: getWalkDescription(walkScore),
        transit: getTransitDescription(transitScore),
        bike: getBikeDescription(bikeScore)
      }
    });
  } catch (error) {
    console.error('Failed to fetch walk scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch walk scores' },
      { status: 500 }
    );
  }
}

function getWalkDescription(score: number): string {
  if (score >= 90) return "Walker's Paradise - Daily errands do not require a car";
  if (score >= 70) return "Very Walkable - Most errands can be accomplished on foot";
  if (score >= 50) return "Somewhat Walkable - Some errands can be accomplished on foot";
  return "Car-Dependent - Most errands require a car";
}

function getTransitDescription(score: number): string {
  if (score >= 90) return "Rider's Paradise - Excellent transit options";
  if (score >= 70) return "Excellent Transit - Convenient transit options";
  if (score >= 50) return "Good Transit - Some transit options";
  return "Poor Transit - Limited transit options";
}

function getBikeDescription(score: number): string {
  if (score >= 90) return "Biker's Paradise - Biking is convenient for most trips";
  if (score >= 70) return "Very Bikeable - Bike lanes and trails are available";
  if (score >= 50) return "Bikeable - Some bike infrastructure";
  return "Somewhat Bikeable - Limited bike infrastructure";
}
