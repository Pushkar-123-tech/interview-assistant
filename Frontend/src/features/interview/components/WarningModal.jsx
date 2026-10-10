const WarningModal = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Your interview will end and your completed answers will be submitted for analysis.",
  cancelLabel = "Continue interview",
  confirmLabel = "End interview",
  eyebrow = "END INTERVIEW",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-8 shadow-xl">

        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">
          {eyebrow}
        </p>

        <h2 className="mt-4 text-2xl font-medium text-zinc-900">
          {title}
        </h2>

        <p className="mt-3 leading-6 text-zinc-500">
          {message}
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};

export default WarningModal;