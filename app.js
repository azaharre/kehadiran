// Prototaip sahaja: nama murid contoh dan rekod disimpan dalam localStorage pelayar.
// Jangan gunakan untuk data sebenar sehingga Supabase Auth + RLS siap.
const sampleStudents = {
  '4 Bakawali': ['Murid Contoh 01','Murid Contoh 02','Murid Contoh 03','Murid Contoh 04','Murid Contoh 05','Murid Contoh 06'],
  '4 Cempaka': ['Murid Contoh 07','Murid Contoh 08','Murid Contoh 09','Murid Contoh 10','Murid Contoh 11'],
  '4 Kenanga': ['Murid Contoh 12','Murid Contoh 13','Murid Contoh 14','Murid Contoh 15'],
  '4 Seroja': ['Murid Contoh 16','Murid Contoh 17','Murid Contoh 18','Murid Contoh 19','Murid Contoh 20']
};
const statusLabels = {present:'Hadir', absent:'Tidak hadir', late:'Lewat', excused:'Bersebab'};
const classSelect = document.querySelector('#classSelect');
const dateInput = document.querySelector('#attendanceDate');
const searchInput = document.querySelector('#searchInput');
const rows = document.querySelector('#studentRows');
const emptyState = document.querySelector('#emptyState');
const today = new Date();
dateInput.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
const keyForCurrent = () => `ekehadiran-demo:${classSelect.value}:${dateInput.value}`;
const readStatuses = () => { try { return JSON.parse(localStorage.getItem(keyForCurrent()) || '{}'); } catch { return {}; } };
const writeStatuses = data => { localStorage.setItem(keyForCurrent(), JSON.stringify(data)); };
function render(){
  const students = sampleStudents[classSelect.value] || [];
  const statuses = readStatuses();
  const query = searchInput.value.trim().toLocaleLowerCase('ms');
  rows.replaceChildren();
  let visible = 0;
  students.forEach((name,index)=>{
    if (!name.toLocaleLowerCase('ms').includes(query)) return;
    visible++;
    const tr = document.createElement('tr');
    const num = document.createElement('td'); num.className='num'; num.textContent=String(index+1);
    const nameCell = document.createElement('td'); nameCell.className='student-name'; nameCell.textContent=name;
    const statusCell = document.createElement('td');
    const select = document.createElement('select'); select.className='status-select'; select.setAttribute('aria-label',`Status ${name}`);
    const blank = document.createElement('option'); blank.value=''; blank.textContent='Belum ditanda'; select.append(blank);
    Object.entries(statusLabels).forEach(([value,label])=>{const opt=document.createElement('option');opt.value=value;opt.textContent=label;select.append(opt);});
    select.value=statuses[index] || ''; applyStatusClass(select);
    select.addEventListener('change',()=>{const current=readStatuses();if(select.value)current[index]=select.value;else delete current[index];writeStatuses(current);applyStatusClass(select);updateStats();document.querySelector('#saveStatus').textContent='Rekod prototaip disimpan dalam pelayar ini sahaja.';});
    statusCell.append(select);tr.append(num,nameCell,statusCell);rows.append(tr);
  });
  emptyState.hidden = visible !== 0;
  updateStats();
}
function applyStatusClass(select){select.classList.remove('present','absent','late','excused');if(select.value)select.classList.add(select.value);}
function updateStats(){
  const students=sampleStudents[classSelect.value]||[];const statuses=readStatuses();
  document.querySelector('#totalCount').textContent=students.length;
  document.querySelector('#presentCount').textContent=students.filter((_,i)=>statuses[i]==='present').length;
  document.querySelector('#absentCount').textContent=students.filter((_,i)=>statuses[i]==='absent').length;
  document.querySelector('#unmarkedCount').textContent=students.filter((_,i)=>!statuses[i]).length;
}
classSelect.addEventListener('change',render);dateInput.addEventListener('change',render);searchInput.addEventListener('input',render);
document.querySelector('#allPresentBtn').addEventListener('click',()=>{const statuses={};(sampleStudents[classSelect.value]||[]).forEach((_,i)=>statuses[i]='present');writeStatuses(statuses);render();document.querySelector('#saveStatus').textContent='Semua murid ditanda hadir dalam prototaip ini.';});
document.querySelector('#resetBtn').addEventListener('click',()=>{if(confirm('Kosongkan semua tanda bagi kelas dan tarikh ini?')){localStorage.removeItem(keyForCurrent());render();document.querySelector('#saveStatus').textContent='Tanda kehadiran bagi kelas dan tarikh ini telah dikosongkan.';}});
document.querySelector('#exportBtn').addEventListener('click',()=>{const students=sampleStudents[classSelect.value]||[];const statuses=readStatuses();const csv=[['Bil','Nama murid','Kelas','Tarikh','Status'],...students.map((name,i)=>[i+1,name,classSelect.value,dateInput.value,statusLabels[statuses[i]]||'Belum ditanda'])].map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`kehadiran-${classSelect.value.replaceAll(' ','-')}-${dateInput.value}.csv`;a.click();URL.revokeObjectURL(url);});
render();
