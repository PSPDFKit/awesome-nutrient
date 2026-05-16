/**
 * Shared inline SVG icons. Each component is a thin wrapper over a fixed
 * `viewBox`/stroke style so callers don't have to repeat the same boilerplate
 * `<svg>` opening tag everywhere.
 *
 * Icons that appear in only one file stay local to that file. Only the
 * icons reused across two or more files live here.
 */

type SVGProps = React.SVGProps<SVGSVGElement>

function StrokeIcon({
  size = 20,
  children,
  ...props
}: SVGProps & { size?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
}

export function CloseIcon(props: SVGProps & { size?: number }) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 5l10 10M15 5L5 15" />
    </StrokeIcon>
  )
}

export function TrashIcon(props: SVGProps & { size?: number }) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 6h12M7 6V4h6v2M6 6l1 11h6l1-11M9 9v6M11 9v6" />
    </StrokeIcon>
  )
}

export function UndoIcon(props: SVGProps & { size?: number }) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 9h7a4 4 0 0 1 0 8H8M5 9l3-3M5 9l3 3" />
    </StrokeIcon>
  )
}

export function CaretIcon({
  size = 10,
  className = 'caret',
  ...props
}: SVGProps & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  )
}

export function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      {[3, 6, 9].flatMap((cy) =>
        [3, 6, 9].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1" />),
      )}
    </svg>
  )
}
