import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function PublicJobApplication() {
  const { publicId } = useParams<{ publicId: string }>();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/hiring/public/job/${publicId}`)
      .then(res => res.ok ? res.json() : Promise.reject('Not found'))
      .then(setJob)
      .catch(() => setError('Job not found'))
      .finally(() => setLoading(false));
  }, [publicId]);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('publicId', publicId);
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('coverLetter', form.coverLetter);
      if (form.resume) formData.append('resume', form.resume);
      const res = await fetch('/api/hiring/public/apply', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-64 text-red-600">{error}</div>;
  if (!job) return null;
  if (submitted) return <div className="flex flex-col items-center justify-center h-64"><h2 className="text-2xl font-bold mb-2">Application Submitted!</h2><p>Thank you for applying to <span className="font-semibold">{job.title}</span>.</p></div>;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge>{job.department}</Badge>
            <Badge>{job.location}</Badge>
            <Badge>{job.employmentType}</Badge>
            <Badge>{job.experienceLevel}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="mb-2">{job.description}</p>
            <h3 className="font-semibold mb-1">Requirements</h3>
            <ul className="list-disc ml-6 mb-2">
              {job.requirements?.skills?.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
            <h3 className="font-semibold mb-1">Responsibilities</h3>
            <ul className="list-disc ml-6 mb-2">
              {job.responsibilities?.map((r: string, i: number) => <li key={i}>{r}</li>)}
            </ul>
            <h3 className="font-semibold mb-1">Benefits</h3>
            <ul className="list-disc ml-6 mb-2">
              {job.benefits?.map((b: string, i: number) => <li key={i}>{b}</li>)}
            </ul>
            <div className="text-sm text-muted-foreground mt-2">Application Deadline: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'N/A'}</div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label>Cover Letter</Label>
              <Textarea name="coverLetter" value={form.coverLetter} onChange={handleChange} rows={4} />
            </div>
            <div>
              <Label>Resume (PDF, DOCX)</Label>
              <Input name="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleChange} />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 