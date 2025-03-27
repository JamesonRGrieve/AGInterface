import AGInteractive from '@/interactive/AGInteractive';
import { cookies } from 'next/headers';
import ConvSwitch from './ConvSwitch';

export default function Home({ params }: { params: { id: string } }) {
  return (
    <>
      <ConvSwitch id={params.id} />
      <AGInteractive
        stateful={false}
        uiConfig={{
          showAppBar: false,
          showChatThemeToggles: false,
          enableVoiceInput: true,
          footerMessage: '',
          alternateBackground: 'primary',
        }}
        serverConfig={{
          backEndURI: process.env.NEXT_PUBLIC_API_URI as string,
          apiKey: cookies().get('jwt')?.value ?? '',
        }}
        agent={process.env.NEXT_PUBLIC_AGINTERACTIVE_AGENT || 'XT'}
        overrides={{
          conversation: params.id,
        }}
      />
    </>
  );
}
