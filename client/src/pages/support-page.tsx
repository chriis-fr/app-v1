import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompactSidebar from '@/components/layout/CompactSidebar';
import {
  MessageSquare,
  BookOpen,
  Video,
  FileText,
  Mail,
  Phone,
  Globe,
  Github,
  Twitter,
  Linkedin,
  HelpCircle,
  Search,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  Users,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { useRoleAccess } from '@/hooks/use-role-access';

const faqCategories = [
  {
    id: 'general',
    name: 'General',
    icon: HelpCircle,
    questions: [
      {
        question: 'What is Chains?',
        answer: 'Chains is a comprehensive B2B SaaS platform that integrates blockchain technology for secure business operations, financial management, and supply chain tracking.'
      },
      {
        question: 'How do I get started?',
        answer: 'To get started, create an account, set up your organization profile, and choose the modules that best suit your business needs. Our onboarding wizard will guide you through the process.'
      },
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept various payment methods including credit cards, bank transfers, and cryptocurrency payments through our integrated blockchain wallet system.'
      }
    ]
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: FileText,
    questions: [
      {
        question: 'How do I set up my chart of accounts?',
        answer: 'Navigate to the Accounting module, select "Chart of Accounts" from the menu, and use our guided setup wizard to configure your accounts according to your business needs.'
      },
      {
        question: 'Can I import data from other accounting software?',
        answer: 'Yes, we support importing data from popular accounting software like QuickBooks, Xero, and SAP. Use our data import tool in the Accounting module settings.'
      }
    ]
  },
  {
    id: 'blockchain',
    name: 'Blockchain',
    icon: Globe,
    questions: [
      {
        question: 'How secure is the blockchain integration?',
        answer: 'Our blockchain integration uses industry-standard encryption and security protocols. All transactions are verified and recorded on the blockchain, ensuring transparency and immutability.'
      },
      {
        question: 'Which cryptocurrencies are supported?',
        answer: 'We currently support major cryptocurrencies including Bitcoin, Ethereum, and stablecoins. More cryptocurrencies will be added based on user demand.'
      }
    ]
  }
];

const supportChannels = [
  {
    id: 'email',
    name: 'Email Support',
    description: 'Get in touch with our support team via email',
    icon: Mail,
    contact: 'support@chains.com',
    responseTime: 'Within 24 hours',
    hours: '24/7'
  },
  {
    id: 'phone',
    name: 'Phone Support',
    description: 'Speak directly with our support team',
    icon: Phone,
    contact: '+1 (555) 123-4567',
    responseTime: 'Mon-Fri, 9am-5pm EST',
    hours: 'Mon-Fri, 9am-5pm EST'
  },
  {
    id: 'chat',
    name: 'Live Chat',
    description: 'Chat with our support team in real-time',
    icon: MessageSquare,
    contact: 'Available 24/7',
    responseTime: 'Instant',
    hours: '24/7'
  }
];

const resources = [
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Comprehensive guides and API documentation',
    icon: BookOpen,
    link: '/docs'
  },
  {
    id: 'tutorials',
    name: 'Video Tutorials',
    description: 'Step-by-step video guides',
    icon: Video,
    link: '/tutorials'
  },
  {
    id: 'api',
    name: 'API Reference',
    description: 'Technical documentation for developers',
    icon: FileText,
    link: '/api-docs'
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    description: 'Searchable articles and guides',
    icon: HelpCircle,
    link: '/kb'
  },
  {
    id: 'community',
    name: 'Community Forum',
    description: 'Connect with other users',
    icon: Users,
    link: '/community'
  },
  {
    id: 'status',
    name: 'System Status',
    description: 'Check system health and uptime',
    icon: Activity,
    link: '/status'
  }
];

export default function SupportPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackPriority, setFeedbackPriority] = useState('medium');
  const { canAccessCompactSidebar } = useRoleAccess();

  const handleSubmitSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Support ticket submitted successfully!');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle feedback submission
    alert('Feedback submitted successfully!');
  };

  return (
    <div className="flex">
      {canAccessCompactSidebar() && <CompactSidebar />}
      <div className={`flex-1 ${canAccessCompactSidebar() ? 'ml-20' : ''} p-8`}>
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => setLocation('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Support Center</h1>
            <p className="text-muted-foreground">
              Get help with Chains and find answers to your questions
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="help">Help & Resources</TabsTrigger>
              <TabsTrigger value="contact">Contact Support</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="help" className="space-y-6">
              {/* Quick Links */}
              <div className="grid gap-4 md:grid-cols-3">
                {resources.map((resource) => (
                  <Card
                    key={resource.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setLocation(resource.link)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <resource.icon className="h-5 w-5" />
                        <CardTitle>{resource.name}</CardTitle>
                      </div>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full">
                        View Resource
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Getting Started Guide */}
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started with Chains</CardTitle>
                  <CardDescription>
                    Follow these steps to set up your account and start using Chains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      'Create your organization profile',
                      'Set up your blockchain wallet',
                      'Configure your accounting preferences',
                      'Invite team members',
                      'Start using the modules'
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              {/* Support Channels */}
              <div className="grid gap-4 md:grid-cols-3">
                {supportChannels.map((channel) => (
                  <Card key={channel.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <channel.icon className="h-5 w-5" />
                        <CardTitle>{channel.name}</CardTitle>
                      </div>
                      <CardDescription>{channel.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium mb-1">{channel.contact}</p>
                      <p className="text-sm text-muted-foreground">
                        Response time: {channel.responseTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Available: {channel.hours}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Support Ticket Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Ticket</CardTitle>
                  <CardDescription>
                    Fill out the form below and our team will get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitSupportTicket} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input placeholder="Your name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <Input placeholder="Brief description of your issue" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        placeholder="Please provide details about your issue..."
                        className="min-h-[150px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Attachments</label>
                      <Input type="file" multiple />
                    </div>
                    <Button type="submit" className="w-full">
                      Submit Ticket
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              {faqCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-5 w-5" />
                      <CardTitle>{category.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.questions.map((faq, index) => (
                        <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                          <h3 className="font-medium mb-2">{faq.question}</h3>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Feedback</CardTitle>
                  <CardDescription>
                    Help us improve Chains by sharing your thoughts and suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Feedback Type</label>
                      <select
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                        value={feedbackType}
                        onChange={(e) => setFeedbackType(e.target.value)}
                      >
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="improvement">Improvement Suggestion</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <select
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                        value={feedbackPriority}
                        onChange={(e) => setFeedbackPriority(e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Please describe your feedback in detail..."
                        className="min-h-[150px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Screenshots (optional)</label>
                      <Input type="file" accept="image/*" multiple />
                    </div>
                    <Button type="submit" className="w-full">
                      Submit Feedback
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Social Links */}
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-xl font-semibold mb-4">Connect With Us</h2>
            <div className="flex gap-4">
              <Button variant="outline" size="icon">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 