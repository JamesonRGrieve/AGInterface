'use client'

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { useState, useEffect } from 'react';

export default function AcceptInvitationLayout({ params }: { params: { id: string } }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [invitation, setInvitation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch invitation details using the id from params
    useEffect(() => {
        const fetchInvitation = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URI}/v1/invitation/${params.id}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${getCookie('jwt')}`,
                        },
                    }
                );
                setInvitation(res.data);
            } catch (e: any) {
                setError('Invitation not found or expired.');
            } finally {
                setLoading(false);
            }
        };
        fetchInvitation();
        // eslint-disable-next-line
    }, [params.id]);

    const handleAccept = async () => {
        setLoading(true);
        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URI}/v1/invitation/${params.id}`,
                { invitation: { invitation_code: invitation?.invitation_code } },
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

    if (loading && !invitation) {
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
        <div className="flex items-center justify-center min-h-screen w-full">
            <div className="max-w-xl w-full mx-auto p-10 rounded-2xl shadow-lg bg-card text-card-foreground flex flex-col gap-6 items-center">
                <h2 className="text-3xl font-bold mb-2">Team Invitation</h2>
                <p className="mb-6 text-lg">
                    You have been invited to join{' '}
                    <span className="font-semibold">{invitation?.team?.name || 'a team'}</span>.
                </p>
                <div className="flex gap-8">
                     <Button
                        variant="destructive"
                        onClick={handleDecline}
                        disabled={loading}
                        className="px-8 py-3 text-lg"
                    >
                        Decline
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleAccept}
                        disabled={loading}
                        className="px-8 py-3 text-lg"
                    >
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    )
}