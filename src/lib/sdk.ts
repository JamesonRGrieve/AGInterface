import axios, { AxiosRequestConfig } from 'axios';

type Conversation = {
  id: string;
  name: string;
  has_notifications: boolean;
  createdAt: string;
  updated_at: string;
};

export default class AGInterfaceSDK {
  private baseUri: string;
  private headers: AxiosRequestConfig['headers'];

  constructor(config: { baseUri: string; apiKey?: string }) {
    this.baseUri = config.baseUri?.endsWith('/') ? config.baseUri.slice(0, -1) : config.baseUri || 'http://localhost:7437';
    this.headers = config.apiKey
      ? {
          Authorization: `Bearer ${config.apiKey.replace('Bearer ', '')}`,
          'Content-Type': 'application/json',
        }
      : { 'Content-Type': 'application/json' };
  }

  private async request<T>(method: string, endpoint: string, data?: any, params?: any): Promise<T> {
    try {
      const response = await axios.request<T>({
        method,
        url: `${this.baseUri}${endpoint}`,
        data,
        params,
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      return `Error: ${error}` as T;
    }
  }

  // Provider Methods
  async getProviders() {
    return this.request<{ providers: string[] }>('get', '/api/provider').then((r) => r.providers);
  }

  async getProvidersByService(service: string) {
    return this.request<{ providers: string[] }>('get', `/api/providers/service/${service}`).then((r) => r.providers);
  }

  async getAllProviders() {
    return this.request<{ providers: any[] }>('get', '/v1/providers').then((r) => r.providers);
  }

  async getProviderSettings(providerName: string) {
    return this.request<{ settings: any }>('get', `/api/provider/${providerName}`).then((r) => r.settings);
  }

  async getEmbedProviders() {
    return this.request<{ providers: string[] }>('get', '/api/embedding_providers').then((r) => r.providers);
  }

  // Agent Methods
  async addAgent(agentName: string, settings: any = {}) {
    return this.request('post', '/api/agent', { agent_name: agentName, settings }).then((r) => r);
  }

  async importAgent(agentName: string, settings: any = {}, commands: any = {}) {
    return this.request('post', '/api/agent/import', { agent_name: agentName, settings, commands });
  }

  async renameAgent(agentName: string, newName: string) {
    return this.request('patch', `/api/agent/${agentName}`, { new_name: newName });
  }

  async updateAgentSettings(agentName: string, settings: any) {
    return this.request<{ message: string }>('put', `/api/agent/${agentName}`, { settings, agent_name: agentName }).then(
      (r) => r.message,
    );
  }

  async updateAgentCommands(agentName: string, commands: any) {
    return this.request<{ message: string }>('put', `/api/agent/${agentName}/commands`, {
      commands,
      agent_name: agentName,
    }).then((r) => r.message);
  }

  async deleteAgent(agentName: string) {
    return this.request<{ message: string }>('delete', `/api/agent/${agentName}`).then((r) => r.message);
  }

  async getAgents() {
    return this.request<{ agents: any[] }>('get', '/api/agent').then((r) => r.agents);
  }

  async getAgentConfig(agentName: string) {
    return this.request<{ agent: any }>('get', `/api/agent/${agentName}`).then((r) => r.agent);
  }

  // Conversation Methods
  async getConversations(objects = false, agentName?: string) {
    const url = objects ? '/v1/conversations' : agentName ? `/api/${agentName}/conversations` : '/api/conversations';
    return this.request<{ conversations: any[] }>('get', url).then((r) => r.conversations);
  }

  async addConversationFeedback(
    positive: boolean,
    agentName: string,
    message: string,
    userInput: string,
    feedback: string,
    conversationName: string,
  ) {
    return this.request<{ message: string }>('post', `/api/agent/${agentName}/feedback`, {
      positive,
      feedback,
      message,
      user_input: userInput,
      conversation_name: conversationName,
    }).then((r) => r.message);
  }

  async getConversation(conversationName = '', conversationId = '', limit = 100, page = 1, agentName?: string) {
    if (!conversationName && !conversationId) throw new Error('Must define either conversationName or conversationId.');
    if (conversationId && conversationName) throw new Error('Must define conversationName or conversationId, not both.');

    const url = conversationId ? `/v1/conversation/${conversationId}` : '/api/conversation/${conversationName}';
    const params = conversationId ? { limit, page } : { agent_name: agentName, limit, page };

    return this.request<{ conversation_history: any }>('get', url, null, params).then((r) => r.conversation_history);
  }

  async renameConversation(agentName: string, conversationName: string, newName = '-') {
    return this.request<{ conversation_name: string }>('put', '/api/conversation', {
      conversation_name: conversationName,
      new_conversation_name: newName,
      agent_name: agentName,
    }).then((r) => r.conversation_name);
  }

  async forkConversation(conversationName: string, messageId: string) {
    return this.request<{ message: string }>('post', '/api/conversation/fork', {
      conversation_name: conversationName,
      message_id: messageId,
    }).then((r) => r.message);
  }

  async newConversation(agentName: string, conversationName: string, conversationContent: any[] = []) {
    return this.request<{ conversation_history: any[] }>('post', '/api/conversation', {
      conversation_name: conversationName,
      agent_name: agentName,
      conversation_content: conversationContent,
    }).then((r) => r.conversation_history);
  }

  async deleteConversation(conversationName: string, agentName?: string) {
    return this.request<{ message: string }>('delete', '/v1/conversation/' + conversationName).then((r) => r.message);
  }

  // Message Methods
  async updateConversationMessage(conversationName: string, messageId: string, newMessage: string) {
    return this.request<{ message: string }>('put', `/v1/conversation/message/${messageId}`, {
      conversation_name: conversationName,
      new_message: newMessage,
      message_id: messageId,
    }).then((r) => r.message);
  }

  async deleteConversationMessage(conversationName: string, messageId: string) {
    return this.request<{ message: string }>('delete', `/v1/conversation/message/${messageId}`).then((r) => r.message);
  }

  // Memory Methods
  async importAgentMemories(agentName: string, memories: any[]) {
    return this.request<{ message: string }>('post', `/api/agent/${agentName}/memory/import`, {
      memories,
    }).then((r) => r.message);
  }

  async exportAgentMemories(agentName: string) {
    return this.request<{ memories: any }>('get', `/api/agent/${agentName}/memory/export`).then((r) => r.memories);
  }

  async wipeAgentMemories(agentName: string, collectionNumber = '0') {
    return this.request<{ message: string }>('delete', `/api/agent/${agentName}/memory/${collectionNumber}`).then(
      (r) => r.message,
    );
  }

  // Agent Interaction Methods
  async promptAgent(agentName: string, promptName: string, promptArgs: any) {
    return this.request<{ response: string }>('post', `/api/agent/${agentName}/prompt`, {
      prompt_name: promptName,
      prompt_args: promptArgs,
    }).then((r) => r.response);
  }

  async instruct(agentName: string, userInput: string, conversation: string) {
    return this.promptAgent(agentName, 'instruct', {
      user_input: userInput,
      disable_memory: true,
      conversation_name: conversation,
    });
  }

  async chat(agentName: string, userInput: string, conversation: string, contextResults = 4) {
    return this.promptAgent(agentName, 'Chat', {
      user_input: userInput,
      context_results: contextResults,
      conversation_name: conversation,
      disable_memory: true,
    });
  }

  async smartinstruct(agentName: string, userInput: string, conversation: string) {
    return this.runChain('Smart Instruct', userInput, agentName, false, 1, {
      conversation_name: conversation,
      disable_memory: true,
    });
  }

  async smartchat(agentName: string, userInput: string, conversation: string) {
    return this.runChain('Smart Chat', userInput, agentName, false, 1, {
      conversation_name: conversation,
      disable_memory: true,
    });
  }

  // Command Methods
  async getCommands(agentName: string) {
    return this.request<{ commands: any }>('get', `/api/agent/${agentName}/command`).then((r) => r.commands);
  }

  async executeCommand(agentName: string, commandName: string, commandArgs: any, conversation: string) {
    return this.request<{ response: string }>('post', `/api/agent/${agentName}/command`, {
      command_name: commandName,
      command_args: commandArgs,
      conversation_name: conversation,
    }).then((r) => r.response);
  }

  async toggleCommand(agentName: string, commandName: string, enable: boolean) {
    return this.request<{ message: string }>('patch', `/api/agent/${agentName}/command`, {
      command_name: commandName,
      enable,
    }).then((r) => r.message);
  }

  // Chain Methods
  async getChains() {
    return this.request<string[]>('get', '/api/chain');
  }

  async getChain(chainName: string) {
    return this.request<{ chain: any }>('get', `/api/chain/${chainName}`).then((r) => r.chain);
  }

  async getChainResponses(chainName: string) {
    return this.request<{ chain: any }>('get', `/api/chain/${chainName}/responses`).then((r) => r.chain);
  }

  async getChainArgs(chainName: string) {
    return this.request<{ chain_args: string[] }>('get', `/api/chain/${chainName}/args`).then((r) => r.chain_args);
  }

  async runChain(chainName: string, userInput: string, agentName = '', allResponses = false, fromStep = 1, chainArgs = {}) {
    return this.request('post', `/api/chain/${chainName}/run`, {
      prompt: userInput,
      agent_override: agentName,
      all_responses: allResponses,
      from_step: fromStep,
      chain_args: chainArgs,
    });
  }

  async runChainStep(chainName: string, stepNumber: number, userInput: string, agentName?: string, chainArgs = {}) {
    return this.request('post', `/api/chain/${chainName}/run/step/${stepNumber}`, {
      prompt: userInput,
      agent_override: agentName,
      chain_args: chainArgs,
    });
  }

  async addChain(chainName: string) {
    return this.request<{ message: string }>('post', '/api/chain', {
      chain_name: chainName,
    }).then((r) => r.message);
  }

  async importChain(chainName: string, steps: any) {
    return this.request<{ message: string }>('post', '/api/chain/import', {
      chain_name: chainName,
      steps,
    }).then((r) => r.message);
  }

  async renameChain(chainName: string, newName: string) {
    return this.request<{ message: string }>('put', `/api/chain/${chainName}`, {
      new_name: newName,
    }).then((r) => r.message);
  }

  async deleteChain(chainName: string) {
    return this.request<{ message: string }>('delete', `/api/chain/${chainName}`).then((r) => r.message);
  }

  // Chain Step Methods
  async addStep(chainName: string, stepNumber: number, agentName: string, promptType: string, prompt: any) {
    return this.request<{ message: string }>('post', `/api/chain/${chainName}/step`, {
      step_number: stepNumber,
      agent_name: agentName,
      prompt_type: promptType,
      prompt,
    }).then((r) => r.message);
  }

  async updateStep(chainName: string, stepNumber: number, agentName: string, promptType: string, prompt: any) {
    return this.request<{ message: string }>('put', `/api/chain/${chainName}/step/${stepNumber}`, {
      step_number: stepNumber,
      agent_name: agentName,
      prompt_type: promptType,
      prompt,
    }).then((r) => r.message);
  }

  async moveStep(chainName: string, oldStepNumber: number, newStepNumber: number) {
    return this.request<{ message: string }>('patch', `/api/chain/${chainName}/step/move`, {
      old_step_number: oldStepNumber,
      new_step_number: newStepNumber,
    }).then((r) => r.message);
  }

  async deleteStep(chainName: string, stepNumber: number) {
    return this.request<{ message: string }>('delete', `/api/chain/${chainName}/step/${stepNumber}`).then((r) => r.message);
  }

  // Prompt Methods
  async addPrompt(promptName: string, prompt: string, promptCategory = 'Default') {
    return this.request<{ message: string }>('post', `/api/prompt/${promptCategory}`, {
      prompt_name: promptName,
      prompt,
    }).then((r) => r.message);
  }

  async getPrompt(promptName: string, promptCategory = 'Default') {
    return this.request<{ prompt: any }>('get', `/api/prompt/${promptCategory}/${promptName}`).then((r) => r.prompt);
  }

  async getPrompts(promptCategory = 'Default') {
    return this.request<{ prompts: string[] }>('get', `/api/prompt/${promptCategory}`).then((r) => r.prompts);
  }

  async addPromptCategory(promptCategory: string) {
    return this.request<{ prompts: string[] }>('get', `/api/prompt/${promptCategory}`).then(
      () => `Prompt category ${promptCategory} created.`,
    );
  }

  async getPromptCategories() {
    return this.request<{ prompt_categories: string[] }>('get', '/api/prompt/categories').then((r) => r.prompt_categories);
  }

  async getPromptArgs(promptName: string, promptCategory = 'Default') {
    return this.request<{ prompt_args: any }>('get', `/api/prompt/${promptCategory}/${promptName}/args`).then(
      (r) => r.prompt_args,
    );
  }

  async deletePrompt(promptName: string, promptCategory = 'Default') {
    return this.request<{ message: string }>('delete', `/api/prompt/${promptCategory}/${promptName}`).then((r) => r.message);
  }

  async updatePrompt(promptName: string, prompt: string, promptCategory = 'Default') {
    return this.request<{ message: string }>('put', `/api/prompt/${promptCategory}/${promptName}`, {
      prompt,
      prompt_name: promptName,
      prompt_category: promptCategory,
    }).then((r) => r.message);
  }

  async renamePrompt(promptName: string, newName: string, promptCategory = 'Default') {
    return this.request<{ message: string }>('patch', `/api/prompt/${promptCategory}/${promptName}`, {
      prompt_name: newName,
    }).then((r) => r.message);
  }

  // Extension Methods
  async getExtensionSettings() {
    return this.request<{ extension_settings: any }>('get', '/api/extensions/settings').then((r) => r.extension_settings);
  }

  async getExtensions() {
    return this.request<{ extensions: any[] }>('get', '/api/extensions').then((r) => r.extensions);
  }

  async getAgentExtensions(agentName: string) {
    return this.request<{ extensions: any[] }>('get', `/api/agent/${agentName}/extensions`).then((r) => r.extensions);
  }

  async getCommandArgs(commandName: string) {
    return this.request<{ command_args: any }>('get', `/api/extensions/${commandName}/args`).then((r) => r.command_args);
  }

  // Learning Methods
  async learnText(agentName: string, userInput: string, text: string, collectionNumber = '0') {
    return this.request<{ message: string }>('post', `/api/agent/${agentName}/learn/text`, {
      user_input: userInput,
      text,
      collection_number: collectionNumber,
    }).then((r) => r.message);
  }

  async learnUrl(agentName: string, url: string, collectionNumber = '0') {
    return this.request<{ message: string }>('post', `/api/agent/${agentName}/learn/url`, {
      url,
      collection_number: collectionNumber,
    }).then((r) => r.message);
  }

  async learnFile(agentName: string, fileName: string, fileContent: string, collectionNumber = '0') {
    return this.request<{ message: string }>('post', `/api/agent/${agentName}/learn/file`, {
      file_name: fileName,
      file_content: fileContent,
      collection_number: collectionNumber,
    }).then((r) => r.message);
  }

  async learnGithubRepo(
    agentName: string,
    githubRepo: string,
    githubUser?: string,
    githubToken?: string,
    githubBranch = 'main',
    useAgentSettings = false,
    collectionNumber = '0',
  ) {
    return this.request<{ message: string }>('post', `/api/agent/${agentName}/learn/github`, {
      github_repo: githubRepo,
      github_user: githubUser,
      github_token: githubToken,
      github_branch: githubBranch,
      use_agent_settings: useAgentSettings,
      collection_number: collectionNumber,
    }).then((r) => r.message);
  }

  async learnArxiv(agentName: string, query = '', arxivIds = '', maxResults = 5, collectionNumber = '0') {
    return this.request<{ message: string }>('post', `/api/agent/${agentName}/learn/arxiv`, {
      query,
      arxiv_ids: arxivIds,
      max_results: maxResults,
      collection_number: collectionNumber,
    }).then((r) => r.message);
  }

  async agentReader(agentName: string, readerName: string, data: any, collectionNumber = '0') {
    if (!data.collection_number) {
      data.collection_number = collectionNumber;
    }
    return this.request<{ message: string }>('post', `/api/agent/${agentName}/reader/${readerName}`, { data }).then(
      (r) => r.message,
    );
  }

  // Memory Query Methods
  async getAgentMemories(agentName: string, userInput: string, limit = 5, minRelevanceScore = 0.5, collectionNumber = '0') {
    return this.request<{ memories: any }>('post', `/api/agent/${agentName}/memory/${collectionNumber}/query`, {
      user_input: userInput,
      limit,
      min_relevance_score: minRelevanceScore,
    }).then((r) => r.memories);
  }

  async deleteAgentMemory(agentName: string, memoryId: string, collectionNumber = '0') {
    return this.request<{ message: string }>(
      'delete',
      `/api/agent/${agentName}/memory/${collectionNumber}/${memoryId}`,
    ).then((r) => r.message);
  }

  async createDataset(agentName: string, datasetName: string, batchSize = 4) {
    return this.request<{ message: string }>('post', `/api/agent/${agentName}/memory/dataset`, {
      dataset_name: datasetName,
      batch_size: batchSize,
    }).then((r) => r.message);
  }

  // Voice and Audio Methods
  async executeCommandWithVoice(
    agentName: string,
    base64Audio: string,
    audioFormat = 'm4a',
    audioVariable = 'data_to_correlate_with_input',
    commandName = 'Store information in my long term memory',
    commandArgs = { input: 'Voice transcription from user' },
    tts = false,
    conversationName = 'AGInfrastructure Terminal',
  ) {
    return this.request<{ response: string }>('post', `/api/agent/${agentName}/command`, {
      command_name: 'Command with Voice',
      command_args: {
        base64_audio: base64Audio,
        audio_variable: audioVariable,
        audio_format: audioFormat,
        tts,
        command_name: commandName,
        command_args: commandArgs,
      },
      conversation_name: conversationName,
    }).then((r) => r.response);
  }

  async getEmbeddersDetails() {
    return this.request<{ embedders: any }>('get', '/api/embedders').then((r) => r.embedders);
  }

  // Feedback Methods
  async positiveFeedback(agentName: string, message: string, userInput: string, feedback: string, conversationName = '') {
    return this.provideFeedback(agentName, message, userInput, feedback, true, conversationName);
  }

  async negativeFeedback(agentName: string, message: string, userInput: string, feedback: string, conversationName = '') {
    return this.provideFeedback(agentName, message, userInput, feedback, false, conversationName);
  }

  private async provideFeedback(
    agentName: string,
    message: string,
    userInput: string,
    feedback: string,
    positive: boolean,
    conversationName: string,
  ) {
    return this.request<{ message: string }>('post', `/api/agent/${agentName}/feedback`, {
      user_input: userInput,
      message,
      feedback,
      positive,
      conversation_name: conversationName,
    }).then((r) => r.message);
  }

  // Browsing and External Sources Methods
  async getBrowsedLinks(agentName: string, collectionNumber = '0') {
    return this.request<{ links: string[] }>('get', `/api/agent/${agentName}/browsed_links/${collectionNumber}`).then(
      (r) => r.links,
    );
  }

  async deleteBrowsedLink(agentName: string, link: string, collectionNumber = '0') {
    return this.request<{ message: string }>('delete', `/api/agent/${agentName}/browsed_links`, {
      link,
      collection_number: collectionNumber,
    }).then((r) => r.message);
  }

  async getMemoriesExternalSources(agentName: string, collectionNumber: string) {
    return this.request<{ external_sources: any }>(
      'get',
      `/api/agent/${agentName}/memory/external_sources/${collectionNumber}`,
    ).then((r) => r.external_sources);
  }

  async deleteMemoryExternalSource(agentName: string, source: string, collectionNumber: string) {
    return this.request<{ message: string }>('delete', `/api/agent/${agentName}/memory/external_source`, {
      external_source: source,
      collection_number: collectionNumber,
    }).then((r) => r.message);
  }

  // Persona Methods
  async getPersona(agentName: string) {
    return this.request<{ persona: any }>('get', `/api/agent/${agentName}/persona`).then((r) => r.persona);
  }

  async updatePersona(agentName: string, persona: string) {
    return this.request<{ message: string }>('put', `/api/agent/${agentName}/persona`, { persona }).then((r) => r.message);
  }

  async promptAgentWithVoice(
    agentName: string,
    base64Audio: string,
    audioFormat = 'm4a',
    audioVariable = 'user_input',
    promptName = 'Custom Input',
    promptArgs = { context_results: 6, inject_memories_from_collection_number: 0 },
    tts = false,
    conversationName = 'AGInfrastructure Terminal',
  ) {
    return this.request<{ response: string }>('post', `/api/agent/${agentName}/command`, {
      command_name: 'Prompt with Voice',
      command_args: {
        base64_audio: base64Audio,
        audio_variable: audioVariable,
        audio_format: audioFormat,
        tts,
        prompt_name: promptName,
        prompt_args: promptArgs,
      },
      conversation_name: conversationName,
    }).then((r) => r.response);
  }

  async textToSpeech(agentName: string, text: string) {
    return this.request<{ url: string }>('post', `/api/agent/${agentName}/text_to_speech`, { text }).then((r) => r.url);
  }

  // Conversation Message Methods
  async newConversationMessage(role: string, message: string, conversationName: string) {
    return this.request<{ message: string }>('post', '/api/conversation/message', {
      role,
      message,
      conversation_name: conversationName,
    }).then((r) => r.message);
  }

  async getConversationsWithIds() {
    return this.request<{ conversations_with_ids: any }>('get', '/api/conversations').then((r) => r.conversations_with_ids);
  }

  // Task Planning Methods
  async planTask(
    agentName: string,
    userInput: string,
    websearch = false,
    websearchDepth = 3,
    conversationName = '',
    logUserInput = true,
    logOutput = true,
    enableNewCommand = true,
  ) {
    return this.request<{ response: string }>('post', `/api/agent/${agentName}/plan/task`, {
      user_input: userInput,
      websearch,
      websearch_depth: websearchDepth,
      conversation_name: conversationName,
      log_user_input: logUserInput,
      log_output: logOutput,
      enable_new_command: enableNewCommand,
    }).then((r) => r.response);
  }

  // Company Methods
  async getCompanies() {
    return this.request<any[]>('get', '/v1/companies');
  }

  async getInvitations(company_id?: string) {
    return this.request<{ invitations: any[] }>(
      'get',
      company_id ? `/v1/invitations/${company_id}` : '/v1/invitations',
    ).then((r) => r.invitations);
  }
}
