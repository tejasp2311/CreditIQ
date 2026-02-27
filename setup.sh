#!/bin/bash

echo "🚀 Setting up FinTech Loan Underwriting Platform"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "⚠️  PostgreSQL not found. Please install PostgreSQL." >&2; }
command -v python3 >/dev/null 2>&1 || { echo "⚠️  Python 3 not found. Please install Python 3." >&2; }

echo "✅ Prerequisites check complete"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd server
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠️  Created .env file from template"
        echo "📝 Required environment variables:"
        echo "   • DATABASE_URL=postgresql://user:password@localhost:5432/fintech_loans"
        echo "   • JWT_SECRET=your-secret-key-minimum-32-characters"
        echo ""
        echo "Edit server/.env and set the required values before running the server"
    else
        echo "❌ .env.example not found. Please create .env file manually with:"
        echo "   DATABASE_URL=postgresql://user:password@localhost:5432/fintech_loans"
        echo "   JWT_SECRET=your-secret-key-minimum-32-characters"
    fi
else
    echo "✅ .env file exists"
fi

npm install
echo "✅ Backend dependencies installed"
echo ""

# Database setup
echo "🗄️  Database setup..."
echo "Please ensure PostgreSQL is running and create a database:"
echo "  createdb fintech_loans"
echo "  OR"
echo "  psql -c 'CREATE DATABASE fintech_loans;'"
echo ""
read -p "Have you created the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running Prisma migrations..."
    npm run prisma:generate
    npm run prisma:migrate
    echo "✅ Database setup complete"
else
    echo "⚠️  Skipping database setup. Run migrations manually later."
fi
echo ""

cd ..

# ML Service setup
echo "🐍 Setting up ML service..."
cd ml-service
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
echo "✅ ML service dependencies installed"
deactivate
echo ""

cd ..

# Frontend setup
echo "⚛️  Setting up frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"
echo ""

cd ..

echo "✨ Setup complete!"
echo ""
echo "🔒 Environment Setup:"
echo "   1. Update server/.env with your configuration:"
echo "      - DATABASE_URL: Your PostgreSQL connection string"
echo "      - JWT_SECRET: A secure random secret (minimum 32 characters)"
echo ""
echo "🚀 Next steps to start the application:"
echo "   1. Ensure PostgreSQL is running: brew services start postgresql"
echo "   2. Create database: createdb fintech_loans"
echo "   3. Run migrations: cd server && npm run prisma:migrate"
echo "   4. Start ML service: cd ml-service && source venv/bin/activate && python app.py"
echo "   5. Start backend: cd server && npm start"
echo "      (This validates all env vars and shows service endpoints)"
echo "   6. Start frontend: cd frontend && npm run dev"
echo ""
echo "✅ Access your application at: http://localhost:5173"
echo ""
echo "Happy coding! 🎉"

