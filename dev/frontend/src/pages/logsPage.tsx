import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LogLine {
  date: string;
  time: string;
  logger: string;
  level: string;
  message: string;
  fullMessage: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  useEffect(() => {
    axios.get('http://localhost:5000/api/v1/log/')
      .then((res) => {
        const rawLogs: string[] = res.data.logs;

        const parsedLogs = rawLogs.map((line: string): LogLine => {
          // Enhanced regex to capture all components
          const match = line.trim().match(
  /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2},\d{3}) - ([^-]+) - ([A-Z]+) - (.+)$/
);  

          if (match) {
            const [, date, time, logger, level, message] = match;
            return {
              date,
              time,
              logger,
              level: level.toUpperCase(),
              message: message.trim(),
              fullMessage: line.trim()
            };
          } else {
            return {
              date: '-',
              time: '-',
              logger: '-',
              level: 'UNKNOWN',
              message: line.trim(),
              fullMessage: line.trim()
            };
          }
        });

        setLogs(parsedLogs);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch logs');
        setLoading(false);
      });
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'DEBUG': return 'bg-green-100 text-green-800';
      case 'CRITICAL': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMessage = (message: string) => {
    try {
      // Try to parse as JSON if it looks like JSON
      if (message.startsWith('{') || message.startsWith('[')) {
        const jsonObj = JSON.parse(message.replace(/'/g, '"'));
        return (
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify(jsonObj, null, 2)}
          </pre>
        );
      }
    } catch (e) {
      // Not JSON, continue
    }
    return message;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.fullMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const logLevels = ['ALL', 'INFO', 'ERROR', 'WARNING', 'DEBUG', 'CRITICAL', 'UNKNOWN'];

  if (loading) return <div className="p-6 text-gray-600">Loading logs...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Application Log Viewer</h1>
      
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Logs</label>
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full p-2 border border-gray-300 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {logLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="overflow-auto border border-gray-300 rounded-lg shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logger</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{log.date}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{log.time}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{log.logger}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 max-w-xs overflow-x-auto">
                  {formatMessage(log.message)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
    </div>
  );
}