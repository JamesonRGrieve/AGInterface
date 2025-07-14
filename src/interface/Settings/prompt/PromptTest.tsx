import MarkdownBlock from '@/components/markdown/MarkdownBlock';
import IconButton from '@/components/theme/IconButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/useToast';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { Loader2, Repeat, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function PromptTest({
  promptName,
  promptContent,
  saved,
}: {
  promptName: string;
  promptContent: string;
  saved: boolean;
}) {
  const [variables, setVariables] = useState({});
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<string[]>([]);
  const [responseIndex, setResponseIndex] = useState(0);
  const preview = useMemo(() => {
    let result = promptContent;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replaceAll(`{${key}}`, value);
    });
    return result;
  }, [promptContent, variables]);
  const sendPrompt = useCallback(async () => {
    setLoading(true);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URI}/api/agent/${getCookie('aginterface-agent')}/prompt`,
      {
        prompt_name: promptName,
        prompt_args: variables,
      },
      {
        headers: {
          Authorization: getCookie('jwt'),
        },
      },
    );
    if (response.status === 200) {
      setResponses((responses) => [...responses, response.data.choices[0].message.content]);
    } else {
      toast({
        title: 'Error',
        description: response.data.error.message,
        variant: 'destructive',
      });
    }
    setLoading(false);
  }, [promptContent, variables]);
  const vars = useMemo(() => {
    return promptContent
      .split('{')
      .map((v) => v.split('}')[0])
      .slice(1);
  }, [promptContent]);
  useEffect(() => {
    setVariables((currentVars) =>
      vars.reduce((acc, v) => ({ ...acc, [v]: Object.keys(currentVars).includes(v) ? currentVars[v] : '' }), {}),
    );
  }, [vars]);
  return (
    <div>
      <h3>Test Prompt</h3>
      <div className='grid gap-4 grid-cols-3 my-2'>
        {vars.map((v) => (
          <fieldset key={v}>
            <Label htmlFor={v}>{v}</Label>
            <Input id={v} value={variables[v]} onChange={(e) => setVariables({ ...variables, [v]: e.target.value })} />
          </fieldset>
        ))}
      </div>
      <h4>Prompt Preview</h4>
      <MarkdownBlock content={preview} />
      {loading ? (
        <Loader2 className='animate-spin w-4 h-4' />
      ) : (
        <IconButton
          Icon={responses.length > 1 ? Repeat : Send}
          label='Run'
          disabled={!saved}
          onClick={sendPrompt}
          description={Object.keys(variables).length > 0 ? 'Run the prompt with the provided variables.' : 'Run the prompt.'}
        />
      )}

      {responses.length > 0 && (
        <>
          <h4>
            Response {responseIndex}/{responses.length}
          </h4>
          <MarkdownBlock content={responses[responseIndex]} />
        </>
      )}
    </div>
  );
}
