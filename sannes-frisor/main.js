document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  const fadeElements = document.querySelectorAll('.fade-in');
  const availableSlots = {
    '2026-06-15': ['09:00', '10:30', '13:00'],
    '2026-06-16': ['11:00', '14:00', '16:00'],
    '2026-06-18': ['09:30', '12:00', '15:30'],
    '2026-06-22': ['10:00', '13:30'],
    '2026-06-24': ['09:00', '11:30', '14:30'],
    '2026-06-26': ['10:30', '13:00', '15:00'],
    '2026-06-29': ['09:30', '12:30', '16:00'],
    '2026-07-01': ['10:00', '14:00'],
    '2026-07-03': ['09:00', '11:00', '13:30'],
  };

  const calendarGrid = document.querySelector('[data-calendar-grid]');
  const calendarTitle = document.querySelector('[data-calendar-title]');
  const selectedDateText = document.querySelector('[data-selected-date]');
  const timeSlots = document.querySelector('[data-time-slots]');
  const bookingForm = document.querySelector('[data-booking-form]');
  const bookingDateInput = document.querySelector('[data-booking-date]');
  const bookingTimeInput = document.querySelector('[data-booking-time]');
  const monthNames = [
    'januar',
    'februar',
    'marts',
    'april',
    'maj',
    'juni',
    'juli',
    'august',
    'september',
    'oktober',
    'november',
    'december',
  ];
  let visibleMonth = new Date(2026, 5, 1);
  let selectedDate = '';
  let selectedTime = '';

  menuToggle?.addEventListener('click', () => {
    const isOpen = menu?.classList.toggle('active') ?? false;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  menu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      menuToggle?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });

  const showVisibleElements = () => {
    fadeElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const triggerPoint = window.innerHeight * 0.9;

      if (elementTop < triggerPoint) {
        element.classList.add('show');
      }
    });
  };

  showVisibleElements();
  window.addEventListener('scroll', showVisibleElements, { passive: true });

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatReadableDate = (dateKey) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return `${day}. ${monthNames[month - 1]} ${year}`;
  };

  const renderTimeSlots = (dateKey) => {
    if (!timeSlots || !selectedDateText || !bookingDateInput || !bookingTimeInput) return;

    selectedTime = '';
    bookingTimeInput.value = '';
    bookingDateInput.value = dateKey;
    selectedDateText.textContent = `Ledige tider ${formatReadableDate(dateKey)}`;
    timeSlots.innerHTML = '';

    availableSlots[dateKey].forEach((time) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'time-slot';
      button.textContent = time;

      button.addEventListener('click', () => {
        selectedTime = time;
        bookingTimeInput.value = time;
        timeSlots.querySelectorAll('.time-slot').forEach((slot) => slot.classList.remove('is-selected'));
        button.classList.add('is-selected');
      });

      timeSlots.append(button);
    });
  };

  const renderCalendar = () => {
    if (!calendarGrid || !calendarTitle) return;

    calendarGrid.innerHTML = '';
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7;

    calendarTitle.textContent = `${monthNames[month]} ${year}`;

    for (let i = 0; i < offset; i += 1) {
      const empty = document.createElement('span');
      empty.className = 'calendar-day is-empty';
      calendarGrid.append(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'calendar-day';
      button.textContent = String(day);

      if (availableSlots[dateKey]) {
        button.classList.add('has-slots');
        button.addEventListener('click', () => {
          selectedDate = dateKey;
          calendarGrid.querySelectorAll('.calendar-day').forEach((cell) => cell.classList.remove('is-selected'));
          button.classList.add('is-selected');
          renderTimeSlots(dateKey);
        });
      } else {
        button.classList.add('is-disabled');
        button.disabled = true;
      }

      if (selectedDate === dateKey) {
        button.classList.add('is-selected');
      }

      calendarGrid.append(button);
    }
  };

  document.querySelector('[data-calendar-prev]')?.addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  document.querySelector('[data-calendar-next]')?.addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  bookingForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!selectedDate || !selectedTime) {
      selectedDateText.textContent = 'Vælg både dato og tidspunkt først.';
      return;
    }

    const formData = new FormData(bookingForm);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const treatment = formData.get('treatment');
    const subject = encodeURIComponent(`Bookingønske hos Sannes - ${formatReadableDate(selectedDate)} kl. ${selectedTime}`);
    const body = encodeURIComponent(
      `Hej Sannes\n\nJeg vil gerne booke en tid.\n\nNavn: ${name}\nTelefon: ${phone}\nBehandling: ${treatment}\nDato: ${formatReadableDate(selectedDate)}\nTid: ${selectedTime}\n\nVenlig hilsen\n${name}`
    );

    window.location.href = `mailto:michael.bech@outlook.dk?subject=${subject}&body=${body}`;
  });

  renderCalendar();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      menu?.classList.remove('active');
      menuToggle?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  });
});
