interface ButtonConfig {
  label: string
  className: string
  onClick: () => void
}

interface ActionButtonsProps {
  buttons: ButtonConfig[]
}

export default function ActionButtons({ buttons }: ActionButtonsProps) {
  return (
    <div className="action-buttons">
      {buttons.map((btn, index) => (
        <button
          key={index}
          className={btn.className}
          onClick={btn.onClick}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
