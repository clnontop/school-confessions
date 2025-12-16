# School Confessions Website

An anonymous confessions platform that posts submissions to Instagram. Built with vanilla JavaScript and Netlify Functions.

## Features

- 🚀 Anonymous confession submission
- 🌈 Neon dark theme with glitch effects
- 📱 Mobile-first responsive design
- 🔥 Auto-posts to Instagram Stories & Feed
- ⚡ Rate limiting and spam protection
- 🔒 Secure serverless backend

## Prerequisites

- Node.js 18+
- Netlify CLI (`npm install -g netlify-cli`)
- An Instagram account for posting confessions

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your Instagram credentials:
   ```
   IG_USERNAME=your_instagram_username
   IG_PASSWORD=your_instagram_password
   ```
4. Start the local development server:
   ```bash
   netlify dev
   ```
5. Open http://localhost:8888 in your browser

## Deployment

### Option 1: Netlify Deploy Button

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=YOUR_REPO_URL)

### Option 2: Manual Deployment

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Create a new site in Netlify and connect your repository
3. Set up the following environment variables in Netlify:
   - `IG_USERNAME`: Your Instagram username
   - `IG_PASSWORD`: Your Instagram password
4. Deploy the site

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `IG_USERNAME` | Instagram account username | ✅ Yes |
| `IG_PASSWORD` | Instagram account password | ✅ Yes |

## Security Considerations

- **Never** commit your Instagram credentials to version control
- Use environment variables for all sensitive data
- The app implements rate limiting (3 requests per minute per IP)
- CORS is properly configured to prevent unauthorized access

## Troubleshooting

### Instagram Login Issues
- Make sure 2FA is disabled on your Instagram account
- Check that your credentials are correct
- Instagram might temporarily block login attempts - try again later

### Deployment Issues
- Ensure all environment variables are set in Netlify
- Check the Netlify function logs for errors
- Make sure your Node.js version is 18 or higher

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Made with ❤️ by [Your Name]
