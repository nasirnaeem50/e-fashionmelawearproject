const welcomeEmailTemplate = (name, frontendUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #f4f4f4; padding: 10px; text-align: center; }
        .content { padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 5px; }
        .footer { margin-top: 20px; font-size: 0.8em; text-align: center; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Fashion Mela!</h1>
        </div>
        <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for joining Fashion Mela! We are thrilled to have you as part of our community.</p>
            <p>You can now browse our latest collections, create your personal wishlist, and enjoy a seamless shopping experience.</p>
            <p style="text-align:center; margin: 30px 0;">
                <a href="${frontendUrl}/shop" class="button">Start Shopping</a>
            </p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Happy Shopping!</p>
            <p><strong>- The Fashion Mela Team</strong></p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Fashion Mela. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = welcomeEmailTemplate;