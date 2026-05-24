/**
 * SRIJAN Journal Web Components
 * Encapsulates the global header, banner, top bar, footer, and modal dialogues across all pages.
 */

class SrijanHeader extends HTMLElement {
    connectedCallback() {
        const basePath = this.getAttribute('base-path') || './';
        const activePage = this.getAttribute('active-page') || 'home';

        const getNavLink = (page) => {
            if (page.startsWith('#')) {
                if (basePath === './' || basePath === '') {
                    return page;
                }
                return `${basePath}index.html${page}`;
            }
            return `${basePath}${page}`;
        };

        const isActive = (page) => activePage === page ? ' active' : '';
        const logoPath = 'https://srijantirtha.in/wp-content/uploads/2025/10/Srijantirtha-1.png';

        this.innerHTML = `
            <!-- Top Accessibility & Institutional Bar -->
            <div class="top-bar" role="banner">
                <div class="container top-bar-content">
                    <div class="top-bar-left">
                        <span class="institutional-badge"><i data-lucide="shield-check"></i> Published by SRIJANTIRTHA Publisher</span>
                        <span class="issn-tag"><i data-lucide="award"></i> ISSN (Online): Applied For</span>
                    </div>
                    <div class="top-bar-right">
                        <div class="accessibility-controls" aria-label="Accessibility tools">
                            <span class="ctrl-label"><i data-lucide="eye"></i> Accessibility:</span>
                            <button class="font-btn" id="font-decrease" title="Decrease font size" aria-label="Decrease font size">A-</button>
                            <button class="font-btn active" id="font-default" title="Default font size" aria-label="Default font size">A</button>
                            <button class="font-btn" id="font-increase" title="Increase font size" aria-label="Increase font size">A+</button>
                            <button class="contrast-btn" id="contrast-toggle" title="Toggle High Contrast" aria-label="Toggle High Contrast"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg></button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Banner Section -->
            <div class="journal-banner">
                <div class="container banner-container">
                    <a href="${getNavLink('')}" class="banner-brand">
                        <img src="${logoPath}" alt="SRIJAN Journal Logo" class="banner-logo" onerror="this.src='https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80'">
                        <div class="banner-titles">
                            <div class="banner-title-wrapper">
                                <h1 class="banner-title">SRIJAN</h1>
                                <span class="banner-subtitle">Global Review of Arts, Science & Humanities</span>
                            </div>
                            <span class="banner-tagline">International Peer-Reviewed Open Access Journal</span>
                        </div>
                    </a>
                    <div class="banner-actions">
                        <div class="banner-search">
                            <i data-lucide="search" class="search-icon-left"></i>
                            <input type="text" id="global-search" placeholder="Search articles, DOIs..." aria-label="Search journal">
                            <button id="search-submit" class="btn-search-submit" aria-label="Submit search">Search</button>
                        </div>
                        <button class="btn btn-primary submit-btn-banner" id="banner-submit-btn">
                            <i data-lucide="send"></i> Submit Paper
                        </button>
                    </div>
                </div>
            </div>

            <!-- Sticky Main Navigation Bar -->
            <header class="main-header" id="sticky-header">
                <div class="container nav-container">
                    <nav class="main-nav" role="navigation" aria-label="Main Navigation">
                        <button class="mobile-menu-toggle" aria-label="Toggle Menu" aria-expanded="false" id="menu-toggle-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg> <span class="menu-label">Menu</span>
                        </button>
                        <ul class="nav-list" id="nav-menu">
                            <li><a href="${getNavLink('')}" class="nav-link${isActive('home')}">Home</a></li>
                            <li><a href="${getNavLink('about-us/')}" class="nav-link${isActive('about')}">About Us</a></li>
                            <li><a href="${getNavLink('aim-scope/')}" class="nav-link${isActive('scope')}">Aim & Scope</a></li>
                            <li class="dropdown">
                                <a href="${getNavLink('editorial-board/')}" class="nav-link dropdown-toggle${isActive('editorial')}">Editorial Board <i data-lucide="chevron-down" class="nav-chevron"></i></a>
                                <ul class="dropdown-menu">
                                    <li><a href="${getNavLink('editorial-board/#editorial')}">Executive Board</a></li>
                                    <li><a href="${getNavLink('editorial-board/#international-advisory')}">International Advisory</a></li>
                                </ul>
                            </li>
                            <li><a href="${getNavLink('volume-1-issue-1-2026/')}" class="nav-link${isActive('current-issue')}">Current Issue</a></li>
                            <li><a href="${getNavLink('#archives')}" class="nav-link${isActive('archives')}">Archives</a></li>
                            <li class="dropdown">
                                <a href="${getNavLink('author-guidelines/')}" class="nav-link dropdown-toggle${isActive('guidelines')}">For Authors <i data-lucide="chevron-down" class="nav-chevron"></i></a>
                                <ul class="dropdown-menu">
                                    <li><a href="${getNavLink('author-guidelines/')}">Author Guidelines</a></li>
                                    <li><a href="${getNavLink('peer-review-policy/')}">Peer Review Policy</a></li>
                                    <li><a href="${getNavLink('publication-ethics/')}">Publication Ethics</a></li>
                                </ul>
                            </li>
                            <li><a href="${getNavLink('contact-us/')}" class="nav-link${isActive('contact')}">Contact Us</a></li>
                        </ul>
                    </nav>
                </div>
            </header>
        `;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons({ root: this });
        }
    }
}

