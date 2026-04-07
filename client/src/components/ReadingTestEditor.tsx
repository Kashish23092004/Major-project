import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
const ReadingTestEditor = () => {
    const { user } = useAuth();
    const [testData, setTestData] = useState<any>({
        title: 'Reading Test - Default',
        timeLimit: 60,
        passages: [],
        questionTexts: {},
        questionOptions: {},
        correctAnswers: [],
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
            const baseUrl = import.meta.env?.VITE_API_URL || `${API_BASE_URL}`;
            const res = await fetch(`${baseUrl}/api/reading`);
            if (res.ok) {
                const data = await res.json();
                setTestData(data);
            }
        } catch (err) {
            console.error('Error fetching reading test', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const baseUrl = import.meta.env?.VITE_API_URL || `${API_BASE_URL}`;
            const res = await fetch(`${baseUrl}/api/reading`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify(testData),
            });

            if (res.ok) {
                setMessage('Reading test saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Failed to save test.');
            }
        } catch (err) {
            console.error('Error saving reading test', err);
            setMessage('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    // Utility to handle passage changes
    const handlePassageChange = (index: number, field: string, value: string) => {
        const newPassages = [...(testData.passages || [])];
        newPassages[index] = { ...newPassages[index], [field]: value };
        setTestData({ ...testData, passages: newPassages });
    };

    const addPassage = () => {
        setTestData({
            ...testData,
            passages: [...(testData.passages || []), { title: 'New Passage', text: '', questions: 0 }],
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Reading Test Editor</h2>
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
                        <h3 className="text-lg font-semibold mb-4">General Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                                <input
                                    type="text"
                                    value={testData.title || ''}
                                    onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (mins)</label>
                                <input
                                    type="number"
                                    value={testData.timeLimit || 60}
                                    onChange={(e) => setTestData({ ...testData, timeLimit: Number(e.target.value) })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Passages</h3>
                            <button onClick={addPassage} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                                <Plus className="w-4 h-4 mr-1" /> Add Passage
                            </button>
                        </div>

                        {testData.passages?.map((passage: any, idx: number) => (
                            <div key={idx} className="mb-6 p-4 bg-white border rounded shadow-sm">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-semibold">Passage {idx + 1}</h4>
                                    <button
                                        onClick={() => {
                                            const newPassages = testData.passages.filter((_: any, i: number) => i !== idx);
                                            setTestData({ ...testData, passages: newPassages });
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={passage.title}
                                        onChange={(e) => handlePassageChange(idx, 'title', e.target.value)}
                                        placeholder="Passage Title"
                                        className="w-full p-2 border rounded font-medium"
                                    />
                                    <textarea
                                        value={passage.text}
                                        onChange={(e) => handlePassageChange(idx, 'text', e.target.value)}
                                        placeholder="Passage Content..."
                                        className="w-full p-2 border rounded h-32"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <label className="text-sm font-medium text-gray-700">Number of Questions:</label>
                                        <input
                                            type="number"
                                            value={passage.questions}
                                            onChange={(e) => handlePassageChange(idx, 'questions', e.target.value)}
                                            className="w-24 p-1 border rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded border">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">Note</h3>
                        <p className="text-sm text-gray-600">
                            Editing individual question texts, options, and correct answers directly via this UI is a complex feature.
                            For this simplified CMS MVP, we focus on bulk updating passages. The current API supports POSTing the full nested JSON structure.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadingTestEditor;
