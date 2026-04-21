'use client'

const PageHeader = ({
  title,
  subtitle,
  breadcrumb,   // JSX — pass <Breadcrumb /> langsung
  actions,      // JSX — tombol aksi di kanan
  back,         // { href, label }
  divider = true,
  className = '',
}) => (
  <div className={['page-header', divider ? 'page-header-divider' : '', className].filter(Boolean).join(' ')}>
    {breadcrumb && <div className="page-header-breadcrumb">{breadcrumb}</div>}

    <div className="page-header-main">
      <div className="page-header-left">
        {back && (
          <a href={back.href} className="page-header-back">
            <i className="fa-solid fa-arrow-left" />
          </a>
        )}
        <div className="page-header-text">
          {title    && <h1 className="page-header-title">{title}</h1>}
          {subtitle && <p  className="page-header-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  </div>
)

export default PageHeader