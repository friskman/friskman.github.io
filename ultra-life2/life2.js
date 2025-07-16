// --- ultra-life 機能 ---
function janesLaw(age, life) {
  return Math.log(life) - Math.log(age);
}

function updateLife() {
  const ageExist = document.getElementById('ageExistNo').checked ? false : true;
  const age = Number(document.getElementById('age').value);
  const life = Number(document.getElementById('life').value);
  const annualValue = Number(document.getElementById('value').value) * 10000;

  if (ageExist) {
    if (isNaN(age) || isNaN(life) || isNaN(annualValue) || age < 0 || age > 500 || life < 1 || life > 500 || age > life || annualValue < 0) {
      showResults({
        hourlyValue: 0,
        deathStr: '見つかりませんでした。',
        leftYears: 0,
        leftMonths: 0,
        leftDays: 0,
        leftYen: 0,
        leftSubjectiveYears: 0,
        leftSubjectiveMonths: 0,
        leftSubjectiveDays: 0,
        leftSubjectiveYen: 0,
        leftLifePercent: 100,
        leftSubjectivePercent: 100,
        error: true
      });
      return;
    }
  }

  let hourlyValue = Math.round(annualValue / 2080);
  let deathStr = '';

  if (!ageExist) {
    hourlyValue = 0;
    deathStr = '見つかりませんでした。';
    document.getElementById('results').innerHTML = `
      あなたの1時間の価値 <b>0円</b><br>
      （年収${Number(document.getElementById('value').value)}万円を時給換算）<br>
      寿命に基づくあなたの命日 <b>存在しませんでした。</b><br>
    `;
    document.getElementById('lifeBar').style.height = '160px';
    document.getElementById('lifePercent').innerText = '100%';
    document.getElementById('subjectiveBar').style.height = '160px';
    document.getElementById('subjectivePercent').innerText = '100%';
    return;
  }

  const leftYears = life - age;
  const leftMonths = leftYears * 12;
  const leftDays = Math.round(leftYears * 365.25);
  const leftHours = leftDays * 24;
  const leftYen = leftHours * hourlyValue;

  const today = new Date();
  const deathDate = new Date(today.getFullYear() + leftYears, today.getMonth(), today.getDate());
  deathStr = `${deathDate.getFullYear()}年${deathDate.getMonth()+1}月${deathDate.getDate()}日`;

  const totalJ = janesLaw(1, life);
  const spentJ = janesLaw(1, age);
  const leftJ = totalJ - spentJ;
  const leftSubjectiveRatio = leftJ / totalJ;
  const leftSubjectiveYears = leftSubjectiveRatio * life;
  const leftSubjectiveMonths = leftSubjectiveYears * 12;
  const leftSubjectiveDays = Math.round(leftSubjectiveYears * 365.25);
  const leftSubjectiveHours = leftSubjectiveDays * 24;
  const leftSubjectiveYen = leftSubjectiveHours * hourlyValue;

  const leftLifePercent = Math.round((leftYears / life) * 100);
  const leftSubjectivePercent = Math.round(leftSubjectiveRatio * 100);

  showResults({
    hourlyValue,
    deathStr,
    leftYears,
    leftMonths,
    leftDays,
    leftYen,
    leftSubjectiveYears,
    leftSubjectiveMonths,
    leftSubjectiveDays,
    leftSubjectiveYen,
    leftLifePercent,
    leftSubjectivePercent,
    error: false
  });
}

