import MarkdownBlock from '@/components/interactive/Chat/Message/MarkdownBlock';
import { SidebarPage } from '@/components/jrg/appwrapper/SidebarPage';

export default function APIReference() {
  const content = `See our [REST API Documentation](${process.env.NEXT_PUBLIC_API_URI}/redoc) for more information.`;
  return (
    <SidebarPage title='API Reference'>
      <MarkdownBlock content={content} />
    </SidebarPage>
  );
}
