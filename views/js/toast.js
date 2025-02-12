const toastContainer = document.getElementById('toast-container');

export const showToast = (type, message) => {
    const colorClass = {
        success: 'success',
        warning: 'warning',
        error: 'danger'
    }[type];

    const iconClass = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle'
    }[type];

    const title = type.charAt(0).toUpperCase() + type.slice(1);

    const toastEl = document.createElement('div');
    toastEl.className = `toast bg-${colorClass} text-white`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.dataset.bsAutohide = 'true';
    toastEl.dataset.bsDelay = '3000';

    toastEl.innerHTML = `
    <div class="toast-header bg-${colorClass} text-white">
      <i class="fas ${iconClass} me-2"></i>
      <strong class="me-auto">${title}</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;

    toastContainer.appendChild(toastEl);
    new bootstrap.Toast(toastEl).show();
};