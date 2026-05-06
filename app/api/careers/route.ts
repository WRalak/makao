import { NextRequest, NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { handleDatabaseError } from '@/lib/database-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      jobTitle,
      jobType,
      location,
      applicantName,
      email,
      phone,
      resumeUrl,
      coverLetter,
      linkedinUrl,
      portfolioUrl,
      experienceYears,
      currentCompany,
      currentPosition,
      salaryExpectations,
      availability
    } = body;

    // Validation
    const requiredFields = ['jobTitle', 'applicantName', 'email'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Insert into database
    const pool = await getDatabase();
    const result = await pool.query(
      `INSERT INTO job_applications (
        job_title, job_type, location, applicant_name, email, phone, 
        resume_url, cover_letter, linkedin_url, portfolio_url, 
        experience_years, current_company, current_position, 
        salary_expectations, availability
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, created_at`,
      [
        jobTitle,
        jobType,
        location,
        applicantName,
        email,
        phone,
        resumeUrl,
        coverLetter,
        linkedinUrl,
        portfolioUrl,
        experienceYears ? parseInt(experienceYears) : null,
        currentCompany,
        currentPosition,
        salaryExpectations,
        availability
      ]
    );

    const jobApplication = result.rows[0];

    // TODO: Send email notification to HR
    // await sendEmailNotification({
    //   to: 'hr@makao.com',
    //   subject: `New Job Application: ${jobTitle}`,
    //   template: 'job-application-notification',
    //   data: { applicantName, email, jobTitle, jobType }
    // });

    // TODO: Send confirmation email to applicant
    // await sendEmailNotification({
    //   to: email,
    //   subject: 'Application Received - Makao',
    //   template: 'application-confirmation',
    //   data: { applicantName, jobTitle }
    // });

    return NextResponse.json({
      success: true,
      message: 'Your application has been submitted successfully! We will review it and get back to you soon.',
      data: {
        id: jobApplication.id,
        created_at: jobApplication.created_at
      }
    });

  } catch (error) {
    console.error('Job application submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // This endpoint could be used by HR to retrieve job applications
    // For now, return available positions
    const availablePositions = [
      {
        id: 1,
        title: 'Senior Frontend Developer',
        type: 'full-time',
        location: 'remote',
        department: 'Engineering'
      },
      {
        id: 2,
        title: 'Product Manager',
        type: 'full-time',
        location: 'nairobi',
        department: 'Product'
      },
      {
        id: 3,
        title: 'Customer Success Manager',
        type: 'full-time',
        location: 'nairobi',
        department: 'Customer Success'
      },
      {
        id: 4,
        title: 'Marketing Intern',
        type: 'internship',
        location: 'remote',
        department: 'Marketing'
      }
    ];

    return NextResponse.json({
      positions: availablePositions
    });
  } catch (error) {
    console.error('Careers GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
