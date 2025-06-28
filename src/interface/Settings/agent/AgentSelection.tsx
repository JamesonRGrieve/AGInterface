'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeams, useTeam } from '@/components/auth/src/hooks/useTeam';
import { useAgents, useAgent } from '@/interface/hooks/useAgent';
import { Team } from '@/components/auth/src/hooks/z';
import { Agent } from '@/interface/hooks/z';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';

export function AgentTeamSelection() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);

  return (
    <>
      <TeamSelection
        selectedTeamId={selectedTeamId}
        setSelectedTeamId={setSelectedTeamId}
        setSelectedAgentId={setSelectedAgentId}
      />
      <AgentSelection
        selectedTeamId={selectedTeamId}
        selectedAgentId={selectedAgentId}
        setSelectedAgentId={setSelectedAgentId}
      />
    </>
  );
}

export function TeamSelection({
  selectedTeamId,
  setSelectedTeamId,
  setSelectedAgentId,
}: {
  selectedTeamId: string | undefined;
  setSelectedTeamId: (id: string) => void;
  setSelectedAgentId: (id: string | undefined) => void;
}) {
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: activeTeam } = useTeam();

  useEffect(() => {
    if (!selectedTeamId && activeTeam?.id) {
      setSelectedTeamId(activeTeam.id);
    }
  }, [activeTeam, selectedTeamId, setSelectedTeamId]);

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedAgentId(undefined);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Teams</SidebarGroupLabel>
      <Select value={selectedTeamId} onValueChange={handleTeamChange} disabled={teamsLoading}>
        <SelectTrigger>
          <SelectValue placeholder='- Personal Agents -' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {(teams || []).map((team: Team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </SidebarGroup>
  );
}

export function AgentSelection({
  selectedTeamId,
  selectedAgentId,
  setSelectedAgentId,
}: {
  selectedTeamId: string | undefined;
  selectedAgentId: string | undefined;
  setSelectedAgentId: (id: string) => void;
}) {
  const { data: agents, isLoading: agentsLoading } = useAgents();
  const { data: activeAgent } = useAgent();

  useEffect(() => {
    if (!selectedAgentId && activeAgent?.id) {
      setSelectedAgentId(activeAgent.id);
    }
  }, [activeAgent, selectedAgentId, setSelectedAgentId]);

  const filteredAgents = selectedTeamId ? (agents || []).filter((agent) => agent.teamId === selectedTeamId) : [];

  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Agents</SidebarGroupLabel>
      <Select value={selectedAgentId} onValueChange={handleAgentChange} disabled={agentsLoading || !selectedTeamId}>
        <SelectTrigger>
          <SelectValue placeholder='Select an Agent' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {filteredAgents && filteredAgents.length > 0 ? (
              filteredAgents.map((agent: Agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value='no_agents' disabled>
                No agents available
              </SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </SidebarGroup>
  );
}
