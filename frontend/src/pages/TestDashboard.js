import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TestDashboard.css';

const TestDashboard = () => {
    const [tests, setTests] = useState([]);
    const [testResults, setTestResults] = useState({});
    const [testStatus, setTestStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [runningTests, setRunningTests] = useState(new Set());
    const [expandedTests, setExpandedTests] = useState(new Set());
    const [selectedCategoryInfo, setSelectedCategoryInfo] = useState(null);
    const [showCodeQualityModal, setShowCodeQualityModal] = useState(false);
    const [activeTab, setActiveTab] = useState('api-tests');
    
    // Code Quality specific state
    const [codeQualityFiles, setCodeQualityFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileStats, setFileStats] = useState({});
    const [selectionOptions, setSelectionOptions] = useState([]);
    const [codeQualityStatus, setCodeQualityStatus] = useState('ready');
    const [codeQualityResults, setCodeQualityResults] = useState(null);
    const [showBackupApproval, setShowBackupApproval] = useState(false);
    const [backupHistory, setBackupHistory] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    
    // New state for individual file test results and status
    const [fileTestResults, setFileTestResults] = useState({});
    const [fileTestStatus, setFileTestStatus] = useState({});
    const [selectedFileReport, setSelectedFileReport] = useState(null);
    const [showFileReportModal, setShowFileReportModal] = useState(false);
    const [showBackupHistoryModal, setShowBackupHistoryModal] = useState(false);
    
    // New state for changed files tracking
    const [changedFiles, setChangedFiles] = useState([]);
  const [selectedChangedFileIndexes, setSelectedChangedFileIndexes] = useState([]);
    const [showChangedFilesModal, setShowChangedFilesModal] = useState(false);
    const [loadingChangedFiles, setLoadingChangedFiles] = useState(false);
    
    // Manual backup state
    const [showManualBackupModal, setShowManualBackupModal] = useState(false);
    const [manualBackupLoading, setManualBackupLoading] = useState(false);
    const [backupDescription, setBackupDescription] = useState('');
    
    // Bulk operations state
    const [selectedBackups, setSelectedBackups] = useState([]);
    const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
    
    // Cleanup state
    const [cleanupStats, setCleanupStats] = useState(null);
    const [cleanupLoading, setCleanupLoading] = useState(false);
    const [showCleanupModal, setShowCleanupModal] = useState(false);
    
    // Debug state
    const [debugOutput, setDebugOutput] = useState('');
    const [showDebugModal, setShowDebugModal] = useState(false);
    const [debugLoading, setDebugLoading] = useState(false);
    
    const intervalRef = useRef(null);

    // Get authentication headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Fetch available tests
    const fetchTests = async () => {
        try {
            const response = await axios.get('/api/admin/tests', {
                headers: getAuthHeaders()
            });
            setTests(response.data.test_suites);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching tests:', err);
            setError('Failed to load tests');
            setLoading(false);
        }
    };

    // Fetch test status
    const fetchTestStatus = async () => {
        try {
            const response = await axios.get('/api/admin/tests/status', {
                headers: getAuthHeaders()
            });
            setTestStatus(response.data.test_status);
            
            // Sync runningTests with actual backend status
            const actualRunningTests = Object.entries(response.data.test_status)
                .filter(([testId, status]) => status === 'running')
                .map(([testId, status]) => testId);
            
            setRunningTests(new Set(actualRunningTests));
        } catch (err) {
            console.error('Error fetching test status:', err);
        }
    };

    // Run a specific test
    const runTest = async (testId) => {
        try {
            setRunningTests(prev => new Set([...prev, testId]));
            
            const response = await axios.post(`/api/admin/tests/${testId}/run`, {}, {
                headers: getAuthHeaders()
            });
            
            if (response.data.status === 'running') {
                // Start polling for results
                startPolling();
            }
        } catch (err) {
            console.error('Error running test:', err);
            setRunningTests(prev => {
                const newSet = new Set(prev);
                newSet.delete(testId);
                return newSet;
            });
            alert('Failed to start test: ' + (err.response?.data?.error || err.message));
        }
    };

    // Run all tests
    const runAllTests = async () => {
        try {
            const response = await axios.post('/api/admin/tests/all/run', {}, {
                headers: getAuthHeaders()
            });
            
            response.data.running_tests.forEach(testId => {
                setRunningTests(prev => new Set([...prev, testId]));
            });
            
            startPolling();
        } catch (err) {
            console.error('Error running all tests:', err);
            alert('Failed to start tests: ' + (err.response?.data?.error || err.message));
        }
    };

    // Get test results
    const fetchTestResults = async (testId) => {
        try {
            const response = await axios.get(`/api/admin/tests/${testId}/results`, {
                headers: getAuthHeaders()
            });
            
            setTestResults(prev => ({
                ...prev,
                [testId]: response.data.results
            }));
            
            // Remove from running tests if completed
            if (response.data.status !== 'running') {
                setRunningTests(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(testId);
                    return newSet;
                });
            }
        } catch (err) {
            // Handle different response codes appropriately
            if (err.response?.status === 202) {
                // Test is running, results not yet available - this is normal
                return;
            } else if (err.response?.status === 404) {
                // Test hasn't been run yet - this is normal, just ignore
                return;
            } else {
                // Actual error occurred
                console.error('Error fetching test results:', err);
            }
        }
    };

    // Start polling for updates - ONLY when tests are running
    const startPolling = () => {
        // Check if any tests are actually running
        const hasRunningTests = Object.values(testStatus).some(status => status === 'running');
        
        if (!hasRunningTests) {
            console.log('🛑 No running tests - polling stopped');
            stopPolling();
            return;
        }
        
        if (intervalRef.current) return;
        
        console.log('🔄 Starting test status polling (2s interval)');
        intervalRef.current = setInterval(() => {
            // Check if we still have running tests
            const stillRunning = Object.values(testStatus).some(status => status === 'running');
            
            if (!stillRunning) {
                console.log('🛑 No more running tests - stopping polling');
                stopPolling();
                return;
            }
            
            fetchTestStatus();
            // Only fetch results for tests that are actually running
            runningTests.forEach(testId => {
                if (testStatus[testId] === 'running') {
                    fetchTestResults(testId);
                }
            });
        }, 2000);
    };

    // Stop polling
    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Toggle test details
    const toggleTestDetails = (testId) => {
        setExpandedTests(prev => {
            const newSet = new Set(prev);
            if (newSet.has(testId)) {
                newSet.delete(testId);
            } else {
                newSet.add(testId);
                // Fetch results if not already loaded
                if (!testResults[testId]) {
                    fetchTestResults(testId);
                }
            }
            return newSet;
        });
    };

    // Modal functions for category information
    const showCategoryInfo = (category) => {
        setSelectedCategoryInfo(category);
    };

    const closeCategoryInfo = () => {
        setSelectedCategoryInfo(null);
    };

    // Format duration
    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    // Parse functions for raw output
    const parseFileListOutput = (output) => {
        const lines = output.trim().split('\n');
        const files = [];
        const stats = {};
        let currentSection = null;
        let fileCounter = 1;

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Detect section headers: [PYTHON], [JAVASCRIPT], [CSS]
            if (trimmedLine === '[PYTHON]') {
                currentSection = 'python';
                continue;
            } else if (trimmedLine === '[JAVASCRIPT]') {
                currentSection = 'javascript';
                continue;
            } else if (trimmedLine === '[CSS]') {
                currentSection = 'css';
                continue;
            }
            
            // Parse numbered file entries: "   1. backend\backup_current_settings.py (21.4KB)"
            if (currentSection && trimmedLine.match(/^\d+\.\s+.*\([^)]+\)$/)) {
                // Extract file info from numbered line
                const match = trimmedLine.match(/^\d+\.\s+(.+)\s+\(([^)]+)\)$/);
                if (match) {
                    const filePath = match[1].trim();
                    const size = match[2];
                    
                    files.push({
                        id: fileCounter,
                        path: filePath,
                        size: size,
                        category: currentSection,
                        type: currentSection
                    });
                    
                    fileCounter++;
                }
            }
            
            // Parse statistics lines
            if (trimmedLine.includes('Dosya sayısı:') && currentSection) {
                const count = trimmedLine.split(':')[1]?.trim();
                if (count) {
                    stats[`${currentSection}_files`] = parseInt(count);
                }
            } else if (trimmedLine.includes('Toplam boyut:') && currentSection) {
                const size = trimmedLine.split(':')[1]?.trim();
                if (size) {
                    stats[`${currentSection}_size`] = size;
                }
            } else if (trimmedLine.includes('Toplam dosya:')) {
                const total = trimmedLine.split(':')[1]?.trim();
                if (total) {
                    stats.total_files = total;
                }
            } else if (trimmedLine.includes('Toplam boyut:') && trimmedLine.includes('KB') && !currentSection) {
                // This is the general summary total size
                const size = trimmedLine.split(':')[1]?.trim();
                if (size) {
                    stats.total_size = size;
                }
            }
        }

        // Set default stats if not found
        if (!stats.total_files) {
            stats.total_files = files.length.toString();
        }
        if (!stats.total_size) {
            stats.total_size = 'Unknown';
        }

        console.log(`🔍 PARSED FILES: ${files.length} files found`);
        console.log(`🔍 PARSED STATS:`, stats);
        console.log(`🔍 FIRST 3 FILES:`, files.slice(0, 3));

        return { files, stats };
    };

    const parseBackupHistory = (output) => {
        const lines = output.trim().split('\n');
        const backups = [];
        let currentBackup = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Look for numbered backup entries: " 1. ID: rollback_20250715_204429"
            if (trimmedLine && /^\d+\.\s+ID:/.test(trimmedLine)) {
                // Save previous backup if exists
                if (currentBackup) {
                    backups.push(currentBackup);
                }
                
                // Start new backup
                const backupId = trimmedLine.split('ID:')[1].trim();
                currentBackup = {
                    id: backupId,
                    date: '',
                    time: '',
                    file_count: '',
                    description: ''
                };
            } else if (currentBackup && trimmedLine.includes('Tarih:')) {
                const fullDate = trimmedLine.split('Tarih:')[1].trim();
                // Parse date format: 20250716_013019 to readable format
                if (fullDate.includes('_')) {
                    const [datePart, timePart] = fullDate.split('_');
                    const year = datePart.substring(0, 4);
                    const month = datePart.substring(4, 6);
                    const day = datePart.substring(6, 8);
                    const hour = timePart.substring(0, 2);
                    const minute = timePart.substring(2, 4);
                    const second = timePart.substring(4, 6);
                    
                    currentBackup.date = `${day}/${month}/${year}`;
                    currentBackup.time = `${hour}:${minute}:${second}`;
                } else {
                    currentBackup.date = fullDate;
                    currentBackup.time = '';
                }
            } else if (currentBackup && trimmedLine.includes('Dosya sayısı:')) {
                currentBackup.file_count = trimmedLine.split('Dosya sayısı:')[1].trim();
            } else if (currentBackup && trimmedLine.includes('Açıklama:')) {
                currentBackup.description = trimmedLine.split('Açıklama:')[1].trim();
            }
        }

        // Add the last backup if exists
        if (currentBackup) {
            backups.push(currentBackup);
        }

        return backups;
    };

    // Code Quality Functions
    const fetchCodeQualityFiles = async () => {
        try {
            setLoadingFiles(true);
            const response = await axios.get('/api/admin/tests/code-quality/files', {
                headers: getAuthHeaders()
            });
            
            if (response.data.success && response.data.raw_output) {
                const parsed = parseFileListOutput(response.data.raw_output);
                setCodeQualityFiles(parsed.files || []);
                setFileStats(parsed.stats || {});
                setSelectionOptions(response.data.selection_options || []);
            } else {
                setCodeQualityFiles([]);
                setFileStats({});
                setSelectionOptions([]);
            }
        } catch (err) {
            console.error('Error fetching code quality files:', err);
            alert('Failed to load project files: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleFileSelection = (fileId) => {
        setSelectedFiles(prev => {
            if (prev.includes(fileId)) {
                return prev.filter(id => id !== fileId);
            } else {
                return [...prev, fileId];
            }
        });
    };

    const handleQuickSelection = (optionId) => {
        if (optionId === 0) {
            // All files
            setSelectedFiles(codeQualityFiles.map(f => f.id));
        } else if (optionId === 99) {
            // Critical files (first 8)
            setSelectedFiles(codeQualityFiles.slice(0, 8).map(f => f.id));
        } else if (optionId === 98) {
            // Large files (>50KB)
            const largeFiles = codeQualityFiles.filter(f => {
                const sizeValue = parseFloat(f.size);
                return sizeValue > 50;
            });
            setSelectedFiles(largeFiles.map(f => f.id));
        } else if (optionId === 97) {
            // Backend only
            const backendFiles = codeQualityFiles.filter(f => f.type === 'python');
            setSelectedFiles(backendFiles.map(f => f.id));
        } else if (optionId === 96) {
            // Frontend only
            const frontendFiles = codeQualityFiles.filter(f => f.type === 'javascript');
            setSelectedFiles(frontendFiles.map(f => f.id));
        } else if (optionId === 94) {
            // CSS only
            const cssFiles = codeQualityFiles.filter(f => f.type === 'css');
            setSelectedFiles(cssFiles.map(f => f.id));
        } else if (optionId === 95) {
            // Recommended
            const recommendedFiles = codeQualityFiles.slice(0, 12);
            setSelectedFiles(recommendedFiles.map(f => f.id));
        }
    };

    const runCodeQualityTests = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select at least one file to test');
            return;
        }

        try {
            setCodeQualityStatus('running');
            setCodeQualityResults(null);
            
            // Reset all selected files to 'waiting' status initially
            const initialStatus = {};
            selectedFiles.forEach(fileId => {
                initialStatus[fileId] = 'waiting';
            });
            setFileTestStatus(prev => ({ ...prev, ...initialStatus }));
            
            // Test files one by one in sequence
            await testFilesSequentially(selectedFiles);
            
        } catch (err) {
            console.error('Error running code quality tests:', err);
            setCodeQualityStatus('error');
            alert('Failed to start tests: ' + (err.response?.data?.error || err.message));
        }
    };

    const testFilesSequentially = async (fileIds) => {
        let allTestsPassed = true;
        let testedCount = 0;
        
        for (const fileId of fileIds) {
            try {
                // Mark current file as running
                setFileTestStatus(prev => ({ 
                    ...prev, 
                    [fileId]: 'running' 
                }));
                
                console.log(`🧪 Testing file ID: ${fileId}`);
                
                // Test single file
                const response = await axios.post('/api/admin/tests/code-quality/run', {
                    selected_files: [fileId]  // Single file array
                }, {
                    headers: getAuthHeaders()
                });

                // Poll for this specific file's results
                const fileResult = await pollSingleFileResults();
                
                if (fileResult) {
                    // Always store results for both success and failure
                    setFileTestResults(prev => ({ 
                        ...prev, 
                        [fileId]: {
                            success: fileResult.success,
                            timestamp: fileResult.timestamp,
                            detailed_results: fileResult.detailed_results,
                            stdout: fileResult.stdout,
                            stderr: fileResult.stderr,
                            tested_file_id: fileId,
                            exit_code: fileResult.exit_code
                        }
                    }));

                    if (fileResult.success) {
                        setFileTestStatus(prev => ({ 
                            ...prev, 
                            [fileId]: 'completed' 
                        }));
                    } else {
                        setFileTestStatus(prev => ({ 
                            ...prev, 
                            [fileId]: 'failed' 
                        }));
                        allTestsPassed = false;
                    }
                } else {
                    // Mark file as error (timeout or no response)
                    setFileTestStatus(prev => ({ 
                        ...prev, 
                        [fileId]: 'error' 
                    }));
                    
                    // Create error result for display
                    setFileTestResults(prev => ({ 
                        ...prev, 
                        [fileId]: {
                            success: false,
                            timestamp: new Date().toISOString(),
                            detailed_results: null,
                            stdout: 'Test timeout or no response received',
                            stderr: 'Test failed to complete within expected time',
                            tested_file_id: fileId,
                            exit_code: -1,
                            error_type: 'timeout'
                        }
                    }));
                    
                    allTestsPassed = false;
                }
                
                testedCount++;
                
                // Small delay between tests to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (err) {
                console.error(`Error testing file ${fileId}:`, err);
                setFileTestStatus(prev => ({ 
                    ...prev, 
                    [fileId]: 'error' 
                }));
                
                // Create error result for API failures
                setFileTestResults(prev => ({ 
                    ...prev, 
                    [fileId]: {
                        success: false,
                        timestamp: new Date().toISOString(),
                        detailed_results: null,
                        stdout: 'API request failed',
                        stderr: err.response?.data?.error || err.message,
                        tested_file_id: fileId,
                        exit_code: -1,
                        error_type: 'api_error'
                    }
                }));
                
                allTestsPassed = false;
            }
        }
        
        // Count passed vs failed tests
        const passedCount = Object.values(fileTestResults).filter(result => 
            result && result.success
        ).length;
        
        // Update overall status
        setCodeQualityStatus(allTestsPassed ? 'completed' : 'failed');
        
        // Show backup approval for different scenarios
        if (testedCount === fileIds.length) {
            if (allTestsPassed) {
                // All tests passed - standard backup
                setShowBackupApproval(true);
            } else if (passedCount > 0) {
                // Some tests passed - offer selective backup
                setShowBackupApproval(true);
            }
            // If no tests passed (passedCount === 0), don't show backup option
        }
        
        console.log(`✅ Sequential testing completed. ${testedCount}/${fileIds.length} files tested`);
    };

    const pollSingleFileResults = async () => {
        const maxAttempts = 30; // Max 90 seconds (30 * 3 seconds)
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                const response = await axios.get('/api/admin/tests/code-quality/results', {
                    headers: getAuthHeaders()
                });
                
                if (response.data.status === 'completed' || response.data.status === 'failed') {
                    return response.data.results;
                } else if (response.data.status === 'running') {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    attempts++;
                } else {
                    break;
                }
            } catch (err) {
                if (err.response?.status === 202) {
                    // Still running, continue polling
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    attempts++;
                } else {
                    console.error('Error polling single file results:', err);
                    break;
                }
            }
        }
        
        return null; // Timeout or error
    };

    const approveBackup = async () => {
        try {
            // Prepare tested files info for backup naming
            const testedFilesInfo = selectedFiles.map(fileId => {
                const file = codeQualityFiles.find(f => f.id === fileId);
                return {
                    id: fileId,
                    name: file ? file.path.split(/[\\/]/).pop() : `file_${fileId}`, // Get filename only
                    path: file ? file.path : '',
                    size: file ? file.size : ''
                };
            });
            
            const response = await axios.post('/api/admin/tests/code-quality/backup/approve', {
                tested_files_info: testedFilesInfo
            }, {
                headers: getAuthHeaders()
            });
            
            if (response.data.success) {
                alert(`✅ Backup created successfully!\n📋 ${response.data.description || 'Manual backup completed'}`);
                setShowBackupApproval(false);
                fetchBackupHistory();
            } else {
                alert('Backup creation failed: ' + response.data.message);
            }
        } catch (err) {
            console.error('Error creating backup:', err);
            alert('Failed to create backup: ' + (err.response?.data?.error || err.message));
        }
    };

    const copyReportToClipboard = async (selectedFileReport) => {
        try {
            const report = generateDetailedReport(selectedFileReport);
            await navigator.clipboard.writeText(report);
            alert('📋 Report copied to clipboard! You can now paste it to Cursor AI for assistance.');
        } catch (err) {
            console.error('Failed to copy report:', err);
            alert('Failed to copy report to clipboard. Please try again.');
        }
    };

    const generateDetailedReport = (selectedFileReport) => {
        const file = selectedFileReport.file;
        const results = selectedFileReport.results;
        
        let report = `🧪 CODE QUALITY TEST REPORT\n`;
        report += `==============================\n\n`;
        report += `📁 File: ${file.path}\n`;
        report += `📊 Size: ${file.size}\n`;
        report += `📝 Type: ${file.category}\n`;
        report += `⏰ Tested: ${new Date(results.timestamp).toLocaleString()}\n`;
        report += `✅ Status: ${results.success ? 'PASSED' : 'FAILED'}\n`;
        
        if (results.exit_code !== undefined) {
            report += `🔢 Exit Code: ${results.exit_code}\n`;
        }
        
        report += `\n`;
        
        if (!results.success) {
            report += `❌ ERROR DETAILS:\n`;
            report += `================\n`;
            
            if (results.error_type) {
                report += `Error Type: ${results.error_type}\n`;
            }
            
            if (results.stderr) {
                report += `Error Output:\n${results.stderr}\n`;
            }
            
            report += `\n`;
        }
        
        if (results.detailed_results?.categories) {
            report += `📋 TEST CATEGORIES:\n`;
            report += `==================\n`;
            
            results.detailed_results.categories.forEach((category, index) => {
                report += `${index + 1}. ${category.name}: ${category.status}\n`;
                if (category.issues_count > 0) {
                    report += `   Issues: ${category.issues_count}\n`;
                }
                if (category.details) {
                    report += `   Details: ${category.details}\n`;
                }
                report += `\n`;
            });
        }
        
        if (results.stdout) {
            report += `📄 FULL OUTPUT:\n`;
            report += `===============\n`;
            report += `${results.stdout}\n`;
        }
        
        report += `\n🤖 CURSOR AI PROMPT:\n`;
        report += `===================\n`;
        report += `Please analyze this test report and help me fix the issues in ${file.path}. `;
        report += `Focus on the failed tests and provide specific code fixes.`;
        
        return report;
    };

    const fetchBackupHistory = async () => {
        try {
            const response = await axios.get('/api/admin/tests/code-quality/backup/history', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            console.log('Backup history response:', response.data);
            
            if (response.data.success) {
                // NEW FORMAT: Use the structured backup data directly
                const backups = response.data.backups || [];
                console.log(`✅ Found ${backups.length} backups in new format`);
                
                // Transform to match expected format for frontend
                const formattedBackups = backups.map(backup => ({
                    id: backup.name,
                    name: backup.name,
                    type: backup.type,
                    path: backup.path,
                    created: new Date(backup.created * 1000).toLocaleString(),
                    size: (backup.size / 1024 / 1024).toFixed(2) + ' MB',
                    description: backup.description || '',
                    file_count: backup.file_count || 0,
                    date: new Date(backup.created * 1000).toLocaleDateString(),
                    time: new Date(backup.created * 1000).toLocaleTimeString()
                }));
                
                setBackupHistory(formattedBackups);
            } else if (response.data.raw_output) {
                // FALLBACK: Parse old format if available
                console.log('⚠️ Using fallback parsing for old format');
                const backups = parseBackupHistory(response.data.raw_output);
                setBackupHistory(backups || []);
            } else {
                console.error('Backup history request failed:', response.data);
                setBackupHistory([]);
            }
        } catch (err) {
            console.error('Error fetching backup history:', err);
            console.error('Response data:', err.response?.data);
            setBackupHistory([]);
            alert('Failed to fetch backup history: ' + (err.response?.data?.error || err.message));
        }
    };

    const rollbackToBackup = async (backupId) => {
        if (!window.confirm(`Are you sure you want to rollback to backup ${backupId}? This will restore code to a previous state.`)) {
            return;
        }

        try {
            const response = await axios.post('/api/admin/tests/code-quality/rollback', {
                backup_id: backupId
            }, {
                headers: getAuthHeaders()
            });
            
            if (response.data.success) {
                alert('Rollback completed successfully!');
                fetchBackupHistory();
                setShowBackupHistoryModal(false);
            } else {
                alert('Rollback failed: ' + response.data.message);
            }
        } catch (err) {
            console.error('Error during rollback:', err);
            alert('Failed to rollback: ' + (err.response?.data?.error || err.message));
        }
    };

    const deleteBackup = async (backupId) => {
        try {
            const response = await axios.delete(`/api/admin/tests/code-quality/backup/${backupId}`, {
                headers: getAuthHeaders()
            });
            
            if (response.data.success) {
                alert('Backup deleted successfully!');
                fetchBackupHistory();
            } else {
                alert('Delete failed: ' + response.data.message);
            }
        } catch (err) {
            console.error('Error deleting backup:', err);
            alert('Failed to delete backup: ' + (err.response?.data?.error || err.message));
        }
    };

    // Create manual backup for selected files
    const createManualBackup = async () => {
        try {
            if (selectedFiles.length === 0) {
                alert('Please select at least one file to backup.');
                return;
            }

            setManualBackupLoading(true);
            
            const response = await axios.post('/api/admin/tests/code-quality/backup/manual', {
                selected_files: selectedFiles,
                description: backupDescription || 'Manual backup'
            }, {
                headers: getAuthHeaders()
            });
            
            if (response.data.success) {
                alert('Manual backup created successfully!');
                setShowManualBackupModal(false);
                setBackupDescription('');
                // Refresh backup history
                fetchBackupHistory();
            } else {
                alert('Manual backup failed: ' + response.data.error);
            }
        } catch (err) {
            console.error('Error creating manual backup:', err);
            alert('Failed to create manual backup: ' + (err.response?.data?.error || err.message));
        } finally {
            setManualBackupLoading(false);
        }
    };

    // Bulk operations for backup history
    const handleBackupSelection = (backupId) => {
        setSelectedBackups(prev => {
            if (prev.includes(backupId)) {
                return prev.filter(id => id !== backupId);
            } else {
                return [...prev, backupId];
            }
        });
    };

    const selectAllBackups = () => {
        setSelectedBackups(backupHistory.map(backup => backup.id));
    };

    const clearAllSelections = () => {
        setSelectedBackups([]);
    };

    const bulkDeleteBackups = async () => {
        if (selectedBackups.length === 0) {
            alert('Please select at least one backup to delete.');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedBackups.length} backup(s)? This action cannot be undone.`
        );

        if (!confirmed) return;

        setBulkOperationLoading(true);
        
        try {
            // Delete each backup sequentially
            for (const backupId of selectedBackups) {
                await axios.delete(`/api/admin/tests/code-quality/backup/${backupId}`, {
                    headers: getAuthHeaders()
                });
            }
            
            alert(`Successfully deleted ${selectedBackups.length} backup(s).`);
            setSelectedBackups([]);
            fetchBackupHistory(); // Refresh the list
        } catch (err) {
            console.error('Error in bulk delete:', err);
            alert('Some backups could not be deleted: ' + (err.response?.data?.error || err.message));
        } finally {
            setBulkOperationLoading(false);
        }
    };

    const bulkRestoreBackup = async () => {
        if (selectedBackups.length === 0) {
            alert('Please select a backup to restore.');
            return;
        }

        

            let confirmMessage;
    if (selectedBackups.length === 1) {
      confirmMessage = `Are you sure you want to restore backup ${selectedBackups[0]}? This will restore code to a previous state.`;
    } else {
      confirmMessage = `Are you sure you want to restore from ${selectedBackups.length} selected backups? The LATEST backup will be restored. This will restore code to a previous state.`;
    }
    
    const confirmed = window.confirm(confirmMessage);
        
        if (!confirmed) return;

        setBulkOperationLoading(true);
        try {
          const response = await axios.post('/api/admin/tests/code-quality/rollback/bulk', {
            backup_ids: selectedBackups
          });

                if (response.data.success) {
        const message = response.data.selected_count > 1 
          ? `Latest backup restored successfully! (${response.data.restored_backup} from ${response.data.selected_count} selected)`
          : 'Backup restored successfully!';
        alert(message);
        setSelectedBackups([]);
        fetchBackupHistory(); // Refresh the list
      } else {
        alert('Restore failed: ' + response.data.error);
      }
        } catch (err) {
          console.error('Error restoring backup:', err);
          alert('Failed to restore backup: ' + (err.response?.data?.error || err.message));
        } finally {
          setBulkOperationLoading(false);
        }
    };

    // Fetch changed files since last backup
    const fetchChangedFiles = async () => {
        try {
            setLoadingChangedFiles(true);
            
            // Clear previous data before fetching new
            setChangedFiles([]);
            setSelectedChangedFileIndexes([]);
            
            // Add cache-busting parameter
            const cacheBuster = Date.now();
            const response = await axios.get(`/api/admin/tests/code-quality/changed-files?t=${cacheBuster}`, {
                headers: {
                    ...getAuthHeaders(),
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (response.data.success) {
                const files = response.data.changed_files || [];
                console.log('🔍 Fetched changed files:', files);
                console.log('🔍 Files count:', files.length);
                
                setChangedFiles(files);
                setSelectedChangedFileIndexes([]); // Clear previous selection
                setShowChangedFilesModal(true);
            } else {
                alert('Failed to get changed files: ' + response.data.error);
            }
        } catch (err) {
            console.error('Error fetching changed files:', err);
            alert('Failed to fetch changed files: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoadingChangedFiles(false);
        }
    };

    // Select changed files for testing
    const selectChangedFilesForTesting = async (selectedChangedFiles) => {
        try {
            console.log('🔍 selectChangedFilesForTesting called with:', selectedChangedFiles);
            console.log('🔍 selectedChangedFiles.length:', selectedChangedFiles.length);
            
            if (selectedChangedFiles.length === 0) {
                console.log('🔍 No files selected for testing.');
                return;
            }

            const filePaths = selectedChangedFiles.map(f => f.path);
            console.log('🔍 Mapped file paths:', filePaths);
            console.log('🔍 First few file objects:', selectedChangedFiles.slice(0, 3));
            console.log('🔍 Valid paths count:', filePaths.filter(p => p && p.trim()).length);
            
            const response = await axios.post('/api/admin/tests/code-quality/changed-files/select', {
                changed_files: filePaths
            }, {
                headers: getAuthHeaders()
            });
            
            console.log('🔍 Backend response:', response.data);
            
            if (response.data.success) {
                const matchedFiles = response.data.matched_files || [];
                const selectedFileIds = response.data.selected_file_ids || [];
                
                console.log('🔍 Matched files from backend:', matchedFiles);
                console.log('🔍 Selected file IDs from backend:', selectedFileIds);
                console.log('🔍 Selected file IDs count:', selectedFileIds.length);
                
                if (selectedFileIds.length === 0) {
                    alert('No matching files found in the project structure.');
                    return;
                }

                // Update selected files
                setSelectedFiles(selectedFileIds);
                
                // Close changed files modal
                setShowChangedFilesModal(false);
                
                // Notify user
                alert(`✅ Selected ${selectedFileIds.length} files for testing:\n${matchedFiles.map(f => f.path).join('\n')}`);
                
                // Optionally start tests immediately
                const autoStart = window.confirm('Would you like to start testing the selected files now?');
                if (autoStart) {
                    runCodeQualityTests();
                }
            } else {
                alert('Failed to select changed files: ' + response.data.error);
            }
        } catch (err) {
            console.error('Error selecting changed files:', err);
            alert('Failed to select changed files: ' + (err.response?.data?.error || err.message));
        }
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'running': return 'status-running';
            case 'completed': return 'status-completed';
            case 'failed': return 'status-failed';
            case 'error': return 'status-error';
            case 'timeout': return 'status-timeout';
            default: return 'status-ready';
        }
    };

    // Cleanup functions
    const fetchCleanupStats = async () => {
        try {
            setCleanupLoading(true);
            const response = await axios.get('/api/admin/tests/cleanup/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCleanupStats(response.data);
        } catch (error) {
            console.error('Error fetching cleanup stats:', error);
            alert('Failed to fetch cleanup statistics');
        } finally {
            setCleanupLoading(false);
        }
    };

    const cleanupReports = async () => {
        if (!window.confirm('Are you sure you want to delete all test report files? This action cannot be undone.')) {
            return;
        }
        
        try {
            setCleanupLoading(true);
            const response = await axios.delete('/api/admin/tests/cleanup/reports', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            alert(`Successfully deleted ${response.data.deleted_count} report files`);
            await fetchCleanupStats();
        } catch (error) {
            console.error('Error cleaning up reports:', error);
            alert('Failed to clean up reports: ' + (error.response?.data?.error || error.message));
        } finally {
            setCleanupLoading(false);
        }
    };

    const cleanupBackups = async () => {
        if (!window.confirm('Are you sure you want to delete all backup files? This action cannot be undone.')) {
            return;
        }
        
        try {
            setCleanupLoading(true);
            const response = await axios.delete('/api/admin/tests/cleanup/backups', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            alert(`Successfully deleted ${response.data.deleted_count} backup items`);
            await fetchCleanupStats();
            await fetchBackupHistory();
        } catch (error) {
            console.error('Error cleaning up backups:', error);
            alert('Failed to clean up backups: ' + (error.response?.data?.error || error.message));
        } finally {
            setCleanupLoading(false);
        }
    };

    const cleanupAll = async () => {
        if (!window.confirm('Are you sure you want to delete ALL test reports and backups? This action cannot be undone.')) {
            return;
        }
        
        try {
            setCleanupLoading(true);
            const response = await axios.delete('/api/admin/tests/cleanup/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            alert(`Successfully deleted ${response.data.total_deleted} items total (${response.data.reports_deleted} reports, ${response.data.backups_deleted} backups)`);
            await fetchCleanupStats();
            await fetchBackupHistory();
        } catch (error) {
            console.error('Error cleaning up all data:', error);
            alert('Failed to clean up all data: ' + (error.response?.data?.error || error.message));
        } finally {
            setCleanupLoading(false);
        }
    };

    const openCleanupModal = async () => {
        setShowCleanupModal(true);
        await fetchCleanupStats();
    };

    // Debug file scanning function
    const debugFileScanning = async () => {
        try {
            setDebugLoading(true);
            setShowDebugModal(true);
            setDebugOutput('🔍 Starting file scanning debug...\n\n');
            
            const response = await axios.get('/api/admin/tests/debug/file-scanning', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.success) {
                setDebugOutput(response.data.output || 'No output received');
                if (response.data.error) {
                    setDebugOutput(prev => prev + '\n\n❌ STDERR:\n' + response.data.error);
                }
            } else {
                setDebugOutput('❌ Debug failed: ' + (response.data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error running debug:', error);
            setDebugOutput('❌ Debug request failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setDebugLoading(false);
        }
    };

    // Get status text
    const getStatusText = (testId) => {
        if (runningTests.has(testId)) return 'running';
        return testStatus[testId] || 'ready';
    };

    // Group tests by category
    const groupedTests = tests.reduce((acc, test) => {
        if (!acc[test.category]) {
            acc[test.category] = [];
        }
        acc[test.category].push(test);
        return acc;
    }, {});

    // PROFESYONEL KALİTE TEST SİSTEMİ - MÜŞTERİ SUNUMU İÇİN %100 BAŞARI ŞART
    const testCategoryInfo = {
        'Authentication Tests': {
            purpose: 'User authentication, authorization, and security validation',
            codeFunction: 'CORE SECURITY MODULE: Manages user identity verification, session control, password encryption, JWT token security, OAuth integration, and prevents unauthorized system access',
            businessCritical: 'System access security - protects all user data and prevents unauthorized operations',
            failureConsequence: 'SECURITY BREACH → Data theft → Legal liability → Business shutdown risk',
            reliability: 100,
            description: 'CRITICAL: Any authentication failure creates security vulnerabilities',
            whatItTests: [
                'User login/logout security mechanisms work perfectly',
                'JWT token generation and validation has zero flaws',
                'Password encryption meets enterprise security standards',
                'Session management prevents all unauthorized access attempts',
                'Google OAuth integration maintains complete security integrity'
            ],
            whenItFails: [
                'CRITICAL: System vulnerable to unauthorized access',
                'CRITICAL: User credentials can be compromised',
                'CRITICAL: Session hijacking becomes possible',
                'CRITICAL: Authentication bypass vulnerabilities exist',
                'CRITICAL: Data breach potential confirmed'
            ],
            codeHealthIndicator: {
                success: 'Authentication system is enterprise-grade secure. Zero security vulnerabilities detected.',
                failed: 'EMERGENCY: SECURITY BREACH DETECTED - System compromised - Immediate action required'
            },
            criticalAreas: [
                'JWT token security implementation (auth.py)',
                'Password hashing and verification algorithms',
                'Session management and security middleware',
                'OAuth integration security protocols'
            ],
            successThreshold: 100
        },
        'Admin API Tests': {
            purpose: 'Administrative control system and privilege management',
            codeFunction: 'ADMIN CONTROL CENTER: Manages system administration, user privileges, site configuration, content management, and operational controls for business management',
            businessCritical: 'Business operations control - enables system management and configuration',
            failureConsequence: 'ADMIN FAILURE → Operations halt → Business disruption → Revenue loss',
            reliability: 100,
            description: 'CRITICAL: Admin system controls all business operations',
            whatItTests: [
                'Admin authentication and privilege verification works flawlessly',
                'Site configuration changes apply correctly and consistently',
                'User management operations execute without any errors',
                'Admin dashboard displays accurate real-time data',
                'Permission controls prevent any unauthorized admin access'
            ],
            whenItFails: [
                'CRITICAL: Admin panel becomes inaccessible - operations stopped',
                'CRITICAL: Site configuration fails - business settings corrupted',
                'CRITICAL: User management broken - customer service impossible',
                'CRITICAL: Data integrity compromised - business decisions affected',
                'CRITICAL: Security breach via admin privilege escalation'
            ],
            codeHealthIndicator: {
                success: 'Admin system is fully operational. All business management functions work perfectly.',
                failed: 'EMERGENCY: ADMIN SYSTEM FAILURE - Business operations compromised'
            },
            criticalAreas: [
                'Admin route security and access control (admin.py)',
                'User role validation and permission systems',
                'Site configuration management functions',
                'Admin dashboard data accuracy and integrity'
            ],
            successThreshold: 100
        },
        'Product Tests': {
            purpose: 'Product catalog and inventory management system',
            codeFunction: 'INVENTORY MANAGEMENT CORE: Controls product catalog, stock tracking, pricing logic, category management, search functionality, and ensures inventory accuracy for sales operations',
            businessCritical: 'Sales foundation - accurate product data drives revenue',
            failureConsequence: 'INVENTORY ERROR → Wrong sales → Customer complaints → Revenue loss',
            reliability: 100,
            description: 'CRITICAL: Product accuracy directly affects sales and customer satisfaction',
            whatItTests: [
                'Product CRUD operations execute flawlessly without data corruption',
                'Stock quantity tracking maintains 100% accuracy at all times',
                'Pricing calculations are mathematically precise and error-free',
                'Category organization works perfectly across all product types',
                'Search and filtering returns accurate results with zero false data'
            ],
            whenItFails: [
                'CRITICAL: Products display incorrect information - customer trust lost',
                'CRITICAL: Stock miscalculation leads to overselling - financial loss',
                'CRITICAL: Pricing errors cause revenue loss or legal issues',
                'CRITICAL: Search dysfunction prevents customers finding products',
                'CRITICAL: Inventory chaos disrupts entire sales operation'
            ],
            codeHealthIndicator: {
                success: 'Product system maintains perfect inventory accuracy. Sales operations are reliable.',
                failed: 'EMERGENCY: PRODUCT SYSTEM CORRUPTED - Sales operations compromised'
            },
            criticalAreas: [
                'Product model validation and data integrity (models.py)',
                'Inventory stock calculation and tracking algorithms',
                'Category relationship management and hierarchy',
                'Product search indexing and filtering logic'
            ],
            successThreshold: 100
        },
        'Order Tests': {
            purpose: 'Order processing and e-commerce transaction management',
            codeFunction: 'REVENUE ENGINE: Manages complete order lifecycle, payment processing, inventory deduction, order tracking, fulfillment coordination, and financial transaction integrity',
            businessCritical: 'Revenue generation - orders convert prospects to paying customers',
            failureConsequence: 'ORDER FAILURE → Revenue loss → Customer loss → Business failure',
            reliability: 100,
            description: 'CRITICAL: Order system is the primary revenue generator',
            whatItTests: [
                'Order creation processes work flawlessly under all conditions',
                'Payment integration handles all transactions with zero errors',
                'Inventory deduction occurs accurately and prevents overselling',
                'Order status tracking provides real-time accurate updates',
                'Financial calculations maintain mathematical precision always'
            ],
            whenItFails: [
                'CRITICAL: Revenue stream interrupted - customers cannot purchase',
                'CRITICAL: Payment failures cause financial discrepancies',
                'CRITICAL: Inventory overselling destroys customer relationships',
                'CRITICAL: Order tracking failures create customer service chaos',
                'CRITICAL: Financial calculation errors affect business accounting'
            ],
            codeHealthIndicator: {
                success: 'Order system generates revenue flawlessly. E-commerce operations are perfect.',
                failed: 'EMERGENCY: REVENUE SYSTEM DOWN - Business operations critically compromised'
            },
            criticalAreas: [
                'Order creation and validation logic (orders.py)',
                'Payment processing and financial integration',
                'Inventory deduction and stock management',
                'Order status workflow and tracking systems'
            ],
            successThreshold: 100
        },
        'Cart Tests': {
            purpose: 'Shopping cart and checkout preparation system',
            codeFunction: 'SALES FUNNEL CORE: Manages shopping cart operations, session persistence, guest/user cart synchronization, checkout preparation, and pre-order data validation',
            businessCritical: 'Sales conversion - cart functionality directly affects purchase completion',
            failureConsequence: 'CART FAILURE → Abandoned sales → Conversion loss → Revenue impact',
            reliability: 100,
            description: 'CRITICAL: Cart abandonment due to technical issues loses immediate sales',
            whatItTests: [
                'Cart operations work perfectly across all user scenarios',
                'Quantity updates maintain accurate pricing and calculations',
                'Guest cart migration preserves all data during user login',
                'Cart calculations provide mathematically accurate totals',
                'Checkout preparation validates all data for successful orders'
            ],
            whenItFails: [
                'CRITICAL: Shopping cart breaks - immediate sales lost',
                'CRITICAL: Cart data loss destroys customer shopping experience',
                'CRITICAL: Pricing errors in cart create customer distrust',
                'CRITICAL: Guest cart loss prevents user conversion',
                'CRITICAL: Checkout failures block revenue generation'
            ],
            codeHealthIndicator: {
                success: 'Shopping cart operates flawlessly. Customer purchase journey is smooth.',
                failed: 'EMERGENCY: CART SYSTEM FAILURE - Sales conversion blocked'
            },
            criticalAreas: [
                'Cart session management and persistence (cart.py)',
                'Guest to user cart migration logic',
                'Cart calculation accuracy and validation',
                'Checkout data preparation and integrity'
            ],
            successThreshold: 100
        },
        'Invoice Tests': {
            purpose: 'Financial documentation and legal compliance system',
            codeFunction: 'FINANCIAL COMPLIANCE ENGINE: Generates legal invoices, creates PDF documents, manages sequential numbering, calculates taxes, maintains financial records for legal and accounting compliance',
            businessCritical: 'Legal compliance - invoices are mandatory legal documents',
            failureConsequence: 'INVOICE ERROR → Tax violation → Legal penalty → Business license risk',
            reliability: 100,
            description: 'CRITICAL: Invoice errors create legal and financial liabilities',
            whatItTests: [
                'Invoice generation creates unique, legally compliant documents',
                'PDF creation produces perfect, printable financial records',
                'Sequential numbering maintains legal audit trail requirements',
                'Tax calculations comply with all legal and accounting standards',
                'Financial data integrity supports accurate business accounting'
            ],
            whenItFails: [
                'CRITICAL: Legal compliance violation - tax authority penalties',
                'CRITICAL: Duplicate invoice numbers break legal requirements',
                'CRITICAL: PDF corruption makes invoices legally invalid',
                'CRITICAL: Tax calculation errors cause legal liability',
                'CRITICAL: Financial record corruption affects business accounting'
            ],
            codeHealthIndicator: {
                success: 'Invoice system maintains perfect legal compliance. Financial records are accurate.',
                failed: 'EMERGENCY: LEGAL COMPLIANCE FAILURE - Tax and legal violations detected'
            },
            criticalAreas: [
                'Invoice number generation and uniqueness (invoice_pdf.py)',
                'PDF generation quality and legal formatting',
                'Tax calculation accuracy and compliance',
                'Financial data integrity and audit trail'
            ],
            successThreshold: 100
        },
        'Upload Tests': {
            purpose: 'File security and content management system',
            codeFunction: 'SECURITY UPLOAD MANAGER: Controls file upload security, validates file types, prevents malicious uploads, manages storage, processes images, and maintains content integrity',
            businessCritical: 'System security - prevents malicious attacks via file uploads',
            failureConsequence: 'UPLOAD VULNERABILITY → System hack → Data breach → Business destruction',
            reliability: 100,
            description: 'CRITICAL: Upload vulnerabilities can compromise entire system',
            whatItTests: [
                'File validation blocks all malicious upload attempts',
                'Security measures prevent system compromise via uploads',
                'Image processing works flawlessly without corruption',
                'File storage maintains perfect organization and access control',
                'Upload validation prevents all security vulnerabilities'
            ],
            whenItFails: [
                'CRITICAL: Malicious file uploads compromise system security',
                'CRITICAL: File validation bypass creates security vulnerabilities',
                'CRITICAL: Image processing failures corrupt content',
                'CRITICAL: Storage vulnerabilities expose sensitive data',
                'CRITICAL: Security bypass enables system infiltration'
            ],
            codeHealthIndicator: {
                success: 'Upload system maintains fortress-level security. All uploads are safe.',
                failed: 'EMERGENCY: UPLOAD SECURITY BREACH - System vulnerable to attack'
            },
            criticalAreas: [
                'File upload validation and security (uploads.py)',
                'Malicious file detection and prevention',
                'Image processing and content validation',
                'Storage security and access control'
            ],
            successThreshold: 100
        },
        'Theme Tests': {
            purpose: 'User interface and visual presentation system',
            codeFunction: 'UI PRESENTATION ENGINE: Manages visual themes, CSS generation, user interface consistency, responsive design, and brand presentation across all devices and browsers',
            businessCritical: 'Brand image - visual presentation affects customer perception',
            failureConsequence: 'UI FAILURE → Poor presentation → Customer distrust → Brand damage',
            reliability: 100,
            description: 'CRITICAL: Poor UI presentation damages professional image',
            whatItTests: [
                'Theme switching works perfectly across all browsers and devices',
                'CSS generation produces flawless visual presentation',
                'User preferences maintain consistent personalization',
                'Responsive design ensures perfect mobile and desktop experience',
                'Theme performance maintains fast loading and smooth interaction'
            ],
            whenItFails: [
                'CRITICAL: Visual presentation breaks - unprofessional appearance',
                'CRITICAL: CSS errors destroy user interface consistency',
                'CRITICAL: Theme failures create poor customer experience',
                'CRITICAL: Responsive design breaks mobile user access',
                'CRITICAL: Performance issues create user frustration'
            ],
            codeHealthIndicator: {
                success: 'Theme system delivers perfect visual presentation. Brand image is professional.',
                failed: 'EMERGENCY: UI SYSTEM FAILURE - Professional presentation compromised'
            },
            criticalAreas: [
                'Theme switching logic and consistency (themes.py)',
                'CSS generation and compilation accuracy',
                'User preference storage and application',
                'Responsive design implementation and testing'
            ],
            successThreshold: 100
        },
        'Cart Tests': {
            purpose: 'Shopping cart and checkout preparation system',
            codeFunction: 'SALES FUNNEL CORE: Manages shopping cart operations, session persistence, guest/user cart synchronization, checkout preparation, and pre-order data validation',
            businessCritical: 'Sales conversion - cart functionality directly affects purchase completion',
            failureConsequence: 'CART FAILURE → Abandoned sales → Conversion loss → Revenue impact',
            reliability: 100,
            description: 'CRITICAL: Cart abandonment due to technical issues loses immediate sales',
            whatItTests: [
                'Cart operations work perfectly across all user scenarios',
                'Quantity updates maintain accurate pricing and calculations',
                'Guest cart migration preserves all data during user login',
                'Cart calculations provide mathematically accurate totals',
                'Checkout preparation validates all data for successful orders'
            ],
            whenItFails: [
                'CRITICAL: Shopping cart breaks - immediate sales lost',
                'CRITICAL: Cart data loss destroys customer shopping experience',
                'CRITICAL: Pricing errors in cart create customer distrust',
                'CRITICAL: Guest cart loss prevents user conversion',
                'CRITICAL: Checkout failures block revenue generation'
            ],
            codeHealthIndicator: {
                success: 'Shopping cart operates flawlessly. Customer purchase journey is smooth.',
                failed: 'EMERGENCY: CART SYSTEM FAILURE - Sales conversion blocked'
            },
            criticalAreas: [
                'Cart session management and persistence (cart.py)',
                'Guest to user cart migration logic',
                'Cart calculation accuracy and validation',
                'Checkout data preparation and integrity'
            ],
            successThreshold: 100
        },
        'Backend API': {
            purpose: 'Server-side application programming interface validation',
            codeFunction: 'API COMMUNICATION HUB: Tests REST endpoints, request/response handling, data validation, authentication, authorization, and ensures reliable server-client communication',
            businessCritical: 'System communication - API failures break frontend-backend connectivity',
            failureConsequence: 'API FAILURE → Communication breakdown → System dysfunction → Service unavailable',
            reliability: 100,
            description: 'CRITICAL: API failures prevent frontend from communicating with backend',
            whatItTests: [
                'All API endpoints respond correctly to requests',
                'Request validation prevents malformed data processing',
                'Response formats match expected JSON structures',
                'Authentication and authorization work across all endpoints',
                'Error handling provides appropriate status codes and messages'
            ],
            whenItFails: [
                'CRITICAL: Frontend cannot communicate with backend',
                'CRITICAL: Data validation fails allowing corrupt data',
                'CRITICAL: Authentication breaks preventing user access',
                'CRITICAL: API errors crash frontend functionality',
                'CRITICAL: System becomes completely unusable'
            ],
            codeHealthIndicator: {
                success: 'Backend API is rock-solid. All communication channels work perfectly.',
                failed: 'EMERGENCY: API COMMUNICATION BROKEN - System connectivity failed'
            },
            criticalAreas: [
                'REST endpoint implementation and routing',
                'Request/response data validation',
                'Authentication and authorization middleware',
                'Error handling and status code management'
            ],
            successThreshold: 100
        },
        'Security Tests': {
            purpose: 'Cybersecurity defense and attack prevention system',
            codeFunction: 'CYBERSECURITY FORTRESS: Implements comprehensive security measures, prevents XSS/SQL injection attacks, validates all inputs, controls access, encrypts data, and maintains defense against cyber threats',
            businessCritical: 'Business survival - security breaches can destroy companies',
            failureConsequence: 'SECURITY BREACH → Data theft → Legal lawsuit → Business bankruptcy',
            reliability: 100,
            description: 'CRITICAL: Security failures can destroy the entire business',
            whatItTests: [
                'Input validation blocks all malicious data injection attempts',
                'SQL injection prevention maintains database security absolutely',
                'XSS protection prevents all cross-site scripting attacks',
                'CSRF protection blocks all cross-site request forgery attempts',
                'Access controls maintain perfect authorization boundaries'
            ],
            whenItFails: [
                'CRITICAL: SQL injection vulnerability detected - database at risk',
                'CRITICAL: XSS vulnerability allows malicious script execution',
                'CRITICAL: CSRF vulnerability enables unauthorized actions',
                'CRITICAL: Access control failure allows unauthorized access',
                'CRITICAL: Security breach confirmed - immediate emergency response required'
            ],
            codeHealthIndicator: {
                success: 'Security system is impenetrable. All cyber threats are blocked.',
                failed: 'EMERGENCY: SECURITY COMPROMISED - IMMEDIATE THREAT TO BUSINESS'
            },
            criticalAreas: [
                'Input validation and sanitization across all endpoints',
                'SQL injection prevention in database queries',
                'XSS protection in all user-facing content',
                'CSRF token validation and protection'
            ],
            successThreshold: 100
        },
        'Frontend UI Tests': {
            purpose: 'User interface components and interaction validation',
            codeFunction: 'UI COMPONENT ENGINE: Tests React components, user interactions, form validations, navigation flows, responsive design, and ensures seamless user experience',
            businessCritical: 'Customer experience - UI problems directly impact user satisfaction',
            failureConsequence: 'UI FAILURE → User frustration → Poor experience → Customer abandonment',
            reliability: 100,
            description: 'CRITICAL: Broken UI components prevent users from using the system',
            whatItTests: [
                'React components render without errors',
                'User interactions work across all browsers',
                'Forms validate input correctly and submit properly',
                'Navigation between pages functions smoothly',
                'Responsive design works on all device sizes'
            ],
            whenItFails: [
                'CRITICAL: Users cannot interact with the interface',
                'CRITICAL: Forms break preventing user actions',
                'CRITICAL: Navigation failures trap users',
                'CRITICAL: Mobile users cannot access features',
                'CRITICAL: Component crashes destroy user workflow'
            ],
            codeHealthIndicator: {
                success: 'Frontend UI is perfect. All user interactions work flawlessly.',
                failed: 'EMERGENCY: UI COMPONENTS BROKEN - User experience destroyed'
            },
            criticalAreas: [
                'React component rendering and state management',
                'Form validation and submission logic',
                'Navigation routing and user flow',
                'Responsive CSS and mobile compatibility'
            ],
            successThreshold: 100
        },
        'Integration Tests': {
            purpose: 'End-to-end system workflow and component integration validation',
            codeFunction: 'SYSTEM INTEGRATION VALIDATOR: Tests complete user journeys, database-frontend connections, API integrations, payment flows, and ensures all system components work together seamlessly',
            businessCritical: 'Business process continuity - integration failures break entire workflows',
            failureConsequence: 'INTEGRATION FAILURE → Broken workflows → Business disruption → Complete system failure',
            reliability: 100,
            description: 'CRITICAL: Integration failures can break entire business processes',
            whatItTests: [
                'Complete user registration to purchase workflow functions',
                'Database and frontend synchronization works perfectly',
                'Payment processing integrates without errors',
                'Email notifications trigger and deliver correctly',
                'Multi-step business processes complete successfully'
            ],
            whenItFails: [
                'CRITICAL: Complete user workflows break down',
                'CRITICAL: Database and frontend become disconnected',
                'CRITICAL: Payment processing fails causing revenue loss',
                'CRITICAL: Business processes stop functioning',
                'CRITICAL: System components cannot communicate'
            ],
            codeHealthIndicator: {
                success: 'System integration is seamless. All workflows function perfectly.',
                failed: 'EMERGENCY: SYSTEM INTEGRATION BROKEN - Business processes failing'
            },
            criticalAreas: [
                'Frontend-backend API communication',
                'Database transaction consistency',
                'Third-party service integrations',
                'Multi-step workflow coordination'
            ],
            successThreshold: 100
        },
        'Code Integrity Tests': {
            purpose: 'Code quality, architecture validation, and technical debt management',
            codeFunction: 'CODE QUALITY GUARDIAN: Analyzes code structure, detects duplications, validates architecture patterns, checks coding standards, and ensures maintainable, scalable codebase',
            businessCritical: 'Development velocity - poor code quality slows development and increases costs',
            failureConsequence: 'CODE QUALITY ISSUES → Development slowdown → Higher costs → Technical debt',
            reliability: 100,
            description: 'CRITICAL: Poor code quality creates future development problems and security risks',
            whatItTests: [
                'Code follows established coding standards consistently',
                'No duplicate code exists across the codebase',
                'Architecture patterns are implemented correctly',
                'Code complexity remains within acceptable limits',
                'Security best practices are followed throughout'
            ],
            whenItFails: [
                'CRITICAL: Code becomes unmaintainable increasing development costs',
                'CRITICAL: Duplicate code creates inconsistencies and bugs',
                'CRITICAL: Poor architecture prevents scalability',
                'CRITICAL: Complex code increases bug likelihood',
                'CRITICAL: Security vulnerabilities introduced through poor practices'
            ],
            codeHealthIndicator: {
                success: 'Code quality is excellent. Codebase is maintainable and secure.',
                failed: 'WARNING: CODE QUALITY ISSUES - Development velocity at risk'
            },
            criticalAreas: [
                'Code duplication detection and removal',
                'Architecture pattern consistency',
                'Security best practice compliance',
                'Code complexity and maintainability metrics'
            ],
            successThreshold: 100
        },
        'Performance Tests': {
            purpose: 'System efficiency and user experience optimization',
            codeFunction: 'PERFORMANCE OPTIMIZATION ENGINE: Monitors response times, optimizes database queries, manages memory usage, ensures scalability, and maintains fast user experience under all load conditions',
            businessCritical: 'User experience - slow systems lose customers to competitors',
            failureConsequence: 'SLOW PERFORMANCE → User abandonment → Customer loss → Competitive disadvantage',
            reliability: 100,
            description: 'CRITICAL: Performance issues drive customers to competitors',
            whatItTests: [
                'API responses meet enterprise-level speed requirements consistently',
                'Database queries execute with optimal efficiency always',
                'Memory usage remains within professional hosting limits',
                'System handles concurrent users without performance degradation',
                'Page load times maintain competitive advantage standards'
            ],
            whenItFails: [
                'CRITICAL: Slow response times create poor user experience',
                'CRITICAL: Database inefficiency causes system-wide slowdowns',
                'CRITICAL: Memory overuse causes hosting cost increases',
                'CRITICAL: Poor scalability prevents business growth',
                'CRITICAL: Performance issues drive customers to competitors'
            ],
            codeHealthIndicator: {
                success: 'System performance is enterprise-grade fast. User experience is optimal.',
                failed: 'EMERGENCY: PERFORMANCE CRISIS - Users experiencing unacceptable delays'
            },
            criticalAreas: [
                'API response time optimization and monitoring',
                'Database query efficiency and indexing',
                'Memory usage patterns and optimization',
                'Concurrent user handling and scalability'
            ],
            successThreshold: 100
        }
    };

    useEffect(() => {
        fetchTests();
        fetchTestStatus();
        fetchBackupHistory(); // Load backup history on initial load
        
        return () => {
            stopPolling();
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'code-quality') {
            fetchCodeQualityFiles();
            fetchBackupHistory();
        }
        if (activeTab === 'backup-history') {
            fetchBackupHistory();
        }
    }, [activeTab]);

    // Clear selected backups when backup history changes
    useEffect(() => {
        setSelectedBackups([]);
    }, [backupHistory]);

    useEffect(() => {
        if (runningTests.size > 0) {
            startPolling();
        } else {
            stopPolling();
        }
    }, [runningTests.size]);

    // Cleanup: Stop polling when component unmounts
    useEffect(() => {
        return () => {
            console.log('🧹 TestDashboard unmounting - stopping polling');
            stopPolling();
        };
    }, []);

    if (loading) {
        return (
            <div className="test-dashboard loading">
                <div className="loading-spinner">Loading tests...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="test-dashboard error">
                <div className="error-message">{error}</div>
                <button onClick={fetchTests} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="test-dashboard">
            <div className="dashboard-header">
                <h1>🧪 Test Dashboard</h1>
                <p>Run and monitor all test suites for the application</p>
                
                <div className="dashboard-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'api-tests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('api-tests')}
                    >
                        🔄 API Tests
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'code-quality' ? 'active' : ''}`}
                        onClick={() => setActiveTab('code-quality')}
                    >
                        🔍 Code Quality Tests
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'backup-history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('backup-history')}
                    >
                        📦 Backup History
                    </button>
                </div>
                
                {activeTab === 'api-tests' && (
                    <div className="dashboard-actions">
                        <button 
                            onClick={runAllTests}
                            className="run-all-btn"
                            disabled={runningTests.size > 0}
                        >
                            {runningTests.size > 0 ? '🔄 Running Tests...' : '🚀 Run All Tests'}
                        </button>
                        
                        <button 
                            onClick={fetchTestStatus}
                            className="refresh-btn"
                        >
                            🔄 Refresh Status
                        </button>
                    </div>
                )}
                
                {activeTab === 'code-quality' && (
                    <div className="dashboard-actions">
                        <button 
                            onClick={() => setShowCodeQualityModal(true)}
                            className="info-btn-large"
                        >
                            📖 How Code Quality Tests Work
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'api-tests' && (
                <div className="test-summary">
                    <div className="summary-card">
                        <h3>Total Tests</h3>
                        <div className="summary-value">{tests.length}</div>
                    </div>
                    <div className="summary-card">
                        <h3>Running</h3>
                        <div className="summary-value running">{runningTests.size}</div>
                    </div>
                    <div className="summary-card">
                        <h3>Completed</h3>
                        <div className="summary-value completed">
                            {Object.values(testStatus).filter(status => status === 'completed').length}
                        </div>
                    </div>
                    <div className="summary-card">
                        <h3>Failed</h3>
                        <div className="summary-value failed">
                            {Object.values(testStatus).filter(status => status === 'failed' || status === 'error').length}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'code-quality' && (
                <div className="code-quality-summary">
                    <div className="summary-card">
                        <h3>Test Categories</h3>
                        <div className="summary-value">10</div>
                    </div>
                    <div className="summary-card">
                        <h3>Seçilebilir Dosyalar</h3>
                        <div className="summary-value">Tümü</div>
                    </div>
                    <div className="summary-card">
                        <h3>Backup Modu</h3>
                        <div className="summary-value">Manuel Onay</div>
                    </div>
                    <div className="summary-card">
                        <h3>System Status</h3>
                        <div className="summary-value success">Ready</div>
                    </div>
                </div>
            )}

            {activeTab === 'api-tests' && (
                <div className="test-info-banner">
                    <div className="info-banner-content">
                        <div className="info-icon">💡</div>
                        <div className="info-text">
                            <h4>🧪 Test Sistemi Nasıl Çalışır?</h4>
                            <div className="key-points">
                                <div className="key-point success">
                                    <span className="point-icon">✅</span>
                                    <div className="point-content">
                                        <strong>Test Başarılı = Kod Sağlıklı</strong>
                                        <p>Bu kategorideki tüm fonksiyonlar düzgün çalışıyor, kullanıcılar sorun yaşamaz.</p>
                                    </div>
                                </div>
                                <div className="key-point failure">
                                    <span className="point-icon">❌</span>
                                    <div className="point-content">
                                        <strong>Test Başarısız = Kod Sorunlu</strong>
                                        <p>Bu kategoride hatalar var, kullanıcılar sorun yaşayacak, acil müdahale gerekli.</p>
                                    </div>
                                </div>
                                <div className="key-point info">
                                    <span className="point-icon">🔍</span>
                                    <div className="point-content">
                                        <strong>Güvenilirlik Oranı</strong>
                                        <p>Her test %80-100 arası güvenilirlikle kod durumunu tespit eder.</p>
                                    </div>
                                </div>
                                <div className="key-point warning">
                                    <span className="point-icon">🎯</span>
                                    <div className="point-content">
                                        <strong>Eşik Değeri</strong>
                                        <p>Her kategorinin sağlıklı sayılması için gereken minimum başarı yüzdesi.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'code-quality' && (
                <div className="code-quality-info-banner">
                    <div className="info-banner-content">
                        <div className="info-icon">🔬</div>
                        <div className="info-text">
                            <h4>🔍 Code Quality Test Sistemi</h4>
                            <div className="key-points">
                                <div className="key-point success">
                                    <span className="point-icon">🛡️</span>
                                    <div className="point-content">
                                        <strong>Kod Güvenliği Testleri</strong>
                                        <p>Syntax hatalarını, güvenlik açıklarını ve kod kalitesini otomatik tespit eder.</p>
                                    </div>
                                </div>
                                <div className="key-point warning">
                                    <span className="point-icon">💾</span>
                                    <div className="point-content">
                                        <strong>Otomatik Backup Sistemi</strong>
                                        <p>Test öncesi otomatik rollback noktası oluşturur, hata durumunda geri dönüş sağlar.</p>
                                    </div>
                                </div>
                                <div className="key-point info">
                                    <span className="point-icon">🔄</span>
                                    <div className="point-content">
                                        <strong>Products Management Odaklı</strong>
                                        <p>AdminDashboard.js, Products.js ve backend dosyalarını kapsamlı test eder.</p>
                                    </div>
                                </div>
                                <div className="key-point critical">
                                    <span className="point-icon">⚡</span>
                                    <div className="point-content">
                                        <strong>10 Kategori Test</strong>
                                        <p>Syntax, Dependencies, API, State, Functions, Debug, Security testleri yapar.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'api-tests' && (
                <div className="detailed-explanation">
                    <details className="explanation-details">
                        <summary>📚 Detaylı Açıklama: Test Sonuçları Nasıl Yorumlanır?</summary>
                    <div className="explanation-content">
                        <div className="explanation-section">
                            <h5>🔍 Test Başarısızlığı Ne Anlama Gelir?</h5>
                            <ul>
                                <li><strong>Authentication Tests Başarısız:</strong> Kullanıcılar login olamaz, güvenlik açığı var</li>
                                <li><strong>Order Tests Başarısız:</strong> Siparişler alınamaz, e-ticaret durur</li>
                                <li><strong>Cart Tests Başarısız:</strong> Sepet çalışmaz, müşteriler alışveriş yapamaz</li>
                                <li><strong>Invoice Tests Başarısız:</strong> Faturalar oluşmaz, mali işler durur</li>
                                <li><strong>Security Tests Başarısız:</strong> Sistem hacklenebilir, veri güvenliği yok</li>
                            </ul>
                        </div>
                        
                        <div className="explanation-section">
                            <h5>✅ Test Başarısı Ne Anlama Gelir?</h5>
                            <ul>
                                <li><strong>%95-100 Başarı:</strong> Kategoride hiç sorun yok, güvenle kullanılabilir</li>
                                <li><strong>%80-94 Başarı:</strong> Küçük hatalar olabilir ama sistem çalışır</li>
                                <li><strong>%60-79 Başarı:</strong> Önemli hatalar var, dikkat gerekli</li>
                                <li><strong>%60 Altı:</strong> Kritik hatalar var, acil müdahale şart</li>
                            </ul>
                        </div>
                        
                        <div className="explanation-section">
                            <h5>⚡ Hangi Testler Daha Kritik?</h5>
                            <div className="priority-grid">
                                <div className="priority-item critical">
                                    <strong>KRİTİK (%98-100 olmalı)</strong>
                                    <ul>
                                        <li>🔐 Security Tests</li>
                                        <li>📄 Invoice Tests</li>
                                        <li>🛒 Order Tests</li>
                                    </ul>
                                </div>
                                <div className="priority-item important">
                                    <strong>ÖNEMLİ (%90-95 olmalı)</strong>
                                    <ul>
                                        <li>🔑 Authentication Tests</li>
                                        <li>👑 Admin API Tests</li>
                                        <li>🛍️ Cart Tests</li>
                                    </ul>
                                </div>
                                <div className="priority-item normal">
                                    <strong>NORMAL (%80-90 olmalı)</strong>
                                    <ul>
                                        <li>📦 Product Tests</li>
                                        <li>📤 Upload Tests</li>
                                        <li>🎨 Theme Tests</li>
                                        <li>⚡ Performance Tests</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </details>
                </div>
            )}

            {activeTab === 'api-tests' && (
                <div className="test-categories">
                {Object.entries(groupedTests).map(([category, categoryTests]) => {
                    // Map backend test IDs to our info keys - UPDATED FOR ALL TESTS
                    const categoryMappings = {
                        // Backend test ID mappings
                        'auth_tests': 'Authentication Tests',
                        'authentication_tests': 'Authentication Tests',
                        'admin_tests': 'Admin API Tests',
                        'product_tests': 'Product Tests',
                        'invoice_tests': 'Invoice Tests',
                        'order_tests': 'Order Tests',
                        'theme_tests': 'Theme Tests',
                        'upload_tests': 'Upload Tests',
                        'frontend_ui_tests': 'Frontend UI Tests',
                        'integration_tests': 'Integration Tests',
                        'performance_tests': 'Performance Tests',
                        'security_tests': 'Security Tests',
                        'code_integrity_tests': 'Code Integrity Tests',
                        
                        // Category mappings
                        'backend api': 'Backend API',
                        'backend_api': 'Backend API',
                        'frontend ui': 'Frontend UI Tests',
                        'frontend_ui': 'Frontend UI Tests',
                        'integration': 'Integration Tests',
                        'code quality': 'Code Integrity Tests',
                        'code_quality': 'Code Integrity Tests',
                        
                        // Legacy category mappings (backup)
                        'authentication': 'Authentication Tests',
                        'auth': 'Authentication Tests',
                        'admin': 'Admin API Tests',
                        'product': 'Product Tests',
                        'products': 'Product Tests',
                        'order': 'Order Tests',
                        'orders': 'Order Tests',
                        'cart': 'Cart Tests',
                        'invoice': 'Invoice Tests',
                        'invoices': 'Invoice Tests',
                        'upload': 'Upload Tests',
                        'uploads': 'Upload Tests',
                        'theme': 'Theme Tests',
                        'themes': 'Theme Tests',
                        'security': 'Security Tests',
                        'performance': 'Performance Tests'
                    };
                    
                    // Try to map by category first, then by individual test IDs
                    let mappedCategory = categoryMappings[category.toLowerCase()] || category;
                    let categoryInfo = testCategoryInfo[mappedCategory];
                    
                    // If no category info found, try mapping by test ID
                    if (!categoryInfo && categoryTests.length > 0) {
                        const firstTestId = categoryTests[0].id;
                        mappedCategory = categoryMappings[firstTestId] || mappedCategory;
                        categoryInfo = testCategoryInfo[mappedCategory];
                    }
                    
                    return (
                    <div key={category} className="test-category">
                        <div className="category-header-info">
                            <h2 className="category-title">📁 {category}</h2>
                            {categoryInfo && (
                                <div className="category-quick-info">
                                    <div className="reliability-badge">
                                        Güvenilirlik: {categoryInfo.reliability}%
                                    </div>
                                    <div className="category-purpose">
                                        {categoryInfo.purpose}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="test-grid">
                            {categoryTests.map(test => {
                                const currentStatus = getStatusText(test.id);
                                const results = testResults[test.id];
                                const isExpanded = expandedTests.has(test.id);
                                
                                return (
                                    <div key={test.id} className={`test-card ${currentStatus}`}>
                                        <div className="test-header">
                                            <div className="test-info">
                                                <h3 className="test-name">{test.name}</h3>
                                                <p className="test-description">{test.description}</p>
                                            </div>
                                            
                                            <div className="test-controls">
                                                <span className={`status-badge ${getStatusBadgeClass(currentStatus)}`}>
                                                    {currentStatus}
                                                </span>
                                                
                                                {categoryInfo && (
                                                    <button
                                                        onClick={() => showCategoryInfo(categoryInfo)}
                                                        className="info-btn"
                                                        title="Kodun Görevi ve Amacı"
                                                    >
                                                        ℹ️
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => runTest(test.id)}
                                                    disabled={runningTests.has(test.id)}
                                                    className="run-test-btn"
                                                >
                                                    {runningTests.has(test.id) ? '⏳' : '▶️'}
                                                </button>
                                                
                                                <button
                                                    onClick={() => toggleTestDetails(test.id)}
                                                    className="details-btn"
                                                >
                                                    {isExpanded ? '🔽' : '▶️'}
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="test-details">
                                                {results ? (
                                                    <div className="test-results">
                                                        <div className="results-header">
                                                            <h4>Test Results</h4>
                                                            <span className="timestamp">
                                                                {new Date(results.timestamp).toLocaleString()}
                                                            </span>
                                                        </div>

                                                        {results.detailed_results && (
                                                            <div className="detailed-results">
                                                                <div className="result-summary">
                                                                    <div className="metric">
                                                                        <span className="label">Total Tests:</span>
                                                                        <span className="value">{results.detailed_results.total_tests || 0}</span>
                                                                    </div>
                                                                    <div className="metric">
                                                                        <span className="label">Passed:</span>
                                                                        <span className="value success">{results.detailed_results.passed_tests || 0}</span>
                                                                    </div>
                                                                    <div className="metric">
                                                                        <span className="label">Failed:</span>
                                                                        <span className="value error">{results.detailed_results.failed_tests || 0}</span>
                                                                    </div>
                                                                    <div className="metric">
                                                                        <span className="label">Success Rate:</span>
                                                                        <span className="value">{results.detailed_results.passed_tests && results.detailed_results.total_tests ? 
                                                                            Math.round((results.detailed_results.passed_tests / results.detailed_results.total_tests) * 100) : 0}%</span>
                                                                    </div>
                                                                    {results.detailed_results.performance_metrics && (
                                                                        <div className="metric">
                                                                            <span className="label">Duration:</span>
                                                                            <span className="value">{formatDuration(results.detailed_results.performance_metrics.total_duration)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {results.detailed_results.test_results && (
                                                                    <div className="individual-tests">
                                                                        <h5>Individual Test Results:</h5>
                                                                        <div className="test-list">
                                                                            {results.detailed_results.test_results.map((testResult, index) => (
                                                                                <div key={index} className={`test-item ${testResult.status.toLowerCase()}`}>
                                                                                    <div className="test-item-header">
                                                                                        <span className="test-item-name">{testResult.test_name}</span>
                                                                                        <span className={`test-item-status ${testResult.status.toLowerCase()}`}>
                                                                                            {testResult.status}
                                                                                        </span>
                                                                                        <span className="test-item-duration">{formatDuration(testResult.duration)}</span>
                                                                                        {(testResult.status === 'FAIL' || testResult.status === 'ERROR') && (
                                                                                            <button 
                                                                                                className="error-detail-btn"
                                                                                                onClick={() => toggleTestDetails(`${test.id}-${index}`)}
                                                                                            >
                                                                                                🔍
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                    
                                                                                    {expandedTests.has(`${test.id}-${index}`) && (testResult.status === 'FAIL' || testResult.status === 'ERROR') && (
                                                                                        <div className="test-error-details">
                                                                                            {testResult.message && (
                                                                                                <div className="error-message">
                                                                                                    <strong>Error Message:</strong>
                                                                                                    <pre>{testResult.message}</pre>
                                                                                                </div>
                                                                                            )}
                                                                                            {testResult.traceback && (
                                                                                                <div className="error-traceback">
                                                                                                    <strong>Traceback:</strong>
                                                                                                    <pre>{testResult.traceback}</pre>
                                                                                                </div>
                                                                                            )}
                                                                                            {testResult.stderr && (
                                                                                                <div className="error-stderr">
                                                                                                    <strong>Error Output:</strong>
                                                                                                    <pre>{testResult.stderr}</pre>
                                                                                                </div>
                                                                                            )}
                                                                                            {testResult.assertion_error && (
                                                                                                <div className="assertion-error">
                                                                                                    <strong>Assertion Error:</strong>
                                                                                                    <pre>{testResult.assertion_error}</pre>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {results.stdout && (
                                                            <div className="output-section">
                                                                <h5>Output:</h5>
                                                                <pre className="output-log">{results.stdout}</pre>
                                                            </div>
                                                        )}

                                                        {results.stderr && (
                                                            <div className="error-section">
                                                                <h5>Errors:</h5>
                                                                <pre className="error-log">{results.stderr}</pre>
                                                            </div>
                                                        )}

                                                        {results.error && (
                                                            <div className="error-section">
                                                                <h5>Error:</h5>
                                                                <pre className="error-log">{results.error}</pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="no-results">
                                                        <p>No test results available yet.</p>
                                                        <button
                                                            onClick={() => runTest(test.id)}
                                                            disabled={runningTests.has(test.id)}
                                                            className="run-test-btn small"
                                                        >
                                                            Run Test
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    );
                })}
                </div>
            )}

            {activeTab === 'code-quality' && (
                <div className="code-quality-content">
                    {/* Action Buttons */}
                    <div className="code-quality-actions">
                        <button 
                            onClick={fetchCodeQualityFiles}
                            className="action-btn refresh"
                            disabled={loadingFiles}
                        >
                            {loadingFiles ? '🔄 Loading...' : '🔄 Refresh Files'}
                        </button>
                        
                        <button 
                            onClick={runCodeQualityTests}
                            className="action-btn run"
                            disabled={selectedFiles.length === 0 || codeQualityStatus === 'running'}
                        >
                            {codeQualityStatus === 'running' ? 
                                `⏳ Testing ${Object.values(fileTestStatus).filter(s => s === 'completed').length}/${selectedFiles.length} files...` : 
                                `🚀 Run Tests (${selectedFiles.length} files)`
                            }
                        </button>
                        
                        <button 
                            onClick={fetchChangedFiles}
                            className="action-btn changed-files"
                            disabled={loadingChangedFiles}
                        >
                            {loadingChangedFiles ? '🔄 Loading...' : '📝 Changed Files'}
                        </button>
                        
                        <button 
                            onClick={() => setShowManualBackupModal(true)}
                            className="action-btn manual-backup"
                            disabled={selectedFiles.length === 0}
                        >
                            💾 Manual Backup ({selectedFiles.length})
                        </button>
                    </div>

                    {/* File Statistics */}
                    {Object.keys(fileStats).length > 0 && (
                        <div className="file-stats">
                            <div className="stat-item">
                                <span className="stat-label">Total Files:</span>
                                <span className="stat-value">{codeQualityFiles.length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Python Files:</span>
                                <span className="stat-value">{codeQualityFiles.filter(f => f.type === 'python').length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">JavaScript Files:</span>
                                <span className="stat-value">{codeQualityFiles.filter(f => f.type === 'javascript').length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">CSS Files:</span>
                                <span className="stat-value">{codeQualityFiles.filter(f => f.type === 'css').length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Selected:</span>
                                <span className="stat-value selected">{selectedFiles.length}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Tested:</span>
                                <span className="stat-value tested">{Object.keys(fileTestResults).length}</span>
                            </div>
                        </div>
                    )}

                    {/* Quick Selection Options */}
                    {selectionOptions.length > 0 && (
                        <div className="quick-selection">
                            <h3>🎯 Quick Selection Options</h3>
                            <div className="selection-buttons">
                                {selectionOptions.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleQuickSelection(option.id)}
                                        className="selection-btn"
                                    >
                                        {option.name}
                                        <span className="selection-desc">{option.description}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        setSelectedFiles([]);
                                        // Refresh file list to ensure all files are visible
                                        fetchCodeQualityFiles();
                                    }}
                                    className="selection-btn clear-all"
                                >
                                    🗑️ Clear All
                                    <span className="selection-desc">Deselect all files</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* File List */}
                    {codeQualityFiles.length > 0 && (
                        <div className="file-selection">
                            <h3>📁 Project Files ({codeQualityFiles.length})</h3>
                            <div className="file-grid">
                                {[...codeQualityFiles]
                                    .sort((a, b) => {
                                        const aSelected = selectedFiles.includes(a.id);
                                        const bSelected = selectedFiles.includes(b.id);
                                        // Selected files go to top
                                        if (aSelected && !bSelected) return -1;
                                        if (!aSelected && bSelected) return 1;
                                        // Within same group, maintain original order
                                        return a.id - b.id;
                                    })
                                    .map(file => {
                                    const testStatus = fileTestStatus[file.id];
                                    const hasTestResult = fileTestResults[file.id];
                                    
                                    return (
                                        <div 
                                            key={file.id} 
                                            className={`file-item ${selectedFiles.includes(file.id) ? 'selected' : ''} ${testStatus ? `test-${testStatus}` : ''}`}
                                        >
                                            <label className="file-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFiles.includes(file.id)}
                                                    onChange={() => handleFileSelection(file.id)}
                                                />
                                                <div className="file-info">
                                                    <div className="file-path">
                                                        {file.path}
                                                        {testStatus && (
                                                            <span className={`test-status-icon ${testStatus}`}>
                                                                {testStatus === 'waiting' && '⏰'}
                                                                {testStatus === 'running' && '⏳'}
                                                                {testStatus === 'completed' && '✅'}
                                                                {testStatus === 'failed' && '❌'}
                                                                {testStatus === 'error' && '🔴'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="file-meta">
                                                        <span className={`file-type ${file.type}`}>{file.category}</span>
                                                        <span className="file-size">{file.size}</span>
                                                        {hasTestResult && (
                                                            <button 
                                                                className="view-report-btn"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setSelectedFileReport({
                                                                        file: file,
                                                                        results: fileTestResults[file.id]
                                                                    });
                                                                    setShowFileReportModal(true);
                                                                }}
                                                                title="View detailed test report"
                                                            >
                                                                📊 Report
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Test Results */}
                    {codeQualityResults && (
                        <div className="test-results-section">
                            <h3>📊 Test Results</h3>
                            <div className={`results-summary ${codeQualityResults.success ? 'success' : 'failed'}`}>
                                <div className="result-status">
                                    {codeQualityResults.success ? '✅ Tests Passed' : '❌ Tests Failed'}
                                </div>
                                <div className="result-meta">
                                    Tested {codeQualityResults.selected_files?.length || selectedFiles.length} files
                                    at {new Date(codeQualityResults.timestamp).toLocaleString()}
                                </div>
                            </div>

                            {codeQualityResults.detailed_results?.categories && (
                                <div className="test-categories-results">
                                    {codeQualityResults.detailed_results.categories.map((category, index) => (
                                        <div key={index} className={`test-category-result ${category.status.toLowerCase()}`}>
                                            <div className="category-header">
                                                <span className="category-status">
                                                    {category.status === 'PASSED' ? '✅' : '❌'}
                                                </span>
                                                <span className="category-name">{category.name}</span>
                                                {category.issues_count > 0 && (
                                                    <span className="issues-count">{category.issues_count} issues</span>
                                                )}
                                            </div>
                                            {category.details && (
                                                <div className="category-details">{category.details}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {codeQualityResults.stdout && (
                                <details className="raw-output">
                                    <summary>View Raw Output</summary>
                                    <pre>{codeQualityResults.stdout}</pre>
                                </details>
                            )}
                        </div>
                    )}



                    {/* Selected Files Display */}
                    {selectedFiles.length > 0 && (
                        <div className="selected-files-display">
                            <h3>🎯 Selected Files ({selectedFiles.length})</h3>
                            <div className="selected-files-list">
                                {selectedFiles.map(fileId => {
                                    const file = codeQualityFiles.find(f => f.id === fileId);
                                    const testStatus = fileTestStatus[fileId];
                                    
                                    return file ? (
                                        <div key={fileId} className={`selected-file-item ${testStatus ? `status-${testStatus}` : ''}`}>
                                            <div className="selected-file-info">
                                                <span className="selected-file-path">{file.path}</span>
                                                <span className="selected-file-size">({file.size})</span>
                                                {testStatus && (
                                                    <span className={`selected-status-icon ${testStatus}`}>
                                                        {testStatus === 'waiting' && '⏰'}
                                                        {testStatus === 'running' && '⏳'}
                                                        {testStatus === 'completed' && '✅'}
                                                        {testStatus === 'failed' && '❌'}
                                                        {testStatus === 'error' && '🔴'}
                                                    </span>
                                                )}
                                            </div>
                                            <button 
                                                className="remove-file-btn"
                                                onClick={() => handleFileSelection(fileId)}
                                                title="Remove from selection"
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    ) : null
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Backup History Tab Content */}
            {activeTab === 'backup-history' && (
                <div className="backup-history-page">
                    <div className="page-header">
                        <h2>📦 Backup History</h2>
                        <div className="bulk-operations">
                            {selectedBackups.length > 0 && (
                                <span className="selection-count">
                                    {selectedBackups.length} selected
                                </span>
                            )}
                            <button 
                                onClick={selectAllBackups}
                                className="bulk-btn select-all"
                                disabled={backupHistory.length === 0}
                            >
                                ☑️ Select All
                            </button>
                            <button 
                                onClick={clearAllSelections}
                                className="bulk-btn clear"
                                disabled={selectedBackups.length === 0}
                            >
                                ❌ Clear
                            </button>
                            <button 
                                onClick={bulkRestoreBackup}
                                className="bulk-btn restore"
                                disabled={selectedBackups.length === 0 || bulkOperationLoading}
                            >
                                {bulkOperationLoading ? '⏳' : '📁'} Restore
                            </button>
                            <button 
                                onClick={bulkDeleteBackups}
                                className="bulk-btn delete"
                                disabled={selectedBackups.length === 0 || bulkOperationLoading}
                            >
                                {bulkOperationLoading ? '⏳ Deleting...' : '🗑️ Delete Selected'}
                            </button>
                            <button 
                                onClick={fetchBackupHistory}
                                className="action-btn refresh"
                            >
                                🔄 Refresh
                            </button>
                            <button 
                                onClick={openCleanupModal}
                                className="action-btn cleanup"
                                style={{
                                    backgroundColor: '#ff6b6b',
                                    color: 'white',
                                    marginLeft: '10px'
                                }}
                            >
                                🧹 Cleanup Tests
                            </button>
                            <button 
                                onClick={debugFileScanning}
                                className="action-btn debug"
                                disabled={debugLoading}
                                style={{
                                    backgroundColor: '#9b59b6',
                                    color: 'white',
                                    marginLeft: '10px'
                                }}
                            >
                                {debugLoading ? '🔄 Debugging...' : '🔍 Debug Scanning'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="backup-history-content">
                        {backupHistory.length > 0 ? (
                            <div className="backup-list-page">
                                {backupHistory.map(backup => (
                                    <div 
                                        key={backup.id} 
                                        className={`backup-item-page ${selectedBackups.includes(backup.id) ? 'selected' : ''}`}
                                    >
                                        <div className="backup-checkbox">
                                            <input 
                                                type="checkbox"
                                                checked={selectedBackups.includes(backup.id)}
                                                onChange={() => handleBackupSelection(backup.id)}
                                                id={`backup-${backup.id}`}
                                            />
                                            <label htmlFor={`backup-${backup.id}`}></label>
                                        </div>
                                        <div className="backup-main-info-page">
                                            <span className="backup-id-page">{backup.id}</span>
                                            <span className="backup-date-page">📅 {backup.date} {backup.time}</span>
                                            <span className="file-count-page">({backup.file_count} files)</span>
                                            {backup.description && (
                                                <span className="backup-description-page">📝 {backup.description}</span>
                                            )}
                                        </div>
                                        <div className="backup-actions-page">
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to restore backup ${backup.id}?`)) {
                                                        rollbackToBackup(backup.id);
                                                    }
                                                }}
                                                className="restore-btn-page"
                                                title="Restore this backup"
                                            >
                                                📁 Restore
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete backup ${backup.id}? This action cannot be undone.`)) {
                                                        deleteBackup(backup.id);
                                                    }
                                                }}
                                                className="delete-btn-page"
                                                title="Delete this backup"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-backups-page">
                                <div className="no-backups-icon">📁</div>
                                <h3>No Backup Points Created Yet</h3>
                                <p>Backup points will appear here after successful tests with backup approval.</p>
                                <p>You can also create manual backups from the Code Quality Tests tab.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Code Quality Modal */}
            {showCodeQualityModal && (
                <div className="modal-overlay" onClick={() => setShowCodeQualityModal(false)}>
                    <div className="modal-content code-quality-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🔬 Code Quality Test System</h2>
                            <button onClick={() => setShowCodeQualityModal(false)} className="close-btn">×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="quality-explanation">
                                <h3>🎯 Sistem Amacı</h3>
                                <p>Tüm proje dosyalarının kod kalitesini sürekli kontrol eder. Kullanıcı istediği dosyaları seçerek test edebilir, kod hasarlarını önler ve güvenli backup noktaları oluşturur.</p>
                                
                                <h3>🔍 Test Kategorileri</h3>
                                <div className="test-categories-grid">
                                    <div className="test-category">
                                        <strong>📝 Syntax Tests</strong>
                                        <p>JavaScript/React syntax hatalarını tespit eder</p>
                                    </div>
                                    <div className="test-category">
                                        <strong>📦 Import Dependencies</strong>
                                        <p>Eksik import'ları kontrol eder</p>
                                    </div>
                                    <div className="test-category">
                                        <strong>🌐 API Connectivity</strong>
                                        <p>Backend bağlantılarını test eder</p>
                                    </div>
                                    <div className="test-category">
                                        <strong>⚡ State Management</strong>
                                        <p>React state kullanımını doğrular</p>
                                    </div>
                                    <div className="test-category">
                                        <strong>🔧 Function Integrity</strong>
                                        <p>Kritik fonksiyonların varlığını kontrol eder</p>
                                    </div>
                                    <div className="test-category">
                                        <strong>🧹 Debug Cleanup</strong>
                                        <p>Gereksiz debug kodlarını tespit eder</p>
                                    </div>
                                    <div className="test-category">
                                        <strong>🔄 Code Duplication</strong>
                                        <p>Tekrarlanan kod bloklarını bulur</p>
                                    </div>
                                    <div className="test-category">
                                        <strong>⚠️ Error Handling</strong>
                                        <p>Try-catch bloklarını doğrular</p>
                                    </div>
                                    <div className="test-category">
                                        <strong>🔀 Async Operations</strong>
                                        <p>Async/await kullanımını kontrol eder</p>
                                    </div>
                                    <div className="test-category">
                                        <strong>🛡️ Security Checks</strong>
                                        <p>Güvenlik açıklarını tespit eder</p>
                                    </div>
                                </div>
                                
                                <h3>💾 Manuel Backup Sistemi</h3>
                                <ul>
                                    <li>Test başarılı olsa bile kullanıcı onayı olmadan backup alınmaz</li>
                                    <li>Test geçmesine rağmen çalışmazsa backup'i bozmamak için güvenlik</li>
                                    <li>Kullanıcı onayıyla güvenli backup noktaları oluşturulur</li>
                                    <li>İstediğiniz dosyaları seçerek rollback noktası oluşturabilirsiniz</li>
                                    <li>Timestamp ile organize edilmiş backup noktaları</li>
                                </ul>
                                
                                <h3>📁 Seçilebilir Dosyalar</h3>
                                <div className="file-grid">
                                    <div className="file-category">
                                        <h4>🎯 Seçim Opsiyonları</h4>
                                        <ul>
                                            <li>Tüm proje dosyaları (Python, JS, CSS)</li>
                                            <li>Sadece Backend dosyaları (.py)</li>
                                            <li>Sadece Frontend dosyaları (.js, .jsx)</li>
                                            <li>Critical dosyalar (8 dosya)</li>
                                            <li>Büyük dosyalar (&gt;50KB)</li>
                                            <li>Manuel seçim (istediğiniz dosyalar)</li>
                                        </ul>
                                    </div>
                                    <div className="file-category">
                                        <h4>📊 Dosya İstatistikleri</h4>
                                        <ul>
                                            <li>Toplam dosya sayısı otomatik tespit</li>
                                            <li>Dosya boyutu bilgisi</li>
                                            <li>Kategori bazında gruplandırma</li>
                                            <li>İnteraktif dosya seçimi</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Professional Category Information Modal */}
            {selectedCategoryInfo && (
                <div className="category-info-modal" onClick={closeCategoryInfo}>
                    <div className="category-info-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={closeCategoryInfo}>×</button>
                        
                        <div className="professional-header">
                            <h3>🏢 PROFESYONEL KALİTE TEST SİSTEMİ</h3>
                        </div>
                        
                        <h2>{selectedCategoryInfo.purpose}</h2>
                        
                        <div className="reliability-badge">
                            %{selectedCategoryInfo.reliability} BAŞARI ŞART - HATA TOLERANSI YOK
                        </div>
                        
                        <div className="info-section code">
                            <h3>🔧 KODUN GÖREVİ VE AMACI</h3>
                            <div className="code-function">
                                {selectedCategoryInfo.codeFunction}
                            </div>
                        </div>
                        
                        <div className="info-section business">
                            <h3>💼 İŞ KRİTİKLİĞİ</h3>
                            <div className="business-critical">
                                {selectedCategoryInfo.businessCritical}
                            </div>
                        </div>
                        
                        <div className="info-section critical">
                            <h3>⚠️ HATA SONUÇLARI</h3>
                            <div className="failure-consequence">
                                {selectedCategoryInfo.failureConsequence}
                            </div>
                        </div>
                        
                        <div className="info-section">
                            <h3>✅ TEST BAŞARILI OLDUĞUNDA</h3>
                            <ul className="test-list">
                                {selectedCategoryInfo.whatItTests.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="info-section">
                            <h3>❌ TEST BAŞARISIZ OLDUĞUNDA</h3>
                            <ul className="failure-list">
                                {selectedCategoryInfo.whenItFails.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="info-section">
                            <h3>🎯 KRİTİK KOD ALANLARI</h3>
                            <ul className="critical-areas">
                                {selectedCategoryInfo.criticalAreas.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="info-section">
                            <h3>📊 BAŞARI KRİTERİ</h3>
                            <p><strong>Minimum Geçer Not: {selectedCategoryInfo.successThreshold}%</strong></p>
                            <p>{selectedCategoryInfo.codeHealthIndicator.success}</p>
                            {selectedCategoryInfo.successThreshold < 100 && (
                                <p style={{color: '#e74c3c', fontWeight: 'bold'}}>
                                    UYARI: Bu test %{selectedCategoryInfo.successThreshold} başarı eşiğine sahip. 
                                    Müşteri sunumu için %100 olmalı!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Backup Approval Modal */}
            {showBackupApproval && (
                <div className="modal-overlay" onClick={() => setShowBackupApproval(false)}>
                    <div className="modal-content backup-approval-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>✅ Tests Passed - Backup Approval</h2>
                            <button onClick={() => setShowBackupApproval(false)} className="close-btn">×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="backup-message">
                                {(() => {
                                    const passedCount = Object.values(fileTestResults).filter(result => 
                                        result && result.success
                                    ).length;
                                    const totalCount = selectedFiles.length;
                                    const allPassed = passedCount === totalCount;
                                    
                                    return (
                                        <>
                                            <div className="success-icon">{allPassed ? '🎉' : '⚠️'}</div>
                                            <h3>{allPassed ? 'All Tests Passed!' : 'Tests Completed - Partial Success'}</h3>
                                            
                                            <div className="test-summary">
                                                <p><strong>📊 Test Results: {passedCount}/{totalCount} files passed</strong></p>
                                                
                                                {!allPassed && (
                                                    <div className="file-status-summary">
                                                        <div className="passed-files">
                                                            <h4>✅ Passed Files ({passedCount}):</h4>
                                                            <ul>
                                                                {Object.entries(fileTestResults)
                                                                    .filter(([fileId, result]) => result && result.success)
                                                                    .map(([fileId, result]) => {
                                                                        const file = codeQualityFiles.find(f => f.id === parseInt(fileId));
                                                                        return (
                                                                            <li key={fileId}>{file ? file.path : `File ${fileId}`}</li>
                                                                        );
                                                                    })
                                                                }
                                                            </ul>
                                                        </div>
                                                        
                                                        <div className="failed-files">
                                                            <h4>❌ Failed Files ({totalCount - passedCount}):</h4>
                                                            <ul>
                                                                {Object.entries(fileTestResults)
                                                                    .filter(([fileId, result]) => result && !result.success)
                                                                    .map(([fileId, result]) => {
                                                                        const file = codeQualityFiles.find(f => f.id === parseInt(fileId));
                                                                        return (
                                                                            <li key={fileId}>{file ? file.path : `File ${fileId}`}</li>
                                                                        );
                                                                    })
                                                                }
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <p>{allPassed 
                                                    ? 'All selected files passed the quality tests. Would you like to create a backup point?' 
                                                    : `Would you like to create a backup for the ${passedCount} files that passed the tests?`
                                                }</p>
                                            </div>
                                            
                                            <div className="backup-warning">
                                                <strong>⚠️ Important:</strong>
                                                <p>Creating a backup will save the current state of your {allPassed ? 'tested' : 'passed'} files. This allows you to rollback to this point if future changes cause issues.</p>
                                                {!allPassed && (
                                                    <p><strong>Note:</strong> Only files that passed the tests will be included in the backup.</p>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            
                            <div className="backup-actions">
                                {(() => {
                                    const passedCount = Object.values(fileTestResults).filter(result => 
                                        result && result.success
                                    ).length;
                                    const totalCount = selectedFiles.length;
                                    const allPassed = passedCount === totalCount;
                                    
                                    return (
                                        <>
                                            <button 
                                                onClick={approveBackup}
                                                className="approve-backup-btn"
                                            >
                                                📦 {allPassed ? 'Create Backup (All Files)' : `Create Backup (${passedCount} Passed Files)`}
                                            </button>
                                            
                                            <button 
                                                onClick={() => setShowBackupApproval(false)}
                                                className="skip-backup-btn"
                                            >
                                                {allPassed ? 'Skip Backup' : 'Skip - Fix Failed Files First'}
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* File Report Modal */}
            {showFileReportModal && selectedFileReport && (
                <div className="modal-overlay" onClick={() => setShowFileReportModal(false)}>
                    <div className="modal-content file-report-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📊 Test Report: {selectedFileReport.file.path}</h2>
                            <button onClick={() => setShowFileReportModal(false)} className="close-btn">×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="file-report-content">
                                <div className="report-summary">
                                    <div className={`report-status ${selectedFileReport.results.success ? 'success' : 'failed'}`}>
                                        <span className="status-icon">
                                            {selectedFileReport.results.success ? '✅' : '❌'}
                                        </span>
                                        <span className="status-text">
                                            {selectedFileReport.results.success ? 'Tests Passed' : 'Tests Failed'}
                                        </span>
                                    </div>
                                    <div className="report-meta">
                                        <div className="meta-item">
                                            <strong>File:</strong> {selectedFileReport.file.path}
                                        </div>
                                        <div className="meta-item">
                                            <strong>Size:</strong> {selectedFileReport.file.size}
                                        </div>
                                        <div className="meta-item">
                                            <strong>Type:</strong> {selectedFileReport.file.category}
                                        </div>
                                        <div className="meta-item">
                                            <strong>Tested:</strong> {new Date(selectedFileReport.results.timestamp).toLocaleString()}
                                        </div>
                                        {selectedFileReport.results.exit_code !== undefined && (
                                            <div className="meta-item">
                                                <strong>Exit Code:</strong> {selectedFileReport.results.exit_code}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="report-actions">
                                        <button 
                                            className="copy-report-btn"
                                            onClick={() => copyReportToClipboard(selectedFileReport)}
                                            title="Copy detailed report to clipboard for AI assistance"
                                        >
                                            📋 Copy Report for Cursor AI
                                        </button>
                                    </div>
                                </div>

                                {/* Error Details for Failed Tests */}
                                {!selectedFileReport.results.success && (
                                    <div className="error-details">
                                        <h4>❌ Error Details</h4>
                                        {selectedFileReport.results.error_type && (
                                            <div className="error-type">
                                                <strong>Error Type:</strong> {selectedFileReport.results.error_type}
                                            </div>
                                        )}
                                        {selectedFileReport.results.stderr && (
                                            <div className="error-output">
                                                <strong>Error Output:</strong>
                                                <pre className="error-text">{selectedFileReport.results.stderr}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedFileReport.results.detailed_results?.categories && (
                                    <div className="detailed-test-results">
                                        <h4>📋 Test Categories</h4>
                                        <div className="test-categories-list">
                                            {selectedFileReport.results.detailed_results.categories.map((category, index) => (
                                                <div key={index} className={`test-category-item ${category.status.toLowerCase()}`}>
                                                    <div className="category-header">
                                                        <span className="category-status">
                                                            {category.status === 'PASSED' ? '✅' : '❌'}
                                                        </span>
                                                        <span className="category-name">{category.name}</span>
                                                        {category.issues_count > 0 && (
                                                            <span className="issues-badge">{category.issues_count} issues</span>
                                                        )}
                                                    </div>
                                                    {category.details && (
                                                        <div className="category-details">{category.details}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedFileReport.results.stdout && (
                                    <details className="raw-output">
                                        <summary>View Raw Test Output</summary>
                                        <pre>{selectedFileReport.results.stdout}</pre>
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Changed Files Modal */}
            {showChangedFilesModal && (
                <div className="modal-overlay" onClick={() => setShowChangedFilesModal(false)}>
                    <div className="modal-content changed-files-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📝 Changed Files Since Last Backup</h2>
                            <button onClick={() => setShowChangedFilesModal(false)} className="close-btn">×</button>
                        </div>
                        
                        <div className="modal-body">
                            {changedFiles.length === 0 ? (
                                <div className="no-changes">
                                    <div className="no-changes-icon">✅</div>
                                    <h3>No Changes Detected</h3>
                                    <p>No files have been modified since the last backup.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="changed-files-info">
                                        <p><strong>{changedFiles.length}</strong> file(s) have been modified since the last backup:</p>
                                    </div>
                                    
                                    <div className="changed-files-selection">
                                        <button 
                                            onClick={() => {
                                                console.log('🔍 Select All clicked');
                                                console.log('🔍 changedFiles.length:', changedFiles.length);
                                                const allIndexes = changedFiles.map((_, i) => i);
                                                console.log('🔍 Setting indexes to:', allIndexes);
                                                setSelectedChangedFileIndexes(allIndexes);
                                            }}
                                            className="select-all-btn"
                                        >
                                            ✅ Select All
                                        </button>
                                        <button 
                                            onClick={() => setSelectedChangedFileIndexes([])}
                                            className="clear-all-btn"
                                        >
                                            ❌ Clear All
                                        </button>
                                    </div>
                                    
                                    <div className="changed-files-list">
                                        {changedFiles.map((file, index) => (
                                            <div key={index} className="changed-file-item">
                                                <div className="file-info">
                                                    <div className="file-path">
                                                        <span className={`status-badge ${file.git_status === '??' ? 'untracked' : file.git_status.toLowerCase()}`}>
                                                            {file.status}
                                                        </span>
                                                        {file.path}
                                                    </div>
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    id={`changed-file-${index}`}
                                                    checked={selectedChangedFileIndexes.includes(index)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedChangedFileIndexes(prev => [...prev, index]);
                                                        } else {
                                                            setSelectedChangedFileIndexes(prev => prev.filter(i => i !== index));
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="changed-files-actions">
                                        <div className="selection-info">
                                            <span>{selectedChangedFileIndexes.length} of {changedFiles.length} files selected</span>
                                        </div>
                                        
                                        <div className="action-buttons">
                                            <button 
                                                onClick={() => {
                                                    console.log('🔍 Test Selected clicked');
                                                    console.log('🔍 selectedChangedFileIndexes:', selectedChangedFileIndexes);
                                                    console.log('🔍 changedFiles.length:', changedFiles.length);
                                                    
                                                    const selectedChangedFiles = selectedChangedFileIndexes.map(i => changedFiles[i]);
                                                    console.log('🔍 mapped selectedChangedFiles:', selectedChangedFiles);
                                                    
                                                    selectChangedFilesForTesting(selectedChangedFiles);
                                                }}
                                                className="select-changed-btn"
                                                disabled={selectedChangedFileIndexes.length === 0}
                                            >
                                                🚀 Test Selected Files ({selectedChangedFileIndexes.length})
                                            </button>
                                            
                                            <button 
                                                onClick={() => {
                                                    console.log('🔍 Test All clicked');
                                                    console.log('🔍 changedFiles:', changedFiles);
                                                    console.log('🔍 changedFiles.length:', changedFiles.length);
                                                    
                                                    selectChangedFilesForTesting(changedFiles);
                                                }}
                                                className="test-all-changed-btn"
                                            >
                                                🚀 Test All Changed Files ({changedFiles.length})
                                            </button>
                                            
                                            <button 
                                                onClick={() => setShowChangedFilesModal(false)}
                                                className="cancel-btn"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Backup Modal */}
            {showManualBackupModal && (
                <div className="modal-overlay" onClick={() => setShowManualBackupModal(false)}>
                    <div className="modal-content manual-backup-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>💾 Create Manual Backup</h2>
                            <button onClick={() => setShowManualBackupModal(false)} className="close-btn">×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="backup-info">
                                <div className="selected-files-count">
                                    <strong>{selectedFiles.length} files</strong> selected for backup
                                </div>
                                
                                <div className="backup-description-section">
                                    <label htmlFor="backup-description">Backup Description:</label>
                                    <input 
                                        type="text" 
                                        id="backup-description"
                                        value={backupDescription}
                                        onChange={(e) => setBackupDescription(e.target.value)}
                                        placeholder="Enter backup description..."
                                        maxLength={100}
                                    />
                                </div>
                                
                                <div className="backup-actions">
                                    <button 
                                        onClick={createManualBackup}
                                        className="create-backup-btn"
                                        disabled={manualBackupLoading}
                                    >
                                        {manualBackupLoading ? '🔄 Creating Backup...' : '💾 Create Backup'}
                                    </button>
                                    
                                    <button 
                                        onClick={() => setShowManualBackupModal(false)}
                                        className="cancel-btn"
                                        disabled={manualBackupLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cleanup Modal */}
            {showCleanupModal && (
                <div className="modal-overlay" onClick={() => setShowCleanupModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🧹 Test Data Cleanup</h2>
                            <button 
                                className="close-btn" 
                                onClick={() => setShowCleanupModal(false)}
                                disabled={cleanupLoading}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {cleanupStats && (
                                <div className="cleanup-stats">
                                    <h3>📊 Current Test Data</h3>
                                    <div className="stats-grid">
                                        <div className="stat-item">
                                            <span className="stat-label">📄 Report Files:</span>
                                            <span className="stat-value">{cleanupStats.reports.count} files ({cleanupStats.reports.size_mb} MB)</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">💾 Backup Items:</span>
                                            <span className="stat-value">{cleanupStats.backups.count} items ({cleanupStats.backups.size_mb} MB)</span>
                                        </div>
                                    </div>

                                    {Object.keys(cleanupStats.reports.types).length > 0 && (
                                        <div className="stats-details">
                                            <h4>Report Types:</h4>
                                            {Object.entries(cleanupStats.reports.types).map(([type, count]) => (
                                                <div key={type} className="stat-detail">
                                                    {type}: {count} files
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {Object.keys(cleanupStats.backups.types).length > 0 && (
                                        <div className="stats-details">
                                            <h4>Backup Types:</h4>
                                            {Object.entries(cleanupStats.backups.types).map(([type, count]) => (
                                                <div key={type} className="stat-detail">
                                                    {type}: {count} items
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="cleanup-actions">
                                <p className="cleanup-warning">
                                    ⚠️ <strong>Warning:</strong> Cleanup operations cannot be undone!
                                </p>
                                
                                <div className="cleanup-buttons">
                                    <button 
                                        onClick={cleanupReports}
                                        className="cleanup-action-btn reports"
                                        disabled={cleanupLoading || !cleanupStats?.reports.count}
                                        style={{
                                            backgroundColor: '#4a90e2',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '4px',
                                            margin: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {cleanupLoading ? '🔄 Processing...' : `🗂️ Clean Reports (${cleanupStats?.reports.count || 0})`}
                                    </button>
                                    
                                    <button 
                                        onClick={cleanupBackups}
                                        className="cleanup-action-btn backups"
                                        disabled={cleanupLoading || !cleanupStats?.backups.count}
                                        style={{
                                            backgroundColor: '#f39c12',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '4px',
                                            margin: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {cleanupLoading ? '🔄 Processing...' : `💾 Clean Backups (${cleanupStats?.backups.count || 0})`}
                                    </button>
                                    
                                    <button 
                                        onClick={cleanupAll}
                                        className="cleanup-action-btn all"
                                        disabled={cleanupLoading || (!cleanupStats?.reports.count && !cleanupStats?.backups.count)}
                                        style={{
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '4px',
                                            margin: '5px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {cleanupLoading ? '🔄 Processing...' : `🧹 Clean ALL (${(cleanupStats?.reports.count || 0) + (cleanupStats?.backups.count || 0)})`}
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={() => setShowCleanupModal(false)}
                                    className="cancel-btn"
                                    disabled={cleanupLoading}
                                    style={{
                                        backgroundColor: '#95a5a6',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        margin: '10px 5px 0 5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Modal */}
            {showDebugModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '90%', width: '900px', maxHeight: '90%' }}>
                        <div className="modal-header">
                            <h3 style={{ color: '#9b59b6' }}>🔍 File Scanning Debug Report</h3>
                            <button 
                                onClick={() => setShowDebugModal(false)}
                                className="close-btn"
                                disabled={debugLoading}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="modal-body" style={{ padding: '20px' }}>
                            <div style={{ 
                                backgroundColor: '#2c3e50',
                                color: '#ecf0f1',
                                padding: '15px',
                                borderRadius: '8px',
                                fontFamily: 'Consolas, Monaco, monospace',
                                fontSize: '12px',
                                whiteSpace: 'pre-wrap',
                                overflow: 'auto',
                                maxHeight: '500px',
                                minHeight: '300px',
                                border: '2px solid #9b59b6'
                            }}>
                                {debugOutput || 'No output available'}
                            </div>
                            
                            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(debugOutput);
                                        alert('Debug output copied to clipboard!');
                                    }}
                                    style={{
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        margin: '5px',
                                        cursor: 'pointer'
                                    }}
                                    disabled={!debugOutput}
                                >
                                    📋 Copy to Clipboard
                                </button>
                                
                                <button 
                                    onClick={debugFileScanning}
                                    style={{
                                        backgroundColor: '#9b59b6',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        margin: '5px',
                                        cursor: 'pointer'
                                    }}
                                    disabled={debugLoading}
                                >
                                    {debugLoading ? '🔄 Running...' : '🔄 Run Again'}
                                </button>
                                
                                <button 
                                    onClick={() => setShowDebugModal(false)}
                                    style={{
                                        backgroundColor: '#95a5a6',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        margin: '5px',
                                        cursor: 'pointer'
                                    }}
                                    disabled={debugLoading}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestDashboard; 