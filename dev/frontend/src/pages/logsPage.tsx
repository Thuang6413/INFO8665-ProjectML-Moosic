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
      case 'INFO': return 'bg-blue-900 text-blue-200';
      case 'ERROR': return 'bg-red-900 text-red-200';
      case 'WARNING': return 'bg-yellow-900 text-yellow-200';
      case 'DEBUG': return 'bg-green-900 text-green-200';
      case 'CRITICAL': return 'bg-purple-900 text-purple-200';
      default: return 'bg-gray-700 text-gray-200';
    }
  };

  const formatMessage = (message: string) => {
    try {
      if (message.startsWith('{') || message.startsWith('[')) {
        const jsonObj = JSON.parse(message.replace(/'/g, '"'));
        return (
          <pre className="bg-bgSecondary p-2 rounded text-xs overflow-x-auto text-textPrimary">
            {JSON.stringify(jsonObj, null, 2)}
          </pre>
        );
      }
    } catch {
      // Not JSON
    }
    return message;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.fullMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const logLevels = ['ALL', 'INFO', 'ERROR', 'WARNING', 'DEBUG', 'CRITICAL', 'UNKNOWN'];

  if (loading) return <div className="p-6 text-textSecondary">Loading logs...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="p-6 bg-bgPrimary text-textPrimary min-h-screen font-sans">
      <h1 className="text-3xl font-logo text-accent mb-6">Application Log Viewer</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-textSecondary mb-1">Search Logs</label>
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full p-2 bg-bgSecondary border border-gray-700 rounded focus:border-accent focus:ring focus:ring-accent/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-textSecondary mb-1">Log Level</label>
          <select
            className="w-full p-2 bg-bgSecondary border border-gray-700 rounded focus:border-accent focus:ring focus:ring-accent/20"
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
      <div className="overflow-auto border border-gray-700 rounded-lg shadow-sm bg-bgSecondary">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Logger</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Level</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Message</th>
            </tr>
          </thead>
          <tbody className="bg-bgSecondary divide-y divide-gray-700">
            {filteredLogs.map((log, index) => (
              <tr key={index} className="hover:bg-gray-800">
                <td className="px-4 py-2 whitespace-nowrap text-sm">{log.date}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{log.time}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{log.logger}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm max-w-xs overflow-x-auto">
                  {formatMessage(log.message)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-textSecondary">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
    </div>
  );
}
