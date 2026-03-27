/**
* Template Name: Bell
* Template URL: https://bootstrapmade.com/bell-free-bootstrap-4-template/
* Updated: Aug 07 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function () {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader) return;
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  window.addEventListener('load', () => {
    const preloader = document.querySelector('#preloader');
    if (preloader) {
      preloader.remove();
    }
  });

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if(scrollTop){
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });}

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
      filters.addEventListener('click', function () {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function (e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();


// Get API URL - works in both module and non-module contexts
const API_URL = (() => {
  // Try to get from window object if available (set by build)
  if (window.VITE_API_URL) return window.VITE_API_URL;
  
  // Use production URL on production domain
  if (window.location.hostname === 'biospheres.co.in') {
    return 'https://biosphere-research-learning-hub.onrender.com/api/v1';
  }
  
  // Default to localhost for development
  return 'http://localhost:8000/api/v1';
})();

// Unified Login Form Handler - Works for both admin and user
// Role is determined from the database, not sent from client
const loginFormEl = document.getElementById("loginForm");
if (loginFormEl) {
  loginFormEl.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent default form reload

    const emailEl = document.getElementById("email");
    const usernameEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");

    const email = emailEl ? emailEl.value : "";
    const username = usernameEl ? usernameEl.value : "";
    const password = passwordEl ? passwordEl.value : "";

    const messageEl = document.getElementById("loginMessage");
    if (messageEl) messageEl.textContent = "Logging in...";

    try {
      // Do NOT send role - let the backend determine it
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, username, password })
      });

      const data = await res.json();

      if (messageEl) {
        if (res.ok) {
          messageEl.style.color = "green";
          messageEl.textContent = data.message || "Login successful!";
          
          // Store tokens
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          
          // Store user data including role
          localStorage.setItem('user', JSON.stringify(data.data.user));
          localStorage.setItem('userRole', data.data.user.role);
          
          // Route based on role from database (not from client)
          const userRole = data.data.user.role;
          if (userRole === "admin") {
            window.location.href = "/events";
          } else {
            window.location.href = "/events";
          }
        } else {
          messageEl.style.color = "red";
          messageEl.textContent = data.message || "Login failed. Please check your credentials.";
        }
      }
    } catch (error) {
      if (messageEl) {
        messageEl.style.color = "red";
        messageEl.textContent = "An error occurred while logging in. Please try again.";
      }
      console.error(error);
    }
  });
} else {
  console.debug('loginForm not found on page; skipping login handler attachment');
}

const signupFormEl = document.getElementById("signupForm");
if (signupFormEl) {
  signupFormEl.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent default form reload

    const fullName = document.getElementById("fullName") ? document.getElementById("fullName").value : "";
    const email = document.getElementById("userEmail") ? document.getElementById("userEmail").value : "";
    const username = document.getElementById("username") ? document.getElementById("username").value : "";
    const password = document.getElementById("userPassword") ? document.getElementById("userPassword").value : "";

    const messageEl = document.getElementById("signupMessage");
    if (messageEl) messageEl.textContent = "Signing up...";

    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fullName, email, username, password, role: "user" })
      });

      const data = await res.json();

      if (messageEl) {
        if (res.ok) {
          messageEl.style.color = "green";
          messageEl.textContent = data.message || "Sign up successful!";
        } else {
          messageEl.style.color = "red";
          messageEl.textContent = data.message || "Sign up failed. Please check your details.";
        }
      }
    } catch (error) {
      if (messageEl) {
        messageEl.style.color = "red";
        messageEl.textContent = "An error occurred while signing up. Please try again.";
      }
      console.error(error);
    }
  });
} else {
  console.debug('signupForm not found on page; skipping signup handler attachment');
}


const googleLoginBtnEl = document.getElementById("googleLoginBtn");
if (googleLoginBtnEl) {
  googleLoginBtnEl.addEventListener("click", async () => {
    try {
      // Fetch the Google OAuth URL from backend
      const res = await fetch(`${API_URL}/users/auth/google-url`);
      const data = await res.json();
      
      if (data.authUrl) {
        // Redirect to Google OAuth URL provided by backend
        window.location.href = data.authUrl;
      } else {
        console.error("Could not get Google OAuth URL");
        alert("Google login is not available. Please try again.");
      }
    } catch (error) {
      console.error("Error initiating Google login:", error);
      alert("An error occurred. Please try again.");
    }
  });
} else {
  console.debug('googleLoginBtn not found; skipping Google OAuth button handler');
}

// Handle Google OAuth callback
function handleGoogleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const authSuccess = params.get('authSuccess');
  const isAdmin = params.get('isAdmin') === 'true';
  const tokenFromUrl = params.get('token'); // Backend sends token in URL

  if (authSuccess === 'true') {
    try {
      // Store token from URL if available (backend sends it for Google OAuth)
      if (tokenFromUrl) {
        localStorage.setItem('accessToken', tokenFromUrl);
        localStorage.setItem('refreshToken', tokenFromUrl); // Use same token for refresh detection
      }

      // Fetch user info to get role and store in localStorage
      fetch(`${API_URL}/users/current-user`, {
        method: "GET",
        credentials: "include" // Include cookies with request
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch user');
          return res.json();
        })
        .then(data => {
          if (data.data && data.data.user) {
            const user = data.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('userRole', user.role);
            
            // Ensure refreshToken is set for login detection
            if (!localStorage.getItem('refreshToken')) {
              localStorage.setItem('refreshToken', tokenFromUrl || 'true');
            }
            
            // Redirect based on role from database (React routes, not HTML files)
            if (user.role === 'admin') {
              window.location.href = "/admin-events";
            } else {
              window.location.href = "/events";
            }
          }
        })
        .catch(err => {
          console.warn("Could not fetch user after Google login:", err);
          // Still redirect - tokens are in httpOnly cookies
          if (isAdmin) {
            localStorage.setItem('userRole', 'admin');
            if (!localStorage.getItem('refreshToken')) {
              localStorage.setItem('refreshToken', tokenFromUrl || 'true');
            }
            window.location.href = "/admin-events";
          } else {
            localStorage.setItem('userRole', 'user');
            if (!localStorage.getItem('refreshToken')) {
              localStorage.setItem('refreshToken', tokenFromUrl || 'true');
            }
            window.location.href = "/events";
          }
        });
    } catch (err) {
      console.error("Error handling Google auth callback:", err);
    }
  }

  // Clean up URL params after handling
  if (authSuccess) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleGoogleAuthCallback);
} else {
  handleGoogleAuthCallback();
}


