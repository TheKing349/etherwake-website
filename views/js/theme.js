// Initialize theme from localStorage
export function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;

    // Set initial theme
    html.setAttribute('data-theme', savedTheme);

    // Set initial icon
    const icon = document.getElementById('themeIcon');
    icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

export function setupThemeToggle() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    const tables = document.querySelectorAll('.table');
    tables.forEach(table => {
        table.style.display = 'none';
        void table.offsetWidth;
        table.style.display = 'table';
    });

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const icon = document.getElementById('themeIcon');
    icon.classList.remove('fa-sun', 'fa-moon');
    icon.classList.add(newTheme === 'dark' ? 'fa-moon' : 'fa-sun');
}