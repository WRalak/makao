import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch individual agent details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mock agent data for now (database connection disabled)
    const mockAgent = {
      id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+254 712 345 678',
      role: 'agent',
      isActive: true,
      isBanned: false,
      bio: `Experienced real estate agent specializing in residential properties. With over ${Math.floor(Math.random() * 15) + 1} years of experience, I'm committed to providing exceptional service and finding the perfect home for every client. My expertise includes apartments, houses, and condos in the ${id.includes('1') ? 'Manhattan' : 'Brooklyn'} area.`,
      responseTime: '< 2 hours',
      responseRate: 95 + Math.floor(Math.random() * 5),
      totalListings: Math.floor(Math.random() * 50) + 10,
      activeListings: Math.floor(Math.random() * 20) + 1,
      averageRating: 4.5 + Math.random() * 0.5,
      reviewCount: Math.floor(Math.random() * 100) + 20,
      yearsExperience: Math.floor(Math.random() * 15) + 1,
      languages: ['English', 'Spanish', 'Mandarin'],
      specialties: ['Residential', 'Apartments', 'Houses', 'Condos'],
      verified: true,
      featured: Math.random() > 0.7,
      company: agent.email.includes('gmail') ? 'Premium Real Estate Group' : 'Urban Properties LLC',
      license: `RE${100000 + Math.floor(Math.random() * 900000)}`,
      website: `https://www.${agent.name.toLowerCase().replace(' ', '')}realestate.com`,
      socialMedia: {
        linkedin: `https://linkedin.com/in/${agent.name.toLowerCase().replace(' ', '')}`,
        facebook: `https://facebook.com/${agent.name.toLowerCase().replace(' ', '')}`,
        twitter: `https://twitter.com/${agent.name.toLowerCase().replace(' ', '')}`,
      },
      certifications: [
        'Certified Residential Specialist',
        'Accredited Buyer Representative',
        'Seniors Real Estate Specialist',
      ],
      achievements: [
        'Top Producer 2023',
        '100% Client Satisfaction',
        'Expert Negotiator',
        'Market Knowledge Leader',
      ],
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    };

    return NextResponse.json({
      agent: transformedAgent,
    });

  } catch (error) {
    console.error('Failed to fetch agent details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent details' },
      { status: 500 }
    );
  }
}
