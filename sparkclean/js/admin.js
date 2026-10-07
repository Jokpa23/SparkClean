/* ============================================
   SPARKCLEAN SERVICES - Admin Dashboard JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

function initAdminDashboard() {
  // Check auth
  const user = JSON.parse(localStorage.getItem('sparkclean_user') || 'null');
  if (!user || user.role !== 'admin') {
    // Allow demo access
  }
  
  // Initialize seed data if empty
  if (!localStorage.getItem('sparkclean_bookings')) {
    seedBookings();
  }
  
  // Load dashboard data
  loadDashboardStats();
  loadBookingsTable();
  loadServicesTable();
  loadBlogTable();
  
  // Init tabs
  initAdminTabs();
  
  // Init admin forms
  initAdminForms();
  
  // Init sidebar toggle
  const sidebarToggle = document.querySelector('.admin-sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleAdminSidebar);
  }
}

// ---------- Seed Data ----------
function seedBookings() {
  const sampleBookings = [
    {
      id: 'BK1001',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+234 801 234 5678',
      serviceType: 'Deep Cleaning',
      preferredDate: '2026-07-20',
      address: '12 Trans Amadi, Port Harcourt',
      message: 'Need a thorough deep clean for a 3-bedroom apartment.',
      status: 'pending',
      createdAt: '2026-07-10T09:30:00Z'
    },
    {
      id: 'BK1002',
      fullName: 'Grace Okonkwo',
      email: 'grace@example.com',
      phone: '+234 802 345 6789',
      serviceType: 'Office Cleaning',
      preferredDate: '2026-07-18',
      address: '45 GRA Phase 2, Port Harcourt',
      message: 'Weekly office cleaning service for a 10-person office.',
      status: 'confirmed',
      createdAt: '2026-07-08T14:15:00Z'
    },
    {
      id: 'BK1003',
      fullName: 'Emeka Nwankwo',
      email: 'emeka@example.com',
      phone: '+234 803 456 7890',
      serviceType: 'Residential Cleaning',
      preferredDate: '2026-07-15',
      address: '78 Woji Road, Port Harcourt',
      message: 'Regular bi-weekly cleaning for a 2-bedroom flat.',
      status: 'completed',
      createdAt: '2026-07-05T11:00:00Z'
    },
    {
      id: 'BK1004',
      fullName: 'Amina Bello',
      email: 'amina@example.com',
      phone: '+234 805 678 9012',
      serviceType: 'Move-in/Move-out Cleaning',
      preferredDate: '2026-07-22',
      address: '15 Ogbunabali, Port Harcourt',
      message: 'Moving out next week, need the apartment cleaned for inspection.',
      status: 'pending',
      createdAt: '2026-07-12T16:45:00Z'
    },
    {
      id: 'BK1005',
      fullName: 'Chidi Eze',
      email: 'chidi@example.com',
      phone: '+234 806 789 0123',
      serviceType: 'Carpet Cleaning',
      preferredDate: '2026-07-25',
      address: '33 Rumuola, Port Harcourt',
      message: 'Three rooms with carpet need professional cleaning.',
      status: 'confirmed',
      createdAt: '2026-07-11T08:20:00Z'
    }
  ];
  
  localStorage.setItem('sparkclean_bookings', JSON.stringify(sampleBookings));
}

// ---------- Dashboard Stats ----------
function loadDashboardStats() {
  const bookings = getBookings();
  const services = JSON.parse(getServices());
  const blogs = JSON.parse(getBlogPosts());
  
  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    totalServices: services.length,
    totalBlogs: blogs.length
  };
  
  // Update stat elements
  Object.keys(stats).forEach(key => {
    const el = document.getElementById(key);
    if (el) el.textContent = stats[key];
  });
}

// ---------- Bookings Table ----------
function loadBookingsTable() {
  const container = document.getElementById('bookings-table-body');
  if (!container) return;
  
  const bookings = getBookings();
  
  if (bookings.length === 0) {
    container.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--gray-400);">No bookings found.</td></tr>';
    return;
  }
  
  container.innerHTML = bookings.map(booking => `
    <tr>
      <td><strong>${booking.id}</strong></td>
      <td>${booking.fullName}</td>
      <td>${booking.serviceType}</td>
      <td>${formatDate(booking.preferredDate)}</td>
      <td><span class="status-badge ${booking.status}">${capitalize(booking.status)}</span></td>
      <td>${formatDate(booking.createdAt)}</td>
      <td>
        <div class="table-actions">
          ${booking.status === 'pending' ? `
            <button onclick="updateBookingStatus('${booking.id}', 'confirmed')" data-tooltip="Confirm">✓</button>
            <button class="danger" onclick="updateBookingStatus('${booking.id}', 'cancelled')" data-tooltip="Cancel">✕</button>
          ` : ''}
          ${booking.status === 'confirmed' ? `
            <button onclick="updateBookingStatus('${booking.id}', 'completed')" data-tooltip="Complete">✓</button>
          ` : ''}
          <button onclick="viewBooking('${booking.id}')" data-tooltip="View">👁</button>
          <button class="danger" onclick="deleteBooking('${booking.id}')" data-tooltip="Delete">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateBookingStatus(id, status) {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === id);
  if (booking) {
    booking.status = status;
    saveBookings(bookings);
    loadBookingsTable();
    loadDashboardStats();
    showToast('Updated', `Booking ${id} has been ${status}.`, 'success');
  }
}

function viewBooking(id) {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === id);
  if (!booking) return;
  
  const modalBody = document.getElementById('booking-detail-body');
  if (!modalBody) return;
  
  modalBody.innerHTML = `
    <div style="margin-bottom:1rem;">
      <label style="font-weight:600;color:var(--gray-600);font-size:.8rem;">Booking ID</label>
      <p style="margin-bottom:.5rem;">${booking.id}</p>
    </div>
    <div style="margin-bottom:1rem;">
      <label style="font-weight:600;color:var(--gray-600);font-size:.8rem;">Customer</label>
      <p style="margin-bottom:.5rem;">${booking.fullName}</p>
    </div>
    <div style="margin-bottom:1rem;">
      <label style="font-weight:600;color:var(--gray-600);font-size:.8rem;">Email</label>
      <p style="margin-bottom:.5rem;">${booking.email}</p>
    </div>
    <div style="margin-bottom:1rem;">
      <label style="font-weight:600;color:var(--gray-600);font-size:.8rem;">Phone</label>
      <p style="margin-bottom:.5rem;">${booking.phone}</p>
    </div>
    <div style="margin-bottom:1rem;">
      <label style="font-weight:600;color:var(--gray-600);font-size:.8rem;">Service</label>
      <p style="margin-bottom:.5rem;">${booking.serviceType}</p>
    </div>
    <div style="margin-bottom:1rem;">
      <label style="font-weight:600;color:var(--gray-600);font-size:.8rem;">Preferred Date</label>
      <p style="margin-bottom:.5rem;">${formatDate(booking.preferredDate)}</p>
    </div>
    <div style="margin-bottom:1rem;">
      <label style="font-weight:600;color:var(--gray-600);font-size:.8rem;">Address</label>
      <p style="margin-bottom:.5rem;">${booking.address}</p>
    </div>
    <div style="margin-bottom:1rem;">
      <label style="font-weight:600;color:var(--gray-600);font-size:.8rem;">Message</label>
      <p style="margin-bottom:.5rem;">${booking.message || 'No additional message'}</p>
    </div>
    <div>
      <label style="font-weight:600;color:var(--gray-600);font-size:.8rem;">Status</label>
      <p><span class="status-badge ${booking.status}">${capitalize(booking.status)}</span></p>
    </div>
  `;
  
  openModal('booking-detail-modal');
}

function deleteBooking(id) {
  if (!confirm('Are you sure you want to delete this booking?')) return;
  const bookings = getBookings().filter(b => b.id !== id);
  saveBookings(bookings);
  loadBookingsTable();
  loadDashboardStats();
  showToast('Deleted', 'Booking has been removed.', 'success');
}

// ---------- Services Table ----------
function loadServicesTable() {
  const container = document.getElementById('services-table-body');
  if (!container) return;
  
  const services = JSON.parse(getServices());
  
  container.innerHTML = services.map(service => `
    <tr>
      <td><strong>${service.id}</strong></td>
      <td>${service.icon} ${service.name}</td>
      <td>$${service.price}</td>
      <td>${service.priceUnit}</td>
      <td>
        <div class="table-actions">
          <button onclick="editService('${service.id}')">Edit</button>
          <button class="danger" onclick="deleteService('${service.id}')">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editService(id) {
  const services = JSON.parse(getServices());
  const service = services.find(s => s.id === id);
  if (!service) return;
  
  document.getElementById('edit-service-id').value = service.id;
  document.getElementById('edit-service-name').value = service.name;
  document.getElementById('edit-service-desc').value = service.description;
  document.getElementById('edit-service-price').value = service.price;
  document.getElementById('edit-service-unit').value = service.priceUnit;
  document.getElementById('edit-service-icon').value = service.icon;
  
  openModal('edit-service-modal');
}

function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  const services = JSON.parse(getServices()).filter(s => s.id !== id);
  localStorage.setItem('sparkclean_services', JSON.stringify(services));
  loadServicesTable();
  loadDashboardStats();
  showToast('Deleted', 'Service has been removed.', 'success');
}

// ---------- Blog Table ----------
function loadBlogTable() {
  const container = document.getElementById('blog-table-body');
  if (!container) return;
  
  const posts = JSON.parse(getBlogPosts());
  
  container.innerHTML = posts.map(post => `
    <tr>
      <td><strong>${post.id}</strong></td>
      <td>${post.title}</td>
      <td><span class="blog-tag">${post.category}</span></td>
      <td>${post.author}</td>
      <td>${formatDate(post.date)}</td>
      <td>
        <div class="table-actions">
          <button onclick="editBlog('${post.id}')">Edit</button>
          <button class="danger" onclick="deleteBlog('${post.id}')">🗑</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editBlog(id) {
  const posts = JSON.parse(getBlogPosts());
  const post = posts.find(p => p.id === id);
  if (!post) return;
  
  document.getElementById('edit-blog-id').value = post.id;
  document.getElementById('edit-blog-title').value = post.title;
  document.getElementById('edit-blog-excerpt').value = post.excerpt;
  document.getElementById('edit-blog-content').value = post.content;
  document.getElementById('edit-blog-category').value = post.category;
  
  openModal('edit-blog-modal');
}

function deleteBlog(id) {
  if (!confirm('Are you sure you want to delete this blog post?')) return;
  const posts = JSON.parse(getBlogPosts()).filter(p => p.id !== id);
  localStorage.setItem('sparkclean_blogs', JSON.stringify(posts));
  loadBlogTable();
  loadDashboardStats();
  showToast('Deleted', 'Blog post has been removed.', 'success');
}

// ---------- Admin Tabs ----------
function initAdminTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');
      
      tab.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.style.display = 'block';
    });
  });
}

// ---------- Admin Forms ----------
function initAdminForms() {
  // Add Blog Post
  const addBlogForm = document.getElementById('add-blog-form');
  if (addBlogForm) {
    addBlogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(addBlogForm);
      const post = Object.fromEntries(formData.entries());
      post.id = 'BP' + Date.now();
      post.date = new Date().toISOString().split('T')[0];
      post.author = 'SparkClean Team';
      post.image = 'blog-new';
      
      const posts = JSON.parse(getBlogPosts());
      posts.unshift(post);
      localStorage.setItem('sparkclean_blogs', JSON.stringify(posts));
      
      loadBlogTable();
      loadDashboardStats();
      addBlogForm.reset();
      closeModal('add-blog-modal');
      showToast('Published!', 'New blog post has been published.', 'success');
    });
  }
  
  // Add Service
  const addServiceForm = document.getElementById('add-service-form');
  if (addServiceForm) {
    addServiceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(addServiceForm);
      const service = Object.fromEntries(formData.entries());
      service.id = 'SVC' + Date.now();
      service.price = parseFloat(service.price);
      service.image = 'service-new';
      
      const services = JSON.parse(getServices());
      services.push(service);
      localStorage.setItem('sparkclean_services', JSON.stringify(services));
      
      loadServicesTable();
      loadDashboardStats();
      addServiceForm.reset();
      closeModal('add-service-modal');
      showToast('Added!', 'New service has been added.', 'success');
    });
  }
  
  // Edit Service
  const editServiceForm = document.getElementById('edit-service-form');
  if (editServiceForm) {
    editServiceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(editServiceForm);
      const updated = Object.fromEntries(formData.entries());
      updated.price = parseFloat(updated.price);
      
      const services = JSON.parse(getServices());
      const idx = services.findIndex(s => s.id === updated.id);
      if (idx !== -1) {
        services[idx] = { ...services[idx], ...updated };
        localStorage.setItem('sparkclean_services', JSON.stringify(services));
        loadServicesTable();
        closeModal('edit-service-modal');
        showToast('Updated!', 'Service has been updated.', 'success');
      }
    });
  }
  
  // Edit Blog
  const editBlogForm = document.getElementById('edit-blog-form');
  if (editBlogForm) {
    editBlogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(editBlogForm);
      const updated = Object.fromEntries(formData.entries());
      
      const posts = JSON.parse(getBlogPosts());
      const idx = posts.findIndex(p => p.id === updated.id);
      if (idx !== -1) {
        posts[idx] = { ...posts[idx], ...updated };
        localStorage.setItem('sparkclean_blogs', JSON.stringify(posts));
        loadBlogTable();
        closeModal('edit-blog-modal');
        showToast('Updated!', 'Blog post has been updated.', 'success');
      }
    });
  }
}

// ---------- Helpers ----------
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function logout() {
  localStorage.removeItem('sparkclean_user');
  window.location.href = 'login.html';
}
