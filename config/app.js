require('dotenv').config()
const config = {
    protocol:process.env.API_PROTOCOL,
    api_url: process.env.API_PROTOCOL+'://'+process.env.API_BASE_URL,
};

module.exports = config;