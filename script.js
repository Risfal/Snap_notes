document.addEventListener('DOMContentLoaded', function() {
    // --- Configuration ---
    const yourName = "Your Name"; // Replace with your name
    const backendUrl = "http://localhost:3000"; // URL of your Node.js server
    const razorpayKeyId = "YOUR_RAZORPAY_KEY_ID"; // IMPORTANT: Replace with your Razorpay Key ID

    const lectureNotes = [
        { id: 1, title: "Lecture 1: Intro to AI", description: "Introduction to AI and what are it's subsets.", file: "Lecture 1.pdf", image: "https://placehold.co/600x400/6366f1/ffffff?text=AI+Subsets" },
        { id: 2, title: "Lecture 2: Machine Learning Systems", description: "Exploring Supervised, Unsupervised, and Reinforcement Learning.", file: "Intro to AI&DS lecture 2.pdf", image: "https://placehold.co/600x400/818cf8/ffffff?text=ML+Systems" },
        { id: 3, title: "Lecture 3: Regression Models", description: "Understanding linear and logistic regression models for predictive analysis.", file: "Lecture 3.pdf", image: "https://placehold.co/600x400/a5b4fc/ffffff?text=Regression" },
        { id: 4, title: "Lecture 4: K-Means Clustering", description: "An in-depth look at the K-Means clustering algorithm.", file: "LECTURE 4.pdf", image: "https://placehold.co/600x400/c7d2fe/ffffff?text=K-Means" }
    ];

    // --- Element Selections ---
    const notesGrid = document.getElementById('notes-grid');
    const notificationContainer = document.getElementById('notification-container');
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
                <img src="${note.image}" alt="${note.title}" class="note-card-img">
                <div class="note-card-body">
                    <h3 class="note-card-title">${note.title}</h3>
                    <p class="note-card-description">${note.description}</p>
                    <div class="note-card-footer">
                        <span class="note-card-price">₹20</span>
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
        notification.innerHTML = message;
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    /**
     * Initiates a file download. This is only called AFTER successful verification.
     */
    function initiateDownload() {
        if (!selectedNote) return;
        const link = document.createElement('a');
        link.href = selectedNote.file;
        link.download = selectedNote.file;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Initiates the payment process by calling the backend to create an order.
     * @param {number} noteId - The ID of the note to purchase.
     */
    async function startPaymentProcess(noteId) {
        selectedNote = lectureNotes.find(n => n.id === noteId);
        if (!selectedNote) return;

        if (!razorpayKeyId || razorpayKeyId === "YOUR_RAZORPAY_KEY_ID") {
            showNotification("Razorpay Key ID is not configured in script.js.", "error");
            return;
        }

        try {
            // Step 1: Call your backend to create an order
            const orderResponse = await fetch(`${backendUrl}/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!orderResponse.ok) throw new Error('Failed to create order.');
            const order = await orderResponse.json();

            // Step 2: Open Razorpay Checkout
            const options = {
                key: razorpayKeyId,
                amount: order.amount,
                currency: "INR",
                name: "AI & DS Notes",
                description: `Purchase: ${selectedNote.title}`,
                order_id: order.id,
                handler: async function (response) {
                    // Step 3: Verify payment on the backend
                    const verificationResponse = await fetch(`${backendUrl}/verify-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            order_id: order.id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                        }),
                    });

                    const result = await verificationResponse.json();

                    if (result.status === 'success') {
                        showNotification('Payment successful! Starting download.', 'success');
                        initiateDownload();
                    } else {
                        showNotification('Payment verification failed. Please contact support.', 'error');
                    }
                },
                prefill: {
                    name: "Customer Name",
                    email: "customer@example.com",
                },
                theme: {
                    color: "#4f46e5"
                }
            };
            const rzp1 = new Razorpay(options);
            
            rzp1.on('payment.failed', function (response){
                showNotification(`Payment failed: ${response.error.description}`, 'error');
            });

            rzp1.open();

        } catch (error) {
            console.error("Payment Error:", error);
            showNotification('Could not connect to the payment server.', 'error');
        }
    }

    // --- Event Listeners ---
    notesGrid.addEventListener('click', e => {
        if (e.target.classList.contains('btn-buy')) {
            startPaymentProcess(parseInt(e.target.getAttribute('data-note-id')));
        }
    });

    // --- Initial Load ---
    displayNotes();
});
