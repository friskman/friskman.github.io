function janesLaw(age, life) {
  // ジャネーの法則: 体感時間 = log(寿命) - log(年齢)
  return Math.log(life) - Math.log(age);
}

function update() {
  const ageExist = document.getElementById('ageExistNo').checked ? false : true;
  const age = Number(document.getElementById('age').value);
  const life = Number(document.getElementById('life').value);
  const annualValue = Number(document.getElementById('value').value) * 10000; // 万円→円

  // 入力値バリデーション
  if (ageExist) {
    if (isNaN(age) || isNaN(life) || isNaN(annualValue) || age < 0 || age > 200 || life < 1 || life > 200 || age > life || annualValue < 0) {
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

  // 年収→時給換算（1年=2080時間: 週40h×52週）
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

  // 残り寿命
  const leftYears = life - age;
  const leftMonths = leftYears * 12;
  const leftDays = Math.round(leftYears * 365.25);
  const leftHours = leftDays * 24;
  const leftYen = leftHours * hourlyValue;

  // 命日
  const today = new Date();
  const deathDate = new Date(today.getFullYear() + leftYears, today.getMonth(), today.getDate());
  deathStr = `${deathDate.getFullYear()}年${deathDate.getMonth()+1}月${deathDate.getDate()}日`;

  // ジャネーの法則による体感時間
  const totalJ = janesLaw(1, life); // 1歳から寿命まで
  const spentJ = janesLaw(1, age);  // 1歳から今まで
  const leftJ = totalJ - spentJ;
  const leftSubjectiveRatio = leftJ / totalJ;
  const leftSubjectiveYears = leftSubjectiveRatio * life;
  const leftSubjectiveMonths = leftSubjectiveYears * 12;
  const leftSubjectiveDays = Math.round(leftSubjectiveYears * 365.25);
  const leftSubjectiveHours = leftSubjectiveDays * 24;
  const leftSubjectiveYen = leftSubjectiveHours * hourlyValue;

  // パーセンテージ
  const leftLifePercent = Math.round((leftYears / life) * 100);
  const leftSubjectivePercent = Math.round(leftSubjectiveRatio * 100);

  // 結果表示
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

// innerHTMLを使わず安全に結果を表示
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
  // バー表示
  document.getElementById('lifeBar').style.height = `${leftLifePercent * 1.6}px`;
  document.getElementById('lifePercent').innerText = `残${leftLifePercent}%`;
  document.getElementById('subjectiveBar').style.height = `${leftSubjectivePercent * 1.6}px`;
  document.getElementById('subjectivePercent').innerText = `残${leftSubjectivePercent}%`;
}

document.querySelectorAll('input').forEach(el => el.addEventListener('input', update));
window.onload = update;

// 入力イベントの連動
const lifeInput = document.getElementById('life');
const lifeRange = document.getElementById('lifeRange');
if (lifeInput && lifeRange) {
  lifeInput.addEventListener('input', e => {
    lifeRange.value = lifeInput.value;
    update();
  });
  lifeRange.addEventListener('input', e => {
    lifeInput.value = lifeRange.value;
    update();
  });
}

const ageInput = document.getElementById('age');
if (ageInput && lifeRange) {
  ageInput.addEventListener('input', e => {
    lifeRange.min = ageInput.value;
    if (Number(lifeRange.value) < Number(ageInput.value)) {
      lifeRange.value = ageInput.value;
      lifeInput.value = ageInput.value;
      update();
    }
  });
  // 初期化時にもminを設定
  lifeRange.min = ageInput.value;
}

// 年齢の有無による寿命欄の表示切替
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