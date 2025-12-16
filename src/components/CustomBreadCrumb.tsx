import type { BreadcrumbHandle } from '@interface/commons';
import { Breadcrumb, type BreadcrumbProps } from 'antd';
import React, { useMemo } from 'react';
import { Link, useMatches, type UIMatch } from 'react-router-dom';

function hasBreadcrumb(handle: unknown): handle is BreadcrumbHandle {
  return (
    !!handle && typeof handle === 'object' && 'breadcrumb' in (handle as any)
  );
}
const CustomBreadCrumb = () => {
  const matches = useMatches() as UIMatch<
    Record<string, string>,
    BreadcrumbHandle
  >[];
  console.log('matches', matches);

  const crumbMatches = useMemo(
    () => matches.filter((m) => hasBreadcrumb(m.handle)),
    [matches],
  );

  const items: BreadcrumbProps['items'] = useMemo(() => {
    const lastIndex = crumbMatches.length - 1;

    return crumbMatches.map((m, idx) => {
      const isLast = idx === lastIndex;
      const bc = m.handle!.breadcrumb;

      const title = typeof bc === 'function' ? bc(m) : bc;

      return {
        title: isLast ? (
          <span>{title}</span>
        ) : (
          <Link to={m.pathname || ''}>{title}</Link>
        ),
      };
    });
  }, [crumbMatches]);
  return <Breadcrumb style={{ margin: '16px 0' }} items={items} />;
};

export default CustomBreadCrumb;
