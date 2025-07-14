import { SidebarPage } from '@/appwrapper/SidebarPage';
import MarkdownBlock from '@/components/markdown/MarkdownBlock';
import fs from 'fs';
import path from 'path';

// Read privacy policy from a local file
function getPrivacyPolicy() {
  try {
    const filePath = path.join(process.cwd(), 'content', 'privacy-policy.md');
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.warn('Error reading privacy policy:', error);
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
