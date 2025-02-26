const InteractiveConfigDefault = {
  agent: process.env.NEXT_PUBLIC_AGINTERACTIVE_AGENT || 'XT',
  sdk: null,
  openai: null,
  overrides: {
    mode: 'prompt',
    prompt: 'Think About It',
    promptCategory: 'Default',
    command: '',
    commandArgs: {},
    commandMessageArg: 'message',
    chain: '',
    chainRunConfig: {
      chainArgs: {},
      singleStep: false,
      fromStep: 0,
      allResponses: false,
    },
    contextResults: 0,
    shots: 0,
    websearchDepth: 0,
    injectMemoriesFromCollectionNumber: 0,
    conversationResults: 5,
    conversation: '-',
    conversationID: '',
    browseLinks: false,
    webSearch: false,
    insightAgentName: '',
    enableMemory: false,
  },
  mutate: null,
};

module.exports = InteractiveConfigDefault;