function showResults({
  hourlyValue,
  deathStr,
  leftYears,
  leftMonths,
  leftDays,
  leftYen,
  leftSubjectiveYears,
  leftSubjectiveMonths,
  leftSubjectiveDays,
  leftSubjectiveYen,
  leftLifePercent,
  leftSubjectivePercent,
  error
}) {
  const results = document.getElementById('results');
  results.innerHTML = '';
  if (error) {
    const p = document.createElement('p');
    p.textContent = '入力値が不正です。';
    results.appendChild(p);
    document.getElementById('lifeBar').style.height = '160px';
    document.getElementById('lifePercent').innerText = '100%';
    document.getElementById('subjectiveBar').style.height = '160px';
    document.getElementById('subjectivePercent').innerText = '100%';
    return;
  }
  const items = [
    `あなたの1時間の価値 ${hourlyValue.toLocaleString()}円`,
    `寿命に基づくあなたの命日 ${deathStr}`,
    `あなたに残された時間 ${leftYears} (年)` ,
    `あなたに残された時間 ${leftMonths} (月)` ,
    `あなたに残された時間 ${leftDays} (日)` ,
    `あなたに残された時間 ${leftYen.toLocaleString()} (円)` ,
    `あなたに残された体感時間 ${leftSubjectiveYears.toFixed(1)} (年)` ,
    `あなたに残された体感時間 ${leftSubjectiveMonths.toFixed(1)} (月)` ,
    `あなたに残された体感時間 ${leftSubjectiveDays} (日)` ,
    `あなたに残された体感時間 ${leftSubjectiveYen.toLocaleString()} (円)`
  ];
  items.forEach(text => {
    const div = document.createElement('div');
    div.textContent = text;
    results.appendChild(div);
  });
  document.getElementById('lifeBar').style.height = `${leftLifePercent * 1.6}px`;
  document.getElementById('lifePercent').innerText = `残${leftLifePercent}%`;
  document.getElementById('subjectiveBar').style.height = `${leftSubjectivePercent * 1.6}px`;
  document.getElementById('subjectivePercent').innerText = `残${leftSubjectivePercent}%`;
}

document.querySelectorAll('.life2-left input').forEach(el => el.addEventListener('input', updateLife));
window.addEventListener('DOMContentLoaded', updateLife);

const lifeInput = document.getElementById('life');
const lifeRange = document.getElementById('lifeRange');
if (lifeInput && lifeRange) {
  lifeInput.addEventListener('input', e => {
    lifeRange.value = lifeInput.value;
    updateLife();
  });
  lifeRange.addEventListener('input', e => {
    lifeInput.value = lifeRange.value;
    updateLife();
  });
}
const ageInput = document.getElementById('age');
if (ageInput && lifeRange) {
  ageInput.addEventListener('input', e => {
    lifeRange.min = ageInput.value;
    if (Number(lifeRange.value) < Number(ageInput.value)) {
      lifeRange.value = ageInput.value;
      lifeInput.value = ageInput.value;
      updateLife();
    }
  });
  lifeRange.min = ageInput.value;
}
const ageExistRadios = document.getElementsByName('ageExist');
const lifeLabel = document.getElementById('lifeLabel');
function toggleLifeInput() {
  if (document.getElementById('ageExistNo').checked) {
    lifeLabel.style.display = 'none';
  } else {
    lifeLabel.style.display = '';
  }
}
ageExistRadios.forEach(radio => radio.addEventListener('change', toggleLifeInput));
toggleLifeInput();

