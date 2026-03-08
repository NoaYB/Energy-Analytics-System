import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.scss';

// Types for components
interface AbnormalDevice {
    deviceId: string;
    recentAvg: number;
    historicalAvg: number;
    temperatureStatus: string;
}

// Simulated mocked abnormal devices list that would arrive from the backend.
// Note: In a real-world scenario, we would use Server-Side Pagination with limit queries.
// For this interactive mock, we generate 25 items and paginate locally (Client-Side) to demonstrate UI capabilities.
const generateMockDevices = (): AbnormalDevice[] => {
    const devices: AbnormalDevice[] = [];

    for (let i = 1; i <= 25; i++) {
        const historicalAvg = parseFloat((Math.random() * 8 + 2).toFixed(2));
        const recentAvg = parseFloat((historicalAvg * (1.2 + Math.random() * 0.8)).toFixed(2));

        devices.push({
            deviceId: `DEV-${i.toString().padStart(3, '0')}`,
            recentAvg,
            historicalAvg,
            temperatureStatus: Math.random() > 0.5 ? 'High' : 'Normal',
        });
    }

    return devices;
};

const INITIAL_DEVICES: AbnormalDevice[] = generateMockDevices();
const ITEMS_PER_PAGE = 10;

const AbnormalDevicesDashboard: React.FC = () => {
    const devices = INITIAL_DEVICES;
    const [insights, setInsights] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const timeoutRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    // Cleanup timeouts on unmount to prevent state updates on unmounted component
    useEffect(() => {
        return () => {
            Object.values(timeoutRefs.current).forEach(clearTimeout);
        };
    }, []);

    const totalPages = Math.ceil(devices.length / ITEMS_PER_PAGE);

    // Calculate current items for pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentDevices = devices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const generateInsight = (device: AbnormalDevice) => {
        // Set loading state explicitly to this single device ID
        setLoading(prev => ({ ...prev, [device.deviceId]: true }));

        const increasePercent = ((device.recentAvg - device.historicalAvg) / device.historicalAvg) * 100;

        // Simulate an asynchronous API call (e.g., retrieving prompt generation from backend LLM provider)
        // using setTimeout for demonstration purposes
        const timeoutId = setTimeout(() => {
            const simulatedInsight = device.temperatureStatus === 'High'
                ? `AI Insight: Device ${device.deviceId} shows a ${increasePercent.toFixed(0)}% change over its historical average while temperature is high.`
                : `AI Insight: Device ${device.deviceId} shows a ${increasePercent.toFixed(0)}% change over its historical average while temperature remains normal.`;

            setInsights(prev => ({ ...prev, [device.deviceId]: simulatedInsight }));
            setLoading(prev => ({ ...prev, [device.deviceId]: false }));

            // Clean up the ref after completion
            delete timeoutRefs.current[device.deviceId];
        }, 900);

        timeoutRefs.current[device.deviceId] = timeoutId;
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Abnormal Devices Monitoring</h2>
                <p>Monitor and generate real-time AI insights</p>
                <p className="pagination-info">Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, devices.length)} of {devices.length} devices</p>
            </header>

            <div className="devices-list">
                {currentDevices.map((device, index) => (
                    <div key={`${device.deviceId}-${index}`} className="device-card">
                        <div className="device-card-header">
                            <h3>{device.deviceId}</h3>
                            <span className="badge warning">Warning </span>
                        </div>
                        <div className="device-stats">
                            <p><strong>Recent Avg (24h):</strong> {device.recentAvg.toFixed(2)}A</p>
                            <p><strong>Historical Avg:</strong> {device.historicalAvg.toFixed(2)}A</p>
                            <p><strong>Temperature Status:</strong> {device.temperatureStatus}</p>
                        </div>

                        <div className="actions">
                            <button
                                className={`btn-ai ${loading[device.deviceId] ? 'loading' : ''}`}
                                onClick={() => generateInsight(device)}
                                disabled={loading[device.deviceId]}
                            >
                                {loading[device.deviceId] ? '✨ Generating...' : '✨ Generate AI Insights'}
                            </button>
                        </div>

                        {insights[device.deviceId] && (
                            <div className="ai-insight-box">
                                <h4 className="insight-title">AI Diagnosis</h4>
                                <p>{insights[device.deviceId]}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AbnormalDevicesDashboard;
