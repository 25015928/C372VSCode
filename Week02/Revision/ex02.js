const paymentstatus = "APPROVED";

if (paymentstatus === "APPROVED") {
  console.log("Pet-care service confirmed");
} else if (paymentstatus === "PENDING") {
  console.log("Payment is being processed");
} else if (paymentstatus === "DECLINED") {
  console.log("Payment unsuccessful");
} else {
  console.log("Unknown payment status");
}