/**
 * SRIJAN: Global Review of Arts, Science & Humanities Database & Supabase Connector
 * Handles seamless persistence across LocalStorage (default demo mode) and Supabase Cloud.
 */

const SUPABASE_CONFIG = {
    url: 'https://qbgubcicjqkgowxgrmmp.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZ3ViY2ljanFrZ293eGdybW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQzMTksImV4cCI6MjA5ODkyMDMxOX0.U8ILE_4Y89k9K3AQkOgNqDpYunwzDm4jBMWv1yPlE24'
};

// Safe localStorage wrapper to prevent crashes in incognito or blocked environments
const safeStorage = {
    _cache: {},
    getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage is blocked, falling back to memory cache:', e);
            return this._cache[key] || null;
        }
    },
    setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('localStorage is blocked, saving to memory cache:', e);
            this._cache[key] = value;
        }
    }
};

// Seed LocalStorage with realistic mock data if empty, so the admin portal looks stunning instantly
function initSeedData() {
    if (!safeStorage.getItem('srijan_submissions')) {
        const mockSubmissions = [
            { id: 'SRJ-2026-8491', title: 'Cognitive Poetics and Spatial Metaphors in Arundhati Roy’s Fiction', author: 'Dr. Devika Sen', email: 'dsen@jnu.ac.in', institution: 'Jawaharlal Nehru University', domain: 'Literature', type: 'Research Article', abstract: 'This paper analyzes the spatial architectures in modern post-colonial Indian fiction, demonstrating how linguistic metaphors construct cognitive boundaries.', date: '2026-05-14', status: 'Under Review', file: 'Sen_Cognitive_Poetics.docx' },
            { id: 'SRJ-2026-2310', title: 'Ethical Paradigms in Autonomous AI Agents: A Bioethical Assessment', author: 'Prof. Rajesh K. Varma', email: 'rvarma@iisc.ac.in', institution: 'Indian Institute of Science', domain: 'Interdisciplinary', type: 'Theoretical Review', abstract: 'An inquiry into the moral agency of autonomous algorithms operating in medical diagnostics, proposing a novel ethical governance framework.', date: '2026-05-16', status: 'Screening', file: 'Varma_AI_Bioethics.pdf' }
        ];
        safeStorage.setItem('srijan_submissions', JSON.stringify(mockSubmissions));
    }

    if (!safeStorage.getItem('srijan_reviewers')) {
        const mockReviewers = [
            { id: 'REV-9012', name: 'Dr. Elena Rostova', email: 'e.rostova@sorbonne.fr', institution: 'Sorbonne University', country: 'France', expertise: 'Comparative literature, Continental philosophy', link: 'https://orcid.org/0000-0002-1192-3341', date: '2026-05-15', status: 'Approved', cv: 'Rostova_CV_2026.pdf' }
        ];
        safeStorage.setItem('srijan_reviewers', JSON.stringify(mockReviewers));
    }

    if (!safeStorage.getItem('srijan_contacts')) {
        const mockContacts = [
            { id: 'MSG-4412', name: 'Dr. Vikramaditya Bose', email: 'vbose@caluniv.ac.in', subject: 'Special Issue Proposal', message: 'Respected Editors, I am interested in guest editing a special issue on Digital Humanities in South Asia for Volume 2. Please advise on the formal proposal protocol.', date: '2026-05-17', status: 'Unread' }
        ];
        safeStorage.setItem('srijan_contacts', JSON.stringify(mockContacts));
    }
}

initSeedData();

