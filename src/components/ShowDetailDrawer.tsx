'use client';

import { useState } from 'react';
import { Show } from '@/types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ShowDetailDrawerProps {
  show: Show | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ShowDetailDrawer({ show, isOpen, onClose, onUpdate }: ShowDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedShow, setEditedShow] = useState<Show | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!show) return null;

  const currentShow = isEditing && editedShow ? editedShow : show;

  const handleEdit = () => {
    setEditedShow({ ...show });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedShow(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedShow) return;
    
    setSaving(true);
    try {
      const showRef = doc(db, 'shows', show.id);
      await updateDoc(showRef, {
        status: editedShow.status,
        doorTime: editedShow.doorTime || null,
        setTime: editedShow.setTime || null,
        curfew: editedShow.curfew || null,
        notes: editedShow.notes || null,
        'venue.phone': editedShow.venue.phone || null,
        'venue.website': editedShow.venue.website || null,
        'buyer.signatoryName': editedShow.buyer?.signatoryName || null,
        'buyer.signatoryPhone': editedShow.buyer?.signatoryPhone || null,
        'buyer.signatoryEmail': editedShow.buyer?.signatoryEmail || null,
        'financials.bonus': editedShow.financials.bonus || null,
        'financials.dealNotes': editedShow.financials.dealNotes || null,
        updatedAt: new Date(),
      });
      
      setIsEditing(false);
      setEditedShow(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating show:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this show? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'shows', show.id));
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting show:', error);
      alert('Failed to delete show');
    } finally {
      setDeleting(false);
    }
  };

  const updateField = (path: string, value: any) => {
    if (!editedShow) return;
    
    const pathParts = path.split('.');
    const updated = { ...editedShow };
    
    if (pathParts.length === 1) {
      (updated as any)[pathParts[0]] = value;
    } else if (pathParts.length === 2) {
      (updated as any)[pathParts[0]] = {
        ...(updated as any)[pathParts[0]],
        [pathParts[1]]: value,
      };
    }
    
    setEditedShow(updated);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gray-900 text-white px-6 py-5 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{currentShow.venue.name}</h2>
              <p className="text-gray-300 mt-1">{formatDate(currentShow.date)}</p>
              <p className="text-gray-400 text-sm mt-1">
                {currentShow.location.city}, {currentShow.location.state}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status & Actions */}
            <div className="flex justify-between items-center">
              <div>
                {isEditing ? (
                  <select
                    value={currentShow.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="px-3 py-1 border rounded-lg text-sm font-medium"
                  >
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Hold</option>
                    <option>Block</option>
                    <option>Off</option>
                    <option>Tentative</option>
                  </select>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                    {currentShow.status}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Show Times */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-semibold text-gray-900 mb-3">Show Times</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Door Time</label>
                  {isEditing ? (
                    <input
                      type="time"
                      value={currentShow.doorTime || ''}
                      onChange={(e) => updateField('doorTime', e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium">{currentShow.doorTime || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Set Time</label>
                  {isEditing ? (
                    <input
                      type="time"
                      value={currentShow.setTime || ''}
                      onChange={(e) => updateField('setTime', e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium">{currentShow.setTime || '—'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Curfew</label>
                  {isEditing ? (
                    <input
                      type="time"
                      value={currentShow.curfew || ''}
                      onChange={(e) => updateField('curfew', e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium">{currentShow.curfew || '—'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Venue Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Venue Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Address</span>
                  <span className="font-medium text-right">{currentShow.venue.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium">{currentShow.venue.capacity?.toLocaleString() || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={currentShow.venue.phone || ''}
                      onChange={(e) => updateField('venue.phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="px-2 py-1 border rounded text-sm w-40"
                    />
                  ) : (
                    <span className="font-medium">{currentShow.venue.phone || '—'}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Website</span>
                  {isEditing ? (
                    <input
                      type="url"
                      value={currentShow.venue.website || ''}
                      onChange={(e) => updateField('venue.website', e.target.value)}
                      placeholder="https://..."
                      className="px-2 py-1 border rounded text-sm w-40"
                    />
                  ) : (
                    <span className="font-medium">
                      {currentShow.venue.website ? (
                        <a href={currentShow.venue.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {currentShow.venue.website}
                        </a>
                      ) : '—'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Financial Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Guarantee</span>
                  <span className="font-bold text-lg">${currentShow.financials.guarantee?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bonus Structure</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentShow.financials.bonus || ''}
                      onChange={(e) => updateField('financials.bonus', e.target.value)}
                      placeholder="85/15 split after $10k"
                      className="px-2 py-1 border rounded text-sm w-48"
                    />
                  ) : (
                    <span className="font-medium">{currentShow.financials.bonus || '—'}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency</span>
                  <span className="font-medium">{currentShow.financials.currency}</span>
                </div>
              </div>
              {isEditing ? (
                <div className="mt-3">
                  <label className="text-xs text-gray-600 block mb-1">Deal Notes</label>
                  <textarea
                    value={currentShow.financials.dealNotes || ''}
                    onChange={(e) => updateField('financials.dealNotes', e.target.value)}
                    placeholder="Additional deal terms..."
                    className="w-full px-3 py-2 border rounded text-sm"
                    rows={2}
                  />
                </div>
              ) : currentShow.financials.dealNotes ? (
                <div className="mt-3 text-xs text-gray-700">
                  <strong>Deal Notes:</strong> {currentShow.financials.dealNotes}
                </div>
              ) : null}
            </div>

            {/* Buyer Information */}
            {currentShow.buyer && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Buyer Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company</span>
                    <span className="font-medium">{currentShow.buyer.company}</span>
                  </div>
                  {isEditing || currentShow.buyer.signatoryName ? (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Name</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={currentShow.buyer.signatoryName || ''}
                          onChange={(e) => updateField('buyer.signatoryName', e.target.value)}
                          placeholder="John Smith"
                          className="px-2 py-1 border rounded text-sm w-48"
                        />
                      ) : (
                        <span className="font-medium">{currentShow.buyer.signatoryName}</span>
                      )}
                    </div>
                  ) : null}
                  {isEditing || currentShow.buyer.signatoryPhone ? (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone</span>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={currentShow.buyer.signatoryPhone || ''}
                          onChange={(e) => updateField('buyer.signatoryPhone', e.target.value)}
                          placeholder="(555) 123-4567"
                          className="px-2 py-1 border rounded text-sm w-48"
                        />
                      ) : (
                        <span className="font-medium">{currentShow.buyer.signatoryPhone}</span>
                      )}
                    </div>
                  ) : null}
                  {isEditing || currentShow.buyer.signatoryEmail ? (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email</span>
                      {isEditing ? (
                        <input
                          type="email"
                          value={currentShow.buyer.signatoryEmail || ''}
                          onChange={(e) => updateField('buyer.signatoryEmail', e.target.value)}
                          placeholder="contact@buyer.com"
                          className="px-2 py-1 border rounded text-sm w-48"
                        />
                      ) : (
                        <a href={`mailto:${currentShow.buyer.signatoryEmail}`} className="font-medium text-blue-600 hover:underline">
                          {currentShow.buyer.signatoryEmail}
                        </a>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Production Crew */}
            {currentShow.production && currentShow.production.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Production Crew</h3>
                <div className="space-y-2">
                  {currentShow.production.map((crew, idx) => (
                    <div key={idx} className="flex justify-between text-sm bg-gray-50 p-3 rounded border">
                      <div>
                        <div className="font-medium">{crew.name}</div>
                        <div className="text-xs text-gray-600">{crew.role}</div>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        {crew.phone && <div>{crew.phone}</div>}
                        {crew.email && <div>{crew.email}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
              {isEditing ? (
                <textarea
                  value={currentShow.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Add any additional notes about this show..."
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {currentShow.notes || 'No notes added yet.'}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
              {currentShow.attachments.length > 0 ? (
                <div className="space-y-2">
                  {currentShow.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border text-sm">
                      <div>
                        <div className="font-medium">{attachment.fileName}</div>
                        <div className="text-xs text-gray-600">{attachment.type}</div>
                      </div>
                      <button className="text-blue-600 hover:underline text-sm">Download</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No attachments uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}