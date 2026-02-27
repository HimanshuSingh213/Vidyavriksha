import React from 'react'
import CalendarWeek from '@/components/timetable/calendarWeek';

export default function page() {

  return (
    <div className='min-h-full bg-obsidian p-6 md:p-10 font-sans'>
      <div className='flex flex-col gap-6'>
        {/* Week */}
        <div>
          <CalendarWeek />
        </div>

      </div>
    </div>
  )
}