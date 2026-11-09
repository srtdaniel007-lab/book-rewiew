import React, { useState, useEffect } from 'react';
import { X, Database, RefreshCw, Table, Server } from 'lucide-react';
import { api } from '../api';

export default function DatabaseViewerModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [activeTable, setActiveTable] = useState('users');
  const [loading, setLoading] = useState(false);

  const fetchDbData = async () => {
    try {
      setLoading(true);
      const res = await api.getDatabaseTables();
      setData(res);
    } catch (err) {
      console.error('Error fetching database tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDbData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTableData = data?.tables?.[activeTable];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '920px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Database size={22} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#0f172a' }}>
                PostgreSQL Live Table Inspector
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Server size={13} /> Database: <strong>book_review</strong>
                </span>
                <span>• Port: <strong>5432</strong></span>
                <span>• Engine: <strong>PostgreSQL 18</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={fetchDbData}
            className="nav-btn"
            style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh SQL'}</span>
          </button>
        </div>

        {/* Table Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '16px' }}>
          {['users', 'shelved_books', 'reviews'].map((tbl) => (
            <button
              key={tbl}
              onClick={() => setActiveTable(tbl)}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                color: activeTable === tbl ? '#4f46e5' : '#64748b',
                borderBottom: activeTable === tbl ? '3px solid #4f46e5' : '3px solid transparent',
                marginBottom: '-2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Table size={15} />
              <span>public.{tbl}</span>
              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '999px' }}>
                {data?.tables?.[tbl]?.count || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Table View */}
        {loading && !data ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Querying PostgreSQL server...
          </div>
        ) : currentTableData ? (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>SELECT * FROM <code>public.{activeTable}</code></span>
              <span>Total rows: <strong>{currentTableData.count}</strong></span>
            </div>

            {currentTableData.count === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                No records yet in table <code>{activeTable}</code>. Register a user or add a review to see rows populate!
              </div>
            ) : (
              <div className="sql-table-container">
                <table className="sql-table">
                  <thead>
                    <tr>
                      {currentTableData.columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTableData.rows.map((row, idx) => (
                      <tr key={idx}>
                        {currentTableData.columns.map((col) => (
                          <td key={col}>
                            {row[col] !== null && row[col] !== undefined
                              ? String(row[col])
                              : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

