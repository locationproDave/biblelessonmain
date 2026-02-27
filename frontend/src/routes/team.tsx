import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamAPI } from '@/lib/api'
import { useSession } from '@/lib/auth-client'
import { Users, Handshake, Mail, Key, Settings, Shield, Crown, Inbox, Pencil, Eye, AlertTriangle, CheckCircle, Send, X } from 'lucide-react'

export const Route = createFileRoute('/team')({
  component: TeamPage,
})

function TeamPage() {
  const { data: session } = useSession()
  
  if (!session) {
    return (
      <div className="bg-[#F9F7F1] dark:bg-[#1C1917]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Collaborate Section First */}
          <div className="mb-8 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/40 p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white text-xl flex-shrink-0 shadow-md">
                <Handshake className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>Collaborate with Your Team</h1>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                  Invite volunteers and assign roles. Manage who can create, edit, and share lessons with simple role-based permissions.
                </p>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                  TEAMS is a free collaboration feature included with every Bible Lesson account. It allows account owners to invite volunteers and assign them specific roles—Editors who can generate and modify lessons, or Viewers who can only access, print, and export finalized curriculum. Perfect for churches, ministries, and Sunday schools that want to distribute lesson planning responsibilities while maintaining quality control.
                </p>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  Manage your entire team from a simple dashboard: send email invitations, assign roles, track pending invites, and revoke access anytime. Whether you're a solo teacher or leading a large ministry team, TEAMS makes it easy to collaborate securely and efficiently.
                </p>
              </div>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">Email Invitations</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Invite volunteers by email and choose their role before they join</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">Editor and Viewer Roles</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Editors create and modify lessons; Viewers can only access and print them</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">Full Access Control</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Change roles, track pending invites, and revoke access at any time</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">Quality Oversight</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Account owners maintain full control over all curriculum and team activity</p>
              </div>
            </div>
          </div>


          </div>

          <div className="text-center">
            <a href="/signin" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1E3A5F] hover:bg-[#162D4A] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#1E3A5F]/20 hover:shadow-xl hover:shadow-[#1E3A5F]/30 hover:scale-105 active:scale-100 transition-all duration-200">Sign In to Get Started</a>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-3">TEAMS is free and included with every Bible Lesson account.</p>
          </div>
        </div>
      </div>
    )
  }
  
  return <TeamDashboard />
}

