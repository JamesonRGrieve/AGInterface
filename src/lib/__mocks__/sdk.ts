// src/lib/__mocks__/sdkMock.ts
// A mock implementation compatible with Storybook

export class MockAGInterfaceSDK {
  baseUri: string;
  apiKey?: string;

  constructor(config: { baseUri: string; apiKey?: string }) {
    this.baseUri = config.baseUri || 'http://localhost:7437';
    this.apiKey = config.apiKey;
  }

  session = { id: 'mock-session-id' };
  user = { id: 'mock-user-id' };

  async getPrompts() {
    return [
      { name: 'Prompt 1', content: 'This is prompt 1 content' },
      { name: 'Prompt 2', content: 'This is prompt 2 content' },
      { name: 'Prompt 3', content: 'This is prompt 3 content' },
    ];
  }

  // Add other methods as needed for your stories
}

export default MockAGInterfaceSDK;
