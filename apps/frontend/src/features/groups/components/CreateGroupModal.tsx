import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onSubmit:  (data: { name: string; description: string }) => void;
  isPending: boolean;
}

export function CreateGroupModal({ open, onClose, onSubmit, isPending }: Props) {
  const { register, handleSubmit, reset, formState: { errors }, setFocus } = useForm<{ name: string; description: string }>();
  const prevOpen = useRef(false);

  useEffect(() => {
    if (open && !prevOpen.current) {
      reset();
      setTimeout(() => setFocus('name'), 50);
    }
    prevOpen.current = open;
  }, [open, reset, setFocus]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">New Group</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => onSubmit(d))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Group name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. Goa Trip 2025 🏖️"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              {...register('description')}
              placeholder="What's this group for?"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating…
              </>
            ) : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
}
