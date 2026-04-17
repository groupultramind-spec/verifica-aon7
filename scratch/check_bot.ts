import "dotenv/config";

async function checkBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error("No token found in .env");
        return;
    }
    console.log(`Checking token: ${token}`);
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

checkBot();
