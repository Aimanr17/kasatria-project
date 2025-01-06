# 3D Data Visualization Project

A web application that visualizes 3D data using Three.js and integrates Google Sign-In for authentication.

## Features

- 3D visualization of periodic table data
- Google Sign-In authentication
- Interactive 3D controls
- Responsive design

## Technologies Used

- Frontend:
  - Vite (Build tool)
  - Three.js (3D graphics)
  - Google Identity Services (Authentication)
  - HTML/CSS/JavaScript

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Aimanr17/kasatria-project.git
cd kasatria-project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Google Client ID:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

The project is automatically deployed to GitHub Pages using GitHub Actions. Any push to the `master` branch will trigger a new deployment.

To deploy manually:
```bash
npm run build
```

## Project Structure

```
app/
├── src/
│   ├── login.html    # Login page with Google Sign-In
│   ├── login.js      # Login functionality
│   ├── main.js       # Main application logic
│   └── main.css      # Styles
├── index.html        # Main application page
└── vite.config.js    # Vite configuration
```

## Live Demo

Visit the live demo at: https://aimanr17.github.io/kasatria-project/

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
