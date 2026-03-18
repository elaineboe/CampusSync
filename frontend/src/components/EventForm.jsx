import React, { useState, useEffect } from 'react';

function EventForm({ initialData = null, modules = [], onSubmit, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'lecture',
        location: '',
        start_time: '',
        end_time: '',
        module_id: '' // Kept as string for input, backend can handle empty as null
    });

    useEffect(() => {
        if (initialData) {
            // Format datetime-local strings (YYYY-MM-DDTHH:MM)
            const formatForInput = (dateStr) => {
                if (!dateStr) return '';
                // The database returns 'YYYY-MM-DD HH:MM:SS', javascript input type="datetime-local" needs 'YYYY-MM-DDTHH:MM'
                return dateStr.replace(' ', 'T').slice(0, 16);
            };

            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                event_type: initialData.event_type || 'lecture',
                location: initialData.location || '',
                start_time: formatForInput(initialData.start_time),
                end_time: formatForInput(initialData.end_time),
                module_id: initialData.module_id || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert empty module_id to null for the backend
        const submissionData = { ...formData };
        if (submissionData.module_id === '') {
            submissionData.module_id = null;
        }

        // Format datetime correctly: 'YYYY-MM-DD HH:MM:SS'
        if (submissionData.start_time && submissionData.start_time.includes('T')) {
            submissionData.start_time = submissionData.start_time.replace('T', ' ') + ':00';
        }
        if (submissionData.end_time && submissionData.end_time.includes('T')) {
            submissionData.end_time = submissionData.end_time.replace('T', ' ') + ':00';
        }

        onSubmit(submissionData);
    };

    // Get current local time string for the HTML5 min attribute
    const nowLocalStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    return (
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">EVENT TITLE</label>
                <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="e.g. Introduction to Programming Lecture"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">EVENT TYPE</label>
                    <select
                        name="event_type"
                        className="form-input"
                        value={formData.event_type}
                        onChange={handleChange}
                        style={{ backgroundColor: 'var(--white)', cursor: 'pointer' }}
                        required
                    >
                        <option value="lecture">Lecture</option>
                        <option value="seminar">Seminar</option>
                        <option value="workshop">Workshop</option>
                        <option value="exam">Exam</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">LOCATION</label>
                    <input
                        type="text"
                        name="location"
                        className="form-input"
                        placeholder="e.g. Room 101"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">START TIME</label>
                    <input
                        type="datetime-local"
                        name="start_time"
                        className="form-input"
                        value={formData.start_time}
                        onChange={handleChange}
                        min={initialData ? undefined : nowLocalStr}
                        required
                    />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">END TIME</label>
                    <input
                        type="datetime-local"
                        name="end_time"
                        className="form-input"
                        value={formData.end_time}
                        onChange={handleChange}
                        min={formData.start_time || nowLocalStr}
                        required
                    />
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">ASSIGN TO MODULE</label>
                <select
                    name="module_id"
                    className="form-input"
                    value={formData.module_id}
                    onChange={handleChange}
                    style={{ backgroundColor: 'var(--white)', cursor: 'pointer' }}
                >
                    <option value="">Global Event (All Students)</option>
                    {modules.map(mod => (
                        <option key={mod.id} value={mod.id}>
                            {mod.module_code} - {mod.module_name}
                        </option>
                    ))}
                </select>
                <small style={{ color: 'var(--text-color-light)', marginTop: '0.25rem', display: 'block' }}>
                    If a module is selected, only students enrolled in that module will see this event and receive a notification.
                </small>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">DESCRIPTION</label>
                <textarea
                    name="description"
                    className="form-input"
                    placeholder="Provide event details..."
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    style={{ resize: 'vertical' }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    style={{ padding: '0.5rem 1.5rem' }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                    style={{ padding: '0.5rem 1.5rem' }}
                >
                    {isLoading ? 'Saving...' : (initialData ? 'Update Event' : 'Create Event')}
                </button>
            </div>
        </form>
    );
}

export default EventForm;
