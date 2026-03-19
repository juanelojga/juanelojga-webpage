export interface LocaleSwitcherLabels {
  label: string;
}

interface Props {
  currentLang: string;
  labels: LocaleSwitcherLabels;
}

export default function LocaleSwitcher({ currentLang, labels }: Props) {
  const handleSwitch = () => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);

    let locale = 'en';
    if (segments.length > 0 && (segments[0] === 'en' || segments[0] === 'es')) {
      locale = segments.shift()!;
    }

    const newLocale = locale === 'en' ? 'es' : 'en';
    const rest = segments.join('/');
    const hash = window.location.hash;
    const newPath = rest ? `/${newLocale}/${rest}` : `/${newLocale}/`;

    window.location.href = newPath + hash;
  };

  return (
    <button
      type="button"
      aria-label={labels.label}
      onClick={handleSwitch}
      className="flex items-center gap-1 rounded-lg px-3 py-2.5 font-mono text-meta transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-primary"
    >
      <span aria-hidden="true" className="text-text-secondary/60 select-none">
        //
      </span>
      <span className={currentLang === 'en' ? 'text-text-primary' : 'text-text-secondary'}>EN</span>
      <span aria-hidden="true" className="text-text-secondary/60 select-none">
        |
      </span>
      <span className={currentLang === 'es' ? 'text-text-primary' : 'text-text-secondary'}>ES</span>
    </button>
  );
}
