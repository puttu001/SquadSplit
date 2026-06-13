import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { profileApi } from '../profile.api';
import { useAuthStore } from '@store/auth.store';
import { Avatar, PageSpinner } from '@components/ui';
import toast from 'react-hot-toast';

interface ProfileForm {
  name:        string;
  phoneNumber: string;
  upiId:       string;
}

// ─── Static detail row ───────────────────────────────────────────────────────
function DetailRow({ label, value, placeholder }: { label: string; value?: string | null; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-3.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-medium ${value ? 'text-gray-900' : 'text-gray-400 italic'}`}>
        {value || placeholder || '—'}
      </span>
    </div>
  );
}

// ─── Edit field ──────────────────────────────────────────────────────────────
function EditField({
  label, value, onChange, placeholder, disabled, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
          disabled
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
        }`}
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [editing, setEditing]       = useState(false);
  const [avatarPreview, setPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const { updateUser }              = useAuthStore();
  const queryClient                 = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn:  profileApi.getMe,
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<ProfileForm>();

  useEffect(() => {
    if (profile) {
      reset({
        name:        profile.name        ?? '',
        phoneNumber: profile.phoneNumber ?? '',
        upiId:       profile.upiId       ?? '',
      });
    }
  }, [profile, reset]);

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (data) => {
      updateUser({ avatarUrl: data.avatarUrl });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => toast.error('Failed to upload photo'),
  });

  const updateProfile = useMutation({
    mutationFn: profileApi.update,
    onSuccess: async (updated) => {
      updateUser(updated);
      if (avatarFile) await uploadAvatar.mutateAsync(avatarFile);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated');
      setEditing(false);
      setAvatarFile(null);
      setPreview(null);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  function handleCancel() {
    reset({
      name:        profile?.name        ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
      upiId:       profile?.upiId       ?? '',
    });
    setEditing(false);
    setAvatarFile(null);
    setPreview(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  }

  if (isLoading) return <PageSpinner />;

  const name        = watch('name');
  const phoneNumber = watch('phoneNumber');
  const upiId       = watch('upiId');

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {/* ── Avatar card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-teal-500 to-teal-600" />
        <div className="px-5 pb-5">
          <div className="-mt-8 mb-3 flex items-end justify-between">
            <div className="relative">
              <div className="ring-4 ring-white rounded-full">
                <Avatar
                  name={profile?.name ?? 'User'}
                  src={avatarPreview ?? profile?.avatarUrl}
                  size="lg"
                />
              </div>
              {editing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors"
                    title="Change photo"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {profile?.username && (
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full mb-1">
                @{profile.username}
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{profile?.name}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{profile?.email}</p>
        </div>
      </div>

      {/* ── Details card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-1">Account Details</h3>

        {editing ? (
          <form onSubmit={handleSubmit((data) => updateProfile.mutate(data))} className="flex flex-col gap-4 mt-4">
            <EditField
              label="Full Name"
              value={name}
              onChange={(v) => setValue('name', v)}
              placeholder="Your full name"
            />
            <EditField
              label="Email"
              value={profile?.email ?? ''}
              onChange={() => {}}
              disabled
              hint="Email cannot be changed"
            />
            <EditField
              label="Username"
              value={profile?.username ?? ''}
              onChange={() => {}}
              disabled
              hint="Username cannot be changed"
            />
            <EditField
              label="Phone Number"
              value={phoneNumber}
              onChange={(v) => setValue('phoneNumber', v)}
              placeholder="+91XXXXXXXXXX"
            />
            <EditField
              label="UPI ID"
              value={upiId}
              onChange={(v) => setValue('upiId', v)}
              placeholder="yourname@upi"
              hint="Used for generating settlement payment links"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-1 divide-y divide-gray-100">
            <DetailRow label="Full Name"     value={profile?.name} />
            <DetailRow label="Email"         value={profile?.email} />
            <DetailRow label="Username"      value={profile?.username ? `@${profile.username}` : null} placeholder="Not set" />
            <DetailRow label="Phone Number"  value={profile?.phoneNumber} placeholder="Not set" />
            <DetailRow label="UPI ID"        value={profile?.upiId} placeholder="Not set" />
          </div>
        )}
      </div>

    </div>
  );
}
