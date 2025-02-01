import fs from 'fs';
import path from 'path';
import MarkdownBlock from '@/components/interactive/Chat/Message/MarkdownBlock';
import { SidebarPage } from '@/components/jrg/appwrapper/SidebarPage';

// Read privacy policy from a local file
function getPrivacyPolicy() {
  try {
    const filePath = path.join(process.cwd(), 'content', 'privacy-policy.md');
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading privacy policy:', error);
    return '# Privacy Policy\n\nUnable to load privacy policy.';
  }
}

export default function PrivacyPolicy() {
  const privacyPolicyContent = getPrivacyPolicy();

  return (
    <SidebarPage title='Privacy Policy'>
      <MarkdownBlock content={privacyPolicyContent} />
    </SidebarPage>
  );
}
