import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface ManagedWish {
  id: string;
  fullName: string;
  message: string;
  isApproved: boolean;
  createdAt: string;
}

interface WeddingWishesManagerProps {
  enabled: boolean;
  hasSavedSite: boolean;
}

function formatWishDate(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function WeddingWishesManager({
  enabled,
  hasSavedSite,
}: WeddingWishesManagerProps) {
  const [wishes, setWishes] = useState<ManagedWish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadWishes = useCallback(async () => {
    if (!enabled || !hasSavedSite) {
      setWishes([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/wishes/manage');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ucapan gagal dimuat');
      }

      setWishes(data.wishes || []);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Ucapan gagal dimuat';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, hasSavedSite]);

  useEffect(() => {
    void loadWishes();
  }, [loadWishes]);

  const deleteWish = async (wish: ManagedWish) => {
    if (
      !window.confirm(
        `Hapus ucapan dari ${wish.fullName}? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    setDeletingId(wish.id);
    setError('');

    try {
      const response = await fetch('/api/wishes/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: wish.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ucapan gagal dihapus');
      }

      setWishes((current) => current.filter((item) => item.id !== wish.id));
      toast.success('Ucapan berhasil dihapus.');
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : 'Ucapan gagal dihapus';
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!enabled) return null;

  return (
    <div className="space-y-3 rounded-md border bg-muted/40 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-medium">Moderasi wedding wishes</h4>
          <p className="text-xs text-muted-foreground">
            Hapus ucapan tamu yang tidak pantas. Penghapusan berlaku langsung
            di halaman undangan.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadWishes()}
          disabled={isLoading || !hasSavedSite}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Muat ulang
        </Button>
      </div>

      {!hasSavedSite ? (
        <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          Simpan draft terlebih dahulu untuk melihat dan mengelola ucapan tamu.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat ucapan...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : wishes.length === 0 ? (
        <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          Belum ada ucapan dari tamu.
        </p>
      ) : (
        <div
          className="max-h-80 space-y-3 overflow-y-auto pr-1"
          aria-label="Daftar wedding wishes"
        >
          {wishes.map((wish) => (
            <article
              key={wish.id}
              className="rounded-md border bg-background p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {wish.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatWishDate(wish.createdAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => void deleteWish(wish)}
                  disabled={deletingId === wish.id}
                  aria-label={`Hapus ucapan dari ${wish.fullName}`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Hapus</span>
                </Button>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {wish.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
