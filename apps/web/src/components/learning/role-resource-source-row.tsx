type Props = {
  title: string;
  url: string;
  context?: string;
};

export function RoleResourceSourceRow({ title, url, context }: Props) {
  return (
    <li className="pp-pmm-source-row">
      <strong className="pp-pmm-source-title">{title}</strong>
      <a href={url} target="_blank" rel="noopener noreferrer" className="pp-pmm-source-url">
        {url}
      </a>
      {context ? <span className="pp-pmm-source-context">{context}</span> : null}
    </li>
  );
}
