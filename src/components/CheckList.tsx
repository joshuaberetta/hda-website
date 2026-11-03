import { IconCheck } from '@tabler/icons-react';
import classes from './CheckList.module.css';

/** A plain tick per line, in `--check-color` (the section's or member's accent). */
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className={classes.list}>
      {items.map((item) => (
        <li key={item}>
          <IconCheck size={16} stroke={3} className={classes.tick} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
