
        // Global variables
        let allUsers = [];
        let filteredUsers = [];
        let currentTheme = localStorage.getItem('theme') || 'light';
        let currentQuery = '';
        let activeFilters = {
            cities: [],
            companies: [],
            query: ''
        };

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
        const sortSelect = document.getElementById('sort-select');
        const themeToggle = document.getElementById('theme-toggle');
        const retryBtn = document.getElementById('retry-btn');
        const clearSearchBtn = document.getElementById('clear-search-btn');
        const clearAllFiltersBtn = document.getElementById('clear-all-filters');
        const backToAllBtn = document.getElementById('back-to-all');
        const clearSearchDesktop = document.getElementById('clear-search');
        const clearSearchMobile = document.getElementById('clear-search-mobile');
        const filterChips = document.getElementById('filter-chips');
        const currentQuerySpan = document.getElementById('current-query');
        const searchContext = document.getElementById('search-context');
        const cityMultiselect = document.getElementById('city-multiselect');
        const companyMultiselect = document.getElementById('company-multiselect');

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            initializeTheme();
            initializeSearchFromURL();
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

        // Initialize search from URL parameters
        function initializeSearchFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q') || '';
            const city = urlParams.get('city') || '';
            const company = urlParams.get('company') || '';
            
            if (query) {
                desktopSearch.value = query;
                mobileSearch.value = query;
                currentQuery = query;
                activeFilters.query = query;
            }
            
            if (city) {
                activeFilters.cities = [city];
            }
            
            if (company) {
                activeFilters.companies = [company];
            }
            
            updateSearchContext();
        }

        function updateSearchContext() {
            if (currentQuery) {
                currentQuerySpan.textContent = currentQuery;
                searchContext.classList.remove('hidden');
            } else {
                searchContext.classList.add('hidden');
            }
        }

        // Event listeners
        function setupEventListeners() {
            themeToggle.addEventListener('click', toggleTheme);
            retryBtn.addEventListener('click', fetchUsers);
            clearSearchBtn.addEventListener('click', clearSearch);
            clearAllFiltersBtn.addEventListener('click', clearAllFilters);
            backToAllBtn.addEventListener('click', () => {
                window.location.href = 'user_directory_dashboard.html';
            });

            // Search functionality
            desktopSearch.addEventListener('input', handleSearch);
            mobileSearch.addEventListener('input', handleSearch);
            clearSearchDesktop.addEventListener('click', clearSearch);
            clearSearchMobile.addEventListener('click', clearSearch);

            // Filter functionality
            cityFilter.addEventListener('change', applyFilters);
            companyFilter.addEventListener('change', applyFilters);
            sortSelect.addEventListener('change', applySorting);
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
                
                populateFilters();
                applyFiltersAndSort();
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
            const highlightText = (text, query) => {
                if (!query) return text;
                const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
                return text.replace(regex, '<mark class="search-highlight rounded px-1">$1</mark>');
            };
            
            const escapeRegex = (string) => {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            };

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
                            <h3 class="text-lg font-semibold text-text-primary truncate">${highlightText(user.name, currentQuery)}</h3>
                            <p class="text-sm text-text-secondary truncate">@${highlightText(user.username, currentQuery)}</p>
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
                            <span class="text-sm text-text-secondary truncate">${highlightText(user.company.name, currentQuery)}</span>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <svg class="w-4 h-4 text-secondary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span class="text-sm text-text-secondary truncate">${highlightText(user.address.city, currentQuery)}</span>
                        </div>
                    </div>

                    <!-- Expandable Details -->
                    <div id="details-${user.id}" class="hidden space-y-3 mb-4 pt-4 border-t border-light">
                        <div class="flex items-center space-x-3">
                            <svg class="w-4 h-4 text-secondary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            <span class="text-sm text-text-secondary">${user.phone}</span>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <svg class="w-4 h-4 text-secondary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
                            </svg>
                            <a href="http://${user.website}" target="_blank" class="text-sm text-primary hover:text-primary-700 truncate">
                                ${user.website}
                            </a>
                        </div>
                    </div>

                    <!-- Toggle Button -->
                    <button 
                        onclick="toggleDetails(${user.id})"
                        class="w-full px-4 py-2 text-sm font-medium text-primary bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <span id="toggle-text-${user.id}">View Details</span>
                        <svg id="toggle-icon-${user.id}" class="w-4 h-4 inline-block ml-2 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>
                </div>
            `;
        }

        // Toggle details function
        function toggleDetails(userId) {
            const detailsDiv = document.getElementById(`details-${userId}`);
            const toggleText = document.getElementById(`toggle-text-${userId}`);
            const toggleIcon = document.getElementById(`toggle-icon-${userId}`);
            
            if (detailsDiv.classList.contains('hidden')) {
                detailsDiv.classList.remove('hidden');
                toggleText.textContent = 'Hide Details';
                toggleIcon.style.transform = 'rotate(180deg)';
            } else {
                detailsDiv.classList.add('hidden');
                toggleText.textContent = 'View Details';
                toggleIcon.style.transform = 'rotate(0deg)';
            }
        }

        // Filter functions
        function populateFilters() {
            const cities = [...new Set(allUsers.map(user => user.address.city))].sort();
            const companies = [...new Set(allUsers.map(user => user.company.name))].sort();

            // Mobile filters
            cityFilter.innerHTML = '<option value="">All Cities</option>' + 
                cities.map(city => `<option value="${city}" ${activeFilters.cities.includes(city) ? 'selected' : ''}>${city}</option>`).join('');

            companyFilter.innerHTML = '<option value="">All Companies</option>' + 
                companies.map(company => `<option value="${company}" ${activeFilters.companies.includes(company) ? 'selected' : ''}>${company}</option>`).join('');

            // Desktop multiselect filters
            cityMultiselect.innerHTML = cities.map(city => `
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" value="${city}" ${activeFilters.cities.includes(city) ? 'checked' : ''} 
                           onchange="handleMultiSelectChange('cities', '${city}', this.checked)"
                           class="rounded border-light focus:ring-primary focus:border-primary">
                    <span class="text-sm text-text-secondary">${city}</span>
                </label>
            `).join('');

            companyMultiselect.innerHTML = companies.map(company => `
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" value="${company}" ${activeFilters.companies.includes(company) ? 'checked' : ''} 
                           onchange="handleMultiSelectChange('companies', '${company}', this.checked)"
                           class="rounded border-light focus:ring-primary focus:border-primary">
                    <span class="text-sm text-text-secondary">${company}</span>
                </label>
            `).join('');
        }

        function handleMultiSelectChange(filterType, value, checked) {
            if (checked) {
                if (!activeFilters[filterType].includes(value)) {
                    activeFilters[filterType].push(value);
                }
            } else {
                activeFilters[filterType] = activeFilters[filterType].filter(item => item !== value);
            }
            
            applyFiltersAndSort();
            updateFilterChips();
        }

        function handleSearch(event) {
            const searchTerm = event.target.value;
            currentQuery = searchTerm;
            activeFilters.query = searchTerm;
            
            // Sync search inputs
            if (event.target.id === 'desktop-search') {
                mobileSearch.value = searchTerm;
            } else {
                desktopSearch.value = searchTerm;
            }
            
            updateSearchContext();
            applyFiltersAndSort();
            updateFilterChips();
        }

        function applyFiltersAndSort() {
            filteredUsers = allUsers.filter(user => {
                const matchesSearch = !activeFilters.query || 
                    user.name.toLowerCase().includes(activeFilters.query.toLowerCase()) || 
                    user.username.toLowerCase().includes(activeFilters.query.toLowerCase()) ||
                    user.company.name.toLowerCase().includes(activeFilters.query.toLowerCase()) ||
                    user.address.city.toLowerCase().includes(activeFilters.query.toLowerCase());
                
                const matchesCity = activeFilters.cities.length === 0 || 
                    activeFilters.cities.includes(user.address.city);
                const matchesCompany = activeFilters.companies.length === 0 || 
                    activeFilters.companies.includes(user.company.name);

                return matchesSearch && matchesCity && matchesCompany;
            });

            applySorting();
            displayUsers();
            updateResultsCount();
        }

        function applySorting() {
            const sortValue = sortSelect.value;
            
            filteredUsers.sort((a, b) => {
                switch (sortValue) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'name-desc':
                        return b.name.localeCompare(a.name);
                    case 'company':
                        return a.company.name.localeCompare(b.company.name);
                    case 'city':
                        return a.address.city.localeCompare(b.address.city);
                    default:
                        return 0;
                }
            });
        }

        function applyFilters() {
            const selectedCity = cityFilter.value;
            const selectedCompany = companyFilter.value;

            // Update active filters
            activeFilters.cities = selectedCity ? [selectedCity] : [];
            activeFilters.companies = selectedCompany ? [selectedCompany] : [];

            applyFiltersAndSort();
            updateFilterChips();
        }

        function updateFilterChips() {
            let chips = [];
            
            if (activeFilters.query) {
                chips.push({
                    type: 'query',
                    label: `Search: "${activeFilters.query}"`,
                    value: activeFilters.query
                });
            }
            
            activeFilters.cities.forEach(city => {
                chips.push({
                    type: 'city',
                    label: `City: ${city}`,
                    value: city
                });
            });
            
            activeFilters.companies.forEach(company => {
                chips.push({
                    type: 'company',
                    label: `Company: ${company}`,
                    value: company
                });
            });

            filterChips.innerHTML = chips.map(chip => `
                <div class="flex items-center space-x-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm border border-primary-200">
                    <span>${chip.label}</span>
                    <button onclick="removeFilterChip('${chip.type}', '${chip.value}')" class="hover:text-primary-900 focus:outline-none">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            `).join('');

            if (chips.length > 0) {
                filterChips.innerHTML += `
                    <button onclick="clearAllFilters()" class="px-3 py-1 text-sm text-secondary-600 hover:text-secondary-800 underline focus:outline-none">
                        Clear All
                    </button>
                `;
            }
        }

        function removeFilterChip(type, value) {
            switch (type) {
                case 'query':
                    clearSearch();
                    break;
                case 'city':
                    activeFilters.cities = activeFilters.cities.filter(city => city !== value);
                    cityFilter.value = '';
                    break;
                case 'company':
                    activeFilters.companies = activeFilters.companies.filter(company => company !== value);
                    companyFilter.value = '';
                    break;
            }
            
            applyFiltersAndSort();
            updateFilterChips();
            populateFilters(); // Re-populate to update checkboxes
        }

        function clearSearch() {
            desktopSearch.value = '';
            mobileSearch.value = '';
            currentQuery = '';
            activeFilters.query = '';
            
            updateSearchContext();
            applyFiltersAndSort();
            updateFilterChips();
        }

        function clearAllFilters() {
            desktopSearch.value = '';
            mobileSearch.value = '';
            cityFilter.value = '';
            companyFilter.value = '';
            
            currentQuery = '';
            activeFilters = {
                cities: [],
                companies: [],
                query: ''
            };
            
            updateSearchContext();
            applyFiltersAndSort();
            updateFilterChips();
            populateFilters(); // Re-populate to update checkboxes
        }

        function updateResultsCount() {
            const count = filteredUsers.length;
            const total = allUsers.length;
            resultsCount.textContent = `${count} of ${total} users`;
        }
    
