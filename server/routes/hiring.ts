import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { jobPostingSchema, jobApplicationSchema } from '../../shared/schema';

const router = express.Router();
const prisma = new PrismaClient() as any; // Temporary type assertion until Prisma client is regenerated

console.log('🔥🔥🔥 HIRING ROUTES FILE IS LOADED! 🔥🔥🔥');

// Helper function to get user and organization safely
const getUserAndOrg = (req: any) => {
  const user = req.user;
  const organizationId = user?.organizationId;
  if (!user || !organizationId) {
    throw new Error('User not authenticated or no organization');
  }
  return { user, organizationId };
};

// Generate unique public ID for job postings
const generatePublicId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get organization hiring settings
const getHiringSettings = async (organizationId: string) => {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true }
  });
  if (!organization?.settings) {
    return {
      enablePublicApplications: true,
      applicationDeadline: 30,
      requireResume: true,
      requireCoverLetter: false,
      allowMultipleApplications: false,
      autoRejectAfterDays: 90,
      emailNotifications: true,
      defaultApplicationStatus: 'pending'
    };
  }
  const settings = organization.settings as any;
  return settings.hiring || {
    enablePublicApplications: true,
    applicationDeadline: 30,
    requireResume: true,
    requireCoverLetter: false,
    allowMultipleApplications: false,
    autoRejectAfterDays: 90,
    emailNotifications: true,
    defaultApplicationStatus: 'pending'
  };
};

