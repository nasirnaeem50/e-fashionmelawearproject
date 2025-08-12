const orderConfirmationEmailTemplate = (name, order, frontendUrl, forAdmin = false) => {
    const orderId = order._id.toString().slice(-6).toUpperCase();
    const orderDate = new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const title = forAdmin ? `New Order Received (#${orderId})` : `Your Fashion Mela Order #${orderId} is Confirmed!`;
    const heading = forAdmin ? `A new order has been placed!` : `Thanks for your order, ${name}!`;
    const intro = forAdmin 
        ? `<p>A new order has been placed on Fashion Mela by <strong>${name}</strong> (${order.user.email}). Please review the details below and begin processing.</p>`
        : `<p>We've received your order and will get it ready for shipment. You can view your order details by clicking the button below.</p>`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 20px auto; padding: 0; border: 1px solid #ddd; border-radius: 5px; background-color: #ffffff; }
        .header { background-color: #2d2d2d; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; }
        .order-summary, .shipping-details { margin-bottom: 20px; }
        .order-summary h3, .shipping-details h3 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
        .item { display: flex; align-items: center; margin-bottom: 10px; }
        .item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 5px; margin-right: 15px; }
        .item-details { flex-grow: 1; }
        .totals { text-align: right; margin-top: 20px; }
        .totals p { margin: 5px 0; }
        .button { display: inline-block; padding: 12px 25px; background-color: #ef4444; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { margin-top: 20px; font-size: 0.8em; text-align: center; color: #888; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div class="content">
            <h2>${heading}</h2>
            ${intro}
            
            <div class="order-summary">
                <h3>Order Summary (ID: #${orderId})</h3>
                <p><strong>Order Date:</strong> ${orderDate}</p>
                ${order.orderItems.map(item => `
                    <div class="item">
                        <img src="${item.image}" alt="${item.name}" class="item-img">
                        <div class="item-details">
                            <strong>${item.name}</strong><br>
                            Qty: ${item.quantity} - Price: Rs ${item.price.toLocaleString()}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="totals">
                <p>Subtotal: <strong>Rs ${order.subtotal.toLocaleString()}</strong></p>
                ${order.couponDiscount > 0 ? `<p>Coupon Discount: <strong style="color: #28a745;">- Rs ${order.couponDiscount.toLocaleString()}</strong></p>` : ''}
                <p>Shipping: <strong>Rs ${order.shippingCost.toLocaleString()}</strong></p>
                <p>Tax: <strong>Rs ${order.taxAmount.toLocaleString()}</strong></p>
                <p style="font-size: 1.2em;">Total: <strong style="color: #ef4444;">Rs ${order.total.toLocaleString()}</strong></p>
            </div>

            <div class="shipping-details">
                <h3>Shipping To</h3>
                <p>
                    <strong>${order.shippingInfo.name}</strong><br>
                    ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.postalCode}<br>
                    ${order.shippingInfo.country}<br>
                    Phone: ${order.shippingInfo.phoneNo}
                </p>
            </div>

            <p style="text-align:center; margin: 30px 0;">
                <a href="${frontendUrl}/profile/orders/${order._id}" class="button">View Order Details</a>
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Fashion Mela. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
`;
}

module.exports = orderConfirmationEmailTemplate;