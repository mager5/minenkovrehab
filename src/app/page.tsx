'use client';
import EditableHome from '@/components/EditableHome';
import AiTitleChat from '@/components/AiTitleChat';
import { useHomeEditor } from '@/components/HomeEditorShell';

export default function Home() {
  const { page, setPage } = useHomeEditor();
  return (
    <>
      {page && <EditableHome page={page} />}
      <AiTitleChat onPageChange={setPage} />
    </>
  );
}
