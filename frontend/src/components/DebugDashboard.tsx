/**
 * Debug Dashboard Component - Visual debugging interface for development
 * Provides real-time logs, API monitoring, performance metrics, and error tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { frontendDebugLogger, DebugLevel, DebugCategory, type LogEntry } from '../utils/debugLogger';

interface DebugDashboardProps {
  isVisible?: boolean;
  onToggle?: (visible: boolean) => void;
}

const DebugDashboard: React.FC<DebugDashboardProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'api' | 'performance' | 'settings'>('logs');
  const [filterLevel, setFilterLevel] = useState<DebugLevel>(DebugLevel.INFO);
  const [filterCategory, setFilterCategory] = useState<DebugCategory | 'ALL'>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);

  // Update logs periodically
  useEffect(() => {
    const updateLogs = () => {
      const filteredLogs = frontendDebugLogger.getLogs({
        level: filterLevel,
        category: filterCategory === 'ALL' ? undefined : filterCategory
      });
      setLogs(filteredLogs.slice(-100)); // Show last 100 logs
    };

    updateLogs();
    const interval = setInterval(updateLogs, 1000);
    return () => clearInterval(interval);
  }, [filterLevel, filterCategory]);

  const handleClearLogs = useCallback(() => {
    frontendDebugLogger.clearLogs();
    setLogs([]);
  }, []);

  const handleExportLogs = useCallback(() => {
    const logsData = frontendDebugLogger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLevelColor = (level: DebugLevel) => {
    switch (level) {
      case DebugLevel.ERROR: return '#EF4444';
      case DebugLevel.WARN: return '#F59E0B';
      case DebugLevel.INFO: return '#10B981';
      case DebugLevel.DEBUG: return '#3B82F6';
      case DebugLevel.TRACE: return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getCategoryColor = (category: DebugCategory) => {
    const colors = {
      [DebugCategory.API]: '#10B981',
      [DebugCategory.USER_INTERACTION]: '#3B82F6',
      [DebugCategory.COMPONENT]: '#8B5CF6',
      [DebugCategory.PERFORMANCE]: '#F59E0B',
      [DebugCategory.ERROR]: '#EF4444',
      [DebugCategory.VALIDATION]: '#F97316',
      [DebugCategory.NAVIGATION]: '#06B6D4',
      [DebugCategory.STORAGE]: '#84CC16'
    };
    return colors[category] || '#6B7280';
  };

  if (!isVisible) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 10000,
          backgroundColor: '#1F2937',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'monospace',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
        onClick={() => onToggle?.(true)}
      >
        🐛 Debug ({logs.length})
      </div>
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '600px',
        height: '400px',
        backgroundColor: '#1F2937',
        color: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: 10000,
        fontFamily: 'monospace',
        fontSize: '11px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #374151',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#111827'
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          {(['logs', 'api', 'performance', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? '#3B82F6' : 'transparent',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
            {logs.length} logs
          </span>
          <button
            onClick={() => onToggle?.(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Filters */}
      {activeTab === 'logs' && (
        <div 
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid #374151',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            backgroundColor: '#111827'
          }}
        >
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(parseInt(e.target.value) as DebugLevel)}
            style={{
              background: '#374151',
              border: 'none',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px'
            }}
          >
            <option value={DebugLevel.ERROR}>Error+</option>
            <option value={DebugLevel.WARN}>Warn+</option>
            <option value={DebugLevel.INFO}>Info+</option>
            <option value={DebugLevel.DEBUG}>Debug+</option>
            <option value={DebugLevel.TRACE}>All</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as DebugCategory | 'ALL')}
            style={{
              background: '#374151',
              border: 'none',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px'
            }}
          >
            <option value="ALL">All Categories</option>
            {Object.values(DebugCategory).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              style={{ margin: 0 }}
            />
            Auto-scroll
          </label>

          <button
            onClick={handleClearLogs}
            style={{
              background: '#EF4444',
              border: 'none',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            Clear
          </button>

          <button
            onClick={handleExportLogs}
            style={{
              background: '#10B981',
              border: 'none',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            Export
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'logs' && (
          <div 
            style={{
              height: '100%',
              overflowY: 'auto',
              padding: '8px'
            }}
          >
            {logs.map((log, index) => (
              <div
                key={log.id}
                style={{
                  marginBottom: '4px',
                  padding: '4px 8px',
                  backgroundColor: index % 2 === 0 ? '#374151' : '#1F2937',
                  borderRadius: '4px',
                  fontSize: '10px',
                  lineHeight: '1.4'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#9CA3AF', minWidth: '60px' }}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span 
                    style={{ 
                      color: getLevelColor(log.level),
                      fontWeight: 'bold',
                      minWidth: '50px'
                    }}
                  >
                    {['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'][log.level] || 'UNKNOWN'}
                  </span>
                  <span 
                    style={{ 
                      color: getCategoryColor(log.category),
                      minWidth: '80px'
                    }}
                  >
                    {log.category}
                  </span>
                  <span style={{ flex: 1 }}>
                    {log.message}
                  </span>
                </div>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div 
                    style={{ 
                      marginTop: '4px',
                      marginLeft: '156px',
                      color: '#9CA3AF',
                      fontSize: '9px'
                    }}
                  >
                    {JSON.stringify(log.metadata, null, 2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'api' && (
          <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF' }}>
            API Call Tracking
            <br />
            <small>Coming soon...</small>
          </div>
        )}

        {activeTab === 'performance' && (
          <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF' }}>
            Performance Metrics
            <br />
            <small>Coming soon...</small>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px' }}>
                Debug Level
              </label>
              <select
                value={frontendDebugLogger.config?.level || DebugLevel.INFO}
                onChange={(e) => {
                  frontendDebugLogger.updateConfig({ level: parseInt(e.target.value) as DebugLevel });
                }}
                style={{
                  background: '#374151',
                  border: 'none',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  width: '100%'
                }}
              >
                <option value={DebugLevel.ERROR}>Error Only</option>
                <option value={DebugLevel.WARN}>Warn and Above</option>
                <option value={DebugLevel.INFO}>Info and Above</option>
                <option value={DebugLevel.DEBUG}>Debug and Above</option>
                <option value={DebugLevel.TRACE}>All Messages</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
                <input
                  type="checkbox"
                  checked={frontendDebugLogger.config?.persistLogs || false}
                  onChange={(e) => {
                    frontendDebugLogger.updateConfig({ persistLogs: e.target.checked });
                  }}
                />
                Persist logs to localStorage
              </label>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
                <input
                  type="checkbox"
                  checked={frontendDebugLogger.config?.apiTracking || false}
                  onChange={(e) => {
                    frontendDebugLogger.updateConfig({ apiTracking: e.target.checked });
                  }}
                />
                Track API calls
              </label>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
                <input
                  type="checkbox"
                  checked={frontendDebugLogger.config?.performanceTracking || false}
                  onChange={(e) => {
                    frontendDebugLogger.updateConfig({ performanceTracking: e.target.checked });
                  }}
                />
                Track performance metrics
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugDashboard;
