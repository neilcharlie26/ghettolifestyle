const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
const numeric = value => Math.max(0, Number(value) || 0);
const cents = value => Math.round(numeric(value) * 100);
function transactionNumber() { return 'GL-' + new Date().toISOString().slice(0,10).replaceAll('-','') + '-' + crypto.randomUUID().slice(0,8).toUpperCase(); }
function addItem(name = '', quantity = 1, price = '') {
  const row = document.createElement('div'); row.className = 'item';
  row.innerHTML = '<div class="item-top"><input class="name" aria-label="Product name" placeholder="Product name" maxlength="160"><button class="remove" type="button" aria-label="Remove product">×</button></div><div class="item-numbers"><label>Quantity<input class="quantity" type="number" min="1" max="1000000" step="1" required></label><label>Unit price (₱)<input class="price" type="number" min="0" max="1000000000" step="0.01" placeholder="0.00" required></label><output class="line-total"></output></div>';
  row.querySelector('.name').value = name; row.querySelector('.quantity').value = quantity; row.querySelector('.price').value = price;
  row.querySelector('.remove').onclick = () => { row.remove(); if (!$('items').children.length) addItem(); update(); };
  $('items').append(row); update();
}
function update() {
  const paper = $('paper-size').value;
  const sizes = {a4: {label:'A4',width:210,height:297},letter: {label:'LETTER',width:215.9,height:279.4},legal: {label:'LEGAL',width:215.9,height:355.6}};
  const selected = sizes[paper] || sizes.a4;
  document.documentElement.style.setProperty('--paper-ratio', (selected.width - 16) + ' / ' + (selected.height - 18));
  document.body.dataset.paper = paper;
  $('paper-label').textContent = selected.label + ' · 20 ITEMS / PAGE';
  document.documentElement.style.setProperty('--print-zoom', (selected.width - 16) * 96 / 25.4 / 490);
  document.documentElement.style.setProperty('--sheet-height', ((selected.height - 17) * 490 / (selected.width - 16)) + 'px');
  $('paper-print-style').textContent = '@page{size:' + selected.width + 'mm ' + selected.height + 'mm;margin:8mm}';
  const method = $('method').value;
  const isOther = method === 'Others';
  const needsReference = isOther ? $('other-online').value === 'yes' : !['Cash', 'Cash on delivery (COD)'].includes(method);
  $('other-method-field').hidden = !isOther;
  $('other-online-field').hidden = !isOther;
  $('other-method').required = isOther;
  $('reference-field').hidden = !needsReference;
  $('reference').required = needsReference;
  $('r-reference-row').hidden = !needsReference;
  $('r-reference').textContent = $('reference').value.trim() || 'Pending';
  $('r-customer').textContent = $('customer').value.trim() || 'Walk-in customer';
  $('r-seller').textContent = $('seller').value.trim() || 'Received by';
  $('r-transaction').textContent = $('transaction').value;
  $('r-date').textContent = $('date').value ? new Date($('date').value + 'T12:00:00').toLocaleDateString('en-PH', {month:'long',day:'numeric',year:'numeric'}) : '—';
  $('r-method').textContent = isOther ? $('other-method').value.trim() || 'Others' : method;
  $('r-items').replaceChildren(); let subtotal = 0;
  document.querySelectorAll('.item').forEach(row => {
    const qty = numeric(row.querySelector('.quantity').value); const unit = cents(row.querySelector('.price').value); const total = Math.round(qty * unit); subtotal += total;
    row.querySelector('output').textContent = money(total / 100);
    const tr = document.createElement('tr');
    [row.querySelector('.name').value.trim() || 'Product name', qty, money(unit / 100), money(total / 100)].forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.append(td); });
    $('r-items').append(tr);
  });
  const discount = Math.min(subtotal, cents($('discount').value)); const total = subtotal - discount; const paid = cents($('paid').value); const change = Math.max(0,paid-total); const balance = Math.max(0,total-paid);
  $('paid').required = true;
  $('paid').min = (total / 100).toFixed(2);
  $('paid').setCustomValidity(balance > 0 ? 'Kulang ang bayad ng ' + money(balance / 100) + '. Dapat bayad nang buo bago mag-print o mag-save ng PDF.' : '');
  for (const [key,value] of Object.entries({subtotal,discount,total,paid,change,balance})) $('r-'+key).textContent = money(value/100);
  $('discount-row').hidden = discount === 0; $('balance-row').hidden = balance === 0;
  $('r-state').textContent = total === 0 ? 'DRAFT' : balance === 0 ? 'PAID' : paid > 0 ? 'PARTIALLY PAID' : 'AWAITING PAYMENT';
  $('r-state').classList.toggle('settled', total > 0 && balance === 0);
  $('payment-status').classList.toggle('underpaid', balance > 0);
  $('payment-status').textContent = balance ? 'Kulang ang bayad ng ' + money(balance/100) + '. Full payment required bago mag-print / PDF.' : cents($('discount').value) > subtotal ? 'Discount is capped at the subtotal.' : total === 0 ? 'Enter products and payment details.' : 'Fully paid · Change: ' + money(change/100);
  paginateReceipt();
  const widthScale = (selected.width - 16) * 96 / 25.4 / 490;
  const tallest = Math.max(...[...document.querySelectorAll('.receipt-page')].map(page => {
    const rect = page.getBoundingClientRect();
    return rect.width ? rect.height * 490 / rect.width : 0;
  }));
  const printScale = Math.min(widthScale, (selected.height - 18) * 96 / 25.4 / (tallest + 12));
  document.documentElement.style.setProperty('--print-zoom', printScale);
  document.documentElement.style.setProperty('--sheet-height', ((selected.height - 18) * 96 / 25.4 / printScale) + 'px');
}
function paginateReceipt() {
  document.querySelectorAll('.receipt-continuation').forEach(page => page.remove());
  const original = $('receipt');
  original.querySelectorAll('[id]').forEach(el => el.classList.add(el.id));
  const rows = [...$('r-items').children];
  const count = Math.max(1, Math.ceil(rows.length / 20));
  original.querySelector('.totals').hidden = false;
  original.querySelector('.receipt-signoff').hidden = false;
  original.querySelectorAll('.page-number,.continued-note').forEach(el => el.remove());
  const pages = [original];
  let previous = original;
  for (let index = 1; index < count; index++) {
    const page = original.cloneNode(true);
    page.classList.add('receipt-continuation');
    page.removeAttribute('id');
    page.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    page.querySelector('tbody').replaceChildren(...rows.slice(index * 20, (index + 1) * 20).map(row => row.cloneNode(true)));
    previous.after(page); previous = page; pages.push(page);
  }
  $('r-items').replaceChildren(...rows.slice(0,20));
  pages.forEach((page,index) => {
    const last = index === count - 1;
    page.querySelector('.totals').hidden = !last;
    page.querySelector('.receipt-signoff').hidden = !last;
    if (!last) {
      const note = document.createElement('p'); note.className = 'continued-note';
      note.textContent = 'Continued on next page · Final totals on page ' + count;
      page.querySelector('table').after(note);
    }
    const number = document.createElement('small'); number.className = 'page-number';
    number.textContent = 'Page ' + (index + 1) + ' of ' + count;
    page.querySelector('.receipt-footer').append(number);
  });
}
function resetReceipt() {
  const paper = $('paper-size').value;
  $('form').reset(); $('transaction').value = transactionNumber();
  $('paper-size').value = paper;
  document.querySelectorAll('[data-clear]').forEach(button => button.click());
  const now = new Date(); $('date').value = [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  $('items').replaceChildren(); addItem();
}
$('form').addEventListener('input',update); $('form').addEventListener('change',update);
$('add').onclick = () => addItem();
$('new').onclick = () => { $('new-receipt-modal').returnValue = ''; $('new-receipt-modal').showModal(); };
$('new-receipt-modal').addEventListener('close', () => {
  if ($('new-receipt-modal').returnValue === 'confirm') {
    resetReceipt();
    $('customer').focus();
  }
});
$('form').onsubmit = event => { event.preventDefault(); for (const id of ['other-method','reference']) { const field = $(id); if (field.required && !field.value.trim()) { field.focus(); field.setCustomValidity(id === 'reference' ? 'Enter the payment reference number.' : 'Enter the payment method.'); field.reportValidity(); field.setCustomValidity(''); return; } } const rows = [...document.querySelectorAll('.item')]; const invalid = rows.find(row => !row.querySelector('.name').value.trim()); if (invalid) { invalid.querySelector('.name').focus(); invalid.querySelector('.name').setCustomValidity('Enter a product name.'); invalid.querySelector('.name').reportValidity(); invalid.querySelector('.name').setCustomValidity(''); return; } update(); window.print(); };
// Fixed high-resolution canvases keep signatures sharp without losing strokes on resize.
for (const person of ['seller']) {
  const canvas = $(person + '-pad');
  const context = canvas.getContext('2d');
  const image = $(person + '-signature');
  let activePointer = null;
  const position = event => {
    const box = canvas.getBoundingClientRect();
    return [(event.clientX - box.left) * canvas.width / box.width, (event.clientY - box.top) * canvas.height / box.height];
  };
  context.strokeStyle = '#163148'; context.fillStyle = '#163148';
  context.lineWidth = 5; context.lineCap = 'round'; context.lineJoin = 'round';
  const sync = () => { image.src = canvas.toDataURL('image/png'); image.hidden = false; update(); };
  canvas.addEventListener('pointerdown', event => {
    if (activePointer !== null || event.button > 0) return;
    event.preventDefault(); activePointer = event.pointerId; canvas.setPointerCapture(activePointer);
    const [x,y] = position(event); context.beginPath(); context.arc(x,y,2.5,0,Math.PI*2); context.fill();
    context.beginPath(); context.moveTo(x,y); sync();
  });
  canvas.addEventListener('pointermove', event => {
    if (activePointer !== event.pointerId) return;
    event.preventDefault(); context.lineTo(...position(event)); context.stroke(); sync();
  });
  const end = event => { if (activePointer === event.pointerId) { activePointer = null; sync(); } };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end); canvas.addEventListener('lostpointercapture', end);
  document.querySelector('[data-clear="' + person + '"]').onclick = () => {
    activePointer = null; context.clearRect(0,0,canvas.width,canvas.height); image.removeAttribute('src'); image.hidden = true; update();
  };
}
resetReceipt();

