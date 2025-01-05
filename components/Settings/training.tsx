'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getCookie } from 'cookies-next';
import { LuTrash2 as Trash2, LuBrain as Brain, LuUpload as Upload } from 'react-icons/lu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LuFile, LuMessageSquare, LuLink, LuMic, LuImage, LuThumbsUp, LuNewspaper, LuYoutube } from 'react-icons/lu';
import { usePathname } from 'next/navigation';
import { useActiveCompany } from '../hooks';

interface SourceDisplayProps {
  source: string;
  onDelete: (source: string) => void;
}

const getSourceInfo = (
  source: string,
): {
  icon: React.ComponentType;
  label: string;
  description: string;
} => {
  if (source.startsWith('file ')) {
    const fileName = source.split('/').pop() || source;
    return {
      icon: LuFile,
      label: fileName,
      description: 'Uploaded file',
    };
  }
  if (source.startsWith('user input')) {
    return {
      icon: LuMessageSquare,
      label: 'User Conversation',
      description: 'Saved chat engagement',
    };
  }
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return {
      icon: LuLink,
      label: new URL(source).hostname,
      description: 'Web resource',
    };
  }
  if (source.startsWith('audio')) {
    return {
      icon: LuMic,
      label: 'Audio Transcript',
      description: source.replace('audio ', ''),
    };
  }
  if (source.startsWith('image')) {
    return {
      icon: LuImage,
      label: 'Image Description',
      description: source.replace('image ', ''),
    };
  }
  if (source.startsWith('reflection from feedback')) {
    return {
      icon: LuThumbsUp,
      label: 'AI Reflection',
      description: source.replace('reflection from feedback ', ''),
    };
  }
  if (source.startsWith('From arXiv article:')) {
    return {
      icon: LuNewspaper,
      label: 'arXiv Article',
      description: source.replace('From arXiv article: ', ''),
    };
  }
  if (source.startsWith('From YouTube video:')) {
    return {
      icon: LuYoutube,
      label: 'YouTube Transcript',
      description: source.replace('From YouTube video: ', ''),
    };
  }

  // Default case
  return {
    icon: LuFile,
    label: source,
    description: 'External source',
  };
};

const SourceDisplay: React.FC<SourceDisplayProps> = ({ source, onDelete }) => {
  const { icon: Icon, label, description } = getSourceInfo(source);

  return (
    <div className='flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors'>
      <div className='flex items-center flex-1 min-w-0 gap-3'>
        <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-muted'>
          <Icon className='w-4 h-4' />
        </div>
        <div className='flex-1 min-w-0'>
          <h4 className='font-medium truncate'>{label}</h4>
          <p className='text-sm text-muted-foreground truncate'>{description}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon'>
            <Trash2 className='w-4 h-4 text-destructive' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem className='text-destructive' onClick={() => onDelete(source)}>
            Confirm Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const COLLECTION_NUMBER = '0';
const DEFAULT_AGENT = 'XT';

interface AutoResizeTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}

export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <div tabIndex={-1}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='min-h-[200px] resize-none overflow-hidden'
      />
    </div>
  );
};

