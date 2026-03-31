import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';
import { API_BASE_URL } from '../config';
const SpeakingTestEditor = () => {
    const { user } = useAuth();
    const [testData, setTestData] = useState<any>({
        title: 'Speaking Test - Default',
        parts: [
            {
                title: 'Part 1 - Introduction and Interview',
                duration: '4-5 minutes',
                description: 'General questions about yourself',
                questions: []
            },
            {
                title: 'Part 2 - Individual Long Turn',
                duration: '3-4 minutes',
                description: 'Speak for 1-2 minutes on a given topic',
                questions: []
            },
            {
                title: 'Part 3 - Two-way Discussion',
                duration: '4-5 minutes',
                description: 'Abstract discussion',
                questions: []
            }
        ]
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
            const res = await fetch(`${baseUrl}/api/speaking`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.parts) {
                    setTestData(data);
                }
            }
        } catch (err) {
            console.error('Error fetching speaking test', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const baseUrl = import.meta.env?.VITE_API_URL || '${API_BASE_URL}';
            const res = await fetch(`${baseUrl}/api/speaking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify(testData),
            });

            if (res.ok) {
                setMessage('Speaking test saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Failed to save test.');
            }
        } catch (err) {
            console.error('Error saving speaking test', err);
            setMessage('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const handleQuestionsChange = (partIndex: number, text: string) => {
        const questionsArray = text.split('\n').filter(q => q.trim().length > 0);
        const newParts = [...(testData.parts || [])];
        newParts[partIndex] = { ...newParts[partIndex], questions: questionsArray };
        setTestData({ ...testData, parts: newParts });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Speaking Test Editor</h2>
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
                    {testData.parts?.map((part: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded border">
                            <h3 className="text-lg font-semibold mb-1">{part.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{part.description} • {part.duration}</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Questions (One question per line)
                                </label>
                                <textarea
                                    value={part.questions?.join('\n') || ''}
                                    onChange={(e) => handleQuestionsChange(idx, e.target.value)}
                                    className="w-full p-3 border rounded font-medium text-gray-700 h-40 leading-relaxed"
                                    placeholder="Enter questions here..."
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SpeakingTestEditor;
