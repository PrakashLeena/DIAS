import { requireAdminPage } from '@/lib/admin-session';
import { getAdminContext } from '@/services/admin';
import { resolveStageDesign } from '@/lib/stage-design';
import { PageTitle } from '@/components/admin/ui';
import StageDesignForm from '@/components/admin/StageDesignForm';

export const metadata = { title: '3D Design' };

export default async function StageDesignPage() {
  await requireAdminPage();
  const { t, settings } = await getAdminContext();
  return (
    <>
      <PageTitle title={t.stageDesign.title} />
      <p className="-mt-3 mb-6 max-w-3xl text-[14px] text-ink-500">{t.stageDesign.intro}</p>
      <StageDesignForm initial={resolveStageDesign(settings.stageDesign)} />
    </>
  );
}
