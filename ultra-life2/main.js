const fileInput = document.getElementById('fileInput');
const stock = document.getElementById('stock');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const deleteBtn = document.getElementById('deleteBtn');
const addTextBtn = document.getElementById('addTextBtn');
const textInput = document.getElementById('textInput');
const fontSelect = document.getElementById('fontSelect');
const addRectBtn = document.getElementById('addRectBtn');
const addCircleBtn = document.getElementById('addCircleBtn');
const toFrontBtn = document.getElementById('toFrontBtn');
const forwardBtn = document.getElementById('forwardBtn');
const backwardBtn = document.getElementById('backwardBtn');
const toBackBtn = document.getElementById('toBackBtn');
const colorPicker = document.getElementById('colorPicker');
const objWidthInput = document.getElementById('objWidth');
const objHeightInput = document.getElementById('objHeight');

let images = [];
let canvasObjects = [];
let selectedObject = null;
let dragOffset = {x:0, y:0};
let scaleStart = null;
let scaleHandle = null;
const HANDLE_SIZE = 16;
let isDragging = false;
let currentColor = colorPicker.value;
let editingTextObj = null;
let textEditInput = null;
let isEditingSize = false;

// 画面サイズに合わせてcanvasをリサイズ
function resizeCanvas() {
  const right = document.getElementById('right');
  const pad = 24;
  const w = Math.min(window.innerWidth - 260, 1200);
  const h = Math.min(window.innerHeight - 32, 800);
  canvas.width = w > 320 ? w : 320;
  canvas.height = h > 240 ? h : 240;
  drawCanvas();
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('DOMContentLoaded', resizeCanvas);

// ①ファイルアップロード
fileInput.addEventListener('change', e => {
  handleFiles(e.target.files);
});

// ファイル選択カスタムボタンのクリックでinput[type=file]を開く
const fileInputLabel = document.getElementById('fileInputLabel');
fileInputLabel.addEventListener('click', () => {
  fileInput.click();
});

// ストック部分へのドラッグ&ドロップ
stock.addEventListener('dragover', e => {
  e.preventDefault();
  stock.style.background = '#e0f7fa';
});
stock.addEventListener('dragleave', e => {
  e.preventDefault();
  stock.style.background = '';
});
stock.addEventListener('drop', e => {
  e.preventDefault();
  stock.style.background = '';
  const files = e.dataTransfer.files;
  if (files && files.length > 0) {
    handleFiles(files);
  }
});

function handleFiles(fileList) {
  for (const file of fileList) {
    if (!file.type.startsWith('image/')) continue;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img._objectUrl = url;
    img.onload = () => {
      images.push(img);
      renderStock();
    };
  }
}

function removeImage(idx) {
  const img = images[idx];
  if (img && img._objectUrl) {
    URL.revokeObjectURL(img._objectUrl);
  }
  images.splice(idx, 1);
  renderStock();
}

function renderStock() {
  while (stock.firstChild) stock.removeChild(stock.firstChild);
  images.forEach((img, idx) => {
    const thumb = document.createElement('img');
    thumb.src = img.src;
    thumb.draggable = true;
    thumb.ondragstart = ev => {
      ev.dataTransfer.setData('imgIdx', idx);
    };
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'stock-del-btn';
    delBtn.onclick = e => {
      e.stopPropagation();
      removeImage(idx);
    };
    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'stock-thumb-wrap';
    thumbWrap.appendChild(thumb);
    thumbWrap.appendChild(delBtn);
    stock.appendChild(thumbWrap);
  });
}

// ③ストック→キャンバス D&D
canvas.addEventListener('dragover', e => e.preventDefault());
canvas.addEventListener('drop', e => {
  e.preventDefault();
  const idx = e.dataTransfer.getData('imgIdx');
  if (idx !== '') {
    const img = images[idx];
    canvasObjects.push({
      type: 'image',
      img,
      x: e.offsetX - img.width/4,
      y: e.offsetY - img.height/4,
      w: img.width/2,
      h: img.height/2
    });
    drawCanvas();
  }
});

// ハンドルの位置を返す
function getHandles(obj) {
  const {x, y, w, h} = obj;
  return {
    nw: {x: x, y: y},
    n:  {x: x + w/2, y: y},
    ne: {x: x + w, y: y},
    e:  {x: x + w, y: y + h/2},
    se: {x: x + w, y: y + h},
    s:  {x: x + w/2, y: y + h},
    sw: {x: x, y: y + h},
    w:  {x: x, y: y + h/2}
  };
}

function hitHandle(mx, my, handles) {
  for (const key in handles) {
    const hx = handles[key].x, hy = handles[key].y;
    if (mx >= hx - HANDLE_SIZE/2 && mx <= hx + HANDLE_SIZE/2 && my >= hy - HANDLE_SIZE/2 && my <= hy + HANDLE_SIZE/2) {
      return key;
    }
  }
  return null;
}

function updateSizeInputs() {
  if (selectedObject) {
    objWidthInput.value = Math.round(selectedObject.w);
    objHeightInput.value = Math.round(selectedObject.h);
    objWidthInput.disabled = false;
    objHeightInput.disabled = false;
  } else {
    objWidthInput.value = '';
    objHeightInput.value = '';
    objWidthInput.disabled = true;
    objHeightInput.disabled = true;
  }
}

objWidthInput.addEventListener('input', () => {
  if (selectedObject) {
    const val = objWidthInput.value;
    // 入力が空欄や0のときは何もしない（サイズもselectedObjectも変更しない）
    if (val !== '' && !isNaN(val) && Number(val) > 0) {
      selectedObject.w = Math.max(1, Number(val));
      drawCanvas();
    }
  }
});
objHeightInput.addEventListener('input', () => {
  if (selectedObject) {
    const val = objHeightInput.value;
    // 入力が空欄や0のときは何もしない（サイズもselectedObjectも変更しない）
    if (val !== '' && !isNaN(val) && Number(val) > 0) {
      selectedObject.h = Math.max(1, Number(val));
      drawCanvas();
    }
  }
});

objWidthInput.addEventListener('focus', () => { isEditingSize = true; });
objWidthInput.addEventListener('blur', () => { isEditingSize = false; });
objHeightInput.addEventListener('focus', () => { isEditingSize = true; });
objHeightInput.addEventListener('blur', () => { isEditingSize = false; });

// 選択変更時にサイズ欄を更新
function setColorPickerToSelected() {
  if (selectedObject && (selectedObject.type === 'text' || selectedObject.type === 'rect' || selectedObject.type === 'circle')) {
    colorPicker.value = selectedObject.color || '#222222';
    currentColor = colorPicker.value;
  }
  updateSizeInputs();
}

// ④選択・移動・拡大縮小
canvas.addEventListener('mousedown', e => {
  const mx = e.offsetX, my = e.offsetY;
  let found = false;
  for (let i = canvasObjects.length-1; i >= 0; i--) {
    const obj = canvasObjects[i];
    if (selectedObject === obj) {
      const handles = getHandles(obj);
      const handle = hitHandle(mx, my, handles);
      if (handle) {
        scaleHandle = handle;
        scaleStart = {x: mx, y: my, ...obj};
        selectedObject = obj;
        isDragging = false;
        found = true;
        break;
      }
    }
    if (mx > obj.x && mx < obj.x+obj.w && my > obj.y && my < obj.y+obj.h) {
      selectedObject = obj;
      dragOffset.x = mx - obj.x;
      dragOffset.y = my - obj.y;
      isDragging = true;
      found = true;
      break;
    }
  }
  if (!found) {
    selectedObject = null;
    isDragging = false;
  }
  setColorPickerToSelected();
  drawCanvas();
});

canvas.addEventListener('mousemove', e => {
  if (!selectedObject) return;
  if (scaleHandle && scaleStart) {
    // 拡大縮小
    const dx = e.offsetX - scaleStart.x;
    const dy = e.offsetY - scaleStart.y;
    let {x, y, w, h} = scaleStart;
    switch (scaleHandle) {
      case 'nw':
        selectedObject.x = x + dx;
        selectedObject.y = y + dy;
        selectedObject.w = w - dx;
        selectedObject.h = h - dy;
        break;
      case 'n':
        selectedObject.y = y + dy;
        selectedObject.h = h - dy;
        break;
      case 'ne':
        selectedObject.y = y + dy;
        selectedObject.w = w + dx;
        selectedObject.h = h - dy;
        break;
      case 'e':
        selectedObject.w = w + dx;
        break;
      case 'se':
        selectedObject.w = w + dx;
        selectedObject.h = h + dy;
        break;
      case 's':
        selectedObject.h = h + dy;
        break;
      case 'sw':
        selectedObject.x = x + dx;
        selectedObject.w = w - dx;
        selectedObject.h = h + dy;
        break;
      case 'w':
        selectedObject.x = x + dx;
        selectedObject.w = w - dx;
        break;
    }
    selectedObject.w = Math.max(20, selectedObject.w);
    selectedObject.h = Math.max(20, selectedObject.h);
    drawCanvas();
    return;
  } else if (isDragging && selectedObject && !scaleHandle) {
    // ドラッグ中のみプレビュー
    selectedObject.x = e.offsetX - dragOffset.x;
    selectedObject.y = e.offsetY - dragOffset.y;
    drawCanvas();
  }
});

canvas.addEventListener('mouseup', e => {
  if (scaleHandle) {
    scaleHandle = null;
    scaleStart = null;
  }
  if (isDragging) {
    // ドロップ時に位置を確定
    isDragging = false;
  }
  dragOffset = {x:0, y:0};
  drawCanvas();
});

document.addEventListener('keydown', e => {
  // サイズ入力欄編集中はDelete/Backspaceで削除しない
  if (isEditingSize && (e.key === 'Delete' || e.key === 'Backspace')) {
    return;
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObject) {
    const idx = canvasObjects.indexOf(selectedObject);
    if (idx !== -1) {
      canvasObjects.splice(idx, 1);
      selectedObject = null;
      setColorPickerToSelected();
      drawCanvas();
    }
  }
});

deleteBtn.onclick = () => {
  if (selectedObject) {
    const idx = canvasObjects.indexOf(selectedObject);
    if (idx !== -1) {
      canvasObjects.splice(idx, 1);
      selectedObject = null;
      setColorPickerToSelected();
      drawCanvas();
    }
  }
};

colorPicker.addEventListener('input', e => {
  currentColor = e.target.value;
  // 選択中の図形がテキスト・四角・円なら色を即時反映
  if (selectedObject && (selectedObject.type === 'text' || selectedObject.type === 'rect' || selectedObject.type === 'circle')) {
    selectedObject.color = currentColor;
    drawCanvas();
  }
});

function measureTextBox(text, fontSize, font) {
  ctx.save();
  ctx.font = `${fontSize || 24}px ${font || 'sans-serif'}`;
  const metrics = ctx.measureText(text);
  ctx.restore();
  const w = metrics.width + 24;
  const h = Math.max(fontSize * 1.6, 40);
  return { w, h };
}

addTextBtn.onclick = () => {
  const text = textInput.value.trim();
  // 入力値検証: 1～100文字、危険な文字列除外
  if (!text || text.length > 100 || /[<>]/.test(text)) return;
  const font = fontSelect.value || 'sans-serif';
  const fontSize = 24;
  const { w, h } = measureTextBox(text, fontSize, font);
  canvasObjects.push({
    type: 'text',
    text,
    x: 40,
    y: 40,
    w,
    h,
    fontSize,
    font,
    color: currentColor
  });
  textInput.value = '';
  drawCanvas();
};

addRectBtn.onclick = () => {
  canvasObjects.push({
    type: 'rect',
    x: 60,
    y: 60,
    w: 100,
    h: 60,
    color: currentColor
  });
  drawCanvas();
};

addCircleBtn.onclick = () => {
  canvasObjects.push({
    type: 'circle',
    x: 120,
    y: 120,
    w: 80,
    h: 80,
    color: currentColor
  });
  drawCanvas();
};

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvasObjects.forEach(obj => {
    if (obj.type === 'image') {
      ctx.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h);
    } else if (obj.type === 'text') {
      ctx.save();
      ctx.font = `${obj.fontSize || 24}px ${obj.font || 'sans-serif'}`;
      ctx.fillStyle = obj.color || '#222';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(obj.text, obj.x + obj.w/2, obj.y + obj.h/2, obj.w-8);
      ctx.restore();
    } else if (obj.type === 'rect') {
      ctx.save();
      ctx.fillStyle = obj.color || '#81c784';
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
      ctx.restore();
    } else if (obj.type === 'circle') {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(obj.x + obj.w/2, obj.y + obj.h/2, obj.w/2, obj.h/2, 0, 0, 2 * Math.PI);
      ctx.fillStyle = obj.color || '#4fc3f7';
      ctx.fill();
      ctx.restore();
    }
    if (obj === selectedObject) {
      ctx.save();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
      const handles = getHandles(obj);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      for (const key in handles) {
        const hx = handles[key].x, hy = handles[key].y;
        ctx.beginPath();
        ctx.arc(hx, hy, HANDLE_SIZE/2, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  });
  updateSizeInputs();
}

// ⑤PNGダウンロード
downloadBtn.onclick = () => {
  drawCanvas();
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = 'canvas.png';
  a.click();
};

canvas.addEventListener('wheel', e => {
  if (selectedObject) {
    e.preventDefault();
    // Googleスライド風: Ctrlなしで選択オブジェクト拡大縮小
    let scale = (e.deltaY < 0) ? 1.08 : 0.92;
    // 拡大縮小の中心をオブジェクト中心に
    const cx = selectedObject.x + selectedObject.w/2;
    const cy = selectedObject.y + selectedObject.h/2;
    const newW = Math.max(20, selectedObject.w * scale);
    const newH = Math.max(20, selectedObject.h * scale);
    selectedObject.x = cx - newW/2;
    selectedObject.y = cy - newH/2;
    selectedObject.w = newW;
    selectedObject.h = newH;
    // テキストの場合はフォントサイズもスケール
    if (selectedObject.type === 'text') {
      selectedObject.fontSize = Math.max(8, (selectedObject.fontSize || 24) * scale);
    }
    drawCanvas();
  }
});

toFrontBtn.onclick = () => {
  if (!selectedObject) return;
  const idx = canvasObjects.indexOf(selectedObject);
  if (idx !== -1) {
    canvasObjects.splice(idx, 1);
    canvasObjects.push(selectedObject);
    drawCanvas();
  }
};

forwardBtn.onclick = () => {
  if (!selectedObject) return;
  const idx = canvasObjects.indexOf(selectedObject);
  if (idx !== -1 && idx < canvasObjects.length - 1) {
    [canvasObjects[idx], canvasObjects[idx + 1]] = [canvasObjects[idx + 1], canvasObjects[idx]];
    drawCanvas();
  }
};

backwardBtn.onclick = () => {
  if (!selectedObject) return;
  const idx = canvasObjects.indexOf(selectedObject);
  if (idx > 0) {
    [canvasObjects[idx], canvasObjects[idx - 1]] = [canvasObjects[idx - 1], canvasObjects[idx]];
    drawCanvas();
  }
};

toBackBtn.onclick = () => {
  if (!selectedObject) return;
  const idx = canvasObjects.indexOf(selectedObject);
  if (idx !== -1) {
    canvasObjects.splice(idx, 1);
    canvasObjects.unshift(selectedObject);
    drawCanvas();
  }
};

canvas.addEventListener('dblclick', e => {
  const mx = e.offsetX, my = e.offsetY;
  for (let i = canvasObjects.length-1; i >= 0; i--) {
    const obj = canvasObjects[i];
    if (obj.type === 'text' && mx > obj.x && mx < obj.x+obj.w && my > obj.y && my < obj.y+obj.h) {
      editingTextObj = obj;
      showTextEditInput(obj);
      break;
    }
  }
});

function showTextEditInput(obj) {
  if (textEditInput) {
    textEditInput.remove();
    textEditInput = null;
  }
  const rect = canvas.getBoundingClientRect();
  textEditInput = document.createElement('input');
  textEditInput.type = 'text';
  textEditInput.value = obj.text;
  textEditInput.style.position = 'absolute';
  textEditInput.style.left = (rect.left + obj.x) + 'px';
  textEditInput.style.top = (rect.top + obj.y) + 'px';
  textEditInput.style.width = obj.w + 'px';
  textEditInput.style.height = obj.h + 'px';
  textEditInput.style.fontSize = (obj.fontSize || 24) + 'px';
  textEditInput.style.fontFamily = obj.font || 'sans-serif';
  textEditInput.style.color = obj.color || '#222';
  textEditInput.style.background = 'rgba(255,255,200,0.9)';
  textEditInput.style.border = '1.5px solid #888';
  textEditInput.style.zIndex = 1000;
  textEditInput.style.padding = '0 4px';
  textEditInput.style.boxSizing = 'border-box';
  document.body.appendChild(textEditInput);
  textEditInput.focus();
  textEditInput.select();

  function finishEdit() {
    if (editingTextObj && textEditInput) {
      editingTextObj.text = textEditInput.value;
      // テキスト内容に合わせてボックスサイズを自動調整
      const { w, h } = measureTextBox(editingTextObj.text, editingTextObj.fontSize, editingTextObj.font);
      editingTextObj.w = w;
      editingTextObj.h = h;
      editingTextObj = null;
      textEditInput.remove();
      textEditInput = null;
      drawCanvas();
    }
  }
  textEditInput.addEventListener('blur', finishEdit);
  textEditInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      finishEdit();
    }
    if (e.key === 'Escape') {
      editingTextObj = null;
      textEditInput.remove();
      textEditInput = null;
      drawCanvas();
    }
  });
} 