const { IgApiClient } = require('instagram-private-api');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('rate-limiter-flexible');
const LRU = require('lru-cache');

// Rate limiting: 3 requests per minute per IP
const limiter = new rateLimit.RateLimiterMemory({
  points: 3, // 3 requests
  duration: 60, // per 60 seconds
});

// Simple in-memory cache for rate limiting
const ipCache = new LRU({
  max: 1000, // Max 1000 unique IPs
  ttl: 60 * 1000, // 1 minute TTL
});

// Initialize Instagram client
const ig = new IgApiClient();

// Generate a neon-styled image with the confession text
async function generateConfessionImage(text) {
  const width = 1080;
  const height = 1080;
  const padding = 60;
  const maxWidth = width - padding * 2;
  
  // Create a canvas with a dark background
  const background = {
    width,
    height,
    channels: 4,
    background: { r: 10, g: 5, b: 20, alpha: 1 }
  };

  // Generate a unique filename
  const filename = `/tmp/confession-${uuidv4()}.jpg`;
  
  // Create the image with the text
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 10, g: 5, b: 20, alpha: 1 }
    }
  })
  .composite([
    {
      input: Buffer.from(`
        <svg width="${width}" height="${height}">
          <style>
            .text {
              font-family: 'Arial', sans-serif;
              font-size: 48px;
              font-weight: bold;
              fill: #ffffff;
              text-anchor: middle;
              dominant-baseline: middle;
              filter: drop-shadow(0 0 10px #ff2a6d) 
                      drop-shadow(0 0 20px #d300c5)
                      drop-shadow(0 0 30px #01cdfe);
            }
          </style>
          <rect x="0" y="0" width="100%" height="100%" fill="none" />
          <text x="50%" y="50%" class="text">
            ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>')}
          </text>
        </svg>
      `),
      top: 0,
      left: 0,
    }
  ])
  .jpeg({ quality: 90 })
  .toFile(filename);
  
  return filename;
}

// Post to Instagram
async function postToInstagram(text) {
  try {
    // Login to Instagram
    ig.state.generateDevice(process.env.IG_USERNAME);
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    
    // Generate the confession image
    const imagePath = await generateConfessionImage(text);
    
    // Post to Instagram Story (higher engagement)
    const storyResult = await ig.publish.story({
      file: imagePath,
      caption: text,
      // Add a question sticker to encourage engagement
      question: 'React with an emoji! 👀',
      questionSize: 'small',
      backgroundColor: '#ff2a6d',
      viewerCanAskQuestion: false,
      viewerCanAnswer: true
    });
    
    // Also post to feed as a fallback
    const feedResult = await ig.publish.photo({
      file: imagePath,
      caption: text + '\n\n#SchoolConfessions #Anonymous #Confessions',
      usertags: {
        in: []
      }
    });
    
    // Clean up the temporary file
    const fs = require('fs');
    fs.unlinkSync(imagePath);
    
    return {
      success: true,
      storyId: storyResult.media.id,
      postId: feedResult.media.id
    };
  } catch (error) {
    console.error('Instagram post error:', error);
    throw new Error('Failed to post to Instagram: ' + error.message);
  }
}

// Main handler function
exports.handler = async (event, context) => {
  console.log('=== New Request ===');
  console.log('Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  
  // Log environment variables (except sensitive ones)
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    IG_USERNAME: process.env.IG_USERNAME ? '***set***' : 'MISSING',
    IG_PASSWORD: process.env.IG_PASSWORD ? '***set***' : 'MISSING'
  });
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Check for POST method
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    // Get client IP for rate limiting
    const clientIP = event.headers['x-nf-client-connection-ip'] || 
                    event.headers['client-ip'] ||
                    (event.requestContext && event.requestContext.identity && event.requestContext.identity.sourceIp) ||
                    'unknown';

    // Check rate limit
    try {
      await limiter.consume(clientIP);
    } catch (rateLimitError) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Too many requests. Please try again in a minute.' 
        }),
      };
    }

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      };
    }

    const { text } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required' }),
      };
    }

    if (text.length < 10 || text.length > 500) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Text must be between 10 and 500 characters' 
        }),
      };
    }

    // Post to Instagram with timeout
    const result = await Promise.race([
      postToInstagram(text),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Instagram posting timed out after 25 seconds')), 25000)
      )
    ]);
    
    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Confession posted successfully!',
        ...result
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
