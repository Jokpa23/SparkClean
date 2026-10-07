/* ============================================
   SPARKCLEAN SERVICES - Main JavaScript
   ============================================ */

// ---------- DOM Ready ----------
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initBackToTop();
  initSmoothScroll();
  initCounters();
  initFormValidation();
  initToasts();
  initPasswordToggles();
});

// ---------- Header Scroll Effect ----------
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// ---------- Mobile Menu ----------
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;
  
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  
  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
  
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });
}

// ---------- Scroll Animations ----------
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  elements.forEach(el => observer.observe(el));
}

// ---------- Back to Top Button ----------
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---------- Smooth Scroll ----------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ---------- Counter Animation ----------
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    const current = Math.floor(start + (target - start) * eased);
    el.textContent = current.toLocaleString() + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// ---------- Form Validation ----------
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      let isValid = true;
      
      // Clear previous errors
      form.querySelectorAll('.error-message').forEach(el => el.remove());
      form.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
      
      // Validate required fields
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          showError(field, 'This field is required');
        }
      });
      
      // Validate email
      form.querySelectorAll('[type="email"]').forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
          isValid = false;
          showError(field, 'Please enter a valid email address');
        }
      });
      
      // Validate phone
      form.querySelectorAll('[type="tel"]').forEach(field => {
        if (field.value && !isValidPhone(field.value)) {
          isValid = false;
          showError(field, 'Please enter a valid phone number');
        }
      });
      
      if (isValid) {
        // Handle form submission
        handleFormSubmit(form);
      }
    });
  });
}

