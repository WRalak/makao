import { NextRequest, NextResponse } from 'next/server';
// GET - Fetch agent reviews
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Mock reviews data for now (replace with actual database queries)
    const mockReviews = [
      {
        _id: '1',
        userName: 'John Smith',
        rating: 5,
        comment: 'Excellent agent! Very professional and responsive. Found my dream apartment in just 2 weeks.',
        createdAt: new Date('2024-01-15'),
        propertyTitle: 'Modern 2BR Apartment in Manhattan',
      },
      {
        _id: '2',
        userName: 'Emily Johnson',
        rating: 4,
        comment: 'Great experience overall. Very knowledgeable about the market and provided valuable insights.',
        createdAt: new Date('2024-01-10'),
        propertyTitle: 'Cozy Studio in Brooklyn',
      },
      {
        _id: '3',
        userName: 'Michael Brown',
        rating: 5,
        comment: 'Outstanding service! Went above and beyond to help me find the perfect home. Highly recommend!',
        createdAt: new Date('2024-01-05'),
        propertyTitle: 'Luxury 3BR House in Queens',
      },
      {
        _id: '4',
        userName: 'Sarah Davis',
        rating: 5,
        comment: 'Very patient and understanding. Made the whole process smooth and stress-free.',
        createdAt: new Date('2023-12-28'),
        propertyTitle: 'Spacious 1BR in Upper East Side',
      },
      {
        _id: '5',
        userName: 'David Wilson',
        rating: 4,
        comment: 'Professional and efficient. Helped me navigate the competitive NYC rental market successfully.',
        createdAt: new Date('2023-12-20'),
        propertyTitle: 'Charming 2BR in Greenwich Village',
      },
      {
        _id: '6',
        userName: 'Lisa Anderson',
        rating: 5,
        comment: 'Amazing agent! Found exactly what I was looking for and negotiated great terms.',
        createdAt: new Date('2023-12-15'),
        propertyTitle: 'Modern Loft in SoHo',
      },
      {
        _id: '7',
        userName: 'Robert Taylor',
        rating: 4,
        comment: 'Very knowledgeable about different neighborhoods. Provided excellent guidance throughout.',
        createdAt: new Date('2023-12-10'),
        propertyTitle: 'Family-friendly 3BR in Park Slope',
      },
      {
        _id: '8',
        userName: 'Jennifer Martinez',
        rating: 5,
        comment: 'Exceptional service! Very responsive and attentive to my needs. Found my perfect home!',
        createdAt: new Date('2023-12-05'),
        propertyTitle: 'Beautiful 2BR with Views in Battery Park',
      },
    ];

    const reviews = mockReviews.slice(skip, skip + limit);
    const total = mockReviews.length;

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Failed to fetch agent reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent reviews' },
      { status: 500 }
    );
  }
}

// POST - Create a new review for an agent
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate review data
    const { userName, rating, comment, propertyTitle } = body;

    if (!userName || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: userName, rating, comment' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // TODO: Save review to database
    // For now, just return success
    const newReview = {
      _id: Date.now().toString(),
      userName,
      rating,
      comment,
      propertyTitle: propertyTitle || null,
      createdAt: new Date(),
      agentId: id,
    };

    return NextResponse.json({
      message: 'Review submitted successfully',
      review: newReview,
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
