// app/components/ui/feedback/Alert.jsx
"use client";
import { useState } from "react";

const VARIANTS = {
  info: { icon: "fa-circle-info", class: "alert-info" },
  success: { icon: "fa-circle-check", class: "alert-success" },
  warning: { icon: "fa-triangle-exclamation", class: "alert-warning" },
  danger: { icon: "fa-circle-exclamation", class: "alert-danger" },
};

const Alert = ({
  variant = "info",
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  actions,
  className = "",
}) => {
  const [visible, setVisible] = useState(true);
  const v = VARIANTS[variant] ?? VARIANTS.info;

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div
      className={["alert", v.class, className].filter(Boolean).join(" ")}
      role='alert'
    >
      <span className='alert-icon'>
        {icon ?? <i className={`fa-solid ${v.icon}`} />}
      </span>
      <div className='alert-body'>
        {title && <div className='alert-title'>{title}</div>}
        {children && <div className='alert-desc'>{children}</div>}
        {actions && <div className='alert-actions'>{actions}</div>}
      </div>
      {dismissible && (
        <button type='button' className='alert-dismiss' onClick={dismiss}>
          <i className='fa-solid fa-xmark' />
        </button>
      )}
    </div>
  );
};

export default Alert;
