import { useContext, useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { v4 as uuidv4 } from 'uuid';
import { UIProps } from '../AGInteractive';
import ConversationBar from '../Chat/ChatBar';
import { InteractiveConfigContext, Overrides } from '../InteractiveConfigContext';
import FormInput from './FormInput';
import FormOutput from './FormOutput';

export default function Form({
  showChatThemeToggles,
  followUp = false,
}: Overrides & UIProps & { followUp?: boolean }): React.JSX.Element {
  const state = useContext(InteractiveConfigContext);
  const [argValues, setArgValues] = useState({});
  const [uuids, setUUIDs] = useState([]);
  const [uuid, setUUID] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: results } = useSWR(
    '/results',
    async () => {
      const conversations = await Promise.all(uuids.map(async (uuid) => await state.sdk.getConversation(uuid, 5, 1)));
      return conversations.reduce((obj, conversation, index) => {
        obj[uuids[index.toString()]] = conversation;
        return obj;
      }, {});
    },
    {
      fallbackData: {},
    },
  );
  const { data: promptArgs } = useSWR(
    '/prompt/args',
    async () =>
      (await state.sdk.getPromptArgs(state.overrides.prompt, state.overrides.promptCategory)).filter(
        (arg) => arg !== 'user_input',
      ),
    {
      fallbackData: [],
    },
  );
  useEffect(() => {
    mutate('/results');
  }, [uuids]);

  useEffect(() => {
    if (promptArgs.length > 0) {
      setArgValues(promptArgs.reduce((obj, key) => ({ ...obj, [key]: '' }), {}));
    }
  }, [promptArgs]);
  async function submit(message, files): Promise<string> {
    const messages = [];
    if (files.length > 0) {
      const fileContents = await Promise.all(
        files.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event): void {
              const base64Content = Buffer.from(event.target.result as string, 'binary').toString('base64');
              resolve({
                type: `${file.type.split('/')[0]}_url`,
                [`${file.type.split('/')[0]}_url`]: {
                  url: `data:${file.type};base64,${base64Content}`,
                },
              });
            };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
          });
        }),
      );
      messages.push({
        role: 'user',
        content: [{ type: 'text', text: message }, ...fileContents],
        prompt_args: { ...argValues },
      });
    } else {
      messages.push({ role: 'user', content: message, prompt_args: { ...argValues } });
    }
    const uuid = uuidv4();
    const toOpenAI = {
      messages: messages,
      model: state.agent,
      user: uuid,
    };
    setLoading(true);
    const chatCompletion = await state.openai.chat.completions.create(toOpenAI);
    setLoading(false);
    setUUIDs((previous) => [...previous, uuid]);
    setUUID(uuid);
    if (chatCompletion?.choices[0]?.message.content.length > 0) {
      return chatCompletion.choices[0].message.content;
    } else {
      return 'Unable to get response from the agent';
    }
  }
  return (
    <>
      <FormInput disabled={loading} argValues={argValues} setArgValues={setArgValues} />

      {results[uuid.toString()].length === 0 && (
        <ConversationBar
          onSend={(message, files) => submit(message, files)}
          disabled={loading}
          clearOnSend={false}
          showChatThemeToggles={showChatThemeToggles}
          loading={loading}
          setLoading={setLoading}
        />
      )}
      {loading && <p className='text-sm text-muted-foreground'>Fetching response...</p>}
      <FormOutput results={results} showIndex={1} selectedUUID={uuid} setSelectedUUID={setUUID} />
      {followUp && results[uuid.toString()].length < 3 && results[uuid.toString()].length > 1 && (
        <FormInput disabled={loading} argValues={argValues} setArgValues={setArgValues} />
      )}
      {followUp && results[uuid.toString()].length >= 3 && (
        <>
          <p>{results[uuid.toString()][2].message}</p>
          <FormOutput results={results} showIndex={3} selectedUUID={uuid} setSelectedUUID={setUUID} />
        </>
      )}
    </>
  );
}
