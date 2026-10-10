/**
 * ============================================================
 * ADUIN - MODUL TEKNISI / EKSEKUTOR PEMELIHARAAN
 * File: teknisi.js
 * ============================================================
 */

(function () {
    'use strict';

    // ============================================================
    // 1. KONSTANTA & KEY LOCALSTORAGE
    // ============================================================

    const STORAGE_KEY_TASKS = 'aduin_teknisi_tasks';
    const STORAGE_KEY_HISTORY = 'aduin_teknisi_history';


    // ============================================================
    // 2. DATA DUMMY AWAL
    // ============================================================

    function initTeknisiStorage() {

        // Daftar tugas aktif
        if (!localStorage.getItem(STORAGE_KEY_TASKS)) {

            const initialTasks = [
                {
                    id: 'TK-101',
                    judul: 'Proyektor Rusak',
                    prioritas: 'High Priority',
                    prioritasBadgeStyle:
                        'background: #fee2e2; color: #dc2626;',
                    lokasiKode: 'LPR1_7B',
                    lokasiNama: 'Lab Pemrograman 1',
                    pelapor: 'Septya Andhita Pradhana',
                    waktu: '10 Menit lalu',
                    status: 'Tugas Baru',
                    kategori: 'Peralatan Lab',
                    catatan: '',
                    fotoSebelum: '',
                    fotoSesudah: ''
                },

                {
                    id: 'TK-102',
                    judul: 'AC Tidak Dingin',
                    prioritas: 'Medium Priority',
                    prioritasBadgeStyle:
                        'background: #fef3c7; color: #d97706;',
                    lokasiKode: 'RT05_5B',
                    lokasiNama: 'Ruang Teori 5',
                    pelapor: 'Rachmah Nur Chotimah',
                    waktu: '45 Menit lalu',
                    status: 'Tugas Baru',
                    kategori: 'Fasilitas Kelas',
                    catatan: '',
                    fotoSebelum: '',
                    fotoSesudah: ''
                },

                {
                    id: 'TK-103',
                    judul: 'Lampu Tidak Menyala',
                    prioritas: 'Low Priority',
                    prioritasBadgeStyle:
                        'background: #e0f2fe; color: #0284c7;',
                    lokasiKode: 'LERP_7T',
                    lokasiNama: 'Lab ERP',
                    pelapor: 'Alfatitah Alifia Putri',
                    waktu: '1 Jam lalu',
                    status: 'Sedang Dikerjakan',
                    kategori: 'Kelistrikan',
                    catatan: 'Sekring panel sedang dicek',
                    fotoSebelum: '',
                    fotoSesudah: ''
                }
            ];

            localStorage.setItem(
                STORAGE_KEY_TASKS,
                JSON.stringify(initialTasks)
            );
        }


        // Riwayat perbaikan
        if (!localStorage.getItem(STORAGE_KEY_HISTORY)) {

            const initialHistory = [
                {
                    id: 'TK-098',
                    judul: 'Pintu Macet',
                    lokasi: 'R.06.04 · Ruang Dosen 4',
                    pelapor: 'Dosen Pembimbing',
                    tanggalSelesai: '19 Sep 2026',
                    durasi: '1 hari',
                    status: 'Selesai',
                    catatan:
                        'Engsel diganti dan dilumasi, pintu sudah bisa dibuka dan ditutup normal.',
                    fotoSebelum: '',
                    fotoSesudah: '',
                    periode: 'Minggu Ini'
                },

                {
                    id: 'TK-095',
                    judul: 'Stop Kontak Rusak',
                    lokasi:
                        'LKJ2_7T · Lab Sist Komp dan Jaringan 2',
                    pelapor: 'Laboran Jaringan',
                    tanggalSelesai: '12 Sep 2026',
                    durasi: '2 hari',
                    status: 'Selesai',
                    catatan:
                        'Stop kontak diganti baru dan kabel di bawah meja dirapikan.',
                    fotoSebelum: '',
                    fotoSesudah: '',
                    periode: 'Bulan Ini'
                }
            ];

            localStorage.setItem(
                STORAGE_KEY_HISTORY,
                JSON.stringify(initialHistory)
            );
        }
    }


    // ============================================================
    // 3. FUNGSI GET & SET DATA
    // ============================================================

    function getTasks() {

        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY_TASKS) || '[]'
            );

        } catch (e) {

            console.error(
                'Error membaca data tugas:',
                e
            );

            return [];
        }
    }


    function saveTasks(tasks) {

        localStorage.setItem(
            STORAGE_KEY_TASKS,
            JSON.stringify(tasks)
        );
    }


    function getHistory() {

        try {

            return JSON.parse(
                localStorage.getItem(STORAGE_KEY_HISTORY) || '[]'
            );

        } catch (e) {

            console.error(
                'Error membaca data riwayat:',
                e
            );

            return [];
        }
    }


    function saveHistory(history) {

        localStorage.setItem(
            STORAGE_KEY_HISTORY,
            JSON.stringify(history)
        );
    }


    // ============================================================
    // 4. TOAST NOTIFICATION
    // ============================================================

    function showTeknisiToast(
        pesan,
        tipe = 'success'
    ) {

        let toastContainer =
            document.getElementById(
                'teknisiToastContainer'
            );

        if (!toastContainer) {

            toastContainer =
                document.createElement('div');

            toastContainer.id =
                'teknisiToastContainer';

            toastContainer.style.cssText =
                'position: fixed;' +
                'bottom: 24px;' +
                'right: 24px;' +
                'z-index: 10000;' +
                'display: flex;' +
                'flex-direction: column;' +
                'gap: 10px;';

            document.body.appendChild(
                toastContainer
            );
        }


        const toast =
            document.createElement('div');

        const isSuccess =
            tipe === 'success';


        toast.style.cssText = `
            background: ${
                isSuccess
                    ? '#0f172a'
                    : '#b91c1c'
            };
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            box-shadow:
                0 10px 15px -3px
                rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: fadeIn 0.3s ease;
        `;


        toast.innerHTML =
            `<span>${
                isSuccess ? '✓' : '⚠'
            }</span>
             <span>${pesan}</span>`;


        toastContainer.appendChild(
            toast
        );


        setTimeout(() => {

            toast.style.opacity = '0';

            toast.style.transition =
                'opacity 0.3s ease';

            setTimeout(() => {
                toast.remove();
            }, 300);

        }, 3200);
    }


    // ============================================================
    // 5. MODAL UPDATE TUGAS
    // ============================================================

    let activeModalTaskId = null;


    function ensureModalExists() {

        if (
            document.getElementById(
                'modalTeknisiUpdate'
            )
        ) {
            return;
        }


        const modalHTML = `
            <div
                id="modalTeknisiUpdate"
                style="
                    display: none;
                    position: fixed;
                    inset: 0;
                    background:
                        rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 9999;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                "
            >

                <div
                    style="
                        background: #ffffff;
                        border-radius: 16px;
                        max-width: 500px;
                        width: 100%;
                        padding: 24px;
                        box-shadow:
                            0 25px 50px -12px
                            rgba(0, 0, 0, 0.25);
                        border:
                            1px solid #e2e8f0;
                    "
                >

                    <!-- Header Modal -->
                    <div
                        style="
                            display: flex;
                            justify-content:
                                space-between;
                            align-items:
                                flex-start;
                            border-bottom:
                                1px solid #f1f5f9;
                            padding-bottom: 14px;
                            margin-bottom: 16px;
                        "
                    >

                        <div>

                            <span
                                id="modalTaskCode"
                                style="
                                    font-size: 11px;
                                    font-weight: 700;
                                    background: #e0f2fe;
                                    color: #0284c7;
                                    padding: 3px 8px;
                                    border-radius: 6px;
                                    text-transform:
                                        uppercase;
                                "
                            >
                                TK-101
                            </span>

                            <h3
                                id="modalTaskTitle"
                                style="
                                    font-size: 18px;
                                    font-weight: 700;
                                    color: #0f172a;
                                    margin: 6px 0 0 0;
                                "
                            >
                                Update Pengerjaan Tugas
                            </h3>

                        </div>


                        <button
                            type="button"
                            id="btnTutupModalTeknisi"
                            style="
                                background: none;
                                border: none;
                                font-size: 22px;
                                color: #94a3b8;
                                cursor: pointer;
                                line-height: 1;
                            "
                        >
                            &times;
                        </button>

                    </div>


                    <!-- Form -->
                    <form id="formTeknisiUpdate">

                        <!-- Status -->
                        <div style="margin-bottom: 14px;">

                            <label
                                style="
                                    display: block;
                                    font-size: 13px;
                                    font-weight: 600;
                                    color: #334155;
                                    margin-bottom: 6px;
                                "
                            >
                                Status Pengerjaan
                            </label>


                            <select
                                id="selectStatusTugas"
                                style="
                                    width: 100%;
                                    padding: 10px 12px;
                                    border:
                                        1px solid #cbd5e1;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    color: #1e293b;
                                    background: #f8fafc;
                                    outline: none;
                                    cursor: pointer;
                                "
                            >

                                <option value="Tugas Baru">
                                    Tugas Baru
                                    (Belum Mulai)
                                </option>

                                <option value="Sedang Dikerjakan">
                                    Sedang Dikerjakan
                                    (Dalam Proses)
                                </option>

                                <option value="Selesai">
                                    Selesai
                                    (Perbaikan Tuntas)
                                </option>

                            </select>

                        </div>


                        <!-- Catatan -->
                        <div style="margin-bottom: 14px;">

                            <label
                                style="
                                    display: block;
                                    font-size: 13px;
                                    font-weight: 600;
                                    color: #334155;
                                    margin-bottom: 6px;
                                "
                            >
                                Catatan Hasil Perbaikan
                            </label>


                            <textarea
                                id="textareaCatatanPerbaikan"
                                rows="3"
                                placeholder="Contoh: Kabel power dan sekring diganti, unit sudah diuji dan berfungsi normal."
                                style="
                                    width: 100%;
                                    box-sizing: border-box;
                                    padding: 10px 12px;
                                    border:
                                        1px solid #cbd5e1;
                                    border-radius: 8px;
                                    font-size: 13px;
                                    color: #1e293b;
                                    background: #f8fafc;
                                    outline: none;
                                    resize: vertical;
                                "
                            ></textarea>

                        </div>


                        <!-- Upload Foto -->
                        <div
                            style="
                                display: grid;
                                grid-template-columns:
                                    1fr 1fr;
                                gap: 12px;
                                margin-bottom: 18px;
                            "
                        >

                            <!-- Foto Sebelum -->
                            <div
                                style="
                                    border:
                                        1px dashed
                                        #cbd5e1;
                                    border-radius: 8px;
                                    padding: 10px;
                                    text-align: center;
                                    background: #f8fafc;
                                "
                            >

                                <label
                                    style="
                                        display: block;
                                        font-size: 12px;
                                        font-weight: 600;
                                        color: #475569;
                                        margin-bottom: 6px;
                                    "
                                >
                                    Foto Sebelum
                                </label>


                                <input
                                    type="file"
                                    id="fileFotoSebelum"
                                    accept="image/*"
                                    style="
                                        font-size: 11px;
                                        width: 100%;
                                        color: #64748b;
                                    "
                                >


                                <div
                                    id="previewFotoSebelumWrap"
                                    style="
                                        margin-top: 6px;
                                        display: none;
                                    "
                                >

                                    <img
                                        id="imgPreviewFotoSebelum"
                                        src=""
                                        alt="Sebelum"
                                        style="
                                            max-height: 55px;
                                            border-radius: 4px;
                                            margin: 0 auto;
                                            display: block;
                                            border:
                                                1px solid
                                                #e2e8f0;
                                        "
                                    >

                                </div>

                            </div>


                            <!-- Foto Sesudah -->
                            <div
                                style="
                                    border:
                                        1px dashed
                                        #cbd5e1;
                                    border-radius: 8px;
                                    padding: 10px;
                                    text-align: center;
                                    background: #f8fafc;
                                "
                            >

                                <label
                                    style="
                                        display: block;
                                        font-size: 12px;
                                        font-weight: 600;
                                        color: #475569;
                                        margin-bottom: 6px;
                                    "
                                >
                                    Foto Sesudah
                                </label>


                                <input
                                    type="file"
                                    id="fileFotoSesudah"
                                    accept="image/*"
                                    style="
                                        font-size: 11px;
                                        width: 100%;
                                        color: #64748b;
                                    "
                                >


                                <div
                                    id="previewFotoSesudahWrap"
                                    style="
                                        margin-top: 6px;
                                        display: none;
                                    "
                                >

                                    <img
                                        id="imgPreviewFotoSesudah"
                                        src=""
                                        alt="Sesudah"
                                        style="
                                            max-height: 55px;
                                            border-radius: 4px;
                                            margin: 0 auto;
                                            display: block;
                                            border:
                                                1px solid
                                                #e2e8f0;
                                        "
                                    >

                                </div>

                            </div>

                        </div>


                        <!-- Tombol -->
                        <div
                            style="
                                display: flex;
                                justify-content:
                                    flex-end;
                                gap: 10px;
                                border-top:
                                    1px solid #f1f5f9;
                                padding-top: 14px;
                            "
                        >

                            <button
                                type="button"
                                id="btnBatalTeknisiModal"
                                style="
                                    padding: 8px 16px;
                                    border-radius: 8px;
                                    border:
                                        1px solid
                                        #cbd5e1;
                                    background: #ffffff;
                                    color: #64748b;
                                    font-size: 13px;
                                    font-weight: 600;
                                    cursor: pointer;
                                "
                            >
                                Batal
                            </button>


                            <button
                                type="submit"
                                id="btnSimpanTeknisiTask"
                                style="
                                    padding: 8px 18px;
                                    border-radius: 8px;
                                    border: none;
                                    background: #0284c7;
                                    color: #ffffff;
                                    font-size: 13px;
                                    font-weight: 600;
                                    cursor: pointer;
                                "
                            >
                                Simpan Perubahan
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        `;


        document.body.insertAdjacentHTML(
            'beforeend',
            modalHTML
        );


        const modal =
            document.getElementById(
                'modalTeknisiUpdate'
            );

        const btnTutup =
            document.getElementById(
                'btnTutupModalTeknisi'
            );

        const btnBatal =
            document.getElementById(
                'btnBatalTeknisiModal'
            );


        const closeModal = () => {

            modal.style.display = 'none';

            activeModalTaskId = null;
        };


        btnTutup?.addEventListener(
            'click',
            closeModal
        );

        btnBatal?.addEventListener(
            'click',
            closeModal
        );


        // Upload foto sebelum
        const inputBefore =
            document.getElementById(
                'fileFotoSebelum'
            );


        inputBefore?.addEventListener(
            'change',
            (e) => {

                const file =
                    e.target.files[0];

                if (file) {

                    const reader =
                        new FileReader();


                    reader.onload =
                        (evt) => {

                            const img =
                                document.getElementById(
                                    'imgPreviewFotoSebelum'
                                );

                            const wrap =
                                document.getElementById(
                                    'previewFotoSebelumWrap'
                                );


                            if (img && wrap) {

                                img.src =
                                    evt.target.result;

                                wrap.style.display =
                                    'block';
                            }
                        };


                    reader.readAsDataURL(file);
                }
            }
        );


        // Upload foto sesudah
        const inputAfter =
            document.getElementById(
                'fileFotoSesudah'
            );


        inputAfter?.addEventListener(
            'change',
            (e) => {

                const file =
                    e.target.files[0];

                if (file) {

                    const reader =
                        new FileReader();


                    reader.onload =
                        (evt) => {

                            const img =
                                document.getElementById(
                                    'imgPreviewFotoSesudah'
                                );

                            const wrap =
                                document.getElementById(
                                    'previewFotoSesudahWrap'
                                );


                            if (img && wrap) {

                                img.src =
                                    evt.target.result;

                                wrap.style.display =
                                    'block';
                            }
                        };


                    reader.readAsDataURL(file);
                }
            }
        );


        // Submit form
        const form =
            document.getElementById(
                'formTeknisiUpdate'
            );


        form?.addEventListener(
            'submit',
            (e) => {

                e.preventDefault();


                if (!activeModalTaskId) {
                    return;
                }


                const newStatus =
                    document.getElementById(
                        'selectStatusTugas'
                    ).value;


                const notes =
                    document.getElementById(
                        'textareaCatatanPerbaikan'
                    ).value.trim();


                const tasks =
                    getTasks();


                const taskIndex =
                    tasks.findIndex(
                        t =>
                            t.id ===
                            activeModalTaskId
                    );


                if (taskIndex !== -1) {

                    const currentTask =
                        tasks[taskIndex];


                    currentTask.status =
                        newStatus;


                    if (notes) {
                        currentTask.catatan =
                            notes;
                    }


                    const previewBefore =
                        document.getElementById(
                            'imgPreviewFotoSebelum'
                        )?.src;


                    const previewAfter =
                        document.getElementById(
                            'imgPreviewFotoSesudah'
                        )?.src;


                    if (
                        previewBefore &&
                        previewBefore.startsWith(
                            'data:image'
                        )
                    ) {
                        currentTask.fotoSebelum =
                            previewBefore;
                    }


                    if (
                        previewAfter &&
                        previewAfter.startsWith(
                            'data:image'
                        )
                    ) {
                        currentTask.fotoSesudah =
                            previewAfter;
                    }


                    // Jika selesai, masukkan ke riwayat
                    if (newStatus === 'Selesai') {

                        const history =
                            getHistory();


                        history.unshift({

                            id:
                                currentTask.id,

                            judul:
                                currentTask.judul,

                            lokasi:
                                `${
                                    currentTask.lokasiKode ||
                                    'R.01'
                                } · ${
                                    currentTask.lokasiNama ||
                                    'Lokasi Kampus'
                                }`,

                            pelapor:
                                currentTask.pelapor,

                            tanggalSelesai:
                                'Hari ini',

                            durasi:
                                '1 hari',

                            status:
                                'Selesai',

                            catatan:
                                notes ||
                                'Perbaikan fasilitas telah diselesaikan oleh teknisi.',

                            fotoSebelum:
                                currentTask.fotoSebelum,

                            fotoSesudah:
                                currentTask.fotoSesudah,

                            periode:
                                'Minggu Ini'
                        });


                        saveHistory(history);
                    }


                    saveTasks(tasks);


                    showTeknisiToast(
                        `Tugas ${activeModalTaskId} diperbarui ke status: "${newStatus}"!`
                    );


                    closeModal();


                    renderActivePage();
                }
            }
        );
    }


    // ============================================================
    // 6. MEMBUKA MODAL
    // ============================================================

    function openModalForTask(
        taskId,
        taskJudul
    ) {

        ensureModalExists();


        activeModalTaskId =
            taskId;


        const modal =
            document.getElementById(
                'modalTeknisiUpdate'
            );


        const codeEl =
            document.getElementById(
                'modalTaskCode'
            );


        const titleEl =
            document.getElementById(
                'modalTaskTitle'
            );


        const selectStatus =
            document.getElementById(
                'selectStatusTugas'
            );


        const textNotes =
            document.getElementById(
                'textareaCatatanPerbaikan'
            );


        const wrapBefore =
            document.getElementById(
                'previewFotoSebelumWrap'
            );


        const wrapAfter =
            document.getElementById(
                'previewFotoSesudahWrap'
            );


        if (codeEl) {
            codeEl.textContent =
                taskId;
        }


        if (titleEl) {
            titleEl.textContent =
                taskJudul ||
                'Update Pengerjaan Tugas';
        }


        const tasks =
            getTasks();


        const task =
            tasks.find(
                t => t.id === taskId
            );


        if (task) {

            if (selectStatus) {
                selectStatus.value =
                    task.status ||
                    'Tugas Baru';
            }


            if (textNotes) {
                textNotes.value =
                    task.catatan ||
                    '';
            }
        }


        if (wrapBefore) {
            wrapBefore.style.display =
                'none';
        }


        if (wrapAfter) {
            wrapAfter.style.display =
                'none';
        }


        if (modal) {
            modal.style.display =
                'flex';
        }
    }


    // ============================================================
    // 7. DASHBOARD TEKNISI
    // ============================================================

    function initDashboard() {

        const isDashboard =
            document.querySelector(
                '.metric-grid'
            ) &&
            document
                .querySelector(
                    '.header-title'
                )
                ?.textContent.includes(
                    'Dashboard'
                );


        if (!isDashboard) {
            return;
        }


        updateDashboardMetrics();

        bindTaskButtons();
    }


    function updateDashboardMetrics() {

        const tasks =
            getTasks();


        const history =
            getHistory();


        const countBaru =
            tasks.filter(
                t =>
                    t.status ===
                    'Tugas Baru'
            ).length;


        const countProses =
            tasks.filter(
                t =>
                    t.status ===
                    'Sedang Dikerjakan'
            ).length;


        const countSelesai =
            history.length +
            tasks.filter(
                t =>
                    t.status ===
                    'Selesai'
            ).length;


        const metricCards =
            document.querySelectorAll(
                '.metric-card'
            );


        if (metricCards.length >= 3) {

            const elBaru =
                metricCards[0]
                    .querySelector(
                        '.metric-value'
                    );


            const elProses =
                metricCards[1]
                    .querySelector(
                        '.metric-value'
                    );


            const elSelesai =
                metricCards[2]
                    .querySelector(
                        '.metric-value'
                    );


            if (elBaru) {
                elBaru.textContent =
                    countBaru;
            }


            if (elProses) {
                elProses.textContent =
                    countProses;
            }


            if (elSelesai) {
                elSelesai.textContent =
                    countSelesai;
            }
        }
    }


    function bindTaskButtons() {

        const cards =
            document.querySelectorAll(
                '.task-card'
            );


        cards.forEach(
            (card, idx) => {

                const btn =
                    card.querySelector(
                        'button'
                    );


                const titleEl =
                    card.querySelector(
                        '.card-title'
                    );


                const codeEl =
                    card.querySelector(
                        '.card-title small'
                    );


                const taskId =
                    codeEl
                        ? codeEl.textContent.trim()
                        : `TK-10${idx + 1}`;


                const taskJudul =
                    titleEl
                        ? titleEl
                            .childNodes[0]
                            .textContent
                            .trim()
                        : 'Perbaikan Fasilitas';


                if (btn) {

                    btn.style.cursor =
                        'pointer';


                    const newBtn =
                        btn.cloneNode(true);


                    btn.parentNode.replaceChild(
                        newBtn,
                        btn
                    );


                    newBtn.addEventListener(
                        'click',
                        (e) => {

                            e.preventDefault();

                            openModalForTask(
                                taskId,
                                taskJudul
                            );
                        }
                    );
                }
            }
        );
    }


    // ============================================================
    // 8. DAFTAR TUGAS
    // ============================================================

    function initDaftarTugas() {

        const isDaftarTugas =
            window.location.pathname.includes(
                'daftar-tugas.html'
            ) ||
            (
                document
                    .querySelector(
                        '.header-title'
                    )
                    ?.textContent.includes(
                        'Daftar Tugas'
                    ) &&
                document.querySelector(
                    '.glass-card button'
                )
            );


        if (!isDaftarTugas) {
            return;
        }


        const tabButtons =
            document.querySelectorAll(
                '.glass-card button, .glass-card .btn-ghost'
            );


        tabButtons.forEach(
            btn => {

                btn.style.cursor =
                    'pointer';


                btn.addEventListener(
                    'click',
                    (e) => {

                        e.preventDefault();


                        tabButtons.forEach(
                            b => {

                                b.classList.remove(
                                    'active'
                                );

                                b.style.color =
                                    '#64748b';

                                b.style.borderBottom =
                                    'none';

                                b.style.fontWeight =
                                    'normal';
                            }
                        );


                        btn.classList.add(
                            'active'
                        );


                        btn.style.color =
                            '#0284c7';


                        btn.style.borderBottom =
                            '2px solid #0284c7';


                        btn.style.fontWeight =
                            '600';


                        const label =
                            btn.textContent
                                .toLowerCase();


                        let targetFilter =
                            'semua';


                        if (
                            label.includes(
                                'baru'
                            )
                        ) {

                            targetFilter =
                                'tugas baru';

                        } else if (
                            label.includes(
                                'sedang'
                            ) ||
                            label.includes(
                                'dikerjakan'
                            )
                        ) {

                            targetFilter =
                                'sedang dikerjakan';

                        } else if (
                            label.includes(
                                'selesai'
                            )
                        ) {

                            targetFilter =
                                'selesai';
                        }


                        filterTaskCards(
                            targetFilter
                        );
                    }
                );
            }
        );


        bindTaskButtons();
    }


    function filterTaskCards(
        statusKey
    ) {

        const cards =
            document.querySelectorAll(
                '.task-card'
            );


        const tasks =
            getTasks();


        cards.forEach(
            (card, idx) => {

                const codeEl =
                    card.querySelector(
                        '.card-title small'
                    );


                const taskId =
                    codeEl
                        ? codeEl.textContent.trim()
                        : `TK-10${idx + 1}`;


                const task =
                    tasks.find(
                        t =>
                            t.id === taskId
                    );


                if (
                    !task ||
                    statusKey === 'semua'
                ) {

                    card.style.display =
                        '';

                    return;
                }


                const taskStatus =
                    (
                        task.status || ''
                    ).toLowerCase();


                if (
                    statusKey ===
                        'tugas baru' &&
                    (
                        taskStatus ===
                            'tugas baru' ||
                        taskStatus ===
                            'menunggu'
                    )
                ) {

                    card.style.display =
                        '';

                } else if (
                    statusKey ===
                        'sedang dikerjakan' &&
                    (
                        taskStatus ===
                            'sedang dikerjakan' ||
                        taskStatus ===
                            'proses'
                    )
                ) {

                    card.style.display =
                        '';

                } else if (
                    statusKey ===
                        'selesai' &&
                    taskStatus ===
                        'selesai'
                ) {

                    card.style.display =
                        '';

                } else {

                    card.style.display =
                        'none';
                }
            }
        );
    }


    // ============================================================
    // 9. RIWAYAT
    // ============================================================

    function initRiwayat() {

        const isRiwayat =
            window.location.pathname.includes(
                'riwayat.html'
            ) ||
            document
                .querySelector(
                    '.header-title'
                )
                ?.textContent.includes(
                    'Daftar Laporan'
                );


        if (!isRiwayat) {
            return;
        }


        const filterBtns =
            document.querySelectorAll(
                'main section div button'
            );


        filterBtns.forEach(
            btn => {

                btn.style.cursor =
                    'pointer';


                btn.addEventListener(
                    'click',
                    (e) => {

                        e.preventDefault();


                        filterBtns.forEach(
                            b => {

                                b.className =
                                    'btn btn-ghost';

                                b.style.border =
                                    '1px solid #d1d5db';

                                b.style.background =
                                    '';

                                b.style.color =
                                    '';
                            }
                        );


                        btn.className =
                            'btn btn-success';


                        btn.style.border =
                            'none';


                        const filterVal =
                            btn.textContent
                                .trim()
                                .toLowerCase();


                        const articles =
                            document.querySelectorAll(
                                'main section:last-of-type article'
                            );


                        articles.forEach(
                            art => {

                                if (
                                    filterVal ===
                                    'semua'
                                ) {

                                    art.style.display =
                                        '';

                                } else if (
                                    filterVal ===
                                    'minggu ini'
                                ) {

                                    const textContent =
                                        art.textContent;


                                    art.style.display =
                                        textContent.includes(
                                            '19 Sep'
                                        ) ||
                                        textContent.includes(
                                            'Hari ini'
                                        )
                                            ? ''
                                            : 'none';

                                } else if (
                                    filterVal ===
                                    'bulan ini'
                                ) {

                                    art.style.display =
                                        '';
                                }
                            }
                        );
                    }
                );
            }
        );
    }


    // ============================================================
    // 10. REFRESH HALAMAN
    // ============================================================

    function renderActivePage() {

        updateDashboardMetrics();


        const activeTab =
            document.querySelector(
                '.glass-card button.active'
            );


        if (activeTab) {
            activeTab.click();
        }
    }


    // ============================================================
    // 11. INISIALISASI
    // ============================================================

    document.addEventListener(
        'DOMContentLoaded',
        () => {

            initTeknisiStorage();

            initDashboard();

            initDaftarTugas();

            initRiwayat();
        }
    );

})();