// --- ultra-calendar 機能 ---
function generateSingleCalendar(year, month) {
  const container = document.createElement('div');
  container.className = 'calendar-single';

  const date = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startDay = date.getDay();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  const header = document.createElement('div');
  header.className = 'calendar-header';
  header.textContent = `${year}年 ${month + 1}月`;
  container.appendChild(header);

  const weekRow = document.createElement('div');
  weekRow.className = 'calendar-weekdays';
  weekDays.forEach(day => {
    const dayElem = document.createElement('div');
    dayElem.textContent = day;
    weekRow.appendChild(dayElem);
  });
  container.appendChild(weekRow);

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
    const cellDate = new Date(year, month, d);
    let isBirthday = false;
    if (birthday && cellDate.getFullYear() === birthday.getFullYear() && cellDate.getMonth() === birthday.getMonth() && cellDate.getDate() === birthday.getDate()) {
      dayElem.textContent = '🧑';
      isBirthday = true;
      dayElem.classList.add('calendar-day-birthday');
    } else if (memorialday && cellDate.getFullYear() === memorialday.getFullYear() && cellDate.getMonth() === memorialday.getMonth() && cellDate.getDate() === memorialday.getDate()) {
      dayElem.textContent = '🪦';
      dayElem.classList.add('calendar-day-memorial');
    } else {
      dayElem.textContent = d;
    }
    if ((birthday && cellDate < new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate())) ||
        (memorialday && cellDate > new Date(memorialday.getFullYear(), memorialday.getMonth(), memorialday.getDate()))) {
      dayElem.classList.add('calendar-day-outside-life');
    }
    if (cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)) {
      dayElem.classList.add('calendar-day-past');
    }
    if (
      cellDate.getFullYear() === today.getFullYear() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getDate() === today.getDate()
    ) {
      dayElem.classList.add('calendar-day-today');
    }
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
  const maxYear = 2500 - 9;
  startYearSelect.innerHTML = '';
  for (let y = minYear; y <= maxYear; y++) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y + '年';
    startYearSelect.appendChild(option);
  }
  startYearSelect.value = currentYear;
}

