import s from './Toast.module.css'

interface Props {
  message: string | null
  actionLabel?: string
  onAction?: () => void
}

export default function Toast({ message, actionLabel, onAction }: Props) {
  if (!message) return null
  return (
    <div className={s.toast} key={message}>
      <span className={s.note}>{message}</span>
      {actionLabel && (
        <button type="button" className={s.action} onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  )
}
