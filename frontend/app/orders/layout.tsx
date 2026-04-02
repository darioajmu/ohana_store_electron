import type { ReactNode } from 'react';

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      <div>{children}</div>
    </section>
  );
}
