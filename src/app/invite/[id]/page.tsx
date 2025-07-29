'use client'

import { useUser } from '@/components/auth/src/hooks/useUser';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AcceptInvitationLayout({ params }: { params: { id: string } }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [invitation, setInvitation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const {data:user} = useUser();
    const router = useRouter();

    // Fetch invitation details using the id from params
    useEffect(() => {
        const fetchInvitation = async () => {
            setLoading(true);
            try {
                const res = await axios.post(
                  `${process.env.NEXT_PUBLIC_API_URI}/v1/invitation/search`,
                  {
                    invitation: {
                      code: {
                        eq: params.id,
                      },
                    },
                  },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${getCookie('jwt')}`,
                    },
                  },
                );
                if(res.data.invitations.length === 0) throw new Error();
                const teamId = res.data.invitations[0].team_id;
                const inviteResponse = await axios.get(
                  `${process.env.NEXT_PUBLIC_API_URI}/v1/team/${teamId}/invitation`,
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${getCookie('jwt')}`,
                    },
                  },
                );
                const inviteData = inviteResponse.data.invitations.find((d:any)=> d.code === params.id);
                const data = inviteData.invitees.find((invite:any)=>invite.user_id === user?.id)
                data.team = inviteData.team;
                data.team_id = teamId;
                setInvitation(data);
            } catch (e: any) {
                setError('Invitation not found or expired.');
            } finally {
                setLoading(false);
            }
        };

        if(!user?.id) return;
        fetchInvitation();
        // eslint-disable-next-line
    }, [params.id,user]);

    const handleAccept = async () => {
        setLoading(true);
        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URI}/v1/invitation/${invitation.id}`,
                { invitation: { invitation_code: params.id } },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getCookie('jwt')}`,
                    },
                }
            );
            toast({
                title: 'Invitation accepted',
                description: `You have joined ${invitation?.team_name || 'the team'}.`,
            });
            setTimeout(()=>{
                router.push(`/team/${invitation?.team_id}`);
            },2000);
        } catch (e: any) {
            toast({
                title: 'Error accepting invitation',
                description: e.response?.data?.detail || 'There was an error accepting the invitation.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        setLoading(true);
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URI}/v1/invitation/${params.id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getCookie('jwt')}`,
                    },
                }
            );
            toast({
                title: 'Invitation declined',
                description: `You have declined the invitation to join ${invitation?.team?.name || 'the team'}.`,
                variant: 'destructive',
            });
        } catch (e: any) {
            toast({
                title: 'Error declining invitation',
                description: e.response?.data?.detail || 'There was an error declining the invitation.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if ((loading && !invitation) || !user?.id ) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="text-lg">Loading invitation...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-destructive text-xl">
                {error}
            </div>
        );
    }

    

    return (
      <div className='flex items-center justify-center min-h-screen w-full'>
        <div className='max-w-xl w-full mx-auto p-10 rounded-2xl shadow-lg bg-card text-card-foreground flex flex-col gap-6 items-center'>
          {invitation?.status === 'pending' && (
            <>
              <h2 className='text-3xl font-bold mb-2'>Team Invitation</h2>
              <p className='mb-6 text-lg'>
                You have been invited to join{' '}
                <span className='font-semibold'>{getCookie('team') || invitation?.team?.name || 'a team'}</span>.
              </p>
              <div className='flex gap-8'>
                <Button variant='destructive' onClick={handleDecline} disabled={loading} className='px-8 py-3 text-lg'>
                  Decline
                </Button>
                <Button variant='default' onClick={handleAccept} disabled={loading} className='px-8 py-3 text-lg'>
                  Accept
                </Button>
              </div>
            </>
          )}
          {invitation?.status === 'accepted' && (
            <>
              <h2 className='text-3xl font-bold mb-2'>Invitation Already Accepted</h2>
              <p className='mb-6 text-lg'>
                You have already accepted the invitation to join{' '}
                <span className='font-semibold'>{getCookie('team') || invitation?.team?.name || 'the team'}</span>.
              </p>
            </>
          )}
        {invitation?.declined_at && (
            <div className="mt-6 text-center text-muted-foreground">
                <h3 className="text-2xl font-semibold mb-2">Invitation Declined</h3>
                <p>
                    You declined this invitation on{' '}
                    <span className="font-mono">
                        {new Date(invitation.declined_at).toLocaleString()}
                    </span>
                    .
                </p>
            </div>
        )}
        </div>
      </div>
    );
}