// Initialize Supabase Client
let supabaseClient = null;
if (typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

class SrijanDB {
    static isSupabaseActive() {
        return supabaseClient !== null;
    }

    /* --- SUBMISSIONS --- */
    static async manuscriptRequest(body) {
        if (!supabaseClient) throw new Error('The journal service is unavailable.');
        const { data, error } = await supabaseClient.functions.invoke('srijan-manuscripts', { body });
        if (error) {
            const details = await error.context?.json?.().catch(() => null);
            throw new Error(details?.error || 'The journal could not complete the request. Please try again.');
        }
        return data;
    }

    static async saveSubmission(data) {
        const form = new FormData();
        for (const [name, value] of Object.entries(data)) form.set(name, value);
        return this.manuscriptRequest(form);
    }

    static async getSubmissions() {
        if (!supabaseClient) throw new Error('The journal service is unavailable.');
        const { data, error } = await supabaseClient.from('srijan_submissions').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    }

    static async updateSubmissionStatus(id, status) {
        return this.manuscriptRequest({ action: 'status', id, status });
    }

    static async downloadManuscript(id) {
        const { url } = await this.manuscriptRequest({ action: 'download', id });
        window.location.assign(url);
    }

    static escapeHtml(value) {
        const element = document.createElement('span');
        element.textContent = String(value ?? '');
        return element.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /* --- REVIEWER APPLICATIONS --- */
    static async saveReviewer(data) {
        const entry = {
            id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending Review',
            ...data
        };

        if (this.isSupabaseActive()) {
            try {
                const { error } = await supabaseClient.from('srijan_reviewers').insert([entry]);
                if (error) console.warn('Supabase Reviewer Warning:', error);
            } catch (err) {
                console.error('Supabase Exception:', err);
            }
        }

        const existing = JSON.parse(safeStorage.getItem('srijan_reviewers') || '[]');
        existing.unshift(entry);
        safeStorage.setItem('srijan_reviewers', JSON.stringify(existing));
        return entry;
    }

    static async getReviewers() {
        if (this.isSupabaseActive()) {
            try {
                const { data, error } = await supabaseClient.from('srijan_reviewers').select('*').order('id', { ascending: false });
                if (!error && data && data.length > 0) return data;
            } catch (err) {
                console.warn('Supabase Select Warning:', err);
            }
        }
        return JSON.parse(safeStorage.getItem('srijan_reviewers') || '[]');
    }

    static async updateReviewerStatus(id, newStatus) {
        if (this.isSupabaseActive()) {
            try {
                await supabaseClient.from('srijan_reviewers').update({ status: newStatus }).eq('id', id);
            } catch (err) {
                console.warn('Supabase Update Warning:', err);
            }
        }
        const items = JSON.parse(safeStorage.getItem('srijan_reviewers') || '[]');
        const updated = items.map(item => item.id === id ? { ...item, status: newStatus } : item);
        safeStorage.setItem('srijan_reviewers', JSON.stringify(updated));
    }

    /* --- EDITORIAL CONTACTS --- */
    static async saveContact(data) {
        const entry = {
            id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString().split('T')[0],
            status: 'Unread',
            ...data
        };

        if (this.isSupabaseActive()) {
            try {
                const { error } = await supabaseClient.from('srijan_contacts').insert([entry]);
                if (error) console.warn('Supabase Contact Warning:', error);
            } catch (err) {
                console.error('Supabase Exception:', err);
            }
        }

        const existing = JSON.parse(safeStorage.getItem('srijan_contacts') || '[]');
        existing.unshift(entry);
        safeStorage.setItem('srijan_contacts', JSON.stringify(existing));
        return entry;
    }

    static async getContacts() {
        if (this.isSupabaseActive()) {
            try {
                const { data, error } = await supabaseClient.from('srijan_contacts').select('*').order('id', { ascending: false });
                if (!error && data && data.length > 0) return data;
            } catch (err) {
                console.warn('Supabase Select Warning:', err);
            }
        }
        return JSON.parse(safeStorage.getItem('srijan_contacts') || '[]');
    }

    static async updateContactStatus(id, newStatus) {
        if (this.isSupabaseActive()) {
            try {
                await supabaseClient.from('srijan_contacts').update({ status: newStatus }).eq('id', id);
            } catch (err) {
                console.warn('Supabase Update Warning:', err);
            }
        }
        const items = JSON.parse(safeStorage.getItem('srijan_contacts') || '[]');
        const updated = items.map(item => item.id === id ? { ...item, status: newStatus } : item);
        safeStorage.setItem('srijan_contacts', JSON.stringify(updated));
    }
}

class SrijanAuth {
    static async verifySession() {
        if (!supabaseClient) return false;
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) return false;
            const { data, error } = await supabaseClient.rpc('srijan_is_editor');
            return !error && data === true;
        } catch {
            return false;
        }
    }

    static async loginWithPassword(email, password) {
        if (!supabaseClient) {
            return { success: false, error: 'Database authentication client is offline.' };
        }
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                return { success: false, error: error.message };
            }
            if (data && data.session) {
                if (!await this.verifySession()) {
                    await this.signOut();
                    return { success: false, error: 'This account could not be verified as a journal editor.' };
                }
                return { success: true, user: data.user };
            }
        } catch (err) {
            return { success: false, error: err.message || 'Authentication error' };
        }
        return { success: false, error: 'Invalid authentication credentials' };
    }

    static async signOut() {
        if (supabaseClient) {
            try {
                await supabaseClient.auth.signOut();
            } catch (e) {}
        }
        sessionStorage.removeItem('srijan_admin_active');
        sessionStorage.removeItem('srijan_exec_token');
        sessionStorage.removeItem('srijan_exec_auth');
    }
}

