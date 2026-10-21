export function RememberMe({ register }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-muted dark:text-white/55">
      <input
        type="checkbox"
        className="mt-0.5 size-4.5 rounded border-forest/20 accent-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf focus-visible:ring-offset-2"
        {...register('remember')}
      />
      <span>
        <strong className="font-bold text-forest dark:text-white">Remember me</strong>
        <br />
        Keep me signed in.
      </span>
    </label>
  );
}
