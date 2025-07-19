document.addEventListener('DOMContentLoaded', function() {
    // --- Configuration ---
    const yourName = "Risfal"; // Replace with your name
    const yourUpiId = "muhammadrisfal352@oksbi"; // IMPORTANT: Replace with your UPI ID

    const lectureNotes = [
        { id: 1, title: "Lecture 1: Intro to AI", description: "Introduction to AI and what are it's subsets.", file: "Lecture 1.pdf", price: 20, image: "https://placehold.co/600x400/6366f1/ffffff?text=AI+Subsets" },
        { id: 2, title: "Lecture 2: Machine Learning Systems", description: "Exploring Supervised, Unsupervised, and Reinforcement Learning.", file: "Intro to AI&DS lecture 2.pdf", price: 20, image: "https://placehold.co/600x400/818cf8/ffffff?text=ML+Systems" },
        { id: 3, title: "Lecture 3: Regression Models", description: "Understanding linear and logistic regression models for predictive analysis.", file: "Lecture 3.pdf", price: 20, image: "https://placehold.co/600x400/a5b4fc/ffffff?text=Regression" },
        { id: 4, title: "Lecture 4: K-Means Clustering", description: "An in-depth look at the K-Means clustering algorithm.", file: "LECTURE 4.pdf", price: 20, image: "https://placehold.co/600x400/c7d2fe/ffffff?text=K-Means" }
    ];

    // --- Element Selections ---
    const notesGrid = document.getElementById('notes-grid');
    const notificationContainer = document.getElementById('notification-container');
    const upiModal = document.getElementById('upi-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const qrCodeContainer = document.getElementById('qr-code-container');
    const upiIdText = document.getElementById('upi-id-text');
    const upiAmountText = document.getElementById('upi-amount-text');

    let selectedNote = null;

    // --- Functions ---

    /**
     * Populates the grid with lecture notes.
     */
    function displayNotes() {
        if (!notesGrid) return;
        notesGrid.innerHTML = '';
        lectureNotes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            card.innerHTML = `
                <img src="${note.image}" alt="${note.title}" class="note-card-img" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0e0e0/ffffff?text=Image+Not+Found';">
                <div class="note-card-body">
                    <h3 class="note-card-title">${note.title}</h3>
                    <p class="note-card-description">${note.description}</p>
                    <div class="note-card-footer">
                        <span class="note-card-price">₹${note.price}</span>
                        <button data-note-id="${note.id}" class="btn btn-buy">Buy Now</button>
                    </div>
                </div>
            `;
            notesGrid.appendChild(card);
        });
    }

    /**
     * Shows a notification message to the user.
     * @param {string} message - The message to display.
     * @param {string} type - 'success' or 'error'.
     */
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message; // Use textContent for security
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    /**
     * Initiates a file download. This is called after the user confirms payment.
     */
    function initiateDownload() {
        if (!selectedNote) {
            showNotification('Could not find the selected note. Please try again.', 'error');
            return;
        }
        // NOTE: In a real-world scenario, you would not link directly to the file like this
        // as it's not secure. This is for demonstration purposes.
        const link = document.createElement('a');
        link.href = selectedNote.file;
        link.download = selectedNote.file;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification(`Downloading ${selectedNote.title}...`, 'success');
    }

    /**
     * Generates a UPI QR code and displays the payment modal.
     * @param {number} noteId - The ID of the note to purchase.
     */
    function showUpiModal(noteId) {
        selectedNote = lectureNotes.find(n => n.id === noteId);
        if (!selectedNote) return;

        if (!yourUpiId || yourUpiId === "yourname@upi") {
            showNotification("Please configure your UPI ID in script.js.", "error");
            return;
        }

        // Construct the UPI payment string
        const upiString = `upi://pay?pa=${yourUpiId}&pn=${encodeURIComponent(yourName)}&am=${selectedNote.price}&cu=INR&tn=${encodeURIComponent('Notes: ' + selectedNote.title)}`;
        
        // Use a public QR code generation API
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

        // Update modal content
        qrCodeContainer.innerHTML = `<img src="${qrCodeUrl}" alt="UPI QR Code">`;
        upiIdText.textContent = yourUpiId;
        upiAmountText.textContent = `₹${selectedNote.price}`;
        
        // Show the modal
        upiModal.classList.add('show');
    }

    /**
     * Hides the UPI payment modal.
     */
    function hideUpiModal() {
        upiModal.classList.remove('show');
        selectedNote = null; // Clear selection when modal is closed
    }

    // --- Event Listeners ---

    // Listen for clicks on "Buy Now" buttons
    notesGrid.addEventListener('click', e => {
        if (e.target.classList.contains('btn-buy')) {
            showUpiModal(parseInt(e.target.getAttribute('data-note-id')));
        }
    });

    // Listen for click on the "I've Paid" button
    confirmPaymentBtn.addEventListener('click', () => {
        initiateDownload();
        hideUpiModal();
    });

    // Listen for clicks to close the modal
    closeModalBtn.addEventListener('click', hideUpiModal);
    upiModal.addEventListener('click', e => {
        // Close if the overlay (background) is clicked
        if (e.target === upiModal) {
            hideUpiModal();
        }
    });

    // --- Initial Load ---
    displayNotes();
});

  