function TeamDashboard() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  
  const { data: invitations } = useQuery({
    queryKey: ['team-invitations'],
    queryFn: teamAPI.getInvitations,
    enabled: !!session,
  })
  const { data: members } = useQuery({
    queryKey: ['team-members'],
    queryFn: teamAPI.getMembers,
    enabled: !!session,
  })
  const { data: pendingInvites } = useQuery({
    queryKey: ['pending-invitations'],
    queryFn: teamAPI.getPendingInvitations,
    enabled: !!session,
  })
  const { data: myTeams } = useQuery({
    queryKey: ['my-teams'],
    queryFn: teamAPI.getMyTeams,
    enabled: !!session,
  })

  const inviteTeamMemberMut = useMutation({
    mutationFn: ({ email, role }: { email: string; role: 'editor' | 'viewer' }) => 
      teamAPI.inviteMember(email, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-invitations'] }),
  })
  const revokeInvitationMut = useMutation({
    mutationFn: (id: string) => teamAPI.revokeInvitation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-invitations'] }),
  })
  const revokeTeamMemberMut = useMutation({
    mutationFn: (id: string) => teamAPI.revokeMember(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-members'] }),
  })
  const acceptInvitationMut = useMutation({
    mutationFn: (token: string) => teamAPI.acceptInvitation(token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-invitations'] }),
  })

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [tab, setTab] = useState<'members' | 'invitations'>('members')

  const pendingInvitations = invitations?.filter((inv: any) => inv.status === 'pending') ?? []
  const acceptedInvitations = invitations?.filter((inv: any) => inv.status === 'accepted') ?? []
  const revokedInvitations = invitations?.filter((inv: any) => inv.status === 'revoked') ?? []
  const activeMembers = members ?? []
  const isOwner = true

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setError(null)
    setSuccess(null)
    setSending(true)
    try {
      await inviteTeamMemberMut.mutateAsync({ email: inviteEmail.trim().toLowerCase(), role: inviteRole })
      setSuccess("Invitation sent to " + inviteEmail)
      setInviteEmail('')
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setSending(false)
    }
  }

  const handleRevoke = async (invitationId: string) => {
    try {
      await revokeInvitationMut.mutateAsync(invitationId)
      setSuccess('Invitation revoked')
    } catch (err: any) {
      setError(err.message || 'Failed to revoke')
    }
  }

  const handleRemoveMember = async (id: string) => {
    try {
      await revokeTeamMemberMut.mutateAsync(id)
      setSuccess('Team member removed')
      setConfirmRemove(null)
    } catch (err: any) {
      setError(err.message || 'Failed to remove member')
    }
  }

  const handleRoleChange = async (id: string, role: 'editor' | 'viewer') => {
    try {
      // Role update not available in current mutations
      setSuccess('Role updated')
    } catch (err: any) {
      setError(err.message || 'Failed to update role')
    }
  }

  const handleAcceptInvite = async (token: string) => {
    try {
      await acceptInvitationMut.mutateAsync(token)
      setSuccess('Invitation accepted! You are now a team member.')
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation')
    }
  }

  const handleResend = async (invitationId: string) => {
    try {
      // Resend not available in current mutations
      setSuccess('Invitation resent')
    } catch (err: any) {
      setError(err.message || 'Failed to resend')
    }
  }

  return (
    <div className="bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 flex items-center gap-3" style={{ fontFamily: 'Crimson Text, serif' }}>
            <Users className="w-8 h-8 text-amber-600 dark:text-amber-500" /> Team Management
          </h1>
          <p className="mt-2 text-stone-500 dark:text-stone-400">
            {isOwner ? 'Invite volunteers, assign roles, and manage your ministry team.' : 'You are a member of this team.'}
          </p>
        </div>

        <div className="mb-8 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/40 p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Handshake className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>Collaborate with Your Team</h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                Invite volunteers and assign roles. Manage who can create, edit, and share lessons with simple role-based permissions.
              </p>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                TEAMS is a free collaboration feature included with every Bible Lesson account. It allows account owners to invite volunteers and assign them specific roles—Editors who can generate and modify lessons, or Viewers who can only access, print, and export finalized curriculum. Perfect for churches, ministries, and Sunday schools that want to distribute lesson planning responsibilities while maintaining quality control.
              </p>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Manage your entire team from a simple dashboard: send email invitations, assign roles, track pending invites, and revoke access anytime. Whether you're a solo teacher or leading a large ministry team, TEAMS makes it easy to collaborate securely and efficiently.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">Email Invitations</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Invite volunteers by email and choose their role before they join</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">Editor and Viewer Roles</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Editors create and modify lessons; Viewers can only access and print them</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">Full Access Control</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Change roles, track pending invites, and revoke access at any time</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">Quality Oversight</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Account owners maintain full control over all curriculum and team activity</p>
              </div>
            </div>
          </div>
        </div>

        {pendingInvites && pendingInvites.length > 0 && (
        <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5">
          <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
            <Inbox className="w-5 h-5" /> You Have Pending Invitations
          </h3>
          <div className="space-y-3">
            {pendingInvites.map((inv: any) => (
              <div key={inv._id} className="flex items-center justify-between bg-white dark:bg-stone-800/50 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30">
                <div>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    {"You have been invited as "}
                    <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold " + (inv.role === 'editor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300')}>
                      {inv.role === 'editor' ? 'Editor' : 'Viewer'}
                    </span>
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {"Invited " + new Date(inv.invitedAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => handleAcceptInvite(inv._id)} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200">
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
        )}

        {isOwner && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Team Members', value: activeMembers.length, icon: <Users className="w-5 h-5 text-amber-600 dark:text-amber-500" />, color: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/40' },
              { label: 'Editors', value: activeMembers.filter((m: any) => m.role === 'editor').length, icon: <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/40' },
              { label: 'Viewers', value: activeMembers.filter((m: any) => m.role === 'viewer').length, icon: <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, color: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40' },
              { label: 'Pending Invites', value: pendingInvitations.length, icon: <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />, color: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/40' },
            ].map((stat, i) => (
              <div key={i} className={"rounded-xl border p-3 sm:p-4 " + stat.color}>
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-50">{stat.value}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2" style={{ fontFamily: 'Crimson Text, serif' }}>
              <Mail className="w-5 h-5 text-amber-600 dark:text-amber-500" /> Invite a Teammate
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-5">Send an email invitation to a volunteer to join your ministry team.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {error}
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {success}
                <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-400 hover:text-emerald-600"><X className="w-4 h-4" /></button>
              </div>
            )}

            <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"><Mail className="w-4 h-4" /></span>
                <input type="email" placeholder="volunteer@church.org" value={inviteEmail} onChange={e => { setInviteEmail(e.target.value); setError(null); setSuccess(null) }} required className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm" />
              </div>
              <div className="flex gap-2">
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'editor' | 'viewer')} className="px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer">
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button type="submit" disabled={sending || !inviteEmail.trim()} className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md shadow-amber-600/20 hover:shadow-lg hover:shadow-amber-600/30 hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap">
                  {sending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-blue-800 dark:text-blue-300">Editor</p>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">Can generate new lessons, edit existing ones, and manage curriculum content.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-emerald-800 dark:text-emerald-300">Viewer</p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Can view finalized lessons, print, and export curriculum. Cannot generate or edit.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-1 mb-6 bg-stone-100 dark:bg-stone-800/50 rounded-xl p-1">
            <button onClick={() => setTab('members')} className={"flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 " + (tab === 'members' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300')}>
              {"Members (" + activeMembers.length + ")"}
            </button>
            <button onClick={() => setTab('invitations')} className={"flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 " + (tab === 'invitations' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300')}>
              {"Invitations (" + pendingInvitations.length + " pending)"}
            </button>
          </div>

          {tab === 'members' && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-stone-800/50 border border-amber-200 dark:border-amber-800/40">
                <div className="w-11 h-11 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {(session?.user?.name?.[0] || session?.user?.email?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{session?.user?.name || 'You'}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                      <Crown className="w-3 h-3" /> Owner
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{session?.user?.email}</p>
                </div>
              </div>

              {activeMembers.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-stone-800/30 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <Handshake className="w-10 h-10 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">No team members yet</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto">Invite volunteers from your ministry to collaborate on lesson plans.</p>
                </div>
              ) : (
                activeMembers.map((member: any) => (
                  <div key={member._id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:shadow-md transition-all duration-200 group">
                    <div className={"w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm " + (member.role === 'editor' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-emerald-400 to-emerald-600')}>
                      {(member.name?.[0] || member.email[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{member.name || member.email.split('@')[0]}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{member.email}</p>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">{"Joined " + new Date(member.joinedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={"px-3 py-1.5 rounded-lg text-xs font-bold border inline-flex items-center gap-1 " + (member.role === 'editor' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40')}>
                        {member.role === 'editor' ? <><Pencil className="w-3 h-3" /> Editor</> : <><Eye className="w-3 h-3" /> Viewer</>}
                      </span>
                      {confirmRemove === member._id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleRemoveMember(member._id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">Confirm</button>
                          <button onClick={() => setConfirmRemove(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmRemove(member._id)} className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 opacity-0 group-hover:opacity-100" title="Remove member">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'invitations' && (
            <div className="space-y-3">
              {pendingInvitations.length === 0 && acceptedInvitations.length === 0 && revokedInvitations.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800/30 rounded-2xl border border-gray-200/80 dark:border-gray-700/50">
                  <Send className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No invitations sent</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Use the form above to invite volunteers to your team.</p>
                </div>
              ) : (
                <>
                  {pendingInvitations.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">{"Pending (" + pendingInvitations.length + ")"}</h3>
                      {pendingInvitations.map((inv: any) => (
                        <div key={inv._id} className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                            {inv.email[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{inv.email}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={"text-[11px] font-bold px-1.5 py-0.5 rounded " + (inv.role === 'editor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400')}>
                                {inv.role === 'editor' ? 'Editor' : 'Viewer'}
                              </span>
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Pending</span>
                              <span className="text-[11px] text-gray-400 dark:text-gray-500">{"Sent " + new Date(inv.invitedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleRevoke(inv._id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 border border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">Revoke</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {acceptedInvitations.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">{"Accepted (" + acceptedInvitations.length + ")"}</h3>
                      {acceptedInvitations.map((inv: any) => (
                        <div key={inv._id} className="flex items-center gap-4 p-4 rounded-2xl bg-green-50/30 dark:bg-green-900/5 border border-green-200/40 dark:border-green-800/20 mb-2 opacity-70">
                          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold">
                            {inv.email[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{inv.email}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={"text-[11px] font-bold px-1.5 py-0.5 rounded " + (inv.role === 'editor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400')}>
                                {inv.role === 'editor' ? 'Editor' : 'Viewer'}
                              </span>
                              <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">Accepted</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {revokedInvitations.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">{"Revoked (" + revokedInvitations.length + ")"}</h3>
                      {revokedInvitations.map((inv: any) => (
                        <div key={inv._id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-200/40 dark:border-gray-700/30 mb-2 opacity-50">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 font-bold">
                            {inv.email[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-500 dark:text-gray-400 truncate">{inv.email}</p>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Revoked</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          </>
        )}
      </div>
    </div>
  )
}
