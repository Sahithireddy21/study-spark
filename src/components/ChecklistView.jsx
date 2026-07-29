import { Check } from 'lucide-react';

export function ChecklistView({ tasks, checked, setChecked }) {
  return (
    <div className="checklist">
      {tasks.map((task) => (
        <button
          key={task.id}
          className={checked[task.id] ? 'done' : ''}
          onClick={() => setChecked((current) => ({ ...current, [task.id]: !current[task.id] }))}
        >
          <span>{checked[task.id] && <Check size={15} />}</span>
          {task.text}
        </button>
      ))}
    </div>
  );
}
