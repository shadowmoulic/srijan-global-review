document.addEventListener('DOMContentLoaded', async () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Gatephrase Security Check
    const gateModal = document.getElementById('gatephrase-modal');
    const gateForm = document.getElementById('gatephrase-form');
    const gateInput = document.getElementById('gatephrase-input');
    const gateError = document.getElementById('gate-error');

    if (sessionStorage.getItem('srijan_exec_auth') === 'Srijan@2016') {
        if (gateModal) gateModal.setAttribute('hidden', 'true');
        document.body.style.overflow = 'auto';
    } else {
        if (gateModal) gateModal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
    }

    gateForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (gateInput?.value === 'Srijan@2016') {
            sessionStorage.setItem('srijan_exec_auth', 'Srijan@2016');
            if (gateModal) gateModal.setAttribute('hidden', 'true');
            document.body.style.overflow = 'auto';
            loadAllData();
        } else {
            if (gateError) gateError.style.display = 'block';
            if (gateInput) {
                gateInput.style.borderColor = '#e53e3e';
                gateInput.value = '';
                gateInput.focus();
            }
        }
    });

    const dbBadge = document.getElementById('db-status-badge');
    const statusText = dbBadge?.querySelector('.status-text');

    // Verify DB Status after short timeout to let Supabase client init
    setTimeout(() => {
        if (SrijanDB.isSupabaseActive()) {
            if (dbBadge) {
                dbBadge.className = 'db-badge live';
                if (statusText) statusText.innerText = 'Supabase Connected';
            }
        } else {
            if (dbBadge) {
                dbBadge.className = 'db-badge local';
                if (statusText) statusText.innerText = 'Local Sync Mode';
            }
        }
    }, 500);

    // Tab Switching
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const panes = document.querySelectorAll('.admin-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.setAttribute('hidden', 'true'));

            btn.classList.add('active');
            const targetPane = document.getElementById(`pane-${target}`);
            if (targetPane) targetPane.removeAttribute('hidden');
        });
    });

    // View Details Modal
    const viewModal = document.getElementById('view-modal');
    const viewModalContent = document.getElementById('view-modal-content');
    const modalCloseBtns = viewModal?.querySelectorAll('.modal-close, .modal-close-action');

    modalCloseBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            if (viewModal) viewModal.setAttribute('hidden', 'true');
        });
    });

    function openViewModal(contentHtml) {
        if (!viewModal || !viewModalContent) return;
        viewModalContent.innerHTML = contentHtml;
        viewModal.removeAttribute('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons({ root: viewModalContent });
    }

    // Load and Render Data
    async function loadAllData() {
        const submissions = await SrijanDB.getSubmissions();
        const reviewers = await SrijanDB.getReviewers();
        const contacts = await SrijanDB.getContacts();

        // Update Badges
        document.getElementById('tab-sub-badge').innerText = submissions.length;
        document.getElementById('tab-rev-badge').innerText = reviewers.length;
        document.getElementById('tab-msg-badge').innerText = contacts.length;

        document.getElementById('total-sub-count').innerText = submissions.length;
        document.getElementById('screening-count').innerText = submissions.filter(s => s.status === 'Screening').length;
        document.getElementById('reviewer-count').innerText = reviewers.length;
        document.getElementById('message-count').innerText = contacts.filter(c => c.status === 'Unread').length;

        renderSubmissions(submissions);
        renderReviewers(reviewers);
        renderContacts(contacts);

        initSearchFilters(submissions, reviewers, contacts);
    }

    function getStatusSelectHtml(currentStatus, type, id) {
        const statuses = type === 'sub' ? ['Screening', 'Under Review', 'Accepted', 'Rejected']
                       : type === 'rev' ? ['Pending Review', 'Approved', 'Rejected']
                       : ['Unread', 'In Progress', 'Resolved'];
        
        const cleanStatusClass = currentStatus ? currentStatus.replace(/\s+/g, '') : 'Screening';
        
        let html = `<select class="status-select ${cleanStatusClass}" data-id="${id}" data-type="${type}">`;
        statuses.forEach(st => {
            html += `<option value="${st}" ${currentStatus === st ? 'selected' : ''}>${st}</option>`;
        });
        html += `</select>`;
        return html;
    }

    function renderSubmissions(list) {
        const tbody = document.getElementById('sub-tbody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No manuscript submissions logged yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(sub => `
            <tr class="search-row">
                <td><strong>${sub.id}</strong></td>
                <td>${sub.date || '2026-05-15'}</td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-navy);">${sub.author || 'Author'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${sub.institution || ''} (${sub.email || ''})</div>
                </td>
                <td><strong style="color: var(--primary-navy);">${sub.title || 'Untitled'}</strong></td>
                <td>
                    <span style="font-weight:600;">${sub.domain || 'General'}</span><br>
                    <span style="font-size:0.85rem; color:var(--accent-gold);">${sub.type || 'Research Article'}</span>
                </td>
                <td>${getStatusSelectHtml(sub.status || 'Screening', 'sub', sub.id)}</td>
                <td>
                    <div class="action-group">
                        <button class="btn-action-sm view-btn" data-type="sub" data-id="${sub.id}"><i data-lucide="eye"></i> Details</button>
                        <a href="javascript:void(0)" onclick="alert('Simulating download for manuscript file: ${sub.file || 'manuscript.docx'}');" class="btn-action-sm download" title="Download File"><i data-lucide="download"></i> File</a>
                    </div>
                </td>
            </tr>
        `).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons({ root: tbody });
        attachRowListeners(tbody, list, 'sub');
    }

    function renderReviewers(list) {
        const tbody = document.getElementById('rev-tbody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No reviewer applications logged yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(rev => `
            <tr class="search-row">
                <td><strong>${rev.id}</strong></td>
                <td>${rev.date || '2026-05-15'}</td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-navy);">${rev.name || 'Reviewer'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${rev.institution || ''}, ${rev.country || ''} (${rev.email || ''})</div>
                </td>
                <td><span style="font-size:0.9rem;">${rev.expertise || 'General Reviewer'}</span></td>
                <td><a href="${rev.link || '#'}" target="_blank" style="color:var(--primary-navy); font-size:0.85rem; font-weight:600;"><i data-lucide="external-link" style="width:14px;"></i> View Link</a></td>
                <td>${getStatusSelectHtml(rev.status || 'Pending Review', 'rev', rev.id)}</td>
                <td>
                    <div class="action-group">
                        <button class="btn-action-sm view-btn" data-type="rev" data-id="${rev.id}"><i data-lucide="eye"></i> Details</button>
                        <a href="javascript:void(0)" onclick="alert('Simulating CV download for: ${rev.cv || 'CV.pdf'}');" class="btn-action-sm download"><i data-lucide="file-badge"></i> CV</a>
                    </div>
                </td>
            </tr>
        `).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons({ root: tbody });
        attachRowListeners(tbody, list, 'rev');
    }

    function renderContacts(list) {
        const tbody = document.getElementById('msg-tbody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No messages logged yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(msg => `
            <tr class="search-row">
                <td><strong>${msg.id}</strong></td>
                <td>${msg.date || '2026-05-15'}</td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-navy);">${msg.name || 'Sender'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${msg.email || ''}</div>
                </td>
                <td><span style="font-weight:600; color:var(--accent-gold);">${msg.subject || 'General Inquiry'}</span></td>
                <td><span style="font-size:0.9rem; color:var(--text-secondary);">${(msg.message || '').substring(0, 60)}...</span></td>
                <td>${getStatusSelectHtml(msg.status || 'Unread', 'msg', msg.id)}</td>
                <td>
                    <button class="btn-action-sm view-btn" data-type="msg" data-id="${msg.id}"><i data-lucide="eye"></i> View Full Message</button>
                </td>
            </tr>
        `).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons({ root: tbody });
        attachRowListeners(tbody, list, 'msg');
    }

    function attachRowListeners(tbody, list, type) {
        // Status Select Change
        const selects = tbody.querySelectorAll('.status-select');
        selects.forEach(sel => {
            sel.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const newStatus = e.target.value;
                const cleanClass = newStatus.replace(/\s+/g, '');
                
                sel.className = `status-select ${cleanClass}`;
                
                if (type === 'sub') await SrijanDB.updateSubmissionStatus(id, newStatus);
                if (type === 'rev') await SrijanDB.updateReviewerStatus(id, newStatus);
                if (type === 'msg') await SrijanDB.updateContactStatus(id, newStatus);
            });
        });

        // View Details Modal Click
        const viewBtns = tbody.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = list.find(x => x.id === id);
                if (!item) return;

                let html = '';
                if (type === 'sub') {
                    html = `
                        <div class="details-box">
                            <h4>Manuscript Details: ${item.id}</h4>
                            <div class="details-meta">
                                <div><strong style="color:var(--text-muted);">Author:</strong><br><span style="font-size:1.1rem; font-weight:600;">${item.author}</span></div>
                                <div><strong style="color:var(--text-muted);">Email:</strong><br><span>${item.email}</span></div>
                                <div style="grid-column: span 2;"><strong style="color:var(--text-muted);">Institution:</strong><br><span>${item.institution}</span></div>
                                <div><strong style="color:var(--text-muted);">Domain:</strong><br><span>${item.domain}</span></div>
                                <div><strong style="color:var(--text-muted);">Type:</strong><br><span style="color:var(--accent-gold); font-weight:600;">${item.type}</span></div>
                            </div>
                            <h4 style="margin-top:1.5rem;">Manuscript Title</h4>
                            <p style="font-size:1.25rem; font-weight:700; color:var(--primary-navy); margin-bottom:1.5rem;">${item.title}</p>
                            <h4>Abstract</h4>
                            <p style="background:var(--bg-light); padding:1.5rem; border-radius:var(--radius-sm); line-height:1.8; font-size:1.05rem;">${item.abstract || 'No abstract provided.'}</p>
                            <div style="margin-top:2rem; padding-top:1.5rem; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:600;"><i data-lucide="file-check" style="color:var(--accent-gold); margin-right:0.5rem;"></i> Attached Document: ${item.file || 'manuscript.docx'}</span>
                                <a href="javascript:void(0)" onclick="alert('Simulating download for manuscript file: ${item.file || 'manuscript.docx'}');" class="btn btn-primary" style="padding: 0.5rem 1rem;"><i data-lucide="download"></i> Download</a>
                            </div>
                        </div>
                    `;
                } else if (type === 'rev') {
                    html = `
                        <div class="details-box">
                            <h4>Reviewer Application: ${item.id}</h4>
                            <div class="details-meta">
                                <div><strong style="color:var(--text-muted);">Name:</strong><br><span style="font-size:1.1rem; font-weight:600;">${item.name}</span></div>
                                <div><strong style="color:var(--text-muted);">Email:</strong><br><span>${item.email}</span></div>
                                <div><strong style="color:var(--text-muted);">Institution:</strong><br><span>${item.institution}</span></div>
                                <div><strong style="color:var(--text-muted);">Country:</strong><br><span>${item.country}</span></div>
                            </div>
                            <h4>Areas of Expertise</h4>
                            <p style="background:var(--bg-light); padding:1.25rem; border-radius:var(--radius-sm); font-size:1.1rem; font-weight:500; color:var(--primary-navy);">${item.expertise}</p>
                            <h4 style="margin-top:1.5rem;">Web Profile / ORCID Link</h4>
                            <p><a href="${item.link}" target="_blank" style="color:var(--primary-navy); font-weight:600;"><i data-lucide="external-link"></i> ${item.link}</a></p>
                            <div style="margin-top:2rem; padding-top:1.5rem; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:600;"><i data-lucide="file-badge" style="color:var(--accent-gold); margin-right:0.5rem;"></i> CV Attached: ${item.cv || 'curriculum_vitae.pdf'}</span>
                                <a href="javascript:void(0)" onclick="alert('Simulating CV download for: ${item.cv || 'CV.pdf'}');" class="btn btn-primary" style="padding: 0.5rem 1rem;"><i data-lucide="download"></i> Download CV</a>
                            </div>
                        </div>
                    `;
                } else {
                    html = `
                        <div class="details-box">
                            <h4>Official Message Details: ${item.id}</h4>
                            <div class="details-meta">
                                <div><strong style="color:var(--text-muted);">Sender Name:</strong><br><span style="font-size:1.1rem; font-weight:600;">${item.name}</span></div>
                                <div><strong style="color:var(--text-muted);">Email:</strong><br><span>${item.email}</span></div>
                                <div style="grid-column: span 2;"><strong style="color:var(--text-muted);">Subject Category:</strong><br><span style="color:var(--accent-gold); font-weight:600; font-size:1.05rem;">${item.subject}</span></div>
                            </div>
                            <h4 style="margin-top:1.5rem;">Complete Message</h4>
                            <p style="background:var(--bg-light); padding:1.75rem; border-radius:var(--radius-sm); line-height:1.8; font-size:1.1rem;">${item.message}</p>
                            <div style="margin-top:2rem; text-align:right;">
                                <a href="mailto:${item.email}?subject=RE: ${item.subject} (SRIJAN ID: ${item.id})" class="btn btn-primary"><i data-lucide="mail"></i> Reply via Email</a>
                            </div>
                        </div>
                    `;
                }
                openViewModal(html);
            });
        });
    }

    function initSearchFilters(subList, revList, msgList) {
        const searchSub = document.getElementById('search-sub');
        searchSub?.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = subList.filter(x => (x.author || '').toLowerCase().includes(q) || (x.title || '').toLowerCase().includes(q) || (x.id || '').toLowerCase().includes(q));
            renderSubmissions(filtered);
        });

        const searchRev = document.getElementById('search-rev');
        searchRev?.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = revList.filter(x => (x.name || '').toLowerCase().includes(q) || (x.expertise || '').toLowerCase().includes(q) || (x.institution || '').toLowerCase().includes(q));
            renderReviewers(filtered);
        });

        const searchMsg = document.getElementById('search-msg');
        searchMsg?.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = msgList.filter(x => (x.name || '').toLowerCase().includes(q) || (x.subject || '').toLowerCase().includes(q) || (x.message || '').toLowerCase().includes(q));
            renderContacts(filtered);
        });
    }

    // Initial Load
    await loadAllData();
});
