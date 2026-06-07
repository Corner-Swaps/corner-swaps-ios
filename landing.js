// --- 1. Static Configuration & Mock Data ---
const MOCK_PINS = [
    { name: "Sarah Chen", category: "Food & Drink", title: "Balcony Tomatoes", lat: 49.281, lng: -123.125, desc: "Fresh organic tomatoes from my balcony garden.", img: "https://images.unsplash.com/photo-1566385101042-1a0aa0c12e8c?q=80&w=150", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" },
    { name: "David Kim", category: "Food & Drink", title: "Sourdough Slices", lat: 49.278, lng: -123.118, desc: "Fresh organic sourdough baked weekly.", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=150", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" },
    { name: "Ava L.", category: "Home & Gear", title: "E-Cargo Bike Loan", lat: 49.286, lng: -123.112, desc: "Load bike for shopping or short relocations.", img: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=150", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" },
    { name: "Elena R.", category: "Skills & Education", title: "Beach Yoga Flow", lat: 49.282, lng: -123.120, desc: "Sunrise mindfulness and stretching sessions.", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=150", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" },
    { name: "Noah M.", category: "Handyman & Services", title: "Tech & Router Setup", lat: 49.272, lng: -123.115, desc: "WIFI router setup and malware cleaning.", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=150", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" }
];


const RECENT_TICKER_ITEMS = [
    { text: "Sofia M. swapped <strong>Acoustic Guitar Lessons</strong> with Sarah C. for <strong>Homegrown Tomatoes</strong>.", time: "2 min ago" },
    { text: "David K. shared a loaf of <strong>Artisanal Sourdough</strong> with Zoe for active <strong>Kefir Grains</strong>.", time: "12 min ago" },
    { text: "Ava M. lent an <strong>Electric Cargo Bike</strong> to Noah for a weekend house move.", time: "42 min ago" },
    { text: "Ethan S. swapped <strong>Home Maintenance (hanging shelves)</strong> with Elena for <strong>Yoga Sessions</strong>.", time: "1 hour ago" },
    { text: "Marcus T. hemmed <strong>two pairs of raw denim jeans</strong> for Liam in exchange for <strong>Tomato Seedlings</strong>.", time: "2 hours ago" },
    { text: "Sophia L. crafted a custom <strong>Aromatherapy Roll-On Oil blend</strong> for Chloe's <strong>Painted Tote Bag</strong>.", time: "4 hours ago" }
];

const CALCULATOR_FACTORS = {
    sourdough: { co2: 1.2, name: 'Sourdough Loaves', unit: 'loaves', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=150', icon: 'restaurant' },
    tools: { co2: 15.0, name: 'Power Tools Borrowed', unit: 'days borrowed', image: 'https://images.unsplash.com/photo-1530124560676-41bc1275d4d6?q=80&w=150', icon: 'construction' },
    garden: { co2: 5.5, name: 'Balcony/Garden Help', unit: 'hours of help', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=150', icon: 'yard' },
    tech: { co2: 8.0, name: 'Tech Support Help', unit: 'sessions', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=150', icon: 'handyman' },
    clothing: { co2: 12.0, name: 'Clothing Swap Items', unit: 'clothing pieces', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=150', icon: 'checkroom' },
    book: { co2: 3.5, name: 'Books & Puzzles Traded', unit: 'books/puzzles', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=150', icon: 'child_care' }
};

let landingLeafletMap = null;

// --- 2. Initialization Flow ---
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initCarbonCalculator();
    initFaqAccordion();
    initLiveExchangeFeed();
    initLandingMap();
    initSmoothScroll();

    // Wire up landing CTA button to switch view in SPA
    const ctaBtn = document.getElementById('landing-map-detail-cta');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            if (typeof showView === 'function') {
                showView('sign_in');
            } else {
                window.location.href = 'app.html';
            }
        });
    }
});


// --- 3. Scroll Reveal Animations ---
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// --- 4. Smooth Scrolling ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const headerHeight = 80;
                const offsetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

window.scrollToLandingSection = function(sectionId) {
    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
        const headerHeight = 80;
        const offsetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

// --- 5. Carbon Savings Calculator ---
function initCarbonCalculator() {
    const categorySelect = document.getElementById('calc-category');
    const valueSlider = document.getElementById('calc-slider');
    const valueDisplay = document.getElementById('calc-slider-val');
    const co2Display = document.getElementById('calc-co2-saved');
    const bottlesDisplay = document.getElementById('calc-bottles-saved');
    const chargesDisplay = document.getElementById('calc-charges-saved');
    const driveDisplay = document.getElementById('calc-drive-saved');
    const calcUnitLabel = document.getElementById('calc-unit-label');
    const calcDetailLabel = document.getElementById('calc-detail-label');

    if (!categorySelect || !valueSlider) return;

    function updateCalculator() {
        const type = categorySelect.value;
        const count = parseFloat(valueSlider.value);
        const data = CALCULATOR_FACTORS[type];

        if (!data) return;

        valueDisplay.textContent = count;
        calcUnitLabel.textContent = `${count} ${data.unit}`;
        calcDetailLabel.textContent = `estimated carbon savings compared to purchasing new.`;

        const co2Saved = count * data.co2;
        const bottlesSaved = Math.round(co2Saved * 25);
        const chargesSaved = Math.round(co2Saved * 122);
        const driveSaved = (co2Saved * 4.1).toFixed(1);

        animateCounter(co2Display, co2Saved, 1);
        animateCounter(bottlesDisplay, bottlesSaved, 0);
        animateCounter(chargesDisplay, chargesSaved, 0);
        animateCounter(driveDisplay, driveSaved, 1);
    }

    categorySelect.addEventListener('change', () => {
        const type = categorySelect.value;
        if (type === 'tools') {
            valueSlider.max = "14";
            valueSlider.value = "3";
        } else if (type === 'sourdough') {
            valueSlider.max = "30";
            valueSlider.value = "5";
        } else {
            valueSlider.max = "20";
            valueSlider.value = "4";
        }
        updateCalculator();
    });

    valueSlider.addEventListener('input', updateCalculator);
    updateCalculator();
}

function animateCounter(element, targetValue, decimals = 0) {
    if (!element) return;
    const startVal = parseFloat(element.innerText) || 0;
    const endVal = parseFloat(targetValue);
    if (startVal === endVal) return;

    const duration = 400;
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = progress * (2 - progress);
        const currentVal = startVal + (endVal - startVal) * ease;
        element.innerText = currentVal.toFixed(decimals);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.innerText = endVal.toFixed(decimals);
        }
    }
    requestAnimationFrame(step);
}

