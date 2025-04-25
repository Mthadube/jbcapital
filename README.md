# JB Capital Loan Management System

A comprehensive loan management system built with React and TypeScript.

## Features

- User Management
- Loan Application Processing
- Document Management
- Risk Assessment
- Reports & Analytics
- Contract Management

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jbcapital.git
cd jbcapital
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Development

### Project Structure

```
src/
  ├── components/     # React components
  ├── utils/         # Utility functions
  ├── styles/        # Global styles
  ├── pages/         # Page components
  └── types/         # TypeScript type definitions
```

### Building

To create a production build:

```bash
npm run build
```

### Testing

Run the test suite:

```bash
npm test
```

## Deployment

The application can be deployed to any hosting platform that supports Node.js applications.

### Building for Production

1. Create a production build:
```bash
npm run build
```

2. The build output will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.