// GET /api/hiring/job-postings - Get all job postings for organization
router.get('/job-postings', async (req, res) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    const jobPostings = await prisma.jobPosting.findMany({
      where: { organizationId },
      include: {
        createdByUser: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const transformedJobPostings = jobPostings.map((job: any) => ({
      _id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      benefits: job.benefits,
      applicationDeadline: job.applicationDeadline?.toISOString(),
      status: job.status,
      isPublic: job.isPublic,
      publicId: job.publicId,
      views: job.views,
      applications: job.applications,
      createdBy: {
        firstName: job.createdByUser.firstName,
        lastName: job.createdByUser.lastName,
        email: job.createdByUser.email
      },
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString()
    }));
    
    res.json(transformedJobPostings);
  } catch (error) {
    console.error('Error fetching job postings:', error);
    res.status(500).json({ error: 'Failed to fetch job postings' });
  }
});

// POST /api/hiring/job-postings - Create new job posting
router.post('/job-postings', async (req, res) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    const publicId = generatePublicId();
    
    const jobPosting = await prisma.jobPosting.create({
      data: {
        organizationId,
        title: req.body.title,
        department: req.body.department,
        location: req.body.location,
        employmentType: req.body.employmentType,
        experienceLevel: req.body.experienceLevel,
        salary: req.body.salary,
        description: req.body.description,
        requirements: req.body.requirements,
        responsibilities: req.body.responsibilities,
        benefits: req.body.benefits,
        applicationDeadline: req.body.applicationDeadline ? new Date(req.body.applicationDeadline) : null,
        status: req.body.status || 'draft',
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
        publicId: publicId,
        createdBy: user.id,
        views: 0,
        applications: 0
      },
      include: {
        createdByUser: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });
    
    const response = {
      _id: jobPosting.id,
      title: jobPosting.title,
      department: jobPosting.department,
      location: jobPosting.location,
      employmentType: jobPosting.employmentType,
      experienceLevel: jobPosting.experienceLevel,
      salary: jobPosting.salary,
      description: jobPosting.description,
      requirements: jobPosting.requirements,
      responsibilities: jobPosting.responsibilities,
      benefits: jobPosting.benefits,
      applicationDeadline: jobPosting.applicationDeadline?.toISOString(),
      status: jobPosting.status,
      isPublic: jobPosting.isPublic,
      publicId: jobPosting.publicId,
      views: jobPosting.views,
      applications: jobPosting.applications,
      createdBy: {
        firstName: jobPosting.createdByUser.firstName,
        lastName: jobPosting.createdByUser.lastName,
        email: jobPosting.createdByUser.email
      },
      createdAt: jobPosting.createdAt.toISOString(),
      updatedAt: jobPosting.updatedAt.toISOString()
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating job posting:', error);
    res.status(500).json({ error: 'Failed to create job posting' });
  }
});

// GET /api/hiring/job-postings/:id - Get specific job posting
router.get('/job-postings/:id', async (req, res) => {
  try {
    const { organizationId } = getUserAndOrg(req);
    const { id } = req.params;
    
    const jobPosting = await prisma.jobPosting.findFirst({
      where: { id, organizationId },
      include: {
        createdByUser: {
          select: { firstName: true, lastName: true, email: true }
        },
        JobApplication: {
          include: {
            reviewedByUser: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    if (!jobPosting) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    res.json({
      _id: jobPosting.id,
      title: jobPosting.title,
      department: jobPosting.department,
      location: jobPosting.location,
      employmentType: jobPosting.employmentType,
      experienceLevel: jobPosting.experienceLevel,
      salary: jobPosting.salary,
      description: jobPosting.description,
      requirements: jobPosting.requirements,
      responsibilities: jobPosting.responsibilities,
      benefits: jobPosting.benefits,
      applicationDeadline: jobPosting.applicationDeadline,
      status: jobPosting.status,
      isPublic: jobPosting.isPublic,
      publicId: jobPosting.publicId,
      views: jobPosting.views,
      applications: jobPosting.JobApplication?.length || 0,
      createdBy: jobPosting.createdByUser,
      createdAt: jobPosting.createdAt,
      updatedAt: jobPosting.updatedAt
    });
  } catch (error) {
    console.error('Error fetching job posting:', error);
    res.status(500).json({ error: 'Failed to fetch job posting' });
  }
});

// PUT /api/hiring/job-postings/:id - Update job posting
router.put('/job-postings/:id', async (req, res) => {
  try {
    const { organizationId } = getUserAndOrg(req);
    const { id } = req.params;
    
    const validatedData = jobPostingSchema.partial().parse(req.body);
    
    const jobPosting = await prisma.jobPosting.findFirst({
      where: { id, organizationId }
    });

    if (!jobPosting) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    const updatedJobPosting = await prisma.jobPosting.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        createdByUser: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({
      _id: updatedJobPosting.id,
      title: updatedJobPosting.title,
      department: updatedJobPosting.department,
      location: updatedJobPosting.location,
      employmentType: updatedJobPosting.employmentType,
      experienceLevel: updatedJobPosting.experienceLevel,
      salary: updatedJobPosting.salary,
      description: updatedJobPosting.description,
      requirements: updatedJobPosting.requirements,
      responsibilities: updatedJobPosting.responsibilities,
      benefits: updatedJobPosting.benefits,
      applicationDeadline: updatedJobPosting.applicationDeadline,
      status: updatedJobPosting.status,
      isPublic: updatedJobPosting.isPublic,
      publicId: updatedJobPosting.publicId,
      views: updatedJobPosting.views,
      createdBy: updatedJobPosting.createdByUser,
      createdAt: updatedJobPosting.createdAt,
      updatedAt: updatedJobPosting.updatedAt
    });
  } catch (error) {
    console.error('Error updating job posting:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to update job posting' });
    }
  }
});

// DELETE /api/hiring/job-postings/:id - Delete job posting
router.delete('/job-postings/:id', async (req, res) => {
  try {
    const { organizationId } = getUserAndOrg(req);
    const { id } = req.params;
    
    const jobPosting = await prisma.jobPosting.findFirst({
      where: { id, organizationId }
    });

    if (!jobPosting) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    await prisma.jobPosting.delete({
      where: { id }
    });

    res.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    res.status(500).json({ error: 'Failed to delete job posting' });
  }
});

// GET /api/hiring/public/:publicId - Get public job posting
router.get('/public/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { publicId },
      include: {
        organization: {
          select: { name: true, settings: true }
        }
      }
    });

    if (!jobPosting || !jobPosting.isPublic) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    // Increment views
    await prisma.jobPosting.update({
      where: { id: jobPosting.id },
      data: { views: { increment: 1 } }
    });

    res.json({
      _id: jobPosting.id,
      title: jobPosting.title,
      department: jobPosting.department,
      location: jobPosting.location,
      employmentType: jobPosting.employmentType,
      experienceLevel: jobPosting.experienceLevel,
      salary: jobPosting.salary,
      description: jobPosting.description,
      requirements: jobPosting.requirements,
      responsibilities: jobPosting.responsibilities,
      benefits: jobPosting.benefits,
      applicationDeadline: jobPosting.applicationDeadline,
      organization: jobPosting.organization
    });
  } catch (error) {
    console.error('Error fetching public job posting:', error);
    res.status(500).json({ error: 'Failed to fetch job posting' });
  }
});

