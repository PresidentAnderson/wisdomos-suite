#!/bin/bash

# WisdomOS Test Execution Script
# Runs comprehensive end-to-end tests for contribution-fulfillment mirroring functionality

set -e  # Exit on any error

echo "🚀 Starting WisdomOS Contribution-Fulfillment Mirroring Test Suite"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Install dependencies if needed
install_dependencies() {
    print_status "Installing dependencies..."
    
    # API dependencies
    cd apps/api
    if [ ! -d "node_modules" ]; then
        print_status "Installing API dependencies..."
        npm install
    fi
    cd ../..
    
    # Database package dependencies
    cd packages/database
    if [ ! -d "node_modules" ]; then
        print_status "Installing database package dependencies..."
        npm install
    fi
    cd ../..
    
    print_success "Dependencies installed"
}

# Setup test environment
setup_test_env() {
    print_status "Setting up test environment..."
    
    # Create .env.test if it doesn't exist
    if [ ! -f "apps/api/.env.test" ]; then
        print_status "Creating test environment file..."
        cat > apps/api/.env.test << EOF
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/wisdomos_test
JWT_SECRET=test-jwt-secret
PORT=3001
EOF
    fi
    
    if [ ! -f "packages/database/.env.test" ]; then
        cat > packages/database/.env.test << EOF
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/wisdomos_test
EOF
    fi
    
    print_success "Test environment configured"
}

# Run database package tests
run_database_tests() {
    print_status "Running database package tests..."
    
    cd packages/database
    
    # Generate Prisma client
    npx prisma generate
    
    # Run tests
    if npm test; then
        print_success "Database tests passed"
    else
        print_error "Database tests failed"
        return 1
    fi
    
    cd ../..
}

# Run API e2e tests
run_api_tests() {
    print_status "Running API end-to-end tests..."
    
    cd apps/api
    
    # Build the application
    print_status "Building API application..."
    npm run build
    
    # Run e2e tests
    print_status "Executing e2e test suite..."
    if npm run test:e2e; then
        print_success "API e2e tests passed"
    else
        print_error "API e2e tests failed"
        return 1
    fi
    
    cd ../..
}

# Run specific test file
run_specific_test() {
    local test_file=$1
    print_status "Running specific test: $test_file"
    
    cd apps/api
    
    if npm run test:e2e -- "$test_file"; then
        print_success "Test $test_file passed"
    else
        print_error "Test $test_file failed"
        return 1
    fi
    
    cd ../..
}

# Generate test report
generate_report() {
    print_status "Generating test coverage report..."
    
    cd apps/api
    npm run test:e2e:cov
    cd ../..
    
    cd packages/database
    npm run test:cov
    cd ../..
    
    print_success "Coverage reports generated"
    print_status "API coverage: apps/api/coverage/lcov-report/index.html"
    print_status "Database coverage: packages/database/coverage/lcov-report/index.html"
}

# Main execution
main() {
    local command=${1:-"all"}
    
    case $command in
        "deps")
            check_dependencies
            install_dependencies
            ;;
        "setup")
            setup_test_env
            ;;
        "database")
            check_dependencies
            setup_test_env
            run_database_tests
            ;;
        "api")
            check_dependencies
            setup_test_env
            install_dependencies
            run_api_tests
            ;;
        "coverage")
            check_dependencies
            setup_test_env
            install_dependencies
            generate_report
            ;;
        "specific")
            if [ -z "$2" ]; then
                print_error "Please specify a test file"
                print_status "Usage: $0 specific <test-file>"
                print_status "Example: $0 specific contributions.e2e-spec.ts"
                exit 1
            fi
            check_dependencies
            setup_test_env
            install_dependencies
            run_specific_test "$2"
            ;;
        "all")
            print_status "Running complete test suite..."
            check_dependencies
            setup_test_env
            install_dependencies
            
            echo ""
            echo "📊 Test Execution Summary"
            echo "========================"
            
            TOTAL_TESTS=0
            PASSED_TESTS=0
            
            # Database tests
            if run_database_tests; then
                PASSED_TESTS=$((PASSED_TESTS + 1))
            fi
            TOTAL_TESTS=$((TOTAL_TESTS + 1))
            
            # API tests
            if run_api_tests; then
                PASSED_TESTS=$((PASSED_TESTS + 1))
            fi
            TOTAL_TESTS=$((TOTAL_TESTS + 1))
            
            echo ""
            echo "🎯 Final Results"
            echo "==============="
            echo "Total test suites: $TOTAL_TESTS"
            echo "Passed: $PASSED_TESTS"
            echo "Failed: $((TOTAL_TESTS - PASSED_TESTS))"
            
            if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
                print_success "All tests passed! 🎉"
                echo ""
                echo "✅ Contribution-fulfillment mirroring functionality is working correctly"
                echo "✅ All business rules are properly implemented"
                echo "✅ Error handling and edge cases are covered"
                echo "✅ Database constraints and integrity are enforced"
                echo "✅ API endpoints are functioning as expected"
            else
                print_error "Some tests failed. Please check the output above."
                exit 1
            fi
            ;;
        "help"|"-h"|"--help")
            echo "WisdomOS Test Suite Runner"
            echo ""
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  all        - Run complete test suite (default)"
            echo "  deps       - Check and install dependencies"
            echo "  setup      - Setup test environment"
            echo "  database   - Run database package tests only"
            echo "  api        - Run API e2e tests only"
            echo "  coverage   - Generate coverage reports"
            echo "  specific   - Run specific test file"
            echo "  help       - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Run all tests"
            echo "  $0 api                               # Run API tests only"
            echo "  $0 specific contributions.e2e-spec.ts  # Run specific test"
            echo "  $0 coverage                          # Generate coverage"
            ;;
        *)
            print_error "Unknown command: $command"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run the script
main "$@"