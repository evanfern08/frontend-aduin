/**
 * ============================================================
 * ADUIN - MODUL TEKNISI / EKSEKUTOR PEMELIHARAAN (FINAL)
 * ============================================================
 */

(function () {
    'use strict';

    const STORAGE_KEY_TASKS = 'aduin_teknisi_tasks';
    const STORAGE_KEY_HISTORY = 'aduin_teknisi_history';

    let globalTasks = [];
    let globalHistory = [];

    // ============================================================
    // 1. STORAGE
    // ============================================================
    function initTeknisiStorage(initialData) {
        const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
        const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);

        if (savedTasks !== null) {
            globalTasks = JSON.parse(savedTasks);
        } else {
            globalTasks = initialData.tugas_aktif || [];
            localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(globalTasks));
        }

        if (savedHistory !== null) {
            globalHistory = JSON.parse(savedHistory);
        } else {
            globalHistory = initialData.riwayat || [];
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(globalHistory));
        }
    }

    function getTasks() { return globalTasks; }
    function saveTasks(tasks) { 
        globalTasks = tasks; 
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)); 
    }

    function getHistory() { return globalHistory; }
    function saveHistory(history) { 
        globalHistory = history; 
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history)); 
    }

    // ============================================================
    // 2. TOAST
    // ============================================================
    function showTeknisiToast(pesan, tipe = 'success') {
        let toastContainer = document.getElementById('teknisiToastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'teknisiToastContainer';
            toastContainer.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;';
            document.body.appendChild(toastContainer);
        }
        const toast = document.createElement('div');
        const isSuccess = tipe === 'success';
        toast.style.cssText = `background: ${isSuccess ? '#0f172a' : '#b91c1c'}; color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px;`;
        toast.innerHTML = `<span>${isSuccess ? '✓' : '⚠'}</span> <span>${pesan}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3200);
    }

    // ============================================================
    // 3. MODAL UPDATE TUGAS
    // ============================================================
    let activeModalTaskId = null;

    function ensureModalExists() {
        if (document.getElementById('modalTeknisiUpdate')) return;

        const modalHTML = `
            <div id="modalTeknisiUpdate" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 16px;">
                <div style="background: #ffffff; border-radius: 16px; max-width: 500px; width: 100%; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; margin-bottom: 16px;">
                        <div>
                            <span id="modalTaskCode" style="font-size: 11px; font-weight: 700; background: #e0f2fe; color: #0284c7; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">TK-101</span>
                            <h3 id="modalTaskTitle" style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 6px 0 0 0;">Update Pengerjaan Tugas</h3>
                        </div>
                        <button type="button" id="btnTutupModalTeknisi" style="background: none; border: none; font-size: 22px; color: #94a3b8; cursor: pointer; line-height: 1;">&times;</button>
                    </div>
                    <form id="formTeknisiUpdate">
                        <div style="margin-bottom: 14px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Status Pengerjaan</label>
                            <select id="selectStatusTugas" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; color: #1e293b; background: #f8fafc; outline: none; cursor: pointer;">
                                <option value="Tugas Baru">Tugas Baru (Belum Mulai)</option>
                                <option value="Sedang Dikerjakan">Sedang Dikerjakan (Dalam Proses)</option>
                                <option value="Selesai">Selesai (Perbaikan Tuntas)</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 14px;">
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Catatan Hasil Perbaikan</label>
                            <textarea id="textareaCatatanPerbaikan" rows="3" placeholder="Contoh: Kabel power dan sekring diganti..." style="width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #1e293b; background: #f8fafc; outline: none; resize: vertical;"></textarea>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
                            <div style="border: 1px dashed #cbd5e1; border-radius: 8px; padding: 10px; text-align: center; background: #f8fafc;">
                                <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">Foto Sebelum</label>
                                <input type="file" id="fileFotoSebelum" accept="image/*" style="font-size: 11px; width: 100%; color: #64748b;">
                                <div id="previewFotoSebelumWrap" style="margin-top: 6px; display: none;">
                                    <img id="imgPreviewFotoSebelum" src="" style="max-height: 55px; border-radius: 4px; margin: 0 auto; display: block; border: 1px solid #e2e8f0;">
                                </div>
                            </div>
                            <div style="border: 1px dashed #cbd5e1; border-radius: 8px; padding: 10px; text-align: center; background: #f8fafc;">
                                <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">Foto Sesudah</label>
                                <input type="file" id="fileFotoSesudah" accept="image/*" style="font-size: 11px; width: 100%; color: #64748b;">
                                <div id="previewFotoSesudahWrap" style="margin-top: 6px; display: none;">
                                    <img id="imgPreviewFotoSesudah" src="" style="max-height: 55px; border-radius: 4px; margin: 0 auto; display: block; border: 1px solid #e2e8f0;">
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
                            <button type="button" id="btnBatalTeknisiModal" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer;">Batal</button>
                            <button type="submit" id="btnSimpanTeknisiTask" style="padding: 8px 18px; border-radius: 8px; border: none; background: #0284c7; color: #ffffff; font-size: 13px; font-weight: 600; cursor: pointer;">Simpan Perubahan</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('modalTeknisiUpdate');
        const closeModal = () => { modal.style.display = 'none'; activeModalTaskId = null; };

        document.getElementById('btnTutupModalTeknisi')?.addEventListener('click', closeModal);
        document.getElementById('btnBatalTeknisiModal')?.addEventListener('click', closeModal);

        const setupPreview = (inputId, imgId, wrapId) => {
            document.getElementById(inputId)?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => { document.getElementById(imgId).src = evt.target.result; document.getElementById(wrapId).style.display = 'block'; };
                    reader.readAsDataURL(file);
                }
            });
        };
        setupPreview('fileFotoSebelum', 'imgPreviewFotoSebelum', 'previewFotoSebelumWrap');
        setupPreview('fileFotoSesudah', 'imgPreviewFotoSesudah', 'previewFotoSesudahWrap');

        document.getElementById('formTeknisiUpdate')?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeModalTaskId) return;

            const newStatus = document.getElementById('selectStatusTugas').value;
            const notes = document.getElementById('textareaCatatanPerbaikan').value.trim();
            const tasks = getTasks();
            const history = getHistory();
            
            const taskIndex = tasks.findIndex(t => t.id === activeModalTaskId);
            const historyIndex = history.findIndex(h => h.id === activeModalTaskId);

            const previewBefore = document.getElementById('imgPreviewFotoSebelum')?.src;
            const previewAfter = document.getElementById('imgPreviewFotoSesudah')?.src;

            if (historyIndex !== -1) {
                const currentHistory = history[historyIndex];
                currentHistory.status = newStatus;
                if (notes) currentHistory.catatan = notes;
                if (previewBefore && previewBefore.startsWith('data:image')) currentHistory.fotoSebelum = previewBefore;
                if (previewAfter && previewAfter.startsWith('data:image')) currentHistory.fotoSesudah = previewAfter;
                saveHistory(history);
                showTeknisiToast(`Laporan riwayat berhasil diperbarui!`);
            } else if (taskIndex !== -1) {
                const currentTask = tasks[taskIndex];
                currentTask.status = newStatus;
                if (notes) currentTask.catatan = notes;
                if (previewBefore && previewBefore.startsWith('data:image')) currentTask.fotoSebelum = previewBefore;
                if (previewAfter && previewAfter.startsWith('data:image')) currentTask.fotoSesudah = previewAfter;

                if (newStatus === 'Selesai') {
                    history.unshift({
                        id: currentTask.id,
                        judul: currentTask.judul,
                        lokasi: `${currentTask.lokasiKode || 'R.01'} · ${currentTask.lokasiNama || 'Lokasi Kampus'}`,
                        pelapor: currentTask.pelapor,
                        tanggalSelesai: 'Hari ini',
                        durasi: '1 hari',
                        status: 'Selesai',
                        catatan: notes || 'Perbaikan fasilitas telah diselesaikan oleh teknisi.',
                        fotoSebelum: currentTask.fotoSebelum,
                        fotoSesudah: currentTask.fotoSesudah
                    });
                    saveHistory(history);
                    tasks.splice(taskIndex, 1); 
                }
                saveTasks(tasks);
                showTeknisiToast(`Tugas ${activeModalTaskId} diperbarui ke "${newStatus}"!`);
            }

            closeModal();
            updateDashboardMetrics();
            renderDashboard();
            renderDaftarTugas();
            initDaftarTugasTabs(); 
        });
    }

    function openModalForTask(taskId, taskJudul) {
        ensureModalExists();
        activeModalTaskId = taskId;

        const modal = document.getElementById('modalTeknisiUpdate');
        if (document.getElementById('modalTaskCode')) document.getElementById('modalTaskCode').textContent = taskId;
        if (document.getElementById('modalTaskTitle')) document.getElementById('modalTaskTitle').textContent = taskJudul;

        const task = getTasks().find(t => t.id === taskId);
        const history = getHistory().find(h => h.id === taskId);
        const data = task || history;

        if (data) {
            if (document.getElementById('selectStatusTugas')) document.getElementById('selectStatusTugas').value = data.status || 'Tugas Baru';
            if (document.getElementById('textareaCatatanPerbaikan')) document.getElementById('textareaCatatanPerbaikan').value = data.catatan || '';
        }
        if (document.getElementById('previewFotoSebelumWrap')) document.getElementById('previewFotoSebelumWrap').style.display = 'none';
        if (document.getElementById('previewFotoSesudahWrap')) document.getElementById('previewFotoSesudahWrap').style.display = 'none';
        if (modal) modal.style.display = 'flex';
    }

    // ============================================================
    // 4. RENDER DASHBOARD
    // ============================================================
    function renderDashboard() {
        const container = document.getElementById('dashboard-task-container');
        if (!container) return;

        const activeTasks = getTasks().filter(t => t.status !== 'Selesai');
        
        container.innerHTML = '';
        if (activeTasks.length === 0) {
            container.innerHTML = `<p class="text-muted">Tidak ada tugas aktif saat ini.</p>`;
            return;
        }

        activeTasks.forEach(task => {
            const card = document.createElement('article');
            card.className = 'glass-card task-card';
            card.innerHTML = `
                <div class="task-body">
                    <h3 class="card-title">${task.judul || 'Perbaikan Fasilitas'} <small style="float:right; font-size: 12px; color:#666;">${task.id}</small></h3>
                    <p class="text-muted" style="margin: 10px 0;"><i class="fa-solid fa-location-dot"></i> ${task.lokasiKode || 'Lokasi'} - ${task.lokasiNama || 'Kampus'}</p>
                    <p class="text-muted"><i class="fa-regular fa-user"></i> ${task.pelapor || 'Pelapor'}</p>
                    <p class="text-muted" style="margin-bottom: 15px;"><i class="fa-regular fa-clock"></i> ${task.waktu || 'Baru saja'}</p>
                    <button class="btn btn-success" style="width: 100%;" onclick="openModalForTask('${task.id}', '${task.judul || 'Perbaikan'}')">Update Status &amp; Upload Bukti</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ============================================================
    // 5. RENDER DAFTAR TUGAS
    // ============================================================
    function renderDaftarTugas() {
        const container = document.getElementById('task-list-container');
        if (!container) return;

        const activeTasks = getTasks().map(t => ({ ...t, type: 'active' }));
        const historyTasks = getHistory().map(h => ({ ...h, type: 'history', status: 'Selesai' }));
        const allData = [...activeTasks, ...historyTasks];
        
        container.innerHTML = '';
        if (allData.length === 0) {
            container.innerHTML = `<p class="text-muted" style="grid-column: 1/-1;">Belum ada data tugas.</p>`;
            return;
        }

        allData.forEach(item => {
            const isHistory = item.type === 'history';
            const card = document.createElement('article');
            card.className = 'glass-card task-card';
            
            const btnHTML = isHistory 
                ? `<button class="btn btn-ghost" style="width: 100%; border: 1px solid #cbd5e1;" onclick="lihatDetailRiwayat('${item.id}')">Lihat Detail Pengerjaan</button>`
                : `<button class="btn btn-success" style="width: 100%;" onclick="openModalForTask('${item.id}', '${item.judul || 'Perbaikan Fasilitas'}')">Update Status &amp; Upload Bukti</button>`;

            card.innerHTML = `
                <div class="task-body">
                    <h3 class="card-title">${item.judul || 'Perbaikan Fasilitas'} <small style="float:right; font-size: 12px; color:#666;">${item.id}</small></h3>
                    <p class="text-muted" style="margin: 10px 0;"><i class="fa-solid fa-location-dot"></i> ${item.lokasiKode ? `${item.lokasiKode} - ${item.lokasiNama}` : item.lokasi}</p>
                    <p class="text-muted"><i class="fa-regular fa-user"></i> ${item.pelapor || 'Pelapor'}</p>
                    <p class="text-muted" style="margin-bottom: 15px;"><i class="fa-regular fa-clock"></i> ${isHistory ? 'Selesai ' + item.tanggalSelesai : (item.waktu || 'Baru saja')}</p>
                    ${btnHTML}
                </div>
            `;
            container.appendChild(card);
        });
    }

    function updateDashboardMetrics() {
        const tasks = getTasks();
        const history = getHistory();
        
        const countBaru = tasks.filter(t => t.status === 'Tugas Baru').length;
        const countProses = tasks.filter(t => t.status === 'Sedang Dikerjakan').length;
        const countSelesai = history.length + tasks.filter(t => t.status === 'Selesai').length;

        if (document.getElementById('metric-baru')) document.getElementById('metric-baru').textContent = countBaru;
        if (document.getElementById('metric-proses')) document.getElementById('metric-proses').textContent = countProses;
        if (document.getElementById('metric-selesai')) document.getElementById('metric-selesai').textContent = countSelesai;
    }

    function initDaftarTugasTabs() {
        const tabContainer = document.getElementById('tab-container');
        if (!tabContainer) return;

        const tasks = getTasks();
        const history = getHistory();
        
        const countBaru = tasks.filter(t => t.status === 'Tugas Baru').length;
        const countProses = tasks.filter(t => t.status === 'Sedang Dikerjakan').length;
        const countSelesai = tasks.filter(t => t.status === 'Selesai').length + history.length;

        tabContainer.innerHTML = `
            <button class="btn btn-ghost active" data-filter="tugas baru" style="color: #0284c7; border-bottom: 2px solid #0284c7; border-radius: 0; font-weight: 600;">Tugas Baru (${countBaru})</button>
            <button class="btn btn-ghost" data-filter="sedang dikerjakan" style="color: #64748b;">Sedang Dikerjakan (${countProses})</button>
            <button class="btn btn-ghost" data-filter="selesai" style="color: #64748b;">Selesai (${countSelesai})</button>
        `;

        const tabButtons = tabContainer.querySelectorAll('button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                tabButtons.forEach(b => { b.classList.remove('active'); b.style.color = '#64748b'; b.style.borderBottom = 'none'; b.style.fontWeight = 'normal'; });
                btn.classList.add('active'); btn.style.color = '#0284c7'; btn.style.borderBottom = '2px solid #0284c7'; btn.style.fontWeight = '600';
                filterTaskCards(btn.dataset.filter);
            });
        });
        if (tabButtons[0]) tabButtons[0].click();
    }

    function filterTaskCards(statusKey) {
        const cards = document.querySelectorAll('.task-card');
        const tasks = getTasks();
        const history = getHistory();

        cards.forEach((card, idx) => {
            const codeEl = card.querySelector('.card-title small');
            const taskId = codeEl ? codeEl.textContent.trim() : '';
            
            const task = tasks.find(t => t.id === taskId);
            const historyItem = history.find(item => item.id === taskId);

            if (statusKey === 'semua') { card.style.display = ''; return; }

            const isTaskBaru = task && task.status === 'Tugas Baru';
            const isProses = task && task.status === 'Sedang Dikerjakan';
            const isSelesai = historyItem || (task && task.status === 'Selesai');

            if (statusKey === 'tugas baru' && isTaskBaru) card.style.display = '';
            else if (statusKey === 'sedang dikerjakan' && isProses) card.style.display = '';
            else if (statusKey === 'selesai' && isSelesai) card.style.display = '';
            else card.style.display = 'none';
        });
    }

    // ============================================================
    // 6. RENDER RIWAYAT & FILTER
    // ============================================================
    function renderRiwayat() {
        const container = document.getElementById('history-list');
        if (!container) return;

        const history = getHistory();
        container.innerHTML = '';
        
        if (history.length === 0) {
            container.innerHTML = `<p class="text-muted">Belum ada riwayat perbaikan.</p>`;
            return;
        }

        history.forEach(item => {
            const card = document.createElement('article');
            card.className = 'glass-card riwayat-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <h3 class="card-title" style="margin: 0;">${item.judul || 'Perbaikan'}</h3>
                        <p class="text-muted" style="font-size: 14px; margin-top: 4px;">${item.lokasi || '-'}</p>
                    </div>
                    <span class="status-badge status-badge-success">Selesai</span>
                </div>
                <div style="display: flex; gap: 20px; font-size: 13px; color: #64748b; margin-bottom: 15px; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px;">
                    <span><i class="fa-regular fa-square-check"></i> Selesai ${item.tanggalSelesai || '-'}</span>
                    <span><i class="fa-regular fa-clock"></i> Dikerjakan ${item.durasi || '-'}</span>
                </div>
                <div>
                    <span style="font-size: 12px; font-weight: 600; color: #94a3b8;">Catatan Teknisi</span>
                    <p style="margin-top: 4px; font-size: 14px; color: #334155;">${item.catatan || '-'}</p>
                </div>
            `;
            card.addEventListener('click', () => window.lihatDetailRiwayat(item.id));
            container.appendChild(card);
        });

        // --- BINDING TOMBOL FILTER ---
        const filterBtns = document.querySelectorAll('.filter-btn-riwayat');
        filterBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Reset semua tombol jadi abu-abu
                document.querySelectorAll('.filter-btn-riwayat').forEach(b => {
                    b.className = 'btn btn-ghost filter-btn-riwayat';
                    b.style.border = '1px solid #d1d5db';
                });
                
                // Bikin tombol yang diklik jadi hijau
                newBtn.className = 'btn btn-success filter-btn-riwayat';
                newBtn.style.border = 'none';

                const filterVal = newBtn.textContent.trim().toLowerCase();
                const cards = document.querySelectorAll('.riwayat-card');

                cards.forEach(card => {
                    card.style.display = 'none';
                    const text = card.textContent.toLowerCase();

                    if (filterVal === 'semua') {
                        card.style.display = '';
                    } else if (filterVal === 'minggu ini') {
                        if (text.includes('hari ini') || text.includes('minggu ini')) {
                            card.style.display = '';
                        }
                    } else if (filterVal === 'bulan ini') {
                        card.style.display = ''; 
                    }
                });
            });
        });
    }

    // ============================================================
    // 7. DETAIL MODAL & GLOBAL FUNCTIONS
    // ============================================================
    let currentDetailId = null;

    window.lihatDetailRiwayat = function(id) {
        const history = getHistory();
        const item = history.find(h => h.id === id);
        if (!item) return;

        currentDetailId = id;
        const modal = document.getElementById('modalDetailPengaduan');
        if (!modal) return;

        if (document.getElementById('detailJudul')) document.getElementById('detailJudul').textContent = item.judul || '-';
        if (document.getElementById('detailId')) document.getElementById('detailId').textContent = '#' + (item.id || '-');
        if (document.getElementById('detailLokasi')) document.getElementById('detailLokasi').textContent = item.lokasi || '-';
        if (document.getElementById('detailPelapor')) document.getElementById('detailPelapor').textContent = item.pelapor || '-';
        if (document.getElementById('detailStatus')) document.getElementById('detailStatus').textContent = item.status || 'Selesai';
        if (document.getElementById('detailTanggal')) document.getElementById('detailTanggal').textContent = item.tanggalSelesai || '-';
        if (document.getElementById('detailDeskripsi')) document.getElementById('detailDeskripsi').textContent = item.catatan || '-';

        modal.classList.remove('hidden');
        modal.classList.add('active');
    };

    window.tutupDetail = function() {
        const modal = document.getElementById('modalDetailPengaduan');
        if (modal) { modal.classList.add('hidden'); modal.classList.remove('active'); }
    };

    window.openModalForTask = openModalForTask;

    // ============================================================
    // 8. BOOT
    // ============================================================
    window.initTeknisiPage = function (initialData) {
        initTeknisiStorage(initialData);
        
        updateDashboardMetrics();
        renderDashboard();
        renderDaftarTugas();
        initDaftarTugasTabs();
        renderRiwayat();
    };

})();