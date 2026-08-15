import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'vanilla-calendar-pro';
import 'vanilla-calendar-pro/styles/index.css';
import 'vanilla-calendar-pro/styles/themes/light.css';
import type { Options, FormatDateString } from 'vanilla-calendar-pro';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onDateChange: (checkIn: string, checkOut: string) => void;
}

export function DateRangePicker({ checkIn, checkOut, onDateChange }: DateRangePickerProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendar, setCalendar] = useState<Calendar | null>(null);

  // Create calendar instance
  useEffect(() => {
    if (!calendarRef.current) return;

    const options: Options = {
      type: 'default',
      selectionDatesMode: 'multiple-ranged',
      dateMin: new Date().toISOString().split('T')[0] as FormatDateString,
      disableDatesPast: true,
      selectedTheme: 'light',
      selectedDates: checkIn && checkOut ? [checkIn, checkOut] : [],
      locale: 'th-TH',
      onClickDate(self) {
        const dates = self.context.selectedDates;
        if (dates && dates.length >= 2) {
          const sortedDates = [...dates].sort();
          onDateChange(sortedDates[0], sortedDates[sortedDates.length - 1]);
        } else if (dates && dates.length === 1) {
          onDateChange(dates[0], '');
        }
      },
    };

    setCalendar(new Calendar(calendarRef.current, options));
  }, [calendarRef]);

  // Initialize calendar
  useEffect(() => {
    if (!calendar) return;
    calendar.init();
  }, [calendar]);

  // Update selected dates when they change
  useEffect(() => {
    if (calendar && checkIn && checkOut) {
      calendar.set({
        selectedDates: [checkIn, checkOut],
      });
    }
  }, [calendar, checkIn, checkOut]);

  return (
    <div className="vanilla-calendar-wrapper">
      <div id="calendar" ref={calendarRef}></div>
      <style>{`
        .vanilla-calendar-wrapper {
          max-width: 100%;
          min-height: 350px;
        }

        #calendar {
          min-height: 350px;
        }

        /* ---- Coastal Glass calendar theme ---- */
        .vanilla-calendar {
          border: 1px solid #E5DDD0;
          border-radius: 1.5rem;
          font-family: inherit;
          background: #FFFFFF;
          width: 100%;
          padding: 0.75rem;
          box-shadow: 0 1px 2px rgba(14, 76, 92, 0.04),
                      0 4px 12px rgba(14, 76, 92, 0.06);
        }

        .vanilla-calendar-header {
          padding: 0.5rem 0.25rem 0.75rem;
        }

        .vanilla-calendar-header__content {
          color: #0B3E4B;
          font-weight: 500;
        }

        .vanilla-calendar-month,
        .vanilla-calendar-year {
          color: #0B3E4B;
          font-weight: 500;
        }

        .vanilla-calendar-arrow {
          color: #0E4C5C;
          border-radius: 9999px;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .vanilla-calendar-arrow:hover {
          background-color: #EFF9FB;
          color: #0B3E4B;
        }

        .vanilla-calendar-week__day {
          color: #8C7D68;
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .vanilla-calendar-day__btn {
          color: #0B3E4B;
          border-radius: 9999px;
          font-size: 0.875rem;
          transition: background-color 0.2s ease, color 0.2s ease,
                      transform 0.2s ease;
        }

        .vanilla-calendar-day__btn:hover {
          background-color: #EFF9FB;
          color: #0E4C5C;
          transform: scale(1.06);
        }

        /* Range endpoints — coral accent */
        .vanilla-calendar-day__btn_selected {
          background-color: #FF7A59 !important;
          color: #FFFFFF !important;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(255, 122, 89, 0.35);
        }

        .vanilla-calendar-day__btn_selected:hover {
          background-color: #F55C36 !important;
        }

        /* Nights between endpoints — soft lagoon fill */
        .vanilla-calendar-day__btn_intermediate {
          background-color: #D5EFF5 !important;
          color: #0B3E4B !important;
          border-radius: 0 !important;
        }

        .vanilla-calendar-day__btn_intermediate:hover {
          background-color: #ACDEE9 !important;
        }

        .vanilla-calendar-day__btn_disabled {
          color: #CFC3B0;
          cursor: not-allowed;
        }

        .vanilla-calendar-day__btn_disabled:hover {
          background-color: transparent;
          transform: none;
        }

        .vanilla-calendar-day__btn_today:not(.vanilla-calendar-day__btn_selected) {
          box-shadow: inset 0 0 0 1.5px #7FB8C4;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
