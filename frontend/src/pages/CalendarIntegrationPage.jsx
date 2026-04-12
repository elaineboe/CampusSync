import React from 'react';

function CalendarIntegrationPage() {
    return (
        <div className="page-container" style={{ padding: '2rem', backgroundColor: '#fff', minHeight: '100vh', color: '#000' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '3rem', letterSpacing: '0.05em' }}>
                Calendar Integration
            </h1>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                    Export Calendar
                </h2>
                <button style={{ backgroundColor: '#000', color: '#fff', padding: '1rem 2rem', border: 'none', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Export Calendar
                </button>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                    Import Calendar
                </h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
                    <div style={{ flexGrow: 1, border: '2px dashed #000', padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                        File Upload Placeholder
                    </div>
                    <button style={{ backgroundColor: '#fff', color: '#000', border: '1px solid #000', padding: '0 2rem', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center' }}>
                        Import Calendar
                    </button>
                </div>
            </section>

            <section>
                <h2 style={{ fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                    Integration Logs
                </h2>
                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #000', padding: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                <th style={{ border: '1px solid #000', padding: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                                <th style={{ border: '1px solid #000', padding: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>12/05/2024</td>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>EXPORT INITIATED</td>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>SUCCESSFUL</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>10/05/2024</td>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>IMPORT INITIATED</td>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>SUCCESSFUL</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>08/05/2024</td>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>EXPORT INITIATED</td>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>SUCCESSFUL</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>05/05/2024</td>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>SYNC ATTEMPT</td>
                                <td style={{ border: '1px solid #000', padding: '1rem' }}>SUCCESSFUL</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default CalendarIntegrationPage;
