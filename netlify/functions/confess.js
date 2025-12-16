const { IgApiClient } = require('instagram-private-api');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Log the environment variables (except sensitive ones)
    console.log('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      IG_USERNAME: process.env.IG_USERNAME ? '***set***' : 'MISSING',
      IG_PASSWORD: process.env.IG_PASSWORD ? '***set***' : 'MISSING'
    });

    // Parse request body
    let text = '';
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      text = body.text || '';
    } catch (e) {
      console.error('Error parsing body:', e);
    }

    if (!text || text.length < 10 || text.length > 500) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid text length (10-500 chars required)' }),
      };
    }

    // Return test response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Test response - Working!',
        text: text.substring(0, 20) + (text.length > 20 ? '...' : '')
      }),
    };

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      response: error.response?.data
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};
