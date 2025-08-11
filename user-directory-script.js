 
        // Global variables
        let allUsers = [];
        let filteredUsers = [];
        let currentTheme = localStorage.getItem('theme') || 'light';

        // DOM elements
        const loadingState = document.getElementById('loading-state');
        const errorState = document.getElementById('error-state');
        const emptyState = document.getElementById('empty-state');
        const usersGrid = document.getElementById('users-grid');
        const resultsCount = document.getElementById('results-count');
        const desktopSearch = document.getElementById('desktop-search');
        const mobileSearch = document.getElementById('mobile-search');
        const cityFilter = document.getElementById('city-filter');
        const companyFilter = document.getElementById('company-filter');
        const themeToggle = document.getElementById('theme-toggle');
        const refreshBtn = document.getElementById('refresh-btn');
        const fabRefresh = document.getElementById('fab-refresh');
        const retryBtn = document.getElementById('retry-btn');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        const modalBackdrop = document.getElementById('modal-backdrop');

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            initializeTheme();
            fetchUsers();
            setupEventListeners();
        });

        // Theme management
        function initializeTheme() {
            if (currentTheme === 'dark') {
                document.body.classList.add('dark');
                updateThemeIcon(true);
            }
        }

        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.body.classList.toggle('dark');
            localStorage.setItem('theme', currentTheme);
            updateThemeIcon(currentTheme === 'dark');
        }

        function updateThemeIcon(isDark) {
            const icon = themeToggle.querySelector('svg');
            if (isDark) {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';
            } else {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
            }
        }

        // Event listeners
        function setupEventListeners() {
            themeToggle.addEventListener('click', toggleTheme);
            refreshBtn.addEventListener('click', fetchUsers);
            fabRefresh.addEventListener('click', fetchUsers);
            retryBtn.addEventListener('click', fetchUsers);
            clearFiltersBtn.addEventListener('click', clearAllFilters);

            // Search functionality
            desktopSearch.addEventListener('input', handleSearch);
            mobileSearch.addEventListener('input', handleSearch);

            // Filter functionality
            cityFilter.addEventListener('change', applyFilters);
            companyFilter.addEventListener('change', applyFilters);

            // Modal close on escape key
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    closeModal();
                }
            });
        }

        // API functions
        async function fetchUsers() {
            showLoadingState();
            
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                
                allUsers = await response.json();
                filteredUsers = [...allUsers];
                
                populateFilters();
                displayUsers();
                updateResultsCount();
                showUsersGrid();
                
            } catch (error) {
                console.error('Error fetching users:', error);
                showErrorState();
            }
        }

        // Display functions
        function showLoadingState() {
            hideAllStates();
            loadingState.classList.remove('hidden');
        }

        function showErrorState() {
            hideAllStates();
            errorState.classList.remove('hidden');
        }

        function showEmptyState() {
            hideAllStates();
            emptyState.classList.remove('hidden');
        }

        function showUsersGrid() {
            hideAllStates();
            usersGrid.classList.remove('hidden');
        }

        function hideAllStates() {
            loadingState.classList.add('hidden');
            errorState.classList.add('hidden');
            emptyState.classList.add('hidden');
            usersGrid.classList.add('hidden');
        }

        function displayUsers() {
            if (filteredUsers.length === 0) {
                showEmptyState();
                return;
            }

            usersGrid.innerHTML = filteredUsers.map(user => createUserCard(user)).join('');
            showUsersGrid();
        }

        function createUserCard(user) {
            return `
                <div class="bg-surface rounded-xl border border-light p-6 card-elevation hover:shadow-card-hover transition-all duration-200">
                    <!-- User Header -->
                    <div class="flex items-center space-x-4 mb-4">
                        <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <span class="text-primary-600 font-semibold text-lg">
                                ${user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-lg font-semibold text-text-primary truncate">${user.name}</h3>
                            <p class="text-sm text-text-secondary truncate">@${user.username}</p>
                        </div>
                    </div>

                    <!-- Basic Info -->
                    <div class="space-y-3 mb-4">
                        <div class="flex items-center space-x-3">
                            <svg class="w-4 h-4 text-secondary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            <span class="text-sm text-text-secondary truncate">${user.email}</span>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <svg class="w-4 h-4 text-secondary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            <span class="text-sm text-text-secondary truncate">${user.company.name}</span>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <svg class="w-4 h-4 text-secondary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span class="text-sm text-text-secondary truncate">${user.address.city}</span>
                        </div>
                    </div>

                    <!-- View Details Button -->
                    <button 
                        onclick="openModal(${user.id})"
                        class="w-full px-4 py-2 text-sm font-medium text-primary bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        View Details
                        <svg class="w-4 h-4 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                    </button>
                </div>
            `;
        }

        // Modal functions
        function openModal(userId) {
            const user = allUsers.find(u => u.id === userId);
            if (!user) return;

            const modalContent = `
                <div class="p-8">
                    <!-- Modal Header -->
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-text-primary">User Details</h2>
                        <button 
                            onclick="closeModal()"
                            class="p-2 hover:bg-secondary-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Close modal"
                        >
                            <svg class="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <!-- User Header in Modal -->
                    <div class="flex items-center space-x-6 mb-8 pb-6 border-b border-light">
                        <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                            <span class="text-primary-600 font-semibold text-2xl">
                                ${user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-text-primary">${user.name}</h3>
                            <p class="text-lg text-text-secondary">@${user.username}</p>
                        </div>
                    </div>

                    <!-- Detailed Information -->
                    <div class="space-y-8">
                        <!-- Contact Information -->
                        <div>
                            <h4 class="text-lg font-semibold text-text-primary mb-4">Contact Information</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                                    <svg class="w-5 h-5 text-secondary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                    <div>
                                        <p class="text-sm font-medium text-text-primary">Email</p>
                                        <p class="text-sm text-text-secondary">${user.email}</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg">
                                    <svg class="w-5 h-5 text-secondary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                    </svg>
                                    <div>
                                        <p class="text-sm font-medium text-text-primary">Phone</p>
                                        <p class="text-sm text-text-secondary">${user.phone}</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center space-x-3 p-4 bg-secondary-50 rounded-lg md:col-span-2">
                                    <svg class="w-5 h-5 text-secondary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
                                    </svg>
                                    <div>
                                        <p class="text-sm font-medium text-text-primary">Website</p>
                                        <a href="http://${user.website}" target="_blank" class="text-sm text-primary hover:text-primary-700 transition-colors">
                                            ${user.website}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Address Information -->
                        <div>
                            <h4 class="text-lg font-semibold text-text-primary mb-4">Address</h4>
                            <div class="bg-primary-50 rounded-lg p-6">
                                <div class="flex items-start space-x-4">
                                    <svg class="w-6 h-6 text-primary mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <div class="flex-1">
                                        <p class="text-base font-medium text-text-primary">${user.address.street} ${user.address.suite}</p>
                                        <p class="text-base text-text-secondary">${user.address.city}, ${user.address.zipcode}</p>
                                        <p class="text-sm text-text-secondary mt-2">Coordinates: ${user.address.geo.lat}, ${user.address.geo.lng}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Company Information -->
                        <div>
                            <h4 class="text-lg font-semibold text-text-primary mb-4">Company</h4>
                            <div class="bg-accent-50 rounded-lg p-6">
                                <div class="flex items-start space-x-4">
                                    <svg class="w-6 h-6 text-accent mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>
                                    <div class="flex-1">
                                        <p class="text-lg font-semibold text-text-primary">${user.company.name}</p>
                                        <p class="text-base text-text-secondary italic mt-2">"${user.company.catchPhrase}"</p>
                                        <p class="text-sm text-text-secondary mt-3">${user.company.bs}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            modalBackdrop.querySelector('.bg-surface').innerHTML = modalContent;
            modalBackdrop.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modalBackdrop.classList.add('hidden');
            document.body.style.overflow = '';
        }

        // Filter functions
        function populateFilters() {
            const cities = [...new Set(allUsers.map(user => user.address.city))].sort();
            const companies = [...new Set(allUsers.map(user => user.company.name))].sort();

            cityFilter.innerHTML = '<option value="">All Cities</option>' + 
                cities.map(city => `<option value="${city}">${city}</option>`).join('');

            companyFilter.innerHTML = '<option value="">All Companies</option>' + 
                companies.map(company => `<option value="${company}">${company}</option>`).join('');
        }

        function handleSearch(event) {
            const searchTerm = event.target.value.toLowerCase();
            
            // Sync search inputs
            if (event.target.id === 'desktop-search') {
                mobileSearch.value = searchTerm;
            } else {
                desktopSearch.value = searchTerm;
            }
            
            applyFilters();
        }

        function applyFilters() {
            const searchTerm = (desktopSearch.value || mobileSearch.value).toLowerCase();
            const selectedCity = cityFilter.value;
            const selectedCompany = companyFilter.value;

            filteredUsers = allUsers.filter(user => {
                const matchesSearch = !searchTerm || 
                    user.name.toLowerCase().includes(searchTerm) || 
                    user.username.toLowerCase().includes(searchTerm);
                
                const matchesCity = !selectedCity || user.address.city === selectedCity;
                const matchesCompany = !selectedCompany || user.company.name === selectedCompany;

                return matchesSearch && matchesCity && matchesCompany;
            });

            displayUsers();
            updateResultsCount();
        }

        function clearAllFilters() {
            desktopSearch.value = '';
            mobileSearch.value = '';
            cityFilter.value = '';
            companyFilter.value = '';
            
            filteredUsers = [...allUsers];
            displayUsers();
            updateResultsCount();
        }

        function updateResultsCount() {
            const count = filteredUsers.length;
            const total = allUsers.length;
            resultsCount.textContent = `${count} of ${total} users`;
        }
    
