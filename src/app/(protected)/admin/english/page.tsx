import { LearningShell } from '@/features/learning/learning-shell';
import { EnglishImportPanel } from '@/features/admin/course-import/english-import-panel';
export default function Page() {
  return (
    <LearningShell active="settings">
      <EnglishImportPanel />
    </LearningShell>
  );
}
