// Load components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Load page content
async function loadPage(pageName) {
    try {
        const response = await fetch(`pages/${pageName}.html`);
        if (!response.ok) throw new Error(`Failed to load page ${pageName}`);
        const html = await response.text();
        document.getElementById('content-placeholder').innerHTML = html;
        
        // Load page-specific script if it exists
        const script = document.createElement('script');
        script.src = `scripts/pages/${pageName}.js`;
        script.onerror = () => console.log(`No script found for ${pageName}`);
        document.body.appendChild(script);
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('content-placeholder').innerHTML = 
            '<div class="alert alert-danger">Error loading page content</div>';
    }
}

// Initialize the application
async function init() {
    // Load header and menu
    await Promise.all([
        loadComponent('header-placeholder', 'components/header.html'),
        loadComponent('menu-placeholder', 'components/menu.html')
    ]);

    // Set up navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            loadPage(page);
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            e.target.classList.add('active');
        });
    });

    // Load default page
    loadPage('inventory');
}

// Start the application
document.addEventListener('DOMContentLoaded', init); 
