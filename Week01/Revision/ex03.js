const payments = [
    { petName: "Chester", amount: 100, status: "APPROVED" },
    { petName: "Mochi", amount: 80, status: "PENDING" },
    { petName: "Mira", amount: 40, status: "DECLINED" }
];

console.log("Mochi's Payment Status: "+ payments[1].status);

payments.forEach(payment => {
    if (payment.status === "APPROVED") {
        console.log(`Pet-care service for ${payment.petName} confirmed`);
    } else if (payment.status === "PENDING") {
        console.log(`Payment for ${payment.petName} is being processed`);
    } else if (payment.status === "DECLINED") {
        console.log(`Payment for ${payment.petName} unsuccessful`);
    }
});