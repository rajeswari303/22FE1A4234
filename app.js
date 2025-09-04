
const authSection = document.getElementById('auth-section');
const shortenerSection = document.getElementById('shortener-section');
const analyticsSection = document.getElementById('analytics-section');
const loginForm = document.getElementById('login-form');
const shortenForm = document.getElementById('shorten-form');
const resultArea = document.getElementById('result-area');
const analyticsList = document.getElementById('analytics-list');
const authBtn = document.getElementById('auth-btn');
const dashboardBtn = document.getElementById('dashboard-btn');
const logoutBtn = document.getElementById('logout-btn');

const SECRET_PASSWORD = 'student123'
const AUTH_TOKEN_KEY = 'authToken';
const URL_STORAGE_KEY = 'urls';


function getStoredUrls() {
    const data = localStorage.getItem(URL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveUrls(urls) {
    localStorage.setItem(URL_STORAGE_KEY, JSON.stringify(urls));
}

function generateRandomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password-input').value;
    if (password === SECRET_PASSWORD) {
        localStorage.setItem(AUTH_TOKEN_KEY, 'authenticated');
        updateUI();
    } else {
        alert('Incorrect password!');
    }
}

function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    updateUI();
}

function updateUI() {
    const isAuthenticated = localStorage.getItem(AUTH_TOKEN_KEY) === 'authenticated';
    authSection.style.display = isAuthenticated ? 'none' : 'block';
    shortenerSection.style.display = isAuthenticated ? 'block' : 'none';
    authBtn.style.display = isAuthenticated ? 'none' : 'block';
    dashboardBtn.style.display = isAuthenticated ? 'block' : 'none';
    logoutBtn.style.display = isAuthenticated ? 'block' : 'none';
    
    
    analyticsSection.style.display = 'none';
}

function handleShorten(e) {
    e.preventDefault();
    const longUrl = document.getElementById('long-url-input').value;
    let customCode = document.getElementById('custom-code-input').value.trim();
    const urls = getStoredUrls();

    
    if (customCode) {
        const isCodeTaken = urls.some(url => url.shortCode === customCode);
        if (isCodeTaken) {
            resultArea.innerHTML = `<p style="color:red;">Custom code already taken!</p>`;
            return;
        }
    } else {
        customCode = generateRandomCode();
        
        while (urls.some(url => url.shortCode === customCode)) {
            customCode = generateRandomCode();
        }
    }

    const newUrl = {
        shortCode: customCode,
        longUrl: longUrl,
        clicks: [],
        createdAt: Date.now()
    };
    urls.push(newUrl);
    saveUrls(urls);
    const shortLink = `${window.location.origin}/#${customCode}`;
    resultArea.innerHTML = `<p>Your short link: <a href="${shortLink}" target="_blank">${shortLink}</a></p>`;
}

function handleRedirect() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const urls = getStoredUrls();
        const urlEntry = urls.find(url => url.shortCode === hash);

        if (urlEntry) {
    
            const clickData = { timestamp: Date.now() };
            urlEntry.clicks.push(clickData);
            saveUrls(urls);
            window.location.href = urlEntry.longUrl;
        } else {
            document.body.innerHTML = '<h1>404: Link Not Found or Expired</h1>';
        }
    }
}

function renderAnalytics() {
    const urls = getStoredUrls();
    analyticsList.innerHTML = '';
    urls.forEach(url => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3>Short Code: ${url.shortCode}</h3>
            <p>Original URL: <a href="${url.longUrl}" target="_blank">${url.longUrl}</a></p>
            <p>Total Clicks: ${url.clicks.length}</p>
        `;
        analyticsList.appendChild(div);
    });
}

function handleDashboardClick() {
    shortenerSection.style.display = 'none';
    analyticsSection.style.display = 'block';
    renderAnalytics();
}


document.addEventListener('DOMContentLoaded', () => {
    handleRedirect();
    updateUI();
    loginForm.addEventListener('submit', handleLogin);
    shortenForm.addEventListener('submit', handleShorten);
    logoutBtn.addEventListener('click', handleLogout);
    dashboardBtn.addEventListener('click', handleDashboardClick);
});
