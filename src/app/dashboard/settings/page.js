import SettingHeader from '@/components/settings/SettingHeader'
import React from 'react'
import { auth } from '@/auth';
import SettingOptions from '@/components/settings/SettingOptions';

async function settingPage() {
  const session = await auth();
  return (
    <div>
      {/* Header */}
      <SettingHeader session={session} />

      {/* Setting Options */}
      <SettingOptions session={session} />
    </div>
  )
}

export default settingPage