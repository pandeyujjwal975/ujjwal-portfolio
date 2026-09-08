"use strict";

/*
========================================================
   UJJWAL COFFEE — RAZORPAY PAYMENT CLIENT
========================================================

Frontend:
    coffee.html

Backend:
    https://ujjwal-coffee-backend.onrender.com

IMPORTANT:
    Never put RAZORPAY_KEY_SECRET in this file.
========================================================
*/


/* ======================================================
   CONFIGURATION
====================================================== */

const BACKEND_URL =
    "https://ujjwal-coffee-backend.onrender.com";


/* ======================================================
   ELEMENTS
====================================================== */

const paymentButton =
    document.getElementById("continuePayment");

const customAmount =
    document.getElementById("customAmount");

const paymentStatus =
    document.getElementById("payment-status");

const amountButtons =
    document.querySelectorAll(".amount-btn");


/* ======================================================
   STATE
====================================================== */

let selectedAmount = 50;


/* ======================================================
   STATUS HELPER
====================================================== */

function showStatus(message, type = "") {

    if (!paymentStatus) {

        alert(message);

        return;
    }

    paymentStatus.textContent = message;

    paymentStatus.className = type;
}


/* ======================================================
   RESET PAYMENT BUTTON
====================================================== */

function resetPaymentButton() {

    if (!paymentButton) {
        return;
    }

    paymentButton.disabled = false;

    paymentButton.innerHTML = `
        <i class="fa-solid fa-lock"></i>
        <span>Continue to Payment</span>
        <i class="fa-solid fa-arrow-right"></i>
    `;
}


/* ======================================================
   AMOUNT BUTTONS
====================================================== */

amountButtons.forEach(button => {

    button.addEventListener("click", () => {

        amountButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedAmount =
            Number(button.dataset.amount);

        if (customAmount) {
            customAmount.value = "";
        }

        showStatus("");
    });

});


/* ======================================================
   CUSTOM AMOUNT
====================================================== */

if (customAmount) {

    customAmount.addEventListener("input", () => {

        if (customAmount.value !== "") {

            amountButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            selectedAmount =
                Number(customAmount.value);

        }

        showStatus("");
    });

}


/* ======================================================
   GET SELECTED AMOUNT
====================================================== */

function getAmount() {

    let amount = selectedAmount;


    if (
        customAmount &&
        customAmount.value.trim() !== ""
    ) {

        amount =
            Number(customAmount.value);

    }


    return amount;
}


/* ======================================================
   VALIDATE AMOUNT
====================================================== */

function validateAmount(amount) {

    if (
        !Number.isFinite(amount) ||
        amount < 10
    ) {

        showStatus(
            "Minimum amount is ₹10.",
            "error"
        );

        return false;
    }


    if (amount > 50000) {

        showStatus(
            "Maximum amount is ₹50,000.",
            "error"
        );

        return false;
    }


    return true;
}


/* ======================================================
   CREATE RAZORPAY ORDER
====================================================== */

async function createOrder(amount) {

    const response =
        await fetch(
            `${BACKEND_URL}/api/payment/create-order`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    amount: amount
                })
            }
        );


    /*
     * Check response type before parsing.
     */

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    let data;


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        data =
            await response.json();

    } else {

        const text =
            await response.text();

        console.error(
            "Non-JSON backend response:",
            text
        );

        throw new Error(
            `Server returned an invalid response (${response.status}).`
        );

    }


    console.log(
        "Create order response:",
        data
    );


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            "Unable to create payment order."
        );

    }


    return data;
}


/* ======================================================
   VERIFY PAYMENT
====================================================== */

async function verifyPayment(
    razorpayResponse
) {

    const response =
        await fetch(
            `${BACKEND_URL}/api/payment/verify`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        razorpay_order_id:
                            razorpayResponse
                                .razorpay_order_id,

                        razorpay_payment_id:
                            razorpayResponse
                                .razorpay_payment_id,

                        razorpay_signature:
                            razorpayResponse
                                .razorpay_signature
                    })
            }
        );


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    let data;


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        data =
            await response.json();

    } else {

        const text =
            await response.text();

        console.error(
            "Verification non-JSON response:",
            text
        );

        throw new Error(
            `Verification server returned an invalid response (${response.status}).`
        );

    }


    console.log(
        "Payment verification response:",
        data
    );


    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            "Payment verification failed."
        );

    }


    return data;
}


/* ======================================================
   OPEN RAZORPAY CHECKOUT
====================================================== */

