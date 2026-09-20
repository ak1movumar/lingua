import { BeginnerImportPanel } from '@/features/admin/course-import/beginner-import-panel';
import { LearningShell } from '@/features/learning/learning-shell';
export default function Page() {
  return (
    <LearningShell active="settings">
      <BeginnerImportPanel />
    </LearningShell>
  );
}
