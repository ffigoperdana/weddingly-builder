import { useEffect, useState, type FormEvent } from 'react';
import {
  ExternalLink,
  LayoutTemplate,
  LogOut,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';

type Role = 'USER' | 'SUPER_ADMIN';

interface AdminTemplate {
  id: string;
  name: string;
  description: string;
  rendererId: string;
  isActive: boolean;
  siteCount: number;
}

interface AdminSite {
  id: string;
  slug: string;
  isPublished: boolean;
  templateId: string;
  brideName: string | null;
  groomName: string | null;
  weddingDate: string | null;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
  };
}

interface AdminUser {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  weddingSite: {
    id: string;
    slug: string;
    templateId: string;
    isPublished: boolean;
    brideName: string | null;
    groomName: string | null;
    updatedAt: string;
  } | null;
}

interface Overview {
  stats: {
    userCount: number;
    activeUserCount: number;
    siteCount: number;
    publishedSiteCount: number;
  };
  templates: AdminTemplate[];
}

async function requestJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Request failed');
  }

  return result as T;
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('id-ID');
}

function UserRow({
  user,
  onChanged,
}: {
  user: AdminUser;
  onChanged: () => void;
}) {
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await requestJson(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: password || undefined,
          role,
          isActive,
        }),
      });
      setPassword('');
      toast.success('User updated');
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete user ${user.email}? Their invitation will also be deleted.`)) {
      return;
    }

    try {
      await requestJson(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      toast.success('User deleted');
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-end">
        <label className="text-sm font-medium">
          Email
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 font-normal"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
          />
        </label>

        <label className="text-sm font-medium">
          New password
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 font-normal"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Leave unchanged"
          />
        </label>

        <label className="text-sm font-medium">
          Role
          <select
            className="mt-1 w-full rounded-md border bg-white px-3 py-2 font-normal"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
          >
            <option value="USER">User</option>
            <option value="SUPER_ADMIN">Super admin</option>
          </select>
        </label>

        <div className="flex gap-2">
          <Button type="button" onClick={save} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={remove}
            title="Delete user"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Active account
        </label>
        <span>Created: {formatDate(user.createdAt)}</span>
        <span>
          Invitation:{' '}
          {user.weddingSite ? `${user.weddingSite.brideName || 'Bride'} & ${user.weddingSite.groomName || 'Groom'}` : 'Not created'}
        </span>
      </div>
    </div>
  );
}

function SiteRow({
  site,
  templates,
  onChanged,
}: {
  site: AdminSite;
  templates: AdminTemplate[];
  onChanged: () => void;
}) {
  const [templateId, setTemplateId] = useState(site.templateId);
  const [isPublished, setIsPublished] = useState(site.isPublished);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await requestJson(`/api/admin/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, isPublished }),
      });
      toast.success('Invitation updated');
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete invitation ${site.slug}? This cannot be undone.`)) {
      return;
    }

    try {
      await requestJson(`/api/admin/sites/${site.id}`, { method: 'DELETE' });
      toast.success('Invitation deleted');
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="font-semibold">
            {site.brideName || 'Bride'} &amp; {site.groomName || 'Groom'}
          </p>
          <p className="text-sm text-muted-foreground">
            {site.user.email} · invitation.fgdev.tech/{site.slug}
          </p>
          <p className="text-xs text-muted-foreground">
            Updated: {formatDate(site.updatedAt)} · Wedding date: {formatDate(site.weddingDate)}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium">
            Template
            <select
              className="mt-1 block rounded-md border bg-white px-3 py-2 font-normal"
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
            >
              {templates
                .filter(
                  (template) =>
                    template.isActive || template.id === site.templateId,
                )
                .map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}{template.isActive ? '' : ' (archived)'}
                </option>
                ))}
            </select>
          </label>
          <label className="inline-flex items-center gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
            />
            Published
          </label>
          <Button type="button" onClick={save} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          {site.isPublished && (
            <Button asChild variant="outline">
              <a href={`/${site.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Preview
              </a>
            </Button>
          )}
          <Button type="button" variant="outline" onClick={remove}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sites' | 'templates'>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sites, setSites] = useState<AdminSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('USER');

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewResult, usersResult, sitesResult] = await Promise.all([
        requestJson<{ stats: Overview['stats']; templates: AdminTemplate[] }>('/api/admin/overview'),
        requestJson<{ users: AdminUser[] }>('/api/admin/users'),
        requestJson<{ sites: AdminSite[] }>('/api/admin/sites'),
      ]);
      setOverview(overviewResult);
      setUsers(usersResult.users);
      setSites(sitesResult.sites);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load admin data';
      toast.error(message);
      if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('super admin')) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createUser = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await requestJson('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      setNewEmail('');
      setNewPassword('');
      setNewRole('USER');
      toast.success('User created');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const deleteTemplate = async (template: AdminTemplate) => {
    if (!window.confirm(`Remove ${template.name} from the template catalog?`)) {
      return;
    }

    try {
      const result = await requestJson<{ archived: boolean }>(
        `/api/admin/templates/${template.id}`,
        { method: 'DELETE' },
      );
      toast.success(
        result.archived
          ? 'Template archived because an invitation still uses it.'
          : 'Template removed from the catalog.',
      );
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const stats = overview?.stats;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-900 p-2 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Super Admin</h1>
              <p className="text-sm text-slate-500">Manage Weddingly users and invitations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap gap-2 rounded-xl border bg-white p-2">
          {[
            ['overview', 'Overview', ShieldCheck],
            ['users', 'Users', Users],
            ['sites', 'Invitations', ExternalLink],
            ['templates', 'Templates', LayoutTemplate],
          ].map(([value, label, Icon]) => (
            <button
              key={value as string}
              type="button"
              onClick={() => setActiveTab(value as typeof activeTab)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === value
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label as string}
            </button>
          ))}
        </nav>

        {loading && !overview ? (
          <div className="rounded-xl border bg-white p-8 text-center text-slate-500">Loading admin data…</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <section className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ['Users', stats?.userCount ?? 0],
                    ['Active users', stats?.activeUserCount ?? 0],
                    ['Invitations', stats?.siteCount ?? 0],
                    ['Published', stats?.publishedSiteCount ?? 0],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-xl border bg-white p-5 shadow-sm">
                      <p className="text-sm text-slate-500">{label as string}</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">{value as number}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold">Template usage</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {overview?.templates.map((template) => (
                      <div key={template.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-medium">{template.name}</p>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">{template.siteCount} sites</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'users' && (
              <section className="space-y-6">
                <form onSubmit={createUser} className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold">Create user account</h2>
                  <p className="mt-1 text-sm text-slate-500">Public registration is disabled. Create accounts here.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
                    <label className="text-sm font-medium">
                      Email
                      <input className="mt-1 w-full rounded-md border px-3 py-2 font-normal" type="email" required value={newEmail} onChange={(event) => setNewEmail(event.target.value)} />
                    </label>
                    <label className="text-sm font-medium">
                      Password
                      <input className="mt-1 w-full rounded-md border px-3 py-2 font-normal" type="password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                    </label>
                    <label className="text-sm font-medium">
                      Role
                      <select className="mt-1 w-full rounded-md border bg-white px-3 py-2 font-normal" value={newRole} onChange={(event) => setNewRole(event.target.value as Role)}>
                        <option value="USER">User</option>
                        <option value="SUPER_ADMIN">Super admin</option>
                      </select>
                    </label>
                    <Button type="submit">Create</Button>
                  </div>
                </form>
                <div className="space-y-3">
                  {users.map((user) => (
                    <UserRow key={user.id} user={user} onChanged={loadData} />
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'sites' && (
              <section className="space-y-3">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold">All wedding invitations</h2>
                  <p className="mt-1 text-sm text-slate-500">Assign an existing renderer, publish/unpublish, preview, or remove a site.</p>
                </div>
                {sites.length === 0 ? (
                  <div className="rounded-xl border bg-white p-8 text-center text-slate-500">No invitations have been created.</div>
                ) : (
                  sites.map((site) => (
                    <SiteRow key={site.id} site={site} templates={overview?.templates ?? []} onChanged={loadData} />
                  ))
                )}
              </section>
            )}

            {activeTab === 'templates' && (
              <section className="space-y-4">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold">Template catalog</h2>
                  <p className="mt-1 text-sm text-slate-500">Read the installed renderers and remove them from the active catalog when needed.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {overview?.templates.map((template) => (
                    <div key={template.id} className="rounded-xl border bg-white p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">{template.name}</p>
                          <p className="mt-1 text-sm text-slate-500">ID: {template.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              template.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {template.isActive ? 'Active' : 'Archived'}
                          </span>
                          <LayoutTemplate className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-slate-600">{template.description}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Used by {template.siteCount} invitation(s)</p>
                        {template.isActive && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => deleteTemplate(template)}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-dashed bg-white p-6 text-sm text-slate-500">
                  New template create/update remains a code change: a renderer component must exist before a template can be activated. If a template is still used, Remove archives it instead of breaking existing invitations.
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
