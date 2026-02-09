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
    cp .env.example .env 2>/dev/null || echo "Please create .env file manually"
    echo "⚠️  Please update .env with your database credentials"
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
echo "Next steps:"
echo "1. Update server/.env with your database credentials"
echo "2. Start PostgreSQL database"
echo "3. Run database migrations: cd server && npm run prisma:migrate"
echo "4. Start backend: cd server && npm start"
echo "5. Start ML service: cd ml-service && source venv/bin/activate && python app.py"
echo "6. Start frontend: cd frontend && npm run dev"
echo ""
echo "Happy coding! 🎉"