function openRazorpayCheckout(
    orderId,
    keyId,
    amount,
    currency = "INR"
) {

    /*
     * Make sure Razorpay library exists.
     */

    if (
        typeof Razorpay ===
        "undefined"
    ) {

        showStatus(
            "Razorpay Checkout could not be loaded.",
            "error"
        );

        resetPaymentButton();

        return;
    }


    /*
     * Validate backend response.
     */

    if (!orderId) {

        showStatus(
            "Razorpay Order ID is missing.",
            "error"
        );

        resetPaymentButton();

        return;
    }


    if (!keyId) {

        showStatus(
            "Razorpay Key ID is missing.",
            "error"
        );

        resetPaymentButton();

        return;
    }


    /*
     * Razorpay options.
     */

    const options = {

        key: keyId,

        amount: amount,

        currency: currency,

        name:
            "Ujjwal Pandey",

        description:
            "Support Ujjwal's work",

        order_id:
            orderId,


        prefill: {

            name:
                "Ujjwal",

            email:
                "pandeyujjwal975@gmail.com"

        },


        theme: {

            color:
                "#00ff9c"

        },


        /*
         * Payment successful.
         */

        handler:
            async function (
                razorpayResponse
            ) {

                console.log(
                    "Razorpay payment response:",
                    razorpayResponse
                );


                showStatus(
                    "Payment received. Verifying...",
                    ""
                );


                try {

                    const result =
                        await verifyPayment(
                            razorpayResponse
                        );


                    if (
                        !result.success
                    ) {

                        throw new Error(
                            result.message ||
                            "Payment verification failed."
                        );

                    }


                    /*
                     * Verified successfully.
                     */

                    showStatus(
                        "Payment successful! Thank you for supporting my work ❤️",
                        "success"
                    );


                    paymentButton.disabled =
                        false;


                    paymentButton.innerHTML = `
                        <i class="fa-solid fa-circle-check"></i>
                        <span>Payment Successful</span>
                    `;


                    /*
                     * Optional redirect.
                     *
                     * If you want to keep the user
                     * on the coffee page, remove this.
                     */

                    setTimeout(() => {

                        window.location.href =
                            "index.html";

                    }, 2500);


                } catch (error) {

                    console.error(
                        "Payment verification error:",
                        error
                    );


                    showStatus(
                        "Payment was received, but verification failed. Please contact me.",
                        "error"
                    );


                    resetPaymentButton();

                }

            },


        /*
         * User closes Razorpay window.
         */

        modal: {

            ondismiss: function () {

                showStatus(
                    "Payment window closed.",
                    "error"
                );

                resetPaymentButton();

            }

        }

    };


    /*
     * Create Razorpay instance.
     */

    const razorpay =
        new Razorpay(options);


    /*
     * Payment failed.
     */

    razorpay.on(
        "payment.failed",
        function (response) {

            console.error(
                "Razorpay payment failed:",
                response
            );


            let message =
                "Payment failed. Please try again.";


            if (
                response &&
                response.error &&
                response.error.description
            ) {

                message =
                    response.error.description;

            }


            showStatus(
                message,
                "error"
            );


            resetPaymentButton();

        }
    );


    /*
     * Open checkout.
     */

    razorpay.open();

}


/* ======================================================
   PAYMENT BUTTON CLICK
====================================================== */

if (paymentButton) {

    paymentButton.addEventListener(
        "click",
        async function () {

            console.log(
                "Payment button clicked"
            );


            const amount =
                getAmount();


            /*
             * Validate amount.
             */

            if (
                !validateAmount(amount)
            ) {

                return;

            }


            /*
             * Disable button.
             */

            paymentButton.disabled =
                true;


            paymentButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Creating Payment...</span>
            `;


            showStatus(
                "Creating secure payment..."
            );


            try {

                /*
                 * Create order on Render backend.
                 */

                const data =
                    await createOrder(
                        amount
                    );


                console.log(
                    "Backend order data:",
                    data
                );


                /*
                 * IMPORTANT:
                 *
                 * Backend response expected:
                 *
                 * {
                 *   success: true,
                 *   orderId: "...",
                 *   amount: 5000,
                 *   currency: "INR",
                 *   keyId: "rzp_test_..."
                 * }
                 */


                if (
                    !data.orderId
                ) {

                    throw new Error(
                        "Razorpay Order ID was not returned by backend."
                    );

                }


                if (
                    !data.keyId
                ) {

                    throw new Error(
                        "Razorpay Key ID was not returned by backend."
                    );

                }


                if (
                    !data.amount
                ) {

                    throw new Error(
                        "Payment amount was not returned by backend."
                    );

                }


                /*
                 * Open Razorpay.
                 */

                openRazorpayCheckout(
                    data.orderId,
                    data.keyId,
                    data.amount,
                    data.currency || "INR"
                );


            } catch (error) {

                console.error(
                    "Payment setup error:",
                    error
                );


                showStatus(
                    error.message ||
                    "Unable to start payment.",
                    "error"
                );


                resetPaymentButton();

            }

        }
    );

}


/* ======================================================
   FRONTEND INITIALIZATION
====================================================== */

console.log(
    "☕ Ujjwal Coffee payment frontend loaded."
);

console.log(
    "Backend:",
    BACKEND_URL
);