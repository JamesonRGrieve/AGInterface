'use client';

import { SidebarPage } from '@/appwrapper/SidebarPage';
import { useUser } from '@/auth/hooks/useUser';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useState } from 'react';
const requestTypes = [
  { value: 'bug', label: 'Report a Bug' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Issue' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

export default function SupportPage() {
  const { data: userData } = useUser();
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    user: '',
    platform: '',
    description: '',
    attachments: null as FileList | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      user: JSON.stringify(userData),
      platform: JSON.stringify(window.navigator.userAgent),
    };
    sendAsEmail(submissionData);
  };

  return (
    <SidebarPage title='Support' className='flex flex-col items-center justify-center'>
      <Alert>
        <AlertTitle>Early Access Software</AlertTitle>
        <AlertDescription>
          This is an early-access deployment of open-source software. You may encounter problems or &quot;bugs&quot;. If you
          do, please make note of your most recent actions and{' '}
          <Link
            className='text-info hover:underline'
            href='https://github.com/JamesonRGrieve/AGInteractive/issues/new?template=bug_report_prod.yml'
          >
            let us know by making a report here
          </Link>
          . Your understanding as we build towards the future is much appreciated.
        </AlertDescription>
      </Alert>

      <Card className='w-full max-w-lg border rounded-md'>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Support Request</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-1'>
              <Label htmlFor='type'>What type of support do you need?</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder='Select request type' />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type && (
              <>
                <div className='space-y-1'>
                  <Label htmlFor='subject'>Subject</Label>
                  <Input
                    id='subject'
                    placeholder='Brief description of the issue'
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea
                    id='description'
                    placeholder='Please provide detailed information about your request'
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                {/* TODO: Add support endpoint that supports images. Mailto can't pass attachments */}
                {/* <div>
                    <Label htmlFor='attachments'>Attachments (optional)</Label>
                    <Input
                      id='attachments'
                      type='file'
                      multiple
                      onChange={(e) => setFormData({ ...formData, attachments: e.target.files })}
                    />
                  </div> */}
              </>
            )}
          </CardContent>
          <CardFooter>
            {formData.type && (
              <Button type='submit' className='w-full m-auto'>
                Submit Request
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </SidebarPage>
  );
}

interface SubmissionData {
  type: string;
  subject: string;
  description: string;
  user: string;
  platform: string;
}

function sendAsEmail(submissionData: SubmissionData) {
  const tld = process.env.NEXT_PUBLIC_API_URI?.split('.').slice(-2).join('.') || 'example.com';
  const emailAddress = `support@${tld}`;

  // Format the email body
  const emailBody = `
Type: ${submissionData.type}
Subject: ${submissionData.subject}

Description:
${submissionData.description}

User Info:
${submissionData.user || 'Not logged in'}

Platform info:
${submissionData.platform}
  `.trim();

  // Create mailto URL
  const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(submissionData.subject)}&body=${encodeURIComponent(emailBody)}`;

  // Open the email client
  window.location.href = mailtoUrl;
}
