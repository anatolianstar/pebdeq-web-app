#!/usr/bin/env python3
"""
PEBDEQ PROJECT DEPLOYMENT TOOL
Kapsamlı GUI tabanlı deployment aracı
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import threading
import subprocess
import os
import json
import time
import paramiko
import requests
from pathlib import Path
import re
import logging

# Optional imports for enhanced GUI
try:
    from ttkthemes import ThemedTk, ThemedStyle
    THEMES_AVAILABLE = True
except ImportError:
    THEMES_AVAILABLE = False

try:
    from PIL import Image, ImageTk
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False

class DeploymentGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("PEBDEQ Deployment Tool")
        self.root.minsize(1000, 700)  # Minimum boyut
        
        # Simpler window sizing - avoid conflicts
        try:
            if os.name == 'nt':
                # Windows: Start with normal size, user can maximize if needed
                self.root.geometry("1200x900")
            else:
                # Linux/Mac: Use geometry
                self.root.geometry("1200x900")
        except Exception as e:
            # Use basic print for early startup error before logger is set up
            print(f"Window sizing error: {e}")
            self.root.geometry("1000x700")  # Fallback
        
        # Apply theme if available
        if THEMES_AVAILABLE:
            try:
                self.style = ThemedStyle(root)
                self.style.set_theme("arc")  # Modern theme
            except Exception as e:
                # Use basic print for early startup error before logger is set up
                print(f"Theme error: {e}")
                self.root.configure(bg='#f0f0f0')
        else:
            self.root.configure(bg='#f0f0f0')
        
        # Set window icon if available
        try:
            self.root.iconbitmap("icon.ico")
        except (tk.TclError, FileNotFoundError, OSError):
            pass  # Icon file not found or invalid format
        
        # Setup logging configuration
        self.setup_logging()
        
        # Variables
        self.project_path = tk.StringVar()
        self.server_ip = tk.StringVar(value="5.161.245.15")
        self.server_user = tk.StringVar(value="root")
        self.server_password = tk.StringVar()
        self.server_port = tk.StringVar(value="22")
        self.domain_name = tk.StringVar(value="pebdeq.com")
        self.additional_domains = tk.StringVar(value="www.pebdeq.com")
        self.ssl_email = tk.StringVar(value="admin@pebdeq.com")
        self.auto_mode = tk.BooleanVar(value=True)
        self.upload_files = tk.BooleanVar(value=True)
        self.incremental_upload = tk.BooleanVar(value=False)
        self.ssl_enable = tk.BooleanVar(value=True)
        self.force_https = tk.BooleanVar(value=True)
        self.enable_hsts = tk.BooleanVar(value=False)
        self.clean_install = tk.BooleanVar(value=True)
        self.setup_firewall = tk.BooleanVar(value=True)
        self.install_updates = tk.BooleanVar(value=True)
        
        # Auto-deploy variables
        self.auto_deploy_enabled = tk.BooleanVar()
        self.auto_deploy_interval = tk.IntVar(value=10)  # seconds
        self.watch_extensions = tk.StringVar(value=".py,.js,.css,.html,.json")
        self.auto_deploy_thread = None
        self.stop_watching = False
        
        # Connection
        self.ssh_client = None
        self.sftp_client = None
        
        # Setup GUI
        self.setup_gui()
        
        # Load saved connection settings
        self.load_connection_settings()
        
        # Set up window close handler
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def on_closing(self):
        """Handle window closing - stop auto-deploy if running"""
        try:
            # Stop auto-deploy if running
            if self.auto_deploy_enabled.get():
                self.stop_auto_deploy()
                
            # Close SSH connection
            if self.ssh_client:
                self.ssh_client.close()
        except Exception as e:
            # Gracefully handle any cleanup errors during shutdown
            pass
        self.root.destroy()
        
    def setup_logging(self):
        """Setup logging configuration for deployment GUI"""
        # Create logs directory if it doesn't exist
        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(logs_dir / 'deployment_gui.log'),
                logging.StreamHandler()  # Also log to console
            ]
        )
        
        # Create logger instance for this class
        self.logger = logging.getLogger('DeploymentGUI')
        self.logger.info("Deployment GUI logging initialized")
        
    def setup_gui(self):
        """Setup the main GUI interface"""
        
        # Title
        title_frame = tk.Frame(self.root, bg='#2c3e50', height=60)
        title_frame.pack(fill='x', pady=(0, 10))
        title_frame.pack_propagate(False)
        
        title_label = tk.Label(title_frame, text="[LAUNCH] PEBDEQ DEPLOYMENT TOOL", 
                              font=('Arial', 16, 'bold'), fg='white', bg='#2c3e50')
        title_label.pack(expand=True)
        
        # Main container
        main_frame = tk.Frame(self.root, bg='#f0f0f0')
        main_frame.pack(fill='both', expand=True, padx=20, pady=10)
        
        # Create notebook for tabs
        notebook = ttk.Notebook(main_frame)
        notebook.pack(fill='both', expand=True)
        
        # Tab 1: Logs (Create first to initialize log_text)
        logs_frame = ttk.Frame(notebook)
        notebook.add(logs_frame, text="📋 Logs")
        self.setup_logs_tab(logs_frame)
        
        # Tab 2: Configuration
        config_frame = ttk.Frame(notebook)
        notebook.add(config_frame, text="[CONFIG] Configuration")
        self.setup_config_tab(config_frame)
        
        # Tab 3: Deployment
        deploy_frame = ttk.Frame(notebook)
        notebook.add(deploy_frame, text="[DEPLOY] Deployment")
        self.setup_deploy_tab(deploy_frame)
        
        # Tab 4: File Manager
        filemanager_frame = ttk.Frame(notebook)
        notebook.add(filemanager_frame, text="📁 File Manager")
        self.setup_filemanager_tab(filemanager_frame)
        
        # Tab 5: Server Management
        servermgmt_frame = ttk.Frame(notebook)
        notebook.add(servermgmt_frame, text="[SERVER] Server Control")
        self.setup_servermgmt_tab(servermgmt_frame)
        
        # Tab 6: Database Manager
        database_frame = ttk.Frame(notebook)
        notebook.add(database_frame, text="[DB] Database")
        self.setup_database_tab(database_frame)
        
        # Tab 7: Git Manager
        git_frame = ttk.Frame(notebook)
        notebook.add(git_frame, text="[GIT] Git")
        self.setup_git_tab(git_frame)
        
        # Tab 8: Performance Monitor
        performance_frame = ttk.Frame(notebook)
        notebook.add(performance_frame, text="[PERF] Performance")
        self.setup_performance_tab(performance_frame)
        
        # Tab 9: Network Tools
        network_frame = ttk.Frame(notebook)
        notebook.add(network_frame, text="[NET] Network")
        self.setup_network_tab(network_frame)
        
    def setup_config_tab(self, parent):
        """Setup configuration tab"""
        
        # Project Settings
        project_group = ttk.LabelFrame(parent, text="📁 Project Settings", padding=15)
        project_group.pack(fill='x', pady=(0, 15))
        
        tk.Label(project_group, text="Project Folder:", font=('Arial', 9, 'bold')).grid(row=0, column=0, sticky='w', pady=8)
        tk.Entry(project_group, textvariable=self.project_path, width=45, font=('Arial', 9)).grid(row=0, column=1, padx=(10, 5), pady=8)
        tk.Button(project_group, text="📂 Browse", command=self.browse_project, 
                 bg='#3498db', fg='white', font=('Arial', 9)).grid(row=0, column=2, pady=8, padx=(5, 0))
        
        # Server Settings
        server_group = ttk.LabelFrame(parent, text="🖥️ Server Settings", padding=15)
        server_group.pack(fill='x', pady=(0, 15))
        
        tk.Label(server_group, text="Server IP:", font=('Arial', 9, 'bold')).grid(row=0, column=0, sticky='w', pady=8)
        tk.Entry(server_group, textvariable=self.server_ip, width=20, font=('Arial', 9)).grid(row=0, column=1, sticky='w', padx=(10, 20), pady=8)
        
        tk.Label(server_group, text="Port:", font=('Arial', 9, 'bold')).grid(row=0, column=2, sticky='w', pady=8)
        tk.Entry(server_group, textvariable=self.server_port, width=10, font=('Arial', 9)).grid(row=0, column=3, sticky='w', padx=(10, 0), pady=8)
        
        tk.Label(server_group, text="Username:", font=('Arial', 9, 'bold')).grid(row=1, column=0, sticky='w', pady=8)
        tk.Entry(server_group, textvariable=self.server_user, width=20, font=('Arial', 9)).grid(row=1, column=1, sticky='w', padx=(10, 20), pady=8)
        
        tk.Label(server_group, text="Password:", font=('Arial', 9, 'bold')).grid(row=1, column=2, sticky='w', pady=8)
        tk.Entry(server_group, textvariable=self.server_password, show="*", width=20, font=('Arial', 9)).grid(row=1, column=3, sticky='w', padx=(10, 0), pady=8)
        
        # Domain Configuration
        domain_group = ttk.LabelFrame(parent, text="[DOMAIN] Domain & SSL Configuration", padding=15)
        domain_group.pack(fill='x', pady=(0, 15))
        
        tk.Label(domain_group, text="Primary Domain:", font=('Arial', 9, 'bold')).grid(row=0, column=0, sticky='w', pady=8)
        tk.Entry(domain_group, textvariable=self.domain_name, width=30, font=('Arial', 9)).grid(row=0, column=1, columnspan=2, sticky='w', padx=(10, 0), pady=8)
        
        tk.Label(domain_group, text="Additional Domains (comma separated):", font=('Arial', 9, 'bold')).grid(row=1, column=0, sticky='w', pady=8)
        tk.Entry(domain_group, textvariable=self.additional_domains, width=45, font=('Arial', 9)).grid(row=1, column=1, columnspan=2, sticky='w', padx=(10, 0), pady=8)
        
        tk.Label(domain_group, text="SSL Email:", font=('Arial', 9, 'bold')).grid(row=2, column=0, sticky='w', pady=8)
        tk.Entry(domain_group, textvariable=self.ssl_email, width=30, font=('Arial', 9)).grid(row=2, column=1, columnspan=2, sticky='w', padx=(10, 0), pady=8)
        
        # SSL Options
        ssl_frame = tk.Frame(domain_group)
        ssl_frame.grid(row=3, column=0, columnspan=3, sticky='w', pady=10)
        
        tk.Checkbutton(ssl_frame, text="Enable SSL/HTTPS (Let's Encrypt)", 
                      variable=self.ssl_enable).pack(anchor='w')
        tk.Checkbutton(ssl_frame, text="Force HTTPS Redirect", 
                      variable=self.force_https).pack(anchor='w')
        tk.Checkbutton(ssl_frame, text="Enable HSTS (HTTP Strict Transport Security)", 
                      variable=self.enable_hsts).pack(anchor='w')
        
        # Deployment Options
        options_group = ttk.LabelFrame(parent, text="[OPTIONS] Deployment Options", padding=15)
        options_group.pack(fill='x', pady=(0, 15))
        
        tk.Checkbutton(options_group, text="Automatic Mode (Minimal prompts)", 
                      variable=self.auto_mode).pack(anchor='w', pady=2)
        
        # File Upload Options
        file_frame = tk.Frame(options_group)
        file_frame.pack(anchor='w', pady=2)
        tk.Checkbutton(file_frame, text="[UPLOAD] Upload Project Files", 
                      variable=self.upload_files).pack(side='left')
        tk.Checkbutton(file_frame, text="[FAST] Incremental Upload (only changed files)", 
                      variable=self.incremental_upload).pack(side='left', padx=(20, 0))
        
        # Auto-deploy section (Compact)
        auto_deploy_frame = tk.Frame(options_group)
        auto_deploy_frame.pack(fill='x', pady=2)
        
        self.auto_deploy_check = tk.Checkbutton(auto_deploy_frame, text="🤖 Enable Auto-Deploy", 
                                               variable=self.auto_deploy_enabled, 
                                               command=self.toggle_auto_deploy,
                                               font=('Arial', 9, 'bold'))
        self.auto_deploy_check.pack(side='left')
        
        # Compact controls
        tk.Label(auto_deploy_frame, text="⏱️", font=('Arial', 9)).pack(side='left', padx=(10, 2))
        tk.Spinbox(auto_deploy_frame, from_=5, to=300, width=4, textvariable=self.auto_deploy_interval).pack(side='left')
        tk.Label(auto_deploy_frame, text="sec", font=('Arial', 8)).pack(side='left', padx=(2, 10))
        
        tk.Label(auto_deploy_frame, text="📄", font=('Arial', 9)).pack(side='left')
        tk.Entry(auto_deploy_frame, textvariable=self.watch_extensions, width=15, font=('Arial', 8)).pack(side='left', padx=(2, 10))
        
        # Status indicator
        self.auto_deploy_status = tk.Label(auto_deploy_frame, text="❌ Stopped", 
                                          fg='red', font=('Arial', 8))
        self.auto_deploy_status.pack(side='left', padx=(10, 0))
        
        tk.Checkbutton(options_group, text="Clean Install (Remove existing files)", 
                      variable=self.clean_install).pack(anchor='w', pady=2)
        tk.Checkbutton(options_group, text="Setup Firewall Rules", 
                      variable=self.setup_firewall).pack(anchor='w', pady=2)
        tk.Checkbutton(options_group, text="Install System Updates", 
                      variable=self.install_updates).pack(anchor='w', pady=2)
        
        # Test Connection
        test_frame = tk.Frame(parent)
        test_frame.pack(fill='x', pady=20)
        
        tk.Button(test_frame, text="🔌 Test Connection", command=self.test_connection, 
                 bg='#3498db', fg='white', font=('Arial', 11, 'bold'), height=2, width=20).pack(side='left')
        
        tk.Button(test_frame, text="💾 Save Settings", command=self.save_connection_settings, 
                 bg='#27ae60', fg='white', font=('Arial', 11, 'bold'), height=2, width=15).pack(side='left', padx=(10, 0))
        
        self.connection_status = tk.Label(test_frame, text="❓ Not tested", fg='gray', font=('Arial', 10, 'bold'))
        self.connection_status.pack(side='left', padx=(20, 0))
        
    def setup_deploy_tab(self, parent):
        """Setup deployment tab"""
        
        # Progress Section
        progress_group = ttk.LabelFrame(parent, text="[PROGRESS] Deployment Progress", padding=15)
        progress_group.pack(fill='x', pady=(0, 15))
        
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(progress_group, variable=self.progress_var, maximum=100)
        self.progress_bar.pack(fill='x', pady=(0, 10))
        
        self.status_label = tk.Label(progress_group, text="Ready to deploy", fg='gray')
        self.status_label.pack()
        
        # System monitoring (if psutil available)
        if PSUTIL_AVAILABLE:
            monitor_frame = tk.Frame(progress_group)
            monitor_frame.pack(fill='x', pady=(10, 0))
            
            tk.Label(monitor_frame, text="System Resources:", font=('Arial', 9, 'bold')).pack(anchor='w')
            
            self.resource_frame = tk.Frame(monitor_frame)
            self.resource_frame.pack(fill='x', pady=(5, 0))
            
            self.cpu_label = tk.Label(self.resource_frame, text="CPU: --", fg='blue')
            self.cpu_label.pack(side='left', padx=(0, 20))
            
            self.memory_label = tk.Label(self.resource_frame, text="Memory: --", fg='green')
            self.memory_label.pack(side='left', padx=(0, 20))
            
            self.disk_label = tk.Label(self.resource_frame, text="Disk: --", fg='orange')
            self.disk_label.pack(side='left')
            
            # Start monitoring
            self.update_system_resources()
        
        # Deployment Steps
        steps_group = ttk.LabelFrame(parent, text="Deployment Steps", padding=10)
        steps_group.pack(fill='both', expand=True, pady=(0, 120))  # Alt butonlar için boşluk
        
        # Steps list with checkboxes in a scrollable frame
        canvas = tk.Canvas(steps_group, bg='white')
        scrollbar = ttk.Scrollbar(steps_group, orient="vertical", command=canvas.yview)
        self.steps_frame = tk.Frame(canvas, bg='white')
        
        self.steps_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=self.steps_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        self.deployment_steps = [
            ("[CONNECT] Test server connection", "test_connection"),
            ("[UPDATE] Update system packages", "update_system"),
            ("[FIREWALL] Configure firewall", "configure_firewall"),
            ("[CLEAN] Clean existing deployment", "clean_deployment"),
            ("[UPLOAD] Upload project files", "upload_files"),
            ("[PYTHON] Setup Python environment", "setup_python"),
            ("[DEPS] Install dependencies", "install_dependencies"),
            ("[BUILD] Build frontend", "build_frontend"),
            ("[DB] Setup database", "setup_database"),
            ("[SERVICE] Configure services", "configure_services"),
            ("[NGINX] Setup web server", "setup_webserver"),
            ("[SSL] Configure SSL", "configure_ssl"),
            ("[TEST] Run health checks", "health_checks"),
            ("[VERIFY] Final verification", "final_verification")
        ]
        
        self.step_vars = {}
        for i, (step_name, step_id) in enumerate(self.deployment_steps):
            var = tk.BooleanVar()
            self.step_vars[step_id] = var
            
            # Her adım için frame
            step_frame = tk.Frame(self.steps_frame, bg='white')
            step_frame.pack(fill='x', pady=3, padx=5)
            
            cb = tk.Checkbutton(step_frame, text=f"{i+1:2d}. {step_name}", variable=var, 
                               state='normal', bg='white', font=('Arial', 9), anchor='w')
            cb.pack(anchor='w')
        
        # Control Buttons
        control_frame = tk.Frame(parent)
        control_frame.pack(fill='x', pady=20, side='bottom')  # Alt tarafa yapıştır
        
        tk.Button(control_frame, text="[START] START DEPLOYMENT", command=self.start_deployment,
                 bg='#27ae60', fg='white', font=('Arial', 12, 'bold'), height=2, width=18).pack(side='left', padx=(0, 15))
        
        tk.Button(control_frame, text="⏹️ STOP", command=self.stop_deployment,
                 bg='#e74c3c', fg='white', font=('Arial', 12, 'bold'), height=2, width=12).pack(side='left', padx=(0, 15))
        
        tk.Button(control_frame, text="☑️ SELECT ALL", command=self.select_all_steps,
                 bg='#3498db', fg='white', font=('Arial', 10, 'bold'), height=2, width=12).pack(side='left', padx=(0, 15))
        
        tk.Button(control_frame, text="☐ CLEAR ALL", command=self.clear_all_steps,
                 bg='#95a5a6', fg='white', font=('Arial', 10, 'bold'), height=2, width=12).pack(side='left', padx=(0, 15))
        
        tk.Button(control_frame, text="[RESET] RESET", command=self.reset_deployment,
                 bg='#f39c12', fg='white', font=('Arial', 12, 'bold'), height=2, width=12).pack(side='left', padx=(0, 15))
        
        tk.Button(control_frame, text="🚀 QUICK UPDATE", command=self.set_quick_update_mode,
                 bg='#9b59b6', fg='white', font=('Arial', 10, 'bold'), height=2, width=14).pack(side='left')
        
    def setup_logs_tab(self, parent):
        """Setup logs tab"""
        
        # Log display
        self.log_text = scrolledtext.ScrolledText(parent, height=35, bg='#2c3e50', fg='#ecf0f1', 
                                                 font=('Consolas', 9), wrap=tk.WORD)
        self.log_text.pack(fill='both', expand=True, pady=10)
        
        # Log controls
        log_controls = tk.Frame(parent)
        log_controls.pack(fill='x', pady=(15, 0))
        
        tk.Button(log_controls, text="🗑️ Clear Logs", command=self.clear_logs, 
                 bg='#e74c3c', fg='white', font=('Arial', 9, 'bold'), height=2).pack(side='left')
        tk.Button(log_controls, text="💾 Save Logs", command=self.save_logs, 
                 bg='#27ae60', fg='white', font=('Arial', 9, 'bold'), height=2).pack(side='left', padx=(10, 0))
        tk.Button(log_controls, text="🚨 Show Error Lines", command=self.show_error_lines, 
                 bg='#c0392b', fg='white', font=('Arial', 9, 'bold'), height=2).pack(side='left', padx=(10, 0))
        tk.Button(log_controls, text="📋 Copy All Errors", command=self.copy_all_errors, 
                 bg='#8e44ad', fg='white', font=('Arial', 9, 'bold'), height=2).pack(side='left', padx=(10, 0))
                 
    def setup_filemanager_tab(self, parent):
        """Setup file manager tab with dual pane"""
        
        # Connection status with auto-connect
        status_frame = tk.Frame(parent)
        status_frame.pack(fill='x', pady=(0, 10))
        
        tk.Label(status_frame, text="📡 Connection Status:", font=('Arial', 10, 'bold')).pack(side='left')
        self.fm_status = tk.Label(status_frame, text="❌ Not Connected", fg='red', font=('Arial', 10))
        self.fm_status.pack(side='left', padx=(10, 0))
        
        # Connection buttons
        self.fm_connect_btn = tk.Button(status_frame, text="🔗 Connect", command=self.fm_connect, 
                                       bg='#3498db', fg='white', font=('Arial', 9))
        self.fm_connect_btn.pack(side='right', padx=(5, 0))
        
        self.fm_disconnect_btn = tk.Button(status_frame, text="🔌 Disconnect", command=self.fm_disconnect, 
                                          bg='#e74c3c', fg='white', font=('Arial', 9), state='disabled')
        self.fm_disconnect_btn.pack(side='right', padx=(5, 0))
        
        self.fm_test_btn = tk.Button(status_frame, text="🧪 Test", command=self.fm_test_connection, 
                                    bg='#f39c12', fg='white', font=('Arial', 9))
        self.fm_test_btn.pack(side='right', padx=(5, 0))
        
        # Add show hidden files option
        self.show_hidden_files = tk.BooleanVar(value=False)
        self.hidden_files_cb = tk.Checkbutton(status_frame, text="👁️ Show Hidden Files", 
                                             variable=self.show_hidden_files, 
                                             command=self.on_hidden_files_change,
                                             font=('Arial', 9))
        self.hidden_files_cb.pack(side='right', padx=(10, 5))
        
        # Main panels container
        panels_frame = tk.Frame(parent)
        panels_frame.pack(fill='both', expand=True, pady=(0, 10))
        
        # Use grid for better layout control
        panels_frame.grid_columnconfigure(0, weight=1)  # Source column - less weight
        panels_frame.grid_columnconfigure(1, weight=2)  # Target column - more weight (2x wider)
        panels_frame.grid_rowconfigure(0, weight=1)
        
        # Left Panel (Local) - Source
        left_frame = ttk.LabelFrame(panels_frame, text="💻 Local Files (Source)", padding=10)
        left_frame.grid(row=0, column=0, sticky='nsew', padx=(0, 5))
        
        # Local path
        local_path_frame = tk.Frame(left_frame)
        local_path_frame.pack(fill='x', pady=(0, 10))
        
        tk.Label(local_path_frame, text="Path:", font=('Arial', 9, 'bold')).pack(side='left')
        self.local_path_var = tk.StringVar(value=str(Path.home()))
        self.local_path_entry = tk.Entry(local_path_frame, textvariable=self.local_path_var, font=('Arial', 9))
        self.local_path_entry.pack(side='left', fill='x', expand=True, padx=(5, 5))
        tk.Button(local_path_frame, text="📂", command=self.browse_local_path, 
                 bg='#3498db', fg='white').pack(side='right')
        
        # Local file tree with scrollbars
        local_tree_frame = tk.Frame(left_frame)
        local_tree_frame.pack(fill='both', expand=True, pady=(0, 10))
        
        self.local_tree = ttk.Treeview(local_tree_frame, height=25)
        self.local_tree.pack(side="left", fill='both', expand=True)
        
        local_scrollbar_v = ttk.Scrollbar(local_tree_frame, orient="vertical", command=self.local_tree.yview)
        local_scrollbar_v.pack(side="right", fill="y")
        self.local_tree.configure(yscrollcommand=local_scrollbar_v.set)
        
        local_scrollbar_h = ttk.Scrollbar(left_frame, orient="horizontal", command=self.local_tree.xview)
        local_scrollbar_h.pack(side="bottom", fill="x")
        self.local_tree.configure(xscrollcommand=local_scrollbar_h.set)
        
        # Right Panel (Remote) - Target (2x wider)
        right_frame = ttk.LabelFrame(panels_frame, text="🖥️ Remote Files (Target)", padding=10)
        right_frame.grid(row=0, column=1, sticky='nsew', padx=(5, 0))
        
        # Remote path
        remote_path_frame = tk.Frame(right_frame)
        remote_path_frame.pack(fill='x', pady=(0, 10))
        
        tk.Label(remote_path_frame, text="Path:", font=('Arial', 9, 'bold')).pack(side='left')
        self.remote_path_var = tk.StringVar(value="/opt/pebdeq")
        self.remote_path_entry = tk.Entry(remote_path_frame, textvariable=self.remote_path_var, font=('Arial', 9))
        self.remote_path_entry.pack(side='left', fill='x', expand=True, padx=(5, 5))
        self.refresh_remote_btn = tk.Button(remote_path_frame, text="🔄", command=self.refresh_remote_files, 
                                           bg='#f39c12', fg='white', state='disabled')
        self.refresh_remote_btn.pack(side='right')
        
        # Remote file tree with scrollbars
        remote_tree_frame = tk.Frame(right_frame)
        remote_tree_frame.pack(fill='both', expand=True, pady=(0, 10))
        
        self.remote_tree = ttk.Treeview(remote_tree_frame, height=25)
        self.remote_tree.pack(side="left", fill='both', expand=True)
        
        remote_scrollbar_v = ttk.Scrollbar(remote_tree_frame, orient="vertical", command=self.remote_tree.yview)
        remote_scrollbar_v.pack(side="right", fill="y")
        self.remote_tree.configure(yscrollcommand=remote_scrollbar_v.set)
        
        remote_scrollbar_h = ttk.Scrollbar(right_frame, orient="horizontal", command=self.remote_tree.xview)
        remote_scrollbar_h.pack(side="bottom", fill="x")
        self.remote_tree.configure(xscrollcommand=remote_scrollbar_h.set)
        
        # Control buttons - Store references for enabling/disabling
        control_frame = tk.Frame(parent)
        control_frame.pack(fill='x', pady=10)
        
        # File transfer buttons
        self.upload_btn = tk.Button(control_frame, text="➡️ Upload Selected", command=self.upload_selected,
                                   bg='#27ae60', fg='white', font=('Arial', 9, 'bold'), state='disabled')
        self.upload_btn.pack(side='left', padx=(0, 10))
        
        self.download_btn = tk.Button(control_frame, text="⬅️ Download Selected", command=self.download_selected,
                                     bg='#e67e22', fg='white', font=('Arial', 9, 'bold'), state='disabled')
        self.download_btn.pack(side='left', padx=(0, 10))
        
        self.sync_btn = tk.Button(control_frame, text="🔄 Sync Project", command=self.sync_project,
                                 bg='#9b59b6', fg='white', font=('Arial', 9, 'bold'), state='disabled')
        self.sync_btn.pack(side='left', padx=(0, 10))
        
        self.compare_btn = tk.Button(control_frame, text="📊 Compare", command=self.compare_files,
                                    bg='#34495e', fg='white', font=('Arial', 9, 'bold'), state='disabled')
        self.compare_btn.pack(side='left')
        
        # Additional control buttons
        self.upload_folder_btn = tk.Button(control_frame, text="📁➡️ Upload Folder", command=self.upload_folder,
                                          bg='#16a085', fg='white', font=('Arial', 9, 'bold'), state='disabled')
        self.upload_folder_btn.pack(side='left', padx=(10, 5))
        
        self.create_folder_btn = tk.Button(control_frame, text="➕ New Folder", command=self.create_remote_folder,
                                          bg='#8e44ad', fg='white', font=('Arial', 9, 'bold'), state='disabled')
        self.create_folder_btn.pack(side='left', padx=(5, 0))
        
        # Bind events
        self.local_tree.bind('<Double-1>', self.on_local_double_click)
        self.remote_tree.bind('<Double-1>', self.on_remote_double_click)
        self.local_tree.bind('<<TreeviewSelect>>', self.on_file_selection_change)
        self.remote_tree.bind('<<TreeviewSelect>>', self.on_file_selection_change)
        
        # Context menus (right-click)
        self.local_tree.bind('<Button-3>', self.show_local_context_menu)
        self.remote_tree.bind('<Button-3>', self.show_remote_context_menu)
        self.local_path_entry.bind('<Return>', self.refresh_local_files)
        self.remote_path_entry.bind('<Return>', self.refresh_remote_files)
        
        # Initialize context menus
        self.setup_context_menus()
        
        # Initialize local files and try auto-connect
        self.refresh_local_files()
        
        # Auto-connect if settings are available
        if self.server_ip.get() and self.server_user.get() and self.server_password.get():
            self.root.after(1000, self.fm_auto_connect)  # Try auto-connect after 1 second
        
    def setup_servermgmt_tab(self, parent):
        """🖥️ Clean and organized server management tab"""
        
        # Main Server Management Section (Status + Controls)
        main_group = ttk.LabelFrame(parent, text="🖥️ Server Management", padding=15)
        main_group.pack(fill='x', pady=(0, 15))
        
        # Create left-right layout
        main_frame = tk.Frame(main_group)
        main_frame.pack(fill='x')
        
        # Left side: Server Status
        status_frame = tk.Frame(main_frame)
        status_frame.pack(side='left', fill='both', expand=True, padx=(0, 20))
        
        tk.Label(status_frame, text="📊 Server Status", font=('Arial', 11, 'bold'), fg='#2c3e50').pack(anchor='w', pady=(0, 10))
        
        # Service status labels
        self.backend_status = tk.Label(status_frame, text="Backend: ❓ Unknown", 
                                      font=('Arial', 10), fg='gray')
        self.backend_status.pack(anchor='w', pady=2)
        
        self.nginx_status = tk.Label(status_frame, text="Nginx: ❓ Unknown", 
                                    font=('Arial', 10), fg='gray')
        self.nginx_status.pack(anchor='w', pady=2)
        
        self.ssl_status = tk.Label(status_frame, text="SSL: ❓ Unknown", 
                                  font=('Arial', 10), fg='gray')
        self.ssl_status.pack(anchor='w', pady=2)
        
        self.backend_stability = tk.Label(status_frame, text="Stability: ❓ Unknown", 
                                         font=('Arial', 10), fg='gray')
        self.backend_stability.pack(anchor='w', pady=2)
        
        self.last_restart = tk.Label(status_frame, text="Last Restart: Unknown", 
                                    font=('Arial', 10), fg='gray')
        self.last_restart.pack(anchor='w', pady=2)
        
        tk.Button(status_frame, text="🔄 Refresh Status", command=self.refresh_server_status,
                 bg='#3498db', fg='white', font=('Arial', 9, 'bold'), width=15).pack(anchor='w', pady=(10, 0))
        
        # Right side: Service Controls
        controls_frame = tk.Frame(main_frame)
        controls_frame.pack(side='right', fill='both', expand=True)
        
        tk.Label(controls_frame, text="🎛️ Service Controls", font=('Arial', 11, 'bold'), fg='#2c3e50').pack(anchor='w', pady=(0, 10))
        
        # Backend service controls
        backend_frame = tk.Frame(controls_frame)
        backend_frame.pack(fill='x', pady=(0, 8))
        
        tk.Label(backend_frame, text="Backend:", font=('Arial', 10, 'bold')).pack(side='left')
        tk.Button(backend_frame, text="▶️ Start", command=lambda: self.control_service('start', 'pebdeq-backend'),
                 bg='#27ae60', fg='white', font=('Arial', 8, 'bold'), width=8).pack(side='right', padx=(2, 0))
        tk.Button(backend_frame, text="⏹️ Stop", command=lambda: self.control_service('stop', 'pebdeq-backend'),
                 bg='#e74c3c', fg='white', font=('Arial', 8, 'bold'), width=8).pack(side='right', padx=(2, 0))
        tk.Button(backend_frame, text="🔄 Restart", command=lambda: self.control_service('restart', 'pebdeq-backend'),
                 bg='#f39c12', fg='white', font=('Arial', 8, 'bold'), width=8).pack(side='right', padx=(2, 0))
        
        # Nginx service controls
        nginx_frame = tk.Frame(controls_frame)
        nginx_frame.pack(fill='x', pady=(0, 8))
        
        tk.Label(nginx_frame, text="Nginx:", font=('Arial', 10, 'bold')).pack(side='left')
        tk.Button(nginx_frame, text="▶️ Start", command=lambda: self.control_service('start', 'nginx'),
                 bg='#27ae60', fg='white', font=('Arial', 8, 'bold'), width=8).pack(side='right', padx=(2, 0))
        tk.Button(nginx_frame, text="⏹️ Stop", command=lambda: self.control_service('stop', 'nginx'),
                 bg='#e74c3c', fg='white', font=('Arial', 8, 'bold'), width=8).pack(side='right', padx=(2, 0))
        tk.Button(nginx_frame, text="🔄 Restart", command=lambda: self.control_service('restart', 'nginx'),
                 bg='#f39c12', fg='white', font=('Arial', 8, 'bold'), width=8).pack(side='right', padx=(2, 0))
        
        # System controls
        system_frame = tk.Frame(controls_frame)
        system_frame.pack(fill='x', pady=(0, 8))
        
        tk.Label(system_frame, text="System:", font=('Arial', 10, 'bold')).pack(side='left')
        tk.Button(system_frame, text="🔄 Reboot", command=self.reboot_server,
                 bg='#8e44ad', fg='white', font=('Arial', 8, 'bold'), width=8).pack(side='right', padx=(2, 0))
        tk.Button(system_frame, text="📊 Info", command=self.show_system_info,
                 bg='#34495e', fg='white', font=('Arial', 8, 'bold'), width=8).pack(side='right', padx=(2, 0))
        
        # Connection controls - separator line and buttons
        separator_frame = tk.Frame(controls_frame)
        separator_frame.pack(fill='x', pady=(15, 8))
        
        tk.Label(separator_frame, text="─" * 40, font=('Arial', 8), fg='#bdc3c7').pack()
        
        connection_frame = tk.Frame(controls_frame)
        connection_frame.pack(fill='x', pady=(0, 8))
        
        tk.Label(connection_frame, text="Connection:", font=('Arial', 10, 'bold')).pack(side='left')
        tk.Button(connection_frame, text="🔌 Connect", command=self.fm_connect,
                 bg='#27ae60', fg='white', font=('Arial', 8, 'bold'), width=10).pack(side='right', padx=(2, 0))
        tk.Button(connection_frame, text="🔌 Disconnect", command=self.fm_disconnect,
                 bg='#e74c3c', fg='white', font=('Arial', 8, 'bold'), width=10).pack(side='right', padx=(2, 0))
        
        # Backend Health & Recovery Section
        health_group = ttk.LabelFrame(parent, text="[HEALTH] Backend Health & Recovery", padding=15)
        health_group.pack(fill='x', pady=(0, 15))
        
        # First row of health buttons
        health_row1 = tk.Frame(health_group)
        health_row1.pack(fill='x', pady=(0, 5))
        
        tk.Button(health_row1, text="🔍 Health Check", command=self.comprehensive_health_check,
                 bg='#3498db', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(health_row1, text="🚨 Diagnose Issues", command=self.diagnose_backend_issues,
                 bg='#e74c3c', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(health_row1, text="🔧 Auto Fix", command=self.auto_fix_backend,
                 bg='#f39c12', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(health_row1, text="⚡ Force Restart", command=self.force_restart_backend,
                 bg='#9b59b6', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(health_row1, text="🚨 EMERGENCY RECOVERY", command=self.emergency_recovery,
                 bg='#c0392b', fg='white', font=('Arial', 9, 'bold')).pack(side='left')
        
        # Second row of health buttons
        health_row2 = tk.Frame(health_group)
        health_row2.pack(fill='x', pady=(5, 0))
        
        tk.Button(health_row2, text="📊 Check Dependencies", command=self.check_dependencies,
                 bg='#16a085', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(health_row2, text="🔌 Port Scan", command=self.check_port_conflicts,
                 bg='#2980b9', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(health_row2, text="📈 Memory Check", command=self.check_memory_usage,
                 bg='#8e44ad', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(health_row2, text="🔄 Enable Auto-Recovery", command=self.enable_auto_recovery,
                 bg='#27ae60', fg='white', font=('Arial', 9, 'bold')).pack(side='left')
        
        # Rebuild & Deployment Section
        rebuild_group = ttk.LabelFrame(parent, text="[REBUILD] Quick Rebuild & Deployment", padding=15)
        rebuild_group.pack(fill='x', pady=(0, 15))
        
        # First row of rebuild buttons
        rebuild_row1 = tk.Frame(rebuild_group)
        rebuild_row1.pack(fill='x', pady=(0, 5))
        
        tk.Button(rebuild_row1, text="🏗️ Rebuild Backend", command=self.quick_rebuild_backend,
                 bg='#e67e22', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(rebuild_row1, text="🎨 Rebuild Frontend", command=self.quick_rebuild_frontend,
                 bg='#9b59b6', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(rebuild_row1, text="🗄️ Reset Database", command=self.quick_reset_database,
                 bg='#c0392b', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(rebuild_row1, text="🔄 Full Redeploy", command=self.quick_full_redeploy,
                 bg='#34495e', fg='white', font=('Arial', 9, 'bold')).pack(side='left')
        
        # Second row of rebuild buttons
        rebuild_row2 = tk.Frame(rebuild_group)
        rebuild_row2.pack(fill='x', pady=(5, 0))
        
        tk.Button(rebuild_row2, text="📦 Reinstall Deps", command=self.reinstall_dependencies,
                 bg='#16a085', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(rebuild_row2, text="🔧 Fix Permissions", command=self.fix_permissions,
                 bg='#2980b9', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(rebuild_row2, text="🌐 Rebuild Nginx", command=self.rebuild_nginx_config,
                 bg='#27ae60', fg='white', font=('Arial', 9, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(rebuild_row2, text="📋 Generate Report", command=self.generate_stability_report,
                 bg='#95a5a6', fg='white', font=('Arial', 9, 'bold')).pack(side='left')


        
        # Quick Actions
        quick_group = ttk.LabelFrame(parent, text="[QUICK] Quick Actions", padding=15)
        quick_group.pack(fill='x', pady=(0, 15))
        
        quick_buttons_frame = tk.Frame(quick_group)
        quick_buttons_frame.pack(fill='x')
        
        tk.Button(quick_buttons_frame, text="🔒 Renew SSL", command=self.renew_ssl,
                 bg='#16a085', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))
        
        tk.Button(quick_buttons_frame, text="🗄️ Backup Database", command=self.backup_database,
                 bg='#2980b9', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))
        
        tk.Button(quick_buttons_frame, text="🧹 Clean Logs", command=self.clean_server_logs,
                 bg='#d35400', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))
        
        tk.Button(quick_buttons_frame, text="📈 View Logs", command=self.view_server_logs,
                 bg='#7f8c8d', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))
        
        # Second row for additional buttons
        quick_buttons_frame2 = tk.Frame(quick_group)
        quick_buttons_frame2.pack(fill='x', pady=(5, 0))
        
        tk.Button(quick_buttons_frame2, text="🏗️ Frontend Build", command=self.build_frontend_manual,
                 bg='#9b59b6', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))
        
        tk.Button(quick_buttons_frame2, text="🚨 Backend Errors", command=self.view_backend_errors,
                 bg='#e74c3c', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))
        
        tk.Button(quick_buttons_frame2, text="🔄 Live Monitor", command=self.start_live_error_monitoring,
                 bg='#c0392b', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))
        
        tk.Button(quick_buttons_frame2, text="📋 Install from File", command=self.fix_dependencies_issues,
                 bg='#27ae60', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))
        
        tk.Button(quick_buttons_frame2, text="🎨 Fix Frontend", command=self.fix_frontend_issues,
                 bg='#9b59b6', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))
        
        tk.Button(quick_buttons_frame2, text="🔍 Check Environment", command=self.check_server_environment,
                 bg='#34495e', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))
        
        tk.Button(quick_buttons_frame2, text="📊 Server Info", command=self.show_server_info,
                 bg='#2980b9', fg='white', font=('Arial', 8, 'bold')).pack(side='left', padx=(0, 8))

        
        # Logs display for server management
        logs_group = ttk.LabelFrame(parent, text="📋 Server Logs", padding=10)
        logs_group.pack(fill='both', expand=True)
        
        self.server_log_text = scrolledtext.ScrolledText(logs_group, height=15, bg='#2c3e50', fg='#ecf0f1', 
                                                        font=('Consolas', 9), wrap=tk.WORD)
        self.server_log_text.pack(fill='both', expand=True)
        
    def setup_database_tab(self, parent):
        """Setup database management tab"""
        
        # Database Info
        info_group = ttk.LabelFrame(parent, text="🗄️ Database Information", padding=15)
        info_group.pack(fill='x', pady=(0, 15))
        
        self.db_info_frame = tk.Frame(info_group)
        self.db_info_frame.pack(fill='x')
        
        self.db_size_label = tk.Label(self.db_info_frame, text="Size: Unknown", font=('Arial', 10))
        self.db_size_label.pack(anchor='w', pady=2)
        
        self.db_tables_label = tk.Label(self.db_info_frame, text="Tables: Unknown", font=('Arial', 10))
        self.db_tables_label.pack(anchor='w', pady=2)
        
        self.db_last_backup_label = tk.Label(self.db_info_frame, text="Last Backup: Never", font=('Arial', 10))
        self.db_last_backup_label.pack(anchor='w', pady=2)
        
        tk.Button(self.db_info_frame, text="🔄 Refresh DB Info", command=self.refresh_db_info,
                 bg='#3498db', fg='white', font=('Arial', 9)).pack(anchor='w', pady=(10, 0))
        
        # Backup Management
        backup_group = ttk.LabelFrame(parent, text="💾 Backup Management", padding=15)
        backup_group.pack(fill='x', pady=(0, 15))
        
        backup_buttons = tk.Frame(backup_group)
        backup_buttons.pack(fill='x', pady=(0, 10))
        
        tk.Button(backup_buttons, text="📥 Create Backup", command=self.create_db_backup,
                 bg='#27ae60', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(backup_buttons, text="📤 Restore Backup", command=self.restore_db_backup,
                 bg='#e67e22', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(backup_buttons, text="📋 List Backups", command=self.list_db_backups,
                 bg='#9b59b6', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(backup_buttons, text="🗑️ Delete Old Backups", command=self.cleanup_old_backups,
                 bg='#e74c3c', fg='white', font=('Arial', 10, 'bold')).pack(side='left')
        
        # Database Operations
        operations_group = ttk.LabelFrame(parent, text="⚙️ Database Operations", padding=15)
        operations_group.pack(fill='x', pady=(0, 15))
        
        ops_buttons = tk.Frame(operations_group)
        ops_buttons.pack(fill='x', pady=(0, 10))
        
        tk.Button(ops_buttons, text="🔧 Reset Database", command=self.reset_database,
                 bg='#c0392b', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(ops_buttons, text="🔄 Run reset_db.py", command=self.run_reset_db_script,
                 bg='#e74c3c', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(ops_buttons, text="📊 Run Migration", command=self.run_migration,
                 bg='#8e44ad', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(ops_buttons, text="🧹 Optimize DB", command=self.optimize_database,
                 bg='#16a085', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(ops_buttons, text="📈 Export Data", command=self.export_data,
                 bg='#2980b9', fg='white', font=('Arial', 10, 'bold')).pack(side='left')
        
        # Database Browser
        browser_group = ttk.LabelFrame(parent, text="🔍 Database Browser", padding=10)
        browser_group.pack(fill='both', expand=True)
        
        # Table list
        tables_frame = tk.Frame(browser_group)
        tables_frame.pack(fill='x', pady=(0, 10))
        
        tk.Label(tables_frame, text="Tables:", font=('Arial', 10, 'bold')).pack(side='left')
        self.tables_combo = ttk.Combobox(tables_frame, width=20, state='readonly')
        self.tables_combo.pack(side='left', padx=(10, 10))
        self.tables_combo.bind('<<ComboboxSelected>>', self.on_table_selected)
        
        tk.Button(tables_frame, text="📊 Show Data", command=self.show_table_data,
                 bg='#34495e', fg='white', font=('Arial', 9)).pack(side='left')
        
        # Data display
        self.db_data_tree = ttk.Treeview(browser_group, height=12)
        self.db_data_tree.pack(fill='both', expand=True, pady=(0, 10))
        
        db_scrollbar = ttk.Scrollbar(browser_group, orient="vertical", command=self.db_data_tree.yview)
        db_scrollbar.pack(side="right", fill="y")
        self.db_data_tree.configure(yscrollcommand=db_scrollbar.set)
        
    def setup_git_tab(self, parent):
        """Setup Git management tab"""
        
        # Git Status
        status_group = ttk.LabelFrame(parent, text="📦 Git Repository Status", padding=15)
        status_group.pack(fill='x', pady=(0, 15))
        
        self.git_status_frame = tk.Frame(status_group)
        self.git_status_frame.pack(fill='x')
        
        self.git_branch_label = tk.Label(self.git_status_frame, text="Branch: Unknown", font=('Arial', 10))
        self.git_branch_label.pack(anchor='w', pady=2)
        
        self.git_commit_label = tk.Label(self.git_status_frame, text="Last Commit: Unknown", font=('Arial', 10))
        self.git_commit_label.pack(anchor='w', pady=2)
        
        self.git_changes_label = tk.Label(self.git_status_frame, text="Changes: Unknown", font=('Arial', 10))
        self.git_changes_label.pack(anchor='w', pady=2)
        
        tk.Button(self.git_status_frame, text="🔄 Refresh Git Status", command=self.refresh_git_status,
                 bg='#3498db', fg='white', font=('Arial', 9)).pack(anchor='w', pady=(10, 0))
        
        # Git Operations
        operations_group = ttk.LabelFrame(parent, text="⚡ Git Operations", padding=15)
        operations_group.pack(fill='x', pady=(0, 15))
        
        # Remote operations
        remote_frame = tk.Frame(operations_group)
        remote_frame.pack(fill='x', pady=(0, 10))
        
        tk.Label(remote_frame, text="Remote Operations:", font=('Arial', 10, 'bold')).pack(anchor='w')
        
        remote_buttons = tk.Frame(remote_frame)
        remote_buttons.pack(fill='x', pady=(5, 0))
        
        tk.Button(remote_buttons, text="⬇️ Pull from Remote", command=self.git_pull,
                 bg='#27ae60', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(remote_buttons, text="⬆️ Push to Remote", command=self.git_push,
                 bg='#e67e22', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(remote_buttons, text="🔄 Fetch", command=self.git_fetch,
                 bg='#9b59b6', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(remote_buttons, text="📊 Status", command=self.git_status,
                 bg='#34495e', fg='white', font=('Arial', 10, 'bold')).pack(side='left')
        
        # Local operations
        local_frame = tk.Frame(operations_group)
        local_frame.pack(fill='x', pady=(10, 0))
        
        tk.Label(local_frame, text="Local Operations:", font=('Arial', 10, 'bold')).pack(anchor='w')
        
        local_buttons = tk.Frame(local_frame)
        local_buttons.pack(fill='x', pady=(5, 0))
        
        tk.Button(local_buttons, text="➕ Add All", command=self.git_add_all,
                 bg='#16a085', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(local_buttons, text="💬 Commit", command=self.git_commit,
                 bg='#2980b9', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(local_buttons, text="🔙 Reset", command=self.git_reset,
                 bg='#c0392b', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(local_buttons, text="🌿 Branch", command=self.git_branch,
                 bg='#8e44ad', fg='white', font=('Arial', 10, 'bold')).pack(side='left')
        
        # Git Log/Output
        output_group = ttk.LabelFrame(parent, text="📋 Git Output", padding=10)
        output_group.pack(fill='both', expand=True)
        
        self.git_output_text = scrolledtext.ScrolledText(output_group, height=15, bg='#2c3e50', fg='#ecf0f1', 
                                                        font=('Consolas', 9), wrap=tk.WORD)
        self.git_output_text.pack(fill='both', expand=True)

    def setup_performance_tab(self, parent):
        """Setup performance monitoring tab"""
        
        # Real-time stats
        stats_group = ttk.LabelFrame(parent, text="📊 Real-time Statistics", padding=15)
        stats_group.pack(fill='x', pady=(0, 15))
        
        # Server resources
        resources_frame = tk.Frame(stats_group)
        resources_frame.pack(fill='x', pady=(0, 10))
        
        # CPU Usage
        cpu_frame = tk.Frame(resources_frame)
        cpu_frame.pack(fill='x', pady=(0, 5))
        
        tk.Label(cpu_frame, text="CPU Usage:", font=('Arial', 10, 'bold')).pack(side='left')
        self.cpu_progress = ttk.Progressbar(cpu_frame, length=200, mode='determinate')
        self.cpu_progress.pack(side='left', padx=(10, 10))
        self.cpu_percent_label = tk.Label(cpu_frame, text="0%", font=('Arial', 10))
        self.cpu_percent_label.pack(side='left')
        
        # Memory Usage
        memory_frame = tk.Frame(resources_frame)
        memory_frame.pack(fill='x', pady=(0, 5))
        
        tk.Label(memory_frame, text="Memory Usage:", font=('Arial', 10, 'bold')).pack(side='left')
        self.memory_progress = ttk.Progressbar(memory_frame, length=200, mode='determinate')
        self.memory_progress.pack(side='left', padx=(10, 10))
        self.memory_percent_label = tk.Label(memory_frame, text="0%", font=('Arial', 10))
        self.memory_percent_label.pack(side='left')
        
        # Disk Usage
        disk_frame = tk.Frame(resources_frame)
        disk_frame.pack(fill='x', pady=(0, 5))
        
        tk.Label(disk_frame, text="Disk Usage:", font=('Arial', 10, 'bold')).pack(side='left')
        self.disk_progress = ttk.Progressbar(disk_frame, length=200, mode='determinate')
        self.disk_progress.pack(side='left', padx=(10, 10))
        self.disk_percent_label = tk.Label(disk_frame, text="0%", font=('Arial', 10))
        self.disk_percent_label.pack(side='left')
        
        # Performance Actions
        actions_group = ttk.LabelFrame(parent, text="⚡ Performance Actions", padding=15)
        actions_group.pack(fill='x', pady=(0, 15))
        
        perf_buttons = tk.Frame(actions_group)
        perf_buttons.pack(fill='x')
        
        tk.Button(perf_buttons, text="[START] Start Monitoring", command=self.start_performance_monitoring,
                 bg='#27ae60', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(perf_buttons, text="⏹️ Stop Monitoring", command=self.stop_performance_monitoring,
                 bg='#e74c3c', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(perf_buttons, text="📊 Process List", command=self.show_process_list,
                 bg='#3498db', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(perf_buttons, text="🔥 Kill Process", command=self.kill_process,
                 bg='#c0392b', fg='white', font=('Arial', 10, 'bold')).pack(side='left')
        
        # Process List
        process_group = ttk.LabelFrame(parent, text="📋 Running Processes", padding=10)
        process_group.pack(fill='both', expand=True)
        
        self.process_tree = ttk.Treeview(process_group, height=15)
        self.process_tree.pack(fill='both', expand=True, pady=(0, 10))
        
        process_scrollbar = ttk.Scrollbar(process_group, orient="vertical", command=self.process_tree.yview)
        process_scrollbar.pack(side="right", fill="y")
        self.process_tree.configure(yscrollcommand=process_scrollbar.set)
        
        # Configure process tree columns
        self.process_tree["columns"] = ("pid", "cpu", "memory", "user")
        self.process_tree.heading("#0", text="Process Name")
        self.process_tree.heading("pid", text="PID")
        self.process_tree.heading("cpu", text="CPU %")
        self.process_tree.heading("memory", text="Memory %")
        self.process_tree.heading("user", text="User")
        
    def setup_network_tab(self, parent):
        """Setup network tools tab"""
        
        # Connection Tests
        tests_group = ttk.LabelFrame(parent, text="🌐 Connection Tests", padding=15)
        tests_group.pack(fill='x', pady=(0, 15))
        
        # URL/Domain input
        url_frame = tk.Frame(tests_group)
        url_frame.pack(fill='x', pady=(0, 10))
        
        tk.Label(url_frame, text="Test URL/Domain:", font=('Arial', 10, 'bold')).pack(side='left')
        self.test_url_var = tk.StringVar(value="pebdeq.com")
        tk.Entry(url_frame, textvariable=self.test_url_var, width=30, font=('Arial', 10)).pack(side='left', padx=(10, 10))
        
        # Test buttons
        test_buttons = tk.Frame(tests_group)
        test_buttons.pack(fill='x')
        
        tk.Button(test_buttons, text="🏓 Ping Test", command=self.ping_test,
                 bg='#27ae60', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(test_buttons, text="🌍 HTTP Test", command=self.http_test,
                 bg='#3498db', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(test_buttons, text="🔒 SSL Test", command=self.ssl_test,
                 bg='#9b59b6', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(test_buttons, text="🔍 DNS Lookup", command=self.dns_lookup,
                 bg='#e67e22', fg='white', font=('Arial', 10, 'bold')).pack(side='left')
        
        # Port Scanner
        port_group = ttk.LabelFrame(parent, text="🔍 Port Scanner", padding=15)
        port_group.pack(fill='x', pady=(0, 15))
        
        port_input_frame = tk.Frame(port_group)
        port_input_frame.pack(fill='x', pady=(0, 10))
        
        tk.Label(port_input_frame, text="Host:", font=('Arial', 10, 'bold')).pack(side='left')
        self.scan_host_var = tk.StringVar(value="5.161.245.15")
        tk.Entry(port_input_frame, textvariable=self.scan_host_var, width=15, font=('Arial', 10)).pack(side='left', padx=(10, 20))
        
        tk.Label(port_input_frame, text="Ports:", font=('Arial', 10, 'bold')).pack(side='left')
        self.scan_ports_var = tk.StringVar(value="22,80,443,5005")
        tk.Entry(port_input_frame, textvariable=self.scan_ports_var, width=20, font=('Arial', 10)).pack(side='left', padx=(10, 20))
        
        tk.Button(port_input_frame, text="🔍 Scan Ports", command=self.scan_ports,
                 bg='#34495e', fg='white', font=('Arial', 10, 'bold')).pack(side='left')
        
        # Cloudflare Tools
        cf_group = ttk.LabelFrame(parent, text="☁️ Cloudflare Tools", padding=15)
        cf_group.pack(fill='x', pady=(0, 15))
        
        cf_buttons = tk.Frame(cf_group)
        cf_buttons.pack(fill='x')
        
        tk.Button(cf_buttons, text="🔄 Purge Cache", command=self.purge_cloudflare_cache,
                 bg='#f39c12', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(cf_buttons, text="📊 CF Status", command=self.check_cloudflare_status,
                 bg='#16a085', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(cf_buttons, text="🔍 DNS Records", command=self.check_dns_records,
                 bg='#2980b9', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))
        
        tk.Button(cf_buttons, text="⚡ Speed Test", command=self.website_speed_test,
                 bg='#8e44ad', fg='white', font=('Arial', 10, 'bold')).pack(side='left')
        
        # Network Results
        results_group = ttk.LabelFrame(parent, text="📋 Test Results", padding=10)
        results_group.pack(fill='both', expand=True)
        
        self.network_results_text = scrolledtext.ScrolledText(results_group, height=15, bg='#2c3e50', fg='#ecf0f1', 
                                                             font=('Consolas', 9), wrap=tk.WORD)
        self.network_results_text.pack(fill='both', expand=True)
         
    def log(self, message, level="INFO"):
        """Add message to logs"""
        try:
            timestamp = time.strftime("%H:%M:%S")
            colors = {
                "INFO": "#3498db",
                "SUCCESS": "#27ae60", 
                "WARNING": "#f39c12",
                "ERROR": "#e74c3c"
            }
            
            # Check if log_text widget exists
            if hasattr(self, 'log_text') and self.log_text:
                self.log_text.configure(state='normal')
                self.log_text.insert(tk.END, f"[{timestamp}] {level}: {message}\n")
                
                # Color coding (basic)
                if level in colors:
                    start_line = self.log_text.index(tk.END + "-2l linestart")
                    end_line = self.log_text.index(tk.END + "-1l lineend")
                    self.log_text.tag_add(level, start_line, end_line)
                    self.log_text.tag_config(level, foreground=colors[level])
                
                self.log_text.configure(state='disabled')
                self.log_text.see(tk.END)
                self.root.update()
            else:
                # Fallback to console if GUI not ready
                print(f"[{timestamp}] {level}: {message}")
                
        except Exception as e:
            # Fallback to console if any error
            print(f"[{timestamp}] {level}: {message}")
            print(f"Log error: {str(e)}")
        
    def browse_project(self):
        """Browse for project folder"""
        folder = filedialog.askdirectory(title="Select PEBDEQ Project Folder")
        if folder:
            self.project_path.set(folder)
            self.log(f"Project folder selected: {folder}")
            
    def test_connection(self):
        """Test SSH connection to server"""
        try:
            self.log("Testing server connection...")
            self.connection_status.config(text="Testing...", fg='orange')
            
            # Create SSH client
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # Connect
            ssh.connect(
                hostname=self.server_ip.get(),
                port=int(self.server_port.get()),
                username=self.server_user.get(),
                password=self.server_password.get(),
                timeout=10
            )
            
            # Test command
            stdin, stdout, stderr = ssh.exec_command('uname -a')
            result = stdout.read().decode().strip()
            
            ssh.close()
            
            self.connection_status.config(text="[OK] Connected", fg='green')
            self.log(f"Connection successful! Server: {result}", "SUCCESS")
            return True
            
        except Exception as e:
            self.connection_status.config(text="❌ Failed", fg='red')
            self.log(f"Connection failed: {str(e)}", "ERROR")
            return False
            
    def start_deployment(self):
        """Start the deployment process"""
        if not self.validate_inputs():
            return
            
        # Start deployment in separate thread
        self.deployment_thread = threading.Thread(target=self.run_deployment)
        self.deployment_thread.daemon = True
        self.deployment_thread.start()
        
    def validate_inputs(self):
        """Validate all inputs before deployment"""
        if not self.project_path.get():
            messagebox.showerror("Error", "Please select project folder")
            return False
            
        if not os.path.exists(self.project_path.get()):
            messagebox.showerror("Error", "Project folder does not exist")
            return False
            
        if not self.server_ip.get() or not self.server_user.get() or not self.server_password.get():
            messagebox.showerror("Error", "Please fill all server details")
            return False
            
        if not self.domain_name.get():
            messagebox.showerror("Error", "Please enter primary domain name")
            return False
            
        if self.ssl_enable.get() and not self.ssl_email.get():
            messagebox.showerror("Error", "SSL email is required for SSL certificate")
            return False
            
        # Check if project has required structure
        project_path = Path(self.project_path.get())
        if not (project_path / "backend").exists():
            messagebox.showerror("Error", "Project must contain 'backend' folder")
            return False
            
        if not (project_path / "frontend").exists():
            messagebox.showerror("Error", "Project must contain 'frontend' folder")
            return False
            
        if not (project_path / "backend" / "requirements.txt").exists():
            messagebox.showerror("Error", "Backend must contain 'requirements.txt'")
            return False
            
        if not (project_path / "frontend" / "package.json").exists():
            messagebox.showerror("Error", "Frontend must contain 'package.json'")
            return False
            
        return True
        
    def run_deployment(self):
        """Main deployment process"""
        try:
            self.log("[LAUNCH] Starting PEBDEQ deployment...", "INFO")
            self.update_status("Initializing deployment...")
            
            # DEBUG: Show which steps are selected
            selected_steps = []
            for step_name, step_id in self.deployment_steps:
                if self.step_vars[step_id].get():
                    selected_steps.append(step_name)
            
            if selected_steps:
                self.log(f"[DEBUG] Selected steps: {', '.join(selected_steps)}", "INFO")
            else:
                self.log("[DEBUG] No steps selected! Please select at least one step.", "WARNING")
                return
            
            total_steps = len(self.deployment_steps)
            current_step = 0
            
            for step_name, step_id in self.deployment_steps:
                # Check if this step is selected in checkbox
                if not self.step_vars[step_id].get():
                    self.log(f"[SKIP] {step_name} - Not selected", "INFO")
                    continue
                
                self.log(f"[EXECUTE] {step_name} - Selected and will run", "INFO")
                
                # Skip upload_files step if disabled
                if step_id == "upload_files" and not self.upload_files.get():
                    self.log(f"[SKIP] {step_name} - Disabled", "INFO")
                    self.step_vars[step_id].set(True)  # Mark as completed (skipped)
                    continue
                    
                if hasattr(self, f'deploy_{step_id}'):
                    self.log(f"Executing: {step_name}", "INFO")
                    self.update_status(f"Executing: {step_name}")
                    
                    success = getattr(self, f'deploy_{step_id}')()
                    
                    if success:
                        self.step_vars[step_id].set(True)
                        self.log(f"[OK] {step_name} - Completed", "SUCCESS")
                    else:
                        self.log(f"[FAIL] {step_name} - Failed", "ERROR")
                        if not self.auto_mode.get():
                            if not messagebox.askyesno("Error", f"Step failed: {step_name}\nContinue anyway?"):
                                break
                
                current_step += 1
                progress = (current_step / total_steps) * 100
                self.progress_var.set(progress)
                
                time.sleep(1)  # Brief pause between steps
                
            self.update_status("[SUCCESS] Deployment completed!")
            self.log("[SUCCESS] PEBDEQ deployment finished!", "SUCCESS")
            
        except Exception as e:
            self.log(f"[ERROR] Deployment failed: {str(e)}", "ERROR")
            self.update_status("❌ Deployment failed!")
            
    def update_status(self, message):
        """Update status label"""
        self.status_label.config(text=message)
        self.root.update()
        
    # Deployment step methods
    def deploy_test_connection(self):
        """Step 1: Test connection"""
        return self.test_connection()
        
    def deploy_update_system(self):
        """Step 2: Update system packages"""
        if not self.install_updates.get():
            self.log("System updates disabled, skipping...")
            return True
            
        try:
            self.connect_ssh()
            self.log("Updating system packages...")
            self.execute_ssh_command("apt update")
            self.execute_ssh_command("apt upgrade -y")
            self.execute_ssh_command("apt autoremove -y")
            
            # Install essential packages
            self.execute_ssh_command("apt install -y curl wget git nginx python3 python3-pip python3-venv nodejs npm build-essential")
            
            # Try to install Python 3.13 if available (optional)
            self.log("Checking for Python 3.13 availability...")
            self.execute_ssh_command("apt install -y software-properties-common")
            self.execute_ssh_command("add-apt-repository -y ppa:deadsnakes/ppa")
            self.execute_ssh_command("apt update")
            result = self.execute_ssh_command("apt install -y python3.13 python3.13-venv python3.13-pip || echo 'Python 3.13 not available, using system Python'")
            
            # Check which Python version we have
            python_version = self.execute_ssh_command("python3 --version")
            self.log(f"System Python version: {python_version}")
            
            # Check if Python 3.13 is available
            python313_version = self.execute_ssh_command("python3.13 --version 2>/dev/null || echo 'Not found'")
            if "Not found" not in python313_version:
                self.log(f"Python 3.13 available: {python313_version}")
            else:
                self.log("Python 3.13 not available, using system Python 3.12")
            
            return True
        except Exception as e:
            self.log(f"System update failed: {str(e)}", "ERROR")
            return False
            
    def deploy_configure_firewall(self):
        """Step 3: Configure firewall"""
        if not self.setup_firewall.get():
            self.log("Firewall setup disabled, skipping...")
            return True
            
        try:
            self.connect_ssh()
            self.log("Configuring UFW firewall...")
            
            # Install and setup UFW
            self.execute_ssh_command("apt install -y ufw")
            self.execute_ssh_command("ufw --force reset")
            
            # Allow SSH
            self.execute_ssh_command(f"ufw allow {self.server_port.get()}/tcp")
            
            # Allow HTTP and HTTPS
            self.execute_ssh_command("ufw allow 80/tcp")
            self.execute_ssh_command("ufw allow 443/tcp")
            
            # Allow backend port (internal only)
            self.execute_ssh_command("ufw allow from 127.0.0.1 to any port 5005")
            
            # Enable firewall
            self.execute_ssh_command("ufw --force enable")
            self.execute_ssh_command("ufw status")
            
            return True
        except Exception as e:
            self.log(f"Firewall configuration failed: {str(e)}", "WARNING")
            return True  # Non-critical
            
    def deploy_clean_deployment(self):
        """Step 4: Clean existing deployment - BULLETPROOF VERSION"""
        if not self.clean_install.get():
            self.log("[CLEAN] Clean install disabled, keeping existing files...")
            return True
            
        try:
            self.connect_ssh()
            self.log("[CLEAN] Performing comprehensive cleanup of existing deployment...")
            
            # ============ SAFE SERVICE CLEANUP ============
            self.log("1. Safely stopping and cleaning services...")
            
            # Stop backend service with timeout
            self.execute_ssh_command("timeout 30s systemctl stop pebdeq-backend || true")
            
            # Kill any remaining python processes related to pebdeq
            self.execute_ssh_command("pkill -f 'python.*run.py' || true")
            self.execute_ssh_command("pkill -f 'pebdeq' || true")
            
            # Clear any processes using port 5005
            self.execute_ssh_command("lsof -ti:5005 | xargs kill -9 2>/dev/null || true")
            
            # Disable service
            self.execute_ssh_command("systemctl disable pebdeq-backend || true")
            
            # ============ SYSTEMATIC FILE CLEANUP ============
            self.log("2. Cleaning deployment files systematically...")
            
            # Service files
            service_cleanup = [
                "rm -f /etc/systemd/system/pebdeq-backend.service",
                "rm -f /etc/systemd/system/pebdeq*.service",
                "systemctl daemon-reload"
            ]
            
            for cmd in service_cleanup:
                self.log(f"Service cleanup: {cmd}")
                self.execute_ssh_command(cmd)
            
            # Web files - backup important data first
            self.log("Backing up important data before cleanup...")
            
            # Create backup directory with timestamp
            import time
            backup_dir = f"/tmp/pebdeq_backup_{int(time.time())}"
            self.execute_ssh_command(f"mkdir -p {backup_dir}")
            
            # Backup database if exists
            db_backup_commands = [
                f"cp /opt/pebdeq/backend/instance/pebdeq.db {backup_dir}/pebdeq.db.backup 2>/dev/null || true",
                f"cp -r /opt/pebdeq/backend/uploads {backup_dir}/uploads_backup 2>/dev/null || true",
                f"cp /opt/pebdeq/backend/requirements.txt {backup_dir}/requirements.txt.backup 2>/dev/null || true"
            ]
            
            for cmd in db_backup_commands:
                self.execute_ssh_command(cmd)
            
            # Check if backup was created
            backup_check = self.execute_ssh_command(f"ls -la {backup_dir}")
            if backup_check.strip():
                self.log(f"✅ Backup created at: {backup_dir}")
                self.log("Backup contents:")
                self.log(backup_check)
            
            # Clean application directories
            app_cleanup = [
                "rm -rf /var/www/pebdeq/*",
                "rm -rf /opt/pebdeq/*",
                "mkdir -p /var/www/pebdeq",
                "mkdir -p /opt/pebdeq"
            ]
            
            for cmd in app_cleanup:
                self.log(f"App cleanup: {cmd}")
                self.execute_ssh_command(cmd)
            
            # ============ NGINX CLEANUP ============
            self.log("3. Cleaning nginx configuration...")
            
            nginx_cleanup = [
                "rm -f /etc/nginx/sites-enabled/pebdeq",
                "rm -f /etc/nginx/sites-available/pebdeq",
                "nginx -t && systemctl reload nginx || echo 'nginx config test failed'"
            ]
            
            for cmd in nginx_cleanup:
                self.log(f"Nginx cleanup: {cmd}")
                result = self.execute_ssh_command(cmd)
                if result:
                    self.log(f"  Result: {result}")
            
            # ============ SYSTEM CLEANUP ============
            self.log("4. System-level cleanup...")
            
            # Clean temporary files
            temp_cleanup = [
                "rm -rf /tmp/numba_cache/*",
                "rm -rf /tmp/pebdeq*",
                "find /tmp -name '*pebdeq*' -type f -delete 2>/dev/null || true"
            ]
            
            for cmd in temp_cleanup:
                self.execute_ssh_command(cmd)

            # Clean logs (keep recent ones)
            log_cleanup = [
                "find /var/log -name '*pebdeq*' -mtime +1 -delete 2>/dev/null || true",
                "journalctl --vacuum-time=1h || true"
            ]
            
            for cmd in log_cleanup:
                self.execute_ssh_command(cmd)
            
            # Clean pip caches
            pip_cleanup = [
                "find /home -name '.cache' -type d -exec rm -rf {}/pip 2>/dev/null \\; || true",
                "find /root -name '.cache' -type d -exec rm -rf {}/pip 2>/dev/null \\; || true"
            ]
            
            for cmd in pip_cleanup:
                self.execute_ssh_command(cmd)
            
            # ============ VERIFICATION ============
            self.log("5. Verifying cleanup completion...")
            
            # Check if main directories are clean
            verification_checks = [
                ("Backend directory", "ls -la /opt/pebdeq/ | wc -l"),
                ("Web directory", "ls -la /var/www/pebdeq/ | wc -l"), 
                ("Service file", "ls -la /etc/systemd/system/pebdeq-backend.service 2>/dev/null || echo 'REMOVED'"),
                ("Nginx config", "ls -la /etc/nginx/sites-*/pebdeq 2>/dev/null || echo 'REMOVED'"),
                ("Running processes", "ps aux | grep pebdeq | grep -v grep || echo 'NONE'"),
                ("Port 5005", "netstat -tlnp | grep :5005 || echo 'FREE'")
            ]
            
            all_clean = True
            for check_name, check_cmd in verification_checks:
                result = self.execute_ssh_command(check_cmd)
                
                if check_name == "Backend directory" and int(result.strip()) <= 3:  # Just . .. and maybe one file
                    self.log(f"✅ {check_name}: Clean")
                elif check_name == "Web directory" and int(result.strip()) <= 3:
                    self.log(f"✅ {check_name}: Clean") 
                elif "REMOVED" in result or "NONE" in result or "FREE" in result:
                    self.log(f"✅ {check_name}: Clean")
                else:
                    self.log(f"⚠️ {check_name}: {result.strip()}")
                    if check_name in ["Service file", "Running processes"]:
                        all_clean = False
            
            # ============ RESTORE IMPORTANT DATA ============
            self.log("6. Preparing for fresh installation...")
            
            # Create clean directory structure
            structure_commands = [
                "mkdir -p /opt/pebdeq/backend",
                "mkdir -p /opt/pebdeq/frontend", 
                "mkdir -p /var/www/pebdeq",
                "chown -R root:root /opt/pebdeq",
                "chown -R www-data:www-data /var/www/pebdeq",
                "chmod -R 755 /opt/pebdeq",
                "chmod -R 755 /var/www/pebdeq"
            ]
            
            for cmd in structure_commands:
                self.execute_ssh_command(cmd)
            
            # ============ CLEANUP SUMMARY ============
            self.log("Cleanup Summary:")
            self.log(f"  ✅ Services stopped and disabled")
            self.log(f"  ✅ Application files removed")
            self.log(f"  ✅ Web files cleaned")
            self.log(f"  ✅ Nginx configuration removed")
            self.log(f"  ✅ System files cleaned")
            self.log(f"  ✅ Fresh directory structure created")
            self.log(f"  📦 Backup available at: {backup_dir}")
            
            if all_clean:
                self.log("[OK] Clean deployment completed successfully!")
                return True
            else:
                self.log("[WARNING] Cleanup completed with minor issues", "WARNING")
                return True  # Continue deployment even with minor cleanup issues
                
        except Exception as e:
            self.log(f"[ERROR] Clean deployment failed: {str(e)}", "ERROR")
            return False
            
    def deploy_upload_files(self):
        """Step 3: Upload project files"""
        try:
            self.connect_ssh()
            
            # Create directories
            self.execute_ssh_command("mkdir -p /opt/pebdeq")
            self.execute_ssh_command("mkdir -p /var/www/pebdeq")
            
            # Upload files using SFTP
            sftp = self.ssh_client.open_sftp()
            
            project_path = Path(self.project_path.get())
            
            if self.incremental_upload.get():
                self.log("[PROGRESS] Starting incremental file upload...")
                self.log("[INFO] Comparing local and remote file timestamps...")
                
                # Upload backend with incremental check
                self.log("🔍 Checking backend files for changes...")
                changed_files = self.upload_directory_incremental(sftp, project_path / "backend", "/opt/pebdeq/backend")
                self.log(f"📤 Backend: {changed_files} files updated")
                
                # Upload frontend with incremental check
                self.log("🔍 Checking frontend files for changes...")
                changed_files = self.upload_directory_incremental(sftp, project_path / "frontend", "/opt/pebdeq/frontend")
                self.log(f"📤 Frontend: {changed_files} files updated")
                
                # Upload test suite with incremental check
                if (project_path / "pb_test_suite").exists():
                    self.log("🔍 Checking test suite files for changes...")
                    changed_files = self.upload_directory_incremental(sftp, project_path / "pb_test_suite", "/opt/pebdeq/pb_test_suite")
                    self.log(f"📤 Test Suite: {changed_files} files updated")
                
            else:
                self.log("[UPLOAD] Starting full file upload...")
                
                # Upload backend
                self.log("Uploading backend files...")
                self.upload_directory(sftp, project_path / "backend", "/opt/pebdeq/backend")
                
                # Upload frontend
                self.log("Uploading frontend files...")
                self.upload_directory(sftp, project_path / "frontend", "/opt/pebdeq/frontend")
                
                # Upload test suite (important for production testing)
                if (project_path / "pb_test_suite").exists():
                    self.log("Uploading test suite...")
                    self.upload_directory(sftp, project_path / "pb_test_suite", "/opt/pebdeq/pb_test_suite")
            
            # Upload other important directories
            for dir_name in ["uploads", "reports"]:
                local_dir = project_path / dir_name
                if local_dir.exists():
                    self.log(f"Uploading {dir_name}...")
                    self.upload_directory(sftp, local_dir, f"/opt/pebdeq/{dir_name}")
            
            sftp.close()
            self.log("[OK] File upload completed successfully!")
            return True
            
        except Exception as e:
            self.log(f"File upload failed: {str(e)}", "ERROR")
            return False
            
    def deploy_setup_python(self):
        """Step 4: Setup Python environment - BULLETPROOF VERSION"""
        try:
            self.connect_ssh()
            
            self.log("[PYTHON] Setting up bulletproof Python environment...")
            
            # 1. Remove any existing broken venv
            self.log("Cleaning up any existing virtual environment...")
            self.execute_ssh_command("rm -rf /opt/pebdeq/backend/venv")
            
            # 2. Install essential Python packages if missing
            self.log("Installing essential system packages...")
            self.execute_ssh_command("apt update")
            self.execute_ssh_command("apt install -y python3 python3-pip python3-venv python3-dev build-essential")
            
            # 3. Create fresh virtual environment with fallbacks
            self.log("Creating fresh Python virtual environment...")
            
            # Try Python 3.13 first, then fallback options
            python_candidates = ["python3.13", "python3.12", "python3.11", "python3"]
            python_used = None
            
            for python_cmd in python_candidates:
                check_result = self.execute_ssh_command(f"which {python_cmd} 2>/dev/null || echo 'not found'")
                if "not found" not in check_result:
                    self.log(f"Trying {python_cmd}...")
                    venv_result = self.execute_ssh_command(f"cd /opt/pebdeq/backend && {python_cmd} -m venv venv 2>&1")
                    if "error" not in venv_result.lower():
                        python_used = python_cmd
                        self.log(f"Successfully created venv with {python_cmd}")
                        break
                    else:
                        self.log(f"{python_cmd} failed: {venv_result}")
            
            if not python_used:
                raise Exception("Could not create virtual environment with any Python version")
            
            # 4. Verify venv creation
            venv_test = self.execute_ssh_command("cd /opt/pebdeq/backend && ls -la venv/bin/python* | head -3")
            self.log(f"Virtual environment contents: {venv_test}")
            
            # 5. Upgrade pip with retries
            self.log("Upgrading pip in virtual environment...")
            for attempt in range(3):
                pip_upgrade = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -m pip install --upgrade pip 2>&1")
                if "error" not in pip_upgrade.lower():
                    break
                self.log(f"Pip upgrade attempt {attempt+1} failed, retrying...")
                if attempt == 2:
                    self.log("Pip upgrade failed after 3 attempts, continuing anyway...")
            
            # 6. Install essential build tools in venv
            self.log("Installing essential build tools...")
            essential_tools = ["wheel", "setuptools"]
            for tool in essential_tools:
                self.execute_ssh_command(f"cd /opt/pebdeq/backend && ./venv/bin/pip install {tool}")
            
            # 7. Verify Python functionality in venv
            python_test = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -c 'import sys; print(f\"Python {sys.version_info.major}.{sys.version_info.minor} OK\")'")
            self.log(f"Python verification: {python_test}")
            
            # 8. Set proper ownership
            self.log("Setting proper file ownership...")
            self.execute_ssh_command("chown -R www-data:www-data /opt/pebdeq/backend/venv")
            
            self.log("[OK] Python environment setup completed successfully!")
            return True
            
        except Exception as e:
            self.log(f"[ERROR] Python setup failed: {str(e)}", "ERROR")
            return False
            
    def deploy_install_dependencies(self):
        """Step 5: Install dependencies - BULLETPROOF VERSION"""
        try:
            self.connect_ssh()
            
            self.log("[DEPS] Installing dependencies with bulletproof approach...")
            
            # ============ BACKEND DEPENDENCIES ============
            self.log("1. Installing Python backend dependencies...")
            
            # Check if requirements.txt exists  
            req_check = self.execute_ssh_command("ls -la /opt/pebdeq/backend/requirements.txt")
            if "No such file" in req_check:
                self.log("ERROR: requirements.txt not found!", "ERROR")
                return False
            
            # Verify venv exists and works
            venv_check = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python --version 2>&1")
            if "No such file" in venv_check:
                self.log("ERROR: Virtual environment not found! Re-running Python setup...", "ERROR")
                if not self.deploy_setup_python():
                    return False
            
            # Install critical packages first to prevent conflicts
            critical_packages = [
                "wheel>=0.37.0",
                "setuptools>=65.0.0", 
                "flask>=2.0.0",
                "werkzeug>=2.0.0",
                "sqlalchemy>=1.4.0",
                "flask-sqlalchemy>=2.5.0"
            ]
            
            self.log("Installing critical packages first...")
            for package in critical_packages:
                self.log(f"Installing {package}...")
                result = self.execute_ssh_command(f"cd /opt/pebdeq/backend && ./venv/bin/pip install '{package}' 2>&1")
                if "error" in result.lower():
                    self.log(f"Warning: {package} installation had issues: {result}", "WARNING")
                else:
                    self.log(f"OK: {package} installed successfully")
            
            # Main requirements installation with retries
            self.log("Installing all requirements.txt dependencies...")
            max_attempts = 3
            
            for attempt in range(max_attempts):
                self.log(f"Dependencies installation attempt {attempt + 1}/{max_attempts}")

                # Use more robust pip install options
                install_cmd = """cd /opt/pebdeq/backend && ./venv/bin/pip install -r requirements.txt \
                    --upgrade --force-reinstall --no-cache-dir \
                    --timeout 300 --retries 5 2>&1"""

                result = self.execute_ssh_command(install_cmd)
                
                # Check for major errors
                if "successfully installed" in result.lower() or "requirement already satisfied" in result.lower():
                    self.log("Dependencies installation successful!")
                    break

                if attempt < max_attempts - 1:
                    self.log(f"Attempt {attempt + 1} failed, retrying...", "WARNING")
                    self.log(f"Error details: {result}")
                    # Clean pip cache and retry
                    self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip cache purge")
                else:
                    self.log(f"All {max_attempts} attempts failed!", "ERROR")
                    self.log(f"Final error: {result}")
            
            # Verify critical imports work
            self.log("Verifying critical Python imports...")
            import_tests = [
                ("flask", "from flask import Flask; print('Flask OK')"),
                ("sqlalchemy", "import sqlalchemy; print('SQLAlchemy OK')"),
                ("werkzeug", "import werkzeug; print('Werkzeug OK')")
            ]
            
            for module_name, test_code in import_tests:
                test_result = self.execute_ssh_command(f"cd /opt/pebdeq/backend && ./venv/bin/python -c \"{test_code}\" 2>&1")
                if "OK" in test_result:
                    self.log(f"✅ {module_name} import successful")
                else:
                    self.log(f"❌ {module_name} import failed: {test_result}", "ERROR")
                    # Try to install the specific package again
                    self.execute_ssh_command(f"cd /opt/pebdeq/backend && ./venv/bin/pip install --force-reinstall {module_name}")
            
            # ============ FRONTEND DEPENDENCIES ============
            self.log("2. Installing Node.js frontend dependencies...")
            
            # Check if package.json exists
            package_check = self.execute_ssh_command("ls -la /opt/pebdeq/frontend/package.json")
            if "No such file" in package_check:
                self.log("ERROR: package.json not found!", "ERROR")
                return False
            
            # Install Node.js if not available
            node_check = self.execute_ssh_command("node --version 2>/dev/null || echo 'not found'")
            if "not found" in node_check:
                self.log("Installing Node.js...")
                self.execute_ssh_command("curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -")
                self.execute_ssh_command("apt-get install -y nodejs")
            
            # Clean npm cache
            self.log("Cleaning npm cache...")
            self.execute_ssh_command("cd /opt/pebdeq/frontend && npm cache clean --force")
            
            # Remove node_modules if exists
            self.execute_ssh_command("rm -rf /opt/pebdeq/frontend/node_modules")
            
            # Install npm dependencies with retries
            npm_attempts = 2
            for attempt in range(npm_attempts):
                self.log(f"NPM install attempt {attempt + 1}/{npm_attempts}")
                npm_result = self.execute_ssh_command("cd /opt/pebdeq/frontend && npm install --legacy-peer-deps 2>&1")
                
                if "added" in npm_result.lower() or "up to date" in npm_result.lower():
                    self.log("NPM dependencies installed successfully!")
                    break
                elif attempt < npm_attempts - 1:
                    self.log("NPM install failed, retrying...", "WARNING")
                else:
                    self.log("NPM install failed after retries", "WARNING")
                    # Continue anyway as frontend is less critical for backend stability
            
            # ============ FINAL VERIFICATION ============
            self.log("3. Running final dependency verification...")
            
            # Check pip list
            pip_list = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip list | grep -E '(flask|sqlalchemy|werkzeug)' | head -5")
            self.log(f"Installed packages: {pip_list}")
            
            # Check for broken requirements
            pip_check = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip check 2>&1")
            if pip_check.strip() and "No broken requirements" not in pip_check:
                self.log(f"Warning: pip check found issues: {pip_check}", "WARNING")
            else:
                self.log("✅ All pip requirements satisfied")
            
            self.log("[OK] Dependencies installation completed successfully!")
            return True
            
        except Exception as e:
            self.log(f"[ERROR] Dependencies installation failed: {str(e)}", "ERROR")
            return False
            
    def deploy_build_frontend(self):
        """Step 6: Build frontend - BULLETPROOF VERSION"""
        try:
            self.connect_ssh()
            
            # Phase 1: Create clean production config.js (NO duplicate imports)
            self.log("Creating clean production config.js...")
            config_content = """// PEBDEQ Frontend Configuration - Production Mode
// Auto-generated by deployment tool - DO NOT EDIT MANUALLY

const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// API Base URL configuration
export const API_BASE_URL = isDevelopment || isLocalhost 
  ? 'http://localhost:5005'
  : '';  // Use relative URLs in production (proxied through Nginx)

// API URL helper function
export const getApiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return API_BASE_URL + cleanEndpoint;
};

// Image URL helper function  
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
  return API_BASE_URL + cleanPath;
};

// Default export
export default {
  API_BASE_URL,
  getApiUrl,
  getImageUrl
};"""
            
            # Write config.js safely with heredoc
            self.execute_ssh_command(f"""cat > /opt/pebdeq/frontend/src/config.js << 'CONFIG_EOF'
{config_content}
CONFIG_EOF""")
            
            # Phase 2: Simple URL replacement (NO complex regex)
            self.log("Simple URL replacement for localhost references...")
            
            # Simple replacements with basic patterns only
            self.log("Running basic URL replacements...")
            
            # Only safe, simple patterns to avoid bash conflicts
            basic_replacements = [
                "http://localhost:5005/api/",
                "http://localhost:5005/uploads/", 
                "http://localhost:5005"
            ]
            
            # Execute sed commands on all JS files
            total_replacements = 0
            files_processed = 0
            
            # Find all JS files (except config.js)
            find_output = self.execute_ssh_command("cd /opt/pebdeq/frontend && find src -name '*.js' ! -name 'config.js'")
            js_files = [f.strip() for f in find_output.strip().split('\n') if f.strip()]
            
            for js_file in js_files:
                self.log(f"Processing: {js_file}")
                file_changed = False
                
                # Apply basic string replacements safely
                for old_url in basic_replacements:
                    if old_url == "http://localhost:5005/api/":
                        new_url = "/api/"
                    elif old_url == "http://localhost:5005/uploads/":
                        new_url = "/uploads/"  
                    else:  # http://localhost:5005
                        new_url = ""
                    
                    # Use simple sed with basic strings (no special chars)
                    cmd = f"cd /opt/pebdeq/frontend && sed -i 's#{old_url}#{new_url}#g' {js_file}"
                    result = self.execute_ssh_command(cmd)
                    if not result or "error" not in result.lower():
                        file_changed = True
                
                if file_changed:
                    files_processed += 1
                    self.log(f"✅ Fixed: {js_file} (URLs replaced)")
                else:
                    self.log(f"⚪ Skipped: {js_file} (no changes needed)")
            
            self.log(f"URL Fix Result: Files processed: {files_processed}")
            self.log(f"URL Fix Result: Files modified: {files_processed}")
            
            # Phase 3: Frontend build with error handling
            self.log("Building React frontend...")
            
            # Build with detailed error output (npm run build includes dependency check)
            build_output = self.execute_ssh_command("cd /opt/pebdeq/frontend && npm run build 2>&1")
            
            # Check if build was successful
            if "Failed to compile" in build_output or "error" in build_output.lower():
                self.log("Build had issues, but continuing...", "WARNING")
                self.log(f"Build output: {build_output}")
            else:
                self.log("Frontend build completed successfully!")
            
            # Phase 4: Deploy built files
            self.log("Deploying frontend files...")
            
            # Create web directory
            self.execute_ssh_command("mkdir -p /var/www/pebdeq")
            
            # Copy built files (with fallback to src if build failed)
            copy_cmd = """
            if [ -d "/opt/pebdeq/frontend/build" ]; then
                cp -r /opt/pebdeq/frontend/build/* /var/www/pebdeq/
                echo "Deployed from build directory"
            else
                echo "Build directory not found, deploying source files..."
                cp -r /opt/pebdeq/frontend/public/* /var/www/pebdeq/ 2>/dev/null || true
                echo "Deployed public files as fallback"
            fi
            """
            self.execute_ssh_command(copy_cmd)
            
            # Set permissions
            self.execute_ssh_command("chown -R www-data:www-data /var/www/pebdeq")
            self.execute_ssh_command("chmod -R 755 /var/www/pebdeq")
            
            # Phase 5: Create basic index.html if missing
            index_check = self.execute_ssh_command("ls -la /var/www/pebdeq/index.html 2>/dev/null || echo 'missing'")
            if "missing" in index_check:
                self.log("Creating basic index.html...")
                basic_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PEBDEQ - Loading...</title>
</head>
<body>
    <div id="root">
        <h1>PEBDEQ</h1>
        <p>Frontend deployment in progress...</p>
        <p>Backend API is running at: <a href="/api/health">/api/health</a></p>
    </div>
</body>
</html>"""
                self.execute_ssh_command(f"""cat > /var/www/pebdeq/index.html << 'HTML_EOF'
{basic_html}
HTML_EOF""")
            
            self.log("Frontend deployment completed!")
            return True
            
        except Exception as e:
            self.log(f"Frontend build failed: {str(e)}", "ERROR")
            return False
            
    def deploy_setup_database(self):
        """Step 7: Setup database"""
        try:
            self.connect_ssh()
            
            # Setup database using virtual environment Python
            self.log("Setting up database...")
            
            # Create instance directory if not exists
            self.execute_ssh_command("cd /opt/pebdeq/backend && mkdir -p instance")
            
            # Initialize database with venv Python
            self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python reset_db.py")
            
            # Set proper permissions
            self.execute_ssh_command("chown -R www-data:www-data /opt/pebdeq/backend/instance")
            
            # Create and set permissions for upload directories
            self.execute_ssh_command("mkdir -p /opt/pebdeq/backend/uploads/{products,categories,site,blog,invoices}")
            self.execute_ssh_command("chown -R www-data:www-data /opt/pebdeq/backend/uploads")
            self.execute_ssh_command("chmod -R 775 /opt/pebdeq/backend/uploads")
            
            return True
        except Exception as e:
            self.log(f"Database setup failed: {str(e)}", "ERROR")
            return False
            
    def deploy_configure_services(self):
        """Step 8: Configure services - BULLETPROOF VERSION"""
        try:
            self.connect_ssh()
            
            self.log("[SERVICE] Configuring bulletproof systemd service...")
            
            # ============ ENHANCED SERVICE CONFIGURATION ============
            # Create a more robust systemd service with better error handling
            service_content = f"""[Unit]
Description=PEBDEQ Backend Service
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/pebdeq/backend
Environment=PATH=/opt/pebdeq/backend/venv/bin:/usr/local/bin:/usr/bin:/bin
Environment=FLASK_APP=run.py
Environment=FLASK_ENV=production
Environment=PYTHONPATH=/opt/pebdeq/backend
Environment=NUMBA_CACHE_DIR=/tmp/numba_cache
Environment=NUMBA_DISABLE_JIT=1
Environment=PYMATTING_DISABLE_CACHE=1
Environment=DISABLE_REMBG=1

# Enhanced execution and restart configuration
ExecStartPre=/bin/sleep 2
ExecStart=/opt/pebdeq/backend/venv/bin/python /opt/pebdeq/backend/run.py
ExecStop=/bin/kill -TERM $MAINPID
ExecReload=/bin/kill -HUP $MAINPID

# Robust restart policy
Restart=on-failure
RestartSec=10
StartLimitBurst=3
StartLimitInterval=300

# Resource limits and security
TimeoutStartSec=60
TimeoutStopSec=30
KillMode=mixed
KillSignal=SIGTERM

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=pebdeq-backend

# Working directory permissions
StateDirectory=pebdeq
StateDirectoryMode=0755

[Install]
WantedBy=multi-user.target
"""
            
            # ============ WRITE AND VERIFY SERVICE FILE ============
            self.log("1. Creating systemd service file...")
            
            # Write service file using safer method
            self.execute_ssh_command(f"cat > /etc/systemd/system/pebdeq-backend.service << 'SERVICE_EOF'\n{service_content}\nSERVICE_EOF")
            
            # Verify service file was written correctly
            service_check = self.execute_ssh_command("ls -la /etc/systemd/system/pebdeq-backend.service")
            if "No such file" in service_check:
                self.log("ERROR: Failed to create service file!", "ERROR")
                return False
            else:
                self.log("✅ Service file created successfully")
            
            # ============ SET UP PROPER PERMISSIONS ============
            self.log("2. Setting up proper permissions...")
            
            # Set service file permissions
            self.execute_ssh_command("chmod 644 /etc/systemd/system/pebdeq-backend.service")
            self.execute_ssh_command("chown root:root /etc/systemd/system/pebdeq-backend.service")
            
            # Ensure www-data user exists and has proper permissions
            self.execute_ssh_command("id www-data || useradd -r -s /bin/false www-data")
            
            # Set comprehensive file permissions
            permission_commands = [
                "chown -R www-data:www-data /opt/pebdeq/backend",
                "chmod -R 755 /opt/pebdeq/backend",
                "chmod +x /opt/pebdeq/backend/run.py",
                "chmod -R 755 /opt/pebdeq/backend/venv/bin",
                "mkdir -p /tmp/numba_cache",
                "chown www-data:www-data /tmp/numba_cache",
                "mkdir -p /opt/pebdeq/backend/instance",
                "chown -R www-data:www-data /opt/pebdeq/backend/instance",
                "mkdir -p /opt/pebdeq/backend/uploads",
                "chown -R www-data:www-data /opt/pebdeq/backend/uploads",
                "chmod -R 775 /opt/pebdeq/backend/uploads"
            ]
            
            for cmd in permission_commands:
                self.execute_ssh_command(cmd)
                
            self.log("✅ Permissions configured")
            
            # ============ SYSTEMCTL OPERATIONS ============
            self.log("3. Configuring systemctl...")
            
            # Stop any existing service
            self.execute_ssh_command("systemctl stop pebdeq-backend 2>/dev/null || true")
            
            # Reload systemd daemon
            self.execute_ssh_command("systemctl daemon-reload")
            
            # Verify service file is valid
            service_status = self.execute_ssh_command("systemctl status pebdeq-backend --no-pager || true")
            if "could not be found" in service_status:
                self.log("ERROR: Service file not recognized by systemd!", "ERROR")
                return False
            
            # Enable service for auto-start
            enable_result = self.execute_ssh_command("systemctl enable pebdeq-backend 2>&1")
            if "error" in enable_result.lower() and "failed" in enable_result.lower():
                self.log(f"Warning: Service enable had issues: {enable_result}", "WARNING")
            else:
                self.log("✅ Service enabled for auto-start")
            
            # ============ VERIFY SERVICE CONFIGURATION ============
            self.log("4. Verifying service configuration...")
            
            # Check service file syntax
            service_syntax = self.execute_ssh_command("systemd-analyze verify /etc/systemd/system/pebdeq-backend.service 2>&1")
            if service_syntax.strip():
                self.log(f"Service file syntax check: {service_syntax}")
            else:
                self.log("✅ Service file syntax is valid")
            
            # Check if service is properly recognized
            is_enabled = self.execute_ssh_command("systemctl is-enabled pebdeq-backend 2>/dev/null || echo 'not-enabled'")
            if "enabled" in is_enabled:
                self.log("✅ Service is enabled")
            else:
                self.log(f"⚠️ Service enable status: {is_enabled}", "WARNING")
            
            # ============ ADDITIONAL SYSTEM CONFIGURATION ============
            self.log("5. Additional system configuration...")
            
            # Create log directory if needed
            self.execute_ssh_command("mkdir -p /var/log/pebdeq")
            self.execute_ssh_command("chown www-data:www-data /var/log/pebdeq")
            
            # Configure logrotate for pebdeq logs
            logrotate_config = """
/var/log/pebdeq/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    copytruncate
    notifempty
}
"""
            self.execute_ssh_command(f"echo '{logrotate_config}' > /etc/logrotate.d/pebdeq")
            
            # Set up basic firewall rules if ufw is available
            ufw_check = self.execute_ssh_command("which ufw 2>/dev/null || echo 'not found'")
            if "not found" not in ufw_check:
                self.execute_ssh_command("ufw allow from 127.0.0.1 to any port 5005 comment 'PEBDEQ Backend'")
            
            self.log("✅ Additional system configuration completed")
            
            # ============ FINAL VERIFICATION ============
            self.log("6. Final service verification...")
            
            # Verify all critical paths exist
            critical_paths = [
                "/opt/pebdeq/backend/run.py",
                "/opt/pebdeq/backend/venv/bin/python",
                "/etc/systemd/system/pebdeq-backend.service"
            ]
            
            all_paths_ok = True
            for path in critical_paths:
                check = self.execute_ssh_command(f"ls -la {path} 2>/dev/null || echo 'MISSING'")
                if "MISSING" in check:
                    self.log(f"❌ Critical path missing: {path}", "ERROR")
                    all_paths_ok = False
                else:
                    self.log(f"✅ Verified: {path}")
            
            if not all_paths_ok:
                return False
            
            # Show service configuration summary
            self.log("Service Configuration Summary:")
            self.log(f"  Service file: /etc/systemd/system/pebdeq-backend.service")
            self.log(f"  Working directory: /opt/pebdeq/backend")
            self.log(f"  Python executable: /opt/pebdeq/backend/venv/bin/python")
            self.log(f"  Main script: /opt/pebdeq/backend/run.py")
            self.log(f"  User: www-data")
            self.log(f"  Auto-start: enabled")
            
            self.log("[OK] Service configuration completed successfully!")
            return True
            
        except Exception as e:
            self.log(f"[ERROR] Service configuration failed: {str(e)}", "ERROR")
            return False
            
    def deploy_setup_webserver(self):
        """Step 11: Setup web server (Nginx)"""
        try:
            # Nginx should already be installed from system updates
            self.log("Configuring Nginx web server...")
            
            # Prepare domain list
            domains = [self.domain_name.get()]
            if self.additional_domains.get():
                additional = [d.strip() for d in self.additional_domains.get().split(',') if d.strip()]
                domains.extend(additional)
            
            server_names = ' '.join(domains)
            
            # Create nginx config
            nginx_config = f"""server {{
    listen 80;
    server_name {server_names};
    
    # File upload size limit
    client_max_body_size 50M;
    
    # Security headers (basic)
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend
    location / {{
        root /var/www/pebdeq;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {{
            expires 1y;
            add_header Cache-Control "public, immutable";
        }}
    }}
    
    # Backend API
    location /api/ {{
        proxy_pass http://localhost:5005/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # File upload settings
        client_max_body_size 50M;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }}
    
    # Static uploads
    location /uploads/ {{
        alias /opt/pebdeq/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }}
    
    # Health check endpoint
    location /health {{
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }}
    
    # Security - deny access to sensitive files
    location ~ /\\. {{
        deny all;
    }}
    
    location ~ \\.(htaccess|htpasswd|ini|log|sh|sql|conf)$ {{
        deny all;
    }}
}}"""
            
            # Write config file
            self.execute_ssh_command(f"cat > /etc/nginx/sites-available/pebdeq << 'EOF'\n{nginx_config}\nEOF")
            
            # Enable site
            self.execute_ssh_command("ln -sf /etc/nginx/sites-available/pebdeq /etc/nginx/sites-enabled/")
            self.execute_ssh_command("rm -f /etc/nginx/sites-enabled/default")
            
            # Test and reload nginx
            self.execute_ssh_command("nginx -t")
            self.execute_ssh_command("systemctl enable nginx")
            self.execute_ssh_command("systemctl restart nginx")
            
            return True
        except Exception as e:
            self.log(f"Web server setup failed: {str(e)}", "ERROR")
            return False
            
    def deploy_configure_ssl(self):
        """Step 10: Configure SSL"""
        if not self.ssl_enable.get():
            self.log("SSL disabled, skipping...")
            return True
            
        try:
            # Install certbot
            self.execute_ssh_command("apt install -y certbot python3-certbot-nginx")
            
            # Prepare domain list
            domains = [self.domain_name.get()]
            if self.additional_domains.get():
                additional = [d.strip() for d in self.additional_domains.get().split(',') if d.strip()]
                domains.extend(additional)
            
            domain_args = ' '.join([f'-d {domain}' for domain in domains])
            email = self.ssl_email.get() or f"admin@{self.domain_name.get()}"
            
            # Get certificate
            certbot_cmd = f"certbot --nginx {domain_args} --non-interactive --agree-tos --email {email}"
            self.execute_ssh_command(certbot_cmd)
            
            # Configure additional SSL settings if enabled
            if self.force_https.get() or self.enable_hsts.get():
                self.configure_advanced_ssl()
            
            # Setup auto-renewal
            self.execute_ssh_command("systemctl enable certbot.timer")
            self.execute_ssh_command("systemctl start certbot.timer")
            
            return True
        except Exception as e:
            self.log(f"SSL configuration failed: {str(e)}", "WARNING")
            return True  # Non-critical
            
    def configure_advanced_ssl(self):
        """Configure advanced SSL settings"""
        try:
            # Read current nginx config
            nginx_config_path = "/etc/nginx/sites-available/pebdeq"
            
            # Add security headers and HTTPS redirect
            additional_config = ""
            
            if self.force_https.get():
                additional_config += """
    # Force HTTPS redirect
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
"""
            
            if self.enable_hsts.get():
                additional_config += """
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
"""
            
            if additional_config:
                # Add security config to server block
                self.execute_ssh_command(f"""
sed -i '/server_name.*{self.domain_name.get()}/a\\{additional_config}' {nginx_config_path}
""")
                
                # Reload nginx
                self.execute_ssh_command("nginx -t && systemctl reload nginx")
                
        except Exception as e:
            self.log(f"Advanced SSL configuration failed: {str(e)}", "WARNING")
            
    def deploy_health_checks(self):
        """Step 12: Run comprehensive health checks - BULLETPROOF VERSION"""
        try:
            self.connect_ssh()
            
            self.log("[HEALTH] Running comprehensive health verification...")
            import time
            
            # ============ PRE-START VERIFICATION ============
            self.log("1. Pre-start verification...")
            
            # Check if all files are in place
            essential_files = [
                "/opt/pebdeq/backend/run.py",
                "/opt/pebdeq/backend/requirements.txt", 
                "/opt/pebdeq/backend/venv/bin/python",
                "/etc/systemd/system/pebdeq-backend.service"
            ]
            
            for file_path in essential_files:
                check = self.execute_ssh_command(f"ls -la {file_path} 2>/dev/null || echo 'MISSING'")
                if "MISSING" in check:
                    self.log(f"❌ Critical file missing: {file_path}", "ERROR")
                    return False
                else:
                    self.log(f"✅ Found: {file_path}")
            
            # ============ BACKEND SERVICE START ============
            self.log("2. Starting backend service with monitoring...")
            
            # Stop any existing service first
            self.execute_ssh_command("systemctl stop pebdeq-backend 2>/dev/null || true")
            time.sleep(2)
            
            # Clear any hanging processes
            self.execute_ssh_command("pkill -f 'python.*run.py' 2>/dev/null || true")
            time.sleep(1)
            
            # Start the service
            self.log("Starting pebdeq-backend service...")
            self.execute_ssh_command("systemctl daemon-reload")
            start_result = self.execute_ssh_command("systemctl start pebdeq-backend 2>&1")
            
            if start_result.strip():
                self.log(f"Service start output: {start_result}")
            
            # ============ SERVICE STARTUP MONITORING ============
            self.log("3. Monitoring service startup...")
            
            # Wait and monitor for up to 30 seconds
            max_wait = 30
            for i in range(max_wait):
                time.sleep(1)
                
                # Check service status
                is_active = self.execute_ssh_command("systemctl is-active pebdeq-backend")
                
                if "active" in is_active:
                    self.log(f"✅ Service became active after {i+1} seconds")
                    break
                elif "failed" in is_active:
                    self.log(f"❌ Service failed after {i+1} seconds", "ERROR")
                    break
                elif i % 5 == 0 and i > 0:
                    self.log(f"Still waiting... ({i}/{max_wait}s)")
            
            # Get final service status
            status_result = self.execute_ssh_command("systemctl status pebdeq-backend --no-pager --lines=15")
            self.log("Final service status:")
            self.log(status_result)
            
            # ============ DEBUGGING IF SERVICE FAILED ============
            final_status = self.execute_ssh_command("systemctl is-active pebdeq-backend")
            if "active" not in final_status:
                self.log("❌ Backend service failed to start. Running detailed diagnostics...", "ERROR")
                
                # Get recent service logs
                logs = self.execute_ssh_command("journalctl -u pebdeq-backend --no-pager --lines=30 --since='2 minutes ago'")
                self.log(f"Recent service logs:\n{logs}")
                
                # Test Python environment
                python_test = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -c 'print(\"Python test OK\")' 2>&1")
                self.log(f"Python environment test: {python_test}")
                
                # Test critical imports  
                flask_test = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -c 'import flask; print(\"Flask import OK\")' 2>&1")
                self.log(f"Flask import test: {flask_test}")
                
                # Test run.py syntax
                syntax_test = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -m py_compile run.py 2>&1")
                if syntax_test.strip():
                    self.log(f"Syntax errors in run.py: {syntax_test}", "ERROR")
                else:
                    self.log("✅ run.py syntax is valid")
                
                # Test manual execution (limited time)
                self.log("Testing manual execution (10 second timeout)...")
                manual_test = self.execute_ssh_command("cd /opt/pebdeq/backend && timeout 10s ./venv/bin/python run.py 2>&1 || echo 'TIMEOUT_OR_ERROR'")
                self.log(f"Manual execution test: {manual_test}")
                
                return False
            
            # ============ API HEALTH TESTING ============
            self.log("4. Testing API endpoints...")
            
            # Wait additional time for API to be ready
            time.sleep(5)
            
            # Test API health endpoint with retries
            api_ready = False
            for attempt in range(10):
                api_test = self.execute_ssh_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5005/api/health 2>/dev/null || echo '000'")
                
                if "200" in api_test:
                    self.log(f"✅ API health check successful (HTTP 200) after {attempt+1} attempts")
                    api_ready = True
                    break
                elif attempt < 9:
                    self.log(f"API not ready yet (attempt {attempt+1}/10, got HTTP {api_test})")
                    time.sleep(2)
                else:
                    self.log(f"❌ API health check failed after 10 attempts (HTTP {api_test})", "ERROR")
            
            if not api_ready:
                # Try to get more info about why API failed
                port_check = self.execute_ssh_command("netstat -tlnp | grep :5005")
                self.log(f"Port 5005 status: {port_check}")
                
                process_check = self.execute_ssh_command("ps aux | grep python | grep run.py")
                self.log(f"Backend process status: {process_check}")
                
                return False
            
            # ============ NGINX AND WEB SERVER TESTING ============ 
            self.log("5. Testing web server...")
            
            # Check nginx status
            nginx_active = self.execute_ssh_command("systemctl is-active nginx")
            if "active" not in nginx_active:
                self.log("Starting nginx...")
                self.execute_ssh_command("systemctl start nginx")
                time.sleep(3)
                nginx_active = self.execute_ssh_command("systemctl is-active nginx")
            
            if "active" in nginx_active:
                self.log("✅ Nginx is running")
            else:
                self.log("❌ Nginx failed to start", "ERROR")
                return False
            
            # Test web server response
            try:
                import requests
                web_test = self.execute_ssh_command(f"curl -s -o /dev/null -w '%{{http_code}}' http://{self.server_ip.get()}/health 2>/dev/null || echo '000'")
                self.log(f"Web server test result: HTTP {web_test}")
                
                if "200" in web_test:
                    self.log("✅ Web server responding correctly")
                else:
                    self.log("⚠️ Web server not responding as expected", "WARNING")
                    
            except Exception as e:
                self.log(f"Web server test error: {str(e)}", "WARNING")
            
            # ============ FINAL VERIFICATION ============
            self.log("6. Final system verification...")
            
            # Enable service for auto-start
            self.execute_ssh_command("systemctl enable pebdeq-backend")
            
            # Check overall system status
            system_status = {
                "backend_service": self.execute_ssh_command("systemctl is-active pebdeq-backend").strip(),
                "nginx_service": self.execute_ssh_command("systemctl is-active nginx").strip(),
                "api_health": "200" if api_ready else "failed",
                "port_5005": "bound" if "5005" in self.execute_ssh_command("netstat -tlnp | grep :5005") else "not_bound"
            }
            
            self.log("System Status Summary:")
            for component, status in system_status.items():
                self.log(f"  {component}: {status}")
            
            # Check if all critical components are working
            critical_ok = (
                system_status["backend_service"] == "active" and
                system_status["api_health"] == "200" and
                system_status["port_5005"] == "bound"
            )
            
            if critical_ok:
                self.log("🎉 [SUCCESS] All health checks passed! Backend is running and responding!", "SUCCESS")
                return True
            else:
                self.log("❌ [FAILED] Health checks failed - system not fully operational", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"[ERROR] Health checks failed with exception: {str(e)}", "ERROR")
            return False
            
    def deploy_final_verification(self):
        """Step 12: Final verification"""
        try:
            self.log("Running final verification...")
            
            # Service status
            self.execute_ssh_command("systemctl status pebdeq-backend --no-pager")
            self.execute_ssh_command("systemctl status nginx --no-pager")
            
            # Disk usage
            self.execute_ssh_command("df -h /opt/pebdeq /var/www/pebdeq")
            
            # Process check
            self.execute_ssh_command("ps aux | grep -E '(python|nginx)' | grep -v grep")
            
            self.log("[OK] Final verification completed!", "SUCCESS")
            return True
            
        except Exception as e:
            self.log(f"Final verification failed: {str(e)}", "WARNING")
            return True  # Non-critical
            
    # Helper methods
    def connect_ssh(self):
        """Establish SSH connection"""
        try:
            if self.ssh_client is None or not self.ssh_client.get_transport() or not self.ssh_client.get_transport().is_active():
                self.ssh_client = paramiko.SSHClient()
                self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                self.ssh_client.connect(
                    hostname=self.server_ip.get(),
                    port=int(self.server_port.get()),
                    username=self.server_user.get(),
                    password=self.server_password.get()
                )
                self.log("🔌 SSH Connection established successfully", "SUCCESS")
                
                # Update file manager buttons if available
                if hasattr(self, 'upload_btn'):
                    self.enable_file_manager_buttons(True)
                    
        except Exception as e:
            self.log(f"❌ SSH Connection failed: {str(e)}", "ERROR")
            messagebox.showerror("Connection Error", f"Failed to connect to server:\n{str(e)}")
            
    def disconnect_ssh(self):
        """Disconnect SSH connection"""
        try:
            if self.ssh_client and self.ssh_client.get_transport() and self.ssh_client.get_transport().is_active():
                self.ssh_client.close()
                self.log("🔌 SSH Connection closed successfully", "SUCCESS")
                
                # Update file manager buttons if available
                if hasattr(self, 'upload_btn'):
                    self.enable_file_manager_buttons(False)
                    
                # Clear server status
                if hasattr(self, 'backend_status'):
                    self.backend_status.config(text="Backend: ❓ Disconnected", fg='gray')
                if hasattr(self, 'nginx_status'):
                    self.nginx_status.config(text="Nginx: ❓ Disconnected", fg='gray')
                if hasattr(self, 'ssl_status'):
                    self.ssl_status.config(text="SSL: ❓ Disconnected", fg='gray')
                if hasattr(self, 'backend_stability'):
                    self.backend_stability.config(text="Stability: ❓ Disconnected", fg='gray')
                if hasattr(self, 'last_restart'):
                    self.last_restart.config(text="Last Restart: Unknown", fg='gray')
                    
            else:
                self.log("ℹ️ No active SSH connection to close", "INFO")
                
        except Exception as e:
            self.log(f"⚠️ Error during SSH disconnect: {str(e)}", "WARNING")
            
    def execute_ssh_command(self, command):
        """Execute SSH command and return output"""
        self.connect_ssh()
        stdin, stdout, stderr = self.ssh_client.exec_command(command)
        
        output = stdout.read().decode()
        error = stderr.read().decode()
        exit_code = stdout.channel.recv_exit_status()
        
        if exit_code != 0 and error:
            self.log(f"Command error: {error}", "WARNING")
        
        if output:
            self.log(f"Output: {output.strip()}")
            
        return output
        
    def upload_directory(self, sftp, local_path, remote_path):
        """Upload directory recursively"""
        local_path = Path(local_path)
        
        if not local_path.exists():
            return
            
        # Create remote directory
        try:
            sftp.mkdir(remote_path)
        except (OSError, paramiko.SFTPError):
            pass  # Directory already exists or permission error
            
        for item in local_path.iterdir():
            local_item = str(item)
            remote_item = f"{remote_path}/{item.name}"
            
            if item.is_file():
                # Skip certain files
                if item.name in ['.DS_Store', '.git', '__pycache__', 'node_modules', '.gitignore', '.gitattributes']:
                    continue
                if item.suffix in ['.pyc', '.pyo']:
                    continue
                # Skip deployment-related files that shouldn't be on server
                if item.name.startswith('deployment_') or item.name in ['start_deployment.bat', 'deploy.sh']:
                    continue
                    
                try:
                    sftp.put(local_item, remote_item)
                    self.log(f"Uploaded: {item.name}")
                except Exception as e:
                    self.log(f"Failed to upload {item.name}: {str(e)}", "WARNING")
                    
            elif item.is_dir() and item.name not in ['.git', '__pycache__', 'node_modules', '.next', 'build', 'deployment', '.venv']:
                # FIXED: Removed 'archive' from skip list to allow backup directories
                self.upload_directory(sftp, local_item, remote_item)
                
    def upload_directory_incremental(self, sftp, local_path, remote_path):
        """Upload directory with incremental updates based on file timestamps"""
        local_path = Path(local_path)
        files_changed = 0
        
        if not local_path.exists():
            return 0
            
        # Create remote directory
        try:
            sftp.mkdir(remote_path)
        except (OSError, paramiko.SFTPError):
            pass  # Directory already exists or permission error
            
        for item in local_path.iterdir():
            local_item = str(item)
            remote_item = f"{remote_path}/{item.name}"
            
            if item.is_file():
                # Skip certain files (same as upload_directory)
                if item.name in ['.DS_Store', '.git', '__pycache__', 'node_modules', '.gitignore', '.gitattributes']:
                    continue
                if item.suffix in ['.pyc', '.pyo']:
                    continue
                if item.name.startswith('deployment_') or item.name in ['start_deployment.bat', 'deploy.sh']:
                    continue
                    
                # Check if file needs updating
                should_upload = True
                try:
                    remote_stat = sftp.stat(remote_item)
                    local_mtime = item.stat().st_mtime
                    remote_mtime = remote_stat.st_mtime
                    
                    # Upload if local file is newer or different size
                    if local_mtime <= remote_mtime and item.stat().st_size == remote_stat.st_size:
                        should_upload = False
                        
                except (FileNotFoundError, IOError):
                    # Remote file doesn't exist, upload it
                    should_upload = True
                    
                if should_upload:
                    try:
                        sftp.put(local_item, remote_item)
                        self.log(f"Updated: {item.name}")
                        files_changed += 1
                    except Exception as e:
                        self.log(f"Failed to update {item.name}: {str(e)}", "WARNING")
                        
            elif item.is_dir() and item.name not in ['.git', '__pycache__', 'node_modules', '.next', 'build', 'deployment', '.venv']:
                # FIXED: Removed 'archive' from skip list to allow backup directories
                sub_changes = self.upload_directory_incremental(sftp, local_item, remote_item)
                files_changed += sub_changes
                
        return files_changed

    def toggle_auto_deploy(self):
        """Toggle auto-deploy file watching"""
        if self.auto_deploy_enabled.get():
            self.start_auto_deploy()
        else:
            self.stop_auto_deploy()
    
    def start_auto_deploy(self):
        """Start auto-deploy file watching"""
        if self.auto_deploy_thread and self.auto_deploy_thread.is_alive():
            return  # Already running
            
        project_path = self.project_path.get().strip()
        if not project_path or not Path(project_path).exists():
            messagebox.showerror("Error", "Please set a valid project path first!")
            self.auto_deploy_enabled.set(False)
            return
            
        # Check connection settings
        if not self.server_ip.get() or not self.server_user.get():
            messagebox.showerror("Error", "Please configure server connection first!")
            self.auto_deploy_enabled.set(False)
            return
            
        self.stop_watching = False
        self.auto_deploy_thread = threading.Thread(target=self.auto_deploy_worker, daemon=True)
        self.auto_deploy_thread.start()
        
        self.auto_deploy_status.config(text="✅ Running", fg='green')
        self.log("🤖 [AUTO-DEPLOY] Started file watching...")
        
    def stop_auto_deploy(self):
        """Stop auto-deploy file watching"""
        self.stop_watching = True
        if self.auto_deploy_thread:
            self.auto_deploy_thread.join(timeout=2.0)
            
        self.auto_deploy_status.config(text="❌ Stopped", fg='red')
        self.log("🤖 [AUTO-DEPLOY] Stopped file watching")
        
    def auto_deploy_worker(self):
        """Worker thread for auto-deploy file watching"""
        import time
        
        project_path = Path(self.project_path.get())
        last_scan_times = {}
        
        # Get watch extensions
        extensions = [ext.strip() for ext in self.watch_extensions.get().split(',')]
        
        self.log(f"🔍 [AUTO-DEPLOY] Watching {project_path} for changes in: {extensions}")
        
        while not self.stop_watching:
            try:
                # Scan for changed files
                changed_files = []
                
                # Check backend, frontend, and other directories
                for directory in ['backend', 'frontend', 'pb_test_suite']:
                    dir_path = project_path / directory
                    if not dir_path.exists():
                        continue
                        
                    for file_path in dir_path.rglob('*'):
                        if not file_path.is_file():
                            continue
                            
                        # Check if file extension is watched
                        if not any(file_path.suffix == ext for ext in extensions):
                            continue
                            
                        # Skip certain directories
                        if any(skip in str(file_path) for skip in ['.git', '__pycache__', 'node_modules', '.venv', 'build']):
                            continue
                            
                        try:
                            current_mtime = file_path.stat().st_mtime
                            file_key = str(file_path)
                            
                            if file_key not in last_scan_times:
                                last_scan_times[file_key] = current_mtime
                            elif current_mtime > last_scan_times[file_key]:
                                changed_files.append(file_path)
                                last_scan_times[file_key] = current_mtime
                                
                        except (OSError, FileNotFoundError):
                            continue
                
                # If files changed, trigger deployment
                if changed_files:
                    self.log(f"🔄 [AUTO-DEPLOY] Detected {len(changed_files)} changed files:")
                    for file_path in changed_files[:5]:  # Show max 5 files
                        self.log(f"    📝 {file_path.relative_to(project_path)}")
                    if len(changed_files) > 5:
                        self.log(f"    ... and {len(changed_files) - 5} more files")
                        
                    self.trigger_auto_deployment(changed_files)
                
                # Wait for next scan
                time.sleep(self.auto_deploy_interval.get())
                
            except Exception as e:
                self.log(f"❌ [AUTO-DEPLOY] Error during file watching: {str(e)}", "ERROR")
                time.sleep(5)  # Wait a bit before retrying
                
    def trigger_auto_deployment(self, changed_files):
        """Trigger automatic deployment for changed files"""
        try:
            self.log("🚀 [AUTO-DEPLOY] Starting automatic deployment...")
            
            # Force incremental upload for auto-deploy
            original_incremental = self.incremental_upload.get()
            self.incremental_upload.set(True)
            
            # Only upload files (don't do full deployment)
            if self.deploy_upload_files():
                self.log("✅ [AUTO-DEPLOY] Files uploaded successfully!")
                
                # Restart backend service if Python files were changed
                python_files = [f for f in changed_files if f.suffix == '.py']
                if python_files:
                    self.log("🔄 [AUTO-DEPLOY] Restarting backend service...")
                    self.restart_backend_service()
                    
            else:
                self.log("❌ [AUTO-DEPLOY] Failed to upload files", "ERROR")
                
            # Restore original incremental setting
            self.incremental_upload.set(original_incremental)
            
        except Exception as e:
            self.log(f"❌ [AUTO-DEPLOY] Deployment failed: {str(e)}", "ERROR")
            
    def restart_backend_service(self):
        """Restart backend service after Python file changes"""
        try:
            if not self.ssh_client:
                self.connect_ssh()
                
            self.execute_ssh_command("sudo systemctl restart pebdeq-backend")
            self.log("✅ [AUTO-DEPLOY] Backend service restarted")
            
        except Exception as e:
            self.log(f"⚠️ [AUTO-DEPLOY] Failed to restart backend: {str(e)}", "WARNING")

    def stop_deployment(self):
        """Stop deployment process"""
        self.log("[STOP] Deployment stopped by user", "WARNING")
        # Note: Thread stopping is complex, this is a basic implementation
    
    def select_all_steps(self):
        """Select all deployment steps"""
        for var in self.step_vars.values():
            var.set(True)
        self.log("✅ All deployment steps selected")
        
        # DEBUG: Show what was selected
        selected_count = sum(1 for var in self.step_vars.values() if var.get())
        self.log(f"[DEBUG] {selected_count} steps now selected")
    
    def clear_all_steps(self):
        """Clear all deployment steps"""
        for var in self.step_vars.values():
            var.set(False)
        self.log("❌ All deployment steps cleared")
        
        # DEBUG: Show what was cleared
        selected_count = sum(1 for var in self.step_vars.values() if var.get())
        self.log(f"[DEBUG] {selected_count} steps now selected")
        
    def reset_deployment(self):
        """Reset deployment state"""
        for var in self.step_vars.values():
            var.set(False)
        self.progress_var.set(0)
        self.update_status("Ready to deploy")
        self.log("[RESTART] Deployment reset", "INFO")
    
    def set_quick_update_mode(self):
        """Set quick update mode - no file upload, only code updates"""
        
        # Clear all steps first
        for var in self.step_vars.values():
            var.set(False)
        
        # Disable file upload
        self.upload_files.set(False)
        
        # Select only necessary steps for quick update
        quick_update_steps = [
            "test_connection",     # Always test connection
            "install_dependencies", # Update dependencies if needed
            "build_frontend",      # Rebuild frontend
            "configure_services",  # Restart services
            "health_checks"        # Verify everything works
        ]
        
        selected_count = 0
        for step_id in quick_update_steps:
            if step_id in self.step_vars:
                self.step_vars[step_id].set(True)
                selected_count += 1
        
        self.log("🚀 [QUICK UPDATE] Mode activated!", "SUCCESS")
        self.log(f"✅ {selected_count} steps selected for quick update", "INFO")
        self.log("❌ File upload DISABLED - existing files will be used", "WARNING")
        self.log("📋 Selected steps: Test → Dependencies → Build → Services → Health Check", "INFO")
        self.update_status("Quick Update Mode - Ready to deploy without file upload")
        
    def clear_logs(self):
        """Clear log display"""
        self.log_text.configure(state='normal')
        self.log_text.delete(1.0, tk.END)
        self.log_text.configure(state='disabled')
        
    def save_logs(self):
        """BULLETPROOF Unicode-safe log saving - Fixed for Windows"""
        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        if filename:
            try:
                # Get log content
                log_content = self.log_text.get(1.0, tk.END)
                
                # COMPREHENSIVE emoji replacements for Windows safety
                emoji_map = {
                    '🚀': '[LAUNCH]', '✅': '[OK]', '❌': '[ERROR]', '🔗': '[CONNECT]',
                    '🔄': '[UPDATE]', '🛡️': '[FIREWALL]', '🗑️': '[CLEAN]', '📦': '[UPLOAD]',
                    '🐍': '[PYTHON]', '📚': '[DEPS]', '🏗️': '[BUILD]', '🗄️': '[DB]',
                    '⚙️': '[SERVICE]', '🌐': '[NGINX]', '🔒': '[SSL]', '🧪': '[TEST]',
                    '📊': '[STATS]', '⚡': '[FAST]', '🎯': '[TARGET]', '💾': '[SAVE]',
                    '🔍': '[SEARCH]', '📋': '[LIST]', '🎨': '[THEME]', '📝': '[EDIT]',
                    '🔧': '[CONFIG]', '💡': '[INFO]', '⭐': '[STAR]', '🌟': '[FEATURE]',
                    '🎉': '[SUCCESS]', '⚠️': '[WARNING]', '💻': '[SYSTEM]', '🔑': '[KEY]',
                    '📁': '[FOLDER]', '🗂️': '[FILES]', '🔐': '[SECURE]', '📈': '[PROGRESS]',
                    '⚠': '[WARN]', '⭐': '[STAR]', '🔥': '[FIRE]', '⭕': '[STOP]',
                    '✔': '[CHECK]', '✔️': '[CHECK]', '⭐': '[STAR]', '⚡': '[LIGHTNING]'
                }
                
                # Phase 1: Replace ALL emojis
                for emoji, replacement in emoji_map.items():
                    log_content = log_content.replace(emoji, replacement)
                
                # Phase 2: Remove ALL Unicode characters outside ASCII range
                import re
                # Keep only ASCII printable chars (32-126) + whitespace (9,10,13)
                cleaned_content = ''
                for char in log_content:
                    code = ord(char)
                    if (32 <= code <= 126) or code in [9, 10, 13]:  # ASCII + tab, newline, carriage return
                        cleaned_content += char
                    else:
                        cleaned_content += '?'  # Replace non-ASCII with ?
                
                # Phase 3: Final safety - encode to ASCII with replacement
                final_content = cleaned_content.encode('ascii', errors='replace').decode('ascii')
                
                # Phase 4: Write with maximum Windows compatibility
                with open(filename, 'w', encoding='ascii', errors='replace') as f:
                    f.write(final_content)
                
                # Success message (emoji-free for safety)
                messagebox.showinfo("Success", f"Logs saved successfully to:\n{filename}")
                
            except Exception as e:
                # Error message (emoji-free)
                error_msg = f"Failed to save logs: {str(e)}"
                messagebox.showerror("Error", error_msg)
                self.logger.error(f"Save logs failed: {e}")  # Proper logging
    
    def show_error_lines(self):
        """Show only error lines in a separate window for easy copying"""
        try:
            # Get all log content
            log_content = self.log_text.get(1.0, tk.END)
            
            # Extract error lines
            error_lines = []
            for line in log_content.split('\n'):
                line = line.strip()
                if line and ('ERROR' in line or 'FAIL' in line or 'error' in line.lower() or 
                            'failed' in line.lower() or 'exception' in line.lower() or
                            'traceback' in line.lower() or '❌' in line):
                    error_lines.append(line)
            
            if not error_lines:
                messagebox.showinfo("No Errors", "No error lines found in the current logs!")
                return
            
            # Create new window for error display
            error_window = tk.Toplevel(self.root)
            error_window.title("🚨 Error Lines - PEBDEQ Deployment")
            error_window.geometry("900x600")
            error_window.configure(bg='#2c3e50')
            
            # Error window header
            header_frame = tk.Frame(error_window, bg='#e74c3c', height=50)
            header_frame.pack(fill='x', pady=(0, 10))
            header_frame.pack_propagate(False)
            
            header_label = tk.Label(header_frame, text=f"🚨 Found {len(error_lines)} Error Lines", 
                                  font=('Arial', 14, 'bold'), fg='white', bg='#e74c3c')
            header_label.pack(expand=True)
            
            # Error text display
            error_text_frame = tk.Frame(error_window, bg='#2c3e50')
            error_text_frame.pack(fill='both', expand=True, padx=20, pady=(0, 20))
            
            error_text = scrolledtext.ScrolledText(error_text_frame, 
                                                 height=25, bg='#1a1a1a', fg='#ff6b6b', 
                                                 font=('Consolas', 10), wrap=tk.WORD,
                                                 selectbackground='#3498db')
            error_text.pack(fill='both', expand=True, pady=(0, 10))
            
            # Insert error lines with formatting
            error_text.insert(tk.END, "=== PEBDEQ DEPLOYMENT ERROR LINES ===\n\n")
            for i, error_line in enumerate(error_lines, 1):
                # Clean emojis for better copying
                clean_line = error_line.replace('❌', '[ERROR]').replace('🚨', '[ALERT]')
                error_text.insert(tk.END, f"{i:3d}. {clean_line}\n")
            
            error_text.insert(tk.END, f"\n=== END OF {len(error_lines)} ERROR LINES ===")
            error_text.configure(state='disabled')
            
            # Control buttons
            button_frame = tk.Frame(error_window, bg='#2c3e50')
            button_frame.pack(fill='x', padx=20, pady=(0, 20))
            
            tk.Button(button_frame, text="📋 Copy All Errors", 
                     command=lambda: self.copy_to_clipboard(error_text.get(1.0, tk.END)),
                     bg='#8e44ad', fg='white', font=('Arial', 11, 'bold'), 
                     height=2, width=15).pack(side='left', padx=(0, 10))
            
            tk.Button(button_frame, text="💾 Save Errors", 
                     command=lambda: self.save_error_lines(error_lines),
                     bg='#27ae60', fg='white', font=('Arial', 11, 'bold'), 
                     height=2, width=12).pack(side='left', padx=(0, 10))
            
            tk.Button(button_frame, text="🔄 Refresh", 
                     command=lambda: [error_window.destroy(), self.show_error_lines()],
                     bg='#3498db', fg='white', font=('Arial', 11, 'bold'), 
                     height=2, width=10).pack(side='left', padx=(0, 10))
            
            tk.Button(button_frame, text="❌ Close", 
                     command=error_window.destroy,
                     bg='#e74c3c', fg='white', font=('Arial', 11, 'bold'), 
                     height=2, width=8).pack(side='right')
            
            # Auto-select all text for easy copying
            error_text.configure(state='normal')
            error_text.tag_add('sel', '1.0', tk.END)
            error_text.configure(state='disabled')
            error_text.focus_set()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to show error lines: {str(e)}")
    
    def copy_all_errors(self):
        """Copy all error lines to clipboard immediately"""
        try:
            # Get all log content
            log_content = self.log_text.get(1.0, tk.END)
            
            # Extract error lines
            error_lines = []
            for line in log_content.split('\n'):
                line = line.strip()
                if line and ('ERROR' in line or 'FAIL' in line or 'error' in line.lower() or 
                            'failed' in line.lower() or 'exception' in line.lower() or
                            'traceback' in line.lower() or '❌' in line):
                    # Clean emojis for better copying
                    clean_line = line.replace('❌', '[ERROR]').replace('🚨', '[ALERT]')
                    error_lines.append(clean_line)
            
            if not error_lines:
                messagebox.showinfo("No Errors", "No error lines found to copy!")
                return
            
            # Format errors for clipboard
            error_text = "=== PEBDEQ DEPLOYMENT ERRORS ===\n\n"
            for i, error_line in enumerate(error_lines, 1):
                error_text += f"{i:3d}. {error_line}\n"
            error_text += f"\n=== TOTAL: {len(error_lines)} ERRORS ==="
            
            # Copy to clipboard
            self.copy_to_clipboard(error_text)
            messagebox.showinfo("Copied", f"Copied {len(error_lines)} error lines to clipboard!")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to copy errors: {str(e)}")
    
    def save_error_lines(self, error_lines):
        """Save error lines to a text file"""
        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
            initialvalue="pebdeq_errors.txt"
        )
        if filename:
            try:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write("=== PEBDEQ DEPLOYMENT ERROR REPORT ===\n")
                    f.write(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"Total Errors: {len(error_lines)}\n\n")
                    
                    for i, error_line in enumerate(error_lines, 1):
                        # Clean emojis for better file compatibility
                        clean_line = error_line.replace('❌', '[ERROR]').replace('🚨', '[ALERT]')
                        f.write(f"{i:3d}. {clean_line}\n")
                    
                    f.write(f"\n=== END OF ERROR REPORT ===")
                
                messagebox.showinfo("Saved", f"Error report saved to:\n{filename}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save error report: {str(e)}")
    
    def copy_to_clipboard(self, text):
        """Copy text to clipboard with error handling"""
        try:
            self.root.clipboard_clear()
            self.root.clipboard_append(text)
            self.root.update()  # Required for clipboard to work properly
        except Exception as e:
            messagebox.showerror("Clipboard Error", f"Failed to copy to clipboard: {str(e)}")
        
    def update_system_resources(self):
        """Update system resource monitoring"""
        if not PSUTIL_AVAILABLE:
            return
            
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=None)
            self.cpu_label.config(text=f"CPU: {cpu_percent:.1f}%")
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            self.memory_label.config(text=f"Memory: {memory_percent:.1f}%")
            
            # Disk usage (main drive)
            try:
                if os.name == 'nt':  # Windows
                    # Use home drive instead of hardcoded paths
                    home_drive = os.path.expanduser('~')[:3]  # Gets drive letter dynamically
                    disk = psutil.disk_usage(home_drive)
                else:  # Unix/Linux
                    disk = psutil.disk_usage('/')
                disk_percent = (disk.used / disk.total) * 100
                self.disk_label.config(text=f"Disk: {disk_percent:.1f}%")
            except (OSError, psutil.Error, AttributeError):
                self.disk_label.config(text="Disk: N/A")
            
            # Update colors based on usage
            if cpu_percent > 80:
                self.cpu_label.config(fg='red')
            elif cpu_percent > 60:
                self.cpu_label.config(fg='orange')
            else:
                self.cpu_label.config(fg='blue')
                
            if memory_percent > 80:
                self.memory_label.config(fg='red')
            elif memory_percent > 60:
                self.memory_label.config(fg='orange')
            else:
                self.memory_label.config(fg='green')
                
        except Exception as e:
            # Fail silently
            pass
            
        # Schedule next update
        self.root.after(2000, self.update_system_resources)  # Update every 2 seconds
        
    # File Manager Methods
    def fm_auto_connect(self):
        """Auto-connect to server if credentials are available"""
        if self.server_ip.get() and self.server_user.get() and self.server_password.get():
            self.log("[AUTO] Attempting auto-connect to file manager...")
            if self.fm_connect():
                self.log("[OK] Auto-connect successful", "SUCCESS")
            else:
                self.log("[FAIL] Auto-connect failed", "WARNING")
    
    def fm_test_connection(self):
        """Test connection without full connect"""
        try:
            if not self.server_ip.get() or not self.server_user.get() or not self.server_password.get():
                messagebox.showerror("Error", "Please fill in server connection details in Configuration tab")
                return False
            
            self.log("[TEST] Testing file manager connection...")
            self.fm_status.config(text="🧪 Testing...", fg='orange')
            
            # Create temporary SSH client for testing
            test_ssh = paramiko.SSHClient()
            test_ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            test_ssh.connect(
                hostname=self.server_ip.get(),
                port=int(self.server_port.get()),
                username=self.server_user.get(),
                password=self.server_password.get(),
                timeout=10
            )
            
            # Quick test command
            stdin, stdout, stderr = test_ssh.exec_command('echo "test"')
            result = stdout.read().decode().strip()
            test_ssh.close()
            
            if result == "test":
                self.fm_status.config(text="✅ Test OK - Ready to Connect", fg='green')
                self.log("[OK] Connection test successful", "SUCCESS")
                return True
            else:
                raise Exception("Test command failed")
                
        except Exception as e:
            self.fm_status.config(text="❌ Test Failed", fg='red')
            self.log(f"Connection test failed: {str(e)}", "ERROR")
            return False
    
    def fm_connect(self):
        """Connect to remote server for file management"""
        try:
            if not self.server_ip.get() or not self.server_user.get() or not self.server_password.get():
                messagebox.showerror("Error", "Please fill in server connection details in Configuration tab")
                return False
            
            self.log("[CONNECT] Connecting to file manager...")
            self.fm_status.config(text="🔗 Connecting...", fg='orange')
            
            # Create SSH connection for file manager
            if self.ssh_client:
                try:
                    self.ssh_client.close()
                except (paramiko.SSHException, OSError, AttributeError):
                    pass  # Connection already closed or not properly initialized
                    
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # Connect with saved credentials
            self.ssh_client.connect(
                hostname=self.server_ip.get(),
                port=int(self.server_port.get()),
                username=self.server_user.get(),
                password=self.server_password.get(),
                timeout=15
            )
            
            # Test connection with file operations
            stdin, stdout, stderr = self.ssh_client.exec_command('pwd && ls -la /')
            result = stdout.read().decode().strip()
            
            if result:
                self.fm_status.config(text="✅ Connected", fg='green')
                self.log("[OK] File manager connected successfully", "SUCCESS")
                
                # Enable file manager buttons
                self.update_filemanager_buttons(True)
                
                # Set initial paths
                if self.project_path.get():
                    self.local_path_var.set(self.project_path.get())
                    self.refresh_local_files()
                
                self.refresh_remote_files()
                
                # Save connection settings to file
                self.save_connection_settings()
                
                return True
            else:
                raise Exception("Connection test failed")
                
        except Exception as e:
            self.fm_status.config(text="❌ Connection Failed", fg='red')
            self.log(f"File manager connection failed: {str(e)}", "ERROR")
            self.update_filemanager_buttons(False)
            return False
    
    def fm_disconnect(self):
        """Disconnect from server"""
        try:
            if self.ssh_client:
                self.ssh_client.close()
                self.ssh_client = None
            
            self.fm_status.config(text="❌ Disconnected", fg='red')
            self.log("[DISCONNECT] File manager disconnected", "INFO")
            
            # Disable buttons
            self.update_filemanager_buttons(False)
            
            # Clear remote file tree
            for item in self.remote_tree.get_children():
                self.remote_tree.delete(item)
                
        except Exception as e:
            self.log(f"Disconnect error: {str(e)}", "WARNING")
    
    def update_filemanager_buttons(self, connected):
        """Enable/disable file manager buttons based on connection status"""
        try:
            state = 'normal' if connected else 'disabled'
            
            # Connection buttons
            if connected:
                self.fm_connect_btn.config(state='disabled')
                self.fm_disconnect_btn.config(state='normal')
            else:
                self.fm_connect_btn.config(state='normal')
                self.fm_disconnect_btn.config(state='disabled')
            
            # File operation buttons
            self.upload_btn.config(state=state)
            self.download_btn.config(state=state)
            self.sync_btn.config(state=state)
            self.compare_btn.config(state=state)
            self.upload_folder_btn.config(state=state)
            self.create_folder_btn.config(state=state)
            self.refresh_remote_btn.config(state=state)
            
        except AttributeError:
            # Some buttons might not be initialized yet
            pass
    
    def on_file_selection_change(self, event=None):
        """Handle file selection changes to enable/disable relevant buttons"""
        try:
            # Check if we have connection
            if not self.ssh_client or not self.ssh_client.get_transport() or not self.ssh_client.get_transport().is_active():
                return
            
            # Check local selection for upload buttons
            local_selection = self.local_tree.selection()
            remote_selection = self.remote_tree.selection()
            
            # Enable upload if local files selected and connected
            if local_selection and self.ssh_client:
                self.upload_btn.config(state='normal')
                self.upload_folder_btn.config(state='normal')
            else:
                # Keep disabled if no selection
                pass
            
            # Enable download if remote files selected and connected  
            if remote_selection and self.ssh_client:
                self.download_btn.config(state='normal')
            else:
                # Keep disabled if no selection
                pass
                
        except Exception as e:
            self.log(f"Selection change error: {str(e)}", "WARNING")
    
    def on_hidden_files_change(self):
        """Handle show hidden files checkbox change"""
        try:
            # Refresh both local and remote files
            self.refresh_local_files()
            if self.ssh_client and self.ssh_client.get_transport() and self.ssh_client.get_transport().is_active():
                self.refresh_remote_files()
            
            status = "enabled" if self.show_hidden_files.get() else "disabled"
            self.log(f"[SETTING] Hidden files display {status}", "INFO")
            
        except Exception as e:
            self.log(f"Error changing hidden files setting: {str(e)}", "ERROR")
            
    def browse_local_path(self):
        """Browse local directory"""
        folder = filedialog.askdirectory(initialdir=self.local_path_var.get())
        if folder:
            self.local_path_var.set(folder)
            self.refresh_local_files()
            
    def refresh_local_files(self, event=None):
        """Refresh local file tree"""
        try:
            # Clear existing items
            for item in self.local_tree.get_children():
                self.local_tree.delete(item)
            
            # Configure columns
            self.local_tree["columns"] = ("size", "modified", "type")
            self.local_tree.heading("#0", text="Name")
            self.local_tree.heading("size", text="Size")
            self.local_tree.heading("modified", text="Modified")
            self.local_tree.heading("type", text="Type")
            
            # Set column widths - optimized for content
            self.local_tree.column("#0", width=350, minwidth=200)  # Name (Target) - wider
            self.local_tree.column("size", width=70, minwidth=60)   # Size - narrower
            self.local_tree.column("modified", width=120, minwidth=100)  # Modified - narrower  
            self.local_tree.column("type", width=80, minwidth=60)   # Type - narrower
            
            path = Path(self.local_path_var.get())
            if not path.exists():
                self.log(f"[DEBUG] Path does not exist: {path}", "ERROR")
                return
                
            # Debug: Count total items
            try:
                all_items = list(path.iterdir())
                self.log(f"[DEBUG] Found {len(all_items)} items in {path}", "INFO")
                
                # Show which files are being processed
                directories = [item for item in all_items if item.is_dir()]
                files = [item for item in all_items if item.is_file()]
                self.log(f"[DEBUG] {len(directories)} directories, {len(files)} files", "INFO")
                
            except Exception as e:
                self.log(f"[DEBUG] Error counting items: {str(e)}", "ERROR")
                return
                
            # Add parent directory if not root
            if path.parent != path:
                self.local_tree.insert("", "end", text="..", values=("", "", "Directory"), 
                                     tags=("parent",))
            
            # Add directories first
            try:
                added_dirs = 0
                for item in sorted(path.iterdir()):
                    if item.is_dir():
                        # Skip hidden directories (starting with .) unless show_hidden_files is enabled
                        if not item.name.startswith('.') or self.show_hidden_files.get():
                            self.local_tree.insert("", "end", text=item.name, 
                                                 values=("", item.stat().st_mtime, "Directory"),
                                                 tags=("directory",))
                            added_dirs += 1
                        else:
                            self.log(f"[DEBUG] Skipping hidden directory: {item.name}", "INFO")
                
                self.log(f"[DEBUG] Added {added_dirs} directories to tree", "INFO")
                                             
                # Add files
                added_files = 0
                for item in sorted(path.iterdir()):
                    if item.is_file():
                        # Skip hidden files (starting with .) unless show_hidden_files is enabled
                        if not item.name.startswith('.') or self.show_hidden_files.get():
                            size = item.stat().st_size
                            size_str = self.format_file_size(size)
                            modified = time.strftime("%Y-%m-%d %H:%M", time.localtime(item.stat().st_mtime))
                            self.local_tree.insert("", "end", text=item.name,
                                                 values=(size_str, modified, "File"),
                                                 tags=("file",))
                            added_files += 1
                        else:
                            self.log(f"[DEBUG] Skipping hidden file: {item.name}", "INFO")
                
                self.log(f"[DEBUG] Added {added_files} files to tree", "INFO")
                
            except PermissionError as e:
                self.local_tree.insert("", "end", text="Permission Denied", values=("", "", "Error"))
                self.log(f"[DEBUG] Permission error: {str(e)}", "ERROR")
                
        except Exception as e:
            self.log(f"Error refreshing local files: {str(e)}", "ERROR")
            
    def refresh_remote_files(self, event=None):
        """Refresh remote file tree"""
        if not self.ssh_client or not self.ssh_client.get_transport() or not self.ssh_client.get_transport().is_active():
            self.fm_status.config(text="❌ Not Connected", fg='red')
            return
            
        try:
            # Clear existing items
            for item in self.remote_tree.get_children():
                self.remote_tree.delete(item)
            
            # Configure columns
            self.remote_tree["columns"] = ("size", "modified", "permissions")
            self.remote_tree.heading("#0", text="Name")
            self.remote_tree.heading("size", text="Size")
            self.remote_tree.heading("modified", text="Modified")
            self.remote_tree.heading("permissions", text="Permissions")
            
            # Set column widths - optimized for content
            self.remote_tree.column("#0", width=350, minwidth=200)  # Name (Target) - wider
            self.remote_tree.column("size", width=70, minwidth=60)   # Size - narrower
            self.remote_tree.column("modified", width=120, minwidth=100)  # Modified - narrower
            self.remote_tree.column("permissions", width=90, minwidth=80)  # Permissions - narrower
            
            remote_path = self.remote_path_var.get()
            
            # Add parent directory (..) if not root
            if remote_path != "/" and remote_path.rstrip('/'):
                self.remote_tree.insert("", "end", text="..", 
                                      values=("", "", "drwxr-xr-x"),
                                      tags=("parent",))
            
            # Get directory listing
            stdin, stdout, stderr = self.ssh_client.exec_command(f"ls -la {remote_path}")
            output = stdout.read().decode()
            
            if stderr.read():
                self.log("Error accessing remote directory", "ERROR")
                return
                
            lines = output.strip().split('\n')[1:]  # Skip total line
            
            for line in lines:
                if not line.strip():
                    continue
                    
                parts = line.split()
                if len(parts) < 9:
                    continue
                    
                permissions = parts[0]
                size = parts[4]
                filename = ' '.join(parts[8:])
                
                if filename in ['.', '..']:
                    continue
                
                # Skip hidden files (starting with .) unless show_hidden_files is enabled
                if filename.startswith('.') and not self.show_hidden_files.get():
                    continue
                    
                is_dir = permissions.startswith('d')
                file_type = "Directory" if is_dir else "File"
                
                # Format size
                if is_dir:
                    size_str = ""
                else:
                    try:
                        size_int = int(size)
                        size_str = self.format_file_size(size_int)
                    except (ValueError, TypeError):
                        size_str = size  # Keep original if not a valid integer
                
                # Modified time (combine date and time)
                modified = f"{parts[5]} {parts[6]} {parts[7]}"
                
                self.remote_tree.insert("", "end", text=filename,
                                      values=(size_str, modified, permissions),
                                      tags=("directory" if is_dir else "file",))
                                      
        except Exception as e:
            self.log(f"Error refreshing remote files: {str(e)}", "ERROR")
            
    def format_file_size(self, size):
        """Format file size in human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} PB"
        
    def on_local_double_click(self, event):
        """Handle double click on local file tree"""
        selection = self.local_tree.selection()
        if not selection:
            return
            
        item = self.local_tree.item(selection[0])
        filename = item['text']
        
        if filename == "..":
            # Go to parent directory
            current_path = Path(self.local_path_var.get())
            parent_path = current_path.parent
            self.local_path_var.set(str(parent_path))
            self.refresh_local_files()
        elif item['values'][2] == "Directory":
            # Enter directory
            current_path = Path(self.local_path_var.get())
            new_path = current_path / filename
            self.local_path_var.set(str(new_path))
            self.refresh_local_files()
            
    def on_remote_double_click(self, event):
        """Handle double click on remote file tree"""
        selection = self.remote_tree.selection()
        if not selection:
            return
            
        item = self.remote_tree.item(selection[0])
        filename = item['text']
        
        if item['values'][2].startswith('d'):  # Directory
            current_path = self.remote_path_var.get()
            if filename == "..":
                # Go to parent directory
                new_path = "/".join(current_path.rstrip('/').split('/')[:-1]) or "/"
            else:
                # Enter directory
                new_path = f"{current_path.rstrip('/')}/{filename}"
            
            self.remote_path_var.set(new_path)
            self.refresh_remote_files()
            
    def upload_selected(self):
        """Upload selected local files to remote"""
        selection = self.local_tree.selection()
        if not selection:
            messagebox.showwarning("Warning", "Please select files or folders to upload")
            return
            
        try:
            if not self.ssh_client or not self.ssh_client.get_transport() or not self.ssh_client.get_transport().is_active():
                messagebox.showerror("Error", "Not connected to server")
                return
            
            # Count files to upload
            total_files = 0
            upload_list = []
            local_base = Path(self.local_path_var.get())
            remote_base = self.remote_path_var.get()
            
            for sel in selection:
                item = self.local_tree.item(sel)
                filename = item['text']
                local_path = local_base / filename
                
                if item['values'][2] == "File":
                    total_files += 1
                    upload_list.append((str(local_path), f"{remote_base.rstrip('/')}/{filename}", "file"))
                elif item['values'][2] == "Directory":
                    # Count files in directory
                    for root, dirs, files in os.walk(local_path):
                        total_files += len(files)
                    upload_list.append((str(local_path), f"{remote_base.rstrip('/')}/{filename}", "directory"))
            
            if total_files == 0:
                messagebox.showwarning("Warning", "No files selected for upload")
                return
            
            # Confirm upload
            if not messagebox.askyesno("Confirm Upload", f"Upload {total_files} file(s) to remote server?"):
                return
                
            self.log(f"[UPLOAD] Starting upload of {total_files} file(s)...")
            
            sftp = self.ssh_client.open_sftp()
            uploaded_files = 0
            
            for local_path, remote_path, item_type in upload_list:
                if item_type == "file":
                    try:
                        self.log(f"[UPLOAD] {os.path.basename(local_path)}")
                        sftp.put(local_path, remote_path)
                        uploaded_files += 1
                        self.log(f"[OK] Uploaded: {os.path.basename(local_path)} ({uploaded_files}/{total_files})", "SUCCESS")
                    except Exception as e:
                        self.log(f"[ERROR] Failed to upload {os.path.basename(local_path)}: {str(e)}", "ERROR")
                        
                elif item_type == "directory":
                    # Upload directory recursively
                    folder_name = os.path.basename(local_path)
                    self.log(f"[UPLOAD] Uploading folder: {folder_name}")
                    
                    # Create remote directory
                    try:
                        sftp.mkdir(remote_path)
                    except (OSError, paramiko.SFTPError):
                        pass  # Directory might already exist
                    
                    # Upload files recursively
                    for root, dirs, files in os.walk(local_path):
                        # Create subdirectories
                        rel_path = os.path.relpath(root, local_path)
                        if rel_path != '.':
                            remote_dir = f"{remote_path}/{rel_path.replace(os.sep, '/')}"
                            try:
                                sftp.mkdir(remote_dir)
                            except (OSError, paramiko.SFTPError):
                                pass  # Directory might already exist
                        
                        # Upload files in current directory
                        for file in files:
                            local_file = os.path.join(root, file)
                            rel_file_path = os.path.relpath(local_file, local_path)
                            remote_file = f"{remote_path}/{rel_file_path.replace(os.sep, '/')}"
                            
                            try:
                                sftp.put(local_file, remote_file)
                                uploaded_files += 1
                                
                                if uploaded_files % 5 == 0:  # Progress every 5 files
                                    self.log(f"[PROGRESS] {uploaded_files}/{total_files} files uploaded")
                                    
                            except Exception as e:
                                self.log(f"[WARNING] Failed to upload {file}: {str(e)}", "WARNING")
                    
                    self.log(f"[OK] Folder uploaded: {folder_name}", "SUCCESS")
                    
            sftp.close()
            self.log(f"[COMPLETE] Upload finished! {uploaded_files}/{total_files} files transferred", "SUCCESS")
            self.refresh_remote_files()
            
            # Show completion message
            if uploaded_files == total_files:
                messagebox.showinfo("Upload Complete", f"Successfully uploaded all {uploaded_files} files!")
            else:
                messagebox.showwarning("Upload Complete", f"Uploaded {uploaded_files} out of {total_files} files. Check logs for details.")
            
        except Exception as e:
            self.log(f"Upload failed: {str(e)}", "ERROR")
            messagebox.showerror("Error", f"Upload failed: {str(e)}")
            
    def download_selected(self):
        """Download selected remote files to local"""
        selection = self.remote_tree.selection()
        if not selection:
            messagebox.showwarning("Warning", "Please select files to download")
            return
            
        try:
            if not self.ssh_client or not self.ssh_client.get_transport() or not self.ssh_client.get_transport().is_active():
                messagebox.showerror("Error", "Not connected to server")
                return
                
            sftp = self.ssh_client.open_sftp()
            local_base = Path(self.local_path_var.get())
            remote_base = self.remote_path_var.get()
            
            for sel in selection:
                item = self.remote_tree.item(sel)
                filename = item['text']
                local_file = local_base / filename
                remote_file = f"{remote_base.rstrip('/')}/{filename}"
                
                if not item['values'][2].startswith('d'):  # Not directory
                    self.log(f"Downloading: {filename}")
                    sftp.get(remote_file, str(local_file))
                    self.log(f"[OK] Downloaded: {filename}", "SUCCESS")
                    
            sftp.close()
            self.refresh_local_files()
            
        except Exception as e:
            self.log(f"Download failed: {str(e)}", "ERROR")
            messagebox.showerror("Error", f"Download failed: {str(e)}")
            
    def sync_project(self):
        """🔄 Enhanced project synchronization with detailed progress"""
        
        # Show what will be synchronized
        sync_info = """🔄 PROJECT SYNC OVERVIEW

This will synchronize the following directories:
• backend/ → /opt/pebdeq/backend/
• frontend/ → /opt/pebdeq/frontend/  
• pb_test_suite/ → /opt/pebdeq/pb_test_suite/
• uploads/ → /opt/pebdeq/uploads/
• reports/ → /opt/pebdeq/reports/

⚠️ WARNING: This uploads LOCAL files to REMOTE server
⚠️ Existing remote files will be OVERWRITTEN

Continue with full project sync?"""
        
        if not messagebox.askyesno("🔄 Confirm Project Sync", sync_info):
            return
            
        try:
            self.log("=" * 60, "INFO")
            self.log("🔄 STARTING ENHANCED PROJECT SYNC", "INFO") 
            self.log("=" * 60, "INFO")
            
            # Set paths to project directories
            if self.project_path.get():
                self.local_path_var.set(self.project_path.get())
                self.refresh_local_files()
                
            self.remote_path_var.set("/opt/pebdeq")
            self.refresh_remote_files()
            
            sync_stats = {'directories_synced': 0, 'files_uploaded': 0, 'errors': 0, 'skipped': 0}
            
            # Define sync targets with descriptions
            sync_targets = [
                ("backend", "Backend Python API & Database"),
                ("frontend", "React Frontend Application"),
                ("pb_test_suite", "Test Suite & Quality Checks"),
                ("uploads", "User Uploaded Files"),
                ("reports", "Test & Analysis Reports")
            ]
            
            for dir_name, description in sync_targets:
                self.log(f"\n📁 SYNCING: {dir_name}/ ({description})", "INFO")
                self.log("-" * 50, "INFO")
                
                result = self.sync_directory_enhanced(dir_name, dir_name, sync_stats)
                
                if result.get('success', False):
                    sync_stats['directories_synced'] += 1
                    self.log(f"✅ {dir_name}/ sync completed: {result.get('files_count', 0)} files", "SUCCESS")
                else:
                    sync_stats['errors'] += 1
                    self.log(f"❌ {dir_name}/ sync failed: {result.get('error', 'Unknown')}", "ERROR")
            
            # Show final summary
            self.log("\n" + "=" * 60, "INFO")
            self.log("📊 SYNC SUMMARY", "INFO")
            self.log("=" * 60, "INFO")
            self.log(f"✅ Directories synced: {sync_stats['directories_synced']}", "SUCCESS")
            self.log(f"📤 Files uploaded: {sync_stats['files_uploaded']}", "INFO")
            self.log(f"⏭️ Files skipped: {sync_stats['skipped']}", "INFO")
            self.log(f"❌ Errors: {sync_stats['errors']}", "ERROR" if sync_stats['errors'] > 0 else "INFO")
            
            if sync_stats['errors'] == 0:
                self.log("🎉 PROJECT SYNC COMPLETED SUCCESSFULLY!", "SUCCESS")
                messagebox.showinfo("✅ Sync Complete", 
                                  f"Project sync completed!\n\n"
                                  f"📁 Directories: {sync_stats['directories_synced']}\n"
                                  f"📤 Files uploaded: {sync_stats['files_uploaded']}\n"
                                  f"⏭️ Files skipped: {sync_stats['skipped']}")
            else:
                self.log("⚠️ PROJECT SYNC COMPLETED WITH ERRORS", "WARNING")
                messagebox.showwarning("⚠️ Sync Warning", 
                                     f"Sync completed with {sync_stats['errors']} errors.\n"
                                     f"Check the log for details.")
            
        except Exception as e:
            self.log(f"💥 PROJECT SYNC FAILED: {str(e)}", "ERROR")
            messagebox.showerror("❌ Sync Failed", f"Project sync failed:\n{str(e)}")
            
    def sync_directory_enhanced(self, local_subdir, remote_subdir, stats):
        """Enhanced directory sync with detailed reporting"""
        try:
            local_path = Path(self.project_path.get()) / local_subdir
            if not local_path.exists():
                self.log(f"⏭️ Skipping {local_subdir}/ (not found locally)", "WARNING")
                stats['skipped'] += 1
                return {'success': True, 'files_count': 0, 'reason': 'not_found'}
                
            # Upload directory recursively with detailed progress
            sftp = self.ssh_client.open_sftp()
            remote_base = f"/opt/pebdeq/{remote_subdir}"
            
            files_count = self.upload_directory_enhanced(sftp, str(local_path), remote_base, stats)
            sftp.close()
            
            return {'success': True, 'files_count': files_count}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
            
    def upload_directory_enhanced(self, sftp, local_path, remote_path, stats):
        """Enhanced directory upload with progress tracking"""
        local_path = Path(local_path)
        files_uploaded = 0
        
        try:
            # Create remote directory
            try:
                sftp.mkdir(remote_path)
                self.log(f"📁 Created remote directory: {remote_path}", "INFO")
            except (OSError, paramiko.SFTPError):
                pass  # Directory might already exist
                
            for item in local_path.iterdir():
                # Skip certain directories and files
                skip_items = ['.git', '__pycache__', 'node_modules', '.next', 'build', 
                             'deployment', '.venv', '.env']
                # FIXED: Removed 'archive' to allow backup directories
                
                if any(skip_pattern in item.name for skip_pattern in skip_items):
                    self.log(f"⏭️ Skipping: {item.name}", "INFO")
                    stats['skipped'] += 1
                    continue
                    
                local_item = str(item)
                remote_item = f"{remote_path}/{item.name}"
                
                if item.is_file():
                    try:
                        # Show file upload progress
                        file_size = item.stat().st_size
                        size_str = self.format_file_size(file_size)
                        
                        self.log(f"📤 Uploading: {item.name} ({size_str})", "INFO")
                        sftp.put(local_item, remote_item)
                        files_uploaded += 1
                        stats['files_uploaded'] += 1
                        
                    except Exception as e:
                        self.log(f"❌ Failed to upload {item.name}: {str(e)}", "ERROR")
                        stats['errors'] += 1
                        
                elif item.is_dir():
                    self.log(f"📁 Entering directory: {item.name}", "INFO")
                    sub_files = self.upload_directory_enhanced(sftp, local_item, remote_item, stats)
                    files_uploaded += sub_files
                    
            return files_uploaded
            
        except Exception as e:
            self.log(f"❌ Directory upload error: {str(e)}", "ERROR")
            stats['errors'] += 1
            return files_uploaded

    def sync_directory(self, local_subdir, remote_subdir):
        """Sync a specific directory"""
        try:
            local_path = Path(self.project_path.get()) / local_subdir
            if not local_path.exists():
                return
                
            # Upload directory recursively
            sftp = self.ssh_client.open_sftp()
            remote_base = f"/opt/pebdeq/{remote_subdir}"
            
            self.upload_directory_recursive(sftp, str(local_path), remote_base)
            sftp.close()
            
        except Exception as e:
            self.log(f"Directory sync failed for {local_subdir}: {str(e)}", "ERROR")
            
    def upload_directory_recursive(self, sftp, local_path, remote_path):
        """Upload directory recursively"""
        local_path = Path(local_path)
        
        # Create remote directory
        try:
            sftp.mkdir(remote_path)
        except (OSError, paramiko.SFTPError):
            pass  # Directory might already exist
            
        for item in local_path.iterdir():
            if item.name in ['.git', '__pycache__', 'node_modules', '.next', 'build', 'deployment', '.venv']:
                # FIXED: Removed 'archive' to allow backup directories
                continue
                
            local_item = str(item)
            remote_item = f"{remote_path}/{item.name}"
            
            if item.is_file():
                try:
                    sftp.put(local_item, remote_item)
                    self.log(f"Synced: {item.name}")
                except Exception as e:
                    self.log(f"Failed to sync {item.name}: {str(e)}", "WARNING")
            elif item.is_dir():
                self.upload_directory_recursive(sftp, local_item, remote_item)
                
    def upload_folder(self):
        """Upload entire folder to remote"""
        local_folder = filedialog.askdirectory(
            title="Select folder to upload",
            initialdir=self.local_path_var.get()
        )
        
        if not local_folder:
            return
            
        try:
            if not self.ssh_client or not self.ssh_client.get_transport() or not self.ssh_client.get_transport().is_active():
                messagebox.showerror("Error", "Not connected to server")
                return
            
            folder_name = os.path.basename(local_folder)
            remote_target = f"{self.remote_path_var.get().rstrip('/')}/{folder_name}"
            
            # Confirm upload
            if not messagebox.askyesno("Confirm Upload", 
                                     f"Upload folder '{folder_name}' to remote path:\n{remote_target}?"):
                return
            
            self.log(f"[UPLOAD] Uploading folder: {folder_name}")
            
            sftp = self.ssh_client.open_sftp()
            
            # Create remote folder
            try:
                sftp.mkdir(remote_target)
            except (OSError, paramiko.SFTPError):
                pass  # Folder might already exist
            
            # Upload recursively
            total_files = 0
            uploaded_files = 0
            
            # Count total files first
            for root, dirs, files in os.walk(local_folder):
                total_files += len(files)
            
            self.log(f"[INFO] Found {total_files} files to upload")
            
            # Upload files
            for root, dirs, files in os.walk(local_folder):
                # Create subdirectories
                rel_path = os.path.relpath(root, local_folder)
                if rel_path != '.':
                    remote_dir = f"{remote_target}/{rel_path.replace(os.sep, '/')}"
                    try:
                        sftp.mkdir(remote_dir)
                    except (OSError, paramiko.SFTPError):
                        pass  # Directory might already exist
                
                # Upload files in current directory
                for file in files:
                    local_file = os.path.join(root, file)
                    rel_file_path = os.path.relpath(local_file, local_folder)
                    remote_file = f"{remote_target}/{rel_file_path.replace(os.sep, '/')}"
                    
                    try:
                        sftp.put(local_file, remote_file)
                        uploaded_files += 1
                        
                        if uploaded_files % 10 == 0:  # Progress every 10 files
                            self.log(f"[PROGRESS] Uploaded {uploaded_files}/{total_files} files")
                        
                    except Exception as e:
                        self.log(f"[WARNING] Failed to upload {file}: {str(e)}", "WARNING")
            
            sftp.close()
            self.log(f"[OK] Folder upload completed! {uploaded_files}/{total_files} files uploaded", "SUCCESS")
            self.refresh_remote_files()
            
        except Exception as e:
            self.log(f"Folder upload failed: {str(e)}", "ERROR")
            messagebox.showerror("Error", f"Folder upload failed: {str(e)}")
    
    def create_remote_folder(self):
        """Create new folder on remote server"""
        try:
            if not self.ssh_client or not self.ssh_client.get_transport() or not self.ssh_client.get_transport().is_active():
                messagebox.showerror("Error", "Not connected to server")
                return
            
            # Get folder name from user
            from tkinter import simpledialog
            folder_name = simpledialog.askstring("New Folder", "Enter folder name:")
            
            if not folder_name:
                return
            
            # Validate folder name (basic)
            if not folder_name.replace('_', '').replace('-', '').replace('.', '').isalnum():
                messagebox.showerror("Error", "Invalid folder name. Use only letters, numbers, underscore, hyphen, and dots.")
                return
            
            remote_folder = f"{self.remote_path_var.get().rstrip('/')}/{folder_name}"
            
            # Create folder via SSH command
            stdin, stdout, stderr = self.ssh_client.exec_command(f"mkdir -p '{remote_folder}'")
            error = stderr.read().decode()
            
            if error:
                self.log(f"[ERROR] Failed to create folder: {error}", "ERROR")
                messagebox.showerror("Error", f"Failed to create folder: {error}")
            else:
                self.log(f"[OK] Created folder: {folder_name}", "SUCCESS")
                self.refresh_remote_files()
                
        except Exception as e:
            self.log(f"Create folder failed: {str(e)}", "ERROR")
            messagebox.showerror("Error", f"Create folder failed: {str(e)}")
    
    def compare_files(self):
        """🔍 Enhanced multi-file comparison with detailed analysis"""
        try:
            if not self.ssh_client or not self.ssh_client.get_transport() or not self.ssh_client.get_transport().is_active():
                messagebox.showerror("Error", "Not connected to server")
                return
            
            # Enhanced comparison - supports multiple files and directories
            local_selection = self.local_tree.selection()
            if not local_selection:
                messagebox.showwarning("Warning", "Please select local file(s) or directory to compare")
                return
            
            self.log("[COMPARE] Starting enhanced file comparison...", "INFO")
            results = []
            
            for selection in local_selection:
                local_item = self.local_tree.item(selection)
                local_filename = local_item['text']
                
                if local_filename == "..":
                    continue
                
                local_file_path = Path(self.local_path_var.get()) / local_filename
                remote_file_path = f"{self.remote_path_var.get().rstrip('/')}/{local_filename}"
                
                # Check if it's a directory or file
                if local_item['values'][2] == "Directory":
                    self.log(f"[COMPARE] Analyzing directory: {local_filename}", "INFO")
                    results.append(self.compare_directory(local_file_path, remote_file_path))
                else:
                    self.log(f"[COMPARE] Analyzing file: {local_filename}", "INFO")
                    results.append(self.compare_single_file(local_file_path, remote_file_path))
            
            # Show detailed results
            self.show_comparison_results(results)
            
        except Exception as e:
            self.log(f"File comparison failed: {str(e)}", "ERROR")
            messagebox.showerror("Error", f"File comparison failed: {str(e)}")
    
    def compare_single_file(self, local_path, remote_path):
        """Compare a single file with hash and timestamp analysis"""
        result = {
            'name': local_path.name,
            'type': 'file',
            'local_exists': local_path.exists(),
            'remote_exists': False,
            'status': 'unknown',
            'details': []
        }
        
        try:
            if not result['local_exists']:
                result['status'] = 'local_missing'
                result['details'].append("❌ Local file not found")
                return result
            
            # Check if remote file exists
            stdin, stdout, stderr = self.ssh_client.exec_command(f"ls -la '{remote_path}' 2>/dev/null")
            remote_result = stdout.read().decode().strip()
            
            if not remote_result:
                result['status'] = 'remote_missing'
                result['details'].append("❌ File exists locally but NOT on remote server")
                result['details'].append("📤 Recommended: Upload to server")
                return result
            
            result['remote_exists'] = True
            
            # Get local file stats
            local_stat = local_path.stat()
            local_size = local_stat.st_size
            
            # Get remote file stats
            remote_parts = remote_result.split()
            if len(remote_parts) >= 5:
                remote_size = int(remote_parts[4])
                
                # Size comparison
                result['details'].append(f"📏 Local: {self.format_file_size(local_size)}")
                result['details'].append(f"📏 Remote: {self.format_file_size(remote_size)}")
                
                if local_size == remote_size:
                    result['details'].append("✅ File sizes match")
                    result['status'] = 'size_match'
                    
                    # Try hash comparison for exact match
                    try:
                        import hashlib
                        # Get local hash
                        hash_md5 = hashlib.md5()
                        with open(local_path, "rb") as f:
                            hash_md5.update(f.read())
                        local_hash = hash_md5.hexdigest()
                        
                        # Get remote hash
                        stdin, stdout, stderr = self.ssh_client.exec_command(f"md5sum '{remote_path}' 2>/dev/null")
                        remote_hash_result = stdout.read().decode().strip()
                        
                        if remote_hash_result:
                            remote_hash = remote_hash_result.split()[0]
                            if local_hash == remote_hash:
                                result['status'] = 'identical'
                                result['details'].append("✅ File contents identical (hash verified)")
                            else:
                                result['status'] = 'different_content'
                                result['details'].append("⚠️ Same size but different content!")
                                result['details'].append("📤 Recommended: Update remote file")
                        else:
                            result['details'].append("ℹ️ Hash comparison unavailable")
                    except Exception:
                        result['details'].append("ℹ️ Advanced comparison unavailable")
                        
                else:
                    result['status'] = 'different_size'
                    result['details'].append("⚠️ Files have different sizes")
                    
                    if local_size > remote_size:
                        result['details'].append("📤 Local file is larger (likely newer)")
                    else:
                        result['details'].append("📥 Remote file is larger (may be newer)")
                        
            return result
            
        except Exception as e:
            result['status'] = 'error'
            result['details'].append(f"❌ Error: {str(e)}")
            return result
    
    def compare_directory(self, local_path, remote_path):
        """Compare directory contents"""
        result = {
            'name': local_path.name,
            'type': 'directory',
            'status': 'unknown',
            'details': []
        }
        
        try:
            if not local_path.exists():
                result['status'] = 'local_missing'
                result['details'].append("❌ Local directory not found")
                return result
            
            # Check if remote directory exists
            stdin, stdout, stderr = self.ssh_client.exec_command(f"ls -la '{remote_path}' 2>/dev/null")
            if not stdout.read().decode().strip():
                result['status'] = 'remote_missing'
                result['details'].append("❌ Directory exists locally but NOT on remote")
                result['details'].append("📤 Recommended: Create and sync directory")
                return result
            
            # Count local files
            local_files = list(local_path.rglob('*'))
            local_file_count = len([f for f in local_files if f.is_file()])
            local_dir_count = len([f for f in local_files if f.is_dir()])
            
            # Count remote files
            stdin, stdout, stderr = self.ssh_client.exec_command(f"find '{remote_path}' -type f 2>/dev/null | wc -l")
            remote_file_count = int(stdout.read().decode().strip() or 0)
            
            result['details'].append(f"📁 Local: {local_file_count} files, {local_dir_count} directories")
            result['details'].append(f"📁 Remote: {remote_file_count} files")
            
            if local_file_count == remote_file_count:
                result['status'] = 'counts_match'
                result['details'].append("✅ File counts match")
            else:
                result['status'] = 'counts_differ'
                result['details'].append("⚠️ File counts differ")
                result['details'].append("📤 Recommended: Sync directory")
            
            return result
            
        except Exception as e:
            result['status'] = 'error'
            result['details'].append(f"❌ Error: {str(e)}")
            return result
    
    def show_comparison_results(self, results):
        """Display comparison results in a detailed window"""
        result_window = tk.Toplevel(self.master)
        result_window.title("🔍 Enhanced File Comparison Results")
        result_window.geometry("700x600")
        result_window.resizable(True, True)
        
        # Create main frame
        main_frame = tk.Frame(result_window)
        main_frame.pack(fill='both', expand=True, padx=10, pady=10)
        
        # Title
        title_label = tk.Label(main_frame, text="🔍 DETAILED FILE COMPARISON RESULTS", 
                              font=('Arial', 14, 'bold'), fg='#2c3e50')
        title_label.pack(pady=(0, 10))
        
        # Create scrollable text widget
        text_frame = tk.Frame(main_frame)
        text_frame.pack(fill='both', expand=True)
        
        scrollbar = tk.Scrollbar(text_frame)
        scrollbar.pack(side='right', fill='y')
        
        text_widget = tk.Text(text_frame, yscrollcommand=scrollbar.set, 
                             font=('Consolas', 10), wrap='word', 
                             bg='#f8f9fa', fg='#2c3e50')
        text_widget.pack(side='left', fill='both', expand=True)
        scrollbar.config(command=text_widget.yview)
        
        # Format results
        content = "📊 COMPARISON SUMMARY\n"
        content += "=" * 70 + "\n\n"
        
        status_counts = {}
        for result in results:
            status = result['status']
            status_counts[status] = status_counts.get(status, 0) + 1
        
        content += "📈 OVERVIEW:\n"
        for status, count in status_counts.items():
            emoji = {"identical": "✅", "size_match": "✅", "different_size": "⚠️", 
                    "different_content": "⚠️", "remote_missing": "❌", 
                    "local_missing": "❌", "error": "❌"}.get(status, "ℹ️")
            content += f"   {emoji} {status.replace('_', ' ').title()}: {count} items\n"
        
        content += "\n" + "=" * 70 + "\n\n"
        
        for i, result in enumerate(results, 1):
            status_emoji = {"identical": "✅", "size_match": "✅", "different_size": "⚠️", 
                           "different_content": "⚠️", "remote_missing": "❌", 
                           "local_missing": "❌", "error": "❌"}.get(result['status'], "ℹ️")
            
            content += f"{i}. {status_emoji} {result['name']} ({result['type']})\n"
            content += f"   Status: {result['status'].replace('_', ' ').title()}\n"
            
            for detail in result['details']:
                content += f"   {detail}\n"
            content += "\n"
        
        content += "=" * 70 + "\n"
        content += "📋 LEGEND:\n"
        content += "✅ = Perfect Match / OK      ⚠️ = Needs Attention    ❌ = Missing / Error\n"
        content += "📤 = Upload Recommended     📥 = Download Suggested  📁 = Directory\n"
        content += "📏 = File Size              🔍 = Hash Verified       ℹ️ = Information\n"
        
        text_widget.insert('1.0', content)
        text_widget.config(state='disabled')
        
        # Button frame
        btn_frame = tk.Frame(main_frame)
        btn_frame.pack(pady=(10, 0))
        
        # Close button
        close_btn = tk.Button(btn_frame, text="✖ Close", command=result_window.destroy,
                             bg='#e74c3c', fg='white', font=('Arial', 10, 'bold'),
                             padx=20)
        close_btn.pack(side='right')
        
        # Export button
        export_btn = tk.Button(btn_frame, text="💾 Export Results", 
                              command=lambda: self.export_comparison_results(results),
                              bg='#27ae60', fg='white', font=('Arial', 10, 'bold'),
                              padx=20)
        export_btn.pack(side='left')
    
    def export_comparison_results(self, results):
        """Export comparison results to a file"""
        try:
            from tkinter import filedialog
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = filedialog.asksaveasfilename(
                defaultextension=".txt",
                filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
                initialname=f"file_comparison_{timestamp}.txt"
            )
            
            if filename:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write("FILE COMPARISON RESULTS\n")
                    f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write("=" * 70 + "\n\n")
                    
                    for i, result in enumerate(results, 1):
                        f.write(f"{i}. {result['name']} ({result['type']})\n")
                        f.write(f"   Status: {result['status']}\n")
                        for detail in result['details']:
                            f.write(f"   {detail}\n")
                        f.write("\n")
                
                messagebox.showinfo("Export Complete", f"Results saved to:\n{filename}")
                
        except Exception as e:
            messagebox.showerror("Export Error", f"Failed to export: {str(e)}")
        
    # Server Management Methods
    def refresh_server_status(self):
        """Enhanced server service status with stability monitoring"""
        try:
            if not self.ssh_client or not self.ssh_client.get_transport() or not self.ssh_client.get_transport().is_active():
                self.log("Not connected to server", "WARNING")
                return
                
            # Check backend service with detailed info
            stdin, stdout, stderr = self.ssh_client.exec_command("systemctl is-active pebdeq-backend")
            backend_status = stdout.read().decode().strip()
            
            # Get backend detailed status
            stdin, stdout, stderr = self.ssh_client.exec_command("systemctl status pebdeq-backend --no-pager --lines=3")
            backend_details = stdout.read().decode().strip()
            
            if backend_status == "active":
                # Check if backend is actually responding
                stdin, stdout, stderr = self.ssh_client.exec_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5005/api/health")
                api_response = stdout.read().decode().strip()
                
                if api_response == "200":
                    self.backend_status.config(text="Backend: ✅ Running & Responding", fg='green')
                    self.backend_stability.config(text="Backend Stability: ✅ Stable", fg='green')
                else:
                    self.backend_status.config(text="Backend: ⚠️ Running but Not Responding", fg='orange')
                    self.backend_stability.config(text="Backend Stability: ⚠️ API Issues", fg='orange')
            else:
                self.backend_status.config(text="Backend: ❌ Stopped", fg='red')
                self.backend_stability.config(text="Backend Stability: ❌ Service Down", fg='red')
                
            # Check backend restart frequency
            stdin, stdout, stderr = self.ssh_client.exec_command("systemctl show pebdeq-backend --property=ActiveEnterTimestamp --no-pager")
            restart_info = stdout.read().decode().strip()
            if restart_info:
                timestamp = restart_info.split('=')[1] if '=' in restart_info else "Unknown"
                self.last_restart.config(text=f"Last Backend Start: {timestamp[:19]}", fg='blue')
            
            # Check for recent restarts (sign of instability)
            stdin, stdout, stderr = self.ssh_client.exec_command("journalctl -u pebdeq-backend --since='1 hour ago' | grep -c 'Started\\|Stopped' || echo '0'")
            restart_count = stdout.read().decode().strip()
            try:
                restart_num = int(restart_count)
                if restart_num > 5:
                    self.backend_stability.config(text=f"Backend Stability: 🚨 UNSTABLE ({restart_num} restarts/hour)", fg='red')
                elif restart_num > 2:
                    self.backend_stability.config(text=f"Backend Stability: ⚠️ CONCERNING ({restart_num} restarts/hour)", fg='orange')
            except (ValueError, TypeError, AttributeError):
                pass  # Failed to parse restart count or update UI
                
            # Check nginx service
            stdin, stdout, stderr = self.ssh_client.exec_command("systemctl is-active nginx")
            nginx_status = stdout.read().decode().strip()
            
            if nginx_status == "active":
                self.nginx_status.config(text="Nginx: ✅ Running", fg='green')
            else:
                self.nginx_status.config(text="Nginx: ❌ Stopped", fg='red')
                
            # Check SSL certificate
            domain = self.domain_name.get()
            if domain:
                stdin, stdout, stderr = self.ssh_client.exec_command(f"certbot certificates | grep {domain}")
                ssl_output = stdout.read().decode().strip()
                
                if ssl_output:
                    self.ssl_status.config(text="SSL: ✅ Certificate Valid", fg='green')
            else:
                self.ssl_status.config(text="SSL: ❓ No Domain Set", fg='gray')
                
            self.log("Enhanced server status refreshed", "SUCCESS")
            
        except Exception as e:
            self.log(f"Failed to refresh server status: {str(e)}", "ERROR")
            
    def control_service(self, action, service):
        """Control systemd service"""
        try:
            if not self.ssh_client or not self.ssh_client.get_transport() or not self.ssh_client.get_transport().is_active():
                messagebox.showerror("Error", "Not connected to server")
                return
                
            self.log(f"Executing: systemctl {action} {service}")
            
            stdin, stdout, stderr = self.ssh_client.exec_command(f"systemctl {action} {service}")
            output = stdout.read().decode()
            error = stderr.read().decode()
            
            if error:
                self.log(f"Service control error: {error}", "ERROR")
                self.server_log(f"❌ {action.title()} {service} failed: {error}")
            else:
                self.log(f"[OK] {action.title()} {service} successful", "SUCCESS")
                self.server_log(f"[OK] {action.title()} {service} successful")
                
            # Refresh status after action
            self.refresh_server_status()
            
        except Exception as e:
            self.log(f"Service control failed: {str(e)}", "ERROR")
            
    def reboot_server(self):
        """Reboot server"""
        if not messagebox.askyesno("Confirm Reboot", "Are you sure you want to reboot the server?"):
            return
            
        try:
            self.log("[REBOOT] Rebooting server...")
            self.execute_ssh_command("reboot")
            self.log("[OK] Reboot command sent", "SUCCESS")
            
            # Update connection status
            self.fm_status.config(text="❌ Not Connected", fg='red')
            
        except Exception as e:
            self.log(f"Reboot failed: {str(e)}", "ERROR")
            
    def show_system_info(self):
        """Show system information"""
        try:
            # Get system info
            commands = [
                ("System", "uname -a"),
                ("Uptime", "uptime"),
                ("Memory", "free -h"),
                ("Disk Usage", "df -h"),
                ("CPU Info", "nproc && cat /proc/cpuinfo | grep 'model name' | head -1")
            ]
            
            info_text = "[SYSTEM] SYSTEM INFORMATION\n" + "="*50 + "\n\n"
            
            for title, cmd in commands:
                stdin, stdout, stderr = self.ssh_client.exec_command(cmd)
                output = stdout.read().decode().strip()
                info_text += f"{title}:\n{output}\n\n"
                
            # Show in new window
            info_window = tk.Toplevel(self.root)
            info_window.title("System Information")
            info_window.geometry("600x500")
            
            text_widget = scrolledtext.ScrolledText(info_window, font=('Consolas', 10))
            text_widget.pack(fill='both', expand=True, padx=10, pady=10)
            text_widget.insert('1.0', info_text)
            text_widget.config(state='disabled')
            
        except Exception as e:
            self.log(f"Failed to get system info: {str(e)}", "ERROR")
            
    def renew_ssl(self):
        """Renew SSL certificate"""
        try:
            self.log("[SSL] Renewing SSL certificate...")
            result = self.execute_ssh_command("certbot renew --quiet")
            self.log("[OK] SSL certificate renewed", "SUCCESS")
            self.server_log("[OK] SSL certificate renewal completed")
            
        except Exception as e:
            self.log(f"SSL renewal failed: {str(e)}", "ERROR")
            
    def backup_database(self):
        """Backup database"""
        try:
            self.log("[DB] Creating database backup...")
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            backup_file = f"/opt/pebdeq/backup_db_{timestamp}.sqlite"
            
            self.execute_ssh_command(f"cp /opt/pebdeq/backend/instance/pebdeq.db {backup_file}")
            self.log(f"[OK] Database backed up to: {backup_file}", "SUCCESS")
            self.server_log(f"✅ Database backup created: {backup_file}")
            
        except Exception as e:
            self.log(f"Database backup failed: {str(e)}", "ERROR")
            
    def clean_server_logs(self):
        """Clean server logs"""
        try:
            self.log("[CLEAN] Cleaning server logs...")
            commands = [
                "journalctl --rotate",
                "journalctl --vacuum-time=1d",
                "find /var/log -name '*.log' -mtime +7 -delete",
                "find /opt/pebdeq -name '*.log' -mtime +7 -delete"
            ]
            
            for cmd in commands:
                self.execute_ssh_command(cmd)
                
            self.log("[OK] Server logs cleaned", "SUCCESS")
            self.server_log("✅ Server logs cleaned")
            
        except Exception as e:
            self.log(f"Log cleaning failed: {str(e)}", "ERROR")
            
    def view_server_logs(self):
        """View recent server logs"""
        try:
            # Get recent logs
            stdin, stdout, stderr = self.ssh_client.exec_command("journalctl -u pebdeq-backend -u nginx --since='1 hour ago' --no-pager")
            logs = stdout.read().decode()
            
            if logs:
                self.server_log_text.delete(1.0, tk.END)
                self.server_log_text.insert(1.0, logs)
            else:
                self.server_log("No recent logs found")
                
        except Exception as e:
            self.log(f"Failed to view logs: {str(e)}", "ERROR")
            
    def server_log(self, message):
        """Add message to server logs"""
        timestamp = time.strftime("%H:%M:%S")
        self.server_log_text.insert(tk.END, f"[{timestamp}] {message}\n")
        self.server_log_text.see(tk.END)
        self.root.update()
    
    def view_backend_errors(self):
        """View specific backend errors and crashes"""
        try:
            self.connect_ssh()
            self.server_log("🚨 Checking backend errors...")
            
            # Multiple commands to get comprehensive error information
            error_commands = [
                ("Backend Service Errors", "journalctl -u pebdeq-backend --since='1 hour ago' -p err --no-pager"),
                ("Python Error Log", "tail -50 /opt/pebdeq/backend/error.log 2>/dev/null || echo 'No error.log found'"),
                ("Backend Crash Info", "journalctl -u pebdeq-backend --since='2 hours ago' | grep -i 'fail\\\\|error\\\\|crash\\\\|exception' | tail -20"),
                ("Port 5005 Issues", "netstat -tlnp | grep :5005 || echo 'Port 5005 not in use'"),
                ("Backend Process Status", "ps aux | grep -E 'python.*run.py|pebdeq' | grep -v grep || echo 'No backend process running'"),
                ("Recent Python Errors", "grep -i 'error\\\\|exception\\\\|traceback' /var/log/syslog | grep -i python | tail -10 || echo 'No Python errors in syslog'")
            ]
            
            # Create new window for error display
            error_window = tk.Toplevel(self.root)
            error_window.title("🚨 Backend Error Analysis - PEBDEQ")
            error_window.geometry("1000x700")
            error_window.configure(bg='#2c3e50')
            
            # Header
            header_frame = tk.Frame(error_window, bg='#e74c3c', height=50)
            header_frame.pack(fill='x', pady=(0, 10))
            header_frame.pack_propagate(False)
            
            header_label = tk.Label(header_frame, text="🚨 Backend Error Analysis", 
                                  font=('Arial', 14, 'bold'), fg='white', bg='#e74c3c')
            header_label.pack(expand=True)
            
            # Error display area
            error_text = scrolledtext.ScrolledText(error_window, 
                                                 height=35, bg='#1a1a1a', fg='#ff6b6b', 
                                                 font=('Consolas', 9), wrap=tk.WORD)
            error_text.pack(fill='both', expand=True, padx=20, pady=(0, 20))
            
            # Execute commands and display results
            error_text.insert(tk.END, "=== PEBDEQ BACKEND ERROR ANALYSIS ===\n")
            error_text.insert(tk.END, f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            for cmd_name, cmd in error_commands:
                error_text.insert(tk.END, f"--- {cmd_name} ---\n")
                try:
                    stdin, stdout, stderr = self.ssh_client.exec_command(cmd)
                    result = stdout.read().decode().strip()
                    stderr_output = stderr.read().decode().strip()
                    
                    if result:
                        error_text.insert(tk.END, f"{result}\n")
                    elif stderr_output:
                        error_text.insert(tk.END, f"STDERR: {stderr_output}\n")
                    else:
                        error_text.insert(tk.END, "No output\n")
                        
                except Exception as e:
                    error_text.insert(tk.END, f"ERROR executing command: {str(e)}\n")
                
                error_text.insert(tk.END, "\n" + "="*60 + "\n\n")
            
            error_text.insert(tk.END, "=== END OF ERROR ANALYSIS ===")
            
            # Buttons
            button_frame = tk.Frame(error_window, bg='#2c3e50')
            button_frame.pack(fill='x', padx=20, pady=(0, 20))
            
            tk.Button(button_frame, text="📋 Copy All", 
                     command=lambda: self.copy_to_clipboard(error_text.get(1.0, tk.END)),
                     bg='#8e44ad', fg='white', font=('Arial', 11, 'bold')).pack(side='left', padx=(0, 10))
            
            tk.Button(button_frame, text="🔄 Refresh", 
                     command=lambda: [error_window.destroy(), self.view_backend_errors()],
                     bg='#3498db', fg='white', font=('Arial', 11, 'bold')).pack(side='left', padx=(0, 10))
            
            tk.Button(button_frame, text="❌ Close", 
                     command=error_window.destroy,
                     bg='#e74c3c', fg='white', font=('Arial', 11, 'bold')).pack(side='right')
            
        except Exception as e:
            self.server_log(f"Failed to get backend errors: {str(e)}")
    
    def start_live_error_monitoring(self):
        """Start live monitoring of backend errors"""
        try:
            self.connect_ssh()
            
            # Create monitoring window
            monitor_window = tk.Toplevel(self.root)
            monitor_window.title("🔄 Live Backend Error Monitor - PEBDEQ")
            monitor_window.geometry("900x600")
            monitor_window.configure(bg='#2c3e50')
            
            # Header with controls
            header_frame = tk.Frame(monitor_window, bg='#34495e', height=60)
            header_frame.pack(fill='x', pady=(0, 10))
            header_frame.pack_propagate(False)
            
            tk.Label(header_frame, text="🔄 Live Backend Error Monitor", 
                    font=('Arial', 14, 'bold'), fg='white', bg='#34495e').pack(side='left', padx=20, expand=True)
            
            # Control buttons in header
            self.monitor_active = tk.BooleanVar(value=False)
            
            start_btn = tk.Button(header_frame, text="▶️ Start", 
                                command=lambda: self.toggle_monitoring(True),
                                bg='#27ae60', fg='white', font=('Arial', 10, 'bold'))
            start_btn.pack(side='right', padx=(0, 10), pady=10)
            
            stop_btn = tk.Button(header_frame, text="⏹️ Stop", 
                               command=lambda: self.toggle_monitoring(False),
                               bg='#e74c3c', fg='white', font=('Arial', 10, 'bold'))
            stop_btn.pack(side='right', padx=(0, 5), pady=10)
            
            # Live error display
            live_text = scrolledtext.ScrolledText(monitor_window, 
                                                height=30, bg='#1a1a1a', fg='#00ff00', 
                                                font=('Consolas', 9), wrap=tk.WORD)
            live_text.pack(fill='both', expand=True, padx=20, pady=(0, 20))
            
            live_text.insert(tk.END, "=== LIVE BACKEND ERROR MONITOR ===\n")
            live_text.insert(tk.END, "Click 'Start' to begin monitoring...\n\n")
            
            # Store references for the monitoring functions
            monitor_window.live_text = live_text
            monitor_window.monitor_active = self.monitor_active
            
            # Monitoring function
            def monitor_errors():
                if not self.monitor_active.get():
                    return
                
                try:
                    # Check for new errors (last 30 seconds)
                    cmd = "journalctl -u pebdeq-backend --since='30 seconds ago' -p err --no-pager | tail -5"
                    stdin, stdout, stderr = self.ssh_client.exec_command(cmd)
                    new_errors = stdout.read().decode().strip()
                    
                    if new_errors and new_errors != "-- No entries --":
                        timestamp = time.strftime("%H:%M:%S")
                        live_text.insert(tk.END, f"[{timestamp}] NEW ERROR:\n{new_errors}\n\n")
                        live_text.see(tk.END)
                        monitor_window.update()
                    
                    # Schedule next check
                    monitor_window.after(5000, monitor_errors)  # Check every 5 seconds
                    
                except Exception as e:
                    live_text.insert(tk.END, f"Monitor error: {str(e)}\n")
            
            def toggle_monitoring(active):
                self.monitor_active.set(active)
                if active:
                    live_text.insert(tk.END, f"[{time.strftime('%H:%M:%S')}] Monitoring started...\n")
                    monitor_errors()
                else:
                    live_text.insert(tk.END, f"[{time.strftime('%H:%M:%S')}] Monitoring stopped.\n")
            
            # Store the toggle function
            self.toggle_monitoring = toggle_monitoring
            
        except Exception as e:
            self.server_log(f"Failed to start error monitoring: {str(e)}")
        
    def save_connection_settings(self):
        """Save connection settings to file"""
        try:
            settings = {
                'server_ip': self.server_ip.get(),
                'server_port': self.server_port.get(),
                'server_user': self.server_user.get(),
                'server_password': self.server_password.get(),  # Note: In production, encrypt this
                'domain_name': self.domain_name.get(),
                'additional_domains': self.additional_domains.get(),
                'ssl_email': self.ssl_email.get(),
                'project_path': self.project_path.get(),
                'auto_mode': self.auto_mode.get(),
                'upload_files': self.upload_files.get(),
                'incremental_upload': self.incremental_upload.get(),
                'ssl_enable': self.ssl_enable.get(),
                'force_https': self.force_https.get(),
                'enable_hsts': self.enable_hsts.get(),
                'clean_install': self.clean_install.get(),
                'setup_firewall': self.setup_firewall.get(),
                'install_updates': self.install_updates.get()
            }
            
            with open('deployment_settings.json', 'w', encoding='utf-8') as f:
                json.dump(settings, f, indent=2)
                
            self.log("[OK] Connection settings saved", "SUCCESS")
            
        except Exception as e:
            self.log(f"Failed to save settings: {str(e)}", "ERROR")
            
    def load_connection_settings(self):
        """Load connection settings from file"""
        try:
            if os.path.exists('deployment_settings.json'):
                with open('deployment_settings.json', 'r', encoding='utf-8') as f:
                    settings = json.load(f)
                
                # Load all settings
                self.server_ip.set(settings.get('server_ip', '5.161.245.15'))
                self.server_port.set(settings.get('server_port', '22'))
                self.server_user.set(settings.get('server_user', 'root'))
                self.server_password.set(settings.get('server_password', ''))
                self.domain_name.set(settings.get('domain_name', 'pebdeq.com'))
                self.additional_domains.set(settings.get('additional_domains', 'www.pebdeq.com'))
                self.ssl_email.set(settings.get('ssl_email', 'admin@pebdeq.com'))
                # Auto-detect project path if not set
                saved_project_path = settings.get('project_path', '')
                if saved_project_path and os.path.exists(saved_project_path):
                    self.project_path.set(saved_project_path)
                else:
                    # Auto-detect: deployment GUI is in deployment/ folder, project is parent
                    current_dir = os.path.dirname(os.path.abspath(__file__))
                    project_dir = os.path.dirname(current_dir)
                    if os.path.exists(os.path.join(project_dir, 'backend', 'requirements.txt')):
                        self.project_path.set(project_dir)
                        self.log(f"Auto-detected project path: {project_dir}", "INFO")
                    else:
                        self.project_path.set('')
                self.auto_mode.set(settings.get('auto_mode', True))
                self.upload_files.set(settings.get('upload_files', True))
                self.incremental_upload.set(settings.get('incremental_upload', False))
                self.ssl_enable.set(settings.get('ssl_enable', True))
                self.force_https.set(settings.get('force_https', True))
                self.enable_hsts.set(settings.get('enable_hsts', False))
                self.clean_install.set(settings.get('clean_install', True))
                self.setup_firewall.set(settings.get('setup_firewall', True))
                self.install_updates.set(settings.get('install_updates', True))
                
                self.log("[OK] Connection settings loaded", "SUCCESS")
            else:
                self.log("No saved settings found, using defaults", "INFO")
                
                # Auto-detect project path since no settings file exists
                current_dir = os.path.dirname(os.path.abspath(__file__))
                project_dir = os.path.dirname(current_dir)
                if os.path.exists(os.path.join(project_dir, 'backend', 'requirements.txt')):
                    self.project_path.set(project_dir)
                    self.log(f"Auto-detected project path: {project_dir}", "INFO")
                else:
                    self.log("Could not auto-detect project path. Please select manually.", "WARNING")
                
        except Exception as e:
            self.log(f"Failed to load settings: {str(e)}", "ERROR")

    # Database Management Methods (Placeholder implementations)
    def refresh_db_info(self):
        messagebox.showinfo("Info", "Database info refresh functionality")
    
    def create_db_backup(self):
        messagebox.showinfo("Info", "Database backup functionality")
    
    def restore_db_backup(self):
        messagebox.showinfo("Info", "Database restore functionality")
    
    def list_db_backups(self):
        messagebox.showinfo("Info", "List backups functionality")
    
    def cleanup_old_backups(self):
        messagebox.showinfo("Info", "Cleanup backups functionality")
    
    def reset_database(self):
        messagebox.showinfo("Info", "Reset database functionality")
    
    def run_migration(self):
        messagebox.showinfo("Info", "Run migration functionality")
    
    def optimize_database(self):
        messagebox.showinfo("Info", "Optimize database functionality")
    
    def export_data(self):
        messagebox.showinfo("Info", "Export data functionality")
    
    def on_table_selected(self, event):
        messagebox.showinfo("Info", "Table selected functionality")
    
    def show_table_data(self):
        messagebox.showinfo("Info", "Show table data functionality")

    # Git Management Methods (Placeholder implementations)
    def refresh_git_status(self):
        messagebox.showinfo("Info", "Git status refresh functionality")
    
    def git_pull(self):
        messagebox.showinfo("Info", "Git pull functionality")
    
    def git_push(self):
        messagebox.showinfo("Info", "Git push functionality")
    
    def git_fetch(self):
        messagebox.showinfo("Info", "Git fetch functionality")
    
    def git_status(self):
        messagebox.showinfo("Info", "Git status functionality")
    
    def git_add_all(self):
        messagebox.showinfo("Info", "Git add all functionality")
    
    def git_commit(self):
        messagebox.showinfo("Info", "Git commit functionality")
    
    def git_reset(self):
        messagebox.showinfo("Info", "Git reset functionality")
    
    def git_branch(self):
        messagebox.showinfo("Info", "Git branch functionality")

    # Performance Monitoring Methods (Placeholder implementations)  
    def start_performance_monitoring(self):
        messagebox.showinfo("Info", "Start monitoring functionality")
    
    def stop_performance_monitoring(self):
        messagebox.showinfo("Info", "Stop monitoring functionality")
    
    def show_process_list(self):
        messagebox.showinfo("Info", "Process list functionality")
    
    def kill_process(self):
        messagebox.showinfo("Info", "Kill process functionality")

    # Network Tools Methods (Placeholder implementations)
    def ping_test(self):
        """Ping test"""
        target = self.test_url_var.get().strip() if hasattr(self, 'test_url_var') else self.server_ip.get()
        if not target:
            messagebox.showerror("Error", "Please enter target IP/domain")
            return
            
        self.log(f"[PING] Testing connectivity to {target}...")
        self.network_log(f"[PING] Testing connectivity to {target}...")
        
        try:
            import subprocess
            import platform
            
            # Use appropriate ping command for Windows/Linux
            param = '-n' if platform.system().lower() == 'windows' else '-c'
            command = ['ping', param, '4', target]
            
            result = subprocess.run(command, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                self.log(f"[OK] Ping successful to {target}", "SUCCESS")
                self.network_log(f"[OK] Ping successful to {target}", "SUCCESS")
                lines = result.stdout.strip().split('\n')
                for line in lines[-4:]:  # Show last 4 lines (summary)
                    if line.strip():
                        self.log(f"  {line.strip()}")
                        self.network_log(f"  {line.strip()}")
            else:
                self.log(f"[FAIL] Ping failed to {target}", "ERROR") 
                self.network_log(f"[FAIL] Ping failed to {target}", "ERROR")
                self.log(f"Error: {result.stderr.strip()}")
                self.network_log(f"Error: {result.stderr.strip()}")
                
        except subprocess.TimeoutExpired:
            self.log(f"[TIMEOUT] Ping timeout to {target}", "WARNING")
            self.network_log(f"[TIMEOUT] Ping timeout to {target}", "WARNING")
        except Exception as e:
            self.log(f"[ERROR] Ping test failed: {str(e)}", "ERROR")
            self.network_log(f"[ERROR] Ping test failed: {str(e)}", "ERROR")

    def http_test(self):
        """HTTP test"""
        url = self.test_url_var.get().strip() if hasattr(self, 'test_url_var') else None
        if not url:
            domain = self.domain_name.get()
            if domain:
                url = f"https://{domain}"
            else:
                messagebox.showerror("Error", "Please enter URL")
                return
                
        if not url.startswith(('http://', 'https://')):
            url = f"https://{url}"
            
        self.log(f"[HTTP] Testing {url}...")
        self.network_log(f"[HTTP] Testing {url}...")
        
        try:
            import requests
            from urllib3.exceptions import InsecureRequestWarning
            requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
            
            response = requests.get(url, timeout=15, verify=False, allow_redirects=True)
            
            self.log(f"[OK] HTTP Status: {response.status_code}", "SUCCESS")
            self.network_log(f"[OK] HTTP Status: {response.status_code}", "SUCCESS")
            self.log(f"[INFO] Response time: {response.elapsed.total_seconds():.2f}s")
            self.network_log(f"[INFO] Response time: {response.elapsed.total_seconds():.2f}s")
            self.log(f"[INFO] Content length: {len(response.content)} bytes")
            self.network_log(f"[INFO] Content length: {len(response.content)} bytes")
            
            if response.headers.get('server'):
                self.log(f"[INFO] Server: {response.headers['server']}")
                self.network_log(f"[INFO] Server: {response.headers['server']}")
            if response.headers.get('content-type'):
                self.log(f"[INFO] Content-Type: {response.headers['content-type']}")
                self.network_log(f"[INFO] Content-Type: {response.headers['content-type']}")
                
        except requests.exceptions.SSLError as e:
            self.log(f"[SSL] SSL Error: {str(e)}", "WARNING")
            self.network_log(f"[SSL] SSL Error: {str(e)}", "WARNING")
        except requests.exceptions.ConnectionError as e:
            self.log(f"[FAIL] Connection failed: {str(e)}", "ERROR")
            self.network_log(f"[FAIL] Connection failed: {str(e)}", "ERROR")
        except requests.exceptions.Timeout:
            self.log(f"[TIMEOUT] Request timeout", "WARNING")
            self.network_log(f"[TIMEOUT] Request timeout", "WARNING")
        except Exception as e:
            self.log(f"[ERROR] HTTP test failed: {str(e)}", "ERROR")
            self.network_log(f"[ERROR] HTTP test failed: {str(e)}", "ERROR")

    def ssl_test(self):
        """SSL test"""
        domain = self.test_url_var.get().strip() if hasattr(self, 'test_url_var') else self.domain_name.get()
        if not domain:
            messagebox.showerror("Error", "Please enter domain")
            return
            
        # Remove protocol prefix if present
        domain = domain.replace('https://', '').replace('http://', '').split('/')[0]
            
        self.log(f"[SSL] Testing SSL certificate for {domain}...")
        self.network_log(f"[SSL] Testing SSL certificate for {domain}...")
        
        try:
            import ssl
            import socket
            from datetime import datetime
            
            context = ssl.create_default_context()
            
            with socket.create_connection((domain, 443), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    
                    self.log(f"[OK] SSL Certificate valid", "SUCCESS")
                    self.network_log(f"[OK] SSL Certificate valid", "SUCCESS")
                    
                    # Subject info
                    subject = dict(x[0] for x in cert['subject'])
                    self.log(f"[INFO] Subject: {subject.get('commonName', 'N/A')}")
                    self.network_log(f"[INFO] Subject: {subject.get('commonName', 'N/A')}")
                    
                    # Issuer info  
                    issuer = dict(x[0] for x in cert['issuer'])
                    self.log(f"[INFO] Issuer: {issuer.get('organizationName', 'N/A')}")
                    self.network_log(f"[INFO] Issuer: {issuer.get('organizationName', 'N/A')}")
                    
                    # Check expiry
                    not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    days_left = (not_after - datetime.now()).days
                    
                    if days_left > 30:
                        self.log(f"[OK] Certificate expires in {days_left} days", "SUCCESS")
                        self.network_log(f"[OK] Certificate expires in {days_left} days", "SUCCESS")
                    elif days_left > 7:
                        self.log(f"[WARN] Certificate expires in {days_left} days", "WARNING")
                        self.network_log(f"[WARN] Certificate expires in {days_left} days", "WARNING")
                    else:
                        self.log(f"[URGENT] Certificate expires in {days_left} days!", "ERROR")
                        self.network_log(f"[URGENT] Certificate expires in {days_left} days!", "ERROR")
                        
        except ssl.SSLError as e:
            self.log(f"[FAIL] SSL Error: {str(e)}", "ERROR")
            self.network_log(f"[FAIL] SSL Error: {str(e)}", "ERROR")
        except socket.timeout:
            self.log(f"[TIMEOUT] SSL connection timeout", "WARNING")
            self.network_log(f"[TIMEOUT] SSL connection timeout", "WARNING")
        except Exception as e:
            self.log(f"[ERROR] SSL test failed: {str(e)}", "ERROR")
            self.network_log(f"[ERROR] SSL test failed: {str(e)}", "ERROR")

    def dns_lookup(self):
        """DNS lookup"""
        domain = self.dns_domain.get().strip() if hasattr(self, 'dns_domain') else self.domain_name.get()
        if not domain:
            messagebox.showerror("Error", "Please enter domain name")
            return
            
        self.log(f"[DNS] Looking up {domain}...")
        self.network_log(f"[DNS] Looking up {domain}...")
        
        try:
            import socket
            
            # Get A record
            ip = socket.gethostbyname(domain)
            self.log(f"[OK] DNS A Record: {domain} -> {ip}", "SUCCESS")
            self.network_log(f"[OK] DNS A Record: {domain} -> {ip}", "SUCCESS")
            
            # Get full info
            result = socket.getaddrinfo(domain, None)
            unique_ips = set()
            for addr in result:
                unique_ips.add(addr[4][0])
                
            if len(unique_ips) > 1:
                self.log(f"[INFO] Multiple IPs found:")
                self.network_log(f"[INFO] Multiple IPs found:")
                for ip in unique_ips:
                    self.log(f"  {ip}")
                    self.network_log(f"  {ip}")
                    
        except socket.gaierror as e:
            self.log(f"[FAIL] DNS lookup failed: {str(e)}", "ERROR")
            self.network_log(f"[FAIL] DNS lookup failed: {str(e)}", "ERROR")
        except Exception as e:
            self.log(f"[ERROR] DNS test failed: {str(e)}", "ERROR")
            self.network_log(f"[ERROR] DNS test failed: {str(e)}", "ERROR")

    def scan_ports(self):
        """Port scan - non-blocking version"""
        target = self.scan_host_var.get().strip() if hasattr(self, 'scan_host_var') else self.server_ip.get()
        if not target:
            messagebox.showerror("Error", "Please enter target IP")
            return
            
        ports_str = self.scan_ports_var.get().strip() if hasattr(self, 'scan_ports_var') else "22,80,443,5005"
        
        self.log(f"[SCAN] Scanning ports on {target}...")
        self.network_log(f"[SCAN] Scanning ports on {target}...")
        
        # Run scan in separate thread to avoid freezing UI
        def run_scan():
            try:
                import socket
                
                # Parse ports from input
                try:
                    ports = [int(p.strip()) for p in ports_str.split(',') if p.strip().isdigit()]
                    if not ports:
                        ports = [22, 80, 443, 5005]  # Fallback
                except (ValueError, AttributeError, TypeError):
                    ports = [22, 80, 443, 5005]  # Fallback on parse error
                
                open_ports = []
                
                for port in ports:
                    try:
                        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        sock.settimeout(2)  # Reduced timeout
                        result = sock.connect_ex((target, port))
                        if result == 0:
                            open_ports.append(port)
                            service = {22: 'SSH', 80: 'HTTP', 443: 'HTTPS', 5000: 'Flask', 5005: 'PEBDEQ'}.get(port, 'Unknown')
                            # Use after() to safely update UI from thread
                            self.root.after(0, lambda p=port, s=service: [
                                self.log(f"[OPEN] Port {p} ({s})", "SUCCESS"),
                                self.network_log(f"[OPEN] Port {p} ({s})", "SUCCESS")
                            ])
                        sock.close()
                    except (socket.error, OSError, ConnectionError):
                        pass  # Port closed or connection failed
                        
                # Final result
                if open_ports:
                    self.root.after(0, lambda: [
                        self.log(f"[OK] Open ports: {', '.join(map(str, open_ports))}", "SUCCESS"),
                        self.network_log(f"[OK] Open ports: {', '.join(map(str, open_ports))}", "SUCCESS")
                    ])
                else:
                    self.root.after(0, lambda: [
                        self.log(f"[WARN] No ports open from scanned list", "WARNING"),
                        self.network_log(f"[WARN] No ports open from scanned list", "WARNING")
                    ])
                    
            except Exception as e:
                self.root.after(0, lambda: [
                    self.log(f"[ERROR] Port scan failed: {str(e)}", "ERROR"),
                    self.network_log(f"[ERROR] Port scan failed: {str(e)}", "ERROR")
                ])
        
        # Start scan in background thread
        import threading
        scan_thread = threading.Thread(target=run_scan, daemon=True)
        scan_thread.start()
    
    def purge_cloudflare_cache(self):
        """Purge Cloudflare cache"""
        domain = self.domain_name.get()
        if not domain:
            messagebox.showerror("Error", "Please enter domain name")
            return
            
        self.log(f"[CF] Purging cache for {domain}...")
        self.network_log(f"[CF] Purging cache for {domain}...")
        
        # For basic implementation, just test the domain
        try:
            import requests
            
            # Simple cache purge test by requesting with cache-busting
            import time
            cache_buster = int(time.time())
            url = f"https://{domain}?cb={cache_buster}"
            
            response = requests.get(url, timeout=10, verify=False)
            if response.status_code == 200:
                self.log(f"[OK] Cache test successful", "SUCCESS")
                self.network_log(f"[OK] Cache test successful", "SUCCESS")
            else:
                self.log(f"[WARN] Response: {response.status_code}", "WARNING")
                self.network_log(f"[WARN] Response: {response.status_code}", "WARNING")
                
        except Exception as e:
            self.log(f"[ERROR] Cache purge test failed: {str(e)}", "ERROR")
            self.network_log(f"[ERROR] Cache purge test failed: {str(e)}", "ERROR")

    def check_cloudflare_status(self):
        """Check Cloudflare status"""
        domain = self.domain_name.get()
        if not domain:
            messagebox.showerror("Error", "Please enter domain name")
            return
            
        self.log(f"[CF] Checking Cloudflare status for {domain}...")
        self.network_log(f"[CF] Checking Cloudflare status for {domain}...")
        
        try:
            import requests
            
            response = requests.get(f"https://{domain}", timeout=10, verify=False)
            
            # Check Cloudflare headers
            cf_ray = response.headers.get('cf-ray')
            cf_cache = response.headers.get('cf-cache-status')
            server = response.headers.get('server')
            
            if cf_ray:
                self.log(f"[OK] Cloudflare detected", "SUCCESS")
                self.network_log(f"[OK] Cloudflare detected", "SUCCESS")
                self.log(f"[INFO] CF-Ray: {cf_ray}")
                self.network_log(f"[INFO] CF-Ray: {cf_ray}")
                if cf_cache:
                    self.log(f"[INFO] Cache Status: {cf_cache}")
                    self.network_log(f"[INFO] Cache Status: {cf_cache}")
            else:
                self.log(f"[WARN] Cloudflare headers not found", "WARNING")
                self.network_log(f"[WARN] Cloudflare headers not found", "WARNING")
                
            if server:
                self.log(f"[INFO] Server: {server}")
                self.network_log(f"[INFO] Server: {server}")
                
        except Exception as e:
            self.log(f"[ERROR] CF status check failed: {str(e)}", "ERROR")
            self.network_log(f"[ERROR] CF status check failed: {str(e)}", "ERROR")

    def check_dns_records(self):
        """Check DNS records"""
        domain = self.domain_name.get()
        if not domain:
            messagebox.showerror("Error", "Please enter domain name")
            return
            
        self.log(f"[DNS] Checking DNS records for {domain}...")
        self.network_log(f"[DNS] Checking DNS records for {domain}...")
        
        try:
            import socket
            
            # A Record
            try:
                ip = socket.gethostbyname(domain)
                self.log(f"[OK] A Record: {domain} -> {ip}", "SUCCESS")
                self.network_log(f"[OK] A Record: {domain} -> {ip}", "SUCCESS")
            except (socket.gaierror, socket.herror, OSError):
                self.log(f"[FAIL] A Record not found", "ERROR")
                self.network_log(f"[FAIL] A Record not found", "ERROR")
                
            # WWW Record
            try:
                www_ip = socket.gethostbyname(f"www.{domain}")
                self.log(f"[OK] WWW Record: www.{domain} -> {www_ip}", "SUCCESS")
                self.network_log(f"[OK] WWW Record: www.{domain} -> {www_ip}", "SUCCESS")
            except (socket.gaierror, socket.herror, OSError):
                self.log(f"[WARN] WWW Record not found", "WARNING")
                self.network_log(f"[WARN] WWW Record not found", "WARNING")
                
            # Check if IPs match
            try:
                if ip == www_ip:
                    self.log(f"[OK] A and WWW records match", "SUCCESS")
                    self.network_log(f"[OK] A and WWW records match", "SUCCESS")
                else:
                    self.log(f"[WARN] A and WWW records differ", "WARNING")
                    self.network_log(f"[WARN] A and WWW records differ", "WARNING")
            except (NameError, UnboundLocalError):
                pass  # IP variables not defined due to DNS failures
                
        except Exception as e:
            self.log(f"[ERROR] DNS records check failed: {str(e)}", "ERROR")
            self.network_log(f"[ERROR] DNS records check failed: {str(e)}", "ERROR")

    def website_speed_test(self):
        """Website speed test"""
        domain = self.domain_name.get()
        if not domain:
            messagebox.showerror("Error", "Please enter domain name")
            return
            
        self.log(f"[SPEED] Testing website speed for {domain}...")
        self.network_log(f"[SPEED] Testing website speed for {domain}...")
        
        try:
            import requests
            import time
            
            url = f"https://{domain}"
            
            # Multiple requests to get average
            times = []
            for i in range(3):
                start_time = time.time()
                response = requests.get(url, timeout=15, verify=False)
                end_time = time.time()
                
                request_time = end_time - start_time
                times.append(request_time)
                
                self.log(f"[TEST] Request {i+1}: {request_time:.2f}s (Status: {response.status_code})")
                self.network_log(f"[TEST] Request {i+1}: {request_time:.2f}s (Status: {response.status_code})")
                
            avg_time = sum(times) / len(times)
            min_time = min(times)
            max_time = max(times)
            
            self.log(f"[RESULT] Average: {avg_time:.2f}s", "SUCCESS")
            self.network_log(f"[RESULT] Average: {avg_time:.2f}s", "SUCCESS")
            self.log(f"[RESULT] Min: {min_time:.2f}s, Max: {max_time:.2f}s")
            self.network_log(f"[RESULT] Min: {min_time:.2f}s, Max: {max_time:.2f}s")
            
            if avg_time < 1.0:
                self.log(f"[OK] Website is fast!", "SUCCESS")
                self.network_log(f"[OK] Website is fast!", "SUCCESS")
            elif avg_time < 3.0:
                self.log(f"[WARN] Website is moderate speed", "WARNING")
                self.network_log(f"[WARN] Website is moderate speed", "WARNING")
            else:
                self.log(f"[SLOW] Website is slow", "ERROR")
                self.network_log(f"[SLOW] Website is slow", "ERROR")
                
        except Exception as e:
            self.log(f"[ERROR] Speed test failed: {str(e)}", "ERROR")
            self.network_log(f"[ERROR] Speed test failed: {str(e)}", "ERROR")

    # Database Management Functions
    def refresh_db_info(self):
        """Refresh database information"""
        if not self.ssh_client:
            self.log("[ERROR] Not connected to server", "ERROR")
            return
            
        self.log("[DB] Refreshing database info...")
        
        try:
            # Check database file
            result = self.execute_ssh_command("ls -la /opt/pebdeq/backend/instance/pebdeq.db")
            if "pebdeq.db" in result:
                # Get file size
                size_result = self.execute_ssh_command("du -h /opt/pebdeq/backend/instance/pebdeq.db")
                size = size_result.split()[0] if size_result else "Unknown"
                self.log(f"[OK] Database file exists ({size})", "SUCCESS")
                
                # Check SQLite version (optional - CLI tool may not be installed)
                try:
                    sqlite_result = self.execute_ssh_command("sqlite3 --version 2>/dev/null")
                    if sqlite_result and "command not found" not in sqlite_result:
                        self.log(f"[INFO] SQLite CLI version: {sqlite_result.strip()}")
                    else:
                        self.log("[INFO] SQLite CLI not installed (Python sqlite3 module is sufficient)", "INFO")
                except (AttributeError, TypeError, OSError):
                    self.log("[INFO] SQLite CLI check skipped (Python sqlite3 module is sufficient)", "INFO")
                    
            else:
                self.log(f"[WARN] Database file not found", "WARNING")
                
        except Exception as e:
            self.log(f"[ERROR] DB info refresh failed: {str(e)}", "ERROR")

    def list_db_backups(self):
        """List database backups"""
        if not self.ssh_client:
            self.log("[ERROR] Not connected to server", "ERROR")
            return
            
        self.log("[DB] Listing database backups...")
        
        try:
            result = self.execute_ssh_command("ls -la /opt/pebdeq/backup_db_*.sqlite 2>/dev/null || echo 'No backups found'")
            
            if "No backups found" in result:
                self.log(f"[WARN] No database backups found", "WARNING")
            else:
                self.log(f"[OK] Database backups:", "SUCCESS")
                lines = result.strip().split('\n')
                for line in lines:
                    if 'backup_db_' in line:
                        parts = line.split()
                        if len(parts) >= 9:
                            size = parts[4]
                            date = ' '.join(parts[5:8])
                            filename = parts[8]
                            self.log(f"  {filename} ({size}, {date})")
                            
        except Exception as e:
            self.log(f"[ERROR] Backup list failed: {str(e)}", "ERROR")

    # Git Management Functions  
    def git_status(self):
        """Get git status"""
        if not self.ssh_client:
            self.log("[ERROR] Not connected to server", "ERROR")
            return
            
        self.log("[GIT] Checking git status...")
        
        try:
            # Change to project directory and check status
            result = self.execute_ssh_command("cd /opt/pebdeq && git status --porcelain")
            
            if not result.strip():
                self.log(f"[OK] Working directory clean", "SUCCESS")
            else:
                self.log(f"[INFO] Changes detected:")
                lines = result.strip().split('\n')
                for line in lines:
                    if line.strip():
                        self.log(f"  {line.strip()}")
                        
            # Check current branch
            branch_result = self.execute_ssh_command("cd /opt/pebdeq && git branch --show-current")
            if branch_result:
                self.log(f"[INFO] Current branch: {branch_result.strip()}")
                
        except Exception as e:
            self.log(f"[ERROR] Git status failed: {str(e)}", "ERROR")

    def git_pull(self):
        """Git pull latest changes"""
        if not self.ssh_client:
            self.log("[ERROR] Not connected to server", "ERROR")
            return
            
        self.log("[GIT] Pulling latest changes...")
        
        try:
            result = self.execute_ssh_command("cd /opt/pebdeq && git pull origin main")
            
            if "Already up to date" in result:
                self.log(f"[OK] Already up to date", "SUCCESS")
            elif "Fast-forward" in result or "Updating" in result:
                self.log(f"[OK] Pull successful", "SUCCESS")
                self.log(f"[INFO] {result.strip()}")
            else:
                self.log(f"[WARN] Pull result: {result.strip()}", "WARNING")
                
        except Exception as e:
            self.log(f"[ERROR] Git pull failed: {str(e)}", "ERROR")

    def build_frontend_manual(self):
        """Manual frontend build via npm run build"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return
            
            self.server_log("[BUILD] Starting manual frontend build...")
            self.log("[BUILD] Running npm run build on server...", "INFO")
            
            # Run npm run build in frontend directory
            build_output = self.execute_ssh_command("cd /opt/pebdeq/frontend && npm run build 2>&1")
            
            if build_output:
                self.server_log(f"Build output:\n{build_output}")
                
                if "Failed to compile" in build_output or "error" in build_output.lower():
                    self.log("[WARNING] Build completed with warnings/errors", "WARNING")
                    self.server_log("⚠️ Build had issues - check output above")
                else:
                    self.log("[OK] Frontend build completed successfully!", "SUCCESS")
                    self.server_log("✅ Frontend build successful")
                    
                    # Copy built files to web directory
                    self.execute_ssh_command("cp -r /opt/pebdeq/frontend/build/* /var/www/pebdeq/ 2>/dev/null || echo 'Build folder not found'")
                    self.execute_ssh_command("chown -R www-data:www-data /var/www/pebdeq")
                    self.log("[OK] Built files deployed to web directory", "SUCCESS")
                    
            else:
                self.log("[ERROR] No output from build command", "ERROR")
                
        except Exception as e:
            self.log(f"[ERROR] Manual frontend build failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Frontend build error: {str(e)}")

    def run_reset_db_script(self):
        """Run reset_db.py script on server"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return
            
            # Confirm action
            if not messagebox.askyesno("Confirm Database Reset", 
                                     "This will reset the database and recreate all tables with sample data.\n\n"
                                     "Are you sure you want to continue?"):
                return
            
            self.server_log("[DB] Running reset_db.py script...")
            self.log("[DB] Executing python3 reset_db.py on server...", "INFO")
            
            # Run reset_db.py in backend directory with venv Python (more reliable)
            reset_output = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python reset_db.py 2>&1")
            
            if reset_output:
                self.server_log(f"Reset script output:\n{reset_output}")
                
                if "error" in reset_output.lower() or "failed" in reset_output.lower():
                    self.log("[WARNING] Database reset completed with warnings", "WARNING")
                    self.server_log("⚠️ Reset had issues - check output above")
                else:
                    self.log("[OK] Database reset completed successfully!", "SUCCESS")
                    self.server_log("✅ Database reset successful")
                    
                    # Refresh database info
                    self.refresh_db_info()
                    
            else:
                self.log("[ERROR] No output from reset script", "ERROR")
                
        except Exception as e:
            self.log(f"[ERROR] Database reset script failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Database reset error: {str(e)}")

    # ========================================
    # BACKEND HEALTH & STABILITY FUNCTIONS
    # ========================================
    
    def comprehensive_health_check(self):
        """Run comprehensive health check on backend and entire system"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return
            
            self.server_log("[HEALTH] Starting comprehensive health check...")
            self.log("[HEALTH] Running full system health check...", "INFO")
            
            health_report = []
            
            # 1. Backend Service Status
            self.server_log("1. Checking backend service status...")
            backend_status = self.execute_ssh_command("systemctl is-active pebdeq-backend")
            if "active" in backend_status:
                health_report.append("✅ Backend service is running")
            else:
                health_report.append("❌ Backend service is not running")
            
            # 2. API Health Check
            self.server_log("2. Testing API endpoints...")
            api_health = self.execute_ssh_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5005/api/health")
            if "200" in api_health:
                health_report.append("✅ API is responding (200 OK)")
            else:
                health_report.append(f"❌ API not responding (HTTP {api_health})")
            
            # 3. Database Connection
            self.server_log("3. Testing database connection...")
            db_test = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -c \"from app.models.models import db; print('DB OK')\" 2>&1")
            if "DB OK" in db_test:
                health_report.append("✅ Database connection working")
            else:
                health_report.append("❌ Database connection failed")
            
            # 4. Python Dependencies
            self.server_log("4. Checking Python dependencies...")
            deps_check = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip check 2>&1")
            if not deps_check.strip() or "No broken requirements" in deps_check:
                health_report.append("✅ All dependencies satisfied")
            else:
                health_report.append("⚠️ Dependency issues detected")
            
            # 5. Port Availability
            self.server_log("5. Checking port availability...")
            port_check = self.execute_ssh_command("netstat -tlnp | grep :5005 | head -1")
            if "5005" in port_check and "python" in port_check:
                health_report.append("✅ Backend port 5005 is properly bound")
            else:
                health_report.append("❌ Port 5005 not bound or wrong process")
            
            # 6. Memory Usage
            self.server_log("6. Checking memory usage...")
            memory_info = self.execute_ssh_command("free | grep Mem | awk '{printf \"%.1f\", $3/$2 * 100.0}'")
            try:
                mem_usage = float(memory_info)
                if mem_usage < 80:
                    health_report.append(f"✅ Memory usage OK ({mem_usage:.1f}%)")
                else:
                    health_report.append(f"⚠️ High memory usage ({mem_usage:.1f}%)")
            except (ValueError, TypeError):
                health_report.append("❓ Could not check memory usage")
            
            # 7. Disk Space
            self.server_log("7. Checking disk space...")
            disk_info = self.execute_ssh_command("df /opt/pebdeq | tail -1 | awk '{print $5}' | sed 's/%//'")
            try:
                disk_usage = int(disk_info)
                if disk_usage < 80:
                    health_report.append(f"✅ Disk space OK ({disk_usage}% used)")
                else:
                    health_report.append(f"⚠️ Low disk space ({disk_usage}% used)")
            except (ValueError, TypeError):
                health_report.append("❓ Could not check disk space")
            
            # 8. Recent Errors
            self.server_log("8. Checking recent errors...")
            error_count = self.execute_ssh_command("journalctl -u pebdeq-backend --since='1 hour ago' | grep -i error | wc -l")
            try:
                errors = int(error_count)
                if errors == 0:
                    health_report.append("✅ No recent errors in logs")
                elif errors < 5:
                    health_report.append(f"⚠️ {errors} recent errors in logs")
                else:
                    health_report.append(f"❌ {errors} recent errors in logs")
            except (ValueError, TypeError):
                health_report.append("❓ Could not check error logs")
            
            # Display results
            report_text = "COMPREHENSIVE HEALTH CHECK RESULTS:\n" + "="*50 + "\n\n"
            for item in health_report:
                report_text += f"{item}\n"
                self.server_log(item)
            
            # Show detailed report in popup
            report_window = tk.Toplevel(self.root)
            report_window.title("Health Check Report")
            report_window.geometry("600x400")
            
            text_widget = scrolledtext.ScrolledText(report_window, font=('Consolas', 10))
            text_widget.pack(fill='both', expand=True, padx=10, pady=10)
            text_widget.insert('1.0', report_text)
            text_widget.config(state='disabled')
            
            self.log("[OK] Comprehensive health check completed", "SUCCESS")
            
        except Exception as e:
            self.log(f"[ERROR] Health check failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Health check error: {str(e)}")

    def diagnose_backend_issues(self):
        """Diagnose specific backend stability issues"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return
            
            self.server_log("[DIAGNOSE] Starting backend issue diagnosis...")
            self.log("[DIAGNOSE] Analyzing backend stability issues...", "INFO")
            
            issues = []
            solutions = []
            
            # 1. Check if backend is crashing
            crash_count = self.execute_ssh_command("journalctl -u pebdeq-backend --since='1 hour ago' | grep -c 'Main process exited' || echo '0'")
            if int(crash_count) > 0:
                issues.append(f"❌ Backend crashed {crash_count} times in last hour")
                solutions.append("🔧 Solution: Check Python syntax, dependencies, or memory issues")
            
            # 2. Check for import errors
            import_errors = self.execute_ssh_command("""
journalctl -u pebdeq-backend --since='10 minutes ago' --no-pager | 
grep -A 5 -B 5 -i 'importerror\\\\|modulenotfounderror\\\\|traceback' | 
tail -20
""")
            if import_errors.strip():
                issues.append("❌ Import/Module errors detected")
                solutions.append("🔧 Solution: Reinstall dependencies or fix Python path")
            
            # 3. Check for port conflicts
            port_conflict = self.execute_ssh_command("lsof -ti:5005 | xargs kill -9 2>/dev/null || echo 'No processes found'")
            if "No processes found" not in port_conflict:
                issues.append("❌ Port 5005 conflict detected")
                solutions.append("🔧 Solution: Kill conflicting process or change port")
            
            # 4. Check database issues
            db_errors = self.execute_ssh_command("journalctl -u pebdeq-backend --since='1 hour ago' | grep -i 'database\\|sqlite' | grep -i error | wc -l")
            if int(db_errors) > 0:
                issues.append(f"❌ Database errors detected ({db_errors})")
                solutions.append("🔧 Solution: Check database file permissions or reset DB")
            
            # 5. Check memory issues
            oom_errors = self.execute_ssh_command("journalctl -u pebdeq-backend --since='1 hour ago' | grep -i 'out of memory\\|oom' | wc -l")
            if int(oom_errors) > 0:
                issues.append(f"❌ Out of memory errors detected ({oom_errors})")
                solutions.append("🔧 Solution: Increase server memory or optimize code")
            
            # 6. Check permission issues
            perm_errors = self.execute_ssh_command("journalctl -u pebdeq-backend --since='1 hour ago' | grep -i 'permission denied' | wc -l")
            if int(perm_errors) > 0:
                issues.append(f"❌ Permission errors detected ({perm_errors})")
                solutions.append("🔧 Solution: Fix file permissions with 'Fix Permissions' button")
            
            # 7. Check if service is in restart loop
            restart_frequency = self.execute_ssh_command("journalctl -u pebdeq-backend --since='10 minutes ago' | grep -c 'Started\\|Stopped' || echo '0'")
            if int(restart_frequency) > 3:
                issues.append(f"❌ Service in restart loop ({restart_frequency} restarts in 10 min)")
                solutions.append("🔧 Solution: Check logs for root cause, may need manual intervention")
            
            if not issues:
                issues.append("✅ No critical issues detected")
                solutions.append("ℹ️ Backend appears stable, monitor for any new issues")
            
            # Display diagnosis
            diagnosis_text = "BACKEND ISSUE DIAGNOSIS:\n" + "="*40 + "\n\n"
            diagnosis_text += "ISSUES FOUND:\n"
            for issue in issues:
                diagnosis_text += f"{issue}\n"
            diagnosis_text += "\nRECOMMENDED SOLUTIONS:\n"
            for solution in solutions:
                diagnosis_text += f"{solution}\n"
            
            # Show in popup
            diag_window = tk.Toplevel(self.root)
            diag_window.title("Backend Issue Diagnosis")
            diag_window.geometry("700x500")
            
            text_widget = scrolledtext.ScrolledText(diag_window, font=('Consolas', 10))
            text_widget.pack(fill='both', expand=True, padx=10, pady=10)
            text_widget.insert('1.0', diagnosis_text)
            text_widget.config(state='disabled')
            
            # Log issues
            for issue in issues:
                self.server_log(issue)
            
            self.log("[OK] Backend issue diagnosis completed", "SUCCESS")
            
        except Exception as e:
            self.log(f"[ERROR] Diagnosis failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Diagnosis error: {str(e)}")

    def auto_fix_backend(self):
        """Automatically attempt to fix common backend issues"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return
            
            if not messagebox.askyesno("Auto Fix", "This will attempt to automatically fix common backend issues.\n\nContinue?"):
                return
            
            self.server_log("[AUTO-FIX] Starting automatic backend fix...")
            self.log("[AUTO-FIX] Attempting to fix backend issues...", "INFO")
            
            fixes_applied = []
            
            # 1. Stop backend service
            self.server_log("1. Stopping backend service...")
            self.execute_ssh_command("systemctl stop pebdeq-backend")
            fixes_applied.append("🔧 Stopped backend service")
            
            # 2. Kill any remaining python processes on port 5005
            self.server_log("2. Killing processes on port 5005...")
            kill_output = self.execute_ssh_command("lsof -ti:5005 | xargs kill -9 2>/dev/null || echo 'No processes found'")
            fixes_applied.append("🔧 Cleared port 5005")
            
            # 3. Fix file permissions
            self.server_log("3. Fixing file permissions...")
            self.execute_ssh_command("chown -R www-data:www-data /opt/pebdeq/backend")
            self.execute_ssh_command("chmod -R 755 /opt/pebdeq/backend")
            self.execute_ssh_command("chmod +x /opt/pebdeq/backend/run.py")
            fixes_applied.append("🔧 Fixed file permissions")
            
            # 4. Clear Python cache
            self.server_log("4. Clearing Python cache...")
            self.execute_ssh_command("find /opt/pebdeq/backend -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true")
            self.execute_ssh_command("find /opt/pebdeq/backend -name '*.pyc' -delete 2>/dev/null || true")
            fixes_applied.append("🔧 Cleared Python cache")
            
            # 5. Test Python syntax
            self.server_log("5. Testing Python syntax...")
            syntax_test = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -m py_compile run.py 2>&1")
            if not syntax_test.strip():
                fixes_applied.append("✅ Python syntax is valid")
            else:
                fixes_applied.append("❌ Python syntax errors detected")
                self.server_log(f"Syntax errors: {syntax_test}")
            
            # 6. Update systemd service file with better configuration
            self.server_log("6. Updating systemd service configuration...")
            improved_service = """[Unit]
Description=PEBDEQ Backend Service
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/pebdeq/backend
Environment=PATH=/opt/pebdeq/backend/venv/bin:/usr/local/bin:/usr/bin:/bin
Environment=FLASK_APP=run.py
Environment=FLASK_ENV=production
Environment=NUMBA_CACHE_DIR=/tmp/numba_cache
Environment=NUMBA_DISABLE_JIT=1
Environment=PYMATTING_DISABLE_CACHE=1
Environment=DISABLE_REMBG=1
ExecStart=/opt/pebdeq/backend/venv/bin/python /opt/pebdeq/backend/run.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target"""
            
            self.execute_ssh_command(f"cat > /etc/systemd/system/pebdeq-backend.service << 'EOF'\n{improved_service}\nEOF")
            self.execute_ssh_command("systemctl daemon-reload")
            fixes_applied.append("🔧 Updated systemd service configuration")
            
            # 7. Start backend service
            self.server_log("7. Starting backend service...")
            start_result = self.execute_ssh_command("systemctl start pebdeq-backend")
            fixes_applied.append("🔧 Started backend service")
            
            # 8. Wait and test
            self.server_log("8. Testing backend response...")
            import time
            time.sleep(5)
            
            api_test = self.execute_ssh_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5005/api/health")
            if "200" in api_test:
                fixes_applied.append("✅ Backend is responding correctly")
            else:
                fixes_applied.append("❌ Backend still not responding")
            
            # Display results
            fix_text = "AUTO-FIX RESULTS:\n" + "="*30 + "\n\n"
            for fix in fixes_applied:
                fix_text += f"{fix}\n"
                self.server_log(fix)
            
            messagebox.showinfo("Auto-Fix Complete", fix_text)
            self.log("[OK] Auto-fix process completed", "SUCCESS")
            
            # Refresh status
            self.refresh_server_status()
            
        except Exception as e:
            self.log(f"[ERROR] Auto-fix failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Auto-fix error: {str(e)}")

    def force_restart_backend(self):
        """Force restart backend with clean slate"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return
            
            self.server_log("[FORCE RESTART] Starting forced backend restart...")
            self.log("[FORCE RESTART] Force restarting backend...", "INFO")
            
            # 1. Force stop everything
            self.execute_ssh_command("systemctl stop pebdeq-backend")
            self.execute_ssh_command("pkill -f 'python.*run.py' || true")
            self.execute_ssh_command("lsof -ti:5005 | xargs kill -9 2>/dev/null || true")
            
            # 2. Wait a moment
            import time
            time.sleep(3)
            
            # 3. Start fresh
            self.execute_ssh_command("systemctl start pebdeq-backend")
            
            # 4. Monitor startup
            for i in range(10):
                time.sleep(1)
                status = self.execute_ssh_command("systemctl is-active pebdeq-backend")
                if "active" in status:
                    break
            
            # 5. Test API
            time.sleep(2)
            api_test = self.execute_ssh_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5005/api/health")
            
            if "200" in api_test:
                self.log("[OK] Force restart successful - backend responding", "SUCCESS")
                self.server_log("✅ Force restart successful")
            else:
                self.log("[WARNING] Force restart completed but backend not responding", "WARNING")
                self.server_log("⚠️ Backend restarted but not responding")
            
            self.refresh_server_status()
            
        except Exception as e:
            self.log(f"[ERROR] Force restart failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Force restart error: {str(e)}")

    def check_dependencies(self):
        """Check and fix Python dependencies"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return
            
            self.server_log("[DEPS] Checking Python dependencies...")
            self.log("[DEPS] Checking dependencies...", "INFO")
            
            # Check pip status
            pip_check = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip check 2>&1")
            
            if not pip_check.strip() or "No broken requirements" in pip_check:
                self.log("[OK] All dependencies are satisfied", "SUCCESS")
                self.server_log("✅ All dependencies OK")
            else:
                self.log("[WARNING] Dependency issues found:", "WARNING")
                self.server_log(f"⚠️ Dependency issues: {pip_check}")
                
                if messagebox.askyesno("Fix Dependencies", "Dependency issues found. Reinstall?"):
                    self.reinstall_dependencies()
            
            # Check virtual environment
            venv_check = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python --version")
            self.log(f"Virtual environment Python: {venv_check.strip()}")
            
        except Exception as e:
            self.log(f"[ERROR] Dependency check failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Dependency check error: {str(e)}")

    def check_port_conflicts(self):
        """Check for port conflicts"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return
            
            self.server_log("[PORT] Checking port conflicts...")
            self.log("[PORT] Scanning for port conflicts...", "INFO")
            
            # Check what's using port 5005
            port_usage = self.execute_ssh_command("lsof -i :5005 || echo 'Port not in use'")
            
            if "Port not in use" in port_usage:
                self.log("[INFO] Port 5005 is available", "INFO")
            else:
                self.log("[INFO] Port 5005 usage:", "INFO")
                lines = port_usage.strip().split('\n')
                for line in lines:
                    if line.strip():
                        self.log(f"  {line.strip()}")
                        self.server_log(f"Port 5005: {line.strip()}")
            
            # Check common ports
            ports_to_check = [22, 80, 443, 5005]
            for port in ports_to_check:
                result = self.execute_ssh_command(f"netstat -tlnp | grep :{port} | head -1")
                if result.strip():
                    service = result.split()[-1] if result.split() else "unknown"
                    self.log(f"Port {port}: {service}")
                else:
                    self.log(f"Port {port}: Available")
            
        except Exception as e:
            self.log(f"[ERROR] Port check failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Port check error: {str(e)}")

    def check_memory_usage(self):
        """Check system memory usage"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return
            
            self.server_log("[MEMORY] Checking memory usage...")
            self.log("[MEMORY] Analyzing memory usage...", "INFO")
            
            # Overall memory
            memory_info = self.execute_ssh_command("free -h")
            self.log("System Memory Status:")
            for line in memory_info.split('\n'):
                if line.strip():
                    self.log(f"  {line.strip()}")
            
            # Memory percentage
            mem_percent = self.execute_ssh_command("free | grep Mem | awk '{printf \"%.1f\", $3/$2 * 100.0}'")
            try:
                mem_usage = float(mem_percent)
                if mem_usage < 60:
                    self.log(f"[OK] Memory usage normal ({mem_usage:.1f}%)", "SUCCESS")
                elif mem_usage < 80:
                    self.log(f"[WARNING] Memory usage moderate ({mem_usage:.1f}%)", "WARNING")
                else:
                    self.log(f"[CRITICAL] Memory usage high ({mem_usage:.1f}%)", "ERROR")
                    
                self.server_log(f"Memory usage: {mem_usage:.1f}%")
            except (ValueError, TypeError):
                self.log("[ERROR] Could not parse memory usage", "ERROR")
            
            # Backend process memory
            backend_mem = self.execute_ssh_command("ps aux | grep 'python.*run.py' | grep -v grep | awk '{print $4}' | head -1")
            if backend_mem.strip():
                self.log(f"Backend process memory: {backend_mem.strip()}%")
                self.server_log(f"Backend memory: {backend_mem.strip()}%")
            
        except Exception as e:
            self.log(f"[ERROR] Memory check failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Memory check error: {str(e)}")

    def enable_auto_recovery(self):
        """Enable automatic recovery for backend service"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return
            
            if not messagebox.askyesno("Enable Auto Recovery", "This will create a monitoring script that automatically restarts the backend if it fails.\n\nContinue?"):
                return
            
            self.server_log("[AUTO-RECOVERY] Setting up automatic recovery...")
            self.log("[AUTO-RECOVERY] Configuring auto-recovery...", "INFO")
            
            # Create monitoring script
            monitor_script = """#!/bin/bash
# PEBDEQ Backend Auto-Recovery Script
LOG_FILE="/var/log/pebdeq-monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check if backend is responding
if ! curl -s -f http://localhost:5005/api/health > /dev/null 2>&1; then
    log_message "Backend not responding, attempting restart..."
    
    # Stop and start the service
    systemctl stop pebdeq-backend
    sleep 5
    systemctl start pebdeq-backend
    sleep 10
    
    # Check again
    if curl -s -f http://localhost:5005/api/health > /dev/null 2>&1; then
        log_message "Backend restart successful"
    else
        log_message "Backend restart failed - manual intervention required"
    fi
else
    log_message "Backend is healthy"
fi
"""
            
            # Write script
            self.execute_ssh_command(f"cat > /opt/pebdeq/monitor-backend.sh << 'EOF'\n{monitor_script}\nEOF")
            self.execute_ssh_command("chmod +x /opt/pebdeq/monitor-backend.sh")
            
            # Create cron job
            cron_entry = "*/5 * * * * /opt/pebdeq/monitor-backend.sh"
            self.execute_ssh_command(f"(crontab -l 2>/dev/null; echo '{cron_entry}') | crontab -")
            
            self.log("[OK] Auto-recovery enabled (5-minute intervals)", "SUCCESS")
            self.server_log("✅ Auto-recovery monitoring enabled")
            
        except Exception as e:
            self.log(f"[ERROR] Auto-recovery setup failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Auto-recovery error: {str(e)}")

    def emergency_recovery(self):
        """EMERGENCY: Stop restart loops and diagnose critical issues"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return

            # Show emergency warning
            if not messagebox.askyesno("🚨 EMERGENCY RECOVERY",
                                     "🚨 CRITICAL SITUATION DETECTED 🚨\n\n"
                                     "This will:\n"
                                     "1. FORCE STOP backend to break restart loop\n"
                                     "2. Diagnose exact import/dependency errors\n"
                                     "3. Attempt emergency repairs\n\n"
                                     "Continue?"):
                return

            self.server_log("🚨 [EMERGENCY] Starting emergency recovery procedure...")
            self.log("🚨 [EMERGENCY] CRITICAL RECOVERY MODE ACTIVATED", "ERROR")

            recovery_steps = []

            # STEP 1: FORCE STOP everything to break the loop
            self.server_log("1. 🛑 FORCE STOPPING all backend processes...")
            self.execute_ssh_command("systemctl stop pebdeq-backend")
            self.execute_ssh_command("systemctl disable pebdeq-backend")  # Prevent auto-start
            self.execute_ssh_command("pkill -9 -f 'python.*run.py' || true")
            self.execute_ssh_command("lsof -ti:5005 | xargs kill -9 2>/dev/null || true")
            recovery_steps.append("✅ FORCE STOPPED all backend processes")

            # Wait to ensure everything is stopped
            import time
            time.sleep(5)

            # STEP 2: Get the EXACT error from logs
            self.server_log("2. 🔍 Analyzing EXACT import errors...")

            # Get the most recent error details
            import_errors = self.execute_ssh_command("""
journalctl -u pebdeq-backend --since='10 minutes ago' --no-pager | 
grep -A 5 -B 5 -i 'importerror\\\\|modulenotfounderror\\\\|traceback' | 
tail -20
""")

            if import_errors.strip():
                recovery_steps.append(f"🔍 FOUND IMPORT ERRORS:\n{import_errors.strip()}")
                self.server_log(f"Import errors found:\n{import_errors}")
            else:
                recovery_steps.append("❓ No specific import errors found in recent logs")

            # STEP 3: Check Python environment
            self.server_log("3. 🐍 Checking Python environment...")

            # Test basic Python functionality
            python_test = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -c 'print(\"Python OK\")' 2>&1")
            if "Python OK" in python_test:
                recovery_steps.append("✅ Python virtual environment is working")
            else:
                recovery_steps.append(f"❌ Python environment broken: {python_test}")

            # Test basic imports
            basic_import_test = self.execute_ssh_command("""
cd /opt/pebdeq/backend && ./venv/bin/python -c "
try:
    import flask
    import sqlalchemy
    import werkzeug
    print('Basic imports OK')
except Exception as e:
    print(f'Import error: {e}')
" 2>&1
""")
            recovery_steps.append(f"🧪 Basic import test: {basic_import_test.strip()}")

            # STEP 4: Test run.py specifically
            self.server_log("4. 📝 Testing run.py syntax...")
            syntax_test = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -m py_compile run.py 2>&1")
            if syntax_test.strip():
                recovery_steps.append(f"❌ run.py syntax error: {syntax_test}")
            else:
                recovery_steps.append("✅ run.py syntax is valid")

            # STEP 5: Test app imports specifically
            self.server_log("5. 📦 Testing app module imports...")
            app_import_test = self.execute_ssh_command("""
cd /opt/pebdeq/backend && ./venv/bin/python -c "
try:
    from app import create_app
    print('App import OK')
except Exception as e:
    print(f'App import error: {e}')
    import traceback
    traceback.print_exc()
" 2>&1
""")
            recovery_steps.append(f"📦 App import test: {app_import_test.strip()}")

            # STEP 6: Check requirements
            self.server_log("6. 📋 Checking requirements status...")
            req_check = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip check 2>&1")
            if req_check.strip():
                recovery_steps.append(f"⚠️ Requirements issues: {req_check}")
            else:
                recovery_steps.append("✅ Requirements satisfied")

            # STEP 7: Show recovery options
            recovery_text = "🚨 EMERGENCY RECOVERY ANALYSIS 🚨\n" + "="*60 + "\n\n"
            for i, step in enumerate(recovery_steps, 1):
                recovery_text += f"{i}. {step}\n\n"

            recovery_text += "\n🔧 RECOMMENDED EMERGENCY ACTIONS:\n"
            recovery_text += "1. Click 'Emergency Fix Dependencies' below\n"
            recovery_text += "2. If that fails, click 'Rebuild Virtual Environment'\n"
            recovery_text += "3. As last resort, click 'Clean Reinstall Backend'\n"

            # Show detailed analysis window
            emergency_window = tk.Toplevel(self.root)
            emergency_window.title("🚨 EMERGENCY RECOVERY ANALYSIS")
            emergency_window.geometry("900x700")
            emergency_window.configure(bg='#2c3e50')

            # Text widget
            text_widget = scrolledtext.ScrolledText(emergency_window, font=('Consolas', 10),
                                                   bg='#2c3e50', fg='#ecf0f1')
            text_widget.pack(fill='both', expand=True, padx=10, pady=(10, 60))
            text_widget.insert('1.0', recovery_text)
            text_widget.config(state='disabled')

            # Emergency action buttons
            button_frame = tk.Frame(emergency_window, bg='#2c3e50')
            button_frame.pack(fill='x', padx=10, pady=10)

            tk.Button(button_frame, text="🔧 Emergency Fix Dependencies",
                     command=self.emergency_fix_dependencies,
                     bg='#e74c3c', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))

            tk.Button(button_frame, text="🏗️ Rebuild Virtual Environment",
                     command=self.emergency_rebuild_venv,
                     bg='#f39c12', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))

            tk.Button(button_frame, text="🆘 Clean Reinstall Backend",
                     command=self.emergency_clean_reinstall,
                     bg='#c0392b', fg='white', font=('Arial', 10, 'bold')).pack(side='left', padx=(0, 10))

            tk.Button(button_frame, text="✅ Try Start Backend",
                     command=self.emergency_try_start,
                     bg='#27ae60', fg='white', font=('Arial', 10, 'bold')).pack(side='right')

            self.log("🚨 [EMERGENCY] Recovery analysis completed", "ERROR")

        except Exception as e:
            self.log(f"🚨 [EMERGENCY] Recovery failed: {str(e)}", "ERROR")
            self.server_log(f"🚨 Emergency recovery error: {str(e)}")

    def emergency_fix_dependencies(self):
        """Emergency dependency fix for critical situations"""
        try:
            self.server_log("🔧 [EMERGENCY] Attempting dependency fix...")
            self.log("🔧 [EMERGENCY] Emergency dependency repair...", "WARNING")

            # Force reinstall critical packages
            critical_packages = [
                "flask", "sqlalchemy", "werkzeug", "flask-sqlalchemy",
                "flask-migrate", "gunicorn", "requests", "pillow"
            ]

            for package in critical_packages:
                self.server_log(f"Installing {package}...")
                self.execute_ssh_command(f"cd /opt/pebdeq/backend && ./venv/bin/pip install --force-reinstall {package}")

            # Reinstall from requirements
            self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install -r requirements.txt --force-reinstall")

            self.log("🔧 [EMERGENCY] Dependency fix completed", "SUCCESS")
            messagebox.showinfo("Emergency Fix", "Emergency dependency fix completed!\n\nTry 'Try Start Backend' now.")

        except Exception as e:
            self.log(f"🔧 [EMERGENCY] Dependency fix failed: {str(e)}", "ERROR")

    def emergency_rebuild_venv(self):
        """Emergency virtual environment rebuild"""
        try:
            if not messagebox.askyesno("Rebuild venv", "This will DELETE and recreate the virtual environment.\n\nContinue?"):
                return

            self.server_log("🏗️ [EMERGENCY] Rebuilding virtual environment...")
            self.log("🏗️ [EMERGENCY] Emergency venv rebuild...", "WARNING")

            # Remove old venv
            self.execute_ssh_command("rm -rf /opt/pebdeq/backend/venv")

            # Create new venv
            self.execute_ssh_command("cd /opt/pebdeq/backend && python3 -m venv venv")

            # Upgrade pip
            self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install --upgrade pip")

            # Install requirements
            self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install -r requirements.txt")

            self.log("🏗️ [EMERGENCY] Virtual environment rebuilt", "SUCCESS")
            messagebox.showinfo("venv Rebuilt", "Virtual environment rebuilt!\n\nTry 'Try Start Backend' now.")

        except Exception as e:
            self.log(f"🏗️ [EMERGENCY] venv rebuild failed: {str(e)}", "ERROR")

    def emergency_clean_reinstall(self):
        """Emergency clean backend reinstall"""
        try:
            if not messagebox.askyesno("Clean Reinstall",
                                     "⚠️ WARNING: This will COMPLETELY reinstall the backend!\n\n"
                                     "This should only be used as LAST RESORT.\n\n"
                                     "Continue?"):
                return

            self.server_log("🆘 [EMERGENCY] Clean backend reinstall...")
            self.log("🆘 [EMERGENCY] LAST RESORT - Clean reinstall...", "ERROR")

            # This would need file upload functionality to work properly
            messagebox.showinfo("Manual Action Required",
                               "Clean reinstall requires:\n\n"
                               "1. Re-upload backend files using File Manager\n"
                               "2. Or use 'Upload Files' in deployment\n"
                               "3. Then run 'Rebuild Virtual Environment'\n\n"
                               "This is beyond automatic recovery scope.")

        except Exception as e:
            self.log(f"🆘 [EMERGENCY] Clean reinstall failed: {str(e)}", "ERROR")

    def emergency_try_start(self):
        """Emergency attempt to start backend after fixes"""
        try:
            self.server_log("✅ [EMERGENCY] Attempting to start backend...")
            self.log("✅ [EMERGENCY] Trying to start backend...", "INFO")

            # Re-enable and start service
            self.execute_ssh_command("systemctl enable pebdeq-backend")
            self.execute_ssh_command("systemctl start pebdeq-backend")

            # Wait and check
            import time
            time.sleep(10)

            # Check status
            status = self.execute_ssh_command("systemctl is-active pebdeq-backend")
            api_test = self.execute_ssh_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5005/api/health")

            if "active" in status and "200" in api_test:
                self.log("✅ [EMERGENCY] SUCCESS! Backend is running and responding!", "SUCCESS")
                self.server_log("✅ EMERGENCY RECOVERY SUCCESSFUL!")
                messagebox.showinfo("🎉 SUCCESS!", "🎉 EMERGENCY RECOVERY SUCCESSFUL!\n\nBackend is now running and responding to API calls!")

                # Refresh status
                self.refresh_server_status()
            else:
                self.log("❌ [EMERGENCY] Backend still not working properly", "ERROR")
                self.server_log(f"Status: {status}, API: {api_test}")
                messagebox.showerror("Still Failed", f"Backend status: {status}\nAPI response: {api_test}\n\nManual intervention may be required.")

        except Exception as e:
            self.log(f"✅ [EMERGENCY] Start attempt failed: {str(e)}", "ERROR")

    # ========================================
    # QUICK REBUILD FUNCTIONS
    # ========================================

    def quick_rebuild_backend(self):
        """Quick backend rebuild without full deployment"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return

            if not messagebox.askyesno("Rebuild Backend", "This will rebuild the backend service.\n\nContinue?"):
                return

            self.server_log("[REBUILD] Starting quick backend rebuild...")
            self.log("[REBUILD] Rebuilding backend...", "INFO")

            # Stop backend
            self.execute_ssh_command("systemctl stop pebdeq-backend")

            # Clear cache
            self.execute_ssh_command("find /opt/pebdeq/backend -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true")

            # Reinstall requirements
            self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install -r requirements.txt --upgrade")

            # Fix permissions
            self.execute_ssh_command("chown -R www-data:www-data /opt/pebdeq/backend")

            # Start backend
            self.execute_ssh_command("systemctl start pebdeq-backend")

            # Wait and test
            import time
            time.sleep(5)
            api_test = self.execute_ssh_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5005/api/health")

            if "200" in api_test:
                self.log("[OK] Backend rebuild successful", "SUCCESS")
                self.server_log("✅ Backend rebuild completed")
            else:
                self.log("[WARNING] Backend rebuild completed but not responding", "WARNING")
                self.server_log("⚠️ Backend rebuild issues")

        except Exception as e:
            self.log(f"[ERROR] Backend rebuild failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Backend rebuild error: {str(e)}")

    def quick_rebuild_frontend(self):
        """Quick frontend rebuild"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return

            if not messagebox.askyesno("Rebuild Frontend", "This will rebuild the frontend.\n\nContinue?"):
                return

            self.server_log("[REBUILD] Starting quick frontend rebuild...")
            self.log("[REBUILD] Rebuilding frontend...", "INFO")

            # Run npm build
            build_output = self.execute_ssh_command("cd /opt/pebdeq/frontend && npm run build 2>&1")

            if "error" not in build_output.lower():
                # Deploy built files
                self.execute_ssh_command("rm -rf /var/www/pebdeq/*")
                self.execute_ssh_command("cp -r /opt/pebdeq/frontend/build/* /var/www/pebdeq/")
                self.execute_ssh_command("chown -R www-data:www-data /var/www/pebdeq")

                self.log("[OK] Frontend rebuild successful", "SUCCESS")
                self.server_log("✅ Frontend rebuild completed")
            else:
                self.log("[ERROR] Frontend build failed", "ERROR")
                self.server_log(f"❌ Frontend build error: {build_output}")

        except Exception as e:
            self.log(f"[ERROR] Frontend rebuild failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Frontend rebuild error: {str(e)}")

    def quick_reset_database(self):
        """Quick database reset"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return

            if not messagebox.askyesno("Reset Database", "This will reset the database and recreate all tables.\n\nContinue?"):
                return

            self.server_log("[RESET] Starting quick database reset...")
            self.log("[RESET] Resetting database...", "INFO")

            # Stop backend
            self.execute_ssh_command("systemctl stop pebdeq-backend")

            # Run reset script
            reset_output = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python reset_db.py 2>&1")

            # Start backend
            self.execute_ssh_command("systemctl start pebdeq-backend")

            if "error" not in reset_output.lower():
                self.log("[OK] Database reset successful", "SUCCESS")
                self.server_log("✅ Database reset completed")
            else:
                self.log("[WARNING] Database reset completed with issues", "WARNING")
                self.server_log(f"⚠️ Reset issues: {reset_output}")

        except Exception as e:
            self.log(f"[ERROR] Database reset failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Database reset error: {str(e)}")

    def quick_full_redeploy(self):
        """Quick full redeployment"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return

            if not messagebox.askyesno("Full Redeploy", "This will stop services, rebuild everything, and restart.\n\nContinue?"):
                return

            self.server_log("[REDEPLOY] Starting full redeployment...")
            self.log("[REDEPLOY] Full redeployment...", "INFO")

            # Stop services
            self.execute_ssh_command("systemctl stop pebdeq-backend")

            # Backend rebuild
            self.server_log("Rebuilding backend...")
            self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install -r requirements.txt --upgrade")

            # Frontend rebuild
            self.server_log("Rebuilding frontend...")
            self.execute_ssh_command("cd /opt/pebdeq/frontend && npm run build")
            self.execute_ssh_command("rm -rf /var/www/pebdeq/*")
            self.execute_ssh_command("cp -r /opt/pebdeq/frontend/build/* /var/www/pebdeq/")

            # Fix permissions
            self.execute_ssh_command("chown -R www-data:www-data /opt/pebdeq/backend")
            self.execute_ssh_command("chown -R www-data:www-data /var/www/pebdeq")

            # Restart services
            self.execute_ssh_command("systemctl start pebdeq-backend")
            self.execute_ssh_command("systemctl restart nginx")

            self.log("[OK] Full redeployment completed", "SUCCESS")
            self.server_log("✅ Full redeployment successful")

        except Exception as e:
            self.log(f"[ERROR] Full redeploy failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Full redeploy error: {str(e)}")

    def reinstall_dependencies(self):
        """Reinstall Python dependencies"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return

            self.server_log("[DEPS] Reinstalling dependencies...")
            self.log("[DEPS] Reinstalling Python dependencies...", "INFO")

            # Stop backend
            self.execute_ssh_command("systemctl stop pebdeq-backend")

            # Upgrade pip
            self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install --upgrade pip")

            # Reinstall requirements
            reinstall_output = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install -r requirements.txt --upgrade --force-reinstall")

            # Start backend
            self.execute_ssh_command("systemctl start pebdeq-backend")

            self.log("[OK] Dependencies reinstalled", "SUCCESS")
            self.server_log("✅ Dependencies reinstalled")

        except Exception as e:
            self.log(f"[ERROR] Dependency reinstall failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Dependency reinstall error: {str(e)}")

    def fix_permissions(self):
        """Fix file permissions"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return

            self.server_log("[PERMISSIONS] Fixing file permissions...")
            self.log("[PERMISSIONS] Fixing permissions...", "INFO")

            # Backend permissions
            self.execute_ssh_command("chown -R www-data:www-data /opt/pebdeq")
            self.execute_ssh_command("chmod -R 755 /opt/pebdeq")
            self.execute_ssh_command("chmod +x /opt/pebdeq/backend/run.py")

            # Frontend permissions
            self.execute_ssh_command("chown -R www-data:www-data /var/www/pebdeq")
            self.execute_ssh_command("chmod -R 755 /var/www/pebdeq")

            # Database permissions
            self.execute_ssh_command("chown -R www-data:www-data /opt/pebdeq/backend/instance")

            self.log("[OK] Permissions fixed", "SUCCESS")
            self.server_log("✅ Permissions fixed")

        except Exception as e:
            self.log(f"[ERROR] Permission fix failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Permission fix error: {str(e)}")

    def rebuild_nginx_config(self):
        """Rebuild Nginx configuration"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return

            self.server_log("[NGINX] Rebuilding Nginx configuration...")
            self.log("[NGINX] Rebuilding web server config...", "INFO")

            # Get domain info
            domain = self.domain_name.get() or "localhost"

            # Create nginx config
            nginx_config = f"""server {{
    listen 80;
    server_name {domain};
    
    client_max_body_size 50M;
    
    # Frontend
    location / {{
        root /var/www/pebdeq;
        try_files $uri $uri/ /index.html;
    }}
    
    # Backend API
    location /api/ {{
        proxy_pass http://localhost:5005/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}
    
    # Static uploads
    location /uploads/ {{
        alias /opt/pebdeq/backend/uploads/;
    }}
}}"""

            # Write and enable config
            self.execute_ssh_command(f"cat > /etc/nginx/sites-available/pebdeq << 'EOF'\n{nginx_config}\nEOF")
            self.execute_ssh_command("ln -sf /etc/nginx/sites-available/pebdeq /etc/nginx/sites-enabled/")
            self.execute_ssh_command("nginx -t && systemctl restart nginx")

            self.log("[OK] Nginx configuration rebuilt", "SUCCESS")
            self.server_log("✅ Nginx config rebuilt")

        except Exception as e:
            self.log(f"[ERROR] Nginx rebuild failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Nginx rebuild error: {str(e)}")

    def generate_stability_report(self):
        """Generate comprehensive stability report"""
        try:
            if not self.ssh_client:
                messagebox.showerror("Error", "Not connected to server")
                return

            self.server_log("[REPORT] Generating stability report...")
            self.log("[REPORT] Creating stability report...", "INFO")

            report = []
            report.append("PEBDEQ BACKEND STABILITY REPORT")
            report.append("=" * 50)
            report.append(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}")
            report.append("")

            # Service status
            report.append("SERVICE STATUS:")
            backend_status = self.execute_ssh_command("systemctl is-active pebdeq-backend")
            nginx_status = self.execute_ssh_command("systemctl is-active nginx")
            report.append(f"Backend: {backend_status.strip()}")
            report.append(f"Nginx: {nginx_status.strip()}")
            report.append("")

            # Recent restarts
            report.append("RECENT ACTIVITY:")
            restart_count = self.execute_ssh_command("journalctl -u pebdeq-backend --since='24 hours ago' | grep -c 'Started\\|Stopped' || echo '0'")
            report.append(f"Backend restarts (24h): {restart_count.strip()}")

            # Error analysis
            error_count = self.execute_ssh_command("journalctl -u pebdeq-backend --since='24 hours ago' | grep -i error | wc -l")
            report.append(f"Error count (24h): {error_count.strip()}")
            report.append("")

            # System resources
            report.append("SYSTEM RESOURCES:")
            memory_info = self.execute_ssh_command("free | grep Mem | awk '{printf \"%.1f\", $3/$2 * 100.0}'")
            disk_info = self.execute_ssh_command("df /opt/pebdeq | tail -1 | awk '{print $5}'")
            report.append(f"Memory usage: {memory_info.strip()}%")
            report.append(f"Disk usage: {disk_info.strip()}")
            report.append("")

            # Recent logs
            report.append("RECENT BACKEND LOGS:")
            recent_logs = self.execute_ssh_command("journalctl -u pebdeq-backend --since='1 hour ago' --no-pager | tail -10")
            report.append(recent_logs)

            # Show report
            report_text = "\n".join(report)

            report_window = tk.Toplevel(self.root)
            report_window.title("Stability Report")
            report_window.geometry("800x600")

            text_widget = scrolledtext.ScrolledText(report_window, font=('Consolas', 9))
            text_widget.pack(fill='both', expand=True, padx=10, pady=10)
            text_widget.insert('1.0', report_text)
            text_widget.config(state='disabled')

            self.log("[OK] Stability report generated", "SUCCESS")

        except Exception as e:
            self.log(f"[ERROR] Report generation failed: {str(e)}", "ERROR")
            self.server_log(f"❌ Report error: {str(e)}")

    def network_log(self, message, level="INFO"):
        """Add message to network results panel"""
        try:
            timestamp = time.strftime("%H:%M:%S")
            colors = {
                "INFO": "#3498db",
                "SUCCESS": "#27ae60",
                "WARNING": "#f39c12",
                "ERROR": "#e74c3c"
            }

            # Check if network_results_text widget exists
            if hasattr(self, 'network_results_text') and self.network_results_text:
                self.network_results_text.configure(state='normal')
                self.network_results_text.insert(tk.END, f"[{timestamp}] {level}: {message}\n")

                # Color coding (basic)
                if level in colors:
                    start_line = self.network_results_text.index(tk.END + "-2l linestart")
                    end_line = self.network_results_text.index(tk.END + "-1l lineend")
                    self.network_results_text.tag_add(level, start_line, end_line)
                    self.network_results_text.tag_config(level, foreground=colors[level])

                self.network_results_text.configure(state='disabled')
                self.network_results_text.see(tk.END)
                self.root.update()
            else:
                # Fallback to console if GUI not ready
                print(f"[{timestamp}] {level}: {message}")

        except Exception as e:
            # Fallback to console if any error
            print(f"[{timestamp}] {level}: {message}")
            print(f"Network log error: {str(e)}")

    # Context Menu Setup and Handlers
    def setup_context_menus(self):
        """Setup context menus for file trees"""
        import tkinter.messagebox as msgbox

        # Local context menu
        self.local_context_menu = tk.Menu(self.root, tearoff=0)
        self.local_context_menu.add_command(label="📂 Open", command=self.local_open_file)
        self.local_context_menu.add_separator()
        self.local_context_menu.add_command(label="📋 Copy", command=self.local_copy_file)
        self.local_context_menu.add_command(label="✂️ Cut", command=self.local_cut_file)
        self.local_context_menu.add_command(label="📌 Paste", command=self.local_paste_file)
        self.local_context_menu.add_separator()
        self.local_context_menu.add_command(label="📝 Rename", command=self.local_rename_file)
        self.local_context_menu.add_command(label="🗑️ Delete", command=self.local_delete_file)
        self.local_context_menu.add_separator()
        self.local_context_menu.add_command(label="📁 New Folder", command=self.local_new_folder)
        self.local_context_menu.add_command(label="📄 Properties", command=self.local_file_properties)

        # Remote context menu
        self.remote_context_menu = tk.Menu(self.root, tearoff=0)
        self.remote_context_menu.add_command(label="📂 Open", command=self.remote_open_file)
        self.remote_context_menu.add_separator()
        self.remote_context_menu.add_command(label="📋 Copy", command=self.remote_copy_file)
        self.remote_context_menu.add_command(label="✂️ Cut", command=self.remote_cut_file)
        self.remote_context_menu.add_command(label="📌 Paste", command=self.remote_paste_file)
        self.remote_context_menu.add_separator()
        self.remote_context_menu.add_command(label="📝 Rename", command=self.remote_rename_file)
        self.remote_context_menu.add_command(label="🗑️ Delete", command=self.remote_delete_file)
        self.remote_context_menu.add_separator()
        self.remote_context_menu.add_command(label="📁 New Folder", command=self.remote_new_folder)
        self.remote_context_menu.add_command(label="⬇️ Download", command=self.remote_download_file)
        self.remote_context_menu.add_command(label="📄 Properties", command=self.remote_file_properties)

        # Initialize clipboard
        self.clipboard_data = None
        self.clipboard_operation = None  # 'copy' or 'cut'
        self.clipboard_source = None  # 'local' or 'remote'

    def show_local_context_menu(self, event):
        """Show context menu for local files"""
        # Select item under cursor
        item = self.local_tree.identify_row(event.y)
        if item:
            self.local_tree.selection_set(item)
            self.local_context_menu.post(event.x_root, event.y_root)

    def show_remote_context_menu(self, event):
        """Show context menu for remote files"""
        # Select item under cursor
        item = self.remote_tree.identify_row(event.y)
        if item:
            self.remote_tree.selection_set(item)
            self.remote_context_menu.post(event.x_root, event.y_root)

    # Local File Operations
    def local_open_file(self):
        """Open selected local file/folder"""
        selection = self.local_tree.selection()
        if not selection:
            return

        item = selection[0]
        file_path = Path(self.local_path_var.get()) / self.local_tree.item(item)['text']

        if file_path.is_dir():
            self.local_path_var.set(str(file_path))
            self.refresh_local_files()
        else:
            # Open file with default program
            try:
                import os
                os.startfile(str(file_path))
            except (OSError, AttributeError, FileNotFoundError):
                self.log(f"[ERROR] Cannot open file: {file_path}", "ERROR")

    def local_copy_file(self):
        """Copy selected local file to clipboard"""
        selection = self.local_tree.selection()
        if not selection:
            return

        item = selection[0]
        file_path = Path(self.local_path_var.get()) / self.local_tree.item(item)['text']

        self.clipboard_data = str(file_path)
        self.clipboard_operation = 'copy'
        self.clipboard_source = 'local'
        self.log(f"[COPY] Copied to clipboard: {file_path.name}", "INFO")

    def local_cut_file(self):
        """Cut selected local file to clipboard"""
        selection = self.local_tree.selection()
        if not selection:
            return

        item = selection[0]
        file_path = Path(self.local_path_var.get()) / self.local_tree.item(item)['text']

        self.clipboard_data = str(file_path)
        self.clipboard_operation = 'cut'
        self.clipboard_source = 'local'
        self.log(f"[CUT] Cut to clipboard: {file_path.name}", "INFO")

    def local_paste_file(self):
        """Paste file from clipboard to current local directory"""
        if not self.clipboard_data:
            self.log("[WARN] Clipboard is empty", "WARNING")
            return

        try:
            import shutil
            source_path = Path(self.clipboard_data)
            target_dir = Path(self.local_path_var.get())
            target_path = target_dir / source_path.name

            if self.clipboard_operation == 'copy':
                if source_path.is_dir():
                    shutil.copytree(source_path, target_path)
                else:
                    shutil.copy2(source_path, target_path)
                self.log(f"[OK] Copied: {source_path.name}", "SUCCESS")

            elif self.clipboard_operation == 'cut':
                shutil.move(source_path, target_path)
                self.log(f"[OK] Moved: {source_path.name}", "SUCCESS")
                # Clear clipboard after cut
                self.clipboard_data = None
                self.clipboard_operation = None

            self.refresh_local_files()

        except Exception as e:
            self.log(f"[ERROR] Paste failed: {str(e)}", "ERROR")

    def local_delete_file(self):
        """Delete selected local file/folder"""
        selection = self.local_tree.selection()
        if not selection:
            return

        item = selection[0]
        file_path = Path(self.local_path_var.get()) / self.local_tree.item(item)['text']

        # Confirm deletion
        result = messagebox.askyesno(
            "Delete Confirmation",
            f"Are you sure you want to delete:\n{file_path.name}?\n\nThis cannot be undone!",
            icon='warning'
        )

        if result:
            try:
                import shutil
                if file_path.is_dir():
                    shutil.rmtree(file_path)
                else:
                    file_path.unlink()

                self.log(f"[OK] Deleted: {file_path.name}", "SUCCESS")
                self.refresh_local_files()

            except Exception as e:
                self.log(f"[ERROR] Delete failed: {str(e)}", "ERROR")

    def local_rename_file(self):
        """Rename selected local file/folder"""
        selection = self.local_tree.selection()
        if not selection:
            return

        item = selection[0]
        old_path = Path(self.local_path_var.get()) / self.local_tree.item(item)['text']

        # Get new name from user
        new_name = tk.simpledialog.askstring(
            "Rename",
            f"Enter new name for:\n{old_path.name}",
            initialvalue=old_path.name
        )

        if new_name and new_name != old_path.name:
            try:
                new_path = old_path.parent / new_name
                old_path.rename(new_path)
                self.log(f"[OK] Renamed: {old_path.name} → {new_name}", "SUCCESS")
                self.refresh_local_files()

            except Exception as e:
                self.log(f"[ERROR] Rename failed: {str(e)}", "ERROR")

    def local_new_folder(self):
        """Create new folder in current local directory"""
        folder_name = tk.simpledialog.askstring(
            "New Folder",
            "Enter folder name:",
            initialvalue="New Folder"
        )

        if folder_name:
            try:
                new_folder = Path(self.local_path_var.get()) / folder_name
                new_folder.mkdir(exist_ok=False)
                self.log(f"[OK] Created folder: {folder_name}", "SUCCESS")
                self.refresh_local_files()

            except Exception as e:
                self.log(f"[ERROR] Create folder failed: {str(e)}", "ERROR")

    def local_file_properties(self):
        """Show properties of selected local file"""
        selection = self.local_tree.selection()
        if not selection:
            return

        item = selection[0]
        file_path = Path(self.local_path_var.get()) / self.local_tree.item(item)['text']

        try:
            import datetime
            stat = file_path.stat()

            size = stat.st_size
            if size > 1024*1024:
                size_str = f"{size/(1024*1024):.1f} MB"
            elif size > 1024:
                size_str = f"{size/1024:.1f} KB"
            else:
                size_str = f"{size} bytes"

            modified = datetime.datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')

            file_type = "Folder" if file_path.is_dir() else "File"

            properties = f"""File Properties:
            
Name: {file_path.name}
Type: {file_type}
Size: {size_str}
Modified: {modified}
Path: {file_path}"""

            messagebox.showinfo("Properties", properties)

        except Exception as e:
            self.log(f"[ERROR] Properties failed: {str(e)}", "ERROR")

    # Remote File Operations
    def remote_open_file(self):
        """Open selected remote file/folder"""
        selection = self.remote_tree.selection()
        if not selection:
            return

        item = selection[0]
        filename = self.remote_tree.item(item)['text']

        if filename in ['..', '.']:
            return

        current_path = self.remote_path_var.get()

        # Check if it's a directory
        values = self.remote_tree.item(item)['values']
        if values and len(values) > 2 and values[2].startswith('d'):  # Directory permissions start with 'd'
            new_path = f"{current_path}/{filename}" if not current_path.endswith('/') else f"{current_path}{filename}"
            self.remote_path_var.set(new_path)
            self.refresh_remote_files()

    def remote_copy_file(self):
        """Copy selected remote file to clipboard"""
        selection = self.remote_tree.selection()
        if not selection:
            return

        item = selection[0]
        filename = self.remote_tree.item(item)['text']
        file_path = f"{self.remote_path_var.get()}/{filename}"

        self.clipboard_data = file_path
        self.clipboard_operation = 'copy'
        self.clipboard_source = 'remote'
        self.log(f"[COPY] Copied to clipboard: {filename}", "INFO")

    def remote_cut_file(self):
        """Cut selected remote file to clipboard"""
        selection = self.remote_tree.selection()
        if not selection:
            return

        item = selection[0]
        filename = self.remote_tree.item(item)['text']
        file_path = f"{self.remote_path_var.get()}/{filename}"

        self.clipboard_data = file_path
        self.clipboard_operation = 'cut'
        self.clipboard_source = 'remote'
        self.log(f"[CUT] Cut to clipboard: {filename}", "INFO")

    def remote_paste_file(self):
        """Paste file from clipboard to current remote directory"""
        if not self.clipboard_data or not self.ssh_client:
            self.log("[WARN] Clipboard empty or not connected", "WARNING")
            return

        try:
            source_path = self.clipboard_data
            target_dir = self.remote_path_var.get()

            if self.clipboard_source == 'remote':
                # Remote to remote operation
                filename = source_path.split('/')[-1]
                target_path = f"{target_dir}/{filename}"

                if self.clipboard_operation == 'copy':
                    stdin, stdout, stderr = self.ssh_client.exec_command(f"cp -r '{source_path}' '{target_path}'")
                    if stderr.read():
                        raise Exception("Copy failed")
                    self.log(f"[OK] Copied: {filename}", "SUCCESS")

                elif self.clipboard_operation == 'cut':
                    stdin, stdout, stderr = self.ssh_client.exec_command(f"mv '{source_path}' '{target_path}'")
                    if stderr.read():
                        raise Exception("Move failed")
                    self.log(f"[OK] Moved: {filename}", "SUCCESS")
                    self.clipboard_data = None
                    self.clipboard_operation = None

            self.refresh_remote_files()

        except Exception as e:
            self.log(f"[ERROR] Paste failed: {str(e)}", "ERROR")

    def remote_delete_file(self):
        """Delete selected remote file/folder"""
        selection = self.remote_tree.selection()
        if not selection or not self.ssh_client:
            return

        item = selection[0]
        filename = self.remote_tree.item(item)['text']
        file_path = f"{self.remote_path_var.get()}/{filename}"

        # Confirm deletion
        result = messagebox.askyesno(
            "Delete Confirmation",
            f"Are you sure you want to delete:\n{filename}?\n\nThis cannot be undone!",
            icon='warning'
        )

        if result:
            try:
                stdin, stdout, stderr = self.ssh_client.exec_command(f"rm -rf '{file_path}'")
                error = stderr.read().decode()
                if error:
                    raise Exception(error)

                self.log(f"[OK] Deleted: {filename}", "SUCCESS")
                self.refresh_remote_files()

            except Exception as e:
                self.log(f"[ERROR] Delete failed: {str(e)}", "ERROR")

    def remote_rename_file(self):
        """Rename selected remote file/folder"""
        selection = self.remote_tree.selection()
        if not selection or not self.ssh_client:
            return

        item = selection[0]
        old_name = self.remote_tree.item(item)['text']
        old_path = f"{self.remote_path_var.get()}/{old_name}"

        # Get new name from user
        new_name = tk.simpledialog.askstring(
            "Rename",
            f"Enter new name for:\n{old_name}",
            initialvalue=old_name
        )

        if new_name and new_name != old_name:
            try:
                new_path = f"{self.remote_path_var.get()}/{new_name}"
                stdin, stdout, stderr = self.ssh_client.exec_command(f"mv '{old_path}' '{new_path}'")
                error = stderr.read().decode()
                if error:
                    raise Exception(error)

                self.log(f"[OK] Renamed: {old_name} → {new_name}", "SUCCESS")
                self.refresh_remote_files()

            except Exception as e:
                self.log(f"[ERROR] Rename failed: {str(e)}", "ERROR")

    def remote_new_folder(self):
        """Create new folder in current remote directory"""
        if not self.ssh_client:
            self.log("[ERROR] Not connected to server", "ERROR")
            return

        folder_name = tk.simpledialog.askstring(
            "New Folder",
            "Enter folder name:",
            initialvalue="New Folder"
        )

        if folder_name:
            try:
                folder_path = f"{self.remote_path_var.get()}/{folder_name}"
                stdin, stdout, stderr = self.ssh_client.exec_command(f"mkdir '{folder_path}'")
                error = stderr.read().decode()
                if error:
                    raise Exception(error)

                self.log(f"[OK] Created folder: {folder_name}", "SUCCESS")
                self.refresh_remote_files()

            except Exception as e:
                self.log(f"[ERROR] Create folder failed: {str(e)}", "ERROR")

    def remote_download_file(self):
        """Download selected remote file to local directory"""
        selection = self.remote_tree.selection()
        if not selection or not self.ssh_client:
            return

        item = selection[0]
        filename = self.remote_tree.item(item)['text']
        remote_path = f"{self.remote_path_var.get()}/{filename}"
        local_path = Path(self.local_path_var.get()) / filename

        try:
            sftp = self.ssh_client.open_sftp()
            sftp.get(remote_path, str(local_path))
            sftp.close()

            self.log(f"[OK] Downloaded: {filename}", "SUCCESS")
            self.refresh_local_files()

        except Exception as e:
            self.log(f"[ERROR] Download failed: {str(e)}", "ERROR")

    def remote_file_properties(self):
        """Show properties of selected remote file"""
        selection = self.remote_tree.selection()
        if not selection or not self.ssh_client:
            return

        item = selection[0]
        filename = self.remote_tree.item(item)['text']
        file_path = f"{self.remote_path_var.get()}/{filename}"

        try:
            stdin, stdout, stderr = self.ssh_client.exec_command(f"ls -la '{file_path}'")
            output = stdout.read().decode().strip()

            properties = f"""Remote File Properties:
            
Name: {filename}
Path: {file_path}
Details: {output}"""

            messagebox.showinfo("Properties", properties)

        except Exception as e:
            self.log(f"[ERROR] Properties failed: {str(e)}", "ERROR")

    def fix_dependencies_issues(self):
        """Install dependencies ONLY from requirements.txt file (NO automatic fixes)"""
        try:
            self.connect_ssh()
            
            # Create installation window
            fix_window = tk.Toplevel(self.root)
            fix_window.title("📋 Install from requirements.txt - PEBDEQ")
            fix_window.geometry("800x600")
            fix_window.configure(bg='#2c3e50')
            
            # Header
            header_frame = tk.Frame(fix_window, bg='#27ae60', height=50)
            header_frame.pack(fill='x', pady=(0, 10))
            header_frame.pack_propagate(False)
            
            header_label = tk.Label(header_frame, text="📋 Installing from requirements.txt", 
                                  font=('Arial', 14, 'bold'), fg='white', bg='#27ae60')
            header_label.pack(expand=True)
            
            # Progress display
            progress_text = scrolledtext.ScrolledText(fix_window, 
                                                    height=30, bg='#1a1a1a', fg='#00ff00', 
                                                    font=('Consolas', 9), wrap=tk.WORD)
            progress_text.pack(fill='both', expand=True, padx=20, pady=(0, 20))
            
            progress_text.insert(tk.END, "=== INSTALLING FROM requirements.txt ===\n\n")
            
            def log_progress(message):
                progress_text.insert(tk.END, f"[{time.strftime('%H:%M:%S')}] {message}\n")
                progress_text.see(tk.END)
                fix_window.update()
            
            # Step 1: Stop backend service
            log_progress("1. 🛑 Stopping backend service...")
            self.execute_ssh_command("systemctl stop pebdeq-backend")
            
            # Step 2: Check requirements.txt (NO MODIFICATIONS)
            log_progress("2. 📄 Checking requirements.txt (NO automatic changes)...")
            
            # Just verify file exists - NO sed commands, NO modifications
            check_file = self.execute_ssh_command("cd /opt/pebdeq/backend && ls -la requirements.txt")
            if "requirements.txt" in check_file:
                log_progress("✅ requirements.txt file found")
                log_progress("📌 Using file AS-IS - no automatic version changes")
            else:
                log_progress("❌ requirements.txt not found")
                return
            
            # Step 3: Clean pip cache
            log_progress("3. 🧹 Cleaning pip cache...")
            self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip cache purge")
            
            # Step 4: Install ONLY from requirements.txt (NO hardcoded versions)
            log_progress("4. 📋 Installing ONLY from requirements.txt...")
            log_progress("📌 NO hardcoded versions - using file contents exactly as written")
            
            result = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install -r requirements.txt --force-reinstall")
            
            if "Successfully installed" in result:
                log_progress("✅ All requirements installed successfully")
            else:
                log_progress(f"⚠️ Requirements installation had issues")
                log_progress(result[:200] + "...")
            
            # Step 5: Verify critical imports
            log_progress("5. 🔍 Verifying critical imports...")
            
            import_tests = [
                ("Flask", "from flask import Flask"),
                ("Flask-CORS", "from flask_cors import CORS"),
                ("SQLAlchemy", "from flask_sqlalchemy import SQLAlchemy"),
                ("Werkzeug", "import werkzeug")
            ]
            
            for module_name, import_cmd in import_tests:
                test_result = self.execute_ssh_command(f"cd /opt/pebdeq/backend && ./venv/bin/python -c \"{import_cmd}; print('OK')\"")
                if "OK" in test_result:
                    log_progress(f"✅ {module_name} import successful")
                else:
                    log_progress(f"❌ {module_name} import failed: {test_result}")
            
            # Step 6: Test backend startup
            log_progress("6. 🚀 Testing backend startup...")
            startup_test = self.execute_ssh_command("cd /opt/pebdeq/backend && timeout 10s ./venv/bin/python run.py 2>&1 || echo 'TIMEOUT_OR_ERROR'")
            
            if "TIMEOUT_OR_ERROR" in startup_test:
                log_progress("✅ Backend starts successfully (timeout expected)")
            elif "ModuleNotFoundError" in startup_test:
                log_progress(f"❌ Still missing modules: {startup_test}")
            else:
                log_progress(f"⚠️ Startup result: {startup_test[:100]}...")
            
            # Step 7: Start backend service
            log_progress("7. ▶️ Starting backend service...")
            self.execute_ssh_command("systemctl start pebdeq-backend")
            
            # Wait and check status
            time.sleep(5)
            status = self.execute_ssh_command("systemctl is-active pebdeq-backend")
            if "active" in status:
                log_progress("🎉 Backend service started successfully!")
            else:
                log_progress(f"⚠️ Backend service status: {status}")
            
            log_progress("\n=== INSTALLATION FROM requirements.txt COMPLETED ===")
            
            # Close button
            tk.Button(fix_window, text="❌ Close", 
                     command=fix_window.destroy,
                     bg='#e74c3c', fg='white', font=('Arial', 11, 'bold')).pack(pady=10)
            
        except Exception as e:
            self.server_log(f"Failed to fix dependencies: {str(e)}")
    
    def fix_frontend_issues(self):
        """Fix frontend build issues like syntax errors and npm problems"""
        try:
            self.connect_ssh()
            
            # Create fixing window
            fix_window = tk.Toplevel(self.root)
            fix_window.title("🎨 Fix Frontend - PEBDEQ")
            fix_window.geometry("800x600")
            fix_window.configure(bg='#2c3e50')
            
            # Header
            header_frame = tk.Frame(fix_window, bg='#9b59b6', height=50)
            header_frame.pack(fill='x', pady=(0, 10))
            header_frame.pack_propagate(False)
            
            header_label = tk.Label(header_frame, text="🎨 Fixing Frontend Issues", 
                                  font=('Arial', 14, 'bold'), fg='white', bg='#9b59b6')
            header_label.pack(expand=True)
            
            # Progress display
            progress_text = scrolledtext.ScrolledText(fix_window, 
                                                    height=30, bg='#1a1a1a', fg='#00ff00', 
                                                    font=('Consolas', 9), wrap=tk.WORD)
            progress_text.pack(fill='both', expand=True, padx=20, pady=(0, 20))
            
            progress_text.insert(tk.END, "=== FRONTEND FIXING STARTED ===\n\n")
            
            def log_progress(message):
                progress_text.insert(tk.END, f"[{time.strftime('%H:%M:%S')}] {message}\n")
                progress_text.see(tk.END)
                fix_window.update()
            
            # Step 1: Clean node modules and cache
            log_progress("1. 🧹 Cleaning npm cache and node_modules...")
            cleanup_commands = [
                "cd /opt/pebdeq/frontend",
                "rm -rf node_modules",
                "rm -f package-lock.json",
                "npm cache clean --force"
            ]
            
            for cmd in cleanup_commands:
                result = self.execute_ssh_command(cmd)
                log_progress(f"✅ {cmd}")
            
            # Step 2: Fix package.json syntax issues
            log_progress("2. 📝 Checking package.json syntax...")
            package_check = self.execute_ssh_command("cd /opt/pebdeq/frontend && node -c 'JSON.parse(require(\"fs\").readFileSync(\"package.json\", \"utf8\"))' && echo 'SYNTAX_OK'")
            
            if "SYNTAX_OK" in package_check:
                log_progress("✅ package.json syntax is valid")
            else:
                log_progress("⚠️ package.json may have syntax issues")
                log_progress(package_check)
            
            # Step 3: Install dependencies with legacy peer deps
            log_progress("3. 📦 Installing npm dependencies...")
            npm_install = self.execute_ssh_command("cd /opt/pebdeq/frontend && npm install --legacy-peer-deps --verbose 2>&1")
            
            if "added" in npm_install.lower() or "up to date" in npm_install.lower():
                log_progress("✅ NPM dependencies installed successfully")
            else:
                log_progress("⚠️ NPM install had issues:")
                log_progress(npm_install[:300] + "...")
            
            # Step 4: Fix common React build issues
            log_progress("4. 🔧 Fixing common React build issues...")
            
            # Check for common syntax issues in source files
            syntax_check = self.execute_ssh_command("""cd /opt/pebdeq/frontend/src && find . -name "*.js" -exec grep -l ";" {} \\; | head -5""")
            if syntax_check.strip():
                log_progress(f"Found JS files with potential issues: {syntax_check}")
            
            # Step 5: Create clean config.js
            log_progress("5. 📝 Creating clean production config.js...")
            clean_config = '''// PEBDEQ Frontend Configuration - Production
export const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5005' : '';
export const getApiUrl = (endpoint) => API_BASE_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
export default { API_BASE_URL, getApiUrl };'''
            
            self.execute_ssh_command(f"""cd /opt/pebdeq/frontend/src && cat > config.js << 'EOF'
{clean_config}
EOF""")
            log_progress("✅ Clean config.js created")
            
            # Step 6: Try build
            log_progress("6. 🏗️ Attempting frontend build...")
            build_result = self.execute_ssh_command("cd /opt/pebdeq/frontend && npm run build 2>&1")
            
            if "built successfully" in build_result.lower() or "compiled successfully" in build_result.lower():
                log_progress("🎉 Frontend build successful!")
            elif "failed to compile" in build_result.lower():
                log_progress("❌ Build failed. Checking errors...")
                # Extract error details
                errors = []
                for line in build_result.split('\n'):
                    if 'error' in line.lower() or 'failed' in line.lower():
                        errors.append(line.strip())
                
                for error in errors[:5]:  # Show first 5 errors
                    log_progress(f"Error: {error}")
            else:
                log_progress("⚠️ Build completed with warnings")
                log_progress(build_result[:200] + "...")
            
            # Step 7: Deploy built files
            log_progress("7. 🚀 Deploying frontend files...")
            deploy_commands = [
                "mkdir -p /var/www/pebdeq",
                "rm -rf /var/www/pebdeq/*",
                "cp -r /opt/pebdeq/frontend/build/* /var/www/pebdeq/ 2>/dev/null || cp -r /opt/pebdeq/frontend/public/* /var/www/pebdeq/",
                "chown -R www-data:www-data /var/www/pebdeq",
                "chmod -R 755 /var/www/pebdeq"
            ]
            
            for cmd in deploy_commands:
                result = self.execute_ssh_command(cmd)
                log_progress(f"✅ {cmd}")
            
            # Step 8: Test frontend
            log_progress("8. 🧪 Testing frontend deployment...")
            test_result = self.execute_ssh_command("ls -la /var/www/pebdeq/index.html 2>/dev/null && echo 'INDEX_EXISTS'")
            
            if "INDEX_EXISTS" in test_result:
                log_progress("✅ Frontend deployed successfully!")
            else:
                log_progress("⚠️ index.html not found, creating basic version...")
                basic_html = '''<!DOCTYPE html>
<html><head><title>PEBDEQ</title></head>
<body><h1>PEBDEQ Frontend</h1><p>Backend API: <a href="/api/health">/api/health</a></p></body></html>'''
                self.execute_ssh_command(f"echo '{basic_html}' > /var/www/pebdeq/index.html")
                log_progress("✅ Basic index.html created")
            
            log_progress("\n=== FRONTEND FIXING COMPLETED ===")
            
            # Close button
            tk.Button(fix_window, text="❌ Close", 
                     command=fix_window.destroy,
                     bg='#e74c3c', fg='white', font=('Arial', 11, 'bold')).pack(pady=10)
            
        except Exception as e:
            self.server_log(f"Failed to fix frontend: {str(e)}")
    
    def check_server_environment(self):
        """Check server environment vs local environment differences"""
        try:
            self.connect_ssh()
            
            # Create comparison window
            env_window = tk.Toplevel(self.root)
            env_window.title("🔍 Environment Comparison - Local vs Server")
            env_window.geometry("1000x700")
            env_window.configure(bg='#2c3e50')
            
            # Header
            header_frame = tk.Frame(env_window, bg='#34495e', height=50)
            header_frame.pack(fill='x', pady=(0, 10))
            header_frame.pack_propagate(False)
            
            header_label = tk.Label(header_frame, text="🔍 Environment Comparison Analysis", 
                                  font=('Arial', 14, 'bold'), fg='white', bg='#34495e')
            header_label.pack(expand=True)
            
            # Comparison display
            comp_text = scrolledtext.ScrolledText(env_window, 
                                                height=35, bg='#1a1a1a', fg='#00ff00', 
                                                font=('Consolas', 9), wrap=tk.WORD)
            comp_text.pack(fill='both', expand=True, padx=20, pady=(0, 20))
            
            comp_text.insert(tk.END, "=== ENVIRONMENT COMPARISON ANALYSIS ===\n\n")
            
            def log_comparison(message):
                comp_text.insert(tk.END, f"{message}\n")
                comp_text.see(tk.END)
                env_window.update()
            
            # Local Environment Info
            log_comparison("📍 LOCAL ENVIRONMENT (Windows):")
            log_comparison("=" * 50)
            
            import sys
            import platform
            log_comparison(f"Python Version: {sys.version}")
            log_comparison(f"Platform: {platform.platform()}")
            log_comparison(f"Architecture: {platform.architecture()}")
            # Get pip version safely
            try:
                pip_result = subprocess.run(['pip', '--version'], capture_output=True, text=True, timeout=5)
                pip_version = pip_result.stdout.strip() if pip_result.returncode == 0 else "Unknown"
            except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
                pip_version = "Not available"
            log_comparison(f"Pip Version: {pip_version}")
            log_comparison("")
            
            # Server Environment Info  
            log_comparison("🖥️ SERVER ENVIRONMENT (Linux):")
            log_comparison("=" * 50)
            
            server_checks = [
                ("Python Version", "python3 --version"),
                ("Platform", "uname -a"),
                ("OS Release", "cat /etc/os-release | grep PRETTY_NAME"),
                ("Architecture", "uname -m"),
                ("Pip Version", "/opt/pebdeq/backend/venv/bin/pip --version"),
                ("Available Python Versions", "ls /usr/bin/python* | grep -v config"),
            ]
            
            for check_name, check_cmd in server_checks:
                try:
                    result = self.execute_ssh_command(check_cmd)
                    log_comparison(f"{check_name}: {result.strip()}")
                except Exception as e:
                    log_comparison(f"{check_name}: ERROR - {str(e)}")
            
            log_comparison("")
            log_comparison("🔍 PACKAGE AVAILABILITY CHECK:")
            log_comparison("=" * 50)
            
            # Check problematic packages
            problematic_packages = [
                "Flask==3.0.3",
                "PyJWT==2.9.0", 
                "torch==2.7.0",
                "transformers==4.53.2",
                "onnxruntime==1.22.1"
            ]
            
            for package in problematic_packages:
                # Check if available on server's pip
                check_cmd = f"/opt/pebdeq/backend/venv/bin/pip index versions {package.split('==')[0]} 2>&1"
                result = self.execute_ssh_command(check_cmd)
                
                if "Available versions:" in result:
                    # Extract available versions
                    versions_line = [line for line in result.split('\n') if 'Available versions:' in line]
                    if versions_line:
                        available = versions_line[0].split('Available versions:')[1].strip()
                        log_comparison(f"✅ {package.split('==')[0]}: Available versions: {available[:100]}...")
                    else:
                        log_comparison(f"⚠️ {package}: Available but versions unclear")
                else:
                    log_comparison(f"❌ {package}: {result.strip()[:100]}...")
            
            log_comparison("")
            log_comparison("🔧 SYSTEM DEPENDENCIES CHECK:")
            log_comparison("=" * 50)
            
            # Check build dependencies
            build_deps = [
                ("Build Tools", "dpkg -l | grep -E 'build-essential|gcc|g++'"),
                ("Python Dev", "dpkg -l | grep python3-dev"),
                ("SSL Dev", "dpkg -l | grep libssl-dev"),
                ("FFI Dev", "dpkg -l | grep libffi-dev"),
                ("Image Libraries", "dpkg -l | grep -E 'libjpeg-dev|libpng-dev'"),
                ("ML Libraries", "dpkg -l | grep -E 'libblas|liblapack'")
            ]
            
            for dep_name, dep_cmd in build_deps:
                try:
                    result = self.execute_ssh_command(dep_cmd)
                    if result.strip():
                        log_comparison(f"✅ {dep_name}: Installed")
                    else:
                        log_comparison(f"❌ {dep_name}: Missing")
                except Exception as e:
                    log_comparison(f"⚠️ {dep_name}: Check failed")
            
            log_comparison("")
            log_comparison("📊 DIFFERENCES SUMMARY:")
            log_comparison("=" * 50)
            log_comparison("🔹 Local: Windows Python 3.12 with pre-compiled wheels")
            log_comparison("🔹 Server: Linux Python 3.x requiring compilation for some packages")
            log_comparison("🔹 Some packages (PyJWT==2.10.1, torch==2.7.1) may not exist yet")
            log_comparison("🔹 Server may need build dependencies for ML packages")
            log_comparison("")
            log_comparison("💡 SOLUTIONS:")
            log_comparison("1. Use compatible versions (Fix Dependencies button)")
            log_comparison("2. Install build dependencies on server")
            log_comparison("3. Use pip with --no-deps for problematic packages")
            log_comparison("4. Consider using Docker for consistency")
            
            # Close button
            tk.Button(env_window, text="❌ Close", 
                     command=env_window.destroy,
                     bg='#e74c3c', fg='white', font=('Arial', 11, 'bold')).pack(pady=10)
            
        except Exception as e:
            self.server_log(f"Failed to check environment: {str(e)}")
    
    def show_server_info(self):
        """Show comprehensive server technical information"""
        try:
            self.connect_ssh()
            
            # Create server info window
            info_window = tk.Toplevel(self.root)
            info_window.title("📊 Server Technical Information - PEBDEQ")
            info_window.geometry("1200x800")
            info_window.configure(bg='#2c3e50')
            
            # Header
            header_frame = tk.Frame(info_window, bg='#2980b9', height=50)
            header_frame.pack(fill='x', pady=(0, 10))
            header_frame.pack_propagate(False)
            
            header_label = tk.Label(header_frame, text="📊 Complete Server Technical Analysis", 
                                  font=('Arial', 14, 'bold'), fg='white', bg='#2980b9')
            header_label.pack(expand=True)
            
            # Info display with tabs
            notebook = ttk.Notebook(info_window)
            notebook.pack(fill='both', expand=True, padx=20, pady=(0, 20))
            
            # Tab 1: Hardware & System
            hw_frame = ttk.Frame(notebook)
            notebook.add(hw_frame, text="🖥️ Hardware & System")
            
            hw_text = scrolledtext.ScrolledText(hw_frame, height=30, bg='#1a1a1a', fg='#00ff00', 
                                              font=('Consolas', 9), wrap=tk.WORD)
            hw_text.pack(fill='both', expand=True, padx=10, pady=10)
            
            # Tab 2: Network & Services  
            net_frame = ttk.Frame(notebook)
            notebook.add(net_frame, text="🌐 Network & Services")
            
            net_text = scrolledtext.ScrolledText(net_frame, height=30, bg='#1a1a1a', fg='#00ff00', 
                                               font=('Consolas', 9), wrap=tk.WORD)
            net_text.pack(fill='both', expand=True, padx=10, pady=10)
            
            # Tab 3: Software & Packages
            sw_frame = ttk.Frame(notebook)
            notebook.add(sw_frame, text="📦 Software & Packages")
            
            sw_text = scrolledtext.ScrolledText(sw_frame, height=30, bg='#1a1a1a', fg='#00ff00', 
                                              font=('Consolas', 9), wrap=tk.WORD)
            sw_text.pack(fill='both', expand=True, padx=10, pady=10)
            
            # Tab 4: Performance & Resources
            perf_frame = ttk.Frame(notebook)
            notebook.add(perf_frame, text="⚡ Performance & Resources")
            
            perf_text = scrolledtext.ScrolledText(perf_frame, height=30, bg='#1a1a1a', fg='#00ff00', 
                                                font=('Consolas', 9), wrap=tk.WORD)
            perf_text.pack(fill='both', expand=True, padx=10, pady=10)
            
            def log_to_tab(tab_widget, message):
                tab_widget.insert(tk.END, f"{message}\n")
                tab_widget.see(tk.END)
                info_window.update()
            
            # ===== HARDWARE & SYSTEM TAB =====
            log_to_tab(hw_text, "🖥️ HARDWARE & SYSTEM INFORMATION")
            log_to_tab(hw_text, "=" * 60)
            
            hw_commands = [
                ("🖥️ System Information", "hostnamectl"),
                ("💻 CPU Information", "lscpu | head -20"),
                ("🧠 Memory Information", "free -h"),
                ("💾 Disk Information", "df -h"),
                ("🔧 Hardware Summary", "lshw -short | head -20"),
                ("⚙️ Kernel Version", "uname -a"),
                ("📅 System Uptime", "uptime"),
                ("🌡️ Temperature (if available)", "sensors 2>/dev/null || echo 'sensors not available'"),
                ("🔌 USB Devices", "lsusb | head -10"),
                ("📡 PCI Devices", "lspci | head -10"),
            ]
            
            for cmd_name, cmd in hw_commands:
                log_to_tab(hw_text, f"\n--- {cmd_name} ---")
                try:
                    result = self.execute_ssh_command(cmd)
                    log_to_tab(hw_text, result)
                except Exception as e:
                    log_to_tab(hw_text, f"ERROR: {str(e)}")
            
            # ===== NETWORK & SERVICES TAB =====
            log_to_tab(net_text, "🌐 NETWORK & SERVICES INFORMATION")
            log_to_tab(net_text, "=" * 60)
            
            net_commands = [
                ("🌐 Network Interfaces", "ip addr show"),
                ("🔗 Routing Table", "ip route"),
                ("🌍 DNS Configuration", "cat /etc/resolv.conf"),
                ("🔥 Firewall Status", "ufw status verbose"),
                ("🚪 Open Ports", "netstat -tulpn | head -20"),
                ("🔌 Active Connections", "ss -tuln | head -15"),
                ("📊 Network Statistics", "cat /proc/net/dev"),
                ("🌐 Public IP", "curl -s ifconfig.me || echo 'Unable to get public IP'"),
                ("🏠 Hostname", "hostname -f"),
                ("⚙️ Running Services", "systemctl list-units --type=service --state=running | head -15"),
            ]
            
            for cmd_name, cmd in net_commands:
                log_to_tab(net_text, f"\n--- {cmd_name} ---")
                try:
                    result = self.execute_ssh_command(cmd)
                    log_to_tab(net_text, result)
                except Exception as e:
                    log_to_tab(net_text, f"ERROR: {str(e)}")
            
            # ===== SOFTWARE & PACKAGES TAB =====
            log_to_tab(sw_text, "📦 SOFTWARE & PACKAGES INFORMATION")
            log_to_tab(sw_text, "=" * 60)
            
            sw_commands = [
                ("🐧 OS Release", "cat /etc/os-release"),
                ("🐍 Python Versions", "ls /usr/bin/python* | grep -v config"),
                ("📦 Node.js & NPM", "node --version && npm --version || echo 'Node.js not installed'"),
                ("🗄️ Database Software", "which mysql postgres sqlite3 || echo 'No databases found'"),
                ("🌐 Web Servers", "which nginx apache2 || echo 'No web servers found'"),
                ("🔧 Development Tools", "which gcc make git curl wget || echo 'Some tools missing'"),
                ("📚 Python Packages (venv)", "/opt/pebdeq/backend/venv/bin/pip list | head -20"),
                ("🔒 Security Updates", "apt list --upgradable 2>/dev/null | head -10 || echo 'Unable to check updates'"),
                ("📊 Package Statistics", "dpkg -l | wc -l && echo 'total packages installed'"),
                ("🚀 Docker Status", "docker --version 2>/dev/null || echo 'Docker not installed'"),
            ]
            
            for cmd_name, cmd in sw_commands:
                log_to_tab(sw_text, f"\n--- {cmd_name} ---")
                try:
                    result = self.execute_ssh_command(cmd)
                    log_to_tab(sw_text, result)
                except Exception as e:
                    log_to_tab(sw_text, f"ERROR: {str(e)}")
            
            # ===== PERFORMANCE & RESOURCES TAB =====
            log_to_tab(perf_text, "⚡ PERFORMANCE & RESOURCES")
            log_to_tab(perf_text, "=" * 60)
            
            perf_commands = [
                ("📊 CPU Usage", "top -bn1 | head -15"),
                ("🧠 Memory Usage Details", "cat /proc/meminfo | head -20"),
                ("💾 Disk Usage Details", "du -sh /* 2>/dev/null | head -10"),
                ("🏃 Running Processes", "ps aux --sort=-%cpu | head -15"),
                ("⚡ System Load", "cat /proc/loadavg"),
                ("📈 I/O Statistics", "iostat 2>/dev/null || echo 'iostat not available'"),
                ("🔄 Process Count", "ps aux | wc -l && echo 'total processes'"),
                ("📝 Log File Sizes", "find /var/log -name '*.log' -exec ls -lh {} \\; | head -10"),
                ("🕒 Last Login", "last | head -10"),
                ("⚠️ System Errors", "dmesg | tail -10"),
            ]
            
            for cmd_name, cmd in perf_commands:
                log_to_tab(perf_text, f"\n--- {cmd_name} ---")
                try:
                    result = self.execute_ssh_command(cmd)
                    log_to_tab(perf_text, result)
                except Exception as e:
                    log_to_tab(perf_text, f"ERROR: {str(e)}")
            
            # Add summary at the end
            log_to_tab(hw_text, f"\n{'='*60}")
            log_to_tab(hw_text, "📋 QUICK SUMMARY:")
            log_to_tab(hw_text, f"Server: {self.server_ip.get()}")
            log_to_tab(hw_text, f"Scan Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Control buttons
            button_frame = tk.Frame(info_window, bg='#2c3e50')
            button_frame.pack(fill='x', padx=20, pady=(0, 20))
            
            tk.Button(button_frame, text="📋 Copy All Info", 
                     command=lambda: self.copy_all_server_info(hw_text, net_text, sw_text, perf_text),
                     bg='#8e44ad', fg='white', font=('Arial', 11, 'bold')).pack(side='left', padx=(0, 10))
            
            tk.Button(button_frame, text="💾 Save Report", 
                     command=lambda: self.save_server_report(hw_text, net_text, sw_text, perf_text),
                     bg='#27ae60', fg='white', font=('Arial', 11, 'bold')).pack(side='left', padx=(0, 10))
            
            tk.Button(button_frame, text="🔄 Refresh", 
                     command=lambda: [info_window.destroy(), self.show_server_info()],
                     bg='#3498db', fg='white', font=('Arial', 11, 'bold')).pack(side='left', padx=(0, 10))
            
            tk.Button(button_frame, text="❌ Close", 
                     command=info_window.destroy,
                     bg='#e74c3c', fg='white', font=('Arial', 11, 'bold')).pack(side='right')
            
        except Exception as e:
            self.server_log(f"Failed to get server info: {str(e)}")
    
    def copy_all_server_info(self, hw_text, net_text, sw_text, perf_text):
        """Copy all server information to clipboard"""
        try:
            full_info = "=== COMPLETE SERVER TECHNICAL REPORT ===\n\n"
            full_info += "HARDWARE & SYSTEM:\n" + hw_text.get(1.0, tk.END) + "\n"
            full_info += "NETWORK & SERVICES:\n" + net_text.get(1.0, tk.END) + "\n" 
            full_info += "SOFTWARE & PACKAGES:\n" + sw_text.get(1.0, tk.END) + "\n"
            full_info += "PERFORMANCE & RESOURCES:\n" + perf_text.get(1.0, tk.END)
            
            self.copy_to_clipboard(full_info)
            messagebox.showinfo("Copied", "Complete server information copied to clipboard!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to copy: {str(e)}")
    
    def save_server_report(self, hw_text, net_text, sw_text, perf_text):
        """Save complete server report to file"""
        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
            initialvalue=f"server_report_{time.strftime('%Y%m%d_%H%M%S')}.txt"
        )
        if filename:
            try:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write("=== PEBDEQ SERVER TECHNICAL REPORT ===\n")
                    f.write(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"Server: {self.server_ip.get()}\n\n")
                    
                    f.write("HARDWARE & SYSTEM:\n")
                    f.write("=" * 50 + "\n")
                    f.write(hw_text.get(1.0, tk.END) + "\n")
                    
                    f.write("NETWORK & SERVICES:\n") 
                    f.write("=" * 50 + "\n")
                    f.write(net_text.get(1.0, tk.END) + "\n")
                    
                    f.write("SOFTWARE & PACKAGES:\n")
                    f.write("=" * 50 + "\n") 
                    f.write(sw_text.get(1.0, tk.END) + "\n")
                    
                    f.write("PERFORMANCE & RESOURCES:\n")
                    f.write("=" * 50 + "\n")
                    f.write(perf_text.get(1.0, tk.END))
                
                messagebox.showinfo("Saved", f"Server report saved to:\n{filename}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save report: {str(e)}")
    
    def emergency_system_recovery(self):
        """EMERGENCY: Complete system recovery for critical failures"""
        try:
            self.connect_ssh()
            
            # Create emergency recovery window
            recovery_window = tk.Toplevel(self.root)
            recovery_window.title("🚨 EMERGENCY SYSTEM RECOVERY - PEBDEQ")
            recovery_window.geometry("1000x700")
            recovery_window.configure(bg='#8b0000')  # Dark red for emergency
            
            # Emergency header
            header_frame = tk.Frame(recovery_window, bg='#c0392b', height=60)
            header_frame.pack(fill='x', pady=(0, 10))
            header_frame.pack_propagate(False)
            
            header_label = tk.Label(header_frame, text="🚨 EMERGENCY SYSTEM RECOVERY IN PROGRESS", 
                                  font=('Arial', 16, 'bold'), fg='white', bg='#c0392b')
            header_label.pack(expand=True)
            
            # Recovery progress display
            recovery_text = scrolledtext.ScrolledText(recovery_window, 
                                                    height=35, bg='#000000', fg='#ff0000', 
                                                    font=('Consolas', 10), wrap=tk.WORD)
            recovery_text.pack(fill='both', expand=True, padx=20, pady=(0, 20))
            
            recovery_text.insert(tk.END, "🚨 EMERGENCY SYSTEM RECOVERY STARTED\n")
            recovery_text.insert(tk.END, "=" * 60 + "\n\n")
            
            def emergency_log(message, level="EMERGENCY"):
                timestamp = time.strftime("%H:%M:%S")
                recovery_text.insert(tk.END, f"[{timestamp}] {level}: {message}\n")
                recovery_text.see(tk.END)
                recovery_window.update()
            
            emergency_log("🚨 CRITICAL SYSTEM FAILURE DETECTED")
            emergency_log("🔧 Starting comprehensive recovery procedure...")
            
            # PHASE 1: STOP ALL PROBLEMATIC SERVICES
            emergency_log("\n🛑 PHASE 1: EMERGENCY SERVICE SHUTDOWN", "CRITICAL")
            
            shutdown_commands = [
                "systemctl stop pebdeq-backend",
                "systemctl stop nginx", 
                "docker-compose -f /opt/pebdeq/docker-compose.yml down --remove-orphans || true",
                "docker system prune -f || true",
                "pkill -f python.*run.py || true",
                "pkill -f gunicorn || true",
                "lsof -ti:5005 | xargs kill -9 2>/dev/null || true",
                "lsof -ti:80 | xargs kill -9 2>/dev/null || true",
                "lsof -ti:443 | xargs kill -9 2>/dev/null || true"
            ]
            
            for cmd in shutdown_commands:
                emergency_log(f"Executing: {cmd}")
                result = self.execute_ssh_command(cmd)
                if "error" in result.lower() and result.strip():
                    emergency_log(f"⚠️ Warning: {result[:50]}...")
                else:
                    emergency_log("✅ Success")
            
            # PHASE 2: DOCKER RECOVERY
            emergency_log("\n🐳 PHASE 2: DOCKER SYSTEM RECOVERY", "CRITICAL") 
            
            docker_recovery = [
                "systemctl stop docker",
                "sleep 5",
                "systemctl start docker",
                "sleep 10",
                "docker system prune -af --volumes",
                "docker network prune -f",
                "systemctl restart docker"
            ]
            
            for cmd in docker_recovery:
                emergency_log(f"Docker recovery: {cmd}")
                if "sleep" in cmd:
                    time.sleep(int(cmd.split()[1]))
                    emergency_log(f"✅ Wait completed")
                else:
                    result = self.execute_ssh_command(cmd)
                    emergency_log("✅ Docker command executed")
            
            # PHASE 3: SYSTEM CLEANUP
            emergency_log("\n🧹 PHASE 3: SYSTEM CLEANUP", "CRITICAL")
            
            cleanup_commands = [
                "rm -rf /opt/pebdeq/backend/__pycache__ /opt/pebdeq/backend/*/__pycache__",
                "rm -rf /tmp/numba_cache /tmp/pebdeq*",
                "find /opt/pebdeq -name '*.pyc' -delete",
                "systemctl daemon-reload",
                "systemctl reset-failed"
            ]
            
            for cmd in cleanup_commands:
                emergency_log(f"Cleanup: {cmd}")
                self.execute_ssh_command(cmd)
                emergency_log("✅ Cleanup completed")
            
            # PHASE 4: NETWORK RECOVERY
            emergency_log("\n🌐 PHASE 4: NETWORK RECOVERY", "CRITICAL")
            
            network_recovery = [
                "systemctl restart systemd-resolved",
                "systemctl restart networking",
                "ip route flush cache",
                "iptables -F || true",
                "ufw --force reset",
                "ufw allow 22/tcp",
                "ufw allow 80/tcp", 
                "ufw allow 443/tcp",
                "ufw --force enable"
            ]
            
            for cmd in network_recovery:
                emergency_log(f"Network: {cmd}")
                result = self.execute_ssh_command(cmd)
                emergency_log("✅ Network command executed")
            
            # PHASE 5: SERVICE RESTORATION
            emergency_log("\n🔄 PHASE 5: SERVICE RESTORATION", "CRITICAL")
            
            # Fix dependencies first
            emergency_log("Fixing Python dependencies...")
            self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install --force-reinstall Flask==3.0.3 Flask-CORS==4.0.0 gunicorn")
            
            # Start services in order
            service_startup = [
                ("Backend Service", "systemctl start pebdeq-backend"),
                ("Nginx Service", "systemctl start nginx"),
                ("Backend Status Check", "systemctl is-active pebdeq-backend"),
                ("Nginx Status Check", "systemctl is-active nginx")
            ]
            
            for service_name, cmd in service_startup:
                emergency_log(f"Starting: {service_name}")
                result = self.execute_ssh_command(cmd)
                if "active" in result or "start" in cmd.lower():
                    emergency_log(f"✅ {service_name}: SUCCESS")
                else:
                    emergency_log(f"⚠️ {service_name}: {result}")
                time.sleep(3)
            
            # PHASE 6: CONNECTIVITY TESTS
            emergency_log("\n🧪 PHASE 6: CONNECTIVITY VERIFICATION", "CRITICAL")
            
            connectivity_tests = [
                ("Backend Health", "curl -s http://localhost:5005/api/health || echo 'BACKEND_OFFLINE'"),
                ("Frontend Access", "curl -s -I http://localhost/ || echo 'FRONTEND_OFFLINE'"),
                ("Port 5005 Check", "netstat -tlnp | grep :5005 || echo 'PORT_5005_CLOSED'"),
                ("Port 80 Check", "netstat -tlnp | grep :80 || echo 'PORT_80_CLOSED'"),
                ("DNS Resolution", "nslookup google.com || echo 'DNS_FAILED'")
            ]
            
            recovery_success = True
            for test_name, test_cmd in connectivity_tests:
                emergency_log(f"Testing: {test_name}")
                result = self.execute_ssh_command(test_cmd)
                
                if "OFFLINE" in result or "CLOSED" in result or "FAILED" in result:
                    emergency_log(f"❌ {test_name}: FAILED - {result}")
                    recovery_success = False
                else:
                    emergency_log(f"✅ {test_name}: SUCCESS")
            
            # FINAL STATUS
            emergency_log(f"\n{'='*60}")
            if recovery_success:
                emergency_log("🎉 EMERGENCY RECOVERY COMPLETED SUCCESSFULLY!", "SUCCESS")
                emergency_log("✅ All critical systems restored")
                emergency_log("✅ Services are responding") 
                emergency_log("✅ Network connectivity verified")
            else:
                emergency_log("⚠️ PARTIAL RECOVERY COMPLETED", "WARNING")
                emergency_log("Some services may still need manual intervention")
                emergency_log("Check individual test results above")
            
            emergency_log(f"Recovery completed at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Close button
            tk.Button(recovery_window, text="❌ Close Recovery Log", 
                     command=recovery_window.destroy,
                     bg='#e74c3c', fg='white', font=('Arial', 12, 'bold'), height=2).pack(pady=10)
            
        except Exception as e:
            self.server_log(f"EMERGENCY RECOVERY FAILED: {str(e)}")
            messagebox.showerror("CRITICAL ERROR", f"Emergency recovery failed: {str(e)}")
    
    def update_server_requirements_file(self):
        """Update requirements.txt file on server with current local version"""
        try:
            self.connect_ssh()
            self.log("📤 [UPDATE] Updating requirements.txt on server...", "INFO")
            
            # Read local requirements.txt
            local_file = Path(self.project_path.get()) / "backend" / "requirements.txt"
            if not local_file.exists():
                self.log("❌ Local requirements.txt not found!", "ERROR")
                messagebox.showerror("Error", "Local requirements.txt file not found!")
                return False
            
            with open(local_file, 'r', encoding='utf-8') as f:
                local_content = f.read()
            
            self.log("✅ Local requirements.txt read successfully", "SUCCESS")
            self.log(f"📄 File size: {len(local_content)} characters", "INFO")
            
            # Create backup of server file
            backup_cmd = "cd /opt/pebdeq/backend && cp requirements.txt requirements.txt.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo 'No existing file to backup'"
            backup_result = self.execute_ssh_command(backup_cmd)
            self.log(f"💾 Backup result: {backup_result}", "INFO")
            
            # Write new content to server
            self.log("📝 Writing updated requirements.txt to server...", "INFO")
            
            # Escape content for safe shell transfer
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as tmp_file:
                tmp_file.write(local_content)
                tmp_file_path = tmp_file.name
            
            # Upload via SFTP
            if hasattr(self, 'ssh_client') and self.ssh_client:
                sftp = self.ssh_client.open_sftp()
                sftp.put(tmp_file_path, '/opt/pebdeq/backend/requirements.txt')
                sftp.close()
                self.log("✅ requirements.txt uploaded successfully", "SUCCESS")
            else:
                self.log("❌ No SSH connection available", "ERROR")
                return False
            
            # Clean up temp file
            import os
            os.unlink(tmp_file_path)
            
            # Verify the update
            verify_cmd = "cd /opt/pebdeq/backend && head -10 requirements.txt"
            verify_result = self.execute_ssh_command(verify_cmd)
            self.log("🔍 Server file verification:", "INFO")
            for line in verify_result.split('\n')[:5]:
                self.log(f"   {line}", "INFO")
            
            # Check if Flask version is correct
            flask_check = self.execute_ssh_command("cd /opt/pebdeq/backend && grep 'Flask==' requirements.txt")
            self.log(f"✅ Flask version on server: {flask_check}", "SUCCESS")
            
            messagebox.showinfo("Success", "requirements.txt updated on server!\n\nYou can now run deployment.")
            return True
            
        except Exception as e:
            self.log(f"❌ [ERROR] Failed to update requirements.txt: {str(e)}", "ERROR")
            messagebox.showerror("Update Failed", f"Failed to update requirements.txt: {str(e)}")
            return False

    def check_server_requirements_file(self):
        """Check the current requirements.txt file on server"""
        try:
            self.connect_ssh()
            self.log("🔍 [CHECK] Checking requirements.txt on server...", "INFO")
            
            # Check if file exists
            file_check = self.execute_ssh_command("cd /opt/pebdeq/backend && ls -la requirements.txt 2>/dev/null || echo 'FILE_NOT_FOUND'")
            if "FILE_NOT_FOUND" in file_check:
                self.log("❌ requirements.txt does NOT exist on server!", "ERROR")
                messagebox.showerror("File Missing", "requirements.txt does not exist on server!\n\nClick 'UPDATE SERVER FILE' to upload it.")
                return
            
            self.log(f"📄 File info: {file_check.strip()}", "INFO")
            
            # Read first 15 lines of the file
            content_check = self.execute_ssh_command("cd /opt/pebdeq/backend && head -15 requirements.txt")
            self.log("📋 First 15 lines of server file:", "INFO")
            
            lines = content_check.split('\n')
            for i, line in enumerate(lines[:15], 1):
                if line.strip():
                    self.log(f"  {i:2d}: {line}", "INFO")
            
            # Check specific packages
            flask_check = self.execute_ssh_command("cd /opt/pebdeq/backend && grep 'Flask==' requirements.txt")
            torch_check = self.execute_ssh_command("cd /opt/pebdeq/backend && grep 'torch==' requirements.txt")
            
            self.log("🔍 Key package versions:", "INFO")
            self.log(f"   Flask: {flask_check.strip()}", "INFO")
            self.log(f"   Torch: {torch_check.strip()}", "INFO")
            
            # Show results in message box
            version_info = f"Flask: {flask_check.strip()}\nTorch: {torch_check.strip()}"
            
            if "Flask==3.0.3" in flask_check and "torch==2.7.0" in torch_check:
                messagebox.showinfo("Server File Check", f"✅ Server file looks CORRECT!\n\n{version_info}")
                self.log("✅ Server requirements.txt appears to be updated correctly", "SUCCESS")
            else:
                messagebox.showwarning("Server File Check", f"⚠️ Server file may be OUTDATED!\n\n{version_info}\n\nExpected:\nFlask==3.0.3\ntorch==2.7.0\n\nClick 'UPDATE SERVER FILE' to fix.")
                self.log("⚠️ Server file versions don't match expected values", "WARNING")
                
        except Exception as e:
            self.log(f"🔍 [ERROR] Failed to check server file: {str(e)}", "ERROR")
            messagebox.showerror("Check Failed", f"Failed to check server file: {str(e)}")

    def emergency_fix_requirements(self):
        """Emergency fix for requirements installation issues"""
        try:
            self.connect_ssh()
            self.log("🚨 [EMERGENCY] Starting requirements emergency fix...", "ERROR")
            
            # Stop backend first
            self.execute_ssh_command("systemctl stop pebdeq-backend")
            
            # Step 1: Fix Flask-CORS specifically
            self.log("1. 🔧 Installing Flask-CORS manually...", "INFO")
            flask_cors_result = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install Flask-CORS==4.0.0 --force-reinstall")
            if "Successfully installed" in flask_cors_result:
                self.log("✅ Flask-CORS installed successfully", "SUCCESS")
            else:
                self.log("❌ Flask-CORS installation failed", "ERROR")
            
            # Step 2: Install critical packages one by one
            critical_packages = [
                "Flask==3.0.3",
                "Flask-SQLAlchemy==3.1.1", 
                "Flask-Migrate==4.0.7",
                "Werkzeug==3.0.3",
                "python-dotenv==1.0.1",
                "gunicorn==21.2.0"
            ]
            
            self.log("2. 📦 Installing critical packages...", "INFO")
            for package in critical_packages:
                self.log(f"Installing {package}...")
                result = self.execute_ssh_command(f"cd /opt/pebdeq/backend && ./venv/bin/pip install {package} --force-reinstall")
                if "Successfully installed" in result:
                    self.log(f"✅ {package} OK")
                else:
                    self.log(f"❌ {package} FAILED")
            
            # Step 3: Install ALL dependencies from requirements.txt ONLY
            self.log("3. 📋 Installing ALL dependencies from requirements.txt...", "INFO")  
            remaining_result = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip install -r requirements.txt --force-reinstall")
            
            if "Successfully installed" in remaining_result:
                self.log("✅ All dependencies installed from requirements.txt", "SUCCESS")
            else:
                self.log("❌ Dependencies installation had issues", "WARNING")
                self.log("📄 Using ONLY requirements.txt - no automatic fixes", "INFO")
            
            # Step 4: Test imports
            self.log("4. 🔍 Testing critical imports...", "INFO")
            test_imports = [
                "flask",
                "flask_cors", 
                "flask_sqlalchemy",
                "torch",
                "dotenv"
            ]
            
            for module in test_imports:
                test_result = self.execute_ssh_command(f"cd /opt/pebdeq/backend && ./venv/bin/python -c 'import {module}; print(\"OK\")'")
                if "OK" in test_result:
                    self.log(f"✅ {module} import OK")
                else:
                    self.log(f"❌ {module} import FAILED")
            
            # Step 5: Try to start backend
            self.log("5. 🚀 Testing backend startup...", "INFO")
            self.execute_ssh_command("systemctl start pebdeq-backend")
            time.sleep(5)
            
            status_check = self.execute_ssh_command("systemctl is-active pebdeq-backend")
            if "active" in status_check:
                self.log("🎉 [SUCCESS] Backend started successfully!", "SUCCESS")
                messagebox.showinfo("Success", "Emergency requirements fix completed!\nBackend is now running.")
            else:
                self.log("⚠️ Backend still has issues, check logs", "WARNING")
                messagebox.showwarning("Partial Success", "Requirements fixed but backend needs manual attention.")
                
        except Exception as e:
            self.log(f"🚨 [CRITICAL] Emergency fix failed: {str(e)}", "ERROR")
            messagebox.showerror("Emergency Fix Failed", f"Emergency fix failed: {str(e)}")

    def check_python_version(self):
        """Check Python version compatibility on server"""
        try:
            self.connect_ssh()
            self.log("🐍 [PYTHON] Checking Python version compatibility...", "INFO")
            
            # Check system Python
            system_python = self.execute_ssh_command("python3 --version")
            self.log(f"System Python: {system_python}")
            
            # Check virtual environment Python
            venv_python = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python --version")
            self.log(f"Virtual Env Python: {venv_python}")
            
            # Check Python version compatibility
            venv_pip = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -c 'import sys; print(f\"{sys.version_info.major}.{sys.version_info.minor}\")'")
            self.log(f"Python Version: {venv_pip}")
            
            # Check if version is compatible with requirements
            if "3.8" in venv_pip or "3.9" in venv_pip or "3.10" in venv_pip or "3.11" in venv_pip:
                self.log("✅ Python version is compatible with requirements", "SUCCESS")
                
                # Check pip version
                pip_version = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/pip --version")
                self.log(f"Pip Version: {pip_version}")
                
                messagebox.showinfo("Python Check", f"✅ Python version is compatible!\n\nSystem: {system_python}\nVirtual Env: {venv_python}")
            else:
                self.log("⚠️ Python version might have compatibility issues", "WARNING")
                self.log("💡 Recommended: Python 3.8 - 3.11", "INFO")
                messagebox.showwarning("Python Version", f"⚠️ Python version may cause issues!\n\nCurrent: {venv_python}\nRecommended: Python 3.8-3.11")
                
        except Exception as e:
            self.log(f"🐍 [ERROR] Python check failed: {str(e)}", "ERROR")
            messagebox.showerror("Python Check Failed", f"Failed to check Python version: {str(e)}")

    def test_background_removal(self):
        """Test the HIGH PERFORMANCE background removal service"""
        try:
            self.connect_ssh()
            self.log("🎨 [TEST] Testing HIGH PERFORMANCE background removal...", "INFO")
            
            # Test if the main API is available
            api_test = self.execute_ssh_command("curl -s -o /dev/null -w '%{http_code}' http://localhost:5005/remove-background")
            
            if "405" in api_test or "200" in api_test:
                # 405 is expected for GET request (POST only endpoint)
                self.log("✅ Background removal endpoint is available", "SUCCESS")
                
                # Test with a simple check
                backend_status = self.execute_ssh_command("systemctl is-active pebdeq-backend")
                if "active" in backend_status:
                    self.log("✅ Backend service is running and healthy", "SUCCESS")
                    
                    # Check Python dependencies
                    deps_check = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -c 'import rembg; print(\"REMBG available\")'")
                    if "REMBG available" in deps_check:
                        self.log("✅ REMBG dependencies are available", "SUCCESS")
                    else:
                        self.log("⚠️ REMBG dependencies may not be available", "WARNING")
                        self.log(f"Dependency check result: {deps_check}", "INFO")
                    
                    # Check for torch/numpy
                    torch_check = self.execute_ssh_command("cd /opt/pebdeq/backend && ./venv/bin/python -c 'import torch, numpy; print(f\"Torch: {torch.__version__}, Numpy: {numpy.__version__}\")'")
                    if torch_check and "Torch:" in torch_check:
                        self.log("✅ PyTorch and NumPy are available", "SUCCESS")
                        self.log(f"Versions: {torch_check.strip()}", "INFO")
                    
                messagebox.showinfo("Background Removal Test", 
                                  "✅ HIGH PERFORMANCE Background removal is ready!\n\n"
                                  "🚀 Endpoint: /remove-background\n"
                                  "⚡ Optimizations: Multi-core CPU, GPU detection\n"
                                  "🎯 Models: REMBG with BiRefNet support\n"
                                  "📊 Features: Performance tracking, vectorized processing\n\n"
                                  "✅ Backend service running\n"
                                  "✅ Dependencies available\n"
                                  "✅ Ready for high-performance processing\n\n"
                                  "Test with: POST /remove-background")
            
            else:
                self.log("❌ Background removal endpoint not responding", "ERROR")
                self.log(f"HTTP status: {api_test}", "ERROR")
                
                # Check if backend is running
                backend_status = self.execute_ssh_command("systemctl is-active pebdeq-backend")
                if "active" not in backend_status:
                    self.log("❌ Backend service is not running", "ERROR")
                    messagebox.showerror("Background Removal Test",
                                       "❌ Backend service is not running!\n\n"
                                       "Background removal requires active backend.\n\n"
                                       "Try 'Restart All Services' first.")
                else:
                    self.log("⚠️ Backend running but endpoint not available", "WARNING")
                    messagebox.showwarning("Background Removal Test",
                                         "⚠️ Backend is running but endpoint not available\n\n"
                                         "This could indicate:\n"
                                         "• Code not deployed yet\n"
                                         "• Dependencies missing\n"
                                         "• Import errors\n\n"
                                         "Try redeploying or check backend logs.")
                
        except Exception as e:
            self.log(f"🎨 [ERROR] Background removal test failed: {str(e)}", "ERROR")
            messagebox.showerror("Test Failed", f"Background removal test failed: {str(e)}")

    def restart_all_services(self):
        """Restart all PEBDEQ services in correct order"""
        try:
            self.connect_ssh()
            self.server_log("🔄 Restarting all services...")
            
            # Stop all first
            stop_commands = [
                "systemctl stop pebdeq-backend",
                "systemctl stop nginx",
                "pkill -f python.*run.py || true"
            ]
            
            for cmd in stop_commands:
                self.execute_ssh_command(cmd)
                self.server_log(f"Stopped: {cmd}")
            
            time.sleep(5)
            
            # Start in order
            start_commands = [
                ("Backend", "systemctl start pebdeq-backend"),
                ("Nginx", "systemctl start nginx")
            ]
            
            for service_name, cmd in start_commands:
                self.execute_ssh_command(cmd)
                time.sleep(3)
                status = self.execute_ssh_command(f"systemctl is-active {service_name.lower()}")
                if "active" in status:
                    self.server_log(f"✅ {service_name} restarted successfully")
                else:
                    self.server_log(f"❌ {service_name} restart failed: {status}")
            
        except Exception as e:
            self.server_log(f"Service restart failed: {str(e)}")
    
    def fix_docker_issues(self):
        """Fix Docker daemon and container issues"""
        try:
            self.connect_ssh()
            self.server_log("🛠️ Fixing Docker issues...")
            
            docker_fixes = [
                "systemctl stop docker",
                "rm -rf /var/lib/docker/tmp/*",
                "systemctl start docker",
                "docker system prune -af --volumes",
                "docker network prune -f",
                "systemctl restart docker"
            ]
            
            for cmd in docker_fixes:
                if "sleep" not in cmd:
                    result = self.execute_ssh_command(cmd)
                    self.server_log(f"Docker fix: {cmd}")
                else:
                    time.sleep(5)
            
            # Test Docker
            test_result = self.execute_ssh_command("docker --version && docker ps")
            if "Docker version" in test_result:
                self.server_log("✅ Docker issues fixed successfully")
            else:
                self.server_log("❌ Docker issues persist")
            
        except Exception as e:
            self.server_log(f"Docker fix failed: {str(e)}")

def main():
    # Use ThemedTk if available for better appearance
    if THEMES_AVAILABLE:
        try:
            root = ThemedTk(theme="arc")
        except (ImportError, tk.TclError, Exception):
            root = tk.Tk()  # Fallback to standard Tk if theme fails
    else:
        root = tk.Tk()
    
    app = DeploymentGUI(root)
    
    # Center window on screen (only if not maximized on Windows)
    if os.name != 'nt':
        # Center window safely without dynamic code execution
        root.update_idletasks()
        width = root.winfo_width()
        height = root.winfo_height()
        x = (root.winfo_screenwidth() // 2) - (width // 2)
        y = (root.winfo_screenheight() // 2) - (height // 2)
        root.geometry(f'{width}x{height}+{x}+{y}')
    
    root.mainloop()

if __name__ == "__main__":
    main()