// POST /api/hiring/applications - Submit job application
router.post('/applications', async (req, res) => {
  try {
    const { publicId, ...applicationData } = req.body;
    
    // Get job posting by public ID
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { publicId },
      include: {
        organization: {
          select: { settings: true }
        }
      }
    });

    if (!jobPosting || !jobPosting.isPublic) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    // Get hiring settings
    const hiringSettings = await getHiringSettings(jobPosting.organizationId);
    
    if (!hiringSettings.enablePublicApplications) {
      return res.status(403).json({ error: 'Public applications are disabled' });
    }

    const validatedData = jobApplicationSchema.parse({
      ...applicationData,
      jobPostingId: jobPosting.id,
      organizationId: jobPosting.organizationId,
      status: hiringSettings.defaultApplicationStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const application = await prisma.jobApplication.create({
      data: {
        jobPostingId: jobPosting.id,
        organizationId: jobPosting.organizationId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        dateOfBirth: validatedData.dateOfBirth,
        gender: validatedData.gender,
        address: validatedData.address,
        currentPosition: validatedData.currentPosition,
        currentCompany: validatedData.currentCompany,
        experience: validatedData.experience,
        education: validatedData.education,
        skills: validatedData.skills,
        certifications: validatedData.certifications,
        languages: validatedData.languages,
        coverLetter: validatedData.coverLetter,
        expectedSalary: validatedData.expectedSalary,
        availability: validatedData.availability,
        resume: validatedData.resume,
        additionalDocuments: validatedData.additionalDocuments,
        status: validatedData.status,
        source: validatedData.source,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Increment application count
    await prisma.jobPosting.update({
      where: { id: jobPosting.id },
      data: { applications: { increment: 1 } }
    });

    res.status(201).json({
      _id: application.id,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }
});

// GET /api/hiring/applications - Get job applications for organization
router.get('/applications', async (req, res) => {
  try {
    console.log('👥 GET /api/hiring/applications called');
    const { jobPostingId, status } = req.query;
    
    // Return dummy data for now
    const dummyApplications = [
      {
        _id: 'app-001',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@email.com',
        phone: '+254-700-123-456',
        currentPosition: 'Software Developer',
        currentCompany: 'TechCorp Kenya',
        experience: 4,
        education: 'Bachelor\'s in Computer Science',
        status: 'shortlisted',
        jobPosting: {
          title: 'Senior Software Engineer',
          department: 'Engineering'
        },
        reviewedBy: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com'
        },
        reviewedAt: '2024-01-20T10:30:00.000Z',
        createdAt: '2024-01-18T14:20:00.000Z'
      },
      {
        _id: 'app-002',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@email.com',
        phone: '+254-700-234-567',
        currentPosition: 'Marketing Specialist',
        currentCompany: 'Digital Marketing Ltd',
        experience: 2,
        education: 'Bachelor\'s in Marketing',
        status: 'pending',
        jobPosting: {
          title: 'Marketing Manager',
          department: 'Marketing'
        },
        reviewedBy: null,
        reviewedAt: null,
        createdAt: '2024-01-22T09:15:00.000Z'
      },
      {
        _id: 'app-003',
        firstName: 'Carol',
        lastName: 'Williams',
        email: 'carol.williams@email.com',
        phone: '+254-700-345-678',
        currentPosition: 'Sales Associate',
        currentCompany: 'Retail Solutions',
        experience: 1,
        education: 'High School Diploma',
        status: 'interviewed',
        jobPosting: {
          title: 'Sales Representative',
          department: 'Sales'
        },
        reviewedBy: {
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@company.com'
        },
        reviewedAt: '2024-01-24T16:45:00.000Z',
        createdAt: '2024-01-19T11:30:00.000Z'
      },
      {
        _id: 'app-004',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@email.com',
        phone: '+254-700-456-789',
        currentPosition: 'Junior Developer',
        currentCompany: 'Startup Inc',
        experience: 1,
        education: 'Self-taught',
        status: 'rejected',
        jobPosting: {
          title: 'Senior Software Engineer',
          department: 'Engineering'
        },
        reviewedBy: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com'
        },
        reviewedAt: '2024-01-21T13:20:00.000Z',
        createdAt: '2024-01-17T15:45:00.000Z'
      }
    ];

    // Filter by jobPostingId if provided
    let filteredApplications = dummyApplications;
    if (jobPostingId) {
      filteredApplications = dummyApplications.filter(app => 
        app.jobPosting.title === 'Senior Software Engineer' // Simple filter for demo
      );
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      filteredApplications = filteredApplications.filter(app => 
        app.status === status
      );
    }

    console.log('📄 Returning dummy applications:', filteredApplications.length, 'items');
    res.json(filteredApplications);
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// PUT /api/hiring/applications/:id - Update application status
router.put('/applications/:id', async (req, res) => {
  try {
    const { organizationId } = getUserAndOrg(req);
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    
    const application = await prisma.jobApplication.findFirst({
      where: { id, organizationId }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        reviewedBy: req.user?.id,
        reviewedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        jobPosting: {
          select: { title: true, department: true }
        },
        reviewedByUser: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({
      _id: updatedApplication.id,
      status: updatedApplication.status,
      reviewNotes: updatedApplication.reviewNotes,
      reviewedBy: updatedApplication.reviewedByUser,
      reviewedAt: updatedApplication.reviewedAt
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Test endpoint to verify hiring routes are working
router.get('/test', (req, res) => {
  console.log('🧪 GET /api/hiring/test - Hiring routes are working!');
  res.json({ 
    message: 'Hiring routes are working correctly',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/hiring/job-postings',
      'POST /api/hiring/job-postings', 
      'GET /api/hiring/applications',
      'PUT /api/hiring/applications/:id',
      'GET /api/hiring/test'
    ]
  });
});

// POST /api/hiring/job-postings/sample - Create sample job postings
router.post('/job-postings/sample', async (req, res) => {
  try {
    const { user, organizationId } = getUserAndOrg(req);
    
    const sampleJobPostings = [
      {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Nairobi, Kenya',
        employmentType: 'full-time',
        experienceLevel: 'senior',
        salary: { min: 80000, max: 120000, currency: 'USD', isNegotiable: true },
        description: 'We are looking for a Senior Software Engineer to join our growing team.',
        requirements: {
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript'],
          experience: 5,
          education: 'Bachelor\'s degree in Computer Science or related field',
          certifications: ['AWS Certified Developer'],
          languages: ['English', 'Swahili']
        },
        responsibilities: [
          'Design and implement scalable software solutions',
          'Collaborate with cross-functional teams',
          'Mentor junior developers',
          'Participate in code reviews'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Flexible working hours',
          'Professional development budget'
        ],
        applicationDeadline: new Date('2024-03-31T23:59:59.000Z'),
        status: 'published',
        isPublic: true
      },
      {
        title: 'Marketing Manager',
        department: 'Marketing',
        location: 'Remote',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        salary: { min: 60000, max: 80000, currency: 'USD', isNegotiable: true },
        description: 'Join our marketing team as a Marketing Manager.',
        requirements: {
          skills: ['Digital Marketing', 'Social Media', 'Content Creation', 'Analytics'],
          experience: 3,
          education: 'Bachelor\'s degree in Marketing or related field',
          certifications: ['Google Ads Certification'],
          languages: ['English']
        },
        responsibilities: [
          'Develop marketing campaigns',
          'Manage social media presence',
          'Analyze marketing performance',
          'Collaborate with creative teams'
        ],
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Remote work options',
          'Performance bonuses'
        ],
        applicationDeadline: new Date('2024-04-15T23:59:59.000Z'),
        status: 'published',
        isPublic: true
      }
    ];
    
    const createdJobPostings = [];
    
    for (const sampleData of sampleJobPostings) {
      const publicId = generatePublicId();
      
      const jobPosting = await prisma.jobPosting.create({
        data: {
          organizationId,
          title: sampleData.title,
          department: sampleData.department,
          location: sampleData.location,
          employmentType: sampleData.employmentType,
          experienceLevel: sampleData.experienceLevel,
          salary: sampleData.salary,
          description: sampleData.description,
          requirements: sampleData.requirements,
          responsibilities: sampleData.responsibilities,
          benefits: sampleData.benefits,
          applicationDeadline: sampleData.applicationDeadline,
          status: sampleData.status,
          isPublic: sampleData.isPublic,
          publicId: publicId,
          createdBy: user.id,
          views: 0,
          applications: 0
        },
        include: {
          createdByUser: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      });
      
      createdJobPostings.push({
        _id: jobPosting.id,
        title: jobPosting.title,
        department: jobPosting.department,
        location: jobPosting.location,
        employmentType: jobPosting.employmentType,
        experienceLevel: jobPosting.experienceLevel,
        salary: jobPosting.salary,
        description: jobPosting.description,
        requirements: jobPosting.requirements,
        responsibilities: jobPosting.responsibilities,
        benefits: jobPosting.benefits,
        applicationDeadline: jobPosting.applicationDeadline?.toISOString(),
        status: jobPosting.status,
        isPublic: jobPosting.isPublic,
        publicId: jobPosting.publicId,
        views: jobPosting.views,
        applications: jobPosting.applications,
        createdBy: {
          firstName: jobPosting.createdByUser.firstName,
          lastName: jobPosting.createdByUser.lastName,
          email: jobPosting.createdByUser.email
        },
        createdAt: jobPosting.createdAt.toISOString(),
        updatedAt: jobPosting.updatedAt.toISOString()
      });
    }
    
    res.status(201).json({
      message: `Created ${createdJobPostings.length} sample job postings`,
      jobPostings: createdJobPostings
    });
  } catch (error) {
    console.error('Error creating sample job postings:', error);
    res.status(500).json({ error: 'Failed to create sample job postings' });
  }
});

export default router;