// --- 6. FAQ Accordion ---
function initFaqAccordion() {
    const accordionItems = document.querySelectorAll('.faq-item');

    accordionItems.forEach(item => {
        const button = item.querySelector('.faq-question-btn');
        const answer = item.querySelector('.faq-answer-panel');
        const icon = item.querySelector('.faq-icon');

        if (!button || !answer) return;

        button.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer-panel').style.maxHeight = null;
                    const otherIcon = otherItem.querySelector('.faq-icon');
                    if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                }
            });

            if (isOpen) {
                item.classList.remove('active');
                answer.style.maxHeight = null;
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// --- 7. Live Exchange Feed Ticker ---
function initLiveExchangeFeed() {
    const feedContainer = document.getElementById('live-feed-ticker-container');
    if (!feedContainer) return;

    feedContainer.innerHTML = '';
    RECENT_TICKER_ITEMS.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = "flex justify-between items-center bg-white/40 dark:bg-white/5 border border-[#308A5E]/5 dark:border-white/5 p-4 rounded-xl shadow-sm text-xs transition-colors hover:border-[#308A5E]/20";
        itemEl.innerHTML = `
            <div class="flex items-center gap-2 min-w-0">
                <span class="material-symbols-outlined text-xs text-[#308A5E] shrink-0">published_with_changes</span>
                <span class="truncate dark:text-gray-200">${item.text}</span>
            </div>
            <span class="text-[10px] text-gray-500 font-semibold shrink-0 ml-3 whitespace-nowrap">${item.time}</span>
        `;
        feedContainer.appendChild(itemEl);
    });

    setInterval(() => {
        const first = feedContainer.firstElementChild;
        if (!first) return;

        first.style.opacity = '0';
        first.style.transform = 'translateY(-10px)';
        first.style.transition = 'all 0.4s ease';

        setTimeout(() => {
            feedContainer.appendChild(first);
            first.style.opacity = '1';
            first.style.transform = 'translateY(0)';
            first.style.transition = 'none';
        }, 400);
    }, 4500);
}

// --- 8. Interactive Leaflet Map Showcase ---
function getLandingCategoryColor(category) {
    if (!category) return '#546E7A';
    const catLower = category.toLowerCase();
    if (catLower.includes('food') || catLower.includes('drink')) return '#EF5350';
    if (catLower.includes('home') || catLower.includes('living') || catLower.includes('gear')) return '#AB47BC';
    if (catLower.includes('garden') || catLower.includes('outdoor')) return '#66BB6A';
    if (catLower.includes('skills') || catLower.includes('education')) return '#42A5F5';
    if (catLower.includes('handyman') || catLower.includes('service')) return '#FF7043';
    if (catLower.includes('creative') || catLower.includes('art')) return '#EC407A';
    if (catLower.includes('health') || catLower.includes('wellness')) return '#26A69A';
    if (catLower.includes('clothing') || catLower.includes('apparel')) return '#FFB300';
    if (catLower.includes('books') || catLower.includes('games') || catLower.includes('entertainment')) return '#5C6BC0';
    if (catLower.includes('kids') || catLower.includes('maternity')) return '#F06292';
    if (catLower.includes('event') || catLower.includes('meetup')) return '#8D6E63';
    if (catLower.includes('language') || catLower.includes('info') || catLower.includes('exchange')) return '#00ACC1';
    return '#546E7A';
}

