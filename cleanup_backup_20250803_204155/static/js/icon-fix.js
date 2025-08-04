// Icon rendering fix for Font Awesome
document.addEventListener('DOMContentLoaded', function() {
    // Disable all animations during page load
    document.body.style.setProperty('animation', 'none', 'important');
    document.body.style.setProperty('transition', 'none', 'important');
    
    // Force stable icon rendering
    const icons = document.querySelectorAll('.svg-inline--fa');
    icons.forEach(icon => {
        icon.style.setProperty('transform', 'none', 'important');
        icon.style.setProperty('animation', 'none', 'important');
        icon.style.setProperty('transition', 'none', 'important');
        
        // Specific handling for dashboard icons
        if (icon.classList.contains('display-6')) {
            icon.style.setProperty('display', 'block', 'important');
            icon.style.setProperty('margin', '0 auto 0.5rem auto', 'important');
            icon.style.setProperty('text-align', 'center', 'important');
            icon.style.setProperty('font-size', '2.5rem', 'important');
            icon.style.setProperty('width', '2.5rem', 'important');
            icon.style.setProperty('height', '2.5rem', 'important');
        }
        
        // Specific handling for sidebar icons
        if (icon.classList.contains('me-2')) {
            icon.style.setProperty('display', 'inline-block', 'important');
            icon.style.setProperty('margin', '0 0.5rem 0 0', 'important');
            icon.style.setProperty('vertical-align', 'middle', 'important');
            icon.style.setProperty('font-size', '1.2rem', 'important');
            icon.style.setProperty('width', '1.2rem', 'important');
            icon.style.setProperty('height', '1.2rem', 'important');
        }
    });
    
    // Re-enable animations after a short delay
    setTimeout(() => {
        document.body.style.removeProperty('animation');
        document.body.style.removeProperty('transition');
        
        // Re-enable specific transitions for interactive elements
        const interactiveElements = document.querySelectorAll('.card, .btn, aside .sidebar a');
        interactiveElements.forEach(element => {
            element.style.setProperty('transition', 'all 0.3s ease', 'important');
        });
    }, 100);
});

// Additional fix for dynamic content
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
                const newIcons = node.querySelectorAll('.svg-inline--fa');
                newIcons.forEach(icon => {
                    icon.style.setProperty('transform', 'none', 'important');
                    icon.style.setProperty('animation', 'none', 'important');
                    icon.style.setProperty('transition', 'none', 'important');
                });
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
