import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import BuilderForm from './BuilderForm';
import RSVPList from './RSVPList';
import { Button } from './ui/button';
import { ExternalLink, LogOut } from 'lucide-react';
import type { WeddingSite } from '../lib/validations';
import { getWeddingTemplate } from '../lib/templates';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'builder' | 'rsvps'>(
    'builder',
  );
  const [weddingSite, setWeddingSite] = useState<WeddingSite | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeddingSite();
  }, []);

  const fetchWeddingSite = async () => {
    try {
      const response = await fetch('/api/wedding/site');
      if (response.ok) {
        const data = await response.json();
        setWeddingSite(data.weddingSite);
      }
    } catch (error) {
      console.error('Failed to fetch wedding site:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleSave = (updatedSite: WeddingSite) => {
    setWeddingSite(updatedSite);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="wedding-builder min-h-screen min-w-0 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 flex-col justify-center gap-2 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                Wedding Builder
              </h1>
              {weddingSite?.slug && (
                <p className="truncate text-xs text-gray-500 sm:text-sm">
                  invitation.fgdev.tech/{weddingSite.slug}
                </p>
              )}
              {weddingSite && (
                <p className="truncate text-[11px] text-gray-400 sm:text-xs">
                  Template: {getWeddingTemplate(weddingSite.templateId).name}
                </p>
              )}
            </div>
            <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
              {weddingSite?.isPublished && weddingSite.slug && (
                <Button asChild variant="outline" className="min-h-10 flex-1 sm:flex-none">
                  <a
                    href={`/${weddingSite.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Preview published wedding website"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="min-h-10 flex-1 sm:flex-none"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex min-w-max space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('builder')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'builder'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Builder
            </button>
            <button
              onClick={() => setActiveTab('rsvps')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rsvps'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              RSVP List
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto min-w-0 max-w-7xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        {activeTab === 'builder' ? (
          <BuilderForm
            initialData={weddingSite ?? undefined}
            onSave={handleSave}
          />
        ) : (
          <RSVPList siteId={weddingSite?.id} />
        )}
      </main>
    </div>
  );
}
