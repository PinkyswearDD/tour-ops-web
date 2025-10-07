'use client';

import { useState } from 'react';
import { addShow } from '@/lib/db';

interface ExtractedData {
  date: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueState: string;
  venueCountry: string;
  venueCapacity: number | null;
  guarantee: number | null;
  currency: string;
  buyerCompany: string;
  status: string;
}

export default function ContractUpload({ onComplete }: { onComplete: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState('');

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-contract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Extraction failed');
      }

      const data = await response.json();
      setExtractedData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to extract contract data. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveShow() {
    if (!extractedData) return;

    setUploading(true);
    try {
      await addShow({
        orgId: 'play-dead-mgmt',
        tourId: 'fall-2025',
        artistId: 'bryan-martin',
        status: extractedData.status as any,
        date: new Date(extractedData.date),
        location: {
          city: extractedData.venueCity,
          state: extractedData.venueState,
          country: extractedData.venueCountry || 'USA',
        },
        venue: {
          name: extractedData.venueName,
          address: extractedData.venueAddress,
          capacity: extractedData.venueCapacity || undefined,
        },
        financials: {
          guarantee: extractedData.guarantee || undefined,
          currency: extractedData.currency || 'USD',
        },
        buyer: {
          company: extractedData.buyerCompany,
        },
        production: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setExtractedData(null);
      onComplete();
    } catch (err) {
      setError('Failed to save show');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-xl font-bold mb-4">AI Contract Upload</h2>
      <p className="text-sm text-gray-600 mb-4">Upload a contract PDF and AI will extract all the show details automatically.</p>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:font-medium cursor-pointer"
      />

      {uploading && (
        <div className="mt-4 flex items-center gap-2 text-gray-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Processing contract with AI...
        </div>
      )}
      
      {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

      {extractedData && (
        <div className="mt-6 space-y-4">
          <h3 className="font-bold text-lg">AI Extracted Data - Review & Save</h3>
          <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded bg-green-50 border-green-200">
            <div><strong>Venue:</strong> {extractedData.venueName}</div>
            <div><strong>Date:</strong> {extractedData.date}</div>
            <div><strong>Location:</strong> {extractedData.venueCity}, {extractedData.venueState}</div>
            <div><strong>Capacity:</strong> {extractedData.venueCapacity || 'N/A'}</div>
            <div><strong>Guarantee:</strong> ${extractedData.guarantee?.toLocaleString() || 'N/A'}</div>
            <div><strong>Buyer:</strong> {extractedData.buyerCompany}</div>
            <div><strong>Status:</strong> {extractedData.status}</div>
          </div>
          <button
            onClick={handleSaveShow}
            disabled={uploading}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-semibold disabled:opacity-50"
          >
            Save Show to Database
          </button>
        </div>
      )}
    </div>
  );
}