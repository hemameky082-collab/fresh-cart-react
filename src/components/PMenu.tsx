import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export interface MenuItem {
  label?: string;
  command?: () => void;
  routerLink?: string;
  separator?: boolean;
  styleClass?: string;
  items?: MenuItem[];
}

interface Props {
  model: MenuItem[];
  open: boolean;
  onClose: () => void;
  className?: string;
}

// Small popup menu (replacement for the PrimeNG popup p-menu). Render it inside a `relative` wrapper.
export default function PMenu({ model, open, onClose, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const parent = ref.current?.parentElement;
      if (parent && !parent.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const renderItem = (item: MenuItem, i: number) => {
    if (item.separator) return <li key={i} role="separator" className="my-1 border-t border-gray-200" />;
    const content = (
      <span className="p-menu-item-content block px-4 py-2.5 cursor-pointer text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
        {item.label}
      </span>
    );
    const click = () => {
      item.command?.();
      onClose();
    };
    return (
      <li key={i} className={`p-menu-item ${item.styleClass ?? ''}`}>
        {item.routerLink ? (
          <Link to={item.routerLink} className="p-menu-item-link block" onClick={click}>
            {content}
          </Link>
        ) : (
          <a className="p-menu-item-link block" onClick={click}>
            {content}
          </a>
        )}
      </li>
    );
  };

  return (
    <div ref={ref} className={`absolute top-full z-50 pt-1 min-w-[200px] ${className}`}>
     <div className="bg-white border border-gray-100 rounded-xl shadow-xl py-2">
      <ul>
        {model.map((group, gi) =>
          group.items ? (
            <li key={gi} role="none">
              {group.label ? <div className="px-4 py-2 text-xs font-semibold text-gray-500">{group.label}</div> : null}
              <ul>{group.items.map(renderItem)}</ul>
            </li>
          ) : (
            renderItem(group, gi)
          ),
        )}
      </ul>
     </div>
    </div>
  );
}