function getLandingCategoryIcon(category) {
    if (!category) return 'help';
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('drink')) return 'restaurant';
    if (cat.includes('home') || cat.includes('living') || cat.includes('gear')) return 'home';
    if (cat.includes('garden') || cat.includes('outdoor')) return 'yard';
    if (cat.includes('skills') || cat.includes('education')) return 'school';
    if (cat.includes('handyman') || cat.includes('service')) return 'handyman';
    if (cat.includes('creative') || cat.includes('art')) return 'palette';
    if (cat.includes('health') || cat.includes('wellness')) return 'spa';
    if (cat.includes('clothing') || cat.includes('apparel')) return 'checkroom';
    if (cat.includes('books') || cat.includes('games') || cat.includes('entertainment')) return 'sports_esports';
    if (cat.includes('kids') || cat.includes('maternity')) return 'stroller';
    if (cat.includes('event') || cat.includes('meetup')) return 'groups';
    if (cat.includes('language') || cat.includes('info') || cat.includes('exchange')) return 'translate';
    return 'help';
}

function initLandingMap() {
    const mapContainer = document.getElementById('landing-preview-map');
    if (!mapContainer || typeof L === 'undefined') return;

    if (landingLeafletMap) {
        setTimeout(() => landingLeafletMap.invalidateSize(), 150);
        return;
    }

    landingLeafletMap = L.map('landing-preview-map', {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        preferCanvas: true,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true
    }).setView([49.279, -123.120], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        keepBuffer: 6,
        updateWhenPanning: false,
        updateWhenIdle: true
    }).addTo(landingLeafletMap);

    MOCK_PINS.forEach(pin => {
        const color = getLandingCategoryColor(pin.category);
        const iconName = getLandingCategoryIcon(pin.category);

        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="pin-icon flex items-center justify-center w-9 h-9 rounded-full shadow-md text-white border-2 border-white transition-transform hover:scale-110 active:scale-95" style="background-color: ${color};">
                    <span class="material-symbols-outlined text-[18px]">${iconName}</span>
                   </div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });

        // Wire up click event to slide up the Centered Details Sheet Overlay Modal
        marker.on('click', () => {
            const img = document.getElementById('landing-map-detail-img');
            const title = document.getElementById('landing-map-detail-title');
            const desc = document.getElementById('landing-map-detail-desc');
            const loc = document.getElementById('landing-map-detail-location');
            const avatar = document.getElementById('landing-map-detail-author-avatar');
            const authorName = document.getElementById('landing-map-detail-author-name');
            const overlay = document.getElementById('landing-map-detail-overlay');

            if (img) img.src = pin.img;
            if (title) title.innerText = pin.title;
            if (desc) desc.innerText = pin.desc;
            if (loc) loc.innerText = `Village · Yaletown`;
            if (avatar) avatar.src = pin.avatar;
            if (authorName) authorName.innerText = pin.name;
            if (overlay) overlay.classList.add('active');
        });

        marker.addTo(landingLeafletMap);
    });

    setTimeout(() => landingLeafletMap.invalidateSize(), 500);
}

// --- 8.1 Map Overlay Controls ---
window.closeLandingMapItemDetail = function() {
    const overlay = document.getElementById('landing-map-detail-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

window.handleLandingMapDetailAuthorClick = function() {
    // Scroll to waitlist sign up
    const waitlist = document.getElementById('join-waitlist-section') || document.getElementById('waitlist') || document.getElementById('calculator');
    if (waitlist) {
        const headerHeight = 80;
        const offsetPosition = waitlist.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};


// --- 9. Waitlist Submission ---
window.handleJoinSubmit = function(e) {
    e.preventDefault();
    const email = document.getElementById('join-email').value;
    const postal = document.getElementById('join-postal').value;
    console.log("Waitlist submission received:", email, postal);

    document.getElementById('join-form').classList.add('hidden');
    document.getElementById('join-success-msg').classList.remove('hidden');
};

// Modals open/close helper
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

// --- 10. Interactive Phone Mockup Handlers ---
window.switchMiniTab = function(tabName, event) {
    if (event) {
        event.stopPropagation();
    }
    
    // Play sound click if active
    if (typeof playSound === 'function') {
        playSound('click');
    }
    
    // Hide all mini tabs
    document.getElementById('mini-tab-map').classList.add('hidden');
    document.getElementById('mini-tab-swaps').classList.add('hidden');
    document.getElementById('mini-tab-chat').classList.add('hidden');
    
    // Show selected mini tab
    document.getElementById(`mini-tab-${tabName}`).classList.remove('hidden');
    
    // Reset navbar text colors
    const navItems = ['map', 'swaps', 'chat'];
    navItems.forEach(item => {
        const el = document.getElementById(`mini-nav-${item}`);
        if (el) {
            el.classList.remove('text-forest-green');
            el.classList.add('text-[#424840]');
        }
    });
    
    // Highlight active nav item
    const activeEl = document.getElementById(`mini-nav-${tabName}`);
    if (activeEl) {
        activeEl.classList.remove('text-[#424840]');
        activeEl.classList.add('text-forest-green');
    }
};

window.handlePhoneMockupClick = function(event) {
    // Navigate into the web app view
    if (typeof showView === 'function') {
        showView(typeof state !== 'undefined' && state.currentUser ? 'village' : 'welcome');
    } else {
        window.location.href = 'index.html';
    }
};

