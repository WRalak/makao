import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Property from '@/models/Property';
import { verifyToken } from '@/lib/auth';

// GET - Fetch questions for a property
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Mock questions data - in production, this would come from a Question model
    const questions = [
      {
        id: '1',
        question: 'Is the property pet-friendly?',
        answer: 'Yes, pets are allowed with a $500 pet deposit.',
        date: '2024-01-15',
        askedBy: 'John D.'
      },
      {
        id: '2',
        question: 'What utilities are included in the rent?',
        answer: 'Water and trash are included. Tenant pays for electricity and gas.',
        date: '2024-01-14',
        askedBy: 'Sarah M.'
      }
    ];

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST - Add a new question
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { question } = await request.json();
    
    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    await connectDB();
    
    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // In production, this would save to a Question model
    const newQuestion = {
      id: Date.now().toString(),
      question: question.trim(),
      answer: 'The agent will respond to your question soon.',
      date: new Date().toISOString().split('T')[0],
      askedBy: 'Tenant'
    };

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Failed to add question:', error);
    return NextResponse.json(
      { error: 'Failed to add question' },
      { status: 500 }
    );
  }
}
