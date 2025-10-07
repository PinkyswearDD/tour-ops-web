'use client';

import { useState, useEffect } from 'react';
import { Show, ShowStatus } from '@/types';
import { getShows } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import ContractUpload from '@/components/ContractUpload';
import ShowDetailDrawer from '@/components/ShowDetailDrawer';

const STATUS_OPTIONS: ShowStatus[] = ['Confirmed', 'Pending', 'Hold'];

const STATUS_COLORS = {
  Confirmed: 'bg-green-50 text-green-700 border-green-200',
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Hold: 'bg-blue-50 text-blue-700 border-blue-200',
  Block: 'bg-purple-50 text-purple-700 border-purple-200',
  Off: 'bg-gray-50 text-gray-700 border-gray-200',
  'Public Appearance': 'bg-pink-50 text-pink-700 border-pink-200',
  Tentative: 'bg-orange-50 text-orange-700 border-orange-200',
};

export default function ItineraryPage() {
  const [selectedStatuses, setSelectedStatuses] = useState<ShowStatus[]>(STATUS_OPTIONS);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadShows();
  }, []);

  async function loadShows() {
    try {
      const data = await getShows('bryan-martin');
      setShows(data);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedDatabase() {
    setLoading(true);
    await seedDatabase();
    await loadShows();
  }

  const filteredShows = shows.filter((show) => selectedStatuses.includes(show.status));

  const toggleStatus = (status: ShowStatus) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const handleShowClick = (show: Show) => {
    setSelectedShow(show);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedShow(null), 300);
  };

  const handleDrawerUpdate = async () => {
    await loadShows();
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '—';
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading shows...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-5">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Play Dead Management - Bryan Martin</h1>
          <div className="flex gap-4 items-center">
            {shows.length === 0 && (
              <button
                onClick={handleSeedDatabase}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Seed Database
              </button>
            )}
            <div className="text-sm text-gray-600 font-medium">
              {filteredShows.length} of {shows.length} shows
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 pt-6">
        <ContractUpload onComplete={loadShows} />
      </div>

      <div className="bg-white border-b px-8 py-4 mt-6">
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                selectedStatuses.includes(status)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <main className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredShows.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No shows found matching your filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Guarantee
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredShows.map((show) => (
                    <tr 
                      key={show.id} 
                      onClick={() => handleShowClick(show)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(show.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {show.location.city}
                        </div>
                        <div className="text-xs text-gray-500">
                          {show.location.state}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {show.venue.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {show.venue.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {show.buyer?.company || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">
                          {show.venue.capacity?.toLocaleString() || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(show.financials.guarantee)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[show.status]}`}>
                          {show.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Show Detail Drawer */}
      <ShowDetailDrawer
        show={selectedShow}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onUpdate={handleDrawerUpdate}
      />
    </div>
  );
}