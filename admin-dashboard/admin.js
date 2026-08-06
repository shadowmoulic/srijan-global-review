document.addEventListener('DOMContentLoaded', async () => {
    // 1. Strict Auth Verification Guard
    const isAuthenticated = await SrijanAuth.verifySession();
    if (!isAuthenticated) {
        window.location.replace('../admin/index.html');
        return;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 2. Sign Out Handler
    const signOutBtn = document.getElementById('btn-sign-out');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            await SrijanAuth.signOut();
            window.location.replace('../admin/index.html');
        });
    }

    // 3. Database Status Indicator
    const dbBadge = document.getElementById('db-status-badge');
    const statusText = dbBadge?.querySelector('.status-text');

    setTimeout(() => {
        if (SrijanDB.isSupabaseActive()) {
            if (dbBadge) {
                dbBadge.className = 'db-badge live';
                if (statusText) statusText.innerText = 'Supabase Connected';
            }
        } else {
            if (dbBadge) {
                dbBadge.className = 'db-badge local';
                if (statusText) statusText.innerText = 'Local Fallback Mode';
            }
        }
    }, 400);

    // 4. Tab Switching Logic
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const panes = document.querySelectorAll('.admin-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(`pane-${target}`);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // 5. Load and Render Dashboard Data
    async function loadDashboardData() {
        const submissions = await SrijanDB.getSubmissions();
        const reviewers = await SrijanDB.getReviewers();
        const contacts = await SrijanDB.getContacts();

        // Update Key Metrics
        const totalSubEl = document.getElementById('total-sub-count');
        const screeningSubEl = document.getElementById('screening-count');
        const reviewerEl = document.getElementById('reviewer-count');
        const contactsEl = document.getElementById('unread-contacts');

        if (totalSubEl) totalSubEl.innerText = submissions.length;
        if (screeningSubEl) screeningSubEl.innerText = submissions.filter(s => s.status === 'Screening').length;
        if (reviewerEl) reviewerEl.innerText = reviewers.length;
        if (contactsEl) contactsEl.innerText = contacts.filter(c => c.status === 'Unread').length;

        renderSubmissions(submissions);
        renderReviewers(reviewers);
        renderContacts(contacts);

        initFilterListeners(submissions, reviewers, contacts);
    }

    function getStatusBadgeClass(status) {
        if (!status) return 'status-screening';
        const clean = status.toLowerCase().replace(/\s+/g, '-');
        return `status-${clean}`;
    }

    function renderSubmissions(list) {
        const tbody = document.getElementById('sub-table-body');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No manuscript submissions found.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(sub => `
            <tr>
                <td><strong>${sub.id}</strong></td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-navy);">${sub.author || 'Author'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${sub.institution || ''} (${sub.email || ''})</div>
                </td>
                <td><strong style="color: var(--primary-navy);">${sub.title || 'Untitled'}</strong></td>
                <td>
                    <span style="font-weight:600;">${sub.domain || 'General'}</span><br>
                    <span style="font-size:0.85rem; color:var(--accent-gold);">${sub.type || 'Research Article'}</span>
                </td>
                <td>${sub.date || '2026-05-15'}</td>
                <td>
                    <select class="status-select ${getStatusBadgeClass(sub.status)}" data-id="${sub.id}" data-type="sub">
                        <option value="Screening" ${sub.status === 'Screening' ? 'selected' : ''}>Screening</option>
                        <option value="Under Review" ${sub.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                        <option value="Accepted" ${sub.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                        <option value="Revision" ${sub.status === 'Revision' ? 'selected' : ''}>Revision</option>
                        <option value="Rejected" ${sub.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td>
                    <div class="action-group">
                        <button class="btn-action-sm view-sub-btn" data-id="${sub.id}"><i data-lucide="eye"></i> View Abstract</button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons({ root: tbody });

        tbody.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const newStatus = e.target.value;
                e.target.className = `status-select ${getStatusBadgeClass(newStatus)}`;
                await SrijanDB.updateSubmissionStatus(id, newStatus);
            });
        });

        tbody.querySelectorAll('.view-sub-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const sub = list.find(s => s.id === id);
                if (sub) {
                    alert(`ABSTRACT (${sub.id} - ${sub.author}):\n\nTitle: ${sub.title}\n\nAbstract:\n${sub.abstract || 'No abstract provided.'}\n\nAttached File: ${sub.file || 'manuscript.docx'}`);
                }
            });
        });
    }

    function renderReviewers(list) {
        const tbody = document.getElementById('rev-table-body');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No reviewer applications logged yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(rev => `
            <tr>
                <td><strong>${rev.id}</strong></td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-navy);">${rev.name || 'Reviewer'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${rev.institution || ''} (${rev.email || ''})</div>
                </td>
                <td>${rev.country || 'International'}</td>
                <td><span style="font-size:0.9rem;">${rev.expertise || 'General'}</span></td>
                <td>${rev.date || '2026-05-15'}</td>
                <td>
                    <select class="status-select ${getStatusBadgeClass(rev.status)}" data-id="${rev.id}" data-type="rev">
                        <option value="Pending Review" ${rev.status === 'Pending Review' ? 'selected' : ''}>Pending Review</option>
                        <option value="Approved" ${rev.status === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option value="Rejected" ${rev.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </td>
                <td>
                    <div class="action-group">
                        <a href="${rev.link || '#'}" target="_blank" class="btn-action-sm"><i data-lucide="external-link"></i> Profile</a>
                    </div>
                </td>
            </tr>
        `).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons({ root: tbody });

        tbody.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const newStatus = e.target.value;
                e.target.className = `status-select ${getStatusBadgeClass(newStatus)}`;
                await SrijanDB.updateReviewerStatus(id, newStatus);
            });
        });
    }

    function renderContacts(list) {
        const tbody = document.getElementById('contact-table-body');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No editorial inquiries received.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(c => `
            <tr>
                <td><strong>${c.id}</strong></td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-navy);">${c.name || 'Sender'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${c.email || ''}</div>
                </td>
                <td><strong style="color:var(--accent-gold);">${c.subject || 'Editorial Inquiry'}</strong></td>
                <td>${c.date || '2026-05-17'}</td>
                <td>
                    <select class="status-select ${getStatusBadgeClass(c.status)}" data-id="${c.id}" data-type="contact">
                        <option value="Unread" ${c.status === 'Unread' ? 'selected' : ''}>Unread</option>
                        <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                </td>
                <td>
                    <button class="btn-action-sm view-msg-btn" data-id="${c.id}"><i data-lucide="mail"></i> Read Message</button>
                </td>
            </tr>
        `).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons({ root: tbody });

        tbody.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', async (e) => {
                const id = e.target.getAttribute('data-id');
                const newStatus = e.target.value;
                e.target.className = `status-select ${getStatusBadgeClass(newStatus)}`;
                await SrijanDB.updateContactStatus(id, newStatus);
            });
        });

        tbody.querySelectorAll('.view-msg-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const c = list.find(x => x.id === id);
                if (c) {
                    alert(`MESSAGE FROM: ${c.name} (${c.email})\nSUBJECT: ${c.subject}\nDATE: ${c.date}\n\nMESSAGE:\n${c.message}`);
                }
            });
        });
    }

    function initFilterListeners(submissions, reviewers, contacts) {
        const subSearch = document.getElementById('sub-search');
        const subStatusFilter = document.getElementById('sub-filter-status');

        function filterSubmissions() {
            const q = subSearch?.value.toLowerCase().trim() || '';
            const statusVal = subStatusFilter?.value || 'all';

            const filtered = submissions.filter(s => {
                const matchesQ = !q || (s.author || '').toLowerCase().includes(q) || (s.title || '').toLowerCase().includes(q) || (s.id || '').toLowerCase().includes(q);
                const matchesStatus = statusVal === 'all' || s.status === statusVal;
                return matchesQ && matchesStatus;
            });
            renderSubmissions(filtered);
        }

        subSearch?.addEventListener('input', filterSubmissions);
        subStatusFilter?.addEventListener('change', filterSubmissions);

        const revSearch = document.getElementById('rev-search');
        revSearch?.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            const filtered = reviewers.filter(r => (r.name || '').toLowerCase().includes(q) || (r.expertise || '').toLowerCase().includes(q) || (r.institution || '').toLowerCase().includes(q));
            renderReviewers(filtered);
        });
    }

    // Initialize Data Load
    await loadDashboardData();
});
