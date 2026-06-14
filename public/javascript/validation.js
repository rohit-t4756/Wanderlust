// =========================================================================
// Bootstrap Client-Side Form Validation Script
(() => {
    'use strict';

    // 1. SELECT FORMS
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');

    // 2. VALIDATION LISTENER
    // Loop over them and prevent submission if fields are invalid
    Array.from(forms).forEach((form) => {
        form.addEventListener('submit', (event) => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
        }, false);
    });
})();