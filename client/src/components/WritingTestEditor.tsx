import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';
const WritingTestEditor = () => {
    const { user } = useAuth();
    const [testData, setTestData] = useState<any>({
        title: 'Writing Test - Default',
        timeLimit: 60,
        task1: {
            type: 'chart',
            title: 'Analyze the graph below',
            description: 'Summarize the information by selecting and reporting the main features.',
            imageUrl: '/images/chart.png',
            timeLimit: 20,
            minWords: 150
        },
        task2: {
            type: 'essay',
            question: 'Do you agree or disagree?',
            timeLimit: 40,
            minWords: 250
        }
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchTest();
    }, []);

    const fetchTest = async () => {
        try {
            setLoading(true);
            const baseUrl = import.meta.env?.VITE_API_URL || '${API_BASE_URL}';
            const res = await fetch(`${baseUrl}/api/writing`);
            if (res.ok) {
                const data = await res.json();
                setTestData(data);
            }
        } catch (err) {
            console.error('Error fetching writing test', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const baseUrl = import.meta.env?.VITE_API_URL || '${API_BASE_URL}';
            const res = await fetch(`${baseUrl}/api/writing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify(testData),
            });

            if (res.ok) {
                setMessage('Writing test saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Failed to save test.');
            }
        } catch (err) {
            console.error('Error saving writing test', err);
            setMessage('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Writing Test Editor</h2>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Test'}
                </button>
            </div>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            {loading ? (
                <p>Loading test data...</p>
            ) : (
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded border">
                        <h3 className="text-lg font-semibold mb-4">Task 1: Report/Letter {testData.task1?.type ? `(${testData.task1.type})` : ''}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={testData.task1?.title || ''}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        task1: { ...(testData.task1 || {}), title: e.target.value }
                                    })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Prompt</label>
                                <textarea
                                    value={testData.task1?.description || ''}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        task1: { ...(testData.task1 || {}), description: e.target.value }
                                    })}
                                    className="w-full p-2 border rounded h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (for Academic Task 1 graphs/charts)</label>
                                <input
                                    type="text"
                                    value={testData.task1?.imageUrl || ''}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        task1: { ...(testData.task1 || {}), imageUrl: e.target.value }
                                    })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border">
                        <h3 className="text-lg font-semibold mb-4">Task 2: Essay</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Essay Question / Prompt</label>
                                <textarea
                                    value={testData.task2?.question || ''}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        task2: { ...(testData.task2 || {}), question: e.target.value }
                                    })}
                                    className="w-full p-2 border rounded h-32"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WritingTestEditor;
