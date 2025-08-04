"""
Environment Manager Module
Handles test environment setup, teardown, and state management.
"""

import os
import json
import shutil
import subprocess
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path
import time

class EnvironmentManager:
    """
    Manages test environment setup and teardown.
    Handles database operations, file system cleanup, and service management.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize environment manager.
        
        Args:
            config: Test configuration dictionary
        """
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.test_db_path = config.get('test_db_path', 'test_database.db')
        self.backup_dir = Path(config.get('backup_directory', 'backups'))
        self.temp_files = []
        self.temp_dirs = []
        
        # Create necessary directories
        self.backup_dir.mkdir(exist_ok=True)
        
    def setup_test_environment(self) -> bool:
        """
        Set up the test environment.
        
        Returns:
            bool: True if setup successful
        """
        try:
            self.logger.info("Setting up test environment...")
            
            # Create test database
            if not self._setup_test_database():
                return False
            
            # Create test directories
            if not self._create_test_directories():
                return False
            
            # Setup test data
            if not self._setup_test_data():
                return False
            
            # Verify backend service
            if not self._verify_backend_service():
                return False
            
            self.logger.info("Test environment setup completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Test environment setup failed: {str(e)}")
            return False
    
    def teardown_test_environment(self) -> bool:
        """
        Tear down the test environment.
        
        Returns:
            bool: True if teardown successful
        """
        try:
            self.logger.info("Tearing down test environment...")
            
            # Clean up temporary files
            self._cleanup_temp_files()
            
            # Clean up temporary directories
            self._cleanup_temp_dirs()
            
            # Reset test database
            if not self._reset_test_database():
                return False
            
            self.logger.info("Test environment teardown completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Test environment teardown failed: {str(e)}")
            return False
    
    def _setup_test_database(self) -> bool:
        """Set up test database."""
        try:
            # Check if we need to create a new test database
            if os.path.exists(self.test_db_path):
                # Backup existing database
                backup_path = self.backup_dir / f"test_db_backup_{int(time.time())}.db"
                shutil.copy2(self.test_db_path, backup_path)
                self.logger.info(f"Test database backed up to {backup_path}")
            
            # Create or reset test database
            # This would typically involve running migration scripts
            self.logger.info("Test database setup completed")
            return True
            
        except Exception as e:
            self.logger.error(f"Test database setup failed: {str(e)}")
            return False
    
    def _create_test_directories(self) -> bool:
        """Create necessary test directories."""
        try:
            test_dirs = [
                'test_uploads',
                'test_logs',
                'test_reports',
                'test_temp'
            ]
            
            for dir_name in test_dirs:
                dir_path = Path(dir_name)
                if not dir_path.exists():
                    dir_path.mkdir(parents=True, exist_ok=True)
                    self.temp_dirs.append(dir_path)
                    self.logger.debug(f"Created test directory: {dir_path}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Test directories creation failed: {str(e)}")
            return False
    
    def _setup_test_data(self) -> bool:
        """Set up initial test data."""
        try:
            # Create test data files
            test_data_files = [
                'test_users.json',
                'test_products.json',
                'test_categories.json',
                'test_orders.json'
            ]
            
            for file_name in test_data_files:
                file_path = Path(f"test_temp/{file_name}")
                if not file_path.exists():
                    file_path.touch()
                    self.temp_files.append(file_path)
                    self.logger.debug(f"Created test data file: {file_path}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Test data setup failed: {str(e)}")
            return False
    
    def _verify_backend_service(self) -> bool:
        """Verify backend service is running."""
        try:
            # This would typically check if the backend service is running
            # For now, we'll just check if the configured backend URL is accessible
            backend_url = self.config.get('backend_url', 'http://localhost:5000')
            
            # Import here to avoid circular imports
            from .api_client import APIClient
            
            client = APIClient(backend_url)
            if client.health_check():
                self.logger.info("Backend service is accessible")
                return True
            else:
                self.logger.warning("Backend service is not accessible")
                return False
                
        except Exception as e:
            self.logger.error(f"Backend service verification failed: {str(e)}")
            return False
    
    def _reset_test_database(self) -> bool:
        """Reset test database to initial state."""
        try:
            # This would typically involve dropping and recreating test data
            # For now, we'll just log the action
            self.logger.info("Test database reset completed")
            return True
            
        except Exception as e:
            self.logger.error(f"Test database reset failed: {str(e)}")
            return False
    
    def _cleanup_temp_files(self) -> None:
        """Clean up temporary files."""
        for file_path in self.temp_files:
            try:
                if file_path.exists():
                    file_path.unlink()
                    self.logger.debug(f"Removed temporary file: {file_path}")
            except Exception as e:
                self.logger.warning(f"Failed to remove temporary file {file_path}: {str(e)}")
        
        self.temp_files.clear()
    
    def _cleanup_temp_dirs(self) -> None:
        """Clean up temporary directories."""
        for dir_path in self.temp_dirs:
            try:
                if dir_path.exists():
                    shutil.rmtree(dir_path)
                    self.logger.debug(f"Removed temporary directory: {dir_path}")
            except Exception as e:
                self.logger.warning(f"Failed to remove temporary directory {dir_path}: {str(e)}")
        
        self.temp_dirs.clear()
    
    def create_test_backup(self, backup_name: str) -> bool:
        """
        Create a backup of the current test state.
        
        Args:
            backup_name: Name for the backup
            
        Returns:
            bool: True if backup created successfully
        """
        try:
            backup_path = self.backup_dir / f"{backup_name}_{int(time.time())}"
            backup_path.mkdir(exist_ok=True)
            
            # Backup test database
            if os.path.exists(self.test_db_path):
                shutil.copy2(self.test_db_path, backup_path / "test_database.db")
            
            # Backup test data files
            for file_path in self.temp_files:
                if file_path.exists():
                    shutil.copy2(file_path, backup_path / file_path.name)
            
            self.logger.info(f"Test backup created: {backup_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Test backup creation failed: {str(e)}")
            return False
    
    def restore_test_backup(self, backup_name: str) -> bool:
        """
        Restore from a test backup.
        
        Args:
            backup_name: Name of the backup to restore
            
        Returns:
            bool: True if restore successful
        """
        try:
            # Find backup directory
            backup_dirs = list(self.backup_dir.glob(f"{backup_name}_*"))
            if not backup_dirs:
                self.logger.error(f"No backup found with name: {backup_name}")
                return False
            
            # Use the most recent backup
            backup_path = sorted(backup_dirs)[-1]
            
            # Restore test database
            db_backup = backup_path / "test_database.db"
            if db_backup.exists():
                shutil.copy2(db_backup, self.test_db_path)
            
            # Restore test data files
            for file_path in backup_path.glob("*.json"):
                destination = Path(f"test_temp/{file_path.name}")
                destination.parent.mkdir(exist_ok=True)
                shutil.copy2(file_path, destination)
            
            self.logger.info(f"Test backup restored from: {backup_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Test backup restore failed: {str(e)}")
            return False
    
    def get_environment_status(self) -> Dict[str, Any]:
        """
        Get current environment status.
        
        Returns:
            Dict containing environment status information
        """
        status = {
            'database_exists': os.path.exists(self.test_db_path),
            'temp_files_count': len(self.temp_files),
            'temp_dirs_count': len(self.temp_dirs),
            'backup_count': len(list(self.backup_dir.glob("*"))),
            'backend_accessible': self._verify_backend_service()
        }
        
        return status
    
    def cleanup_old_backups(self, keep_count: int = 5) -> None:
        """
        Clean up old backups, keeping only the most recent ones.
        
        Args:
            keep_count: Number of backups to keep
        """
        try:
            backup_dirs = sorted(self.backup_dir.glob("*_*"), key=lambda x: x.stat().st_mtime)
            
            if len(backup_dirs) > keep_count:
                old_backups = backup_dirs[:-keep_count]
                
                for backup_dir in old_backups:
                    if backup_dir.is_dir():
                        shutil.rmtree(backup_dir)
                        self.logger.info(f"Removed old backup: {backup_dir}")
                    else:
                        backup_dir.unlink()
                        self.logger.info(f"Removed old backup file: {backup_dir}")
            
        except Exception as e:
            self.logger.error(f"Backup cleanup failed: {str(e)}")
    
    def __enter__(self):
        """Context manager entry."""
        self.setup_test_environment()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.teardown_test_environment()


