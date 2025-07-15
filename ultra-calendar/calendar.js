function generateSingleCalendar(year, month) {
  const container = document.createElement('div');
  container.className = 'calendar-single';

  const date = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startDay = date.getDay();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // ヘッダー
  const header = document.createElement('div');
  header.className = 'calendar-header';
  header.textContent = `${year}年 ${month + 1}月`;
  container.appendChild(header);

  // 曜日
  const weekRow = document.createElement('div');
  weekRow.className = 'calendar-weekdays';
  weekDays.forEach(day => {
    const dayElem = document.createElement('div');
    dayElem.textContent = day;
    weekRow.appendChild(dayElem);
  });
  container.appendChild(weekRow);

  // 日付
  const days = document.createElement('div');
  days.className = 'calendar-days';
  const today = new Date();
  const { birthday, memorialday } = getBirthdayAndMemorialday();
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    days.appendChild(empty);
  }
  for (let d = 1; d <= lastDay; d++) {
    const dayElem = document.createElement('div');
    // 日付オブジェクト
    const cellDate = new Date(year, month, d);
    // 誕生日当日なら🤱を表示
    let isBirthday = false;
    if (birthday && cellDate.getFullYear() === birthday.getFullYear() && cellDate.getMonth() === birthday.getMonth() && cellDate.getDate() === birthday.getDate()) {
      dayElem.textContent = '🤱';
      isBirthday = true;
    // 命日当日なら🪦を表示
    } else if (memorialday && cellDate.getFullYear() === memorialday.getFullYear() && cellDate.getMonth() === memorialday.getMonth() && cellDate.getDate() === memorialday.getDate()) {
      dayElem.textContent = '🪦';
    } else {
      dayElem.textContent = d;
    }
    // 誕生日より前、命日より後
    if ((birthday && cellDate < new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate())) ||
        (memorialday && cellDate > new Date(memorialday.getFullYear(), memorialday.getMonth(), memorialday.getDate()))) {
      dayElem.classList.add('calendar-day-outside-life');
    }
    // 今日までの日付を判定
    if (cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)) {
      dayElem.classList.add('calendar-day-past');
    }
    // 今日の日付を判定
    if (
      cellDate.getFullYear() === today.getFullYear() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getDate() === today.getDate()
    ) {
      dayElem.classList.add('calendar-day-today');
    }
    // 祝日を判定
    const y = cellDate.getFullYear();
    const m = cellDate.getMonth() + 1;
    const key = `${m}-${d}`;
    if (holidays[y] && holidays[y][key]) {
      dayElem.classList.add('calendar-day-holiday');
      dayElem.title = holidays[y][key];
    }
    days.appendChild(dayElem);
  }
  container.appendChild(days);
  return container;
}

function updateCalendarRange(startYear, years) {
  const rangeElem = document.getElementById('calendar-range');
  if (rangeElem) {
    const endYear = Number(startYear) + Number(years) - 1;
    rangeElem.textContent = `${startYear}年 ～ ${endYear}年`;
  }
}

function showMultiCalendar(startYear, years) {
  const multiCalendar = document.getElementById('multi-calendar');
  multiCalendar.innerHTML = '';
  for (let y = startYear; y < startYear + years; y++) {
    const yearTitle = document.createElement('div');
    yearTitle.className = 'calendar-year-title';
    yearTitle.textContent = `${y}年`;
    multiCalendar.appendChild(yearTitle);

    const yearWrap = document.createElement('div');
    yearWrap.className = 'calendar-multi';
    for (let m = 0; m < 12; m++) {
      yearWrap.appendChild(generateSingleCalendar(y, m));
    }
    multiCalendar.appendChild(yearWrap);
  }
  updateCalendarRange(startYear, years);
}

function initStartYearSelector() {
  const startYearSelect = document.getElementById('start-year');
  const now = new Date();
  const currentYear = now.getFullYear();
  const minYear = Math.min(currentYear - 100, 1900);
  const maxYear = 2100 - 9; // 10年分表示なので2100年が最大
  startYearSelect.innerHTML = '';
  for (let y = minYear; y <= maxYear; y++) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y + '年';
    startYearSelect.appendChild(option);
  }
  startYearSelect.value = currentYear;
}

function getBirthdayAndMemorialday() {
  const birthdayInput = document.getElementById('birthday-input');
  const memorialdayInput = document.getElementById('memorialday-input');
  let birthday = null, memorialday = null;
  if (birthdayInput && birthdayInput.value) {
    birthday = new Date(birthdayInput.value);
  }
  if (memorialdayInput && memorialdayInput.value) {
    memorialday = new Date(memorialdayInput.value);
  }
  return { birthday, memorialday };
}

// 祝日データ（2025年・2026年）
const holidays = {
  2025: {
    '1-1': '元日',
    '1-13': '成人の日',
    '2-11': '建国記念の日',
    '2-23': '天皇誕生日',
    '2-24': '休日',
    '3-20': '春分の日',
    '4-29': '昭和の日',
    '5-3': '憲法記念日',
    '5-4': 'みどりの日',
    '5-5': 'こどもの日',
    '5-6': '休日',
    '7-21': '海の日',
    '8-11': '山の日',
    '9-15': '敬老の日',
    '9-23': '秋分の日',
    '10-13': 'スポーツの日',
    '11-3': '文化の日',
    '11-23': '勤労感謝の日',
    '11-24': '休日',
  },
  2026: {
    '1-1': '元日',
    '1-12': '成人の日',
    '2-11': '建国記念の日',
    '2-23': '天皇誕生日',
    '3-20': '春分の日',
    '4-29': '昭和の日',
    '5-3': '憲法記念日',
    '5-4': 'みどりの日',
    '5-5': 'こどもの日',
    '5-6': '休日',
    '7-20': '海の日',
    '8-11': '山の日',
    '9-21': '敬老の日',
    '9-22': '休日',
    '9-23': '秋分の日',
    '10-12': 'スポーツの日',
    '11-3': '文化の日',
    '11-23': '勤労感謝の日',
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initStartYearSelector();
  const startYearSelect = document.getElementById('start-year');
  const showBtn = document.getElementById('show-btn');
  const show100Btn = document.getElementById('show-100-btn');
  const birthdayInput = document.getElementById('birthday-input');
  const memorialdayInput = document.getElementById('memorialday-input');
  function redrawCalendar(years) {
    showMultiCalendar(Number(startYearSelect.value), years);
  }
  showBtn.addEventListener('click', () => {
    redrawCalendar(10);
  });
  show100Btn.addEventListener('click', () => {
    redrawCalendar(100);
  });
  startYearSelect.addEventListener('change', () => {
    redrawCalendar(10);
  });
  if (birthdayInput) birthdayInput.addEventListener('change', () => redrawCalendar(10));
  if (memorialdayInput) memorialdayInput.addEventListener('change', () => redrawCalendar(10));
  // 初期表示
  redrawCalendar(10);
}); 