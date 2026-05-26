import SettingHeader from '@/components/settings/SettingHeader'
import React, { Suspense } from 'react'
import { auth } from '@/auth';
import SettingOptions from '@/components/settings/SettingOptions';
import { Loader2 } from 'lucide-react';

async function settingPage() {
  const session = await auth();
  return (
    <div>
      {/* Header */}
      <SettingHeader session={session} />

      <Suspense fallback={
        <div>
          <Loader2 className="animate-spin text-brand w-8 h-8" />
        </div>
      }>

        {/* Setting Options */}
        <SettingOptions session={session} />
      </Suspense>
    </div>
  )
}

export default settingPage