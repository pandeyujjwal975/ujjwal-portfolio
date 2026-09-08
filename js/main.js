/* =========================================================
   UJJWAL PANDEY — MAIN.JS
   Portfolio Frontend
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {
    // Your contact backend endpoint
    CONTACT_API_URL:
        "https://ujjwal-coffee-backend.onrender.com/api/contact",

    // Your main website
    HOME_URL: "index.html",

    // Learning Hub
    LEARNING_URL: "learning.html",

    // Coffee / Support page
    COFFEE_URL: "coffee.html"
};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initMobileMenu();
    initSmoothScrolling();
    initActiveNavigation();
    initScrollEffects();
    initBackToTop();
    initContactForm();
    initCurrentYear();
    initExternalLinks();
    initPageLoader();

});


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMobileMenu() {

    const menuButton =
        document.querySelector(".menu-toggle") ||
        document.querySelector("#menuToggle") ||
        document.querySelector("[data-menu-toggle]");

    const nav =
        document.querySelector(".nav-links") ||
        document.querySelector("#navLinks") ||
        document.querySelector("nav ul");

    if (!menuButton || !nav) return;

    menuButton.addEventListener("click", () => {

        nav.classList.toggle("active");
        menuButton.classList.toggle("active");

        const isOpen = nav.classList.contains("active");

        menuButton.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );
    });


    // Close menu when clicking a navigation link

    nav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            nav.classList.remove("active");
            menuButton.classList.remove("active");

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}


/* =========================================================
   SMOOTH SCROLL
   ========================================================= */

function initSmoothScrolling() {

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target =
                document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });

}


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

function initActiveNavigation() {

    const currentPage =
        window.location.pathname.split("/").pop() ||
        "index.html";

    document.querySelectorAll("nav a, .nav-links a").forEach(link => {

        const href = link.getAttribute("href");

        if (!href) return;

        const cleanHref =
            href.split("#")[0].split("?")[0];

        if (
            cleanHref === currentPage ||
            (currentPage === "" && cleanHref === "index.html")
        ) {
            link.classList.add("active");
        }

    });

}


/* =========================================================
   SCROLL EFFECTS
   ========================================================= */

function initScrollEffects() {

    const header =
        document.querySelector("header") ||
        document.querySelector(".navbar") ||
        document.querySelector(".nav");

    if (!header) return;

    let lastScroll = 0;

    window.addEventListener(
        "scroll",
        () => {

            const currentScroll =
                window.scrollY;

            // Add shadow / scrolled state

            if (currentScroll > 30) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

            lastScroll = currentScroll;

        },
        { passive: true }
    );

}


/* =========================================================
   BACK TO TOP
   ========================================================= */

function initBackToTop() {

    const button =
        document.querySelector("#backToTop") ||
        document.querySelector(".back-to-top") ||
        document.querySelector("[data-back-to-top]");

    if (!button) return;


    window.addEventListener(
        "scroll",
        () => {

            if (window.scrollY > 500) {

                button.classList.add("show");

            } else {

                button.classList.remove("show");

            }

        },
        { passive: true }
    );


    button.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* =========================================================
   CONTACT FORM
   ========================================================= */

function initContactForm() {

    const form =
        document.querySelector("#contactForm") ||
        document.querySelector(".contact-form") ||
        document.querySelector('form[data-contact-form]');

    if (!form) return;


    form.addEventListener("submit", async event => {

        event.preventDefault();


        const submitButton =
            form.querySelector(
                'button[type="submit"], input[type="submit"]'
            );


        // Collect fields

        const name =
            form.querySelector('[name="name"]')?.value.trim() || "";

        const email =
            form.querySelector('[name="email"]')?.value.trim() || "";

        const subject =
            form.querySelector('[name="subject"]')?.value.trim() || "";

        const message =
            form.querySelector('[name="message"]')?.value.trim() || "";


        // Basic validation

        if (!name) {

            showNotification(
                "Please enter your name.",
                "error"
            );

            return;
        }


        if (!email || !isValidEmail(email)) {

            showNotification(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }


        if (!message) {

            showNotification(
                "Please enter your message.",
                "error"
            );

            return;
        }


        // Loading state

        const originalText =
            submitButton?.textContent || "Send Message";


        if (submitButton) {

            submitButton.disabled = true;
            submitButton.textContent = "Sending...";

        }


        try {

            const response = await fetch(
                CONFIG.CONTACT_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        subject,
                        message
                    })
                }
            );


            const data =
                await response.json().catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to send your message."
                );

            }


            // Success

            showNotification(
                "Message sent successfully! I'll get back to you soon. ✓",
                "success"
            );


            form.reset();


        } catch (error) {

            console.error(
                "Contact form error:",
                error
            );


            showNotification(
                error.message ||
                "Something went wrong. Please try again.",
                "error"
            );


        } finally {

            if (submitButton) {

                submitButton.disabled = false;
                submitButton.textContent = originalText;

            }

        }

    });

}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


/* =========================================================
   NOTIFICATION SYSTEM
   ========================================================= */

function showNotification(message, type = "success") {

    let notification =
        document.querySelector("#siteNotification");


    // Create notification if it doesn't exist

    if (!notification) {

        notification =
            document.createElement("div");

        notification.id =
            "siteNotification";

        document.body.appendChild(
            notification
        );

    }


    notification.textContent = message;


    notification.className =
        `site-notification ${type}`;


    notification.classList.add("show");


    setTimeout(() => {

        notification.classList.remove("show");

    }, 4500);

}


/* =========================================================
   CURRENT YEAR
   ========================================================= */

function initCurrentYear() {

    const yearElements =
        document.querySelectorAll(
            "#currentYear, [data-current-year]"
        );


    yearElements.forEach(element => {

        element.textContent =
            new Date().getFullYear();

    });

}


/* =========================================================
   EXTERNAL LINKS
   ========================================================= */

function initExternalLinks() {

    document.querySelectorAll(
        'a[href^="http://"], a[href^="https://"]'
    ).forEach(link => {

        // Don't modify same-site links

        if (
            link.hostname &&
            link.hostname !== window.location.hostname
        ) {

            link.target = "_blank";
            link.rel = "noopener noreferrer";

        }

    });

}


/* =========================================================
   PAGE LOADER
   ========================================================= */

function initPageLoader() {

    const loader =
        document.querySelector("#pageLoader") ||
        document.querySelector(".page-loader");


    if (!loader) return;


    window.addEventListener("load", () => {

        loader.classList.add("loaded");


        setTimeout(() => {

            loader.style.display = "none";

        }, 500);

    });

}


/* =========================================================
   UTILITY: SAFE REDIRECT
   ========================================================= */

function goTo(url) {

    if (!url) return;

    window.location.href = url;

}


/* =========================================================
   GLOBAL NAVIGATION HELPERS
   ========================================================= */

window.UjjwalSite = {

    goHome() {
        goTo(CONFIG.HOME_URL);
    },

    openLearning() {
        goTo(CONFIG.LEARNING_URL);
    },

    openCoffee() {
        goTo(CONFIG.COFFEE_URL);
    },

    openContact() {
        goTo("contact.html");
    }

};


/* =========================================================
   CONSOLE MESSAGE
   ========================================================= */

console.log(
    "%cUjjwal Pandey",
    "font-size:20px;font-weight:bold;"
);

console.log(
    "Portfolio frontend initialized successfully."
);