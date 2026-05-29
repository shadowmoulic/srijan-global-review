/**
 * SRIJAN: Global Review of Arts, Science & Humanities Website Logic
 * Handles interactive components, accessibility features, modal dialogues, and form validations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* ==========================================================================
       TOAST NOTIFICATION SYSTEM
       ========================================================================== */
    const toastContainer = document.getElementById('toast-container');

    function showToast(message, type = 'info', duration = 5000) {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'warning') iconName = 'alert-triangle';

        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <div class="toast-message">${message}</div>
        `;

        toastContainer.appendChild(toast);
        if (typeof lucide !== 'undefined') lucide.createIcons({ root: toast });

        const timer = setTimeout(() => {
            toast.style.animation = 'toastFadeOut 0.3s forwards';
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);

        toast.addEventListener('click', () => {
            clearTimeout(timer);
            toast.remove();
        });
    }

    /* ==========================================================================
       ACCESSIBILITY CONTROLS
       ========================================================================== */
    const contrastBtn = document.getElementById('contrast-toggle');
    const fontDecrease = document.getElementById('font-decrease');
    const fontDefault = document.getElementById('font-default');
    const fontIncrease = document.getElementById('font-increase');
    const rootHtml = document.documentElement;
    const body = document.body;

    // High Contrast Toggle
    if (contrastBtn) {
        contrastBtn.addEventListener('click', () => {
            body.classList.toggle('high-contrast');
            const isHighContrast = body.classList.contains('high-contrast');
            contrastBtn.innerHTML = isHighContrast ?
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M22 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>` :
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
            showToast(isHighContrast ? 'High Contrast Mode Enabled' : 'Default Academic Theme Restored', 'info', 3000);
        });
    }

    // Font Sizing Toggles
    const fontSizes = {
        sm: '14px',
        def: '16px',
        lg: '18px'
    };

    function updateFontSize(size, activeBtn) {
        rootHtml.style.fontSize = size;
        [fontDecrease, fontDefault, fontIncrease].forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');
        showToast(`Typography updated to ${size === '16px' ? 'Default' : size}`, 'info', 2500);
    }

    if (fontDecrease) fontDecrease.addEventListener('click', () => updateFontSize(fontSizes.sm, fontDecrease));
    if (fontDefault) fontDefault.addEventListener('click', () => updateFontSize(fontSizes.def, fontDefault));
    if (fontIncrease) fontIncrease.addEventListener('click', () => updateFontSize(fontSizes.lg, fontIncrease));


    /* ==========================================================================
       HEADER & NAVIGATION
       ========================================================================== */
    const stickyHeader = document.getElementById('sticky-header');
    if (stickyHeader) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                stickyHeader.style.boxShadow = 'var(--shadow-md)';
            } else {
                stickyHeader.style.boxShadow = 'var(--shadow-sm)';
            }
        });
    }

    // Mobile Menu Toggle
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggleBtn && navMenu) {
        menuToggleBtn.addEventListener('click', () => {
            const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
            menuToggleBtn.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            menuToggleBtn.innerHTML = isExpanded ?
                `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg> <span class="menu-label">Menu</span>` :
                `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> <span class="menu-label">Close</span>`;
        });

        // Close menu when clicking a nav item on mobile
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    menuToggleBtn.setAttribute('aria-expanded', 'false');
                    menuToggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg> <span class="menu-label">Menu</span>`;
                }
            });
        });
    }


    /* ==========================================================================
       MODAL DIALOGUES
       ========================================================================== */
    const submitModal = document.getElementById('submit-modal');
    const reviewerModal = document.getElementById('reviewer-modal');

    // Modal Trigger Buttons
    const bannerSubmitBtn = document.getElementById('banner-submit-btn');
    const heroSubmitBtn = document.getElementById('hero-submit-btn');
    const scopeSubmitBtn = document.getElementById('scope-submit-btn');
    const heroReviewerBtn = document.getElementById('hero-reviewer-btn');
    const joinBoardBtn = document.getElementById('join-board-btn');
    const footerJoinBtn = document.getElementById('footer-join-btn');

    function openModal(modal) {
        if (!modal) return;
        modal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.setAttribute('hidden', 'true');
        document.body.style.overflow = 'auto';
    }

    // Bind Submit Modal Triggers
    [bannerSubmitBtn, heroSubmitBtn, scopeSubmitBtn].forEach(btn => {
        if (btn) btn.addEventListener('click', () => openModal(submitModal));
    });

    // Bind Reviewer Modal Triggers
    [heroReviewerBtn, joinBoardBtn, footerJoinBtn].forEach(btn => {
        if (btn) btn.addEventListener('click', () => openModal(reviewerModal));
    });

    // Close Modal Triggers
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const cancelBtn = modal.querySelector('.modal-cancel');

        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
        if (overlay) overlay.addEventListener('click', () => closeModal(modal));
        if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal(modal));
    });

    // Handle Escape Key for Modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(submitModal);
            closeModal(reviewerModal);
        }
    });


    /* ==========================================================================
       FILE UPLOAD PREVIEWS
       ========================================================================== */
    const subFileInput = document.getElementById('sub-file');
    const selectedFileNameDisplay = document.getElementById('selected-file-name');

    if (subFileInput && selectedFileNameDisplay) {
        subFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileSize = (file.size / (1024 * 1024)).toFixed(2);
                selectedFileNameDisplay.innerHTML = `<i data-lucide="file-check"></i> Selected: ${file.name} (${fileSize} MB)`;
                if (typeof lucide !== 'undefined') lucide.createIcons({ root: selectedFileNameDisplay });
                showToast(`Attached file: ${file.name}`, 'success');
            } else {
                selectedFileNameDisplay.innerHTML = '';
            }
        });
    }

    const revCvInput = document.getElementById('rev-cv');
    const selectedCvNameDisplay = document.getElementById('selected-cv-name');

    if (revCvInput && selectedCvNameDisplay) {
        revCvInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileSize = (file.size / (1024 * 1024)).toFixed(2);
                selectedCvNameDisplay.innerHTML = `<i data-lucide="file-check"></i> CV Attached: ${file.name} (${fileSize} MB)`;
                if (typeof lucide !== 'undefined') lucide.createIcons({ root: selectedCvNameDisplay });
                showToast(`Attached CV: ${file.name}`, 'success');
            } else {
                selectedCvNameDisplay.innerHTML = '';
            }
        });
    }


    /* ==========================================================================
       FORM SUBMISSION HANDLERS
       ========================================================================== */
    const paperSubmitForm = document.getElementById('paper-submit-form');
    if (paperSubmitForm) {
        paperSubmitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fname = document.getElementById('sub-fname')?.value || '';
            const email = document.getElementById('sub-email')?.value || '';
            const affil = document.getElementById('sub-affil')?.value || '';
            const title = document.getElementById('sub-title')?.value || '';
            const domain = document.getElementById('sub-domain')?.value || '';
            const type = document.getElementById('sub-type')?.value || '';
            const abstract = document.getElementById('sub-abstract')?.value || '';
            const fileInput = document.getElementById('sub-file');
            const file = fileInput && fileInput.files[0] ? fileInput.files[0].name : 'manuscript.docx';

            const saved = await SrijanDB.saveSubmission({ author: fname, email, institution: affil, title, domain, type, abstract, file });

            closeModal(submitModal);
            paperSubmitForm.reset();
            if (selectedFileNameDisplay) selectedFileNameDisplay.innerHTML = '';

            showToast(`Manuscript "${title.substring(0, 35)}..." transmitted securely to Supabase. Tracking ID: ${saved.id}`, 'success', 8000);
        });
    }

    const reviewerApplyForm = document.getElementById('reviewer-apply-form');
    if (reviewerApplyForm) {
        reviewerApplyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('rev-name')?.value || '';
            const email = document.getElementById('rev-email')?.value || '';
            const inst = document.getElementById('rev-inst')?.value || '';
            const country = document.getElementById('rev-country')?.value || '';
            const expertise = document.getElementById('rev-exp')?.value || '';
            const link = document.getElementById('rev-link')?.value || '';
            const cvInput = document.getElementById('rev-cv');
            const cv = cvInput && cvInput.files[0] ? cvInput.files[0].name : 'curriculum_vitae.pdf';

            const saved = await SrijanDB.saveReviewer({ name, email, institution: inst, country, expertise, link, cv });

            closeModal(reviewerModal);
            reviewerApplyForm.reset();
            if (selectedCvNameDisplay) selectedCvNameDisplay.innerHTML = '';

            showToast(`Thank you ${name}. Application (${saved.id}) logged securely in Supabase for Executive Board screening.`, 'success', 7000);
        });
    }

    const editorialContactForm = document.getElementById('editorial-contact-form');
    if (editorialContactForm) {
        editorialContactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('c-name')?.value || '';
            const email = document.getElementById('c-email')?.value || '';
            const subject = document.getElementById('c-subject')?.value || 'Editorial Query';
            const message = document.getElementById('c-msg')?.value || '';

            const saved = await SrijanDB.saveContact({ name, email, subject, message });

            editorialContactForm.reset();
            showToast(`Official message from ${name} (${saved.id}) logged in Supabase. Our editorial assistant will respond within 48 hours.`, 'success', 6000);
        });
    }


    /* ==========================================================================
       ABSTRACT ACCORDIONS
       ========================================================================== */
    const abstractToggles = document.querySelectorAll('.abstract-toggle');
    abstractToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            const content = toggle.nextElementSibling;

            toggle.setAttribute('aria-expanded', !isExpanded);
            if (content) {
                if (!isExpanded) {
                    content.style.maxHeight = content.scrollHeight + 50 + "px";
                    content.style.paddingTop = "1rem";
                    content.style.paddingBottom = "1.5rem";
                } else {
                    content.style.maxHeight = null;
                    content.style.paddingTop = "0";
                    content.style.paddingBottom = "0";
                }
            }
        });
    });


    /* ==========================================================================
       AUTHOR GUIDELINES TABS
       ========================================================================== */
    const guideTabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    guideTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            guideTabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetEl = document.getElementById(`tab-${targetTab}`);
            if (targetEl) targetEl.classList.add('active');
        });
    });


    /* ==========================================================================
       CITATIONS & INTERACTION TOASTS
       ========================================================================== */
    const citationBtns = document.querySelectorAll('.citation-btn');
    citationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const citationText = btn.getAttribute('data-citation');
            navigator.clipboard.writeText(citationText).then(() => {
                showToast('APA Citation copied to clipboard!', 'success');
            }).catch(() => {
                showToast('Failed to copy citation. Please copy manually.', 'warning');
            });
        });
    });

    document.querySelectorAll('.download-pdf-toast').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Simulating Secure Article PDF Download... (Open Access 100% Free)', 'success');
        });
    });

    document.querySelectorAll('.html-read-toast').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Opening Full Text HTML Reader Mode in new viewing window...', 'info');
        });
    });

    document.querySelectorAll('.template-download-toast').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Downloading Official SRIJAN Manuscript Template (.docx)...', 'success');
            const link = document.createElement('a');
            link.href = 'SRIJAN_Manuscript_Template_2026.docx';
            link.download = 'SRIJAN_Manuscript_Template_2026.docx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

    document.querySelectorAll('.legal-modal-toast').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showToast(`Showing Institutional Policy: ${e.target.innerText}. Compliant with international open access standards.`, 'info');
        });
    });

    // View Complete Issue Table of Contents button
    const viewEntireIssueBtn = document.getElementById('view-entire-issue');
    if (viewEntireIssueBtn) {
        viewEntireIssueBtn.addEventListener('click', () => {
            const articlesSection = document.querySelector('.articles-list');
            if (articlesSection) {
                articlesSection.scrollIntoView({ behavior: 'smooth' });
                showToast('Displaying full Volume 1 Issue 1 Table of Contents', 'info');
            }
        });
    }

    /* ==========================================================================
       GLOBAL SEARCH FILTER
       ========================================================================== */
    const globalSearch = document.getElementById('global-search');
    const searchSubmit = document.getElementById('search-submit');

    function performSearch() {
        if (!globalSearch) return;
        const query = globalSearch.value.trim().toLowerCase();
        if (!query) {
            showToast('Please enter search terms (e.g., author name, keyword)', 'warning');
            return;
        }

        const isVolumePage = window.location.pathname.includes('volume-1-issue-1-2026');
        if (isVolumePage) {
            const localSearchInput = document.getElementById('toc-search-input');
            if (localSearchInput) {
                localSearchInput.value = query;
                localSearchInput.dispatchEvent(new Event('input'));
                const searchSec = document.getElementById('toc-search-input');
                if (searchSec) searchSec.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            const headerEl = document.querySelector('srijan-header');
            const basePath = headerEl ? (headerEl.getAttribute('base-path') || './') : './';
            window.location.href = `${basePath}volume-1-issue-1-2026/index.html?search=${encodeURIComponent(query)}`;
        }
    }

    if (searchSubmit) {
        searchSubmit.addEventListener('click', performSearch);
    }

    if (globalSearch) {
        globalSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});