function initStartEndYearSelectors() {
  const startYearSelect = document.getElementById('start-year');
  const endYearSelect = document.getElementById('end-year');
  const now = new Date();
  const currentYear = now.getFullYear();
  const minYear = Math.min(currentYear - 100, 1900);
  const maxYear = 2500;
  // 年の選択肢をセットする関数
  function populateYearSelect(select, from, to) {
    select.innerHTML = '';
    for (let y = from; y <= to; y++) {
      const option = document.createElement('option');
      option.value = y;
      option.textContent = y + '年';
      select.appendChild(option);
    }
  }
  populateYearSelect(startYearSelect, minYear, maxYear);
  // 終了年は開始年以降のみ
  let startYear = parseInt(startYearSelect.value || currentYear, 10);
  populateYearSelect(endYearSelect, startYear, maxYear);
  startYearSelect.value = currentYear;
  endYearSelect.value = currentYear + 9;
  // 開始年が変わったら終了年の選択肢を更新
  startYearSelect.addEventListener('change', function() {
    const startYear = parseInt(startYearSelect.value, 10);
    const prevEndYear = parseInt(endYearSelect.value, 10);
    populateYearSelect(endYearSelect, startYear, maxYear);
    // 終了年が開始年より前になっていたら自動で開始年に合わせる
    if (prevEndYear < startYear) {
      endYearSelect.value = startYear;
    } else {
      endYearSelect.value = prevEndYear;
    }
  });
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
  initStartEndYearSelectors();
  const startYearSelect = document.getElementById('start-year');
  const endYearSelect = document.getElementById('end-year');
  const showLifeBtn = document.getElementById('show-life-btn');
  const birthdayInput = document.getElementById('birthday-input');
  const memorialdayInput = document.getElementById('memorialday-input');
  const lifeInput = document.getElementById('life');
  const ageInput = document.getElementById('age');

  function redrawCalendarRange() {
    let start = Number(startYearSelect.value);
    let end = Number(endYearSelect.value);
    if (end < start) {
      end = start;
      endYearSelect.value = start;
    }
    showMultiCalendar(start, end - start + 1);
  }

  startYearSelect.addEventListener('change', redrawCalendarRange);
  endYearSelect.addEventListener('change', redrawCalendarRange);
  if (birthdayInput) birthdayInput.addEventListener('change', redrawCalendarRange);
  if (memorialdayInput) memorialdayInput.addEventListener('change', redrawCalendarRange);
  if (birthdayInput && ageInput) {
    birthdayInput.addEventListener('change', function() {
      if (birthdayInput.value) {
        const birth = new Date(birthdayInput.value);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        // まだ誕生日が来ていなければ1年引く
        if (
          today.getMonth() < birth.getMonth() ||
          (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
        ) {
          age--;
        }
        if (age >= 0) {
          ageInput.value = age;
          ageInput.dispatchEvent(new Event('input'));
        }
      }
    });
  }

  if (memorialdayInput && birthdayInput && lifeInput) {
    memorialdayInput.addEventListener('change', function() {
      if (birthdayInput.value && memorialdayInput.value) {
        const birth = new Date(birthdayInput.value);
        const death = new Date(memorialdayInput.value);
        let age = death.getFullYear() - birth.getFullYear();
        // 命日が誕生日より前なら1年引く
        if (
          death.getMonth() < birth.getMonth() ||
          (death.getMonth() === birth.getMonth() && death.getDate() < birth.getDate())
        ) {
          age--;
        }
        if (age > 0) {
          lifeInput.value = age;
          lifeInput.dispatchEvent(new Event('input'));
        }
      }
    });
  }

  redrawCalendarRange();

  if (showLifeBtn) showLifeBtn.addEventListener('click', () => {
    // 誕生日と命日が両方入力されている場合のみ
    const birthdayInput = document.getElementById('birthday-input');
    const memorialdayInput = document.getElementById('memorialday-input');
    const startYearSelect = document.getElementById('start-year');
    const endYearSelect = document.getElementById('end-year');
    if (birthdayInput && memorialdayInput && birthdayInput.value && memorialdayInput.value) {
      const birth = new Date(birthdayInput.value);
      const death = new Date(memorialdayInput.value);
      let startYear = birth.getFullYear();
      let endYear = death.getFullYear();
      // selectも同期
      if (startYearSelect && endYearSelect) {
        startYearSelect.value = startYear;
        endYearSelect.value = endYear;
      }
      // 月単位で調整
      let startMonth = birth.getMonth();
      let endMonth = death.getMonth();
      // 年数計算
      let years = endYear - startYear + 1;
      // カレンダー描画
      const multiCalendar = document.getElementById('multi-calendar');
      multiCalendar.innerHTML = '';
      for (let y = startYear; y <= endYear; y++) {
        const yearTitle = document.createElement('div');
        yearTitle.className = 'calendar-year-title';
        yearTitle.textContent = `${y}年`;
        multiCalendar.appendChild(yearTitle);
        const yearWrap = document.createElement('div');
        yearWrap.className = 'calendar-multi';
        let mStart = (y === startYear) ? startMonth : 0;
        let mEnd = (y === endYear) ? endMonth : 11;
        for (let m = mStart; m <= mEnd; m++) {
          yearWrap.appendChild(generateSingleCalendar(y, m));
        }
        multiCalendar.appendChild(yearWrap);
      }
      // 範囲表示
      updateCalendarRange(startYear, years);
    } else {
      alert('誕生日と命日を両方入力してください');
    }
  });

  // スクロールボタン
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const scrollBottomBtn = document.getElementById('scrollBottomBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (scrollBottomBtn) {
    scrollBottomBtn.addEventListener('click', () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }

  const showGraphBtn = document.getElementById('show-graph-btn');
  const graphModal = document.getElementById('graph-modal');
  const graphModalBg = document.getElementById('graph-modal-bg');
  const graphModalClose = document.getElementById('graph-modal-close');
  const graphCanvas = document.getElementById('graph-canvas');

  function openGraphModal() {
    if (graphModal && graphModalBg) {
      graphModal.style.display = 'block';
      graphModalBg.style.display = 'block';
      drawSubjectiveGraph();
    }
  }
  function closeGraphModal() {
    if (graphModal && graphModalBg) {
      graphModal.style.display = 'none';
      graphModalBg.style.display = 'none';
    }
  }
  if (showGraphBtn) showGraphBtn.addEventListener('click', openGraphModal);
  if (graphModalClose) graphModalClose.addEventListener('click', closeGraphModal);
  if (graphModalBg) graphModalBg.addEventListener('click', closeGraphModal);

  function drawSubjectiveGraph() {
    if (!graphCanvas) return;
    const ctx = graphCanvas.getContext('2d');
    ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    // パラメータ取得
    const birthdayInput = document.getElementById('birthday-input');
    const lifeInput = document.getElementById('life');
    let age = 0;
    let life = 80;
    if (birthdayInput && birthdayInput.value) {
      const birth = new Date(birthdayInput.value);
      const today = new Date();
      age = today.getFullYear() - birth.getFullYear();
      if (
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
      ) {
        age--;
      }
    }
    if (lifeInput && lifeInput.value) {
      life = Number(lifeInput.value);
    }
    // グラフデータ生成
    const data = [];
    function janesLaw(x, L) {
      return Math.log(L) - Math.log(x);
    }
    const totalJ = janesLaw(1, life);
    for (let a = 1; a <= life; a++) {
      const leftJ = janesLaw(1, life) - janesLaw(1, a);
      const subjective = (leftJ / totalJ) * life;
      data.push({ age: a, subjective });
    }
    // 軸
    const w = graphCanvas.width, h = graphCanvas.height;
    const margin = 48;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, h - margin);
    ctx.lineTo(w - margin, h - margin);
    ctx.stroke();
    // ラベル
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('年齢', w / 2, h - 12);
    ctx.save();
    ctx.translate(18, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('残り体感時間', 0, 0);
    ctx.restore();
    // データ線
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = margin + ((w - 2 * margin) * (data[i].age - 1)) / (life - 1);
      const y = h - margin - ((h - 2 * margin) * data[i].subjective) / data[0].subjective;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // 現在年齢の点
    if (age > 0 && age <= life) {
      const x = margin + ((w - 2 * margin) * (age - 1)) / (life - 1);
      const y = h - margin - ((h - 2 * margin) * data[age - 1].subjective) / data[0].subjective;
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('現在', x, y - 12);
    }
    // 目盛
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    for (let t = 0; t <= 5; t++) {
      const y = h - margin - ((h - 2 * margin) * t) / 5;
      const val = Math.round((data[0].subjective * t) / 5);
      ctx.fillText(val, margin - 6, y + 4);
      ctx.strokeStyle = '#ccc';
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(w - margin, y);
      ctx.stroke();
    }
    ctx.textAlign = 'center';
    for (let t = 0; t <= 5; t++) {
      const x = margin + ((w - 2 * margin) * t) / 5;
      const val = Math.round((life * t) / 5);
      ctx.fillText(val, x, h - margin + 18);
      ctx.strokeStyle = '#ccc';
      ctx.beginPath();
      ctx.moveTo(x, h - margin);
      ctx.lineTo(x, margin);
      ctx.stroke();
    }
  }
});

// ultra-life入力イベントの後に追加
function updateMemorialdayFromLife() {
  const birthdayInput = document.getElementById('birthday-input');
  const lifeInput = document.getElementById('life');
  const memorialdayInput = document.getElementById('memorialday-input');
  if (birthdayInput && lifeInput && memorialdayInput && birthdayInput.value) {
    const birth = new Date(birthdayInput.value);
    const life = Number(lifeInput.value);
    if (!isNaN(life) && life > 0) {
      // 命日は誕生日のlife年後-1日（誕生日と同じ月日）
      const death = new Date(birth);
      death.setFullYear(birth.getFullYear() + life);
      // 命日は誕生日の前日（満年齢）にしたい場合は下記コメントアウトを有効化
      // death.setDate(death.getDate() - 1);
      // 日付をYYYY-MM-DD形式でセット
      const yyyy = death.getFullYear();
      const mm = String(death.getMonth() + 1).padStart(2, '0');
      const dd = String(death.getDate()).padStart(2, '0');
      memorialdayInput.value = `${yyyy}-${mm}-${dd}`;
      memorialdayInput.dispatchEvent(new Event('change'));
    }
  }
}
// ultra-life入力イベントの後に追加
if (lifeInput) lifeInput.addEventListener('input', updateMemorialdayFromLife);
if (lifeRange) lifeRange.addEventListener('input', updateMemorialdayFromLife); 