#!/bin/bash

# Exit on any error
set -e

# Fix pb_test_suite permissions on server
echo "🔧 Fixing pb_test_suite permissions..."

# Change to project directory
if ! cd /opt/pebdeq; then
    echo "❌ Error: Cannot change to /opt/pebdeq directory"
    exit 1
fi

# Create necessary directories with correct permissions
echo "📁 Creating pb_test_suite directories..."
sudo mkdir -p pb_test_suite/backups/code_quality
sudo mkdir -p pb_test_suite/backups/rollback_points
sudo mkdir -p pb_test_suite/backups/snapshots
sudo mkdir -p pb_test_suite/backups/successful_states
sudo mkdir -p pb_test_suite/reports

# Set ownership to web server user
echo "👤 Setting ownership to www-data..."
sudo chown -R www-data:www-data pb_test_suite/

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chmod -R 755 pb_test_suite/
sudo chmod -R 777 pb_test_suite/backups/
sudo chmod -R 777 pb_test_suite/reports/

echo "✅ Permissions fixed!"
echo "📋 Directory structure:"
ls -la pb_test_suite/
ls -la pb_test_suite/backups/

echo "🎯 Now test the Code Quality button again!" 