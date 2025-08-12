// Données initiales des applications
const initialApps = [
    { id: 1, name: "AI Studio Apps", url: "https://aistudio.google.com/apps" },
    { id: 2, name: "Rapport OSINT", url: "https://rapport-osint-v2-50571811909.us-west1.run.app/" },
    { id: 3, name: "Base de Données Chimique", url: "https://base-de-donnees-chimique-50571811909.us-west1.run.app/" },
    { id: 4, name: "OpenBullet Config Gen", url: "https://openbullet-config-gen-50571811909.us-west1.run.app/" },
    { id: 5, name: "Wordlist Generator", url: "https://wordlist-generator-v2-50571811909.us-west1.run.app/" },
    { id: 6, name: "Proxy Finder/Checker", url: "https://proxy-finder-checker-50571811909.us-west1.run.app/" },
    { id: 7, name: "Vérificateur IBAN", url: "https://v-rificateur-iban-738463583475.us-west1.run.app/" },
    { id: 8, name: "Identificateur de Carte Bancaire", url: "https://identificateur-de-carte-bancaire-738463583475.us-west1.run.app/" }
];

// Variables globales
let apps = [];
let nextId = 1;
let editingAppId = null;
let deleteAppId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadApps();
    renderApps();
    setupEventListeners();
});

// Chargement des applications depuis le localStorage ou données initiales
function loadApps() {
    const savedApps = localStorage.getItem('mazerakamApps');
    if (savedApps) {
        apps = JSON.parse(savedApps);
        nextId = Math.max(...apps.map(app => app.id)) + 1;
    } else {
        apps = [...initialApps];
        nextId = apps.length + 1;
        saveApps();
    }
}

// Sauvegarde des applications dans le localStorage
function saveApps() {
    localStorage.setItem('mazerakamApps', JSON.stringify(apps));
}

// Rendu des applications dans la grille
function renderApps() {
    const grid = document.getElementById('appsGrid');
    grid.innerHTML = '';

    apps.forEach(app => {
        const card = createAppCard(app);
        grid.appendChild(card);
    });
}

// Création d'une carte d'application
function createAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
        <div class="app-card-header">
            <h3 class="app-card-title">${escapeHtml(app.name)}</h3>
            <div class="app-card-actions">
                <button class="action-btn edit" onclick="openEditModal(${app.id})" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="openDeleteConfirm(${app.id})" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="app-card-buttons">
            <button class="btn-open btn-internal" onclick="openInternal('${escapeHtml(app.name)}', '${app.url}')">
                <i class="fas fa-window-restore"></i>
                Ouvrir en interne
            </button>
            <a href="${app.url}" target="_blank" class="btn-open btn-external">
                <i class="fas fa-external-link-alt"></i>
                Nouvel onglet
            </a>
        </div>
    `;
    return card;
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Formulaire d'ajout/modification
    document.getElementById('appForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveApp();
    });

    // Fermeture des modales en cliquant à l'extérieur
    window.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Échapper pour fermer les modales
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Ouverture de la modale d'ajout
function openAddModal() {
    editingAppId = null;
    document.getElementById('modalTitle').textContent = 'Ajouter une application';
    document.getElementById('appName').value = '';
    document.getElementById('appUrl').value = '';
    document.getElementById('appModal').classList.add('show');
    document.getElementById('appName').focus();
}

// Ouverture de la modale de modification
function openEditModal(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    editingAppId = appId;
    document.getElementById('modalTitle').textContent = 'Modifier l\'application';
    document.getElementById('appName').value = app.name;
    document.getElementById('appUrl').value = app.url;
    document.getElementById('appModal').classList.add('show');
    document.getElementById('appName').focus();
}

// Fermeture de la modale d'ajout/modification
function closeAppModal() {
    document.getElementById('appModal').classList.remove('show');
    editingAppId = null;
}

// Sauvegarde d'une application (ajout ou modification)
function saveApp() {
    const name = document.getElementById('appName').value.trim();
    const url = document.getElementById('appUrl').value.trim();

    if (!name || !url) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    if (editingAppId) {
        // Modification
        const appIndex = apps.findIndex(a => a.id === editingAppId);
        if (appIndex !== -1) {
            apps[appIndex].name = name;
            apps[appIndex].url = url;
        }
    } else {
        // Ajout
        apps.push({
            id: nextId++,
            name: name,
            url: url
        });
    }

    saveApps();
    renderApps();
    closeAppModal();
    
    // Affichage d'un message de succès
    showNotification(editingAppId ? 'Application modifiée avec succès' : 'Application ajoutée avec succès', 'success');
}

// Ouverture d'une application en interne
function openInternal(name, url) {
    document.getElementById('iframeTitle').textContent = name;
    document.getElementById('appIframe').src = url;
    document.getElementById('iframeModal').classList.add('show');
}

// Fermeture de la modale iframe
function closeIframeModal() {
    document.getElementById('iframeModal').classList.remove('show');
    document.getElementById('appIframe').src = '';
}

// Ouverture de la confirmation de suppression
function openDeleteConfirm(appId) {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    deleteAppId = appId;
    document.getElementById('confirmMessage').textContent = 
        `Êtes-vous sûr de vouloir supprimer "${app.name}" ?`;
    document.getElementById('confirmModal').classList.add('show');
}

// Fermeture de la modale de confirmation
function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('show');
    deleteAppId = null;
}

// Confirmation de la suppression
function confirmDelete() {
    if (!deleteAppId) return;

    apps = apps.filter(app => app.id !== deleteAppId);
    saveApps();
    renderApps();
    closeConfirmModal();
    
    showNotification('Application supprimée avec succès', 'success');
}

// Fermeture de toutes les modales
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
    
    // Nettoyage spécifique
    document.getElementById('appIframe').src = '';
    editingAppId = null;
    deleteAppId = null;
}

// Échappement HTML pour éviter les injections XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Affichage de notifications
function showNotification(message, type = 'info') {
    // Création de l'élément notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression automatique
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Fonction utilitaire pour valider les URLs
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Export des fonctions pour les tests (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadApps,
        saveApps,
        renderApps,
        escapeHtml,
        isValidUrl
    };
}