function showError(field, message) {
  field.classList.add('error');
  const errorEl = document.createElement('span');
  errorEl.className = 'error-message';
  errorEl.style.cssText = 'color:#ef4444;font-size:.8rem;margin-top:.25rem;display:block;';
  errorEl.textContent = message;
  field.parentNode.appendChild(errorEl);
  
  field.style.borderColor = '#ef4444';
  field.addEventListener('input', function handler() {
    field.style.borderColor = '';
    field.classList.remove('error');
    const err = field.parentNode.querySelector('.error-message');
    if (err) err.remove();
    field.removeEventListener('input', handler);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\d\s\-\+\(\)]{7,}$/.test(phone);
}

function handleFormSubmit(form) {
  const formType = form.getAttribute('data-form');
  
  if (formType === 'booking') {
    const formData = new FormData(form);
    const booking = Object.fromEntries(formData.entries());
    booking.id = 'BK' + Date.now();
    booking.status = 'pending';
    booking.createdAt = new Date().toISOString();
    
    // Save to localStorage
    const bookings = JSON.parse(localStorage.getItem('sparkclean_bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('sparkclean_bookings', JSON.stringify(bookings));
    
    showToast('Booking Submitted!', 'We\'ll contact you within 24 hours to confirm your booking.', 'success');
    form.reset();
  } else if (formType === 'contact') {
    showToast('Message Sent!', 'Thank you for contacting us. We\'ll respond shortly.', 'success');
    form.reset();
  } else if (formType === 'login') {
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    
    // Check admin login
    if (email === 'admin@sparkclean.com' && password === 'admin123') {
      localStorage.setItem('sparkclean_user', JSON.stringify({ email, role: 'admin', name: 'Admin' }));
      showToast('Welcome Back!', 'Redirecting to admin dashboard...', 'success');
      setTimeout(() => window.location.href = 'admin.html', 1000);
      return;
    }
    
    // Check registered users
    const users = JSON.parse(localStorage.getItem('sparkclean_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('sparkclean_user', JSON.stringify(user));
      showToast('Welcome Back!', `Hello ${user.name}, you're now logged in.`, 'success');
      setTimeout(() => window.location.href = 'index.html', 1000);
    } else {
      showToast('Login Failed', 'Invalid email or password. Try admin@sparkclean.com / admin123', 'error');
    }
  } else if (formType === 'register') {
    const formData = new FormData(form);
    const user = Object.fromEntries(formData.entries());
    
    if (user.password !== user.confirmPassword) {
      showToast('Error', 'Passwords do not match.', 'error');
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('sparkclean_users') || '[]');
    if (users.find(u => u.email === user.email)) {
      showToast('Error', 'An account with this email already exists.', 'error');
      return;
    }
    
    user.id = 'USR' + Date.now();
    user.role = 'customer';
    delete user.confirmPassword;
    users.push(user);
    localStorage.setItem('sparkclean_users', JSON.stringify(users));
    
    showToast('Account Created!', 'You can now log in with your credentials.', 'success');
    setTimeout(() => window.location.href = 'login.html', 1500);
  }
}

// ---------- Toast Notifications ----------
function initToasts() {
  // Create toast container if not exists
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(title, message, type = 'success') {
  const container = document.querySelector('.toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '✓'}</span>
    <div class="toast-content">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ---------- Password Toggles ----------
function initPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
      } else {
        input.type = 'password';
        toggle.textContent = '👁';
      }
    });
  });
}

// ---------- Local Storage Helpers ----------
function getBookings() {
  return JSON.parse(localStorage.getItem('sparkclean_bookings') || '[]');
}

function saveBookings(bookings) {
  localStorage.setItem('sparkclean_bookings', JSON.stringify(bookings));
}

function getBlogPosts() {
  return JSON.parse(localStorage.getItem('sparkclean_blogs') || getDefaultBlogPosts());
}

function saveBlogPosts(posts) {
  localStorage.setItem('sparkclean_blogs', JSON.stringify(posts));
}

function getServices() {
  return JSON.parse(localStorage.getItem('sparkclean_services') || getDefaultServices());
}

function saveServices(services) {
  localStorage.setItem('sparkclean_services', JSON.stringify(services));
}

function getDefaultBlogPosts() {
  return JSON.stringify([
    {
      id: 'BP001',
      title: '10 Quick Cleaning Tips for a Spotless Home',
      excerpt: 'Discover simple yet effective cleaning hacks that will save you time and keep your home looking pristine every day.',
      content: 'Maintaining a clean home doesn\'t have to be a time-consuming chore. Here are 10 quick tips that will help you keep your home spotless with minimal effort...',
      category: 'Tips',
      author: 'Sarah Johnson',
      date: '2026-07-10',
      image: 'blog-1'
    },
    {
      id: 'BP002',
      title: 'Why Professional Office Cleaning Boosts Productivity',
      excerpt: 'Research shows that a clean workspace can increase employee productivity by up to 15%. Learn how professional cleaning makes a difference.',
      content: 'A clean office environment is more than just aesthetically pleasing — it directly impacts employee productivity and well-being...',
      category: 'Business',
      author: 'Michael Chen',
      date: '2026-07-05',
      image: 'blog-2'
    },
    {
      id: 'BP003',
      title: 'Summer Special: 20% Off Deep Cleaning Services',
      excerpt: 'Take advantage of our summer promotion! Get 20% off all deep cleaning services booked before the end of August.',
      content: 'This summer, give your home the deep clean it deserves at an incredible price. Our professional team is ready to transform your space...',
      category: 'Promotions',
      author: 'SparkClean Team',
      date: '2026-07-01',
      image: 'blog-3'
    }
  ]);
}

function getDefaultServices() {
  return JSON.stringify([
    {
      id: 'SVC001',
      name: 'Residential Cleaning',
      description: 'Complete home cleaning service including dusting, vacuuming, mopping, kitchen and bathroom sanitization.',
      price: 80,
      priceUnit: 'session',
      icon: '🏠',
      image: 'residential'
    },
    {
      id: 'SVC002',
      name: 'Office Cleaning',
      description: 'Professional office and commercial space cleaning to maintain a productive and healthy work environment.',
      price: 150,
      priceUnit: 'session',
      icon: '🏢',
      image: 'office'
    },
    {
      id: 'SVC003',
      name: 'Deep Cleaning',
      description: 'Thorough deep cleaning service covering every corner, including hard-to-reach areas and intensive sanitization.',
      price: 200,
      priceUnit: 'session',
      icon: '✨',
      image: 'deep'
    },
    {
      id: 'SVC004',
      name: 'Carpet Cleaning',
      description: 'Professional carpet cleaning using eco-friendly products to remove stains, allergens, and odors effectively.',
      price: 120,
      priceUnit: 'room',
      icon: '🧹',
      image: 'carpet'
    },
    {
      id: 'SVC005',
      name: 'Window Cleaning',
      description: 'Crystal clear window cleaning for residential and commercial properties, inside and out.',
      price: 60,
      priceUnit: 'session',
      icon: '🪟',
      image: 'window'
    },
    {
      id: 'SVC006',
      name: 'Move-in/Move-out Cleaning',
      description: 'Specialized cleaning for moving transitions. Ensure your old or new space is spotless and ready.',
      price: 250,
      priceUnit: 'session',
      icon: '📦',
      image: 'move'
    }
  ]);
}

// ---------- Modal Helpers ----------
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

// ---------- Admin Sidebar Toggle ----------
function toggleAdminSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
  }
}
