'use client';

/**
 * Manage Data Page
 * Self-service data export and account deletion
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, AlertTriangle, CheckCircle, Loader2, Shield } from 'lucide-react';
import type { DataExport, DeletionRequest } from '@/types/database';

export default function ManageDataPage() {
  return (
    <AuthGuard>
      <ManageDataContent />
    </AuthGuard>
  );
}

function ManageDataContent() {
  const router = useRouter();
  const [exportStatus, setExportStatus] = useState<DataExport | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<DeletionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Re-auth modal state
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthAction, setReauthAction] = useState<'export' | 'delete' | null>(null);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  useEffect(() => {
    loadStatus();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    try {
      const [exportRes, deleteRes] = await Promise.all([
        fetch('/api/data/export/status'),
        fetch('/api/data/delete/status'),
      ]);

      if (exportRes.ok) {
        const exportData = await exportRes.json();
        setExportStatus(exportData.export);
      }

      if (deleteRes.ok) {
        const deleteData = await deleteRes.json();
        setDeleteStatus(deleteData.request);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleExportClick() {
    setReauthAction('export');
    setShowReauthModal(true);
  }

  function handleDeleteClick() {
    setReauthAction('delete');
    setShowReauthModal(true);
  }

  async function handleReauthSuccess() {
    setShowReauthModal(false);
    if (reauthAction === 'export') {
      await requestExport();
    } else if (reauthAction === 'delete') {
      setShowDeleteModal(true);
    }
    setReauthAction(null);
  }

  async function requestExport() {
    setError(null);
    try {
      const response = await fetch('/api/data/export/request', {
        method: 'POST',
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to request export');
      }

      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request export');
    }
  }

  async function handleDownload() {
    if (!exportStatus) return;

    try {
      const response = await fetch(`/api/data/export/download?exportId=${exportStatus.id}`);
      const result = await response.json();

      if (!result.ok || !result.url) {
        throw new Error(result.error || 'Failed to get download URL');
      }

      // Open download URL
      window.open(result.url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download export');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Your Data</h1>
          <p className="text-muted-foreground">
            Export your data or delete your account. These actions require re-authentication.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {error}
          </div>
        )}

        {/* Export Data Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Export My Data</h2>
              <p className="text-muted-foreground mb-4">
                Download all your data in JSON format, including conversations, summaries, and settings.
                The download link is valid for 24 hours.
              </p>

              {exportStatus && (
                <ExportStatusCard
                  status={exportStatus}
                  onDownload={handleDownload}
                  onRequestNew={handleExportClick}
                />
              )}

              {!exportStatus && (
                <Button onClick={handleExportClick}>
                  <Download className="mr-2 h-4 w-4" />
                  Request Data Export
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Delete Account Section */}
        <Card className="p-6 border-red-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-red-900">Delete My Account</h2>
              <p className="text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>

              {deleteStatus && deleteStatus.status !== 'completed' && (
                <DeleteStatusCard status={deleteStatus} />
              )}

              {(!deleteStatus || deleteStatus.status === 'completed') && (
                <Button variant="destructive" onClick={handleDeleteClick}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Re-authentication Modal */}
        {showReauthModal && (
          <ReauthModal
            onSuccess={handleReauthSuccess}
            onCancel={() => {
              setShowReauthModal(false);
              setReauthAction(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <DeleteConfirmModal
            onConfirm={async (reason) => {
              try {
                const response = await fetch('/api/data/delete/request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    reason,
                    confirmationPhrase: 'DELETE',
                  }),
                });

                const result = await response.json();

                if (!result.ok) {
                  throw new Error(result.error || 'Failed to request deletion');
                }

                // Show success message
                setShowDeleteModal(false);
                setShowDeleteSuccess(true);

                // Redirect to home after 2 seconds
                setTimeout(() => {
                  router.push('/');
                }, 2000);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to request deletion');
              }
            }}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}

        {/* Success Modal */}
        {showDeleteSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-md w-full text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Account Deleted Successfully</h3>
              <p className="text-muted-foreground mb-4">
                Your account and all associated data have been permanently deleted.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to home page...
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Export Status Card Component
function ExportStatusCard({
  status,
  onDownload,
  onRequestNew,
}: {
  status: DataExport;
  onDownload: () => void;
  onRequestNew: () => void;
}) {
  const isExpired = status.expires_at && new Date(status.expires_at) < new Date();

  return (
    <div className="p-4 bg-gray-50 rounded-md border">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Status:</span>
        <StatusBadge status={status.status} />
      </div>

      {status.status === 'ready' && !isExpired && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Your export is ready. Download expires on{' '}
            {status.expires_at && new Date(status.expires_at).toLocaleString()}
          </p>
          <Button onClick={onDownload} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      )}

      {status.status === 'ready' && isExpired && (
        <div className="space-y-2">
          <p className="text-sm text-red-600">Your export has expired. Please request a new one.</p>
          <Button onClick={onRequestNew} size="sm">
            Request New Export
          </Button>
        </div>
      )}

      {status.status === 'failed' && (
        <div className="space-y-2">
          <p className="text-sm text-red-600">Export failed: {status.error}</p>
          <Button onClick={onRequestNew} size="sm">
            Try Again
          </Button>
        </div>
      )}

      {(status.status === 'queued' || status.status === 'processing') && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing your export... This may take a few minutes.
        </p>
      )}
    </div>
  );
}

// Delete Status Card Component
function DeleteStatusCard({ status }: { status: DeletionRequest }) {
  return (
    <div className="p-4 bg-red-50 rounded-md border border-red-200">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Deletion Status:</span>
        <StatusBadge status={status.status} />
      </div>

      {status.status === 'queued' && (
        <p className="text-sm text-muted-foreground">
          Your deletion request is queued. Processing will begin shortly.
        </p>
      )}

      {status.status === 'processing' && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Deleting your account and data... You will be logged out when complete.
        </p>
      )}

      {status.status === 'failed' && (
        <p className="text-sm text-red-600">Deletion failed: {status.reason}</p>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    queued: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.queued}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Re-authentication Modal
function ReauthModal({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Re-authenticate</h3>
        </div>
        <p className="text-muted-foreground mb-4">
          Please enter your password to confirm this sensitive action.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-3 py-2 border rounded-md mb-4"
            required
            autoFocus
          />

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}) {
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (confirmation !== 'DELETE') {
      return;
    }
    setLoading(true);
    await onConfirm(reason || undefined);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-lg w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h3 className="text-xl font-semibold text-red-900">Delete Account</h3>
        </div>

        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800 mb-2">
            <strong>This action cannot be undone.</strong> This will permanently delete:
          </p>
          <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
            <li>Your account and authentication credentials</li>
            <li>All therapy session conversations</li>
            <li>Session summaries and action items</li>
            <li>All personal settings and preferences</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Help us improve by telling us why you're leaving"
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={confirmation !== 'DELETE' || loading}
              className="flex-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Account'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