class SrijanFooter extends HTMLElement {
    connectedCallback() {
        const basePath = this.getAttribute('base-path') || './';
        const logoPath = 'https://srijantirtha.in/wp-content/uploads/2025/10/Srijantirtha-1.png';
        const prefix = basePath === './' ? '' : basePath;

        const getNavLink = (page) => {
            if (page.startsWith('#')) {
                if (basePath === './' || basePath === '') {
                    return page;
                }
                return `${basePath}index.html${page}`;
            }
            return `${basePath}${page}`;
        };

        this.innerHTML = `
            <footer class="main-footer" role="contentinfo">
                <div class="footer-top">
                    <div class="container footer-grid">
                        <div class="footer-col brand-col">
                            <div class="footer-logo">
                                <img src="${logoPath}" alt="SRIJAN Journal Logo" class="footer-journal-logo" onerror="this.src='https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80'">
                                <h2>SRIJAN</h2>
                            </div>
                            <p class="footer-desc">Global Review of Arts, Science & Humanities is an international peer-reviewed academic journal published bi-annually under the auspices of SRIJANTIRTHA.</p>
                            <div class="oa-badge-footer">
                                <i data-lucide="unlock"></i>
                                <span>Fully Open Access • Zero Submission Charges</span>
                            </div>
                        </div>

                        <div class="footer-col nav-col">
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="${getNavLink('')}"><i data-lucide="chevron-right"></i> Home</a></li>
                                <li><a href="${getNavLink('about-us/')}"><i data-lucide="chevron-right"></i> About Journal</a></li>
                                <li><a href="${getNavLink('editorial-board/')}"><i data-lucide="chevron-right"></i> Editorial Board</a></li>
                                <li><a href="${getNavLink('volume-1-issue-1-2026/')}"><i data-lucide="chevron-right"></i> Current Issue</a></li>
                                <li><a href="${getNavLink('#archives')}"><i data-lucide="chevron-right"></i> Archives</a></li>
                            </ul>
                        </div>

                        <div class="footer-col nav-col">
                            <h3>Editorial Policies</h3>
                            <ul>
                                <li><a href="${getNavLink('author-guidelines/')}"><i data-lucide="chevron-right"></i> Author Guidelines</a></li>
                                <li><a href="${getNavLink('peer-review-policy/')}"><i data-lucide="chevron-right"></i> Peer Review Policy</a></li>
                                <li><a href="${getNavLink('publication-ethics/')}"><i data-lucide="chevron-right"></i> Publication Ethics</a></li>
                                <li><a href="javascript:void(0)" id="footer-join-btn"><i data-lucide="chevron-right"></i> Join as Reviewer</a></li>
                                <li><a href="${getNavLink('#indexing')}"><i data-lucide="chevron-right"></i> Indexing Status</a></li>
                            </ul>
                        </div>

                        <div class="footer-col contact-col text-sm">
                            <h3>Official Headquarters</h3>
                            <p><i data-lucide="map-pin"></i> Main Office: Betai, Nadia 741163, West Bengal, India</p>
                            <p><i data-lucide="building"></i> City Office: Flat No. B1, B2/236, Kalyani 741235, West Bengal, India</p>
                            <p><i data-lucide="phone"></i> +91 90623 85173 / +91 89105 54624</p>
                            <p><i data-lucide="mail"></i> srijan.globalreview@gmail.com</p>
                            <p><i data-lucide="shield"></i> Reg No: IV-1901-00880/2025</p>
                        </div>
                    </div>
                </div>

                <div class="footer-bottom">
                    <div class="container footer-bottom-content">
                        <div class="copyright">
                            <p>&copy; 2026 SRIJANTIRTHA. All rights reserved. Articles published under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener" class="license-link">Creative Commons Attribution 4.0 International (CC BY 4.0) License</a>.</p>
                        </div>
                        <div class="footer-legal-links">
                            <a href="${getNavLink('privacy-policy/')}">Privacy Policy</a>
                            <span>•</span>
                            <a href="${getNavLink('terms-of-submission/')}">Terms of Submission</a>
                            <span>•</span>
                            <a href="${getNavLink('disclaimer/')}">Disclaimer</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons({ root: this });
        }
    }
}

class SrijanModals extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <!-- MODAL: SUBMIT MANUSCRIPT -->
            <div id="submit-modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
                <div class="modal-overlay"></div>
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 id="modal-title"><i data-lucide="upload"></i> Online Manuscript Submission Portal</h3>
                        <button class="modal-close" aria-label="Close modal"><i data-lucide="x"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="submission-notice">
                            <i data-lucide="info"></i>
                            <span>Please ensure your manuscript is fully formatted according to our Author Guidelines and is anonymized for double-blind peer review.</span>
                        </div>
                        <form id="paper-submit-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sub-fname">Corresponding Author Name *</label>
                                    <input type="text" id="sub-fname" required placeholder="Dr. / Prof. Full Name">
                                </div>
                                <div class="form-group">
                                    <label for="sub-email">Institutional Email *</label>
                                    <input type="email" id="sub-email" required placeholder="author@institution.edu">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="sub-affil">Primary Institution & Department *</label>
                                <input type="text" id="sub-affil" required placeholder="e.g., Department of Philosophy, Delhi University">
                            </div>
                            <div class="form-group">
                                <label for="sub-title">Manuscript Title *</label>
                                <input type="text" id="sub-title" required placeholder="Enter full paper title">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="sub-domain">Research Domain *</label>
                                    <select id="sub-domain" required>
                                        <option value="">-- Select Domain --</option>
                                        <option value="Literature">Literature</option>
                                        <option value="Linguistics">Linguistics</option>
                                        <option value="Philosophy">Philosophy</option>
                                        <option value="Sociology">Sociology</option>
                                        <option value="Psychology">Psychology</option>
                                        <option value="Education">Education</option>
                                        <option value="Theatre">Theatre & Performance</option>
                                        <option value="Interdisciplinary">Interdisciplinary Research</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="sub-type">Manuscript Type *</label>
                                    <select id="sub-type" required>
                                        <option value="">-- Select Type --</option>
                                        <option value="Research">Original Research Article</option>
                                        <option value="Review">Review Article</option>
                                        <option value="Theoretical">Theoretical Perspective</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="sub-abstract">Abstract (Max 250 words) *</label>
                                <textarea id="sub-abstract" rows="4" required placeholder="Paste manuscript abstract here..."></textarea>
                            </div>
                            <div class="form-group file-upload-box">
                                <label for="sub-file" class="upload-label">
                                    <i data-lucide="cloud-upload" class="upload-icon"></i>
                                    <span class="upload-title">Click to upload manuscript file (.docx / .tex)</span>
                                    <span class="upload-size">Maximum file size: 25MB</span>
                                </label>
                                <input type="file" id="sub-file" required accept=".doc,.docx,.tex,.pdf" class="sr-only">
                                <div id="selected-file-name" class="file-name-display"></div>
                            </div>
                            <div class="form-check">
                                <input type="checkbox" id="sub-ethics" required>
                                <label for="sub-ethics">I certify that this paper is my original work, has not been published elsewhere, and complies with SRIJAN's publication ethics.</label>
                            </div>
                            <div class="modal-footer-actions">
                                <button type="button" class="btn btn-outline modal-cancel">Cancel</button>
                                <button type="submit" class="btn btn-primary"><i data-lucide="check-circle"></i> Submit Manuscript</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- MODAL: BECOME REVIEWER -->
            <div id="reviewer-modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="reviewer-modal-title" hidden>
                <div class="modal-overlay"></div>
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 id="reviewer-modal-title"><i data-lucide="user-check"></i> Reviewer / Editorial Board Application</h3>
                        <button class="modal-close" aria-label="Close modal"><i data-lucide="x"></i></button>
                    </div>
                    <div class="modal-body">
                        <p class="modal-desc">SRIJAN invites seasoned academics holding a PhD or equivalent distinguished professorship to join our international panel of reviewers.</p>
                        <form id="reviewer-apply-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="rev-name">Full Title & Name *</label>
                                    <input type="text" id="rev-name" required placeholder="Prof. Dr. Jane Doe">
                                </div>
                                <div class="form-group">
                                    <label for="rev-email">Institutional Email *</label>
                                    <input type="email" id="rev-email" required placeholder="j.doe@university.edu">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="rev-inst">Institution *</label>
                                    <input type="text" id="rev-inst" required placeholder="University Name">
                                </div>
                                <div class="form-group">
                                    <label for="rev-country">Country *</label>
                                    <input type="text" id="rev-country" required placeholder="e.g., United States">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="rev-exp">Areas of Expertise & Keywords *</label>
                                <input type="text" id="rev-exp" required placeholder="e.g., Cognitive semantics, Second language acquisition, Ed-tech">
                            </div>
                            <div class="form-group">
                                <label for="rev-link">Institutional Web Profile / ORCID Link *</label>
                                <input type="url" id="rev-link" required placeholder="https://orcid.org/0000-xxxx-xxxx">
                            </div>
                            <div class="form-group file-upload-box">
                                <label for="rev-cv" class="upload-label">
                                    <i data-lucide="file-badge" class="upload-icon"></i>
                                    <span class="upload-title">Upload Academic Curriculum Vitae (PDF)</span>
                                    <span class="upload-size">Max size: 10MB</span>
                                </label>
                                <input type="file" id="rev-cv" required accept=".pdf,.doc,.docx" class="sr-only">
                                <div id="selected-cv-name" class="file-name-display"></div>
                            </div>
                            <div class="modal-footer-actions">
                                <button type="button" class="btn btn-outline modal-cancel">Cancel</button>
                                <button type="submit" class="btn btn-primary"><i data-lucide="send"></i> Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Toast Notification System -->
            <div id="toast-container" aria-live="polite" aria-atomic="true"></div>
        `;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons({ root: this });
        }
    }
}

customElements.define('srijan-header', SrijanHeader);
customElements.define('srijan-footer', SrijanFooter);
customElements.define('srijan-modals', SrijanModals);