const Training = (): React.ReactElement => {
  const pathname = usePathname();
  const { data: company } = useActiveCompany();
  const [userPersona, setUserPersona] = useState<string>('');
  const [companyPersona, setCompanyPersona] = useState<string>('');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userExternalSources, setUserExternalSources] = useState<string[]>([]);
  const [companyExternalSources, setCompanyExternalSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const apiKey = getCookie('jwt') || '';
  const apiServer = process.env.NEXT_PUBLIC_AGIXT_SERVER as string;
  const agentName = getCookie('agixt-agent') || process.env.NEXT_PUBLIC_AGIXT_AGENT || DEFAULT_AGENT;

  useEffect(() => {
    if (getCookie('agixt-company-id') || !pathname.includes('company')) {
      fetchCompanyData();
    }
  }, [getCookie('agixt-company-id'), !pathname.includes('company')]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const url = !pathname.includes('company')
        ? `${apiServer}/api/agent/${agentName}/persona`
        : `${apiServer}/api/agent/${agentName}/persona/${getCookie('agixt-company-id')}`;

      const personaResponse = await fetch(url, {
        headers: { Authorization: apiKey },
      });

      if (personaResponse.ok) {
        const personaData = await personaResponse.json();
        if (!pathname.includes('company')) {
          setUserPersona(personaData.message === 'None' ? '' : personaData.message || '');
        } else {
          setCompanyPersona(personaData.message === 'None' ? '' : personaData.message || '');
        }
      }

      const sourcesUrl = !pathname.includes('company')
        ? `${apiServer}/api/agent/${agentName}/memory/external_sources/${COLLECTION_NUMBER}`
        : `${apiServer}/api/agent/${agentName}/memory/external_sources/${COLLECTION_NUMBER}/${getCookie('agixt-company-id')}`;

      const sourcesResponse = await fetch(sourcesUrl, {
        headers: { Authorization: apiKey },
      });

      if (sourcesResponse.ok) {
        const sourcesData = await sourcesResponse.json();
        const sources = sourcesData['external_sources'] || [];
        if (!pathname.includes('company')) {
          setUserExternalSources(Array.isArray(sources) ? sources : []);
        } else {
          setCompanyExternalSources(Array.isArray(sources) ? sources : []);
        }
      }
    } catch (err) {
      setError('Failed to fetch training data');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaUpdate = async () => {
    try {
      const response = await fetch(
        !pathname.includes('company')
          ? `${apiServer}/api/agent/${agentName}/persona`
          : `${apiServer}/api/agent/${agentName}/persona/${getCookie('agixt-company-id')}`,
        {
          method: 'PUT',
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            persona: !pathname.includes('company') ? userPersona : companyPersona,
            company_id: !pathname.includes('company') ? null : getCookie('agixt-company-id'),
            user: !pathname.includes('company'),
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update persona');
      }
      setSuccess(`Successfully updated ${!pathname.includes('company') ? 'user' : 'company'} mandatory context`);
      await fetchCompanyData();
    } catch (err) {
      setError('Failed to update persona');
    }
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocument(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    try {
      const fileString = await file.text();
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(
        !pathname.includes('company')
          ? `${apiServer}/api/agent/${agentName}/learn/file`
          : `${apiServer}/api/agent/${agentName}/learn/file/${getCookie('agixt-company-id')}`,

        {
          method: 'POST',
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_name: file.name,
            file_content: fileString,
            collection_number: COLLECTION_NUMBER,
            company_id: !pathname.includes('company') ? null : getCookie('agixt-company-id'),
          }),
        },
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setUploadProgress(100);
      setSuccess(`Successfully uploaded ${file.name}`);
      await fetchCompanyData();
    } catch (error) {
      setError('Error uploading file');
    } finally {
      setUploadingDocument(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDeleteDocument = async (source: string) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`${apiServer}/api/agent/${agentName}/memories/external_source`, {
        method: 'DELETE',
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_source: source,
          collection_number: COLLECTION_NUMBER,
          company_id: !pathname.includes('company') ? null : getCookie('agixt-company-id'),
        }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setSuccess(`Successfully deleted ${source}`);
      await fetchCompanyData();
    } catch (error) {
      setError('Failed to delete document');
    }
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Brain className='w-5 h-5' />
            {!pathname.includes('company') ? 'Agent Training' : (company?.name ?? 'Company') + ' Agent Training'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Status Messages */}
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Mandatory Context Section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Mandatory Context</h3>
            <p className='text-sm text-muted-foreground mt-2'>
              This is like setting personality traits or preferences that the AI should always remember. It's automatically
              included in every conversation, helping the AI maintain consistency. For example, you might want to specify
              language preferences, areas of expertise, or communication style.
            </p>
            <AutoResizeTextarea
              value={!pathname.includes('company') ? userPersona : companyPersona}
              onChange={(e) =>
                !pathname.includes('company') ? setUserPersona(e.target.value) : setCompanyPersona(e.target.value)
              }
              placeholder={`Enter mandatory context for the AI to always have during all interactions for this ${
                !pathname.includes('company') ? 'user' : 'company'
              }...`}
            />
            <Button
              type='button'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePersonaUpdate();
              }}
              className='w-full'
            >
              Update Mandatory Context
            </Button>
          </div>

          {/* Document Upload Section */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Training Documents</h3>
            <p className='text-sm text-muted-foreground mt-2'>
              Upload documents that contain knowledge you want the AI to learn from. The AI will intelligently reference
              these documents during conversations when relevant, enhancing its responses with specific information from your
              uploads. This is great for teaching the AI about your projects, policies, or any specific knowledge base.
            </p>

            {/* Upload Interface */}
            <div className='flex items-center gap-4'>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploadingDocument}
              >
                <Upload className='w-4 h-4 mr-2' />
                Upload Document
              </Button>
              <input
                id='file-upload'
                type='file'
                className='hidden'
                onChange={handleUploadDocument}
                accept='.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.md,.jpg,.jpeg,.png,.gif'
                disabled={uploadingDocument}
              />
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm text-muted-foreground'>
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className='h-2' />
              </div>
            )}

            {/* Documents List */}
            <div className='space-y-2'>
              {loading ? (
                <div className='text-center text-muted-foreground'>Loading documents...</div>
              ) : (!pathname.includes('company') ? userExternalSources : companyExternalSources).length === 0 ? (
                <div className='text-center text-muted-foreground'>No documents uploaded yet</div>
              ) : (
                <div className='grid gap-2'>
                  {(!pathname.includes('company') ? userExternalSources : companyExternalSources).map((source) => (
                    <SourceDisplay key={source} source={source} onDelete={handleDeleteDocument} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Training;