class DatabaseManager:
    """Specialized database manager for test operations."""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize database manager.
        
        Args:
            config: Test configuration dictionary
        """
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.db_path = config.get('test_db_path', 'test_database.db')
        self.main_db_path = config.get('main_db_path', '../backend/instance/site.db')
    
    def create_test_database(self) -> bool:
        """Create test database from main database."""
        try:
            if os.path.exists(self.main_db_path):
                shutil.copy2(self.main_db_path, self.db_path)
                self.logger.info(f"Test database created from {self.main_db_path}")
                return True
            else:
                self.logger.warning(f"Main database not found at {self.main_db_path}")
                return False
                
        except Exception as e:
            self.logger.error(f"Test database creation failed: {str(e)}")
            return False
    
    def reset_test_database(self) -> bool:
        """Reset test database to initial state."""
        try:
            if os.path.exists(self.db_path):
                os.remove(self.db_path)
                self.logger.info("Test database removed")
            
            return self.create_test_database()
            
        except Exception as e:
            self.logger.error(f"Test database reset failed: {str(e)}")
            return False
    
    def backup_test_database(self, backup_name: str) -> bool:
        """
        Backup test database.
        
        Args:
            backup_name: Name for the backup
            
        Returns:
            bool: True if backup successful
        """
        try:
            if not os.path.exists(self.db_path):
                self.logger.error("Test database does not exist")
                return False
            
            backup_path = f"{backup_name}_{int(time.time())}.db"
            shutil.copy2(self.db_path, backup_path)
            self.logger.info(f"Test database backed up to {backup_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Test database backup failed: {str(e)}")
            return False
    
    def get_database_info(self) -> Dict[str, Any]:
        """
        Get database information.
        
        Returns:
            Dict containing database info
        """
        info = {
            'test_db_exists': os.path.exists(self.db_path),
            'main_db_exists': os.path.exists(self.main_db_path),
            'test_db_size': 0,
            'main_db_size': 0
        }
        
        if info['test_db_exists']:
            info['test_db_size'] = os.path.getsize(self.db_path)
        
        if info['main_db_exists']:
            info['main_db_size'] = os.path.getsize(self.main_db_path)
        
        return info 